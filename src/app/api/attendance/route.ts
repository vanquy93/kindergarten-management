import { NextResponse } from 'next/server';
import { createClient } from '@libsql/client';

const db = createClient({ url: 'file:dev.db' });

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    
    const result = await db.execute({
      sql: 'SELECT * FROM Attendance WHERE date = ?',
      args: [date]
    });
    
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { studentId, date, status } = await request.json();
    
    // Upsert logic (if exists, update, else insert)
    const existing = await db.execute({
      sql: 'SELECT id FROM Attendance WHERE studentId = ? AND date = ?',
      args: [studentId, date]
    });

    if (existing.rows.length > 0) {
      await db.execute({
        sql: 'UPDATE Attendance SET status = ? WHERE id = ?',
        args: [status, existing.rows[0].id]
      });
    } else {
      await db.execute({
        sql: 'INSERT INTO Attendance (studentId, date, status) VALUES (?, ?, ?)',
        args: [studentId, date, status]
      });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save attendance' }, { status: 500 });
  }
}
