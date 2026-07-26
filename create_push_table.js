const { createClient } = require('@libsql/client');

const client = createClient({
  url: 'file:dev.db'
});

async function setup() {
  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS PushSubscriptions (
        id TEXT PRIMARY KEY,
        endpoint TEXT NOT NULL,
        p256dh TEXT NOT NULL,
        auth TEXT NOT NULL,
        role TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Đã tạo bảng PushSubscriptions thành công.");
  } catch (error) {
    console.error("Lỗi:", error);
  }
}

setup();
