'use client';
export default function CameraPage() {
  return (
    <div className="animate-fade-in-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.8rem', color: 'var(--secondary)', margin: 0 }}>Hệ Thống Camera Giám Sát</h2>
        <select className="form-control" style={{ width: '250px' }}>
          <option>Hiển thị: Tất cả Camera</option>
          <option>Camera Lớp Lá 1</option>
          <option>Camera Sân Chơi</option>
        </select>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2.5rem' }}>
        <div style={{ background: '#111', borderRadius: '16px', aspectRatio: '16/9', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
          <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', background: 'rgba(233, 30, 99, 0.9)', padding: '0.4rem 1rem', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '8px', height: '8px', background: 'white', borderRadius: '50%', display: 'inline-block', animation: 'pulse 1.5s infinite' }}></span> LIVE
          </div>
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>📹</span>
            <p>Tín hiệu Camera Sân Chơi đang tải...</p>
          </div>
        </div>
        <div style={{ background: '#111', borderRadius: '16px', aspectRatio: '16/9', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
          <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', background: 'rgba(233, 30, 99, 0.9)', padding: '0.4rem 1rem', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '8px', height: '8px', background: 'white', borderRadius: '50%', display: 'inline-block', animation: 'pulse 1.5s infinite' }}></span> LIVE
          </div>
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>📹</span>
            <p>Tín hiệu Camera Lớp Lá 1 đang tải...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
