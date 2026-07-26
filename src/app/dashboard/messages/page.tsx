'use client';
import { useState, useEffect } from 'react';

export default function MessagesPage() {
  const [recipientType, setRecipientType] = useState('all');
  const [recipientTarget, setRecipientTarget] = useState('');
  const [channel, setChannel] = useState({ zalo: true, app: true, sms: false });
  const [message, setMessage] = useState('');
  const [attachedImage, setAttachedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [role, setRole] = useState('parent');
  const [userName, setUserName] = useState('');
  const [refId, setRefId] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setRole(localStorage.getItem('userRole') || 'parent');
      setUserName(localStorage.getItem('userName') || '');
      setRefId(localStorage.getItem('userRefId') || '');
    }
  }, []);

  const [dbStudents, setDbStudents] = useState<any[]>([]);
  const [dbClasses, setDbClasses] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);

  const fetchMessages = async () => {
    try {
      let query = '';
      if (role === 'parent' && refId) {
        query = `?parentRefId=${refId}`;
      } else {
        if (recipientType === 'all') query = `?classId=all`;
        else if (recipientTarget) query = `?classId=${recipientType === 'class' ? recipientTarget : 'individual-' + recipientTarget}`;
      }
      
      if (query || role === 'parent' || role === 'principal' || role === 'vice_principal') {
        const res = await fetch(`/api/messages${query}`);
        if (res.ok) setMessages(await res.json());
      }
    } catch(e) {}
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resSt, resCl] = await Promise.all([
          fetch('/api/students'), fetch('/api/classes')
        ]);
        if (resSt.ok) setDbStudents(await resSt.json());
        if (resCl.ok) setDbClasses(await resCl.json());
      } catch (error) { console.error('Failed to fetch data', error); }
    };
    fetchData();
  }, []);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [role, refId, recipientType, recipientTarget]);
  
  const handleSendMessage = async () => {
    if (!message.trim() && !attachedImage) return alert('Vui lòng nhập nội dung hoặc đính kèm ảnh!');
    if (recipientType === 'class' && !recipientTarget) return alert('Vui lòng chọn lớp!');
    if (recipientType === 'individual' && !recipientTarget) return alert('Vui lòng chọn phụ huynh!');

    try {
      let uploadedImageUrl = null;
      if (attachedImage) {
        const formData = new FormData();
        formData.append('file', attachedImage);
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          uploadedImageUrl = uploadData.url;
        } else {
          return alert('Lỗi tải ảnh lên!');
        }
      }

      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId: recipientType === 'all' ? 'all' : (recipientType === 'class' ? recipientTarget : 'individual-' + recipientTarget),
          senderName: userName || 'Ban Giám Hiệu',
          senderRole: role,
          content: message,
          imageUrl: uploadedImageUrl
        })
      });
      if (res.ok) {
        alert('Tin nhắn đã được gửi thành công!');
        setMessage('');
        setAttachedImage(null);
        setImagePreview('');
        fetchMessages();
        fetch('/api/logs', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ action: 'Gửi thông báo', detail: `Gửi thông báo đến ${recipientType === 'class' ? 'lớp' : 'cá nhân'} ${recipientTarget}`, user: role === 'principal' ? 'Hiệu Trưởng' : (role === 'vice_principal' ? 'Phó HT' : 'Giáo Viên') }) }).catch(()=>{});
      }
    } catch (e) {
      alert('Lỗi gửi tin nhắn');
    }
  };

  return (
    <div className="animate-fade-in-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.8rem', color: 'var(--secondary)', margin: 0 }}>Bảng Tin & Thông Báo</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: role === 'parent' ? '1fr' : '2fr 1fr', gap: '2rem' }}>
        {/* Soạn thảo (Ẩn với phụ huynh) */}
        {role !== 'parent' && (
        <div className="glass-panel" style={{ background: 'white', borderRadius: '24px', padding: '2.5rem' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.3rem' }}><span>✏️</span> Soạn Thảo Thông Báo</h3>
          
          <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontWeight: 600, color: 'var(--secondary)', marginBottom: '0.8rem' }}>Đối tượng nhận</label>
              <select className="form-control" value={recipientType} onChange={e => { setRecipientType(e.target.value); setRecipientTarget(''); }} style={{ padding: '0.8rem', width: '100%' }}>
                <option value="all">Tất cả phụ huynh toàn trường</option>
                <option value="class">Chọn theo Khối / Lớp</option>
                <option value="individual">Chọn phụ huynh cụ thể</option>
              </select>
            </div>
            {recipientType === 'class' && (
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontWeight: 600, color: 'var(--secondary)', marginBottom: '0.8rem' }}>Chọn Lớp</label>
                <select className="form-control" value={recipientTarget} onChange={e => setRecipientTarget(e.target.value)} style={{ padding: '0.8rem', width: '100%' }}>
                  <option value="">-- Chọn lớp --</option>
                  {dbClasses.filter(c => role === 'teacher' ? (c.teachers || c.teacher || '').includes(userName) : true).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            )}
            {recipientType === 'individual' && (
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontWeight: 600, color: 'var(--secondary)', marginBottom: '0.8rem' }}>Chọn Học sinh</label>
                <select className="form-control" value={recipientTarget} onChange={e => setRecipientTarget(e.target.value)} style={{ padding: '0.8rem', width: '100%' }}>
                  <option value="">-- Chọn học sinh --</option>
                  {dbStudents.map(s => {
                    const cName = dbClasses.find(c => c.id === s.classId)?.name || 'Chưa xếp lớp';
                    return <option key={s.id} value={s.id}>{s.lastName} {s.firstName} ({cName}) - PH: {s.parentName || '---'}</option>
                  })}
                </select>
              </div>
            )}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: 600, color: 'var(--secondary)', marginBottom: '0.8rem' }}>Kênh phát sóng</label>
            <div style={{ display: 'flex', gap: '2rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={channel.zalo} onChange={e => setChannel({...channel, zalo: e.target.checked})} />
                <span style={{ fontWeight: 600, color: '#0068FF' }}>Zalo OA</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={channel.app} onChange={e => setChannel({...channel, app: e.target.checked})} />
                <span style={{ fontWeight: 600, color: '#4CAF50' }}>Mobile App (Push Noti)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={channel.sms} onChange={e => setChannel({...channel, sms: e.target.checked})} />
                <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>SMS Truyền thống</span>
              </label>
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
              <label style={{ fontWeight: 600, color: 'var(--secondary)' }}>Nội dung thông báo</label>
              <div>
                <input type="file" id="image-upload" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setAttachedImage(e.target.files[0]);
                    setImagePreview(URL.createObjectURL(e.target.files[0]));
                  }
                }} />
                <button className="btn-secondary" onClick={() => document.getElementById('image-upload')?.click()} style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span>📎</span> Đính kèm ảnh
                </button>
              </div>
            </div>
            
            <textarea 
              className="form-control" 
              value={message} 
              onChange={e => setMessage(e.target.value)}
              onPaste={(e) => {
                const items = e.clipboardData.items;
                for (let i = 0; i < items.length; i++) {
                  if (items[i].type.indexOf('image') !== -1) {
                    const blob = items[i].getAsFile();
                    if (blob) {
                      setAttachedImage(blob);
                      setImagePreview(URL.createObjectURL(blob));
                    }
                  }
                }
              }}
              placeholder="Nhập nội dung hoặc dán ảnh (Ctrl+V) vào đây..." 
              style={{ height: '150px', resize: 'vertical' }}
            ></textarea>
            
            {imagePreview && (
              <div style={{ marginTop: '1rem', position: 'relative', display: 'inline-block' }}>
                <img src={imagePreview} alt="Preview" style={{ maxHeight: '150px', borderRadius: '12px', border: '2px solid rgba(0,0,0,0.1)' }} />
                <button onClick={() => { setAttachedImage(null); setImagePreview(''); }} style={{ position: 'absolute', top: '-10px', right: '-10px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '25px', height: '25px', cursor: 'pointer', fontWeight: 'bold' }}>×</button>
              </div>
            )}
          </div>

          <button onClick={handleSendMessage} className="btn-primary" style={{ width: '100%', padding: '1.2rem', fontSize: '1.1rem', borderRadius: '12px' }}>
            Bắn Thông Báo Khẩn
          </button>
        </div>
        )}

        {/* Message History */}
        <div className="glass-panel" style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: 'var(--secondary)' }}>{role === 'parent' ? 'Bảng Tin Gần Đây' : `Lịch Sử Trò Chuyện ${recipientType === 'class' && recipientTarget ? '(Lớp đã chọn)' : ''}`}</h3>
          {messages.length === 0 ? (
            <div style={{ color: 'var(--text-muted)' }}>Chưa có tin nhắn nào.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {messages.map(msg => (
                <div key={msg.id} style={{ display: 'flex', gap: '1rem', background: (msg.senderRole === 'admin' || msg.senderRole === 'principal' || msg.senderRole === 'vice_principal') ? 'rgba(33,150,243,0.05)' : '#f9f9f9', padding: '1rem', borderRadius: '12px', alignSelf: (msg.senderRole === 'admin' || msg.senderRole === 'principal' || msg.senderRole === 'vice_principal') ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: (msg.senderRole === 'admin' || msg.senderRole === 'principal' || msg.senderRole === 'vice_principal') ? 'var(--primary)' : '#4CAF50', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontWeight: 'bold', flexShrink: 0 }}>
                    {msg.senderName.charAt(0)}
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--secondary)' }}>{msg.senderName}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '1rem' }}>{new Date(msg.timestamp).toLocaleString('vi-VN')}</span>
                    </div>
                    {msg.imageUrl && (
                      <div style={{ marginBottom: '0.5rem' }}>
                        <img src={msg.imageUrl} alt="Đính kèm" onClick={() => setSelectedImage(msg.imageUrl)} style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px', cursor: 'pointer' }} />
                      </div>
                    )}
                    <div style={{ lineHeight: 1.4, whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {selectedImage && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }} onClick={() => setSelectedImage(null)}>
          <img src={selectedImage} alt="Phóng to" style={{ maxWidth: '90%', maxHeight: '90%', borderRadius: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} />
          <button onClick={() => setSelectedImage(null)} style={{ position: 'absolute', top: '20px', right: '30px', background: 'none', border: 'none', color: 'white', fontSize: '2rem', cursor: 'pointer' }}>×</button>
        </div>
      )}
    </div>
  );
}
