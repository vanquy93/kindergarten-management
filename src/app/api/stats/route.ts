import { NextResponse } from 'next/server';
import { createClient } from '@libsql/client';

const db = createClient({ url: 'file:dev.db' });

export async function GET() {
  try {
    const studentsRes = await db.execute('SELECT COUNT(*) as count FROM Student');
    const teachersRes = await db.execute('SELECT COUNT(*) as count FROM Teacher');
    const classesRes = await db.execute('SELECT COUNT(*) as count FROM Class');

    const stats = {
      students: studentsRes.rows[0].count,
      teachers: teachersRes.rows[0].count,
      classes: classesRes.rows[0].count,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
