const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const vm = require('node:vm');
const path = require('node:path');
function load(relative, overrides = {}) {
  const filename = path.resolve(__dirname, '..', relative);
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const module = { exports: {} };
  const customRequire = name => overrides[name] ?? (name.startsWith('.') ? load(path.relative(path.resolve(__dirname, '..'), path.resolve(path.dirname(filename), name + '.ts')), overrides) : require(name));
  vm.runInThisContext('(function(require,module,exports){' + code + '\n})', { filename })(customRequire, module, module.exports);
  return module.exports;
}
const model = load('src/lib/post-class.ts');
const { summarize } = load('src/lib/post-class-results.ts');
const id = '01234567-89ab-4def-8123-456789abcdef';
function payload(branch = 'unsure') {
  return { anonymousClientId: id, answers: { ...model.emptyAnswers, returned_to_material: branch, formula_context_needs: ['units'], concept_connection_value: 4,
    ...(branch === 'yes' ? { material_actions: ['formula'], return_trigger: 'homework' } : branch === 'no' ? { non_return_reason: 'not_needed' } : {}) } };
}
async function run() {
  assert.deepEqual(model.flow('yes'), [0, 1, 2, 4, 5]);
  assert.deepEqual(model.flow('no'), [0, 3, 4, 5]);
  assert.deepEqual(model.flow('unsure'), [0, 4, 5]);
  for (const branch of ['yes', 'no', 'unsure']) assert.ok(model.parseSubmission(payload(branch)));
  for (const branch of ['no', 'unsure']) {
    const p = payload(branch); p.answers.material_actions = ['garbage']; p.answers.return_trigger = 'garbage';
    const parsed = model.parseSubmission(p); assert.ok(parsed); assert.deepEqual(parsed.answers.material_actions, []); assert.equal(parsed.answers.return_trigger, null);
  }
  for (const invalid of [[], ['units','units'], ['units','when','which'], ['none','units'], ['invalid']]) {
    const p = payload(); p.answers.formula_context_needs = invalid; assert.equal(model.parseSubmission(p), null);
  }
  for (const invalid of [0, 6, 1.5, '4', null]) { const p = payload(); p.answers.concept_connection_value = invalid; assert.equal(model.parseSubmission(p), null); }
  const optional = payload('yes'); optional.answers.material_actions = ['other']; optional.answers.return_trigger = 'other'; optional.answers.formula_context_needs = ['other']; delete optional.answers.other_text; delete optional.answers.concept_connection_example; assert.ok(model.parseSubmission(optional));
  const tooLong = payload(); tooLong.answers.concept_connection_example = 'x'.repeat(801); assert.equal(model.parseSubmission(tooLong), null);
  const incomplete = payload('yes'); incomplete.answers.return_trigger = null; assert.equal(model.parseSubmission(incomplete), null);
  assert.equal(model.parseSubmission({ ...payload(), anonymousClientId: 'not-a-uuid' }), null);
  const old = load('src/lib/survey.ts'); assert.ok(model.questions.every(q => !old.questions.some(previous => previous.prompt === q.prompt)));
  const summary = summarize(['yes','no','unsure'].map(branch => model.parseSubmission(payload(branch)).answers));
  assert.equal(summary.total, 3); assert.equal(summary.yes, 1); assert.equal(summary.average, 4); assert.equal(summary.median, 4);
  assert.equal(summarize([]).median, null);
  assert.equal(summarize([{ ...payload().answers, concept_connection_value: 1 }, { ...payload().answers, concept_connection_value: 4 }]).median, 2.5);
  console.log('PASS: branching, hidden fields, optional text, max-2, exclusive none, validation, experiment separation, statistics');
  if (process.env.PGLITE_PATH) {
    const { PGlite } = require(process.env.PGLITE_PATH);
    const db = new PGlite();
    await db.exec(fs.readFileSync(path.resolve(__dirname, '../db/migrations/004_create_post_class_submissions.sql'), 'utf8'));
    const sql = async (parts, ...params) => {
      const query = parts.reduce((result, part, index) => result + (index ? '$' + index : '') + part, '');
      return (await db.query(query, params)).rows;
    };
    const route = load('src/app/api/submissions/002-post-class-behavior/route.ts', { '../../../../lib/db': { getSql: () => sql } });
    const post = body => route.POST(new Request('http://localhost/api/submissions/002-post-class-behavior', { method: 'POST', body: JSON.stringify(body) }));
    for (const [index, branch] of ['yes','no','unsure'].entries()) {
      const p = payload(branch); p.anonymousClientId = `01234567-89ab-4def-8123-456789abcde${index}`;
      const response = await post(p); assert.equal(response.status, 201); const receipt = await response.json(); assert.ok(receipt.id); assert.ok(receipt.submittedAt);
      assert.equal((await post(p)).status, 409);
    }
    const rows = (await db.query('SELECT * FROM post_class_submissions')).rows; assert.equal(rows.length, 3); assert.ok(rows.every(row => row.experiment_id === model.EXPERIMENT_ID));
    assert.equal(rows.find(row => row.returned_to_material === 'no').return_trigger, null);
    assert.equal((await post({})).status, 400);
    assert.equal((await route.POST(new Request('http://localhost', { method: 'POST', body: '{broken' }))).status, 400);
    const race = payload(); race.anonymousClientId = '01234567-89ab-4def-8123-456789abcde9';
    assert.deepEqual((await Promise.all([post(race), post(race)])).map(r => r.status).sort(), [201, 409]);
    await db.close();
    console.log('PASS: real PostgreSQL migration, API persistence for every branch, receipts, duplicate protection including concurrent submissions, malformed requests');
  }
}
run().catch(error => { console.error(error); process.exitCode = 1; });
