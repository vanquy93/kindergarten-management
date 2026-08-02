'use client';
import { useState, useEffect } from 'react';

export default function ClassesPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeClass, setActiveClass] = useState<any>(null);
  const [newClassForm, setNewClassForm] = useState({ name: '', grade: 'Mầm', selectedTeachers: [] as string[], ageGroup: '3-4 tuổi' });

  const [role, setRole] = useState('parent');
  const [refId, setRefId] = useState('');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setRole(localStorage.getItem('userRole') || 'parent');
      setRefId(localStorage.getItem('userRefId') || '');
      setUserName(localStorage.getItem('userName') || '');
    }
  }, []);

  const fetchData = async () => {
    try {
      const [resClasses, resStudents, resTeachers] = await Promise.all([
        fetch('/api/classes'),
        fetch('/api/students'),
        fetch('/api/teachers')
      ]);
      if (resClasses.ok) setClasses(await resClasses.json());
      if (resStudents.ok) setStudents(await resStudents.json());
      if (resTeachers.ok) setTeachers(await resTeachers.json());
    } catch (error) {
      console.error('Failed to fetch data', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddClass = async () => {
    if (!newClassForm.name || newClassForm.selectedTeachers.length === 0) return alert('Vui lòng nhập tên lớp và chọn ít nhất 1 giáo viên!');
    
    // Tìm tên giáo viên từ id để lưu (trong db chúng ta lưu chuỗi tên cho đơn giản hiển thị)
    const combinedTeachers = teachers.filter(t => newClassForm.selectedTeachers.includes(t.id)).map(t => t.name).join(', ');
    
    try {
      const res = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newClassForm.name, grade: newClassForm.grade, teachers: combinedTeachers, ageGroup: newClassForm.ageGroup })
      });
      if (res.ok) {
        await fetchData();
        setIsModalOpen(false);
        setNewClassForm({ name: '', grade: 'Mầm', selectedTeachers: [], ageGroup: '3-4 tuổi' });
      }
    } catch (e) {
      alert('Lỗi tạo lớp');
    }
  };

  const [showAddStudent, setShowAddStudent] = useState(false);
  const [selectedNewStudent, setSelectedNewStudent] = useState('');

  const classStudents = activeClass ? students.filter(s => s.classId === activeClass.id) : [];
  const unassignedStudents = students.filter(s => !s.classId);

  const handleAddStudentToClass = async () => {
    if (!selectedNewStudent || !activeClass) return;
    try {
      const res = await fetch(`/api/students/${selectedNewStudent}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classId: activeClass.id })
      });
      if (res.ok) {
        await fetchData();
        setShowAddStudent(false);
        setSelectedNewStudent('');
      }
    } catch (e) {
      alert('Lỗi thêm học sinh');
    }
  };
  const [posts, setPosts] = useState([
    { id: 1, author: 'Cô Hương', time: 'Hôm nay lúc 10:30', content: 'Các con đang thực hành vẽ tranh phong cảnh 🎨', likes: 12, liked: false, comments: [{ author: 'Mẹ Bảo Minh', text: 'Các con ngoan quá!' }] },
    { id: 2, author: 'Cô Hương', time: 'Hôm qua lúc 15:00', content: 'Giờ ăn xế ngon miệng của lớp Lá 1 😋 Cảm ơn các cô bếp.', likes: 25, liked: true, comments: [] }
  ]);
  const [newComment, setNewComment] = useState('');

  const handleLike = (id: number) => {
    setPosts(posts.map(p => p.id === id ? { ...p, likes: p.liked ? p.likes - 1 : p.likes + 1, liked: !p.liked } : p));
  };

  const handleAddComment = (id: number, e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setPosts(posts.map(p => p.id === id ? { ...p, comments: [...p.comments, { author: 'Tôi', text: newComment }] } : p));
    setNewComment('');
  };

  if (!activeClass) {
    return (
      <div>
        <div className="flex-header" style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--secondary)', margin: 0 }}>Quản Lý Lớp Học</h2>
          {(role === 'principal' || role === 'vice_principal') && (
            <button className="btn-primary" onClick={() => setIsModalOpen(true)} style={{ width: '100%', padding: '0.8rem 1.5rem', borderRadius: '12px' }}>+ Thêm Lớp Mới</button>
          )}
        </div>
        <div className="glass-panel" style={{ background: 'white', padding: '0', overflow: 'hidden', borderRadius: '16px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.02)', borderBottom: '1px solid rgba(0,0,0,0.05)', textAlign: 'left' }}>
                <th style={{ padding: '1.2rem', fontWeight: 600, color: 'var(--text-muted)' }}>Tên Lớp</th>
                <th style={{ padding: '1.2rem', fontWeight: 600, color: 'var(--text-muted)' }}>Khối</th>
                <th style={{ padding: '1.2rem', fontWeight: 600, color: 'var(--text-muted)' }}>Giáo Viên</th>
                <th style={{ padding: '1.2rem', fontWeight: 600, color: 'var(--text-muted)' }}>Sỉ Số</th>
                <th style={{ padding: '1.2rem', fontWeight: 600, color: 'var(--text-muted)' }}>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {classes.filter(c => {
                if (role === 'parent') {
                  const s = students.find(st => st.id == refId);
                  return s && s.classId == c.id;
                }
                if (role === 'teacher') {
                  return (c.teachers || c.teacher || '').includes(userName);
                }
                return true;
              }).map((c) => {
                const count = students.filter(s => s.classId === c.id).length;
                return (
                  <tr key={c.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                    <td data-label="Tên Lớp" style={{ padding: '1.2rem', fontWeight: 600, color: 'var(--secondary)' }}>{c.name}</td>
                    <td data-label="Khối" style={{ padding: '1.2rem' }}><span style={{ padding: '0.4rem 1rem', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 600, background: 'rgba(33, 150, 243, 0.1)', color: '#2196F3' }}>{c.grade}</span></td>
                    <td data-label="Giáo Viên" style={{ padding: '1.2rem' }}>{c.teachers || c.teacher}</td>
                    <td data-label="Sỉ Số" style={{ padding: '1.2rem', fontWeight: 600, color: 'var(--primary)' }}>{count} bé</td>
                    <td data-label="Hành Động" style={{ padding: '1.2rem' }}>
                      <button onClick={() => setActiveClass(c)} style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600, padding: '0.5rem 1.2rem', borderRadius: '8px', width: '100%' }}>Chi tiết</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {isModalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }}>
            <div className="glass-panel" style={{ background: 'white', width: '100%', maxWidth: '500px', padding: '1.5rem', borderRadius: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', maxHeight: '90vh', overflowY: 'auto' }}>
              <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--secondary)', fontSize: '1.5rem' }}>Thêm Lớp Học Mới</h3>
              
              <div className="input-group">
                <label>Tên Lớp (VD: Mầm 2)</label>
                <input type="text" className="form-control" value={newClassForm.name} onChange={e => setNewClassForm({...newClassForm, name: e.target.value})} placeholder="Nhập tên lớp..." />
              </div>
              <div className="input-group">
                <label>Khối Lớp</label>
                <select className="form-control" value={newClassForm.grade} onChange={e => setNewClassForm({...newClassForm, grade: e.target.value})}>
                  <option value="Mầm">Khối Mầm</option>
                  <option value="Chồi">Khối Chồi</option>
                  <option value="Lá">Khối Lá</option>
                </select>
              </div>
              <div className="input-group">
                <label>Độ Tuổi (VD: 3-4 tuổi)</label>
                <input type="text" className="form-control" value={newClassForm.ageGroup} onChange={e => setNewClassForm({...newClassForm, ageGroup: e.target.value})} placeholder="Nhập độ tuổi..." />
              </div>
              <div className="input-group" style={{ marginBottom: '2rem' }}>
                <label>Chọn Giáo Viên (Giữ phím Ctrl/Cmd để chọn nhiều người)</label>
                <select multiple className="form-control" value={newClassForm.selectedTeachers} onChange={e => {
                  const options = Array.from(e.target.selectedOptions);
                  setNewClassForm({...newClassForm, selectedTeachers: options.map(o => o.value)});
                }} style={{ height: '120px', padding: '0.8rem' }}>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id} style={{ padding: '0.5rem', marginBottom: '2px' }}>{t.name} - {t.specialty || 'Giáo viên'}</option>
                  ))}
                </select>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem', display: 'block' }}>* Mặc định giáo viên đầu tiên sẽ là Chủ Nhiệm.</span>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn-secondary" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '1rem' }}>Hủy Bỏ</button>
                <button className="btn-primary" onClick={handleAddClass} style={{ flex: 1, padding: '1rem' }}>Tạo Lớp</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => setActiveClass(null)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
        <span>←</span> Quay lại
      </button>
      <div className="flex-header" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.8rem', color: 'var(--secondary)', margin: 0 }}>
          {activeClass.name} <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>({activeClass.ageGroup || 'Chưa cập nhật'})</span>
        </h2>
        <div style={{ fontSize: '1.2rem', color: 'var(--secondary)', fontWeight: 600 }}>GV: {activeClass.teachers || activeClass.teacher}</div>
      </div>

      <div style={{ maxWidth: '800px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ background: 'white', borderRadius: '16px' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: 'var(--secondary)' }}>Thông Tin Giáo Viên</h3>
            {(activeClass.teachers || activeClass.teacher || '').split(',').map((t: string, idx: number) => {
              const tName = t.trim();
              if (!tName) return null;
              return (
                <div key={idx} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: idx === (activeClass.teachers || activeClass.teacher || '').split(',').length - 1 ? 'none' : '1px solid rgba(0,0,0,0.05)' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>{tName.charAt(0)}</div>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--secondary)', marginBottom: '0.3rem' }}>{tName}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>🎂 Sinh ngày: 15/08/1995</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>📞 SĐT: 098xxxxxxx</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="glass-panel" style={{ background: 'white', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: 'var(--secondary)' }}>Danh Sách ({classStudents.length})</h3>
              {(role === 'principal' || role === 'vice_principal') && (
                <button onClick={() => setShowAddStudent(!showAddStudent)} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.5rem', lineHeight: 1 }}>+</button>
              )}
            </div>
            
            {showAddStudent && (
              <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                <select className="form-control" value={selectedNewStudent} onChange={e => setSelectedNewStudent(e.target.value)} style={{ flex: 1, padding: '0.5rem' }}>
                  <option value="">-- Chọn bé --</option>
                  {unassignedStudents.map(s => <option key={s.id} value={s.id}>{s.lastName} {s.firstName}</option>)}
                </select>
                <button className="btn-primary" onClick={handleAddStudentToClass} style={{ padding: '0.5rem 1rem' }}>Thêm</button>
              </div>
            )}

            <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: '350px', overflowY: 'auto' }}>
              {classStudents.map((st) => (
                <li key={st.id} style={{ padding: '0.8rem 0', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '35px', height: '35px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontWeight: 'bold', flexShrink: 0 }}>{st.firstName.charAt(0)}</div>
                  <span style={{ fontWeight: 500 }}>{st.lastName} {st.firstName}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
