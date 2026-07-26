const { createClient } = require('@libsql/client');
const db = createClient({ url: 'file:dev.db' });

async function migrate() {
  try {
    const res = await db.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='MealMenu'");
    console.log("Current schema:", res.rows[0].sql);

    // Create a new table with classId
    await db.execute(`
      CREATE TABLE IF NOT EXISTS MealMenu_v2 (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        classId TEXT NOT NULL,
        date TEXT NOT NULL,
        breakfast TEXT,
        morningSnack TEXT,
        lunch TEXT,
        snack TEXT,
        afternoonSnack TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(classId, date)
      )
    `);

    // Drop old table
    await db.execute("DROP TABLE IF EXISTS MealMenu");
    
    // Rename new table to old table
    await db.execute("ALTER TABLE MealMenu_v2 RENAME TO MealMenu");

    console.log("Migration successful.");
  } catch(e) {
    console.error(e);
  }
}

migrate();
