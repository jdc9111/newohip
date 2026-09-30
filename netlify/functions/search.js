'use strict';
var https = require('https');
var billing = require('./billing');
var diagnose = require('./diagnose');

function callOpenAI(apiKey, systemPrompt, query, maxTokens) {
  return new Promise(function(resolve, reject) {
    var payload = JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query }
      ],
      max_tokens: maxTokens,
      temperature: 0.1,
      response_format: { type: 'json_object' }
    });
    var options = {
      hostname: 'api.openai.com',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };
    var req = https.request(options, function(res) {
      var data = '';
      res.on('data', function(c) { data += c; });
      res.on('end', function() { resolve({ status: res.statusCode, body: data }); });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// Runs one lookup (billing or diagnostic) end-to-end and normalizes the
// outcome to { results: [...] } or { error: '...' } -- never throws, so
// Promise.all in the handler can't be short-circuited by one side failing.
// The model returns only codes; hydrate() fills in description/category/fee
// from our own lists so the model can't misquote them.
function runLookup(apiKey, systemPrompt, hydrate, query, maxTokens) {
  return callOpenAI(apiKey, systemPrompt, query, maxTokens)
    .then(function(r) {
      if (r.status !== 200) {
        console.error('OpenAI error:', r.status, r.body);
        return { error: 'AI service error' };
      }
      var content = JSON.parse(r.body).choices[0].message.content;
      var parsed = JSON.parse(content);
      return { results: hydrate(parsed.results) };
    })
    .catch(function(err) {
      console.error('Lookup error:', err);
      return { error: 'Internal error: ' + err.message };
    });
}

// Puts codes the user typed ahead of the model's picks (without duplicates);
// a typed code still counts as a result if the model call failed.
function withExact(exact, outcome) {
  if (!exact.length) return outcome;
  var seen = {};
  var results = exact.concat(outcome.results || []).filter(function(r) {
    return !seen[r.code] && (seen[r.code] = true);
  });
  return { results: results };
}

exports.handler = function(event) {
  if (event.httpMethod !== 'POST') {
    return Promise.resolve({ statusCode: 405, body: 'Method Not Allowed' });
  }
  var query;
  try { query = JSON.parse(event.body).query; }
  catch (e) { return Promise.resolve({ statusCode: 400, body: JSON.stringify({ error: 'Invalid body' }) }); }
  if (!query || query.trim().length < 2) {
    return Promise.resolve({ statusCode: 400, body: JSON.stringify({ error: 'Query too short' }) });
  }
  var trimmed = query.trim();

  // Typed codes ("H112", "e412 h113", "427") are looked up directly. The model
  // is told to skip premium and assessment codes unless asked, so it returned
  // nothing for them, and guessed a diagnosis from the digits ("h112" -> 112).
  // If every word is a known code, answer without calling the model at all.
  var words = trimmed.split(/[\s,]+/).filter(Boolean);
  var exactBilling = billing.hydrate(words.filter(function(w) { return /^[a-z]\d{3}[a-z]?$/i.test(w); }));
  var exactDiag = diagnose.hydrate(words.filter(function(w) { return /^\d{3}$/.test(w); }));
  if (exactBilling.length + exactDiag.length === words.length) {
    return Promise.resolve({
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ billing: exactBilling, diagnostic: exactDiag, errors: { billing: null, diagnostic: null } })
    });
  }

  var apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Promise.resolve({ statusCode: 500, body: JSON.stringify({ error: 'API key not configured' }) });
  }

  return Promise.all([
    runLookup(apiKey, billing.SYSTEM_PROMPT, billing.hydrate, trimmed, 60),
    runLookup(apiKey, diagnose.SYSTEM_PROMPT, diagnose.hydrate, trimmed, 60)
  ]).then(function(outcomes) {
    var billingOutcome = withExact(exactBilling, outcomes[0]);
    var diagnosticOutcome = withExact(exactDiag, outcomes[1]);

    // If both sides failed, surface it as a real error instead of a
    // confusing "no results" empty state.
    if (billingOutcome.error && diagnosticOutcome.error) {
      return { statusCode: 502, body: JSON.stringify({ error: 'AI service error' }) };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        billing: billingOutcome.results || [],
        diagnostic: diagnosticOutcome.results || [],
        errors: {
          billing: billingOutcome.error || null,
          diagnostic: diagnosticOutcome.error || null
        }
      })
    };
  });
};
