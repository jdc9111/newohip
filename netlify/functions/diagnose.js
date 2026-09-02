'use strict';
const https = require('https');

const CODE_LIST = `709 (skin): Skin abnormality, rash NYD
782 (skin): Skin symptoms
919 (skin): Abrasion, brise, bite, FB, crush
682 (skin): Abscess
919 (skin): Abscess - Pilonidal cysts
949 (skin): Burn
910 (skin): Bites - Insect
112 (skin): Candida
682 (skin): Cellulitis
702 (skin): Dermatitis
684 (skin): Impetigo
910 (skin): Insect Bites
691 (skin): Rash
133 (skin): Scabies
706 (skin): Sebaceous Cyst
454 (skin): Stasis Derm/ulcers, varicose
708 (skin): Uritcaria
539 (skin): Zoster
078 (skin): Warts
412 (cvs): Angina
441 (cvs): Aortic Aneurysm
427 (cvs): Arrythmia
429 (cvs): Cardiomyopathy, endocarditis, vavle disease, other cardiac and pericardial disease
785 (cvs): Chest Pain
428 (cvs): CHF
451 (cvs): DVT, PE, thromboembolism
426 (cvs): Heart Block
401 (cvs): Hypertension
410 (cvs): MI - acute
785 (cvs): Palpitation
427 (cvs): SVT, arrythmia, afib, arrest
785 (cvs): Syncope
443 (cvs): Peripheral vascular disease
415 (cvs): Pulmonary Embolism
493 (resp): Asthma
466 (resp): Bronchitis
492 (resp): COPD
464 (resp): Croup
451 (resp): DVT, PE, thromboembolism
464 (resp): Laryngitis, Epiglotittis
460 (resp): Pharyngitis
511 (resp): Plerual effusion
486 (resp): Pneumonia
512 (resp): Pneumothorax
461 (resp): Sinusitis
112 (id): Pneumonia
619 (id): Candida
682 (id): Cellulits
616 (id): Cervicitis
052 (id): Chicken Pox
080 (id): COVID
070 (id): Hepatitis
099 (id): Herpes
053 (id): Herpes Zoster
054 (id): Herpes Simplex
487 (id): Influenza
055 (id): Measles
075 (id): Mononucleosis, EBV
072 (id): Mumps
099 (id): STI
034 (id): Strepp pharyngitis
010 (id): TB
078 (id): Warts
787 (gi): Abod pain NYD
560 (gi): Hernia - abdominal
565 (gi): Anal fissure
549 (gi): Appendicitis
574 (gi): Cholecystitis
565 (gi): Constipation
555 (gi): Crohns
009 (gi): Diarrhea/Gastroenteritis
562 (gi): Diverticulosis
532 (gi): Duodenal ulcer
530 (gi): Esophagitis
531 (gi): Gastric ulcer
535 (gi): Gastritis
536 (gi): Heartburn, GERD, dyspepsia
455 (gi): Hemmorhoids
553 (gi): Hernia: abd, fem, diaph, hiatus
369 (eye): Blindness, loss of vision
372 (eye): Conjunctivitis, subconjunctival hemmorhage
370 (eye): Corneal Ulcer
379 (eye): Eye pain NYD
930 (eye): Foreign Body
365 (eye): Glaucoma
378 (eye): Diplopia
373 (eye): Stye, blepharitis, lid problem
351 (ent): Bell's Palsy
388 (ent): Earwax
786 (ent): Epistaxis
939 (ent): Foreign body - ear
379 (ent): Hearing Loss
386 (ent): Labyrinthitis
386 (ent): Meniere's, BPVertigo
380 (ent): Otitis externa
382 (ent): Otitis Media
461 (ent): Sinusitis
034 (ent): Strepp throat
521 (teeth): Dental problem: caries, asbcess
523 (teeth): Gingivitis
524 (teeth): Mandible/TMJ problem
527 (teeth): Salivary gland
528 (teeth): Stomatitis, apthous ulcer
525 (teeth): Dental pain, teething
781 (neuro): Abnormal involuntary movement
351 (neuro): Bell's Palsy
850 (neuro): Concussion
854 (neuro): Head injury / Intracranial injury
780 (neuro): Headache NYD
346 (neuro): Headache - Migraine
307 (neuro): Headache - Tension
320 (neuro): Mennigitis
346 (neuro): Migraine
340 (neuro): Muliptle Sclerosis
780 (neuro): Paresthesia
332 (neuro): Parkinson's
739 (neuro): Peripheral nerve, CTS, BELL's
345 (neuro): Seizure Disorder
436 (neuro): Stroke (acute)
437 (neuro): Stroke (chronic)
435 (neuro): TIA
780 (neuro): Vertigo
607 (gu): Balanitis
600 (gu): BPH
604 (gu): Epididymitis, orchitis
599 (gu): Hematuria, proteinuria, incontinence, renal problem
603 (gu): Hydrocele
608 (gu): Male genital problem
605 (gu): Phimosis
601 (gu): Prostatits
590 (gu): Pyelonephritis
584 (gu): Renal failure
099 (gu): STI
592 (gu): Stone - bladder, renal
598 (gu): Urethral stricture
595 (gu): UTI
650 (gyne): Delivery - normal
627 (gyne): Dysfunctional uterine bleeding
626 (gyne): Dysmennorhea
634 (gyne): Early fetal loss - Complete/Incomplete
632 (gyne): Early fetal loss - Missed
640 (gyne): Early fetal loss - Threatened
642 (gyne): Eclampsia, Pre-eclampsia, toxaemia
615 (gyne): Ectopic pregnancy
615 (gyne): Endometriosis
642 (gyne): Eclampsia, Pre-eclampsia, toxaemia
218 (gyne): Fibroid
643 (gyne): Hyperemesis
626 (gyne): Menorrhagia
611 (gyne): Menopausal symtoms
256 (gyne): Ovarian cyst
614 (gyne): PID - Pelvic inflammatory diesease
669 (gyne): Post-partum complications
650 (gyne): Pregnancy - normal
099 (gyne): STI
616 (gyne): Vaginitis
303 (psych): Alchohol problems
316 (psych): Anorexia
300 (psych): Anxiety
312 (psych): Behaviour problem
290 (psych): Dementia
300 (psych): Depression
304 (psych): Drug abuse/addiction
307 (psych): Insomnia
977 (psych): Overdose
301 (psych): Personality Disorder
298 (psych): Psychosis
295 (psych): Schizophrenia
790 (blood): Abnormal lab results
285 (blood): Anemia
287 (blood): Coag disorder, anticoag
250 (blood): Diabetes
269 (blood): Nutritional deficient/FTT
274 (blood): Gout
242 (blood): Hyperthyroid
244 (blood): Hypothyroid
269 (blood): Hypoglycemia
274 (blood): Gout
274 (blood): Neutropenia, WBC abnormality
683 (blood): Lymphadenopathy
199 (blood): Neoplasm - malignant
279 (blood): Thyroiditis
739 (nyd): Arthritis
839 (nyd): Dislocation
829 (msk): Fracture
274 (msk): Gout
959 (msk): Injury or trauma - other
848 (msk): Muscle Sprain/Strain
715 (msk): Osteoarthritis
977 (nyd): Adverse Effects - Drugs and Medications - including allergy, overdose, reactions
787 (nyd): Abdominal Pain NYD
785 (nyd): Chest Pain NYD
780 (nyd): Dizziness
786 (nyd): Dyspnea/SOB
780 (nyd): Headache
959 (nyd): Injury or trauma - other
199 (nyd): Neoplasm - malignant
798 (nyd): Sudden death - unknown cause
785 (nyd): Syncope
691 (nyd): Rash
884 (lac): Laceration - upper limb
894 (lac): Laceration - lower limb
879 (lac): Laceration - except limbs
611 (breast): Breast disorder
785 (breast): Breast mass
174 (breast): Breast ca
610 (breast): Breast abscess
675 (breast): Mastitis`;

const SYSTEM_PROMPT = `You are an OHIP diagnostic code lookup tool for Emergency Department physicians in Ontario, Canada.

The user will type a diagnosis name, medical abbreviation, or clinical term. Your job is to find the best matching OHIP diagnostic codes from the list below.

You must recognise common medical abbreviations and synonyms, for example:
- afib / AF -> atrial fibrillation -> arrhythmia
- SOB / dyspnea -> shortness of breath
- PE -> pulmonary embolism
- STEMI / NSTEMI -> myocardial infarction
- UTI -> urinary tract infection
- shingles -> herpes zoster
- clot / DVT -> deep vein thrombosis
- stroke / CVA -> cerebrovascular accident
- belly pain / abd pain -> abdominal pain
- blocked bowel -> obstruction
- BPPV / vertigo -> dizziness
- OD / overdose -> poisoning / adverse drug effect
- FB -> foreign body
- LOC / syncope -> loss of consciousness

Here is the complete list of available diagnostic codes:
${CODE_LIST}

Rules:
- Return ONLY codes from the list above, never invent codes
- Return the top 4 most relevant matches, ranked best match first
- Respond ONLY with a valid JSON object in this exact format:
  {"results": [{"code": "451", "description": "DVT - Deep Vein Thrombosis", "category": "cvs"}, ...]}
- No explanation, no markdown, no extra text, just the JSON object`;

function callOpenAI(apiKey, query) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: query }
      ],
      max_tokens: 400,
      temperature: 0.1,
      response_format: { type: 'json_object' }
    });

    const options = {
      hostname: 'api.openai.com',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let query;
  try {
    ({ query } = JSON.parse(event.body));
  } catch (e) {
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
    const { status, body } = await callOpenAI(apiKey, query.trim());

    if (status !== 200) {
      console.error('OpenAI error ' + status + ':', body);
      return { statusCode: 502, body: JSON.stringify({ error: 'AI service error' }) };
    }

    const data = JSON.parse(body);
    const content = data.choices[0].message.content;

    // Validate parseable before returning
    JSON.parse(content);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: content
    };

  } catch (err) {
    console.error('Function error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal error: ' + err.message }) };
  }
};

// Exposed so other functions (e.g. search.js, the combined billing+diagnostic
// search) can reuse the same code list and prompt instead of duplicating them.
exports.CODE_LIST = CODE_LIST;
exports.SYSTEM_PROMPT = SYSTEM_PROMPT;