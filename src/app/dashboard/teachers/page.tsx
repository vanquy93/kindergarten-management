'use client';
import { useState, useEffect } from 'react';

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '', dob: '', phone: '', specialty: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState('parent');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setRole(localStorage.getItem('userRole') || 'parent');
    }
  }, []);

  const fetchTeachers = async () => {
    try {
      const res = await fetch('/api/teachers');
      if (res.ok) setTeachers(await res.json());
    } catch (error) {
      console.error('Failed to fetch teachers', error);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        await fetchTeachers();
        setIsModalOpen(false);
        setFormData({ name: '', dob: '', phone: '', specialty: '' });
      } else {
        alert('Có lỗi xảy ra khi lưu giáo viên.');
      }
    } catch (error) {
      console.error(error);
      alert('Lỗi kết nối server.');
    }
    setIsLoading(false);
  };

  return (
    <div>
      <div className="flex-header" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.8rem', color: 'var(--secondary)', margin: 0 }}>Quản Lý Giáo Viên</h2>
        {(role === 'principal' || role === 'vice_principal') && (
          <button className="btn-primary" onClick={() => setIsModalOpen(true)} style={{ width: '100%', padding: '0.8rem 1.5rem', borderRadius: '12px' }}>
            + Thêm Giáo Viên
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
        {teachers.map(teacher => (
          <div key={teacher.id} className="glass-panel" style={{ background: 'white', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '2rem 1.5rem' }}>
            <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem', boxShadow: '0 10px 25px rgba(255,123,84,0.3)' }}>
              {teacher.name.charAt(0)}
            </div>
            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--secondary)', fontSize: '1.4rem' }}>{teacher.name}</h3>
            <p style={{ margin: '0 0 1rem 0', color: 'var(--text-muted)', fontSize: '0.95rem' }}>Chuyên môn: {teacher.specialty || 'Chưa cập nhật'}</p>
            
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem 0', borderTop: '1px dashed rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Ngày sinh:</span>
                <span style={{ fontWeight: 600, color: 'var(--secondary)' }}>{new Date(teacher.dob).toLocaleDateString('en-GB')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Điện thoại:</span>
                <span style={{ fontWeight: 600, color: 'var(--secondary)' }}>{teacher.phone}</span>
              </div>
            </div>
            
            {(role === 'principal' || role === 'vice_principal') && (
              <button className="btn-secondary" style={{ width: '100%', marginTop: 'auto', padding: '0.6rem' }}>Chỉnh sửa hồ sơ</button>
            )}
          </div>
        ))}
      </div>

      {teachers.length === 0 && (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)', background: 'white', borderRadius: '16px' }}>
          Chưa có giáo viên nào. Hãy thêm mới!
        </div>
      )}

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }}>
          <div className="glass-panel" style={{ background: 'white', width: '100%', maxWidth: '500px', padding: '1.5rem', borderRadius: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--secondary)', fontSize: '1.5rem' }}>Thêm Giáo Viên Mới</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="input-group">
                <label>Họ và Tên</label>
                <input type="text" className="form-control" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Cô Mai, Thầy Hải..." />
              </div>
              <div className="input-group">
                <label>Ngày Sinh</label>
                <input type="date" className="form-control" required value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Số Điện Thoại</label>
                <input type="tel" className="form-control" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="09xx..." />
              </div>
              <div className="input-group">
                <label>Chuyên Môn / Vai Trò</label>
                <input type="text" className="form-control" value={formData.specialty} onChange={e => setFormData({...formData, specialty: e.target.value})} placeholder="Mầm non, Trợ giảng, Thể chất..." />
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary" style={{ flex: 1, padding: '1rem' }} disabled={isLoading}>Hủy</button>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '1rem' }} disabled={isLoading}>{isLoading ? 'Đang lưu...' : 'Lưu Hồ Sơ'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
