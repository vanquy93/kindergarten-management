'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password })
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userRole', data.user.role);
        localStorage.setItem('userRefId', data.user.refId || '');
        localStorage.setItem('userEmail', data.user.email);
        localStorage.setItem('userName', data.user.name);
        router.push('/dashboard');
      } else {
        setError(data.error || 'Tên đăng nhập hoặc mật khẩu không đúng');
      }
    } catch (err) {
      setError('Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-gradient-start)' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
        <div style={{ background: 'white', padding: '3rem', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', width: '100%', maxWidth: '420px', position: 'relative', zIndex: 10 }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ display: 'inline-block', position: 'relative', width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--primary)', marginBottom: '1rem' }}>
               <Image src="/logo.jpg" alt="Logo" fill sizes="80px" style={{ objectFit: 'cover' }} />
            </div>
            <h2 style={{ margin: 0, fontSize: '1.8rem', color: 'var(--secondary)' }}>Chào mừng trở lại</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Vui lòng đăng nhập để tiếp tục</p>
          </div>

          {error && <div style={{ background: '#FFEBEE', color: '#D32F2F', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--secondary)' }}>Tài khoản (SĐT hoặc Tên đăng nhập)</label>
              <input type="text" value={email} onChange={e => setEmail(e.target.value)} required className="form-control" style={{ width: '100%', padding: '1rem', background: '#f9f9f9', border: '1px solid #eee' }} placeholder="Nhập admin hoặc SĐT..." />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{ fontWeight: 600, color: 'var(--secondary)' }}>Mật khẩu</label>
                <a href="#" style={{ fontSize: '0.85rem', color: 'var(--primary)', textDecoration: 'none' }}>Quên mật khẩu?</a>
              </div>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="form-control" style={{ width: '100%', padding: '1rem', background: '#f9f9f9', border: '1px solid #eee' }} placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '1rem', fontSize: '1.1rem', marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
              {loading ? 'Đang xác thực...' : 'Đăng Nhập'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Hệ thống quản lý được cấp bởi Ban Giám Hiệu. <br/><Link href="/" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600, display: 'inline-block', marginTop: '1rem' }}>← Quay lại trang chủ</Link>
          </div>
        </div>
      </div>
      <div style={{ flex: 1, background: 'url(https://images.unsplash.com/photo-1540479859555-17af45c78602?q=80&w=2070&auto=format&fit=crop) center/cover no-repeat', display: 'none' }}></div>
    </div>
  );
}
