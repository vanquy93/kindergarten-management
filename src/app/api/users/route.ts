import { NextResponse } from 'next/server';
import { createClient } from '@libsql/client';

const db = createClient({ url: 'file:dev.db' });

// Ensure User table exists
db.execute(`
  CREATE TABLE IF NOT EXISTS User (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME,
    refId TEXT
  )
`).catch(console.error);

export async function GET() {
  try {
    const result = await db.execute('SELECT id, name, email, role, createdAt FROM User ORDER BY createdAt DESC');
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, role } = body;
    const id = Date.now().toString();
    const updatedAt = new Date().toISOString();
    
    await db.execute({
      sql: 'INSERT INTO User (id, name, email, password, role, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
      args: [id, name, email, password, role, updatedAt]
    });
    
    return NextResponse.json({ success: true, user: { id, name, email, role } });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
