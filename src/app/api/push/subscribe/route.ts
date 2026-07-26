import { NextResponse } from 'next/server';
import { createClient } from '@libsql/client';

const db = createClient({
  url: 'file:dev.db'
});

export async function POST(req: Request) {
  try {
    const { subscription, role } = await req.json();
    
    // Check if subscription exists based on endpoint
    const existing = await db.execute({
      sql: 'SELECT id FROM PushSubscriptions WHERE endpoint = ?',
      args: [subscription.endpoint]
    });

    if (existing.rows.length === 0) {
      await db.execute({
        sql: 'INSERT INTO PushSubscriptions (id, endpoint, p256dh, auth, role) VALUES (?, ?, ?, ?, ?)',
        args: [
          Math.random().toString(36).substring(7),
          subscription.endpoint,
          subscription.keys.p256dh,
          subscription.keys.auth,
          role || 'parent'
        ]
      });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to subscribe' }, { status: 500 });
  }
}
