const { createClient } = require('@libsql/client');
const db = createClient({ url: 'file:dev.db' });

async function run() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS WeeklyPlan (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      classId TEXT NOT NULL,
      weekStartDate TEXT NOT NULL,
      theme TEXT,
      planData TEXT,
      UNIQUE(classId, weekStartDate)
    )
  `);
  console.log('WeeklyPlan table created successfully');
}

run().catch(console.error);
