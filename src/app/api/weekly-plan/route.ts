import { NextResponse } from 'next/server';
import { createClient } from '@libsql/client';

const db = createClient({ url: 'file:dev.db' });

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const weekStartDate = searchParams.get('weekStartDate');
    
    if (!classId || !weekStartDate) {
      return NextResponse.json({ error: 'Missing classId or weekStartDate' }, { status: 400 });
    }
    
    const query = 'SELECT * FROM WeeklyPlan WHERE classId = ? AND weekStartDate = ?';
    const result = await db.execute({ sql: query, args: [classId, weekStartDate] });
    
    if (result.rows.length > 0) {
      return NextResponse.json({
        theme: result.rows[0].theme,
        planData: JSON.parse(result.rows[0].planData as string)
      });
    } else {
      return NextResponse.json({ theme: '', planData: [] });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch weekly plan' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { classId, weekStartDate, theme, planData } = await request.json();
    if (!classId || !weekStartDate) {
      return NextResponse.json({ error: 'Missing classId or weekStartDate' }, { status: 400 });
    }
    
    const planDataStr = JSON.stringify(planData || []);
    
    await db.execute({
      sql: `
        INSERT INTO WeeklyPlan (classId, weekStartDate, theme, planData) 
        VALUES (?, ?, ?, ?)
        ON CONFLICT(classId, weekStartDate) DO UPDATE SET 
        theme=excluded.theme,
        planData=excluded.planData
      `,
      args: [classId, weekStartDate, theme || '', planDataStr]
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update weekly plan' }, { status: 500 });
  }
}
