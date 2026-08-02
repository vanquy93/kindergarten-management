'use client';
import { useState, useEffect } from 'react';

export default function AttendancePage() {
  const [filterType, setFilterType] = useState('class'); // 'class' | 'teacher'
  const [filterValue, setFilterValue] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const [dbStudents, setDbStudents] = useState<any[]>([]);
  const [dbClasses, setDbClasses] = useState<any[]>([]);
  const [dbTeachers, setDbTeachers] = useState<any[]>([]);

  const [role, setRole] = useState('parent');
  const [refId, setRefId] = useState('');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setRole(localStorage.getItem('userRole') || 'parent');
      setRefId(localStorage.getItem('userRefId') || '');
      setUserName(localStorage.getItem('userName') || '');
    }
    const fetchData = async () => {
      try {
        const [resSt, resCl, resTe] = await Promise.all([
          fetch('/api/students'), fetch('/api/classes'), fetch('/api/teachers')
        ]);
        if (resSt.ok) setDbStudents(await resSt.json());
        if (resCl.ok) setDbClasses(await resCl.json());
        if (resTe.ok) setDbTeachers(await resTe.json());
      } catch (error) { console.error('Failed to fetch data', error); }
    };
    fetchData();
  }, []);

  const [localAttendance, setLocalAttendance] = useState<Record<string, { checkIn: string, checkOut: string, date: string }>>({});

  const [toast, setToast] = useState('');

  const showNoti = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleCheckIn = (id: string, name: string, className: string) => {
    const time = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    setLocalAttendance(prev => ({
      ...prev, [id]: { ...prev[id], checkIn: time, date: selectedDate }
    }));
    
    fetch('/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: id, date: selectedDate, status: 'Đến' })
    }).catch(console.error);

    fetch('/api/activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `Đã điểm danh ĐẾN cho bé ${name} (${className})`,
        type: 'attendance',
        color: '#4CAF50'
      })
    }).catch(console.error);

    showNoti(`✅ Đã gửi Zalo: Bé đến lớp lúc ${time} ngày ${selectedDate}`);
  };

  const handleCheckOut = (id: string, name: string, className: string) => {
    const time = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    setLocalAttendance(prev => ({
      ...prev, [id]: { ...prev[id], checkOut: time, date: selectedDate }
    }));
    
    fetch('/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: id, date: selectedDate, status: 'Về' })
    }).catch(console.error);

    fetch('/api/activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `Đã điểm danh VỀ cho bé ${name} (${className})`,
        type: 'attendance',
        color: '#FF9800'
      })
    }).catch(console.error);

    showNoti(`✅ Đã gửi Zalo: Bé đã về lúc ${time} ngày ${selectedDate}`);
  };

  // Lọc danh sách
  const displayStudents = dbStudents.map(s => {
    const sClass = dbClasses.find(c => c.id === s.classId);
    return {
      ...s,
      className: sClass ? sClass.name : 'Chưa xếp lớp',
      teacherName: sClass ? sClass.teachers : 'Chưa có GV'
    };
  }).filter(s => {
    if (role === 'parent' && s.id != refId) return false;
    if (role === 'teacher' && !s.teacherName?.includes(userName)) return false;

    if (filterValue !== 'all') {
      if (filterType === 'class' && s.classId !== filterValue) return false;
      if (filterType === 'teacher' && !s.teacherName?.includes(filterValue)) return false;
    }
    return true;
  });

  return (
    <div style={{ position: 'relative' }}>
      {toast && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', background: '#4CAF50', color: 'white', padding: '1rem 2rem', borderRadius: '50px', boxShadow: '0 10px 30px rgba(76,175,80,0.3)', zIndex: 1000, animation: 'fadeInUp 0.3s ease-out forwards', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
          {toast}
        </div>
      )}
      
      <div className="flex-header" style={{ marginBottom: '2rem' }}>
        <h2 className="page-title">Điểm Danh & Giao Trả</h2>
        
        <div className="flex-header" style={{ width: '100%' }}>
          <input type="date" className="form-control" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} style={{ padding: '0.6rem 1rem', width: '100%' }} />
          
          <select className="form-control" value={filterType} onChange={e => { setFilterType(e.target.value); setFilterValue('all'); }} style={{ width: '100%' }}>
            <option value="class">Lọc theo Lớp</option>
            <option value="teacher">Lọc theo Giáo Viên</option>
          </select>

          {filterType === 'class' ? (
            <select className="form-control" value={filterValue} onChange={e => setFilterValue(e.target.value)} style={{ width: '100%' }}>
              <option value="all">Tất cả các lớp</option>
              {dbClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          ) : (
            <select className="form-control" value={filterValue} onChange={e => setFilterValue(e.target.value)} style={{ width: '100%' }}>
              <option value="all">Tất cả giáo viên</option>
              {dbTeachers.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
            </select>
          )}
        </div>
      </div>

      <div className="glass-panel" style={{ background: 'white', padding: '0', overflow: 'hidden', borderRadius: '16px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(0,0,0,0.02)', textAlign: 'left', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
              <th style={{ padding: '1.2rem', color: 'var(--text-muted)' }}>Học Sinh</th>
              <th style={{ padding: '1.2rem', color: 'var(--text-muted)' }}>Thông tin nhóm</th>
              <th style={{ padding: '1.2rem', color: 'var(--text-muted)' }}>Check-in</th>
              <th style={{ padding: '1.2rem', color: 'var(--text-muted)' }}>Check-out</th>
              <th style={{ padding: '1.2rem', color: 'var(--text-muted)' }}>Hành Động ({selectedDate})</th>
            </tr>
          </thead>
          <tbody>
            {displayStudents.map(s => {
              const record = localAttendance[s.id] || {};
              const isToday = record.date === selectedDate;
              const displayCheckIn = isToday ? record.checkIn : '';
              const displayCheckOut = isToday ? record.checkOut : '';

              return (
                <tr key={s.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                  <td data-label="Học Sinh" style={{ padding: '1.2rem', fontWeight: 600 }}>{s.lastName} {s.firstName}</td>
                  <td data-label="Thông tin nhóm" style={{ padding: '1.2rem' }}>
                    <div style={{ color: 'var(--primary)', fontWeight: 600 }}>{s.className}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>GV: {s.teacherName}</div>
                  </td>
                  <td data-label="Check-in" style={{ padding: '1.2rem' }}>
                    {displayCheckIn ? <span style={{ color: '#4CAF50', fontWeight: 'bold', background: 'rgba(76,175,80,0.1)', padding: '0.3rem 0.8rem', borderRadius: '50px' }}>{displayCheckIn}</span> : <span style={{ color: 'var(--text-muted)' }}>---</span>}
                  </td>
                  <td data-label="Check-out" style={{ padding: '1.2rem' }}>
                    {displayCheckOut ? <span style={{ color: '#E91E63', fontWeight: 'bold', background: 'rgba(233,30,99,0.1)', padding: '0.3rem 0.8rem', borderRadius: '50px' }}>{displayCheckOut}</span> : <span style={{ color: 'var(--text-muted)' }}>---</span>}
                  </td>
                  {role !== 'parent' ? (
                    <td data-label="Hành Động" style={{ padding: '1.2rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', width: '100%' }}>
                        <button onClick={() => handleCheckIn(s.id, s.lastName + ' ' + s.firstName, s.className)} disabled={!!displayCheckIn} style={{ flex: 1, padding: '0.6rem 0.5rem', background: displayCheckIn ? '#f0f0f0' : '#4CAF50', color: displayCheckIn ? '#aaa' : 'white', border: 'none', borderRadius: '8px', cursor: displayCheckIn ? 'not-allowed' : 'pointer', fontWeight: 600, transition: 'var(--transition)' }}>Đến</button>
                        <button onClick={() => handleCheckOut(s.id, s.lastName + ' ' + s.firstName, s.className)} disabled={!displayCheckIn || !!displayCheckOut} style={{ flex: 1, padding: '0.6rem 0.5rem', background: !displayCheckIn || !!displayCheckOut ? '#f0f0f0' : '#FF9800', color: !displayCheckIn || !!displayCheckOut ? '#aaa' : 'white', border: 'none', borderRadius: '8px', cursor: !displayCheckIn || !!displayCheckOut ? 'not-allowed' : 'pointer', fontWeight: 600, transition: 'var(--transition)' }}>Về</button>
                      </div>
                    </td>
                  ) : (
                    <td data-label="Trạng thái" style={{ padding: '1.2rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Chỉ xem</span>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
