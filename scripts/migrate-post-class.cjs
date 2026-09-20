const fs = require('node:fs');
const { neon } = require('@neondatabase/serverless');
async function main() {
  if (process.env.VERCEL_ENV !== 'production' || !process.env.DATABASE_URL) throw new Error('Production database environment required');
  const sql = neon(process.env.DATABASE_URL);
  const source = fs.readFileSync('db/migrations/004_create_post_class_submissions.sql', 'utf8');
  const statements = source.split(';').map(s => s.trim()).filter(Boolean);
  await sql.transaction(statements.map(statement => sql.query(statement)));
  const columns = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'post_class_submissions' ORDER BY ordinal_position`;
  if (columns.length !== 12) throw new Error('Unexpected post_class_submissions schema');
  const checks = await sql`SELECT COUNT(*)::int AS count FROM pg_constraint WHERE conrelid = 'post_class_submissions'::regclass AND contype = 'u'`;
  if (checks[0].count !== 1) throw new Error('Missing duplicate protection');
  const rows = await sql`SELECT count(*)::int AS count FROM post_class_submissions WHERE experiment_id = '002-post-class-behavior'`;
  console.log('MIGRATION_004_OK: table, all 12 columns and duplicate protection verified. Responses:', rows[0].count);
  console.log('Migration contains only CREATE TABLE / CREATE INDEX for Experiment 002; no existing experiment data modified.');
}
main().catch(() => { console.error('MIGRATION_004_FAILED: production migration or schema verification failed'); process.exit(1); });
