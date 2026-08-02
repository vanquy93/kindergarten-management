'use client';
import { useState, useEffect } from 'react';

export default function HealthPage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [activeView, setActiveView] = useState('calendar');
  const [selectedMobileDay, setSelectedMobileDay] = useState(0);
  const [formData, setFormData] = useState({ date: new Date().toISOString().split('T')[0], breakfast: '', morningSnack: '', lunch: '', snack: '', afternoonSnack: '' });

  // Trạng thái lưu trữ thực đơn riêng lẻ cho từng ngày trong tuần
  const [weeklyMenus, setWeeklyMenus] = useState<any>({});

  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [userName, setUserName] = useState('');
  const [refId, setRefId] = useState('');

  const fetchMeals = async (cid: string) => {
    if (!cid) return;
    try {
      const res = await fetch(`/api/meals?classId=${cid}`);
      if (res.ok) setWeeklyMenus(await res.json());
    } catch(e) {}
  };

  const [role, setRole] = useState('parent');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const r = localStorage.getItem('userRole') || 'parent';
      const uName = localStorage.getItem('userName') || '';
      const ref = localStorage.getItem('userRefId') || '';
      setRole(r);
      setUserName(uName);
      setRefId(ref);

      Promise.all([
        fetch('/api/classes').then(res => res.json()),
        fetch('/api/students').then(res => res.json())
      ]).then(([clsData, stData]) => {
        setClasses(clsData);
        let defaultClass = '';
        if (r === 'teacher') {
          const tClass = clsData.find((c: any) => (c.teachers || c.teacher || '').includes(uName));
          if (tClass) defaultClass = tClass.id;
        } else if (r === 'parent') {
          const child = stData.find((s: any) => s.id === ref);
          if (child) defaultClass = child.classId;
        } else {
          if (clsData.length > 0) defaultClass = clsData[0].id;
        }
        setSelectedClassId(defaultClass);
        if (defaultClass) fetchMeals(defaultClass);
      });
    }
  }, []);

  useEffect(() => {
    if (selectedClassId) fetchMeals(selectedClassId);
  }, [selectedClassId]);

  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ breakfast: '', morningSnack: '', lunch: '', snack: '', afternoonSnack: '' });

  const getDatesOfWeek = (offset: number) => {
    const curr = new Date();
    const day = curr.getDay();
    const diff = curr.getDate() - day + (day === 0 ? -6 : 1) + (offset * 7); 
    const dates = [];
    for(let i=0; i<5; i++) {
      const d = new Date(curr.setDate(diff + i));
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      dates.push(`${yyyy}-${mm}-${dd}`);
    }
    return dates;
  };

  const dates = getDatesOfWeek(weekOffset);

  const startEdit = (day: string, date: string) => {
    setEditingDay(day);
    setEditingDate(date);
    setEditForm({ 
      breakfast: weeklyMenus[date]?.breakfast || '',
      morningSnack: weeklyMenus[date]?.morningSnack || '',
      lunch: weeklyMenus[date]?.lunch || '',
      snack: weeklyMenus[date]?.snack || '',
      afternoonSnack: weeklyMenus[date]?.afternoonSnack || ''
    });
  };

  const handleSaveMenu = async () => {
    if (!editingDay) return;
    try {
      const res = await fetch('/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId: selectedClassId,
          date: editingDate,
          ...editForm
        })
      });
      if (res.ok) {
        await fetchMeals(selectedClassId);
        setEditingDay(null);
        alert('Cập nhật thực đơn thành công!');
      }
    } catch(e) {}
  };

  const handleAddNewMenu = async () => {
    try {
      const res = await fetch('/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId: selectedClassId,
          ...formData
        })
      });
      if (res.ok) {
        await fetchMeals(selectedClassId);
        alert('Đã cập nhật thực đơn thành công!');
        setActiveView('calendar');
        setFormData({ date: new Date().toISOString().split('T')[0], breakfast: '', morningSnack: '', lunch: '', snack: '', afternoonSnack: '' });
      }
    } catch(e) {}
  };

  const daysOfWeek = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6'];

  return (
    <div>
      <div className="flex-header" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--secondary)', margin: 0, flex: 1 }}>Thực Đơn & Dinh Dưỡng</h2>
          <select 
            className="form-control" 
            style={{ width: '200px', fontWeight: 'bold' }} 
            value={selectedClassId} 
            onChange={e => setSelectedClassId(e.target.value)}
            disabled={role === 'parent' || role === 'teacher'}
          >
            <option value="">-- Chọn Lớp --</option>
            {classes.map(c => <option key={c.id} value={c.id}>Lớp {c.name}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
          <button className="btn-secondary" onClick={() => setActiveView('calendar')} style={{ background: activeView === 'calendar' ? 'var(--primary)' : 'white', color: activeView === 'calendar' ? 'white' : 'var(--text-main)', border: activeView === 'calendar' ? 'none' : '1px solid rgba(0,0,0,0.1)' }}>📅 Lịch 7 Ngày</button>
          {role !== 'parent' && (
          <button className="btn-primary" onClick={() => setActiveView('add')}>+ Thêm Thực Đơn</button>
          )}
        </div>
      </div>

      {activeView === 'add' ? (
        <div className="glass-panel" style={{ background: 'white', borderRadius: '16px', padding: '2.5rem', maxWidth: '600px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginTop: 0, color: 'var(--primary)', marginBottom: '2rem' }}>Cập Nhật Thực Đơn Mới</h3>
          <div className="input-group">
            <label>Áp dụng cho ngày</label>
            <input type="date" className="form-control" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
          </div>
          <div className="input-group">
            <label>Bữa Sáng (7:30 - 8:00)</label>
            <textarea className="form-control" value={formData.breakfast} onChange={e => setFormData({...formData, breakfast: e.target.value})} placeholder="Món ăn..." style={{ height: '50px', resize: 'none' }}></textarea>
          </div>
          <div className="input-group">
            <label>Bữa Phụ Sáng (9:30 - 10:00)</label>
            <textarea className="form-control" value={formData.morningSnack} onChange={e => setFormData({...formData, morningSnack: e.target.value})} placeholder="Món ăn..." style={{ height: '50px', resize: 'none' }}></textarea>
          </div>
          <div className="input-group">
            <label>Bữa Trưa (11:00 - 11:30)</label>
            <textarea className="form-control" value={formData.lunch} onChange={e => setFormData({...formData, lunch: e.target.value})} placeholder="Món ăn..." style={{ height: '50px', resize: 'none' }}></textarea>
          </div>
          <div className="input-group">
            <label>Bữa Xế (14:30 - 15:00)</label>
            <textarea className="form-control" value={formData.snack} onChange={e => setFormData({...formData, snack: e.target.value})} placeholder="Món ăn..." style={{ height: '50px', resize: 'none' }}></textarea>
          </div>
          <div className="input-group" style={{ marginBottom: '2.5rem' }}>
            <label>Bữa Phụ Chiều (15:45 - 16:15)</label>
            <textarea className="form-control" value={formData.afternoonSnack} onChange={e => setFormData({...formData, afternoonSnack: e.target.value})} placeholder="Món ăn..." style={{ height: '50px', resize: 'none' }}></textarea>
          </div>
          <button className="btn-primary" onClick={handleAddNewMenu} style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}>Thêm / Cập Nhật Thực Đơn</button>
        </div>
      ) : (
      <div>
        <div className="flex-header" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)', color: 'white', padding: '1.2rem', borderRadius: '16px', marginBottom: '2rem', fontWeight: 600, fontSize: '1.1rem', boxShadow: '0 10px 20px rgba(255,123,84,0.3)', textAlign: 'center' }}>
          <button onClick={() => setWeekOffset(weekOffset - 1)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s', width: '100%' }}>&laquo; Trước</button>
          <span style={{ width: '100%' }}>📍 Tuần {weekOffset === 0 ? 'Hiện Tại' : (weekOffset > 0 ? `Tới (+${weekOffset})` : `Trước (${weekOffset})`)}</span>
          <button onClick={() => setWeekOffset(weekOffset + 1)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s', width: '100%' }}>Sau &raquo;</button>
        </div>
        
        {/* MOBILE DAY SELECTOR */}
        <div className="mobile-only" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '1rem', scrollbarWidth: 'none' }}>
            {daysOfWeek.map((d, i) => (
              <button 
                key={d} 
                onClick={() => setSelectedMobileDay(i)} 
                style={{ padding: '0.5rem 1rem', borderRadius: '20px', background: selectedMobileDay === i ? 'var(--primary)' : 'white', color: selectedMobileDay === i ? 'white' : 'var(--secondary)', border: '1px solid rgba(0,0,0,0.1)', fontWeight: 'bold', whiteSpace: 'nowrap' }}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
          {daysOfWeek.map((day, idx) => {
            const isEditing = editingDay === day;
            const isVisibleOnMobile = idx === selectedMobileDay;
            
            return (
              <div key={day} className={`glass-panel ${!isVisibleOnMobile ? 'desktop-only' : ''}`} style={{ background: 'white', borderRadius: '16px', borderTop: `4px solid ${idx % 2 === 0 ? 'var(--primary)' : 'var(--accent)'}`, padding: '1.5rem', transition: 'all 0.3s', boxShadow: isEditing ? '0 10px 30px rgba(255,123,84,0.15)' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0, color: 'var(--secondary)' }}>{day} <span style={{fontSize:'0.9rem', color:'var(--text-muted)'}}>({dates[idx].split('-').reverse().join('/')})</span></h3>
                  {role !== 'parent' && (
                    isEditing ? (
                      <button onClick={handleSaveMenu} style={{ background: '#4CAF50', color: 'white', border: 'none', padding: '0.4rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Hoàn thành</button>
                    ) : (
                      <button onClick={() => startEdit(day, dates[idx])} style={{ background: 'rgba(255,123,84,0.1)', color: 'var(--primary)', border: 'none', padding: '0.4rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Sửa</button>
                    )
                  )}
                </div>
                
                <div style={{ padding: '0.4rem 0' }}>
                  <p style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem', letterSpacing: '1px' }}>SÁNG (7:30 - 8:00)</p>
                  {isEditing ? (
                    <textarea className="form-control" value={editForm.breakfast} onChange={e => setEditForm({...editForm, breakfast: e.target.value})} style={{ height: '40px', width: '100%', resize: 'none', padding: '0.5rem', fontSize: '0.9rem' }}></textarea>
                  ) : (
                    <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-main)' }}>{weeklyMenus[dates[idx]]?.breakfast || 'Chưa cập nhật'}</p>
                  )}
                </div>

                <div style={{ padding: '0.4rem 0' }}>
                  <p style={{ color: '#FF9800', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem', letterSpacing: '1px' }}>PHỤ SÁNG (9:30 - 10:00)</p>
                  {isEditing ? (
                    <textarea className="form-control" value={editForm.morningSnack} onChange={e => setEditForm({...editForm, morningSnack: e.target.value})} style={{ height: '40px', width: '100%', resize: 'none', padding: '0.5rem', fontSize: '0.9rem' }}></textarea>
                  ) : (
                    <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-main)' }}>{weeklyMenus[dates[idx]]?.morningSnack || 'Chưa cập nhật'}</p>
                  )}
                </div>
                
                <div style={{ padding: '0.4rem 0' }}>
                  <p style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem', letterSpacing: '1px' }}>TRƯA (11:00 - 11:30)</p>
                  {isEditing ? (
                    <textarea className="form-control" value={editForm.lunch} onChange={e => setEditForm({...editForm, lunch: e.target.value})} style={{ height: '40px', width: '100%', resize: 'none', padding: '0.5rem', fontSize: '0.9rem' }}></textarea>
                  ) : (
                    <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-main)' }}>{weeklyMenus[dates[idx]]?.lunch || 'Chưa cập nhật'}</p>
                  )}
                </div>
                
                <div style={{ padding: '0.4rem 0' }}>
                  <p style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem', letterSpacing: '1px' }}>XẾ (14:30 - 15:00)</p>
                  {isEditing ? (
                    <textarea className="form-control" value={editForm.snack} onChange={e => setEditForm({...editForm, snack: e.target.value})} style={{ height: '40px', width: '100%', resize: 'none', padding: '0.5rem', fontSize: '0.9rem' }}></textarea>
                  ) : (
                    <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-main)' }}>{weeklyMenus[dates[idx]]?.snack || 'Chưa cập nhật'}</p>
                  )}
                </div>

                <div style={{ padding: '0.4rem 0' }}>
                  <p style={{ color: '#FF9800', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem', letterSpacing: '1px' }}>PHỤ CHIỀU (15:45 - 16:15)</p>
                  {isEditing ? (
                    <textarea className="form-control" value={editForm.afternoonSnack} onChange={e => setEditForm({...editForm, afternoonSnack: e.target.value})} style={{ height: '40px', width: '100%', resize: 'none', padding: '0.5rem', fontSize: '0.9rem' }}></textarea>
                  ) : (
                    <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-main)' }}>{weeklyMenus[dates[idx]]?.afternoonSnack || 'Chưa cập nhật'}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      )}
    </div>
  );
}
