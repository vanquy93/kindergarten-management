import { NextResponse } from 'next/server';
import { createClient } from '@libsql/client';

const db = createClient({ url: 'file:dev.db' });

// Ensure table has imageUrl column
db.execute('ALTER TABLE Message ADD COLUMN imageUrl TEXT').catch(() => {
  // Ignore error if column already exists
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const parentRefId = searchParams.get('parentRefId');
    
    let sql = 'SELECT * FROM Message ORDER BY timestamp DESC LIMIT 50';
    let args: any[] = [];
    
    if (parentRefId) {
      const studentRes = await db.execute({ sql: 'SELECT classId FROM Student WHERE id = ?', args: [parentRefId] });
      const sClassId = studentRes.rows.length > 0 ? studentRes.rows[0].classId : null;
      
      sql = 'SELECT * FROM Message WHERE classId = ? OR classId = ? OR classId = ? ORDER BY timestamp DESC LIMIT 50';
      args = ['all', sClassId, 'individual-' + parentRefId];
    } else if (classId) {
      sql = 'SELECT * FROM Message WHERE classId = ? ORDER BY timestamp DESC LIMIT 50';
      args = [classId];
    }
    
    const result = await db.execute({ sql, args });
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { classId, senderName, senderRole, content, imageUrl } = await request.json();
    
    await db.execute({
      sql: 'INSERT INTO Message (classId, senderName, senderRole, content, imageUrl) VALUES (?, ?, ?, ?, ?)',
      args: [classId, senderName, senderRole, content, imageUrl || null]
    });
    
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 });
  }
}

