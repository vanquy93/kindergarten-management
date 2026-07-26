import { NextResponse } from 'next/server';
import { createClient } from '@libsql/client';

const db = createClient({ url: 'file:dev.db' });

export async function PUT(request: Request) {
  try {
    const { email, oldPassword, newPassword } = await request.json();
    
    // Validate old password
    const result = await db.execute({
      sql: 'SELECT * FROM User WHERE email = ? AND password = ?',
      args: [email, oldPassword]
    });
    
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Mật khẩu cũ không chính xác' }, { status: 401 });
    }
    
    // Update new password
    await db.execute({
      sql: 'UPDATE User SET password = ?, updatedAt = CURRENT_TIMESTAMP WHERE email = ?',
      args: [newPassword, email]
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
