const { createClient } = require('@libsql/client');
const db = createClient({ url: 'file:dev.db' });
async function run() {
  // Table Message
  await db.execute(`
    CREATE TABLE IF NOT EXISTS Message (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      classId TEXT NOT NULL,
      senderName TEXT NOT NULL,
      senderRole TEXT NOT NULL,
      content TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_message_classId ON Message(classId)`);

  // Table Invoice
  await db.execute(`
    CREATE TABLE IF NOT EXISTS Invoice (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      title TEXT NOT NULL,
      items TEXT NOT NULL,
      total INTEGER NOT NULL,
      status TEXT DEFAULT 'pending',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_invoice_studentId ON Invoice(studentId)`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_invoice_status ON Invoice(status)`);

  // Table MealMenu
  await db.execute(`
    CREATE TABLE IF NOT EXISTS MealMenu (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      dayOfWeek TEXT NOT NULL UNIQUE,
      breakfast TEXT,
      morningSnack TEXT,
      lunch TEXT,
      snack TEXT,
      afternoonSnack TEXT
    )
  `);

  // Insert Default Meals if empty
  const res = await db.execute('SELECT COUNT(*) as count FROM MealMenu');
  if (res.rows[0].count === 0) {
    const defaultMeals = [
      ['Thứ 2', 'Phở bò, Sữa tươi', 'Sữa chua', 'Cơm, Thịt kho trứng, Canh rau', 'Bánh canh cua', 'Nước ép dưa hấu'],
      ['Thứ 3', 'Bún mọc, Nước cam', 'Bánh quy', 'Cơm, Cá chiên xù, Canh cải', 'Cháo bồ câu', 'Bánh flan'],
      ['Thứ 4', 'Cháo sườn non', 'Váng sữa', 'Cơm, Gà xào sả, Canh bí đỏ', 'Mì ý sốt bò băm', 'Trái cây theo mùa'],
      ['Thứ 5', 'Bánh cuốn', 'Sữa hạt', 'Cơm, Thịt băm, Canh chua', 'Súp cua trứng cút', 'Chè đậu đỏ'],
      ['Thứ 6', 'Mì Quảng', 'Nước ép táo', 'Cơm, Tôm rim, Canh mồng tơi', 'Bún bò Huế', 'Sữa Milo']
    ];
    for (const meal of defaultMeals) {
      await db.execute({
        sql: 'INSERT INTO MealMenu (dayOfWeek, breakfast, morningSnack, lunch, snack, afternoonSnack) VALUES (?, ?, ?, ?, ?, ?)',
        args: meal
      });
    }
  }

  console.log('Advanced tables and indexes created successfully');
}
run().catch(console.error);
