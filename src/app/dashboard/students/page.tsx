'use client';
import { useState, useEffect } from 'react';

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', dob: '', gender: 'Nam', classId: '', parentName: '', parentPhone: '', parentName2: '', parentPhone2: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  
  // Detail view
  const [activeStudent, setActiveStudent] = useState<any>(null); 
  
  
  // States cho Sức khỏe
  const [isEditingHealth, setIsEditingHealth] = useState(false);
  const [healthData, setHealthData] = useState({ height: '', weight: '' });
  const [healthRecords, setHealthRecords] = useState<any[]>([]);

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
  useEffect(() => {
    if (activeStudent) {
      setHealthData({
        height: activeStudent.height || '',
        weight: activeStudent.weight || ''
      });
      setParentData({
        name: activeStudent.parentName || '',
        phone: activeStudent.parentPhone || ''
      });
      setParentData2({
        name: activeStudent.parentName2 || '',
        phone: activeStudent.parentPhone2 || ''
      });
      fetchHealthRecords(activeStudent.id);
    }
  }, [activeStudent]);

  const fetchHealthRecords = async (id: string) => {
    try {
      const res = await fetch(`/api/students/${id}/health-records`);
      if (res.ok) setHealthRecords(await res.json());
    } catch(e) {}
  };

  const [isEditingParent, setIsEditingParent] = useState(false);
  const [parentData, setParentData] = useState({ name: '', phone: '' });
  const [parentData2, setParentData2] = useState({ name: '', phone: '' });

  const [notiContent, setNotiContent] = useState('');
  const [isEditingClass, setIsEditingClass] = useState(false);
  const [tempClassId, setTempClassId] = useState('');
  const [isNotiModalOpen, setIsNotiModalOpen] = useState(false);

  const fetchStudentsAndClasses = async () => {
    try {
      const [resStudents, resClasses] = await Promise.all([
        fetch('/api/students'),
        fetch('/api/classes')
      ]);
      if (resStudents.ok) {
        setStudents(await resStudents.json());
      }
      if (resClasses.ok) {
        setClasses(await resClasses.json());
      }
    } catch (error) {
      console.error('Failed to fetch data', error);
    }
  };

  useEffect(() => {
    fetchStudentsAndClasses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        await fetchStudentsAndClasses();
        setIsModalOpen(false);
        setFormData({ firstName: '', lastName: '', dob: '', gender: 'Nam', classId: '', parentName: '', parentPhone: '', parentName2: '', parentPhone2: '' });
      } else {
        alert('Có lỗi xảy ra khi lưu học sinh.');
      }
    } catch (error) {
      console.error(error);
      alert('Lỗi kết nối server.');
    }
    setIsLoading(false);
  };

  if (activeStudent) {
    return (
      <div>
        <div className="flex-header" style={{ marginBottom: '1.5rem' }}>
          <button onClick={() => setActiveStudent(null)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
            <span>←</span> Quay lại danh sách
          </button>
          
          {role !== 'parent' && (
          <button onClick={async () => {
            if (confirm(`Bạn có chắc chắn muốn xóa dữ liệu của bé ${activeStudent.firstName}? Hành động này không thể hoàn tác.`)) {
              try {
                const res = await fetch(`/api/students/${activeStudent.id}`, { method: 'DELETE' });
                if (res.ok) {
                  alert('Đã xóa thành công!');
                  await fetchStudentsAndClasses();
                  setActiveStudent(null);
                }
              } catch(e) { alert('Lỗi khi xóa học sinh'); }
            }
          }} style={{ background: 'rgba(244,67,54,0.1)', border: '1px solid #f44336', color: '#f44336', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
            🗑️ Xóa Học Sinh
          </button>
          )}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontSize: '2.5rem', fontWeight: 'bold' }}>
            {activeStudent.firstName.charAt(0)}
          </div>
          <div>
            <h2 className="page-title">{activeStudent.lastName} {activeStudent.firstName}</h2>
            <div style={{ margin: '0.5rem 0 0 0', color: 'var(--text-muted)', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span>Sinh ngày: {new Date(activeStudent.dob).toLocaleDateString('en-GB')} • Giới tính: {activeStudent.gender}</span>
              <span style={{ borderLeft: '1px solid rgba(0,0,0,0.1)', height: '1.2rem' }}></span>
              
              {isEditingClass ? (
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <select className="form-control" value={tempClassId} onChange={e => setTempClassId(e.target.value)} style={{ padding: '0.3rem', fontSize: '0.9rem', width: '150px' }}>
                    <option value="">Chưa xếp lớp</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <button className="btn-primary" style={{ padding: '0.3rem 0.8rem', fontSize: '0.85rem' }} onClick={async () => {
                    try {
                      const res = await fetch(`/api/students/${activeStudent.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ classId: tempClassId })
                      });
                      if (res.ok) {
                        await fetchStudentsAndClasses();
                        setActiveStudent({...activeStudent, classId: tempClassId});
                        setIsEditingClass(false);
                      }
                    } catch (e) { alert('Lỗi đổi lớp!'); }
                  }}>Lưu</button>
                  <button className="btn-secondary" style={{ padding: '0.3rem 0.8rem', fontSize: '0.85rem' }} onClick={() => setIsEditingClass(false)}>Hủy</button>
                </div>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  Lớp: <strong style={{ color: 'var(--primary)' }}>{classes.find(c => c.id === activeStudent.classId)?.name || 'Chưa xếp lớp'}</strong>
                  {role !== 'parent' && <button onClick={() => { setTempClassId(activeStudent.classId || ''); setIsEditingClass(true); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>✏️</button>}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid-responsive-2" style={{ gap: '2rem' }}>
          {/* Sức Khỏe */}
          <div className="glass-panel" style={{ background: 'white', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span>🏥</span> Chỉ Số Sức Khỏe</h3>
              {role !== 'parent' && <button onClick={async () => {
                if (isEditingHealth) {
                  try {
                    await fetch(`/api/students/${activeStudent.id}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ height: healthData.height, weight: healthData.weight })
                    });
                    await fetchHealthRecords(activeStudent.id);
                  } catch(e) {}
                }
                setIsEditingHealth(!isEditingHealth);
              }} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>{isEditingHealth ? 'Lưu' : 'Chỉnh sửa'}</button>}
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ flex: 1, background: 'rgba(33,150,243,0.1)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(33,150,243,0.2)' }}>
                <div style={{ color: '#2196F3', fontWeight: 600, fontSize: '0.9rem' }}>CHIỀU CAO (cm)</div>
                {isEditingHealth ? (
                  <input type="text" className="form-control" value={healthData.height} onChange={e => setHealthData({...healthData, height: e.target.value})} style={{ marginTop: '0.5rem', background: 'white' }} />
                ) : (
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--secondary)', marginTop: '0.5rem' }}>
                    {healthData.height || '---'} cm 
                    {healthRecords.length > 1 && healthData.height && (
                      <span style={{ fontSize: '0.8rem', color: (parseFloat(healthData.height) >= parseFloat(healthRecords[1].height)) ? '#4CAF50' : '#f44336', marginLeft: '0.5rem' }}>
                        {parseFloat(healthData.height) >= parseFloat(healthRecords[1].height) ? '↑' : '↓'} {Math.abs(parseFloat(healthData.height) - parseFloat(healthRecords[1].height)).toFixed(1)}cm
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div style={{ flex: 1, background: 'rgba(255,152,0,0.1)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,152,0,0.2)' }}>
                <div style={{ color: '#FF9800', fontWeight: 600, fontSize: '0.9rem' }}>CÂN NẶNG (kg)</div>
                {isEditingHealth ? (
                  <input type="text" className="form-control" value={healthData.weight} onChange={e => setHealthData({...healthData, weight: e.target.value})} style={{ marginTop: '0.5rem', background: 'white' }} />
                ) : (
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--secondary)', marginTop: '0.5rem' }}>
                    {healthData.weight || '---'} kg 
                    {healthRecords.length > 1 && healthData.weight && (
                      <span style={{ fontSize: '0.8rem', color: (parseFloat(healthData.weight) >= parseFloat(healthRecords[1].weight)) ? '#4CAF50' : '#f44336', marginLeft: '0.5rem' }}>
                        {parseFloat(healthData.weight) >= parseFloat(healthRecords[1].weight) ? '↑' : '↓'} {Math.abs(parseFloat(healthData.weight) - parseFloat(healthRecords[1].weight)).toFixed(1)}kg
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Lịch sử Sức khỏe */}
            <div style={{ borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '1.5rem' }}>
              <h4 style={{ color: 'var(--secondary)', margin: '0 0 1rem 0' }}>Lịch sử đo Gần đây</h4>
              {healthRecords.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Chưa có dữ liệu lịch sử.</div>
              ) : (
                <table style={{ width: '100%', fontSize: '0.9rem', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f9f9f9', textAlign: 'left', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '0.8rem' }}>Ngày đo</th>
                      <th style={{ padding: '0.8rem' }}>Chiều cao</th>
                      <th style={{ padding: '0.8rem' }}>Cân nặng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {healthRecords.slice(0, 5).map(record => (
                      <tr key={record.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '0.8rem' }}>{new Date(record.recordedAt).toLocaleDateString('en-GB')}</td>
                        <td style={{ padding: '0.8rem', fontWeight: 600 }}>{record.height} cm</td>
                        <td style={{ padding: '0.8rem', fontWeight: 600 }}>{record.weight} kg</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="glass-panel" style={{ background: 'white', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span>👨‍👩‍👦</span> Thông Tin Liên Hệ</h3>
              {role !== 'parent' && <button onClick={async () => {
                if (isEditingParent) {
                  try {
                    await fetch(`/api/students/${activeStudent.id}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ parentName: parentData.name, parentPhone: parentData.phone, parentName2: parentData2.name, parentPhone2: parentData2.phone })
                    });
                    setActiveStudent({ ...activeStudent, parentName: parentData.name, parentPhone: parentData.phone, parentName2: parentData2.name, parentPhone2: parentData2.phone });
                  } catch(e) {}
                }
                setIsEditingParent(!isEditingParent);
              }} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>{isEditingParent ? 'Lưu' : 'Chỉnh sửa'}</button>}
            </div>
            
            <div className="grid-responsive-2" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ background: '#f9f9f9', padding: '1rem', borderRadius: '12px' }}>
                <h4 style={{ margin: '0 0 1rem 0', color: 'var(--primary)' }}>Thông tin Mẹ</h4>
                {isEditingParent ? (
                  <>
                    <input type="text" className="form-control" value={parentData.name} onChange={e => setParentData({...parentData, name: e.target.value})} placeholder="Họ tên Mẹ" style={{ marginBottom: '0.5rem' }} />
                    <input type="text" className="form-control" value={parentData.phone} onChange={e => setParentData({...parentData, phone: e.target.value})} placeholder="SĐT Mẹ" />
                  </>
                ) : (
                  <>
                    <p style={{ margin: '0 0 0.5rem 0' }}><strong>Họ tên:</strong> {parentData.name || '---'}</p>
                    <p style={{ margin: 0 }}><strong>Số điện thoại:</strong> {parentData.phone || '---'}</p>
                  </>
                )}
              </div>
              
              <div style={{ background: '#f9f9f9', padding: '1rem', borderRadius: '12px' }}>
                <h4 style={{ margin: '0 0 1rem 0', color: 'var(--primary)' }}>Thông tin Bố / Người thân</h4>
                {isEditingParent ? (
                  <>
                    <input type="text" className="form-control" value={parentData2.name} onChange={e => setParentData2({...parentData2, name: e.target.value})} placeholder="Họ tên Bố/Người thân" style={{ marginBottom: '0.5rem' }} />
                    <input type="text" className="form-control" value={parentData2.phone} onChange={e => setParentData2({...parentData2, phone: e.target.value})} placeholder="SĐT Bố/Người thân" />
                  </>
                ) : (
                  <>
                    <p style={{ margin: '0 0 0.5rem 0' }}><strong>Họ tên:</strong> {parentData2.name || '---'}</p>
                    <p style={{ margin: 0 }}><strong>Số điện thoại:</strong> {parentData2.phone || '---'}</p>
                  </>
                )}
              </div>
            </div>

            {role !== 'parent' && (
              <div style={{ borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
                <button className="btn-primary" onClick={() => setIsNotiModalOpen(true)} style={{ width: '100%', padding: '1rem', borderRadius: '12px', fontSize: '1.1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 4px 15px rgba(79, 70, 229, 0.3)' }}>
                  <span>🔔</span> Gửi Thông Báo Cho Phụ Huynh
                </button>
              </div>
            )}
          </div>
        </div>

        {isNotiModalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000, backdropFilter: 'blur(5px)' }}>
            <div className="glass-panel" style={{ background: 'white', width: '90%', maxWidth: '500px', padding: '1.5rem', borderRadius: '24px' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--secondary)' }}>Gửi thông báo</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Sẽ gửi tới tất cả các liên hệ phụ huynh của học sinh này.</p>
              <textarea className="form-control" value={notiContent} onChange={e => setNotiContent(e.target.value)} placeholder="Nhập nội dung thông báo..." style={{ height: '100px', marginBottom: '1.5rem', resize: 'none' }}></textarea>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn-secondary" onClick={() => setIsNotiModalOpen(false)} style={{ flex: 1, padding: '1rem' }}>Hủy</button>
                <button className="btn-primary" onClick={async () => {
                  if (!notiContent) return alert('Vui lòng nhập nội dung!');
                  try {
                    await fetch('/api/activities', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        message: `🔔 Thông báo về bé ${activeStudent.firstName}: ${notiContent}`,
                        type: 'ThongBao',
                        color: 'var(--primary)'
                      })
                    });
                    alert(`Đã gửi thông báo tới toàn bộ Phụ huynh của bé!`); 
                    setNotiContent('');
                    setIsNotiModalOpen(false);
                  } catch(e) {}
                }} style={{ flex: 1, padding: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                  <span>🔔</span> Gửi Đi
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  let filteredStudents = students;
  if (role === 'parent') {
    filteredStudents = students.filter(s => s.id === refId);
  } else if (role === 'teacher') {
    const teacherClasses = classes.filter(c => (c.teachers || c.teacher || '').includes(userName)).map(c => c.id);
    filteredStudents = students.filter(s => teacherClasses.includes(s.classId));
  }

  return (
    <div>
      <div className="flex-header" style={{ marginBottom: '2rem' }}>
        <h2 className="page-title">Quản Lý Học Sinh</h2>
        {(role === 'principal' || role === 'vice_principal') && (
        <button className="btn-primary" onClick={() => setIsModalOpen(true)} style={{ padding: '0.8rem 1.5rem', borderRadius: '12px' }}>
          + Thêm Học Sinh
        </button>
        )}
      </div>

      <div className="glass-panel" style={{ background: 'white', padding: '0', overflow: 'hidden', borderRadius: '16px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(0,0,0,0.02)', borderBottom: '1px solid rgba(0,0,0,0.05)', textAlign: 'left' }}>
              <th style={{ padding: '1.2rem', color: 'var(--text-muted)' }}>Mã HS</th>
              <th style={{ padding: '1.2rem', color: 'var(--text-muted)' }}>Họ Tên</th>
              <th style={{ padding: '1.2rem', color: 'var(--text-muted)' }}>Ngày Sinh</th>
              <th style={{ padding: '1.2rem', color: 'var(--text-muted)' }}>Giới Tính</th>
              <th style={{ padding: '1.2rem', color: 'var(--text-muted)' }}>Phụ Huynh</th>
              <th style={{ padding: '1.2rem', color: 'var(--text-muted)' }}>Lớp Học</th>
              <th style={{ padding: '1.2rem', color: 'var(--text-muted)' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Chưa có học sinh nào.</td></tr>
            ) : (
              filteredStudents.map(s => {
                const sClass = classes.find(c => c.id === s.classId);
                const className = sClass ? sClass.name : 'Chưa xếp lớp';
                return (
                  <tr key={s.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                    <td data-label="Mã HS" style={{ padding: '1.2rem', fontWeight: 600, color: 'var(--text-muted)' }}>#{s.id.substring(0, 6).toUpperCase()}</td>
                    <td data-label="Họ Tên" style={{ padding: '1.2rem', fontWeight: 600, color: 'var(--secondary)' }}>{s.lastName} {s.firstName}</td>
                    <td data-label="Ngày Sinh" style={{ padding: '1.2rem' }}>{new Date(s.dob).toLocaleDateString('en-GB')}</td>
                    <td data-label="Giới Tính" style={{ padding: '1.2rem' }}>{s.gender}</td>
                    <td data-label="Phụ Huynh" style={{ padding: '1.2rem', fontWeight: 500 }}>{s.parentName || '---'}</td>
                    <td data-label="Lớp Học" style={{ padding: '1.2rem' }}><span style={{ background: s.classId ? 'rgba(76,175,80,0.1)' : 'rgba(255,152,0,0.1)', color: s.classId ? '#4CAF50' : '#FF9800', padding: '0.4rem 0.8rem', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 600 }}>{className}</span></td>
                    <td data-label="Thao tác" style={{ padding: '1.2rem' }}>
                      <button onClick={() => setActiveStudent(s)} style={{ background: 'rgba(255,123,84,0.1)', color: 'var(--primary)', border: '1px solid var(--primary)', cursor: 'pointer', fontWeight: 600, padding: '0.5rem 1rem', borderRadius: '8px', transition: 'all 0.2s', width: 'auto', minWidth: '100px' }}>Chi tiết</button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }}>
          <div className="glass-panel" style={{ background: 'white', width: '100%', maxWidth: '600px', padding: '1.5rem', borderRadius: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--secondary)', fontSize: '1.5rem' }}>Thêm Học Sinh Mới</h3>
            <form onSubmit={handleSubmit} className="grid-responsive-2" style={{ gap: '1.5rem' }}>
              <div className="input-group">
                <label>Họ và Tên Đệm</label>
                <input type="text" className="form-control" required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} placeholder="Nguyễn Văn" />
              </div>
              <div className="input-group">
                <label>Tên</label>
                <input type="text" className="form-control" required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} placeholder="An" />
              </div>
              <div className="input-group">
                <label>Ngày Sinh</label>
                <input type="date" className="form-control" required value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Giới Tính</label>
                <select className="form-control" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                  <option>Nam</option>
                  <option>Nữ</option>
                </select>
              </div>
              <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <label>Xếp Lớp</label>
                <select className="form-control" value={formData.classId} onChange={e => setFormData({...formData, classId: e.target.value})}>
                  <option value="">-- Chưa xếp lớp --</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="input-group" style={{ gridColumn: '1 / -1', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '1.5rem' }}>
                <label style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Thông tin Phụ huynh (Mẹ)</label>
              </div>
              <div className="input-group">
                <label>Họ tên Mẹ</label>
                <input type="text" className="form-control" required value={formData.parentName} onChange={e => setFormData({...formData, parentName: e.target.value})} placeholder="Nhập tên Mẹ..." />
              </div>
              <div className="input-group">
                <label>Số Điện Thoại Mẹ</label>
                <input type="text" className="form-control" required value={formData.parentPhone} onChange={e => setFormData({...formData, parentPhone: e.target.value})} placeholder="09xx..." />
              </div>

              <div className="input-group" style={{ gridColumn: '1 / -1', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '1.5rem' }}>
                <label style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Thông tin Bố / Người thân</label>
              </div>
              <div className="input-group">
                <label>Họ tên Bố/Người thân</label>
                <input type="text" className="form-control" value={formData.parentName2} onChange={e => setFormData({...formData, parentName2: e.target.value})} placeholder="Nhập tên..." />
              </div>
              <div className="input-group">
                <label>Số Điện Thoại</label>
                <input type="text" className="form-control" value={formData.parentPhone2} onChange={e => setFormData({...formData, parentPhone2: e.target.value})} placeholder="09xx..." />
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', gridColumn: '1 / -1' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary" style={{ flex: 1, padding: '1rem' }} disabled={isLoading}>Hủy</button>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '1rem' }} disabled={isLoading}>{isLoading ? 'Đang lưu...' : 'Lưu Thông Tin'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
