
const DATA = [
  ["H101","Minor assessment – Day (8am–5pm)",23,"ED Assessment",""],
  ["H102","Comprehensive assessment – Day (8am–5pm)",57,"ED Assessment",""],
  ["H103","Multiple assessment – Day (8am–5pm)",47,"ED Assessment",""],
  ["H104","Reassessment – Day (8am–5pm)",23,"ED Assessment",">2h, change mgmt, not d/c or referral; max 3/pt/day"],
  ["H131","Minor assessment – Eve Mon–Thu (5pm–midnight)",30,"ED Assessment",""],
  ["H132","Comprehensive assessment – Eve Mon–Thu (5pm–midnight)",75,"ED Assessment",""],
  ["H133","Multiple assessment – Eve Mon–Thu (5pm–midnight)",62,"ED Assessment",""],
  ["H134","Reassessment – Eve Mon–Thu (5pm–midnight)",30,"ED Assessment",">2h, change mgmt; max 3/pt/day"],
  ["H121","Minor assessment – Night (midnight–8am)",40,"ED Assessment",""],
  ["H122","Comprehensive assessment – Night (midnight–8am)",100,"ED Assessment",""],
  ["H123","Multiple assessment – Night (midnight–8am)",81,"ED Assessment",""],
  ["H124","Reassessment – Night (midnight–8am)",40,"ED Assessment",">2h, change mgmt; max 3/pt/day"],
  ["H151","Minor assessment – Wkd/Hol (8am–midnight)",34,"ED Assessment","Incl Fri eve 5pm–midnight"],
  ["H152","Comprehensive assessment – Wkd/Hol (8am–midnight)",86,"ED Assessment","Incl Fri eve 5pm–midnight"],
  ["H153","Multiple assessment – Wkd/Hol (8am–midnight)",70,"ED Assessment","Incl Fri eve 5pm–midnight"],
  ["H154","Reassessment – Wkd/Hol (8am–midnight)",34,"ED Assessment","Incl Fri eve 5pm–midnight; max 3/pt/day"],
  ["H112","Night premium (midnight–8am)",51,"Premiums","Per patient visit"],
  ["H113","Wkd/Hol + Fri eve premium",32,"Premiums","Per patient visit; incl Fri eve 5pm–midnight"],
  ["H114","Weekday eve premium (Mon–Thu)",24,"Premiums","Per patient visit; NEW April 2026"],
  ["H055","Consultation to ED – FRCPC",126,"Consultations","Must record referring MD billing # or contact info"],
  ["H065","Consultation to ED – CFPC",96,"Consultations","Must record referring MD billing # or contact info"],
  ["K734","Phone consult – referring physician",31,"Consultations","≥10 min; cannot lead to follow-up"],
  ["K735","Phone consult – consultant physician",40,"Consultations","≥10 min; cannot lead to follow-up"],
  ["K736","CritiCall telephone consultation – referring physician",32,"Consultations","Exact fee $32.45"],
  ["H960","On-call travel – Weekday Day",37,"On-Call","Max 2/day"],
  ["H962","On-call travel – Weekday Eve",37,"On-Call","Max 2"],
  ["H963","On-call travel – Wkd/Hol",37,"On-Call","Max 4"],
  ["H964","On-call travel – Night",37,"On-Call","Unlimited"],
  ["H980","On-call 1st patient – Weekday Day",20,"On-Call","Max 5"],
  ["H984","On-call 1st patient – Weekday Eve",60,"On-Call","Max 5"],
  ["H968","On-call 1st patient – Wkd/Hol",75,"On-Call","Max 10"],
  ["H986","On-call 1st patient – Night",100,"On-Call","Unlimited"],
  ["H981","On-call addl patient – Weekday Day",20,"On-Call","Max 5"],
  ["H985","On-call addl patient – Weekday Eve",60,"On-Call","Max 5"],
  ["H989","On-call addl patient – Wkd/Hol",75,"On-Call","Max 10"],
  ["H987","On-call addl patient – Night",100,"On-Call","Unlimited"],
  ["K005","Mental health counselling",63,"Counselling / Forms","Min 20 min; document mental health dx + times"],
  ["K028","STD/Needlestick management counselling",63,"Counselling / Forms","Min 20 min; document times"],
  ["K015","Counsel family re: death/catastrophe",63,"Counselling / Forms","Min 20 min; document times"],
  ["K623","Form 1 – psychiatric assessment",105,"Counselling / Forms",""],
  ["K070","Homecare application",32,"Counselling / Forms",""],
  ["K035","Medical conditions report",null,"Counselling / Forms",""],
  ["A771","Death certificate",34,"Counselling / Forms",""],
  ["A777","Pronouncement + death certificate",34,"Counselling / Forms",""],
  ["H105","Interim admission orders",29,"Counselling / Forms",""],
  ["A320","MAID consultation",174,"Counselling / Forms","NEW April 2026; exact fee $174.25"],
  ["G521","Imminent life-threatening: 1st 15 min (1st MD)",null,"Critical Care – Imminent","Arrest/Trauma; document times; cannot see other pts simultaneously"],
  ["G523","Imminent life-threatening: 2nd 15 min (1st MD)",null,"Critical Care – Imminent","Arrest/Trauma"],
  ["G522","Imminent life-threatening: each addl 15 min (max 6)",null,"Critical Care – Imminent","Arrest/Trauma; bill for 2nd/3rd MD too"],
  ["E420","Trauma ISS > 15 premium",null,"Critical Care – Imminent","Add to critical care codes"],
  ["G395","Potential life-threatening: 1st 15 min",null,"Critical Care – Potential","Other resuscitation; document times"],
  ["G391","Potential life-threatening: each addl 15 min (max 7)",null,"Critical Care – Potential","Bill for 2nd/3rd MD too"],
  ["Z437","Cardioversion (max 3/day)",92,"Critical Care – Other Procedures","Allowed with G395 but NOT G521"],
  ["G269","Central line",31,"Critical Care – Other Procedures",""],
  ["G211","Intubation",null,"Critical Care – Other Procedures","Allowed with G395 but NOT G521"],
  ["Z341","Chest tube",70,"Critical Care – Other Procedures",""],
  ["Z611","Catheter",null,"Critical Care – Other Procedures",""],
  ["H100","Ultrasound",20,"Critical Care – Other Procedures",""],
  ["E009","Patient < 1 year old",null,"Anaesthesia Modifiers","Add C4 units; 1 unit = $15.96 (April 2026)"],
  ["E019","Patient 1–8 years old",null,"Anaesthesia Modifiers","Add C2 units"],
  ["E007","Patient 70–79 years old",null,"Anaesthesia Modifiers","Add C1 unit"],
  ["E018","Patient > 80 years old",null,"Anaesthesia Modifiers","Add C3 units"],
  ["E011","Prone position",null,"Anaesthesia Modifiers","Add C4 units"],
  ["E024","Sitting position",null,"Anaesthesia Modifiers","Add C4 units"],
  ["E022","ASA III",null,"Anaesthesia Modifiers","Add C2 units"],
  ["E017","ASA IV",null,"Anaesthesia Modifiers","Add C10 units"],
  ["E016","ASA V",null,"Anaesthesia Modifiers","Add C20 units"],
  ["E020","ASA E (emergency)",null,"Anaesthesia Modifiers","Add C4 units"],
  ["E010","BMI > 40",null,"Anaesthesia Modifiers","Add C2 units"],
  ["E400","Eve/Wkd/Hol time qualifier",null,"Anaesthesia Modifiers","3rd line; C = sum of steps 2+3 units"],
  ["E401","Overnight time qualifier",null,"Anaesthesia Modifiers","3rd line; C = sum of steps 2+3 units"],
  ["E413","Procedure premium – Overnight",null,"Anaesthesia Modifiers","+40% on anaesthesia"],
  ["E412","Procedure premium – Eve/Wkd/Hol",null,"Anaesthesia Modifiers","+20% on anaesthesia"],
  ["Z154","Face suture 0–5 cm",39,"Sutures","Adhesive strips/glue = 50% of fee"],
  ["Z177","Face suture 5.1–10 cm",78,"Sutures",""],
  ["Z190","Face suture 10.1–15 cm",111,"Sutures",""],
  ["Z192","Face suture > 15 cm",170,"Sutures",""],
  ["Z176","Body suture 0–5 cm",22,"Sutures",""],
  ["Z175","Body suture 5.1–10 cm",39,"Sutures",""],
  ["Z179","Body suture 10.1–15 cm",55,"Sutures",""],
  ["Z191","Body suture > 15 cm",85,"Sutures",""],
  ["R024","Acute earlobe repair",101,"Complex Lacerations","> 20 min; document times"],
  ["Z189","Complex laceration zone 1",92,"Complex Lacerations","> 20 min; document times"],
  ["Z187","Complex face laceration",92,"Complex Lacerations","> 20 min; document times"],
  ["R606","Phalanx amputation repair",161,"Complex Lacerations",""],
  ["Z188","Complex non-face laceration",92,"Complex Lacerations","> 20 min; document times"],
  ["P036","Vaginal laceration repair",54,"Complex Lacerations",""],
  ["R525","Muscle & skin repair",89,"Complex Lacerations",""],
  ["R578","Extensor tendon repair",164,"Complex Lacerations",""],
  ["J149C","U/S guided procedure",47,"Routine Procedures",""],
  ["G269","Central line",31,"Routine Procedures",""],
  ["G224","Nerve block – ring/small (provides analgesia > 4h)",16,"Routine Procedures",""],
  ["G268","Arterial line",31,"Routine Procedures",""],
  ["G060","Major nerve block (provides analgesia > 4h)",55,"Routine Procedures",""],
  ["G061","Minor nerve block (provides analgesia > 4h)",30,"Routine Procedures",""],
  ["G260","Major plexus block – 3-in-1 (provides analgesia > 4h)",80,"Routine Procedures",""],
  ["G231","Dental block",34,"Routine Procedures",""],
  ["G370","Knee aspiration",20,"Routine Procedures",""],
  ["G328","Joint aspiration (not knee)",40,"Routine Procedures",""],
  ["E446","U/S guided aspiration (addl)",30,"Routine Procedures","Add-on code"],
  ["Z080","Wound/ulcer debridement",20,"Routine Procedures",""],
  ["Z331","Diagnostic thoracentesis",32,"Routine Procedures",""],
  ["Z332","Therapeutic thoracentesis",59,"Routine Procedures",""],
  ["Z590","Diagnostic paracentesis",31,"Routine Procedures",""],
  ["Z591","Therapeutic paracentesis",58,"Routine Procedures",""],
  ["G356","NG tube insertion",34,"Routine Procedures",""],
  ["Z520","G tube change",11,"Routine Procedures",""],
  ["Z538","Hernia reduction",25,"Routine Procedures",""],
  ["Z543","Proctoscopy",9,"Routine Procedures",""],
  ["Z110","Subungual hematoma drainage",17,"Routine Procedures",""],
  ["Z608","Manual Foley declogging",59,"Routine Procedures",""],
  ["Z128","Nail removal",33,"Routine Procedures",""],
  ["A920","Misoprostol (including assessment)",161,"Routine Procedures",""],
  ["Z130","Nail removal + cautery",63,"Routine Procedures",""],
  ["S756","Removal of POC from OS",112,"Routine Procedures",""],
  ["G313","EKG",4,"Routine Procedures","Must be discharged patient"],
  ["Z804","Lumbar puncture",68,"Routine Procedures",""],
  ["Z399","Endoscopy",93,"Routine Procedures",""],
  ["L810","Description of CSF",null,"Routine Procedures",""],
  ["G435","Tonometry",null,"Routine Procedures",""],
  ["Z432","Exam under anaesthesia",54,"Routine Procedures",""],
  ["Z756","Rectal disimpaction / fecal disimpaction",46,"Routine Procedures","Was $36.80 → $46.00 April 2026"],
  ["H264","ED pelvic exam with speculum",12,"Routine Procedures","NEW April 2026"],
  ["Z101","Abscess I&D – one abscess (LA)",28,"Incision & Drainage",""],
  ["Z226","Elbow bursa I&D",97,"Incision & Drainage",""],
  ["Z102","Abscess I&D – one abscess (GA)",49,"Incision & Drainage",""],
  ["Z506","Oral abscess I&D",51,"Incision & Drainage",""],
  ["Z173","Abscess I&D – two abscesses (LA)",33,"Incision & Drainage",""],
  ["Z714","Bartholin's cyst I&D (LA)",17,"Incision & Drainage",""],
  ["Z174","Abscess I&D – 3+ abscesses (LA)",45,"Incision & Drainage",""],
  ["Z715","Bartholin's cyst I&D (GA)",51,"Incision & Drainage",""],
  ["Z104","Perianal abscess I&D (LA)",33,"Incision & Drainage","Was $20.10 → $33.25 (+65%) April 2026"],
  ["Z140","Breast abscess I&D (LA)",33,"Incision & Drainage",""],
  ["Z105","Perianal abscess I&D (GA)",72,"Incision & Drainage",""],
  ["Z740","Breast abscess I&D (GA)",75,"Incision & Drainage",""],
  ["Z106","Pilonidal abscess I&D (LA)",49,"Incision & Drainage",""],
  ["Z227","IM abscess/hematoma I&D",101,"Incision & Drainage",""],
  ["Z107","Pilonidal abscess I&D (GA)",118,"Incision & Drainage",""],
  ["Z510","Peritonsillar abscess (PTA) drainage",91,"Incision & Drainage",""],
  ["Z545","Hemorrhoid I&D",25,"Incision & Drainage",""],
  ["E318","Pinna hematoma drainage",92,"Incision & Drainage",""],
  ["Z114","Foreign body removal – skin (LA)",25,"Foreign Bodies",""],
  ["Z915","Foreign body removal – ear (LA)",11,"Foreign Bodies",""],
  ["Z115","Foreign body removal – skin (GA)",89,"Foreign Bodies",""],
  ["Z866","Foreign body removal – ear (GA)",51,"Foreign Bodies",""],
  ["R517","Foreign body removal – muscle",108,"Foreign Bodies",""],
  ["Z311","Foreign body removal – nose (LA)",11,"Foreign Bodies",""],
  ["Z541","Foreign body removal – rectum (GA)",58,"Foreign Bodies",""],
  ["Z312","Foreign body removal – nose (GA)",51,"Foreign Bodies",""],
  ["Z847","Foreign body removal – eye",33,"Foreign Bodies",""],
  ["Z432A","Foreign body removal – vagina (GA)",54,"Foreign Bodies",""],
  ["S547","Foreign body removal – urethra",171,"Foreign Bodies",""],
  ["E023C","Foreign body removal – vagina with sedation",null,"Foreign Bodies","6 anaesthesia units"],
  ["G420","Ear syringe/irrigation",11,"ENT",""],
  ["G403","Epley manoeuvre",21,"ENT",""],
  ["Z315","Anterior nasal pack",15,"ENT",""],
  ["Z321","Direct laryngoscopy",61,"ENT",""],
  ["Z316","Posterior nasal pack",36,"ENT",""],
  ["Z322","Direct laryngoscopy with FB removal",106,"ENT",""],
  ["Z314","Nasal cautery",12,"ENT",""],
  ["Z324","Indirect laryngoscopy with FB removal",45,"ENT",""],
  ["F136","Nasal fracture reduction",102,"ENT",""],
  ["D062","TMJ reduction",52,"ENT",""],
  ["F004","Phalanx finger fracture – closed, no reduction",49,"Fractures – Upper Extremity","Exact fee $49.20 (MOH Jan 2025)"],
  ["F005","Phalanx finger fracture – closed, with reduction",99,"Fractures – Upper Extremity","Ortho f/u = 75%; Exact fee $99.25 (MOH Jan 2025)"],
  ["E558","Phalanx finger – each addl fracture with reduction",22,"Fractures – Upper Extremity","Exact fee $22.25 (MOH Jan 2025)"],
  ["F007","Phalanx finger fracture – open, with reduction",298,"Fractures – Upper Extremity","Exact fee $298.45 (MOH Jan 2025)"],
  ["F008","Metacarpal fracture – no reduction",49,"Fractures – Upper Extremity","Exact fee $49.20 (MOH Jan 2025)"],
  ["F009","Metacarpal fracture – with reduction",99,"Fractures – Upper Extremity","Exact fee $99.25 (MOH Jan 2025)"],
  ["F012","Bennett's fracture – no reduction",49,"Fractures – Upper Extremity","Exact fee $49.20 (MOH Jan 2025)"],
  ["F013","Bennett's fracture – with reduction",120,"Fractures – Upper Extremity","Exact fee $119.80 (MOH Jan 2025)"],
  ["F018","Scaphoid fracture – no reduction",49,"Fractures – Upper Extremity","Exact fee $49.20 (MOH Jan 2025)"],
  ["F102","Other carpal fracture – no reduction",49,"Fractures – Upper Extremity","Exact fee $49.20 (MOH Jan 2025)"],
  ["F016","Other carpal fracture – with reduction",115,"Fractures – Upper Extremity","Exact fee $115.10 (MOH Jan 2025)"],
  ["F027","Colles/Smith fracture – no reduction",68,"Fractures – Upper Extremity","Exact fee $67.75 (MOH Jan 2025)"],
  ["F028","Colles/Smith fracture – with reduction",109,"Fractures – Upper Extremity","Exact fee $109.45 (MOH Jan 2025)"],
  ["F046","Colles/Smith fracture – with reduction + sedation",149,"Fractures – Upper Extremity","Exact fee $149.35 (MOH Jan 2025)"],
  ["F031","Radius or ulna fracture – no reduction",81,"Fractures – Upper Extremity","Exact fee $81.30 (MOH Jan 2025)"],
  ["F032","Radius or ulna fracture – with reduction",118,"Fractures – Upper Extremity","Exact fee $117.85 (MOH Jan 2025)"],
  ["F034","Olecranon fracture – no reduction",126,"Fractures – Upper Extremity","Exact fee $126.25 (MOH Jan 2025)"],
  ["F035","Olecranon fracture – with reduction",129,"Fractures – Upper Extremity","Exact fee $129.00 (MOH Jan 2025)"],
  ["F029","Epicondyle fracture (no cast) – no reduction",68,"Fractures – Upper Extremity","Exact fee $67.75 (MOH Jan 2025)"],
  ["F037","Epicondyle fracture (no cast) – with reduction",126,"Fractures – Upper Extremity","Exact fee $126.25 (MOH Jan 2025)"],
  ["F042","Humeral shaft fracture (no cast) – no reduction",68,"Fractures – Upper Extremity","Exact fee $67.80 (MOH Jan 2025)"],
  ["F043","Humeral shaft fracture (no cast) – with reduction",148,"Fractures – Upper Extremity","Exact fee $147.60 (MOH Jan 2025)"],
  ["F053","Humeral neck fracture (no cast) – no reduction",68,"Fractures – Upper Extremity","Exact fee $67.80 (MOH Jan 2025)"],
  ["F054","Humeral neck fracture (no cast) – with reduction",134,"Fractures – Upper Extremity","Exact fee $133.60 (MOH Jan 2025)"],
  ["F134","Pelvis fracture with pelvic binder – with reduction",442,"Fractures – Lower Extremity","No fee for no-reduction code; Exact fee $442.45 (MOH Jan 2025)"],
  ["F095","Femur fracture – with reduction",407,"Fractures – Lower Extremity","No fee for no-reduction code; Exact fee $407.35 (MOH Jan 2025)"],
  ["F085","Patella fracture (no cast) – no reduction",68,"Fractures – Lower Extremity","Exact fee $67.75 (MOH Jan 2025)"],
  ["F078","Tibia ± fibula fracture – no reduction",116,"Fractures – Lower Extremity","Exact fee $115.95 (MOH Jan 2025)"],
  ["F079","Tibia ± fibula fracture – with reduction",180,"Fractures – Lower Extremity","Exact fee $180.05 (MOH Jan 2025)"],
  ["F082","Fibula fracture – no reduction",68,"Fractures – Lower Extremity","Exact fee $67.75 (MOH Jan 2025)"],
  ["F083","Fibula fracture – with reduction",101,"Fractures – Lower Extremity","Exact fee $101.25 (MOH Jan 2025)"],
  ["F074","Ankle fracture – no reduction",68,"Fractures – Lower Extremity","Exact fee $67.75 (MOH Jan 2025)"],
  ["F075","Ankle fracture – with reduction",145,"Fractures – Lower Extremity","Exact fee $144.80 (MOH Jan 2025)"],
  ["F104","Ankle fracture with plafond burst – with reduction",242,"Fractures – Lower Extremity","Exact fee $242.25 (MOH Jan 2025)"],
  ["F070","Calcaneus fracture – no reduction",97,"Fractures – Lower Extremity","Exact fee $97.35 (MOH Jan 2025)"],
  ["F071","Calcaneus fracture – with reduction",161,"Fractures – Lower Extremity","Exact fee $161.45 (MOH Jan 2025)"],
  ["F061","Metatarsal fracture (no cast) – no reduction",49,"Fractures – Lower Extremity","Exact fee $49.20 (MOH Jan 2025)"],
  ["F062","Metatarsal fracture (with cast) – no reduction",68,"Fractures – Lower Extremity","Exact fee $67.75 (MOH Jan 2025)"],
  ["F063","Metatarsal fracture (with cast) – with reduction",98,"Fractures – Lower Extremity","Exact fee $98.35 (MOH Jan 2025)"],
  ["F066","Tarsal bone fracture – no reduction",98,"Fractures – Lower Extremity","Exact fee $98.10 (MOH Jan 2025)"],
  ["F067","Tarsal bone fracture – with reduction",165,"Fractures – Lower Extremity","Exact fee $165.20 (MOH Jan 2025)"],
  ["F056","Phalanx toe fracture – no reduction",49,"Fractures – Lower Extremity","Exact fee $49.20 (MOH Jan 2025)"],
  ["F058","Phalanx toe fracture – with reduction",72,"Fractures – Lower Extremity","Exact fee $72.35 (MOH Jan 2025)"],
  ["E560","Phalanx toe – each addl, no reduction",12,"Fractures – Lower Extremity","Exact fee $12.05 (MOH Jan 2025)"],
  ["E561","Phalanx toe – each addl, with reduction",15,"Fractures – Lower Extremity","Exact fee $14.90 (MOH Jan 2025)"],
  ["D001","Phalanx finger dislocation reduction",58,"Dislocation Reductions","Exact fee $57.50 (MOH Jan 2025)"],
  ["E576","Phalanx finger – each addl dislocation",10,"Dislocation Reductions","Exact fee $10.25 (MOH Jan 2025)"],
  ["D003","Phalanx finger dislocation reduction – open",197,"Dislocation Reductions","Exact fee $196.50 (MOH Jan 2025)"],
  ["D004","Metacarpophalangeal dislocation reduction",58,"Dislocation Reductions","Exact fee $57.50 (MOH Jan 2025)"],
  ["D007","Carpal dislocation reduction",128,"Dislocation Reductions","Exact fee $128.05 (MOH Jan 2025)"],
  ["D012","Pulled elbow reduction",39,"Dislocation Reductions","Exact fee $39.00 (MOH Jan 2025)"],
  ["D009","Elbow dislocation reduction",84,"Dislocation Reductions","Exact fee $84.45 (MOH Jan 2025)"],
  ["D015","Shoulder dislocation reduction – no sedation",49,"Dislocation Reductions","Exact fee $49.20 (MOH Jan 2025)"],
  ["D016","Shoulder dislocation reduction – with sedation",111,"Dislocation Reductions","Exact fee $111.40 (MOH Jan 2025)"],
  ["D014","A/C or S/C joint – no reduction",68,"Dislocation Reductions","Exact fee $67.80 (MOH Jan 2025)"],
  ["D042","Hip dislocation reduction",268,"Dislocation Reductions","Exact fee $268.25 (MOH Jan 2025)"],
  ["D038","Knee dislocation reduction (no cast)",208,"Dislocation Reductions","Exact fee $207.90 (MOH Jan 2025)"],
  ["D040","Patella dislocation – no sedation, no cast",62,"Dislocation Reductions","Exact fee $62.20 (MOH Jan 2025)"],
  ["D031","Patella dislocation – with sedation, no cast",97,"Dislocation Reductions","Exact fee $97.35 (MOH Jan 2025)"],
  ["D035","Ankle dislocation reduction",111,"Dislocation Reductions","Exact fee $111.35 (MOH Jan 2025)"],
  ["D026","Tarso-metatarsal dislocation reduction (no cast)",148,"Dislocation Reductions","Exact fee $147.60 (MOH Jan 2025)"],
  ["D030","Metatarsophalangeal dislocation reduction",58,"Dislocation Reductions","Exact fee $57.50 (MOH Jan 2025)"],
  ["D027","Interphalangeal toe dislocation reduction",58,"Dislocation Reductions","Exact fee $57.50 (MOH Jan 2025)"],
  ["Z201","Finger splint/cast",10,"Splints & Casts","Only if no F or D code billed; Exact fee $10.25 (MOH Jan 2025)"],
  ["Z202","Hand splint/cast",15,"Splints & Casts","Only if no F or D code billed; Exact fee $14.90 (MOH Jan 2025)"],
  ["Z203","Arm/forearm/wrist splint/cast",24,"Splints & Casts","Only if no F or D code billed; Exact fee $24.10 (MOH Jan 2025)"],
  ["Z213","Below-knee splint/cast",24,"Splints & Casts","Only if no F or D code billed; Exact fee $24.10 (MOH Jan 2025)"],
  ["Z211","Long leg splint/cast",29,"Splints & Casts","Only if no F or D code billed; Exact fee $28.80 (MOH Jan 2025)"],
  ["Z204","Cast removal",10,"Splints & Casts","Exact fee $10.25 (MOH Jan 2025)"],
];

// ── pre-build search tokens per row ─────────────────────────────────────────
const SEARCH_TOKENS = DATA.map(r =>
  (r[0] + " " + r[1] + " " + r[3] + " " + r[4]).toLowerCase()
);

// ── fuzzy score: higher = better match ───────────────────────────────────────
function score(haystack, needle) {
  if (!needle) return 1;
  const h = haystack.toLowerCase();
  const n = needle.toLowerCase();

  // exact substring → highest score
  if (h.includes(n)) return 100 + (n.length / h.length) * 50;

  // word-by-word partial match
  const words = n.split(/\s+/).filter(Boolean);
  let hits = 0;
  for (const w of words) {
    if (h.includes(w)) hits++;
  }
  if (hits === words.length) return 60 + hits * 5;
  if (hits > 0) return 30 + hits * 10;

  // fuzzy character sequence
  let si = 0, hi = 0, matched = 0;
  while (si < n.length && hi < h.length) {
    if (n[si] === h[hi]) { matched++; si++; }
    hi++;
  }
  if (si < n.length) return 0; // not all chars found
  return Math.round((matched / n.length) * 25);
}

// ── highlight matching substrings ────────────────────────────────────────────
function highlight(text, query) {
  if (!query) return esc(text);
  const q = query.trim();
  if (!q) return esc(text);
  // try to highlight the longest matching substring
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx !== -1) {
    return esc(text.slice(0, idx))
      + "<mark>" + esc(text.slice(idx, idx + q.length)) + "</mark>"
      + esc(text.slice(idx + q.length));
  }
  // highlight individual words
  let result = esc(text);
  q.split(/\s+/).filter(Boolean).forEach(w => {
    const re = new RegExp(escRe(w), "gi");
    result = result.replace(re, m => "<mark>" + m + "</mark>");
  });
  return result;
}

function esc(s) {
  return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}
function escRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ── render ────────────────────────────────────────────────────────────────────
const tbody  = document.getElementById("tbody");
const status = document.getElementById("status");
const empty  = document.getElementById("empty");
const tbl    = document.getElementById("tbl");

function render(query) {
  const q = (query || "").trim();

  let results;
  if (!q) {
    results = DATA.map((r, i) => ({ r, s: 1 }));
  } else {
    results = DATA
      .map((r, i) => ({ r, s: score(SEARCH_TOKENS[i], q) }))
      .filter(x => x.s > 0)
      .sort((a, b) => b.s - a.s);
  }

  tbody.innerHTML = "";

  if (results.length === 0) {
    tbl.style.display = "none";
    empty.style.display = "block";
    status.textContent = "";
    return;
  }

  tbl.style.display = "";
  empty.style.display = "none";

  if (q) {
    status.textContent = `${results.length} result${results.length === 1 ? "" : "s"} for "${q}"`;
  } else {
    status.textContent = `Showing all ${results.length} codes`;
  }

  const frag = document.createDocumentFragment();
  for (const { r } of results) {
    const [code, desc, fee, cat, notes] = r;
    const tr = document.createElement("tr");
    const feeStr = fee !== null ? "$" + fee : "—";

    tr.innerHTML = `
      <td>${highlight(code, q)}</td>
      <td>
        ${highlight(desc, q)}
        <div class="cat-pill">${highlight(cat, q)}</div>
        ${notes ? `<div class="note">${highlight(notes, q)}</div>` : ""}
      </td>
      <td>${feeStr}</td>`;
    frag.appendChild(tr);
  }
  tbody.appendChild(frag);
}

// ── debounced input handler ───────────────────────────────────────────────────
let timer;
document.getElementById("query").addEventListener("input", e => {
  clearTimeout(timer);
  timer = setTimeout(() => render(e.target.value), 120);
});

// initial render
render("");
