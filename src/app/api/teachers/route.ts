import { NextResponse } from 'next/server';
import { createClient } from '@libsql/client';

const db = createClient({ url: 'file:dev.db' });

// Initialize Teacher table
db.execute(`
  CREATE TABLE IF NOT EXISTS Teacher (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    dob DATETIME NOT NULL,
    phone TEXT NOT NULL,
    specialty TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

export async function GET() {
  try {
    const result = await db.execute('SELECT * FROM Teacher ORDER BY createdAt DESC');
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return NextResponse.json({ error: 'Failed to fetch teachers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, dob, phone, specialty } = body;
    
    const id = Math.random().toString(36).substring(2, 15);
    const dobDate = new Date(dob).toISOString();
    
    await db.execute({
      sql: 'INSERT INTO Teacher (id, name, dob, phone, specialty) VALUES (?, ?, ?, ?, ?)',
      args: [id, name, dobDate, phone, specialty]
    });
    
    // Tự động tạo tài khoản cho Giáo viên
    if (phone) {
      try {
        await db.execute({
          sql: 'INSERT INTO User (id, name, email, password, role, refId, updatedAt) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
          args: ['teacher-' + id, name, phone, '123456', 'teacher', id]
        });
      } catch (e) {
        console.error('Lỗi khi tạo tài khoản GV:', e);
      }
    }
    
    return NextResponse.json({ id, name, dob: dobDate, phone, specialty }, { status: 201 });
  } catch (error) {
    console.error('Error creating teacher:', error);
    return NextResponse.json({ error: 'Failed to create teacher' }, { status: 500 });
  }
}
