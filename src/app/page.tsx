'use client';
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);

  const navItemStyle = (item: string) => ({
    textDecoration: 'none',
    color: hoveredNav === item ? 'var(--primary)' : 'var(--text-main)',
    fontWeight: 600,
    transition: 'var(--transition)'
  });

  return (
    <main className="container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '2rem 0' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6rem', zIndex: 10 }} className="animate-fade-in-up">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          <div style={{ position: 'relative', width: '75px', height: '75px', borderRadius: '50%', overflow: 'hidden', boxShadow: '0 8px 25px rgba(255,123,84,0.3)', border: '3px solid white' }}>
            <Image 
              src="/logo.jpg" 
              alt="KinderCare Logo" 
              fill
              sizes="75px"
              style={{ objectFit: 'cover' }}
              priority
            />
          </div>
          <h2 style={{ margin: 0, fontSize: '2.2rem', background: 'linear-gradient(135deg, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.5px' }}>
            KinderCare
          </h2>
        </div>
        <nav style={{ display: 'flex', gap: '2.5rem', alignItems: 'center', background: 'var(--glass-bg)', padding: '0.8rem 2.5rem', borderRadius: '50px', backdropFilter: 'blur(10px)', border: '1px solid var(--glass-border)', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          {['Trang chủ', 'Tính năng', 'Bảng giá', 'Liên hệ'].map(item => (
            <a 
              key={item}
              href="#" 
              style={navItemStyle(item)}
              onMouseEnter={() => setHoveredNav(item)}
              onMouseLeave={() => setHoveredNav(null)}
            >
              {item}
            </a>
          ))}
        </nav>
        <div>
          <Link href="/login" className="btn-primary">
            Vào hệ thống
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', maxWidth: '950px', margin: '0 auto', gap: '2.5rem', position: 'relative', zIndex: 10 }}>
        <div className="animate-fade-in-up delay-1" style={{ display: 'inline-block', padding: '0.6rem 2rem', background: 'rgba(255, 123, 84, 0.1)', color: 'var(--primary)', borderRadius: '50px', fontWeight: 600, fontSize: '1.1rem', marginBottom: '-1rem', border: '1px solid rgba(255, 123, 84, 0.3)' }}>
          ✨ Nền Tảng Chuyển Đổi Số Toàn Diện Mới Nhất 2026
        </div>
        <h1 style={{ fontSize: '4.8rem', lineHeight: 1.15, letterSpacing: '-1.5px', textShadow: '0 4px 15px rgba(0,0,0,0.05)' }} className="animate-fade-in-up delay-2">
          Quản Lý Trường Mầm Non <br/> 
          <span style={{ color: 'var(--primary)' }}>Chuyên Nghiệp</span> & <span style={{ color: 'var(--secondary)' }}>Thông Minh</span>
        </h1>
        <p style={{ fontSize: '1.35rem', maxWidth: '750px', margin: '0 auto', lineHeight: 1.8 }} className="animate-fade-in-up delay-3">
          Phần mềm KinderCare kết nối chặt chẽ giữa Ban giám hiệu, Giáo viên và Phụ huynh. 
          Thiết kế cao cấp, tối ưu hóa vận hành, đảm bảo an toàn và mang lại trải nghiệm tuyệt vời cho sự phát triển của trẻ.
        </p>
        
        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2rem' }} className="animate-fade-in-up delay-4">
          <Link href="/login" className="btn-primary" style={{ padding: '1.2rem 3.5rem', fontSize: '1.2rem' }}>
            Đăng Nhập Hệ Thống
          </Link>
          <a href="#" className="btn-secondary" style={{ padding: '1.2rem 3.5rem', fontSize: '1.2rem' }}>
            Xem Video Demo <span>▶</span>
          </a>
        </div>
      </div>

      {/* Features Cards */}
      <div className="grid-cards animate-fade-in-up delay-4" style={{ marginTop: '8rem', zIndex: 10, paddingBottom: '4rem' }}>
        <div className="glass-panel" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.1))' }}>👨‍👩‍👧‍👦</div>
          <h3 style={{ fontSize: '1.8rem' }}>Kết Nối Phụ Huynh</h3>
          <p style={{ fontSize: '1.1rem' }}>Nhắn tin trực tiếp với giáo viên, nhận thông báo đẩy tức thời và theo dõi camera lớp học 24/7 với bảo mật cao.</p>
        </div>
        <div className="glass-panel" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.1))' }}>🏥</div>
          <h3 style={{ fontSize: '1.8rem' }}>Sức Khỏe & Dinh Dưỡng</h3>
          <p style={{ fontSize: '1.1rem' }}>Cập nhật chỉ số BMI, lịch sử khám bệnh, nhắc nhở uống thuốc và theo dõi thực đơn ăn uống mỗi ngày siêu chi tiết.</p>
        </div>
        <div className="glass-panel" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.1))' }}>📊</div>
          <h3 style={{ fontSize: '1.8rem' }}>Quản Trị Tối Ưu</h3>
          <p style={{ fontSize: '1.1rem' }}>Bảng điều khiển thông minh cho Ban giám hiệu: quản lý điểm danh, thu chi học phí, đánh giá giáo viên trực quan nhất.</p>
        </div>
      </div>
    </main>
  );
}
