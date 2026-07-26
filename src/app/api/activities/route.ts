import { NextResponse } from 'next/server';
import { createClient } from '@libsql/client';

const db = createClient({ url: 'file:dev.db' });

export async function GET() {
  try {
    const result = await db.execute('SELECT * FROM Activity ORDER BY id DESC LIMIT 20');
    const unreadRes = await db.execute('SELECT COUNT(*) as count FROM Activity WHERE isRead = 0');
    
    return NextResponse.json({
      activities: result.rows,
      unreadCount: unreadRes.rows[0].count
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { message, type, color } = await request.json();
    const time = new Date().toLocaleTimeString('vi-VN') + ' - ' + new Date().toLocaleDateString('vi-VN');
    
    await db.execute({
      sql: 'INSERT INTO Activity (message, time, type, color, isRead) VALUES (?, ?, ?, ?, 0)',
      args: [message, time, type, color]
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create activity' }, { status: 500 });
  }
}

export async function PUT() {
  try {
    await db.execute('UPDATE Activity SET isRead = 1');
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to mark read' }, { status: 500 });
  }
}
