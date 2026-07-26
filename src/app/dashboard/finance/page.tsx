'use client';
import { useState, useEffect } from 'react';

export default function FinancePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);

  const [role, setRole] = useState('parent');
  const [refId, setRefId] = useState('');

  const fetchInvoices = async () => {
    try {
      const res = await fetch('/api/invoices');
      if (res.ok) setInvoices(await res.json());
    } catch(e) {}
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setRole(localStorage.getItem('userRole') || 'parent');
      setRefId(localStorage.getItem('userRefId') || '');
    }
    fetchInvoices();
  }, []);

  const [newStudent, setNewStudent] = useState('');
  const [newItems, setNewItems] = useState([
    { name: 'Học phí', amount: '' },
    { name: 'Tiền ăn', amount: '' }
  ]);

  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);

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

  const handleAddItem = () => {
    setNewItems([...newItems, { name: '', amount: '' }]);
  };

  const handleItemChange = (index: number, field: string, value: string) => {
    const updated = [...newItems];
    if (field === 'amount') {
      const raw = value.replace(/,/g, '').replace(/\D/g, '');
      updated[index].amount = raw ? parseInt(raw).toLocaleString('en-US') : '';
    } else {
      updated[index].name = value;
    }
    setNewItems(updated);
  };

  const calculateTotal = () => {
    return newItems.reduce((acc, curr) => {
      const val = parseInt(curr.amount.replace(/,/g, '') || '0');
      return acc + val;
    }, 0);
  };

  const handleCreateInvoice = async () => {
    if (!newStudent) return alert('Vui lòng chọn học sinh');
    
    const validItems = newItems.filter(i => i.name && i.amount);
    if (validItems.length === 0) return alert('Vui lòng nhập ít nhất 1 khoản thu');

    const total = validItems.reduce((sum, item) => sum + parseInt(item.amount.replace(/,/g, '') || '0'), 0);
    
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: newStudent,
          title: `Phiếu thu tháng ${new Date().getMonth() + 1}`,
          items: validItems.map(i => ({ name: i.name, amount: parseInt(i.amount.replace(/,/g, '')) })),
          total: total
        })
      });
      if (res.ok) {
        await fetchInvoices();
        setIsModalOpen(false);
        setNewStudent('');
        setNewItems([{ name: 'Học phí', amount: '' }, { name: 'Tiền ăn', amount: '' }]);
      }
    } catch(e) {}
  };

  const handlePay = async (id: string) => {
    try {
      const res = await fetch(`/api/invoices/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Đã Thanh Toán' })
      });
      if (res.ok) {
        await fetchInvoices();
        alert('Cập nhật trạng thái thành công!');
        fetch('/api/logs', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ action: 'Duyệt thanh toán', detail: `Duyệt hóa đơn #${id}`, user: role === 'principal' ? 'Hiệu Trưởng' : 'Phó Hiệu Trưởng' }) }).catch(()=>{});
      }
    } catch(e) {}
  };

  const handleApproveAll = async () => {
    const pendingInvoices = invoices.filter(inv => inv.status === 'Chờ Thanh Toán');
    if (pendingInvoices.length === 0) return alert('Không có hóa đơn nào đang chờ duyệt!');
    
    if (!confirm(`Bạn có chắc chắn muốn duyệt đồng loạt ${pendingInvoices.length} hóa đơn?`)) return;

    try {
      let count = 0;
      for (const inv of pendingInvoices) {
        const res = await fetch(`/api/invoices/${encodeURIComponent(inv.id)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Đã Thanh Toán' })
        });
        if (res.ok) count++;
      }
      await fetchInvoices();
      alert(`Đã duyệt thành công ${count} hóa đơn!`);
      fetch('/api/logs', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ action: 'Duyệt thanh toán hàng loạt', detail: `Duyệt ${count} hóa đơn`, user: role === 'principal' ? 'Hiệu Trưởng' : 'Phó Hiệu Trưởng' }) }).catch(()=>{});
    } catch(e) {
      alert('Lỗi trong quá trình duyệt');
    }
  };

  const handleExportCSV = () => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    // Lấy doanh thu đã thu
    const paidInvoices = invoices.filter(inv => inv.status === 'Đã Thanh Toán');
    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);
    
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += `BÁO CÁO DOANH THU THÁNG ${currentMonth}/${currentYear}\n`;
    csvContent += `Tổng doanh thu đã thu:,${totalRevenue} VND\n\n`;
    csvContent += "Mã Hóa Đơn,Học Sinh,Tổng Tiền,Trạng Thái\n";
    
    invoices.forEach(e => {
      csvContent += `${e.id},"${e.studentName}",${e.total},${e.status}\n`;
    });
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Bao_Cao_Doanh_Thu_Thang_${currentMonth}_${currentYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.8rem', color: 'var(--secondary)', margin: 0 }}>Quản Lý Tài Chính & Hóa Đơn</h2>
        {(role === 'principal' || role === 'vice_principal') && (
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-secondary" onClick={handleApproveAll} style={{ padding: '0.8rem 1.5rem', borderRadius: '12px', background: 'white', color: '#FF9800', border: '1px solid #FF9800' }}>
            ✓ Duyệt Hàng Loạt
          </button>
          <button className="btn-secondary" onClick={handleExportCSV} style={{ padding: '0.8rem 1.5rem', borderRadius: '12px', background: 'white', color: '#4CAF50', border: '1px solid #4CAF50' }}>
            📊 Xuất Báo Cáo Tháng
          </button>
          <button className="btn-primary" onClick={() => setIsModalOpen(true)} style={{ padding: '0.8rem 1.5rem', borderRadius: '12px' }}>
            + Tạo Hóa Đơn Tùy Biến
          </button>
        </div>
        )}
      </div>
      <div className="glass-panel" style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(0,0,0,0.02)', textAlign: 'left', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
              <th style={{ padding: '1.2rem', color: 'var(--text-muted)' }}>Mã Hóa Đơn</th>
              <th style={{ padding: '1.2rem', color: 'var(--text-muted)' }}>Học Sinh (Tổng Cần Nộp)</th>
              <th style={{ padding: '1.2rem', color: 'var(--text-muted)' }}>Khoản Thu Chi Tiết</th>
              <th style={{ padding: '1.2rem', color: 'var(--text-muted)' }}>Trạng Thái & Lịch Sử</th>
            </tr>
          </thead>
          <tbody>
            {invoices.filter(inv => {
              if (role === 'parent') return inv.studentId == refId;
              return true;
            }).map((inv, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                <td style={{ padding: '1.2rem', fontWeight: 600 }}>{inv.id}</td>
                <td style={{ padding: '1.2rem' }}>
                  <div style={{ fontWeight: 600, color: 'var(--secondary)' }}>{inv.studentName}</div>
                  {inv.parentName && <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>PH: {inv.parentName}</div>}
                  <div style={{ color: '#E91E63', fontWeight: 'bold', fontSize: '1.2rem', marginTop: '0.3rem' }}>{inv.total.toLocaleString('vi-VN')} đ</div>
                </td>
                <td style={{ padding: '1.2rem' }}>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
                    {inv.items.map((item: any, i: number) => (
                      <li key={i}>{item.name}: <strong>{item.amount.toLocaleString('vi-VN')} đ</strong></li>
                    ))}
                  </ul>
                </td>
                <td style={{ padding: '1.2rem' }}>
                  <div style={{ background: inv.status === 'Đã Thanh Toán' ? 'rgba(76,175,80,0.1)' : 'rgba(255,152,0,0.1)', color: inv.status === 'Đã Thanh Toán' ? '#4CAF50' : '#FF9800', padding: '0.4rem 1rem', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 600, display: 'inline-block', marginBottom: '0.5rem', border: `1px solid ${inv.status === 'Đã Thanh Toán' ? '#4CAF50' : '#FF9800'}` }}>{inv.status}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{inv.time}</div>
                  
                  {inv.status === 'Chờ Thanh Toán' && (role === 'principal' || role === 'vice_principal') && (
                    <button 
                      onClick={() => handlePay(inv.id)}
                      style={{ marginTop: '0.8rem', display: 'block', background: 'white', color: 'var(--primary)', border: '1px solid var(--primary)', padding: '0.4rem 0.8rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold', transition: 'all 0.2s' }}
                      onMouseOver={(e) => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = 'white'; }}
                      onMouseOut={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = 'var(--primary)'; }}
                    >
                      ✓ Xác nhận Đã Thu
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }}>
          <div className="glass-panel" style={{ background: 'white', width: '100%', maxWidth: '600px', padding: '2.5rem', borderRadius: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--secondary)', fontSize: '1.5rem' }}>Tạo Hóa Đơn Đa Hạng Mục</h3>
            
            <div className="input-group">
              <label>Chọn Học Sinh</label>
              <select className="form-control" value={newStudent} onChange={e => setNewStudent(e.target.value)} style={{ padding: '0.8rem', fontSize: '1.05rem', fontWeight: 600 }}>
                <option value="">-- Chọn học sinh --</option>
                {students.map(s => {
                  const sClass = classes.find(c => c.id === s.classId);
                  const className = sClass ? sClass.name : 'Chưa xếp lớp';
                  const label = `${s.lastName} ${s.firstName} (${className}) - PH: ${s.parentName || 'Chưa cập nhật'}`;
                  return <option key={s.id} value={s.id}>{label}</option>
                })}
              </select>
            </div>

            <div style={{ background: '#f9f9f9', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
              <label style={{ fontWeight: 'bold', color: 'var(--secondary)', display: 'block', marginBottom: '1rem' }}>Các khoản thu chi tiết</label>
              {newItems.map((item, index) => (
                <div key={index} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
                  <input type="text" className="form-control" value={item.name} onChange={e => handleItemChange(index, 'name', e.target.value)} placeholder="Tên khoản thu (Dã ngoại...)" style={{ flex: 1, fontWeight: 600 }} />
                  <div style={{ position: 'relative', flex: 1 }}>
                    <input type="text" className="form-control" value={item.amount} onChange={e => handleItemChange(index, 'amount', e.target.value)} placeholder="Nhập số tiền..." style={{ paddingRight: '45px', fontSize: '1.3rem', fontWeight: 'bold', color: '#E91E63', textAlign: 'right' }} />
                    <span style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 'bold' }}>đ</span>
                  </div>
                </div>
              ))}
              <button type="button" onClick={handleAddItem} style={{ background: 'none', border: '1px dashed var(--primary)', color: 'var(--primary)', padding: '0.8rem', width: '100%', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>+ Thêm khoản thu khác</button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(233,30,99,0.1)', padding: '1rem 1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--secondary)' }}>Tổng Cộng Hóa Đơn:</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#E91E63' }}>{calculateTotal().toLocaleString('en-US')} đ</span>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn-secondary" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '1rem' }}>Hủy Bỏ</button>
              <button className="btn-primary" onClick={handleCreateInvoice} style={{ flex: 1, padding: '1rem' }}>Lưu Phiếu Thu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
