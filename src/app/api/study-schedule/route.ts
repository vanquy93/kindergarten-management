import { NextResponse } from 'next/server';
import { createClient } from '@libsql/client';

const db = createClient({ url: 'file:dev.db' });

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    let query = 'SELECT * FROM StudySchedule ORDER BY id ASC';
    let args: any[] = [];
    if (classId) {
      query = 'SELECT * FROM StudySchedule WHERE classId = ? ORDER BY id ASC';
      args = [classId];
    }
    const result = await db.execute({ sql: query, args });
    const schedules: Record<string, any> = {};
    for (const r of result.rows) {
      schedules[r.date as string] = {
        morning: r.morning,
        afternoon: r.afternoon
      };
    }
    return NextResponse.json(schedules);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch study schedule' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { classId, date, morning, afternoon } = await request.json();
    if (!classId || !date) {
      return NextResponse.json({ error: 'Missing classId or date' }, { status: 400 });
    }
    
    await db.execute({
      sql: `
        INSERT INTO StudySchedule (classId, date, morning, afternoon) 
        VALUES (?, ?, ?, ?)
        ON CONFLICT(classId, date) DO UPDATE SET 
        morning=excluded.morning,
        afternoon=excluded.afternoon
      `,
      args: [classId, date, morning || '', afternoon || '']
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update study schedule' }, { status: 500 });
  }
}
