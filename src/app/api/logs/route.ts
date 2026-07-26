import { NextResponse } from 'next/server';
import { createClient } from '@libsql/client';

const db = createClient({ url: 'file:dev.db' });

// Initialize table
db.execute(`
  CREATE TABLE IF NOT EXISTS SystemLog (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT NOT NULL,
    detail TEXT NOT NULL,
    user TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).catch(console.error);

export async function GET() {
  try {
    const result = await db.execute('SELECT * FROM SystemLog ORDER BY timestamp DESC LIMIT 100');
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, detail, user } = body;
    
    await db.execute({
      sql: 'INSERT INTO SystemLog (action, detail, user) VALUES (?, ?, ?)',
      args: [action, detail, user]
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create log' }, { status: 500 });
  }
}
