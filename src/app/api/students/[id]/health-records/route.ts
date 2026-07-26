import { NextResponse } from 'next/server';
import { createClient } from '@libsql/client';

const db = createClient({ url: 'file:dev.db' });

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const result = await db.execute({
      sql: 'SELECT * FROM HealthRecord WHERE studentId = ? ORDER BY recordedAt DESC',
      args: [id]
    });
    
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch health records' }, { status: 500 });
  }
}
