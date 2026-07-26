const { createClient } = require('@libsql/client');
const db = createClient({ url: 'file:dev.db' });
async function run() {
  await db.execute(`CREATE TABLE IF NOT EXISTS Activity (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message TEXT NOT NULL,
    time TEXT NOT NULL,
    type TEXT NOT NULL,
    color TEXT NOT NULL,
    isRead INTEGER DEFAULT 0
  )`);
  await db.execute(`CREATE TABLE IF NOT EXISTS Attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    studentId TEXT NOT NULL,
    date TEXT NOT NULL,
    status TEXT NOT NULL
  )`);
  
  // Insert some seed data for Activity if empty
  const count = await db.execute('SELECT COUNT(*) as count FROM Activity');
  if (count.rows[0].count === 0) {
     await db.execute(`INSERT INTO Activity (message, time, type, color, isRead) VALUES 
       ('Hệ thống Camera AI nhận diện: Phụ huynh bé Na đang ở cổng số 1.', 'Vài giây trước', 'system', '#f44336', 0),
       ('Cô Hương (Lớp Lá 1) đã cập nhật thực đơn trưa và dặn dò phụ huynh.', '10:30', 'meal', '#2196F3', 1)
     `);
  }
  console.log('Tables created successfully.');
}
run().catch(console.error);
