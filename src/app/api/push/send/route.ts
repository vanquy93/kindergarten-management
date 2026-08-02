import { NextResponse } from 'next/server';
import { createClient } from '@libsql/client';
import webpush from 'web-push';

const db = createClient({
  url: 'file:dev.db'
});

export async function POST(req: Request) {
  try {
    if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
      webpush.setVapidDetails(
        'mailto:vanquy93mc@gmail.com',
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string,
        process.env.VAPID_PRIVATE_KEY as string
      );
    }
    const { title, message, url, targetRole } = await req.json();

    let sql = 'SELECT * FROM PushSubscriptions';
    let args: any[] = [];
    
    if (targetRole) {
      sql += ' WHERE role = ?';
      args.push(targetRole);
    }

    const subs = await db.execute({ sql, args });

    const payload = JSON.stringify({ title, message, url });

    const promises = subs.rows.map(sub => 
      webpush.sendNotification({
        endpoint: sub.endpoint as string,
        keys: {
          p256dh: sub.p256dh as string,
          auth: sub.auth as string
        }
      }, payload).catch(e => {
        if (e.statusCode === 410) {
          // Xóa thiết bị đã hủy đăng ký
          return db.execute({
            sql: 'DELETE FROM PushSubscriptions WHERE endpoint = ?',
            args: [sub.endpoint]
          });
        }
      })
    );

    await Promise.all(promises);
    return NextResponse.json({ success: true, sent: subs.rows.length });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
