import { NextResponse } from 'next/server';
import { createClient } from '@libsql/client';

const db = createClient({ url: 'file:dev.db' });

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const result = await db.execute({
      sql: 'SELECT * FROM Student WHERE id = ?',
      args: [id]
    });
    
    if (result.rows.length > 0) {
      return NextResponse.json(result.rows[0]);
    }
    return NextResponse.json({ error: 'Student not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch student' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { classId, height, weight, healthStatus, parentName, parentPhone, parentName2, parentPhone2 } = await request.json();
    
    const updates = [];
    const args = [];
    if (classId !== undefined) { updates.push('classId = ?'); args.push(classId); }
    if (height !== undefined) { updates.push('height = ?'); args.push(height); }
    if (weight !== undefined) { updates.push('weight = ?'); args.push(weight); }
    if (healthStatus !== undefined) { updates.push('healthStatus = ?'); args.push(healthStatus); }
    if (parentName !== undefined) { updates.push('parentName = ?'); args.push(parentName); }
    if (parentPhone !== undefined) { updates.push('parentPhone = ?'); args.push(parentPhone); }
    if (parentName2 !== undefined) { updates.push('parentName2 = ?'); args.push(parentName2); }
    if (parentPhone2 !== undefined) { updates.push('parentPhone2 = ?'); args.push(parentPhone2); }
    
    if (updates.length > 0) {
      args.push(id);
      await db.execute({
        sql: `UPDATE Student SET ${updates.join(', ')} WHERE id = ?`,
        args
      });
    }

    if (height !== undefined || weight !== undefined || healthStatus !== undefined) {
      await db.execute({
        sql: 'INSERT INTO HealthRecord (studentId, height, weight, healthStatus) VALUES (?, ?, ?, ?)',
        args: [id, height || '', weight || '', healthStatus || '']
      });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update student' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.execute({
      sql: 'DELETE FROM Student WHERE id = ?',
      args: [id]
    });
    // Xóa user phụ huynh tương ứng nếu có
    await db.execute({
      sql: 'DELETE FROM User WHERE refId = ?',
      args: [id]
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete student' }, { status: 500 });
  }
}
