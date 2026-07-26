import { NextResponse } from 'next/server';
import { createClient } from '@libsql/client';

const db = createClient({ url: 'file:dev.db' });

// Initialize Class table
db.execute(`
  CREATE TABLE IF NOT EXISTS Class (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    grade TEXT NOT NULL,
    teachers TEXT NOT NULL,
    ageGroup TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

export async function GET() {
  try {
    const result = await db.execute('SELECT * FROM Class ORDER BY createdAt DESC');
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json({ error: 'Failed to fetch classes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, grade, teachers, ageGroup } = body;
    
    const id = Math.random().toString(36).substring(2, 15);
    
    await db.execute({
      sql: 'INSERT INTO Class (id, name, grade, teachers, ageGroup, updatedAt) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
      args: [id, name, grade, teachers, ageGroup || null]
    });
    
    return NextResponse.json({ id, name, grade, teachers, ageGroup }, { status: 201 });
  } catch (error) {
    console.error('Error creating class:', error);
    return NextResponse.json({ error: 'Failed to create class' }, { status: 500 });
  }
}
