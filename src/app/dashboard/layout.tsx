'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [role, setRole] = useState('principal'); // principal, teacher, parent
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const [unreadCount, setUnreadCount] = useState(0);
  const [activities, setActivities] = useState<any[]>([]);
  const [showNoti, setShowNoti] = useState(false);

  useEffect(() => {
    const isAuth = localStorage.getItem('isAuthenticated');
    if (!isAuth) {
      router.push('/login');
      return;
    }
    const user = {
      role: localStorage.getItem('userRole') || 'parent',
      name: localStorage.getItem('userName') || '',
      email: localStorage.getItem('userEmail') || '',
      refId: localStorage.getItem('userRefId') || ''
    };
    setCurrentUser(user);
    setRole(user.role);

    const fetchNoti = async () => {
      try {
        const res = await fetch('/api/activities');
        if (res.ok) {
          const data = await res.json();
          setActivities(data.activities);
          setUnreadCount(data.unreadCount);
        }
      } catch (err) {}
    };
    fetchNoti();
    // Poll every 5s for demo
    const interval = setInterval(fetchNoti, 5000);
    return () => clearInterval(interval);
  }, []);

  const subscribeUser = async (currentRole: string) => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        });
        
        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription, role: currentRole })
        });
      } catch (err) {
        console.error('Push setup failed:', err);
      }
    }
  };

  useEffect(() => {
    if (role && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') subscribeUser(role);
        });
      } else if (Notification.permission === 'granted') {
        subscribeUser(role);
      }
    }
  }, [role]);


  const handleOpenNoti = async () => {
    setShowNoti(!showNoti);
    if (!showNoti && unreadCount > 0) {
      setUnreadCount(0);
      try { await fetch('/api/activities', { method: 'PUT' }); } catch (err) {}
    }
  };

  const navItems = [
    { name: 'Tổng Quan', path: '/dashboard', icon: '📊', roles: ['principal', 'vice_principal', 'teacher', 'parent'] },
    { name: 'Học Sinh', path: '/dashboard/students', icon: '👩‍🎓', roles: ['principal', 'vice_principal', 'teacher', 'parent'] },
    { name: 'Giáo Viên', path: '/dashboard/teachers', icon: '👩‍🏫', roles: ['principal', 'vice_principal'] },
    { name: 'Lớp Học', path: '/dashboard/classes', icon: '🏫', roles: ['principal', 'vice_principal', 'teacher', 'parent'] },
    { name: 'Điểm Danh', path: '/dashboard/attendance', icon: '✅', roles: ['principal', 'vice_principal', 'teacher', 'parent'] },
    { name: 'Lịch Học', path: '/dashboard/schedule', icon: '📅', roles: ['principal', 'vice_principal', 'teacher', 'parent'] },
    { name: 'Sức Khỏe & Ăn Uống', path: '/dashboard/health', icon: '🏥', roles: ['principal', 'vice_principal', 'teacher', 'parent'] },
    { name: 'Tài Chính', path: '/dashboard/finance', icon: '💰', roles: ['principal', 'vice_principal', 'parent'] },
    { name: 'Đưa Đón', path: '/dashboard/pickup', icon: '🚗', roles: ['principal', 'vice_principal', 'teacher', 'parent'] },
    { name: 'Bảng Tin & Thông Báo', path: '/dashboard/messages', icon: '💬', roles: ['principal', 'vice_principal', 'teacher', 'parent'] },
    { name: 'Cài Đặt', path: '/dashboard/settings', icon: '⚙️', roles: ['principal', 'vice_principal', 'teacher', 'parent'] },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Background Shapes */}
      <div className="bg-shape shape-1"></div>
      <div className="bg-shape shape-2"></div>
      <div className="bg-shape shape-3"></div>

      {/* Sidebar */}
      <aside className="desktop-sidebar" style={{ width: isSidebarOpen ? '280px' : '90px', background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(24px)', borderRight: '1px solid rgba(255, 255, 255, 0.5)', transition: 'var(--transition)', display: 'flex', flexDirection: 'column', zIndex: 100, boxShadow: '4px 0 30px rgba(0,0,0,0.03)' }}>
        <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid rgba(0,0,0,0.05)', minHeight: '85px' }}>
          <div style={{ position: 'relative', width: '45px', height: '45px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '2px solid var(--primary)' }}>
            <Image src="/logo.jpg" alt="Logo" fill sizes="45px" style={{ objectFit: 'cover' }} />
          </div>
          {isSidebarOpen && <h3 style={{ margin: 0, color: 'var(--primary)', fontSize: '1.4rem' }}>KinderCare</h3>}
        </div>
        
        <nav style={{ flex: 1, padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {navItems.filter(item => item.roles.includes(role)).map(item => {
            const isActive = pathname === item.path;
            return (
              <Link key={item.path} href={item.path} style={{
                display: 'flex', alignItems: 'center', gap: '1.2rem', padding: '1rem 1.2rem', borderRadius: '14px',
                textDecoration: 'none', transition: 'var(--transition)',
                background: isActive ? 'linear-gradient(135deg, var(--primary) 0%, #6366F1 100%)' : 'transparent',
                color: isActive ? 'white' : 'var(--text-main)',
                fontWeight: isActive ? 600 : 500,
                boxShadow: isActive ? '0 4px 15px rgba(79, 70, 229, 0.25)' : 'none'
              }} onMouseOver={(e) => { if (!isActive) e.currentTarget.style.background = 'rgba(79, 70, 229, 0.08)' }} onMouseOut={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent' }}>
                <span style={{ fontSize: '1.3rem' }}>{item.icon}</span>
                {isSidebarOpen && <span style={{ whiteSpace: 'nowrap' }}>{item.name}</span>}
              </Link>
            )
          })}
        </nav>

        <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} style={{ background: 'rgba(0,0,0,0.03)', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '1rem', width: '100%', padding: '0.8rem 1.2rem', borderRadius: '12px', transition: 'var(--transition)' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.08)'} onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.03)'}>
            <span style={{ fontSize: '1.2rem' }}>{isSidebarOpen ? '◀' : '▶'}</span>
            {isSidebarOpen && <span style={{ fontWeight: 500 }}>Thu gọn menu</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', zIndex: 10 }}>
        {/* Topbar */}
        <header className="topbar" style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(20px)', padding: '1rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.8)', position: 'sticky', top: 0, zIndex: 90, minHeight: '85px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--secondary)' }}>{role === 'parent' ? 'Hồ Sơ Của Bé' : 'Bảng Điều Khiển'}</h2>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.2rem' }}>Thứ Ba, 14 Tháng 7, 2026</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <div style={{ position: 'relative' }}>
              <div onClick={handleOpenNoti} style={{ position: 'relative', cursor: 'pointer', transition: 'var(--transition)' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                <span style={{ fontSize: '1.5rem' }}>🔔</span>
                {unreadCount > 0 && (
                  <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#E91E63', color: 'white', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.75rem', fontWeight: 'bold', border: '2px solid white' }}>{unreadCount}</span>
                )}
              </div>
              {showNoti && (
                <div style={{ position: 'absolute', top: '150%', right: 0, width: '350px', background: 'white', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', border: '1px solid rgba(0,0,0,0.05)', padding: '1rem', zIndex: 100 }}>
                  <h4 style={{ margin: '0 0 1rem 0', color: 'var(--secondary)' }}>Thông báo mới nhất</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '350px', overflowY: 'auto' }}>
                    {activities.length > 0 ? activities.slice(0, 5).map(act => (
                      <div key={act.id} style={{ padding: '0.8rem', background: act.isRead ? 'transparent' : 'rgba(33, 150, 243, 0.05)', borderRadius: '12px', border: act.isRead ? 'none' : '1px solid rgba(33, 150, 243, 0.2)' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{act.time}</div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginTop: '0.2rem' }}>{act.message}</div>
                      </div>
                    )) : <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textAlign: 'center' }}>Không có thông báo nào.</p>}
                  </div>
                </div>
              )}
            </div>
            <div onClick={() => {
                if (confirm('Bạn có muốn đăng xuất?')) {
                  localStorage.clear();
                  router.push('/login');
                }
              }} style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', cursor: 'pointer', background: 'white', padding: '0.5rem 1.2rem', borderRadius: '50px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.02)' }} title="Nhấn để đăng xuất">
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--secondary)' }}>
                  {currentUser?.name || 'Đang tải...'}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>
                  {role === 'principal' ? 'Hiệu Trưởng' : (role === 'vice_principal' ? 'Phó Hiệu Trưởng' : (role === 'teacher' ? 'Giáo Viên' : 'Phụ Huynh'))}
                </div>
              </div>
              <div style={{ width: '45px', height: '45px', borderRadius: '14px', background: 'linear-gradient(135deg, var(--primary), #6366F1)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 4px 10px rgba(79, 70, 229, 0.3)' }}>
                {role === 'principal' ? 'H' : (role === 'vice_principal' ? 'PH' : (role === 'teacher' ? 'GV' : 'PH'))}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: '2.5rem', overflowY: 'auto' }}>
          {currentUser ? children : <div style={{textAlign:'center', marginTop:'5rem'}}>Đang tải dữ liệu...</div>}
        </main>
        
        {/* Mobile Bottom Navigation */}
        <nav className="mobile-bottom-nav">
          {navItems.filter(item => item.roles.includes(role)).slice(0, 5).map(item => {
            const isActive = pathname === item.path;
            const shortName = item.name.split(' ')[0] === 'Bảng' ? 'Tin nhắn' : item.name.split(' ')[0] === 'Sức' ? 'Y tế' : item.name.split(' ')[0];
            return (
              <Link key={item.path} href={item.path} className={isActive ? 'active' : ''}>
                <span className="icon">{item.icon}</span>
                <span>{shortName}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  );
}
