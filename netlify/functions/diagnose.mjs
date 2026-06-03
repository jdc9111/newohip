import { diagCodes } from '../../diagCodes.js';

// Build the code list string once (runs at cold-start, cached for warm invocations)
const CODE_LIST = diagCodes
  .map(({ code, description, category }) => `${code} (${category}): ${description}`)
  .join('\n');

const SYSTEM_PROMPT = `You are an OHIP diagnostic code lookup tool for Emergency Department physicians in Ontario, Canada.

The user will type a diagnosis name, medical abbreviation, or clinical term. Your job is to find the best matching OHIP diagnostic codes from the list below.

You must recognise common medical abbreviations and synonyms, for example:
- afib / AF → atrial fibrillation → arrhythmia
- SOB / dyspnea → shortness of breath
- PE → pulmonary embolism
- STEMI / NSTEMI → myocardial infarction
- UTI → urinary tract infection
- shingles → herpes zoster
- clot / DVT → deep vein thrombosis
- stroke / CVA → cerebrovascular accident
- belly pain / abd pain → abdominal pain
- blocked bowel → obstruction
- BPPV / vertigo → dizziness
- OD / overdose → poisoning / adverse drug effect
- FB → foreign body
- LOC / syncope → loss of consciousness

Here is the complete list of available diagnostic codes:
${CODE_LIST}

Rules:
- Return ONLY codes from the list above — never invent codes
- Return the top 4 most relevant matches, ranked best match first
- Respond ONLY with a valid JSON object in this exact format:
  {"results": [{"code": "451", "description": "DVT - Deep Vein Thrombosis", "category": "cvs"}, ...]}
- No explanation, no markdown, no extra text — just the JSON object`;

export const handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let query;
  try {
    ({ query } = JSON.parse(event.body));
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body' }) };
  }

  if (!query || query.trim().length < 2) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Query too short' }) };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'API key not configured' }) };
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user',   content: query.trim() }
        ],
        max_tokens: 400,
        temperature: 0.1,  // Low temperature = consistent, deterministic results
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('OpenAI error:', err);
      return { statusCode: 502, body: JSON.stringify({ error: 'AI service error' }) };
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Validate it's parseable JSON before returning
    JSON.parse(content);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: content
    };

  } catch (err) {
    console.error('Function error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal error' }) };
  }
};
