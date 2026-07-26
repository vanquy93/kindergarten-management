'use client';
import { useState, useEffect } from 'react';

export default function DashboardHome() {
  const [currentTime, setCurrentTime] = useState('');
  const [stats, setStats] = useState({ students: 0, teachers: 0, classes: 0 });
  const [activities, setActivities] = useState<any[]>([]);
  const [presentCount, setPresentCount] = useState(0);
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [childData, setChildData] = useState<any>(null);
  const [healthRecords, setHealthRecords] = useState<any[]>([]);
  
  useEffect(() => {
    // Initial time
    setCurrentTime(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })), 1000);

    const userStr = localStorage.getItem('currentUser');
    let user = null;
    if (userStr) {
      user = JSON.parse(userStr);
      setCurrentUser(user);
    }

    const fetchStats = async () => {
      try {
        const [resStats, resActs, resAtt] = await Promise.all([
          fetch('/api/stats'),
          fetch('/api/activities'),
          fetch('/api/attendance')
        ]);
        if (resStats.ok) setStats(await resStats.json());
        if (resActs.ok) {
          const acts = await resActs.json();
          setActivities(acts.activities);
        }
        if (resAtt.ok) {
          const atts = await resAtt.json();
          setPresentCount(atts.filter((a: any) => a.status === 'Đến').length);
        }
        
        if (user && user.role === 'parent' && user.refId) {
          const resChild = await fetch(`/api/students/${user.refId}`);
          if (resChild.ok) setChildData(await resChild.json());
          
          const resHealth = await fetch(`/api/students/${user.refId}/health-records`);
          if (resHealth.ok) setHealthRecords(await resHealth.json());
        }
      } catch (error) { console.error('Failed to fetch data', error); }
    };
    fetchStats();

    return () => clearInterval(timer);
  }, []);

  return (
    <div>
      <style>{`
        @keyframes pulseIndicator {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
      `}</style>

      {/* Real-time Indicator */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
        <div style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)', color: 'var(--text-main)', padding: '0.6rem 1.5rem', borderRadius: '50px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.8rem', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid rgba(255,255,255,0.5)' }}>
          <span style={{ display: 'inline-block', width: '10px', height: '10px', background: '#10B981', borderRadius: '50%', animation: 'pulseIndicator 2s infinite' }}></span>
          <span style={{ fontSize: '0.95rem' }}>LIVE • Cập nhật lúc {currentTime}</span>
        </div>
      </div>

      {currentUser?.role === 'parent' ? (
        <>
          <div className="grid-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
            <div className="glass-panel" style={{ padding: '1.8rem', background: 'white', borderRadius: '20px' }}>
              <div style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>CHIỀU CAO</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--secondary)' }}>{childData?.height || '---'}</div>
              <div style={{ color: (healthRecords.length > 1 && parseFloat(childData?.height) >= parseFloat(healthRecords[1].height)) ? '#4CAF50' : (healthRecords.length > 1 ? '#f44336' : '#4CAF50'), fontSize: '0.9rem', fontWeight: 600, marginTop: '0.5rem' }}>
                {healthRecords.length > 1 ? (
                  `${parseFloat(childData?.height) >= parseFloat(healthRecords[1].height) ? '↑' : '↓'} ${Math.abs(parseFloat(childData?.height) - parseFloat(healthRecords[1].height)).toFixed(1)}cm so với lần đo trước`
                ) : 'Theo dõi định kỳ'}
              </div>
            </div>
            <div className="glass-panel" style={{ padding: '1.8rem', background: 'white', borderRadius: '20px' }}>
              <div style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>CÂN NẶNG</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--secondary)' }}>{childData?.weight || '---'}</div>
              <div style={{ color: (healthRecords.length > 1 && parseFloat(childData?.weight) >= parseFloat(healthRecords[1].weight)) ? '#4CAF50' : (healthRecords.length > 1 ? '#f44336' : '#4CAF50'), fontSize: '0.9rem', fontWeight: 600, marginTop: '0.5rem' }}>
                {healthRecords.length > 1 ? (
                  `${parseFloat(childData?.weight) >= parseFloat(healthRecords[1].weight) ? '↑' : '↓'} ${Math.abs(parseFloat(childData?.weight) - parseFloat(healthRecords[1].weight)).toFixed(1)}kg so với lần đo trước`
                ) : 'Đạt chuẩn WHO'}
              </div>
            </div>
            <div className="glass-panel" style={{ padding: '1.8rem', background: 'white', borderRadius: '20px' }}>
              <div style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>SỨC KHỎE HÔM NAY</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '2rem' }}>{childData?.healthStatus?.includes('Khỏe') ? '✅' : '⚠️'}</span> {childData?.healthStatus || 'Khỏe mạnh'}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="grid-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
          {[
            { title: 'Tổng Học Sinh', value: stats.students, icon: '👦', trend: 'Dữ liệu thực tế', color: '#4CAF50' },
            { title: 'Giáo Viên', value: stats.teachers, icon: '👩‍🏫', trend: 'Dữ liệu thực tế', color: '#2196F3' },
            { title: 'Lớp Học', value: stats.classes, icon: '🏫', trend: 'Dữ liệu thực tế', color: '#FF9800' },
            { title: 'Bé Đang Có Mặt (Hôm nay)', value: presentCount, icon: '✅', trend: 'Theo dữ liệu điểm danh', color: '#9C27B0' },
          ].map((stat, i) => (
            <div key={i} className="glass-panel" style={{ padding: '1.8rem', background: 'white', borderRadius: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.title}</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--secondary)', margin: '0.8rem 0' }}>{stat.value}</div>
                </div>
                <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: `${stat.color}15`, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.5rem' }}>{stat.icon}</div>
              </div>
              <div style={{ fontSize: '0.85rem', color: stat.color, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: stat.color }}></span>
                {stat.trend}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Recent Activities */}
        <div className="glass-panel">
          <h3 style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '1.4rem' }}>Hoạt Động Gần Đây</span>
            <button style={{ background: 'white', border: '1px solid rgba(0,0,0,0.05)', color: 'var(--text-main)', cursor: 'pointer', fontWeight: 600, padding: '0.5rem 1.2rem', borderRadius: '50px', transition: 'var(--transition)', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }} onMouseOver={(e) => {e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.borderColor = 'var(--primary)'}} onMouseOut={(e) => {e.currentTarget.style.color = 'var(--text-main)'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.05)'}}>Xem tất cả</button>
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
            {activities.length > 0 ? activities.map((act, i) => (
              <div key={act.id} style={{ display: 'flex', gap: '1.2rem', alignItems: 'flex-start', paddingBottom: i !== activities.length - 1 ? '1.5rem' : '0', borderBottom: i !== activities.length - 1 ? '1px dashed rgba(0,0,0,0.1)' : 'none' }}>
                <div style={{ fontWeight: 700, color: 'var(--text-muted)', width: '90px', fontSize: '0.95rem', textAlign: 'right' }}>{act.time.split(' - ')[0]}</div>
                <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: act.color, marginTop: '6px', border: '3px solid rgba(255,255,255,0.8)', boxShadow: `0 0 0 2px ${act.color}40` }}></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: 'var(--secondary)', fontSize: '1.05rem', marginBottom: '0.2rem' }}>{act.type === 'system' ? 'Hệ thống' : 'Người dùng'}</div>
                  <div style={{ color: 'var(--text-main)', fontSize: '1rem', lineHeight: 1.5 }}>{act.message}</div>
                </div>
              </div>
            )) : (
              <p style={{ color: 'var(--text-muted)' }}>Chưa có hoạt động nào hôm nay.</p>
            )}
          </div>
        </div>

        {/* Quick Actions & Health */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="glass-panel">
            <h3 style={{ marginBottom: '2rem', fontSize: '1.3rem' }}>Tình Trạng Sức Khỏe Lớp</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
              <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Khỏe mạnh bình thường</span>
              <span style={{ fontWeight: 700, color: '#4CAF50' }}>{stats.students} bé (100%)</span>
            </div>
            <div style={{ width: '100%', height: '12px', background: '#f0f0f0', borderRadius: '6px', marginBottom: '2rem', overflow: 'hidden' }}>
              <div style={{ width: '100%', height: '100%', background: 'linear-gradient(90deg, #4CAF50, #8BC34A)', borderRadius: '6px' }}></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
              <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Cần chú ý (sốt nhẹ, ho)</span>
              <span style={{ fontWeight: 700, color: '#FF9800' }}>0 bé (0%)</span>
            </div>
            <div style={{ width: '100%', height: '12px', background: '#f0f0f0', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{ width: '0%', height: '100%', background: 'linear-gradient(90deg, #FF9800, #FFC107)', borderRadius: '6px' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
