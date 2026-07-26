'use client';
import { useState, useEffect } from 'react';

export default function PickupPage() {
  const [activeTab, setActiveTab] = useState('request');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setPreviewImage(url);
    }
  };

  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resStudents, resClasses] = await Promise.all([
          fetch('/api/students'),
          fetch('/api/classes')
        ]);
        if (resStudents.ok) setStudents(await resStudents.json());
        if (resClasses.ok) setClasses(await resClasses.json());
      } catch (error) {
        console.error('Failed to fetch data', error);
      }
    };
    fetchData();
  }, []);

  const [requests, setRequests] = useState<any[]>([]);
  const [role, setRole] = useState('parent');
  const [refId, setRefId] = useState('');
  const [userName, setUserName] = useState('');

  const fetchPickups = async () => {
    try {
      const res = await fetch('/api/pickups');
      if (res.ok) setRequests(await res.json());
    } catch (e) {}
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setRole(localStorage.getItem('userRole') || 'parent');
      setRefId(localStorage.getItem('userRefId') || '');
      setUserName(localStorage.getItem('userName') || '');
    }
    fetchPickups();
  }, []);

  const handleApprove = async (id: number, studentName: string, approverName: string) => {
    try {
      const res = await fetch(`/api/pickups/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Đã duyệt' })
      });
      if (res.ok) {
        await fetchPickups();
        alert(`Hệ thống đã bắn Noti thông báo phê duyệt đến phụ huynh của bé ${studentName} và giáo viên ${approverName}!`);
      }
    } catch(e) {}
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) {
      alert('Vui lòng chọn học sinh!');
      return;
    }
    const student = students.find(s => s.id === selectedStudentId);
    const studentClass = classes.find(c => c.id === student?.classId);
    const approverName = studentClass ? (studentClass.teachers || studentClass.teacher || 'Ban Giám Hiệu') : 'Ban Giám Hiệu';
    
    const proxyName = (document.getElementById('proxyName') as HTMLInputElement).value;

    try {
      const res = await fetch('/api/pickups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          studentId: selectedStudentId, 
          pickerName: proxyName, 
          pickerRelation: 'Người nhà', 
          imageUrl: previewImage || '' 
        })
      });
      
      if (res.ok) {
        await fetchPickups();
        setIsModalOpen(false);
        alert(`Đã gửi yêu cầu đăng ký đón hộ! Thông báo Noti đã được gửi tự động đến giáo viên chủ nhiệm (${approverName}) để chờ duyệt.`);
      }
    } catch (e) {
      alert('Có lỗi xảy ra khi tạo yêu cầu');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.8rem', color: 'var(--secondary)', margin: 0 }}>Hệ Thống Đưa Đón Học Sinh</h2>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)} style={{ padding: '0.8rem 1.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>+</span> Đăng Ký Đón Hộ
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '2px solid rgba(0,0,0,0.05)', paddingBottom: '0.5rem' }}>
        <button onClick={() => setActiveTab('request')} style={{ background: 'none', border: 'none', padding: '0.5rem 1rem', fontSize: '1.1rem', fontWeight: 600, color: activeTab === 'request' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'request' ? '3px solid var(--primary)' : '3px solid transparent', cursor: 'pointer', transition: 'var(--transition)', marginBottom: '-10px' }}>Yêu Cầu Đón Hộ (Hôm nay)</button>
        <button onClick={() => setActiveTab('history')} style={{ background: 'none', border: 'none', padding: '0.5rem 1rem', fontSize: '1.1rem', fontWeight: 600, color: activeTab === 'history' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'history' ? '3px solid var(--primary)' : '3px solid transparent', cursor: 'pointer', transition: 'var(--transition)', marginBottom: '-10px' }}>Lịch Sử</button>
      </div>

      <div className="glass-panel" style={{ background: 'white', padding: '0', borderRadius: '16px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(0,0,0,0.02)', textAlign: 'left' }}>
              <th style={{ padding: '1.2rem', color: 'var(--text-muted)' }}>Ảnh Người Đón</th>
              <th style={{ padding: '1.2rem', color: 'var(--text-muted)' }}>Học Sinh (Lớp)</th>
              <th style={{ padding: '1.2rem', color: 'var(--text-muted)' }}>Thông Tin Người Đón</th>
              <th style={{ padding: '1.2rem', color: 'var(--text-muted)' }}>Thời Gian Dự Kiến</th>
              <th style={{ padding: '1.2rem', color: 'var(--text-muted)' }}>Người Duyệt</th>
              <th style={{ padding: '1.2rem', color: 'var(--text-muted)' }}>Trạng Thái</th>
              <th style={{ padding: '1.2rem', color: 'var(--text-muted)' }}>Xác Nhận</th>
            </tr>
          </thead>
          <tbody>
            {requests.filter(r => {
              if (role === 'parent') return r.studentId == refId; // Ensure we match studentId with refId
              if (role === 'teacher') {
                const s = students.find(st => st.id == r.studentId);
                const c = classes.find(cl => cl.id == s?.classId);
                return (c?.teachers || c?.teacher || '').includes(userName);
              }
              return true;
            }).map(req => {
              const approverName = req.className ? 'GVCN' : 'Ban Giám Hiệu';
              return (
                <tr key={req.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                  <td style={{ padding: '1.2rem', fontSize: '2.5rem', textAlign: 'center' }}>
                    {req.imageUrl ? (
                       <img src={req.imageUrl} alt="Picker" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '50%' }} />
                    ) : (
                      <div style={{ width: '50px', height: '50px', background: '#f5f5f5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</div>
                    )}
                  </td>
                  <td style={{ padding: '1.2rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--secondary)' }}>{req.lastName} {req.firstName}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{req.className || 'Chưa xếp lớp'}</div>
                  </td>
                  <td style={{ padding: '1.2rem', fontWeight: 500 }}>{req.pickerName}</td>
                  <td style={{ padding: '1.2rem' }}>{new Date(req.time).toLocaleString('vi-VN')}</td>
                  <td style={{ padding: '1.2rem', fontWeight: 600, color: 'var(--primary)' }}>{approverName}</td>
                  <td style={{ padding: '1.2rem' }}>
                    <span style={{ background: req.status === 'Đã duyệt' ? '#4CAF50' : '#FF9800', color: 'white', padding: '0.3rem 0.8rem', borderRadius: '50px', fontSize: '0.85rem' }}>{req.status === 'pending' ? 'Chờ duyệt' : 'Đã duyệt'}</span>
                  </td>
                  <td style={{ padding: '1.2rem' }}>
                    {req.status === 'pending' && role !== 'parent' && (
                      <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }} onClick={() => handleApprove(req.id, req.firstName, approverName)}>Duyệt Ngay</button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }}>
          <div className="glass-panel" style={{ background: 'white', width: '100%', maxWidth: '600px', padding: '2.5rem', borderRadius: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--secondary)' }}>Đăng Ký Đón Hộ Mới</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer', color: 'var(--text-muted)' }}>&times;</button>
            </div>
            
            <form onSubmit={handleSubmitRequest}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Tải Lên Ảnh Người Đón (*Bắt buộc)</label>
                  <div style={{ border: '2px dashed rgba(0,0,0,0.1)', borderRadius: '12px', padding: '2rem', textAlign: 'center', background: '#f9f9f9', cursor: 'pointer' }}>
                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} id="upload-photo" />
                    <label htmlFor="upload-photo" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      {previewImage ? (
                        <img src={previewImage} alt="Preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '50%', marginBottom: '1rem' }} />
                      ) : (
                        <span style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📸</span>
                      )}
                      <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{previewImage ? 'Đổi ảnh khác' : 'Nhấn để chọn ảnh từ thiết bị'}</span>
                    </label>
                  </div>
                </div>
                <div className="input-group">
                  <label>Họ và Tên Người Đón</label>
                  <input type="text" id="proxyName" className="form-control" required placeholder="Nguyễn Văn B" />
                </div>
                <div className="input-group">
                  <label>Ngày Tháng Năm Sinh</label>
                  <input type="text" className="form-control" required placeholder="DD/MM/YYYY" />
                </div>
                <div className="input-group">
                  <label>Tên Học Sinh Cần Đón</label>
                  <select className="form-control" required value={selectedStudentId} onChange={e => setSelectedStudentId(e.target.value)}>
                    <option value="">-- Chọn bé --</option>
                    {classes.map(c => {
                      let studentsInClass = students.filter(s => s.classId === c.id);
                      if (role === 'parent') {
                         studentsInClass = studentsInClass.filter(s => s.id == refId);
                      }
                      if (studentsInClass.length === 0) return null;
                      return (
                        <optgroup key={c.id} label={c.name}>
                          {studentsInClass.map(s => (
                            <option key={s.id} value={s.id}>{s.lastName} {s.firstName} (PH: {s.parentName || '---'})</option>
                          ))}
                        </optgroup>
                      );
                    })}
                    {role !== 'parent' && (
                    <optgroup label="Chưa xếp lớp">
                      {students.filter(s => !s.classId).map(s => (
                        <option key={s.id} value={s.id}>{s.lastName} {s.firstName} (PH: {s.parentName || '---'})</option>
                      ))}
                    </optgroup>
                    )}
                  </select>
                </div>
                <div className="input-group">
                  <label>SĐT Người Đón</label>
                  <input type="tel" className="form-control" required placeholder="09xx..." />
                </div>
                <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Họ tên Bố/Mẹ (Người ủy quyền)</label>
                  <input type="text" className="form-control" required placeholder="Nhập họ tên bố mẹ..." />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary" style={{ flex: 1, padding: '1rem' }}>Hủy Bỏ</button>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '1rem' }}>Gửi Yêu Cầu Đăng Ký</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
