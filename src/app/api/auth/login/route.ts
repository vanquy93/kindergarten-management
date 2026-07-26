import { NextResponse } from 'next/server';
import { createClient } from '@libsql/client';

const db = createClient({ url: 'file:dev.db' });

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    const result = await db.execute({
      sql: 'SELECT * FROM User WHERE email = ? AND password = ?',
      args: [email, password]
    });
    
    if (result.rows.length > 0) {
      const user = result.rows[0];
      // Don't send password back to client
      delete user.password;
      return NextResponse.json({ success: true, user });
    }
    
    return NextResponse.json({ success: false, error: 'Sai tên đăng nhập hoặc mật khẩu' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
