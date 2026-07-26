import { NextResponse } from 'next/server';
import { createClient } from '@libsql/client';

const db = createClient({ url: 'file:dev.db' });

export async function GET() {
  try {
    const result = await db.execute(`
      SELECT i.*, s.firstName, s.lastName, s.parentName 
      FROM Invoice i
      LEFT JOIN Student s ON i.studentId = s.id
      ORDER BY i.createdAt DESC
    `);
    
    // Parse items JSON and map status to Vietnamese if it's pending
    const invoices = result.rows.map(r => ({
      ...r,
      status: r.status === 'pending' ? 'Chờ Thanh Toán' : r.status,
      studentName: (r.lastName && r.firstName) ? `${r.lastName} ${r.firstName}` : r.studentId,
      items: JSON.parse(r.items as string)
    }));
    
    return NextResponse.json(invoices);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { studentId, title, items, total } = await request.json();
    const id = '#INV-' + Date.now().toString().slice(-6);
    
    await db.execute({
      sql: 'INSERT INTO Invoice (id, studentId, title, items, total, status) VALUES (?, ?, ?, ?, ?, ?)',
      args: [id, studentId, title, JSON.stringify(items), total, 'Chờ Thanh Toán']
    });
    
    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
  }
}
