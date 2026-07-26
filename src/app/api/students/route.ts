import { NextResponse } from 'next/server';
import { createClient } from '@libsql/client';

const db = createClient({ url: 'file:dev.db' });

// Đảm bảo bảng tồn tại nếu Prisma push bị lỗi
db.execute(`
  CREATE TABLE IF NOT EXISTS Student (
    id TEXT PRIMARY KEY,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    dob DATETIME NOT NULL,
    gender TEXT NOT NULL,
    classId TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME,
    parentName TEXT,
    parentPhone TEXT,
    parentName2 TEXT,
    parentPhone2 TEXT
  )
`);

export async function GET() {
  try {
    const result = await db.execute('SELECT * FROM Student ORDER BY createdAt DESC');
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { firstName, lastName, dob, gender, classId, parentName, parentPhone, parentName2, parentPhone2 } = await request.json();
    const id = 'st-' + Date.now();
    const dobDate = new Date(dob).toISOString();
    
    await db.execute({
      sql: 'INSERT INTO Student (id, firstName, lastName, dob, gender, classId, parentName, parentPhone, parentName2, parentPhone2, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
      args: [id, firstName, lastName, dobDate, gender, classId || null, parentName, parentPhone, parentName2 || '', parentPhone2 || '']
    });

    // Auto-create Parent User account based on Phone Number
    if (parentPhone) {
      try {
        await db.execute({
          sql: 'INSERT INTO User (id, name, email, password, role, refId, updatedAt) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
          args: ['parent-' + id, parentName, parentPhone, '123456', 'parent', id]
        });
      } catch (err) {
        console.error('Failed to create parent account, might already exist:', err);
      }
    }

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json({ error: 'Failed to create student' }, { status: 500 });
  }
}
