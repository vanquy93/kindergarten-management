import { NextResponse } from 'next/server';
import { createClient } from '@libsql/client';

const db = createClient({ url: 'file:dev.db' });

export async function GET() {
  try {
    const result = await db.execute(`
      SELECT p.*, s.firstName, s.lastName, s.classId, c.name as className 
      FROM Pickup p
      LEFT JOIN Student s ON p.studentId = s.id
      LEFT JOIN Class c ON s.classId = c.id
      ORDER BY p.time DESC
    `);
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch pickups' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { studentId, pickerName, pickerRelation, imageUrl } = await request.json();
    
    await db.execute({
      sql: 'INSERT INTO Pickup (studentId, pickerName, pickerRelation, imageUrl) VALUES (?, ?, ?, ?)',
      args: [studentId, pickerName, pickerRelation, imageUrl || '']
    });
    
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create pickup' }, { status: 500 });
  }
}
