'use strict';
// Validates golden.json against the real code lists and writes
// golden-review.md, a table with code descriptions for manual review.
// Usage: node search-eval/check-golden.js

var fs = require('fs');
var path = require('path');
var billing = require('../netlify/functions/billing');
var diagnose = require('../netlify/functions/diagnose');

var golden = JSON.parse(fs.readFileSync(path.join(__dirname, 'golden.json'), 'utf8'));
var errors = [];
var notInAiList = {};
var seenIds = {};

// diagData.js is a browser script (const DIAG = [...]) with no exports, so
// evaluate it and collect every description per code. It drops leading
// zeros ("53") where diagnose.js keeps them ("053"), so key on the padded form.
function padDiag(c) { return ('000' + c).slice(-Math.max(3, String(c).length)); }
var DIAG = new Function(fs.readFileSync(path.join(__dirname, '..', 'diagData.js'), 'utf8') + '\nreturn DIAG;')();
var fullDiag = {};
DIAG.forEach(function(r) { var k = padDiag(r[0]); (fullDiag[k] = fullDiag[k] || []).push(r[1]); });

var lookup = {
  billing: function(c) { var row = billing.hydrate([c])[0]; return row && row.description; },
  diag: function(c) {
    var row = diagnose.hydrate([c])[0];
    var full = fullDiag[padDiag(c)];
    if (!row && full) notInAiList[c] = true;
    return row ? row.description : full && full.slice(0, 3).join(' / ');
  }
};

function describe(side, codes) {
  return codes.map(function(c) {
    var desc = lookup[side](c);
    if (!desc) { errors.push(side + ' code ' + c + ' does not exist'); return '**' + c + ' (MISSING)**'; }
    return '`' + c + '` ' + desc.replace(/\|/g, '/');
  }).join('<br>');
}

var lines = [
  '# Golden set review',
  '',
  '**Best** = counts as a correct answer. **OK** = fine to show, but not correct on its own. Rows marked ⚠ are judgement calls.',
  ''
];
var counts = { cases: 0, billing: 0, diag: 0, review: 0 };

golden.cases.forEach(function(c) {
  if (seenIds[c.id]) errors.push('duplicate id ' + c.id);
  seenIds[c.id] = true;
  if (!c.billing && !c.diag) errors.push(c.id + ' scores neither side');
  counts.cases++;
  if (c.billing) counts.billing++;
  if (c.diag) counts.diag++;
  if (c.review) counts.review++;
});

['billing', 'diag'].forEach(function(side) {
  lines.push('## ' + (side === 'billing' ? 'Billing' : 'Diagnostic') + ' expectations', '');
  lines.push('| | Query | Tags | Best | OK | Note |', '|---|---|---|---|---|---|');
  golden.cases.forEach(function(c) {
    var exp = c[side];
    if (!exp) return;
    if (!exp.best || !exp.best.length) errors.push(c.id + ' ' + side + ' has no best codes');
    lines.push('| ' + (c.review ? '⚠' : '') + ' | ' + c.q + ' | ' + c.tags.join(', ') + ' | ' +
      describe(side, exp.best) + ' | ' + describe(side, exp.ok || []) + ' | ' + (c.note || '') + ' |');
  });
  lines.push('');
});

fs.writeFileSync(path.join(__dirname, 'golden-review.md'), lines.join('\n'));
console.log(counts.cases + ' cases: ' + counts.billing + ' billing-scored, ' + counts.diag +
  ' diagnostic-scored, ' + counts.review + ' flagged for review');
if (Object.keys(notInAiList).length) {
  console.log('Diagnostic codes the current AI search cannot return (not in diagnose.js): ' +
    Object.keys(notInAiList).join(', '));
}
if (errors.length) {
  console.error('\n' + errors.length + ' problem(s):\n  ' + errors.join('\n  '));
  process.exit(1);
}
console.log('All codes valid. Wrote search-eval/golden-review.md');
