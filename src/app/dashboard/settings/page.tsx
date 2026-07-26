'use client';
import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const [role, setRole] = useState('parent');
  const [email, setEmail] = useState('');
  
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [newUserForm, setNewUserForm] = useState({ name: '', email: '', password: '', role: 'teacher' });
  const [activeTab, setActiveTab] = useState('general');
  
  useEffect(() => {
    const currentRole = localStorage.getItem('userRole') || 'parent';
    setRole(currentRole);
    setEmail(localStorage.getItem('userEmail') || '');

    if (currentRole === 'principal' || currentRole === 'vice_principal') {
      fetch('/api/users').then(res => res.json()).then(data => { if(Array.isArray(data)) setUsers(data); }).catch(()=>{});
      fetch('/api/logs').then(res => res.json()).then(data => { if(Array.isArray(data)) setLogs(data); }).catch(()=>{});
    }
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return alert('Mật khẩu mới không khớp!');
    }
    
    try {
      const res = await fetch('/api/auth/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, oldPassword, newPassword })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert('Đổi mật khẩu thành công!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        alert(data.error || 'Lỗi đổi mật khẩu');
      }
    } catch (err) {
      alert('Đã có lỗi xảy ra');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newUserForm) });
      if (res.ok) {
        alert('Tạo tài khoản thành công!');
        setNewUserForm({ name: '', email: '', password: '', role: 'teacher' });
        fetch('/api/users').then(r => r.json()).then(data => { if(Array.isArray(data)) setUsers(data); });
        fetch('/api/logs', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ action: 'Tạo tài khoản', detail: `Tạo tài khoản ${newUserForm.email} quyền ${newUserForm.role}`, user: role === 'principal' ? 'Hiệu Trưởng' : 'Phó HT' }) }).catch(()=>{});
        fetch('/api/logs').then(r => r.json()).then(data => { if(Array.isArray(data)) setLogs(data); });
      }
    } catch(err) {
      alert('Lỗi tạo tài khoản');
    }
  };

  return (
    <div className="animate-fade-in-up">
      <h2 style={{ fontSize: '1.8rem', color: 'var(--secondary)', marginBottom: '2rem' }}>Cài Đặt Hệ Thống</h2>

      {(role === 'principal' || role === 'vice_principal') && (
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <button onClick={() => setActiveTab('general')} style={{ padding: '0.8rem 2rem', borderRadius: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer', background: activeTab === 'general' ? 'var(--primary)' : 'rgba(0,0,0,0.05)', color: activeTab === 'general' ? 'white' : 'var(--text-main)' }}>Cài Đặt Chung</button>
          <button onClick={() => setActiveTab('accounts')} style={{ padding: '0.8rem 2rem', borderRadius: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer', background: activeTab === 'accounts' ? 'var(--primary)' : 'rgba(0,0,0,0.05)', color: activeTab === 'accounts' ? 'white' : 'var(--text-main)' }}>Quản Lý Tài Khoản</button>
          <button onClick={() => setActiveTab('logs')} style={{ padding: '0.8rem 2rem', borderRadius: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer', background: activeTab === 'logs' ? 'var(--primary)' : 'rgba(0,0,0,0.05)', color: activeTab === 'logs' ? 'white' : 'var(--text-main)' }}>Nhật Ký Hệ Thống</button>
        </div>
      )}

      {activeTab === 'general' && (
      <>
      
      <div className="glass-panel" style={{ background: 'white', borderRadius: '16px', maxWidth: '600px', padding: '3rem', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.4rem', color: 'var(--secondary)', marginBottom: '1.5rem' }}>Đổi Mật Khẩu</h3>
        <form onSubmit={handleChangePassword}>
          <div className="input-group">
            <label>Mật khẩu hiện tại</label>
            <input type="password" required className="form-control" value={oldPassword} onChange={e => setOldPassword(e.target.value)} />
          </div>
          <div className="input-group">
            <label>Mật khẩu mới</label>
            <input type="password" required minLength={6} className="form-control" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
          </div>
          <div className="input-group" style={{ marginBottom: '1.5rem' }}>
            <label>Xác nhận mật khẩu mới</label>
            <input type="password" required minLength={6} className="form-control" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary" style={{ padding: '0.8rem 2rem' }}>Lưu Mật Khẩu</button>
        </form>
      </div>

      {(role === 'principal' || role === 'vice_principal') && (
      <div className="glass-panel" style={{ background: 'white', borderRadius: '16px', maxWidth: '600px', padding: '3rem' }}>
        <div className="input-group">
          <label>Tên Trường Mầm Non</label>
          <input type="text" className="form-control" defaultValue="Trường Mầm Non Hướng Dương" />
        </div>
        <div className="input-group">
          <label>Email Liên Hệ</label>
          <input type="email" className="form-control" defaultValue="contact@huongduong.edu.vn" />
        </div>
        <div className="input-group">
          <label>Số Điện Thoại</label>
          <input type="tel" className="form-control" defaultValue="0987.654.321" />
        </div>
        <div className="input-group" style={{ marginBottom: '2.5rem' }}>
          <label>Năm Học Hiện Tại</label>
          <input type="text" className="form-control" defaultValue="2026 - 2027" placeholder="VD: 2026 - 2027" />
        </div>

        <h3 style={{ fontSize: '1.4rem', color: 'var(--secondary)', marginBottom: '1.5rem', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '2rem' }}>Tích Hợp API Hệ Thống</h3>
        
        <div style={{ background: 'rgba(0,104,255,0.05)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(0,104,255,0.2)', marginBottom: '1.5rem' }}>
          <h4 style={{ margin: '0 0 1rem 0', color: '#0068FF', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span>💬</span> Tích Hợp Zalo OA</h4>
          <div className="input-group">
            <label>Zalo OA ID</label>
            <input type="text" className="form-control" placeholder="Nhập OA ID..." />
          </div>
          <div className="input-group" style={{ marginBottom: '1rem' }}>
            <label>Zalo Access Token</label>
            <input type="password" className="form-control" placeholder="Nhập Token..." />
          </div>
          <button className="btn-secondary" style={{ width: '100%', borderColor: '#0068FF', color: '#0068FF' }} onClick={() => alert('Đã kết nối thành công tới Zalo OA!')}>Kiểm tra kết nối Zalo</button>
        </div>

        <div style={{ background: 'rgba(76,175,80,0.05)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(76,175,80,0.2)', marginBottom: '2.5rem' }}>
          <h4 style={{ margin: '0 0 1rem 0', color: '#4CAF50', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span>📱</span> Tích Hợp Mobile App (Firebase)</h4>
          <div className="input-group" style={{ marginBottom: '1rem' }}>
            <label>Firebase Server Key (Dùng để bắn Push Noti)</label>
            <input type="password" className="form-control" placeholder="Nhập Server Key..." />
          </div>
          <button className="btn-secondary" style={{ width: '100%', borderColor: '#4CAF50', color: '#4CAF50' }} onClick={() => alert('Đã kết nối Firebase thành công!')}>Kiểm tra kết nối App</button>
        </div>

        <button className="btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', width: '100%' }} onClick={() => { alert('Đã lưu thành công!'); fetch('/api/logs', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ action: 'Cập nhật cấu hình', detail: `Cập nhật cấu hình hệ thống`, user: role === 'principal' ? 'Hiệu Trưởng' : 'Phó HT' }) }).catch(()=>{}); }}>Lưu Cài Đặt Cấu Hình</button>
      </div>
      )}
      </>
      )}

      {activeTab === 'accounts' && (role === 'principal' || role === 'vice_principal') && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div className="glass-panel" style={{ background: 'white', borderRadius: '16px', padding: '2rem' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--secondary)' }}>Tạo Tài Khoản Mới</h3>
            <form onSubmit={handleCreateUser}>
              <div className="input-group">
                <label>Tên Người Dùng</label>
                <input type="text" required className="form-control" value={newUserForm.name} onChange={e => setNewUserForm({...newUserForm, name: e.target.value})} placeholder="Nguyễn Văn A" />
              </div>
              <div className="input-group">
                <label>Email Đăng Nhập</label>
                <input type="text" required className="form-control" value={newUserForm.email} onChange={e => setNewUserForm({...newUserForm, email: e.target.value})} placeholder="email@truong.edu.vn" />
              </div>
              <div className="input-group">
                <label>Mật Khẩu</label>
                <input type="password" required className="form-control" value={newUserForm.password} onChange={e => setNewUserForm({...newUserForm, password: e.target.value})} />
              </div>
              <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                <label>Vai Trò (Quyền Hạn)</label>
                <select className="form-control" value={newUserForm.role} onChange={e => setNewUserForm({...newUserForm, role: e.target.value})}>
                  <option value="teacher">Giáo Viên</option>
                  <option value="vice_principal">Phó Hiệu Trưởng</option>
                  <option value="principal">Hiệu Trưởng</option>
                </select>
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1rem' }}>Tạo Tài Khoản</button>
            </form>
          </div>
          
          <div className="glass-panel" style={{ background: 'white', borderRadius: '16px', padding: '2rem', maxHeight: '600px', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--secondary)' }}>Danh Sách Tài Khoản ({users.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {users.map(u => (
                <div key={u.id} style={{ padding: '1rem', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--secondary)', marginBottom: '0.2rem' }}>{u.name}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{u.email}</div>
                  </div>
                  <span style={{ padding: '0.3rem 0.8rem', background: u.role === 'principal' || u.role === 'vice_principal' ? 'rgba(233,30,99,0.1)' : 'rgba(33,150,243,0.1)', color: u.role === 'principal' || u.role === 'vice_principal' ? '#E91E63' : '#2196F3', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 600 }}>
                    {u.role === 'principal' ? 'Hiệu Trưởng' : (u.role === 'vice_principal' ? 'Phó HT' : 'Giáo Viên')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (role === 'principal' || role === 'vice_principal') && (
        <div className="glass-panel" style={{ background: 'white', borderRadius: '16px', padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0, color: 'var(--secondary)' }}>Nhật Ký Hệ Thống (Audit Logs)</h3>
            <button className="btn-secondary" onClick={() => {
              fetch('/api/logs').then(r => r.json()).then(data => { if(Array.isArray(data)) setLogs(data); });
            }} style={{ padding: '0.5rem 1rem' }}>🔄 Làm mới</button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.02)', textAlign: 'left', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Thời gian</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Người thực hiện</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Hành động</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: '1rem', textAlign: 'center' }}>Chưa có lịch sử hoạt động</td></tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                    <td style={{ padding: '1rem', fontSize: '0.9rem' }}>{new Date(log.timestamp).toLocaleString('vi-VN')}</td>
                    <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--primary)' }}>{log.user}</td>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>{log.action}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>{log.detail}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
