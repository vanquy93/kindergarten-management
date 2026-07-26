const { createClient } = require('@libsql/client');
const db = createClient({ url: 'file:dev.db' });
async function run() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS HealthRecord (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      studentId TEXT NOT NULL,
      height TEXT NOT NULL,
      weight TEXT NOT NULL,
      healthStatus TEXT,
      recordedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('HealthRecord table created');
}
run().catch(console.error);
