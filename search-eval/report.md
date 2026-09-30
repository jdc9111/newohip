# Search benchmark

231 golden queries, top 5 results per side. Latency is the full backend call from this machine (home runs in the browser, so it is effectively instant).

| Backend | Billing hit@1 | Billing hit@5 | Billing MRR | Diag hit@1 | Diag hit@5 | Diag MRR | p50 ms | p95 ms | $ / 1k searches | Errors |
|---|---|---|---|---|---|---|---|---|---|---|
| home | 51% | 64% | 0.56 | 26% | 38% | 0.30 | 1 | 2 | $0.000 | 0 |
| embed:te3-small-512-syn-ed | 72% | 91% | 0.79 | 60% | 79% | 0.66 | 256 | 350 | $0.0001 | 0 |
| hybrid:te3-small-512-syn-ed | 78% | 92% | 0.84 | 79% | 92% | 0.84 | 271 | 342 | $0.0001 | 0 |

## hit@5 by query type

| Backend | plain | abbrev | lay | synonym | variant | time | scenario | typo | code | diag |
|---|---|---|---|---|---|---|---|---|---|---|
| home | 87% | 37% | 33% | 49% | 76% | 90% | 27% | 24% | 100% | 46% |
| embed:te3-small-512-syn-ed | 96% | 84% | 86% | 78% | 100% | 100% | 69% | 82% | 40% | 95% |
| hybrid:te3-small-512-syn-ed | 96% | 90% | 90% | 89% | 97% | 100% | 88% | 88% | 100% | 94% |

## Misses (best code not in top 5)

<details><summary>home: 134 misses</summary>

- `abscess drainage` (diag): wanted 682, got 566, 616, 349, 611, 525
- `nasal packing` (diag): wanted 786, got 470, 471, 160
- `lac` (billing): wanted Z154/Z176, got R525, R578, Z191, R606, P036
- `I&D` (billing): wanted Z101, got Z545, Z226, Z506, Z854, Z140
- `I+D` (billing): wanted Z101, got nothing
- `LP` (billing): wanted Z804, got R662
- `FB ear` (billing): wanted Z915, got E009, E019, E007, E018, R024
- `FB ear` (diag): wanted 930, got 412, 718, 388, 744, 746
- `RSI` (billing): wanted G211, got Z437
- `ETT` (billing): wanted G211, got F012, F013
- `DCCV` (billing): wanted Z437, got nothing
- `IO` (billing): wanted G270, got D062, Z315, F136, G370, Z545
- `BPPV` (billing): wanted G403, got nothing
- `BPPV` (diag): wanted 386, got nothing
- `POCUS` (billing): wanted H100, got nothing
- `ECG` (billing): wanted G313, got nothing
- `ABI` (billing): wanted G517, got nothing
- `PVR` (billing): wanted G900, got nothing
- `POC removal` (diag): wanted 634, got 536
- `fx ankle` (diag): wanted 829, got 824, 845, 931, 934, 8248
- `tib fib fx` (diag): wanted 829, got 823, 427, 277, 610, 515
- `EUA` (billing): wanted Z432, got nothing
- `nosebleed` (billing): wanted Z315/Z314, got nothing
- `nosebleed` (diag): wanted 786, got nothing
- `stitches` (billing): wanted Z154/Z176, got nothing
- `splinter` (billing): wanted Z114, got nothing
- `splinter` (diag): wanted 919, got nothing
- `fish hook` (billing): wanted Z114, got nothing
- `fish hook` (diag): wanted 919, got nothing
- `ingrown toenail` (billing): wanted Z128/Z130, got nothing
- `blood under the nail` (billing): wanted Z110, got Z432, Z735, G282, K061, G521
- `nursemaid's elbow` (diag): wanted 839, got 832, 9593, 8419, 7263
- `boxer's fracture` (billing): wanted F008/F009, got F136, F004, F005, E558, F007
- `boxer's fracture` (diag): wanted 829, got 824, 814, 810, 802, 821
- `quinsy` (billing): wanted Z510, got nothing
- `bead stuck in nose` (billing): wanted Z311, got H101, H131, H121, H151, H152
- `blocked catheter` (billing): wanted Z608, got Z611, G282, G327, G125
- `pronounced dead` (billing): wanted A777, got nothing
- `tapped belly fluid` (billing): wanted Z591/Z590, got nothing
- `cauliflower ear drainage` (billing): wanted E318, got Z341, E009, E019, E007, E018
- `bleeding after tonsils out` (billing): wanted S066, got G224, K112, J149C, G269, G268
- `stool stuck needs manual removal` (billing): wanted Z756, got Z363, Z608, Z128, Z130, S756
- `stool stuck needs manual removal` (diag): wanted 564, got nothing
- `arthrocentesis` (billing): wanted G370/G328, got nothing
- `trephination` (billing): wanted Z110, got nothing
- `radial head subluxation` (billing): wanted D012, got F014, F022, G224, G060, R637
- `radial head subluxation` (diag): wanted 839, got 346, 307, 780, 854, 132
- `distal radius fracture` (billing): wanted F027/F028, got F024, F031, F032, F093, F136
- `distal radius fracture` (diag): wanted 829, got 813, 824, 814, 810, 802
- `5th metacarpal fracture` (diag): wanted 829, got 815, 824, 814, 810, 802
- `Weber B` (billing): wanted F074/F075, got H055, H065, H960, H962, H963
- `Weber B` (diag): wanted 829, got 787, 560, 895, 634, 632
- `IAN block` (billing): wanted G250, got G224, G060, K734, K735, K736
- `rib fracture block` (billing): wanted G220, got G224, G060, G061, G260, G231
- `lateral canthotomy` (billing): wanted E235, got Z316
- `Blakemore tube` (billing): wanted G349, got Z341, Z363, G356, Z520, F047
- `bladder scan` (billing): wanted G900, got nothing
- `code blue` (billing): wanted G521, got E420, E013C, G224, E446, F134
- `misoprostol for miscarriage` (billing): wanted A920, got K005, K061, K028, K034, K015
- `misoprostol for miscarriage` (diag): wanted 634, got 869, 532, 695, 930, 429
- `paronychia` (billing): wanted Z101, got nothing
- `face lac 3 cm` (diag): wanted 879, got 368, 375, 935, 634, 632
- `forearm laceration 7cm` (billing): wanted Z175, got Z154, Z177, Z190, Z192, Z176
- `leg laceration 12 cm` (billing): wanted Z179, got Z154, Z177, Z190, Z192, Z176
- `leg laceration 12 cm` (diag): wanted 894, got 8122, 412, 112, 781, 122
- `facial laceration 18 cm` (diag): wanted 879, got 518, 718, 918, 618, 351
- `complex facial laceration 30 minutes` (diag): wanted 879, got 309, 043, 303, 307, 300
- `posterior leg splint` (billing): wanted Z213, got Z211, K061, Z316, Z198, Z201
- `called in on the weekend` (billing): wanted H968/H963, got G521, G395, Z443, Z431, G211
- `sutured a 4 cm cut on the eyebrow` (billing): wanted Z154, got G125, G227, K071, G521, G395
- `sutured a 4 cm cut on the eyebrow` (diag): wanted 879, got 463, 410, 413, 460, 466
- `reduced a dislocated finger at the PIP` (billing): wanted D001, got G521, G395, G211, Z325, E013C
- `reduced a dislocated finger at the PIP` (diag): wanted 839, got 994, 440, 331, 669, 398
- `drained an abscess on the thigh` (billing): wanted Z101, got Z714, Z715, G521, G395, Z443
- `drained an abscess on the thigh` (diag): wanted 682, got 349, 540, 566, 567, 614
- `chest tube for pneumothorax` (diag): wanted 512, got 614, 869, 532, 695, 381
- `ran a cardiac arrest for 30 minutes` (billing): wanted G521, got K028, K112, G522, G391, G115
- `delivered a baby in the ED` (billing): wanted P006, got Z443, Z431, G269, G211, Z325
- `delivered a baby in the ED` (diag): wanted 650, got 994, 710, 227, 194, 159
- `reduced a pulled elbow in a toddler` (diag): wanted 839, got 832, 9593, 8419, 787, 560
- `splinted a broken toe` (diag): wanted 829, got 735, 845, 933, 787, 560
- `old man in urinary retention needed a foley` (diag): wanted 600/599, got 788, 590, 233, 753, 412
- `cardioverted afib` (billing): wanted Z437, got nothing
- `cardioverted afib` (diag): wanted 427, got nothing
- `rust ring from cornea` (billing): wanted Z847, got H055, H065, K734, K736, K101
- `rust ring from cornea` (diag): wanted 930, got 371, 646, 370, 634, 110
- `hip dislocation after hip replacement` (diag): wanted 839, got 935, 847, 936, 8439, 8470
- `lacceration face` (diag): wanted 879, got 744
- `disloaction shoulder` (diag): wanted 839, got 831, 840, 8310, 7260, 9592
- `absess` (billing): wanted Z101, got nothing
- `absess` (diag): wanted 682, got nothing
- `periannal abcess` (billing): wanted Z104, got nothing
- `cardiversion` (billing): wanted Z437, got nothing
- `epistaxsis` (billing): wanted Z315/Z314, got nothing
- `epistaxsis` (diag): wanted 786, got nothing
- `colles fractre` (diag): wanted 829, got nothing
- `thoracentisis` (billing): wanted Z331/Z332, got nothing
- `pnuemothorax chest tube` (diag): wanted 512, got 614, 381, 010, 015, 183
- `intubaton` (billing): wanted G211, got nothing
- `afib` (diag): wanted 427, got nothing
- `STEMI` (diag): wanted 410, got nothing
- `SOB` (diag): wanted 786, got nothing
- `CHF exacerbation` (diag): wanted 428, got nothing
- `PE` (diag): wanted 415, got 785, 704, 684, 536, 035
- `AECOPD` (diag): wanted 492, got nothing
- `CAP` (diag): wanted 486, got 7260
- `UTI` (diag): wanted 595, got 299, 709, 635, 296
- `renal colic` (diag): wanted 592, got 788, 223, 403, 259, 584
- `appy` (diag): wanted 540, got nothing
- `biliary colic` (diag): wanted 574, got 571, 788, 576
- `TIA` (diag): wanted 435, got 243, 611, 290, 661, 401
- `CVA` (diag): wanted 436, got nothing
- `seizure` (diag): wanted 345, got nothing
- `fainted` (diag): wanted 785, got nothing
- `dizzy` (diag): wanted 780, got nothing
- `ankle sprain` (diag): wanted 848, got 845, 824, 847, 579, 844
- `OD` (diag): wanted 977, got 289, 686, 537, 005, 038
- `suicidal ideation` (diag): wanted 300, got nothing
- `DKA` (diag): wanted 250, got nothing
- `low blood sugar` (diag): wanted 251, got 894, 038, 545, 765, 369
- `pink eye` (diag): wanted 372, got 743, 379, 374, 930, 224
- `swimmer's ear` (diag): wanted 380, got 412, 718, 388, 744, 746
- `AOM` (diag): wanted 382, got nothing
- `miscarriage` (diag): wanted 634/632, got nothing
- `PID` (diag): wanted 614, got 604, 253
- `anaphylaxis` (diag): wanted 977, got 995
- `bee sting` (diag): wanted 919, got 989, 070
- `HTN urgency` (diag): wanted 401, got nothing
- `SVT` (diag): wanted 427, got nothing
- `back pain` (diag): wanted 724, got 7245, 7242, 787, 781, 785
- `pneumonai` (diag): wanted 486, got nothing
- `GI bleed` (diag): wanted 787, got 566, 994, 529, 413, 136
- `BRBPR` (diag): wanted 569, got nothing
- `fall, fractured hip` (diag): wanted 829, got 847, 935, 936, 8439, 8470

</details>

<details><summary>embed:te3-small-512-syn-ed: 40 misses</summary>

- `abscess drainage` (diag): wanted 682, got 611, 525, 590, 685, 349
- `nasal packing` (diag): wanted 786, got 471, 470, 461, 460, 473
- `lac` (billing): wanted Z154/Z176, got L810, Z188, Z190, Z189, R024
- `I&D` (billing): wanted Z101, got Z506, Z227, Z107, Z106, Z545
- `I+D` (billing): wanted Z101, got Z173, Z227, Z506, Z103, Z174
- `RSI` (billing): wanted G211, got G517, R153, R152, R154, E420
- `POC removal` (diag): wanted 634, got 898, 545, 557, 897, 660
- `fx ankle` (diag): wanted 829, got 824, 734, 931, 8248, 8450
- `tib fib fx` (diag): wanted 829, got 823, 515, 427, 277, 7290
- `splinter` (billing): wanted Z114, got R606, Z176, Z216, F104, F007
- `splinter` (diag): wanted 919, got 289, 816, 579, 879, 727
- `fish hook` (billing): wanted Z114, got H264, E446, Z216, Z324, Z399
- `fish hook` (diag): wanted 919, got 123, 744, 288, 735, 989
- `nursemaid's elbow` (diag): wanted 839, got 8419, 832, 9593, 7263, 727
- `boxer's fracture` (billing): wanted F008/F009, got F004, F024, F012, F018, F013
- `radial head subluxation` (diag): wanted 839, got 813, 831, 832, 854, 834
- `distal radius fracture` (billing): wanted F027/F028, got F024, F032, F031, F093, F013
- `distal radius fracture` (diag): wanted 829, got 813, 815, 812, 823, 821
- `5th metacarpal fracture` (diag): wanted 829, got 815, 814, 816, 813, 8140
- `Weber B` (billing): wanted F074/F075, got R637, Z866, Z084, Z848, E017
- `Weber B` (diag): wanted 829, got 443, 909, 309, 989, 291
- `IAN block` (billing): wanted G250, got G060, G231, G061, G218, G260
- `rib fracture block` (billing): wanted G220, got F024, F013, F104, F032, F083
- `paronychia` (billing): wanted Z101, got R606, Z129, E561, E318, E576
- `drained an abscess on the thigh` (diag): wanted 682, got 611, 685, 525, 590, 349
- `delivered a baby in the ED` (diag): wanted 650, got 669, 667, 656, 916, 641
- `reduced a pulled elbow in a toddler` (diag): wanted 839, got 832, 9593, 8419, 899, 762
- `splinted a broken toe` (diag): wanted 829, got 933, 845, 735, 816, 824
- `old man in urinary retention needed a foley` (diag): wanted 600/599, got 788, 569, 618, 625, 598
- `rust ring from cornea` (diag): wanted 930, got 370, 372, 371, 361, 363
- `hip dislocation after hip replacement` (diag): wanted 839, got 831, 936, 935, 832, 8439
- `absess` (diag): wanted 682, got 611, 525, 590, 349, 685
- `epistaxsis` (billing): wanted Z315/Z314, got S756, Z139, E560, Z128, E561
- `colles fractre` (diag): wanted 829, got 816, 994, 815, 8140, 810
- `D015` (billing): wanted D015, got E016, E020, E017, Z915, K015
- `g521` (billing): wanted G521, got Z520, G221, G211, G115, Z437
- `427` (diag): wanted 427, got 7263, 216, 8122, 869, 7310
- `CAP` (diag): wanted 486, got 7260, 692, 7198, 7278, 7267
- `appy` (diag): wanted 540, got 307, 379, 785, 314, 388
- `fall, fractured hip` (diag): wanted 829, got 821, 808, 823, 812, 824

</details>

<details><summary>hybrid:te3-small-512-syn-ed: 22 misses</summary>

- `I&D` (billing): wanted Z101, got Z506, Z227, Z226, Z106, Z545
- `I+D` (billing): wanted Z101, got Z173, Z227, Z506, Z103, Z174
- `POC removal` (diag): wanted 634, got 706, 930, 388, 614, 879
- `fish hook` (billing): wanted Z114, got H264, E446, Z216, Z324, Z399
- `nursemaid's elbow` (diag): wanted 839, got 351, 555, 616, 245, 8419
- `boxer's fracture` (billing): wanted F008/F009, got F012, F013, F018, F027, F004
- `bleeding after tonsils out` (billing): wanted S066, got S023, Z363, E700, Z162, Z163
- `radial head subluxation` (diag): wanted 839, got 854, 850, 879, 780, 832
- `Weber B` (billing): wanted F074/F075, got G420, R637, Z848, Z866, Z084
- `Weber B` (diag): wanted 829, got 010, 600, 070, 351, 919
- `IAN block` (billing): wanted G250, got G060, G231, G260, G061, G218
- `paronychia` (billing): wanted Z101, got R606, Z129, E561, E318, E576
- `forearm laceration 7cm` (billing): wanted Z175, got Z188, Z187, R024, Z189, Z192
- `delivered a baby in the ED` (billing): wanted P006, got G480, H065, G376, H055, E009
- `rust ring from cornea` (billing): wanted Z847, got S756, F134, E235, Z852, Z848
- `rust ring from cornea` (diag): wanted 930, got 370, 371, 372, 376, 879
- `absess` (billing): wanted Z101, got Z227, Z173, Z174, Z102, Z106
- `epistaxsis` (billing): wanted Z315/Z314, got S756, Z139, E560, Z128, E561
- `back pain` (diag): wanted 724, got 787, 785, 412, 601, 625
- `GI bleed` (diag): wanted 787, got 786, 531, 532, 379, 854
- `BRBPR` (diag): wanted 569, got 669, 600, 492, 426, 427
- `rectal bleeding` (diag): wanted 569, got 455, 626, 640, 786, 287

</details>

