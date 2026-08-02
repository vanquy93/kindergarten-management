const { createClient } = require('@libsql/client');
const db = createClient({ url: 'file:dev.db' });

async function run() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS StudySchedule (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      classId TEXT NOT NULL,
      date TEXT NOT NULL,
      morning TEXT,
      afternoon TEXT,
      UNIQUE(classId, date)
    )
  `);
  console.log('StudySchedule table created successfully');
}

run().catch(console.error);
