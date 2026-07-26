const { createClient } = require('@libsql/client');
const db = createClient({ url: 'file:dev.db' });
async function run() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS Pickup (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      studentId TEXT NOT NULL,
      pickerName TEXT NOT NULL,
      pickerRelation TEXT NOT NULL,
      imageUrl TEXT,
      status TEXT DEFAULT 'pending',
      time DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('Pickup table created');
}
run().catch(console.error);
