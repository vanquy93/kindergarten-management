import { NextResponse } from 'next/server';
import { createClient } from '@libsql/client';

const db = createClient({ url: 'file:dev.db' });

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { status } = await request.json();
    
    await db.execute({
      sql: 'UPDATE Invoice SET status = ? WHERE id = ?',
      args: [status, id]
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 });
  }
}
