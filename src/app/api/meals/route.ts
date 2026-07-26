import { NextResponse } from 'next/server';
import { createClient } from '@libsql/client';

const db = createClient({ url: 'file:dev.db' });

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    let query = 'SELECT * FROM MealMenu ORDER BY id ASC';
    let args: any[] = [];
    if (classId) {
      query = 'SELECT * FROM MealMenu WHERE classId = ? ORDER BY id ASC';
      args = [classId];
    }
    const result = await db.execute({ sql: query, args });
    const menus: Record<string, any> = {};
    for (const r of result.rows) {
      menus[r.date as string] = {
        breakfast: r.breakfast,
        morningSnack: r.morningSnack,
        lunch: r.lunch,
        snack: r.snack,
        afternoonSnack: r.afternoonSnack
      };
    }
    return NextResponse.json(menus);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch meals' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { date, breakfast, morningSnack, lunch, snack, afternoonSnack, classId } = await request.json();
    if (!classId) return NextResponse.json({ error: 'Missing classId' }, { status: 400 });
    
    await db.execute({
      sql: `
        INSERT INTO MealMenu (classId, date, breakfast, morningSnack, lunch, snack, afternoonSnack) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(classId, date) DO UPDATE SET 
        breakfast=excluded.breakfast,
        morningSnack=excluded.morningSnack,
        lunch=excluded.lunch,
        snack=excluded.snack,
        afternoonSnack=excluded.afternoonSnack
      `,
      args: [classId, date, breakfast, morningSnack, lunch, snack, afternoonSnack]
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update meal' }, { status: 500 });
  }
}
