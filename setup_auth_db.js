const { createClient } = require('@libsql/client');
const db = createClient({ url: 'file:dev.db' });
async function run() {
  try { await db.execute(`ALTER TABLE User ADD COLUMN refId TEXT`); } catch(e) {}
  
  const count = await db.execute("SELECT COUNT(*) as count FROM User WHERE email = 'admin'");
  if (count.rows[0].count === 0) {
    await db.execute(`INSERT INTO User (id, name, email, password, role, updatedAt) VALUES ('admin-1', 'Ban Giám Hiệu', 'admin', 'admin123', 'principal', CURRENT_TIMESTAMP)`);
  }

  try { await db.execute(`ALTER TABLE Student ADD COLUMN height TEXT DEFAULT 'Chưa cập nhật'`); } catch (e) { }
  try { await db.execute(`ALTER TABLE Student ADD COLUMN weight TEXT DEFAULT 'Chưa cập nhật'`); } catch (e) { }
  try { await db.execute(`ALTER TABLE Student ADD COLUMN healthStatus TEXT DEFAULT 'Khỏe mạnh'`); } catch (e) { }

  console.log('Auth DB configured successfully.');
}
run().catch(console.error);
