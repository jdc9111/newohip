'use strict';
var https = require('https');

var BILLING_CODES = [
  "H101 (ED Assessment): Minor assessment -- Day (8am--5pm)",
  "H102 (ED Assessment): Comprehensive assessment -- Day (8am--5pm)",
  "H103 (ED Assessment): Multiple assessment -- Day (8am--5pm)",
  "H104 (ED Assessment): Reassessment -- Day (8am--5pm) -- >2h, change mgmt, not d/c or referral; max 3/pt/day",
  "H131 (ED Assessment): Minor assessment -- Eve Mon--Thu (5pm--midnight)",
  "H132 (ED Assessment): Comprehensive assessment -- Eve Mon--Thu (5pm--midnight)",
  "H133 (ED Assessment): Multiple assessment -- Eve Mon--Thu (5pm--midnight)",
  "H134 (ED Assessment): Reassessment -- Eve Mon--Thu (5pm--midnight) -- >2h, change mgmt; max 3/pt/day",
  "H121 (ED Assessment): Minor assessment -- Night (midnight--8am)",
  "H122 (ED Assessment): Comprehensive assessment -- Night (midnight--8am)",
  "H123 (ED Assessment): Multiple assessment -- Night (midnight--8am)",
  "H124 (ED Assessment): Reassessment -- Night (midnight--8am) -- >2h, change mgmt; max 3/pt/day",
  "H151 (ED Assessment): Minor assessment -- Wkd/Hol (8am--midnight) -- Incl Fri eve 5pm--midnight",
  "H152 (ED Assessment): Comprehensive assessment -- Wkd/Hol (8am--midnight) -- Incl Fri eve 5pm--midnight",
  "H153 (ED Assessment): Multiple assessment -- Wkd/Hol (8am--midnight) -- Incl Fri eve 5pm--midnight",
  "H154 (ED Assessment): Reassessment -- Wkd/Hol (8am--midnight) -- Incl Fri eve 5pm--midnight; max 3/pt/day",
  "H112 (Premiums): Night premium (midnight--8am) -- Per patient visit",
  "H113 (Premiums): Wkd/Hol + Fri eve premium -- Per patient visit; incl Fri eve 5pm--midnight",
  "H114 (Premiums): Weekday eve premium (Mon--Thu) -- Per patient visit; NEW April 2026",
  "H055 (Consultations): Consultation to ED -- FRCPC -- Must record referring MD billing # or contact info",
  "H065 (Consultations): Consultation to ED -- CFPC -- Must record referring MD billing # or contact info",
  "K734 (Consultations): Phone consult -- referring physician -- e10 min; cannot lead to follow-up",
  "K735 (Consultations): Phone consult -- consultant physician -- e10 min; cannot lead to follow-up",
  "K736 (Consultations): CritiCall telephone consultation -- referring physician -- Exact fee $32.45",
  "H960 (On-Call): On-call travel -- Weekday Day -- Max 2/day",
  "H962 (On-Call): On-call travel -- Weekday Eve -- Max 2",
  "H963 (On-Call): On-call travel -- Wkd/Hol -- Max 4",
  "H964 (On-Call): On-call travel -- Night -- Unlimited",
  "H980 (On-Call): On-call 1st patient -- Weekday Day -- Max 5",
  "H984 (On-Call): On-call 1st patient -- Weekday Eve -- Max 5",
  "H968 (On-Call): On-call 1st patient -- Wkd/Hol -- Max 10",
  "H986 (On-Call): On-call 1st patient -- Night -- Unlimited",
  "H981 (On-Call): On-call addl patient -- Weekday Day -- Max 5",
  "H985 (On-Call): On-call addl patient -- Weekday Eve -- Max 5",
  "H989 (On-Call): On-call addl patient -- Wkd/Hol -- Max 10",
  "H987 (On-Call): On-call addl patient -- Night -- Unlimited",
  "K005 (Counselling / Forms): Mental health counselling -- Min 20 min; document mental health dx + times",
  "K028 (Counselling / Forms): Needlestick or STI counselling/treatment -- Per 30 min; document times. Fee updated April 1 2026",
  "K034 (Counselling / Forms): Telephone report of reportable disease to MOH -- Max 1 per physician per patient per disease per 12 months; must be personally rendered by physician",
  "K015 (Counselling / Forms): Counsel family re: death/catastrophe -- Min 20 min; document times",
  "K623 (Counselling / Forms): Form 1 -- psychiatric assessment",
  "K070 (Counselling / Forms): Homecare application",
  "K071 (Counselling / Forms): Acute Home Care Supervision -- Exact fee $21.40; max 1 per physician per patient per 2 weeks; first 12 weeks following admission to home care program",
  "K035 (Counselling / Forms): Medical conditions report -- Mandatory report to MOT; exact fee $36.25 (MOH Jan 2025)",
  "A771 (Counselling / Forms): Death certificate",
  "A777 (Counselling / Forms): Pronouncement + death certificate",
  "H105 (Counselling / Forms): Interim admission orders",
  "A320 (Counselling / Forms): MAID consultation -- NEW April 2026; exact fee $174.25",
  "G521 (Critical Care  Imminent): Imminent life-threatening: 1st 15 min (1st MD) -- Arrest/Trauma; document times; cannot see other pts simultaneously; exact fee $111.80 (MOH Jan 2025). <strong>E420 +50% trauma premium (ISS > 15)</strong>",
  "G523 (Critical Care  Imminent): Imminent life-threatening: 2nd 15 min (1st MD) -- Arrest/Trauma; exact fee $57.65 (MOH Jan 2025)",
  "G522 (Critical Care  Imminent): Imminent life-threatening: each addl 15 min (max 6) -- Arrest/Trauma; bill for 2nd/3rd MD too; exact fee $38.00 (MOH Jan 2025)",
  "E420 (Critical Care  Imminent): Trauma ISS > 15 premium -- Add to critical care codes",
  "G395 (Critical Care  Potential): Potential life-threatening: 1st 15 min -- Other resuscitation; document times; exact fee $57.45 (MOH Jan 2025)",
  "G391 (Critical Care  Potential): Potential life-threatening: each addl 15 min (max 7) -- Bill for 2nd/3rd MD too; exact fee $30.60 (MOH Jan 2025)",
  "Z437 (Critical Care  Other Procedures): Cardioversion (max 3/day) -- Allowed with G395 but NOT G521",
  "G269 (Critical Care  Other Procedures): Central line",
  "G211 (Critical Care  Other Procedures): Intubation -- Allowed with G395 but NOT G521; exact fee $38.35 (MOH Jan 2025)",
  "Z341 (Critical Care  Other Procedures): Chest tube",
  "Z611 (Critical Care  Other Procedures): Catheter -- Exact fee $8.55 (MOH Jan 2025)",
  "H100 (Critical Care  Other Procedures): Ultrasound",
  "E009 (Anaesthesia Modifiers): Patient < 1 year old -- Add C4 units; 1 unit = $15.96 (April 2026)",
  "E019 (Anaesthesia Modifiers): Patient 1--8 years old -- Add C2 units",
  "E007 (Anaesthesia Modifiers): Patient 70--79 years old -- Add C1 unit",
  "E018 (Anaesthesia Modifiers): Patient > 80 years old -- Add C3 units",
  "E011 (Anaesthesia Modifiers): Prone position -- Add C4 units",
  "E024 (Anaesthesia Modifiers): Sitting position -- Add C4 units",
  "E022 (Anaesthesia Modifiers): ASA III -- Add C2 units",
  "E017 (Anaesthesia Modifiers): ASA IV -- Add C10 units",
  "E016 (Anaesthesia Modifiers): ASA V -- Add C20 units",
  "E020 (Anaesthesia Modifiers): ASA E (emergency) -- Add C4 units",
  "E010 (Anaesthesia Modifiers): BMI > 40 -- Add C2 units",
  "E400 (Anaesthesia Modifiers): Eve/Wkd/Hol time qualifier -- 3rd line; C = sum of steps 2+3 units",
  "E401 (Anaesthesia Modifiers): Overnight time qualifier -- 3rd line; C = sum of steps 2+3 units",
  "E413 (Anaesthesia Modifiers): Procedure premium -- Overnight -- +40% on anaesthesia",
  "E412 (Anaesthesia Modifiers): Procedure premium -- Eve/Wkd/Hol -- +20% on anaesthesia",
  "Z154 (Sutures): Face suture 0--5 cm -- Adhesive strips/glue = 50% of fee",
  "Z177 (Sutures): Face suture 5.1--10 cm",
  "Z190 (Sutures): Face suture 10.1--15 cm",
  "Z192 (Sutures): Face suture > 15 cm",
  "Z176 (Sutures): Body suture 0--5 cm",
  "Z175 (Sutures): Body suture 5.1--10 cm",
  "Z179 (Sutures): Body suture 10.1--15 cm",
  "Z191 (Sutures): Body suture > 15 cm",
  "R024 (Complex Lacerations): Acute earlobe repair -- > 20 min; document times",
  "Z189 (Complex Lacerations): Complex laceration zone 1 -- > 20 min; document times",
  "Z187 (Complex Lacerations): Complex face laceration -- > 20 min; document times",
  "R606 (Complex Lacerations): Phalanx amputation repair",
  "Z188 (Complex Lacerations): Complex non-face laceration -- > 20 min; document times",
  "P036 (Complex Lacerations): Vaginal laceration repair",
  "R525 (Complex Lacerations): Muscle & skin repair",
  "R578 (Complex Lacerations): Extensor tendon repair",
  "J149C (Routine Procedures): U/S guided procedure",
  "G269 (Routine Procedures): Central line",
  "G224 (Routine Procedures): Nerve block -- ring/small (provides analgesia > 4h)",
  "G268 (Routine Procedures): Arterial line",
  "G060 (Routine Procedures): Major nerve block (provides analgesia > 4h)",
  "G061 (Routine Procedures): Minor nerve block (provides analgesia > 4h)",
  "G260 (Routine Procedures): Major plexus block -- 3-in-1 (provides analgesia > 4h)",
  "G231 (Routine Procedures): Dental block",
  "G370 (Routine Procedures): Knee aspiration",
  "G328 (Routine Procedures): Joint aspiration (not knee)",
  "E446 (Routine Procedures): U/S guided aspiration (addl) -- Add-on code",
  "Z080 (Routine Procedures): Wound/ulcer debridement",
  "Z331 (Routine Procedures): Diagnostic thoracentesis",
  "Z332 (Routine Procedures): Therapeutic thoracentesis",
  "Z590 (Routine Procedures): Diagnostic paracentesis",
  "Z591 (Routine Procedures): Therapeutic paracentesis",
  "G356 (Routine Procedures): NG tube insertion",
  "Z520 (Routine Procedures): G tube change",
  "Z538 (Routine Procedures): Hernia reduction",
  "Z543 (Routine Procedures): Proctoscopy",
  "Z110 (Routine Procedures): Subungual hematoma drainage",
  "Z608 (Routine Procedures): Manual Foley declogging",
  "Z128 (Routine Procedures): Nail removal",
  "A920 (Routine Procedures): Misoprostol (including assessment)",
  "Z130 (Routine Procedures): Nail removal + cautery",
  "S756 (Routine Procedures): Removal of POC from OS",
  "G313 (Routine Procedures): EKG -- Must be discharged patient",
  "Z804 (Routine Procedures): Lumbar puncture",
  "Z399 (Routine Procedures): Endoscopy",
  "L810 (Routine Procedures): Description of CSF -- Exact fee $25.00 (MOH Jan 2025)",
  "G435 (Routine Procedures): Tonometry -- Exact fee $5.10 (MOH Jan 2025)",
  "Z432 (Routine Procedures): Exam under anaesthesia",
  "G552 (Routine Procedures): IUD removal (without sedation) -- Removal of intrauterine contraceptive device without sedation",
  "Z756 (Routine Procedures): Rectal disimpaction / fecal disimpaction -- Was $36.80 � $46.00 April 2026",
  "H264 (Routine Procedures): ED pelvic exam with speculum -- NEW April 2026",
  "Z101 (Incision & Drainage): Abscess I&D -- one abscess (LA)",
  "Z226 (Incision & Drainage): Elbow bursa I&D",
  "Z102 (Incision & Drainage): Abscess I&D -- one abscess (GA)",
  "Z506 (Incision & Drainage): Oral abscess I&D",
  "Z173 (Incision & Drainage): Abscess I&D -- two abscesses (LA)",
  "Z714 (Incision & Drainage): Bartholin's cyst I&D (LA)",
  "Z174 (Incision & Drainage): Abscess I&D -- 3+ abscesses (LA)",
  "Z715 (Incision & Drainage): Bartholin's cyst I&D (GA)",
  "Z104 (Incision & Drainage): Perianal abscess I&D (LA) -- Was $20.10 � $33.25 (+65%) April 2026",
  "Z140 (Incision & Drainage): Breast abscess I&D (LA)",
  "Z105 (Incision & Drainage): Perianal abscess I&D (GA)",
  "Z740 (Incision & Drainage): Breast abscess I&D (GA)",
  "Z106 (Incision & Drainage): Pilonidal abscess I&D (LA)",
  "Z227 (Incision & Drainage): IM abscess/hematoma I&D",
  "Z107 (Incision & Drainage): Pilonidal abscess I&D (GA)",
  "Z510 (Incision & Drainage): Peritonsillar abscess (PTA) drainage",
  "Z545 (Incision & Drainage): Hemorrhoid I&D",
  "E318 (Incision & Drainage): Pinna hematoma drainage",
  "Z114 (Foreign Bodies): Foreign body removal -- skin (LA)",
  "Z915 (Foreign Bodies): Foreign body removal -- ear (LA)",
  "Z115 (Foreign Bodies): Foreign body removal -- skin (GA)",
  "Z866 (Foreign Bodies): Foreign body removal -- ear (GA)",
  "R517 (Foreign Bodies): Foreign body removal -- muscle",
  "Z311 (Foreign Bodies): Foreign body removal -- nose (LA)",
  "Z541 (Foreign Bodies): Foreign body removal -- rectum (GA)",
  "Z312 (Foreign Bodies): Foreign body removal -- nose (GA)",
  "Z847 (Foreign Bodies): Foreign body removal -- eye (1 FB)",
  "Z848 (Foreign Bodies): Foreign body removal -- eye (2 FBs) -- Exact fee $45.00 (MOH Jan 2025)",
  "Z432A (Foreign Bodies): Foreign body removal -- vagina (GA)",
  "S547 (Foreign Bodies): Foreign body removal -- urethra",
  "E023C (Foreign Bodies): Foreign body removal -- vagina with sedation -- 6 anaesthesia units",
  "G420 (ENT): Ear syringe/irrigation",
  "G403 (ENT): Epley manoeuvre",
  "Z315 (ENT): Anterior nasal pack",
  "Z321 (ENT): Direct laryngoscopy",
  "Z316 (ENT): Posterior nasal pack",
  "Z322 (ENT): Direct laryngoscopy with FB removal",
  "Z314 (ENT): Nasal cautery",
  "Z324 (ENT): Indirect laryngoscopy with FB removal",
  "F136 (ENT): Nasal fracture reduction",
  "D062 (ENT): TMJ reduction",
  "F004 (Fractures  Upper Extremity): Phalanx finger fracture -- closed, no reduction -- Exact fee $49.20 (MOH Jan 2025)",
  "F005 (Fractures  Upper Extremity): Phalanx finger fracture -- closed, with reduction -- Ortho f/u = 75%; Exact fee $99.25 (MOH Jan 2025)",
  "E558 (Fractures  Upper Extremity): Phalanx finger -- each addl fracture with reduction -- Exact fee $22.25 (MOH Jan 2025)",
  "F007 (Fractures  Upper Extremity): Phalanx finger fracture -- open, with reduction -- Exact fee $298.45 (MOH Jan 2025)",
  "F008 (Fractures  Upper Extremity): Metacarpal fracture -- no reduction -- Exact fee $49.20 (MOH Jan 2025)",
  "F009 (Fractures  Upper Extremity): Metacarpal fracture -- with reduction -- Exact fee $99.25 (MOH Jan 2025)",
  "F012 (Fractures  Upper Extremity): Bennett's fracture -- no reduction -- Exact fee $49.20 (MOH Jan 2025)",
  "F013 (Fractures  Upper Extremity): Bennett's fracture -- with reduction -- Exact fee $119.80 (MOH Jan 2025)",
  "F018 (Fractures  Upper Extremity): Scaphoid fracture -- no reduction -- Exact fee $49.20 (MOH Jan 2025)",
  "F102 (Fractures  Upper Extremity): Other carpal fracture -- no reduction -- Exact fee $49.20 (MOH Jan 2025)",
  "F016 (Fractures  Upper Extremity): Other carpal fracture -- with reduction -- Exact fee $115.10 (MOH Jan 2025)",
  "F027 (Fractures  Upper Extremity): Colles/Smith fracture -- no reduction -- Exact fee $67.75 (MOH Jan 2025)",
  "F028 (Fractures  Upper Extremity): Colles/Smith fracture -- with reduction -- Exact fee $109.45 (MOH Jan 2025)",
  "F046 (Fractures  Upper Extremity): Colles/Smith fracture -- with reduction + sedation -- Exact fee $149.35 (MOH Jan 2025)",
  "F031 (Fractures  Upper Extremity): Radius or ulna fracture -- no reduction -- Exact fee $81.30 (MOH Jan 2025)",
  "F032 (Fractures  Upper Extremity): Radius or ulna fracture -- with reduction -- Exact fee $117.85 (MOH Jan 2025)",
  "F034 (Fractures  Upper Extremity): Olecranon fracture -- no reduction -- Exact fee $126.25 (MOH Jan 2025)",
  "F035 (Fractures  Upper Extremity): Olecranon fracture -- with reduction -- Exact fee $129.00 (MOH Jan 2025)",
  "F029 (Fractures  Upper Extremity): Epicondyle fracture (no cast) -- no reduction -- Exact fee $67.75 (MOH Jan 2025)",
  "F037 (Fractures  Upper Extremity): Epicondyle fracture (no cast) -- with reduction -- Exact fee $126.25 (MOH Jan 2025)",
  "F042 (Fractures  Upper Extremity): Humeral shaft fracture (no cast) -- no reduction -- Exact fee $67.80 (MOH Jan 2025)",
  "F043 (Fractures  Upper Extremity): Humeral shaft fracture (no cast) -- with reduction -- Exact fee $147.60 (MOH Jan 2025)",
  "F053 (Fractures  Upper Extremity): Humeral neck fracture (no cast) -- no reduction -- Exact fee $67.80 (MOH Jan 2025)",
  "F054 (Fractures  Upper Extremity): Humeral neck fracture (no cast) -- with reduction -- Exact fee $133.60 (MOH Jan 2025)",
  "F134 (Fractures  Lower Extremity): Pelvis fracture with pelvic binder -- with reduction -- No fee for no-reduction code; Exact fee $442.45 (MOH Jan 2025)",
  "F095 (Fractures  Lower Extremity): Femur fracture -- with reduction -- No fee for no-reduction code; Exact fee $407.35 (MOH Jan 2025)",
  "F085 (Fractures  Lower Extremity): Patella fracture (no cast) -- no reduction -- Exact fee $67.75 (MOH Jan 2025)",
  "F078 (Fractures  Lower Extremity): Tibia � fibula fracture -- no reduction -- Exact fee $115.95 (MOH Jan 2025)",
  "F079 (Fractures  Lower Extremity): Tibia � fibula fracture -- with reduction -- Exact fee $180.05 (MOH Jan 2025)",
  "F082 (Fractures  Lower Extremity): Fibula fracture -- no reduction -- Exact fee $67.75 (MOH Jan 2025)",
  "F083 (Fractures  Lower Extremity): Fibula fracture -- with reduction -- Exact fee $101.25 (MOH Jan 2025)",
  "F074 (Fractures  Lower Extremity): Ankle fracture -- no reduction -- Exact fee $67.75 (MOH Jan 2025)",
  "F075 (Fractures  Lower Extremity): Ankle fracture -- with reduction -- Exact fee $144.80 (MOH Jan 2025)",
  "F104 (Fractures  Lower Extremity): Ankle fracture with plafond burst -- with reduction -- Exact fee $242.25 (MOH Jan 2025)",
  "F070 (Fractures  Lower Extremity): Calcaneus fracture -- no reduction -- Exact fee $97.35 (MOH Jan 2025)",
  "F071 (Fractures  Lower Extremity): Calcaneus fracture -- with reduction -- Exact fee $161.45 (MOH Jan 2025)",
  "F061 (Fractures  Lower Extremity): Metatarsal fracture (no cast) -- no reduction -- Exact fee $49.20 (MOH Jan 2025)",
  "F062 (Fractures  Lower Extremity): Metatarsal fracture (with cast) -- no reduction -- Exact fee $67.75 (MOH Jan 2025)",
  "F063 (Fractures  Lower Extremity): Metatarsal fracture (with cast) -- with reduction -- Exact fee $98.35 (MOH Jan 2025)",
  "F066 (Fractures  Lower Extremity): Tarsal bone fracture -- no reduction -- Exact fee $98.10 (MOH Jan 2025)",
  "F067 (Fractures  Lower Extremity): Tarsal bone fracture -- with reduction -- Exact fee $165.20 (MOH Jan 2025)",
  "F056 (Fractures  Lower Extremity): Phalanx toe fracture -- no reduction -- Exact fee $49.20 (MOH Jan 2025)",
  "F058 (Fractures  Lower Extremity): Phalanx toe fracture -- with reduction -- Exact fee $72.35 (MOH Jan 2025)",
  "E560 (Fractures  Lower Extremity): Phalanx toe -- each addl, no reduction -- Exact fee $12.05 (MOH Jan 2025)",
  "E561 (Fractures  Lower Extremity): Phalanx toe -- each addl, with reduction -- Exact fee $14.90 (MOH Jan 2025)",
  "D001 (Dislocation Reductions): Phalanx finger dislocation reduction -- Exact fee $57.50 (MOH Jan 2025)",
  "E576 (Dislocation Reductions): Phalanx finger -- each addl dislocation -- Exact fee $10.25 (MOH Jan 2025)",
  "D003 (Dislocation Reductions): Phalanx finger dislocation reduction -- open -- Exact fee $196.50 (MOH Jan 2025)",
  "D004 (Dislocation Reductions): Metacarpophalangeal dislocation reduction -- Exact fee $57.50 (MOH Jan 2025)",
  "D007 (Dislocation Reductions): Carpal dislocation reduction -- Exact fee $128.05 (MOH Jan 2025)",
  "D012 (Dislocation Reductions): Pulled elbow reduction -- Exact fee $39.00 (MOH Jan 2025)",
  "D009 (Dislocation Reductions): Elbow dislocation reduction -- Exact fee $84.45 (MOH Jan 2025)",
  "D015 (Dislocation Reductions): Shoulder dislocation reduction -- no sedation -- Exact fee $49.20 (MOH Jan 2025)",
  "D016 (Dislocation Reductions): Shoulder dislocation reduction -- with sedation -- Exact fee $111.40 (MOH Jan 2025)",
  "D014 (Dislocation Reductions): A/C or S/C joint -- no reduction -- Exact fee $67.80 (MOH Jan 2025)",
  "D042 (Dislocation Reductions): Hip dislocation reduction -- Exact fee $268.25 (MOH Jan 2025)",
  "D038 (Dislocation Reductions): Knee dislocation reduction (no cast) -- Exact fee $207.90 (MOH Jan 2025)",
  "D040 (Dislocation Reductions): Patella dislocation -- no sedation, no cast -- Exact fee $62.20 (MOH Jan 2025)",
  "D031 (Dislocation Reductions): Patella dislocation -- with sedation, no cast -- Exact fee $97.35 (MOH Jan 2025)",
  "D035 (Dislocation Reductions): Ankle dislocation reduction -- Exact fee $111.35 (MOH Jan 2025)",
  "D026 (Dislocation Reductions): Tarso-metatarsal dislocation reduction (no cast) -- Exact fee $147.60 (MOH Jan 2025)",
  "D030 (Dislocation Reductions): Metatarsophalangeal dislocation reduction -- Exact fee $57.50 (MOH Jan 2025)",
  "D027 (Dislocation Reductions): Interphalangeal toe dislocation reduction -- Exact fee $57.50 (MOH Jan 2025)",
  "Z201 (Splints & Casts): Finger splint/cast -- Only if no F or D code billed; Exact fee $10.25 (MOH Jan 2025)",
  "Z202 (Splints & Casts): Hand splint/cast -- Only if no F or D code billed; Exact fee $14.90 (MOH Jan 2025)",
  "Z203 (Splints & Casts): Arm/forearm/wrist splint/cast -- Only if no F or D code billed; Exact fee $24.10 (MOH Jan 2025)",
  "Z213 (Splints & Casts): Below-knee splint/cast -- Only if no F or D code billed; Exact fee $24.10 (MOH Jan 2025)",
  "Z211 (Splints & Casts): Long leg splint/cast -- Only if no F or D code billed; Exact fee $28.80 (MOH Jan 2025)",
  "Z204 (Splints & Casts): Cast removal -- Exact fee $10.25 (MOH Jan 2025)"
].join('\n');

var SYSTEM_PROMPT =
  'You are an OHIP billing code lookup tool for Emergency Department physicians in Ontario, Canada.\n\n' +
  'The user will type a procedure name, injury, assessment type, or medical abbreviation. ' +
  'Return the 3 to 5 billing codes that best match what they typed -- nothing more.\n\n' +
  'Do NOT suggest assessment codes (H10x, H13x, H15x, H12x), premium codes (H113, H114, E412, E998C), ' +
  'or call-in codes unless the user specifically asks for them. ' +
  'Focus only on the specific procedure, fracture, dislocation, laceration, or service code they are looking for.\n\n' +
  'Common abbreviations: lac=laceration, FB=foreign body, Fx=fracture, I+D=incision and drainage, ' +
  'disloc=dislocation, BPPV=vertigo, CVA=stroke, MI=myocardial infarction\n\n' +
  'Here are all available billing codes:\n' + BILLING_CODES + '\n\n' +
  'Rules:\n' +
  '- Return ONLY codes from the list above, never invent codes\n' +
  '- Return 3 to 5 best matching codes, best match first\n' +
  '- Respond ONLY with valid JSON in this exact format:\n' +
  '  {"results": [{"code":"D015","description":"Shoulder dislocation reduction -- no sedation","category":"Dislocation Reductions","fee":"$49.20"}]}\n' +
  '- fee = extract the dollar amount from "Exact fee $X.XX" in the code description. If no exact fee is listed, use "See SOB"\n' +
  '- No explanation, no markdown, no extra text, just the JSON';

function callOpenAI(apiKey, query) {
  return new Promise(function(resolve, reject) {
    var payload = JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: query }
      ],
      max_tokens: 600,
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

exports.handler = function(event) {
  if (event.httpMethod !== 'POST') {
    return Promise.resolve({ statusCode: 405, body: 'Method Not Allowed' });
  }
  var query;
  try { query = JSON.parse(event.body).query; }
  catch(e) { return Promise.resolve({ statusCode: 400, body: JSON.stringify({ error: 'Invalid body' }) }); }
  if (!query || query.trim().length < 2) {
    return Promise.resolve({ statusCode: 400, body: JSON.stringify({ error: 'Query too short' }) });
  }
  var apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Promise.resolve({ statusCode: 500, body: JSON.stringify({ error: 'API key not configured' }) });
  }
  return callOpenAI(apiKey, query.trim())
    .then(function(r) {
      if (r.status !== 200) {
        console.error('OpenAI error:', r.status, r.body);
        return { statusCode: 502, body: JSON.stringify({ error: 'AI service error' }) };
      }
      var c = JSON.parse(r.body).choices[0].message.content;
      JSON.parse(c);
      return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: c };
    })
    .catch(function(err) {
      console.error('Function error:', err);
      return { statusCode: 500, body: JSON.stringify({ error: 'Internal error: ' + err.message }) };
    });
};