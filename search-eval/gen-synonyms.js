'use strict';
// One-off: asks an LLM for the search terms an ED physician might type for
// each code (abbreviations, synonyms, lay terms, common misspellings) and
// writes search-eval/synonyms.json for review. It is never shown the golden
// set, so the benchmark isn't tuned to its own test.
//
// Usage: node search-eval/gen-synonyms.js [--model gpt-4.1] [--ed]
//   --ed  only (re)generate terms for the ED short list in diagnose.js, keeping
//         the rest of synonyms.json as it is

var fs = require('fs');
var path = require('path');
var lib = require('./lib');

var mi = process.argv.indexOf('--model');
var model = mi === -1 ? 'gpt-4.1' : process.argv[mi + 1];
var BATCH = 15;

var SYSTEM =
  'You help build a search index of OHIP (Ontario) fee and diagnostic codes for emergency physicians.\n' +
  'For each code you are given, list the words and phrases a busy ED physician might type into a search box ' +
  'when looking for that code. Put the terms ED physicians actually type first: standard abbreviations and chart ' +
  'shorthand (e.g. lac, I&D, fx, LP, afib, UTI, SOB, DCCV, PTA, FB), then clinical synonyms and eponyms, then ' +
  'plain-language terms a patient would use, then one or two common misspellings.\n' +
  'Rules: only terms that clearly mean THIS code, not related procedures or conditions that have their own code; ' +
  'no code numbers; no filler variants that just add words like treatment, management, procedure, care, symptoms, ' +
  'diagnosis or ED; at most 12 terms per code.\n' +
  'Respond with JSON only: {"<code>": "term, term, term", ...}';

async function ask(items, out, usage, maxTokens) {
  var r = await lib.chat(model, SYSTEM, items.map(function(x) { return x.code + ': ' + x.text; }).join('\n'), maxTokens);
  var parsed = JSON.parse(r.choices[0].message.content);
  items.forEach(function(x) { if (parsed[x.code]) out[x.code] = String(parsed[x.code]); });
  usage.promptTokens += r.usage.prompt_tokens;
  usage.completionTokens += r.usage.completion_tokens;
}

async function run(side, items) {
  var out = {}, usage = { promptTokens: 0, cachedTokens: 0, completionTokens: 0 };
  for (var i = 0; i < items.length; i += BATCH) {
    await ask(items.slice(i, i + BATCH), out, usage, 2500);
    process.stdout.write('\r' + side + ' ' + Math.min(i + BATCH, items.length) + '/' + items.length);
  }
  // Retry any codes the model skipped, in small batches.
  var missing = items.filter(function(x) { return !out[x.code]; });
  for (var j = 0; j < missing.length; j += 5) await ask(missing.slice(j, j + 5), out, usage, 1200);
  console.log('');
  return { terms: out, cost: lib.costUsd(model, usage) };
}

// The ED list's generic entries are what ED physicians bill for any site, so
// their terms need to name sites ("ankle fx"), not just restate the label.
var ED_NOTE =
  '\nThese codes are the short list Ontario ED physicians actually bill. Generically named entries ' +
  '(e.g. "Fracture", "Dislocation", "Muscle Sprain/Strain", "Laceration - upper limb", "Injury or trauma - other") ' +
  'are the catch-all codes used for injuries at any site the list does not name separately, so list the common ' +
  'site-specific terms physicians would type for them (e.g. for a fracture code: ankle fx, wrist fracture, boxer\'s fracture).';

async function main() {
  lib.loadEnv();
  var corpus = lib.loadCorpus();
  var file = path.join(__dirname, 'synonyms.json');

  if (process.argv.indexOf('--ed') !== -1) {
    var existing = JSON.parse(fs.readFileSync(file, 'utf8'));
    SYSTEM += ED_NOTE;
    var e = await run('ed', corpus.edDiag.map(function(x) {
      return { code: x.code, text: x.description + ' [' + x.category + ']' };
    }));
    existing.edDiag = e.terms;
    existing.edModel = model;
    fs.writeFileSync(file, JSON.stringify(existing, null, 1));
    console.log('added ' + Object.keys(e.terms).length + '/' + corpus.edDiag.length + ' ED-list codes to ' +
      path.relative(lib.ROOT, file) + ', cost $' + e.cost.toFixed(4));
    return;
  }

  var billingItems = corpus.billing.map(function(d) {
    return { code: d.code, text: d.description + ' [' + d.category + ']' + (d.notes ? ' -- ' + d.notes : '') };
  });
  var byCode = {};
  corpus.diag.forEach(function(d) { (byCode[d.code] = byCode[d.code] || []).push(d.description); });
  var diagItems = Object.keys(byCode).map(function(code) {
    return { code: code, text: byCode[code].join(' | ').slice(0, 2000) };
  });

  var b = await run('billing', billingItems);
  var d = await run('diag', diagItems);
  fs.writeFileSync(file, JSON.stringify({ model: model, billing: b.terms, diag: d.terms }, null, 1));
  console.log('wrote ' + path.relative(lib.ROOT, file) + ' (' + Object.keys(b.terms).length + ' billing, ' +
    Object.keys(d.terms).length + ' diagnostic codes), cost $' + (b.cost + d.cost).toFixed(4));
}

main().catch(function(e) { console.error(e.message); process.exit(1); });
