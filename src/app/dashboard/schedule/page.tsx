'use client';
import { useState, useEffect } from 'react';

type RowData = {
  id: number;
  session: 'morning' | 'afternoon';
  time: string;
  isMerged: boolean;
  content: string; // for merged
  mon: string;
  tue: string;
  wed: string;
  thu: string;
  fri: string;
  sat: string;
};

const DEFAULT_ROWS: RowData[] = [
  { id: 1, session: 'morning', time: '7h00 - 8h30', isMerged: true, content: 'Cô đón trẻ: quan tâm đến sức khỏe của trẻ. Nhắc nhở trẻ chào hỏi cô và ông bà', mon: '', tue: '', wed: '', thu: '', fri: '', sat: '' },
  { id: 2, session: 'morning', time: '8h30 - 8h45', isMerged: true, content: 'Tập theo nhạc chung của toàn trường: Khởi động bài tập chung, hồi tĩnh\nTrò chuyện về chủ đề', mon: '', tue: '', wed: '', thu: '', fri: '', sat: '' },
  { id: 3, session: 'morning', time: '8h45 - 9h00', isMerged: false, content: '', mon: 'Trò chuyện sáng - Điểm danh - Phụ sáng', tue: 'Trò chuyện sáng - Điểm danh - Phụ sáng', wed: 'Trò chuyện sáng - Điểm danh - Phụ sáng', thu: 'Trò chuyện sáng - Điểm danh - Phụ sáng', fri: 'Trò chuyện sáng - Điểm danh - Phụ sáng', sat: '' },
  { id: 4, session: 'morning', time: '9h00 - 10h30', isMerged: false, content: '', mon: 'Hoạt động học tập', tue: 'Hoạt động học tập', wed: 'Hoạt động ngoài trời', thu: 'Hoạt động học tập', fri: 'Hoạt động học tập', sat: 'Chơi tự do cùng các bạn' },
  { id: 5, session: 'morning', time: '10h30 - 11h30', isMerged: true, content: 'Ăn trưa', mon: '', tue: '', wed: '', thu: '', fri: '', sat: '' },
  { id: 6, session: 'afternoon', time: '11h30 - 14h15', isMerged: true, content: 'Ngủ trưa', mon: '', tue: '', wed: '', thu: '', fri: '', sat: '' },
  { id: 7, session: 'afternoon', time: '14h15 - 16h10', isMerged: false, content: '', mon: 'Vận động khi ngủ dậy - Uống sữa', tue: 'Vận động khi ngủ dậy - Uống sữa', wed: 'Vận động khi ngủ dậy - Uống sữa', thu: 'Vận động khi ngủ dậy - Uống sữa', fri: 'Vận động khi ngủ dậy - Uống sữa', sat: 'Văn nghệ cuối tuần' },
  { id: 8, session: 'afternoon', time: '16h10 - 17h30', isMerged: true, content: 'Trẻ chơi tự do. Trả trẻ: Sửa quần áo, đầu tóc gọn gàng', mon: '', tue: '', wed: '', thu: '', fri: '', sat: '' },
  { id: 9, session: 'afternoon', time: '17h30 - 18h00', isMerged: true, content: 'Trả trẻ muộn', mon: '', tue: '', wed: '', thu: '', fri: '', sat: '' }
];

export default function SchedulePage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [theme, setTheme] = useState('Chủ đề của tuần');
  const [rows, setRows] = useState<RowData[]>([]);

  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [userName, setUserName] = useState('');
  const [refId, setRefId] = useState('');
  const [role, setRole] = useState('parent');
  const [teacherName, setTeacherName] = useState('');
  const [className, setClassName] = useState('');

  const getWeekStartDate = (offset: number) => {
    const curr = new Date();
    const day = curr.getDay(); // 0 is Sunday
    const diff = curr.getDate() - day + (day === 0 ? -6 : 1) + (offset * 7); 
    const d = new Date(curr.setDate(diff));
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const currentWeekStart = getWeekStartDate(weekOffset);

  const fetchPlan = async (cid: string, startDate: string) => {
    if (!cid) return;
    try {
      const res = await fetch(`/api/weekly-plan?classId=${cid}&weekStartDate=${startDate}`);
      if (res.ok) {
        const data = await res.json();
        setTheme(data.theme || 'Chưa cập nhật chủ đề');
        if (data.planData && data.planData.length > 0) {
          setRows(data.planData);
        } else {
          // Defaults if empty
          setRows(DEFAULT_ROWS.map(r => ({...r})));
        }
      }
    } catch(e) {}
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const r = localStorage.getItem('userRole') || 'parent';
      const uName = localStorage.getItem('userName') || '';
      const ref = localStorage.getItem('userRefId') || '';
      setRole(r);
      setUserName(uName);
      setRefId(ref);

      Promise.all([
        fetch('/api/classes').then(res => res.json()),
        fetch('/api/students').then(res => res.json())
      ]).then(([clsData, stData]) => {
        setClasses(clsData);
        let defaultClass = '';
        if (r === 'teacher') {
          const tClass = clsData.find((c: any) => (c.teachers || c.teacher || '').includes(uName));
          if (tClass) defaultClass = tClass.id;
        } else if (r === 'parent') {
          const child = stData.find((s: any) => s.id === ref);
          if (child) defaultClass = child.classId;
        } else {
          if (clsData.length > 0) defaultClass = clsData[0].id;
        }
        setSelectedClassId(defaultClass);
      });
    }
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      const cls = classes.find(c => c.id === selectedClassId);
      if (cls) {
        setClassName(cls.name);
        setTeacherName(cls.teachers || cls.teacher || 'Chưa phân công');
      }
      fetchPlan(selectedClassId, currentWeekStart);
      setIsEditing(false);
    }
  }, [selectedClassId, currentWeekStart, classes]);

  const handleSave = async () => {
    try {
      const res = await fetch('/api/weekly-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId: selectedClassId,
          weekStartDate: currentWeekStart,
          theme,
          planData: rows
        })
      });
      if (res.ok) {
        setIsEditing(false);
        alert('Cập nhật Kế hoạch Giảng dạy thành công!');
      }
    } catch(e) {}
  };

  const updateRow = (id: number, field: keyof RowData, value: string | boolean) => {
    setRows(rows.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const addRow = (session: 'morning' | 'afternoon') => {
    const newId = rows.length > 0 ? Math.max(...rows.map(r => r.id)) + 1 : 1;
    setRows([...rows, { id: newId, session, time: '', isMerged: false, content: '', mon: '', tue: '', wed: '', thu: '', fri: '', sat: '' }]);
  };

  const removeRow = (id: number) => {
    setRows(rows.filter(r => r.id !== id));
  };

  // Tính ngày cho tiêu đề (Tuần từ ... đến ...)
  const getWeekDatesString = () => {
    const start = new Date(currentWeekStart);
    const end = new Date(start);
    end.setDate(start.getDate() + 5); // Sat
    return `Từ ${start.getDate().toString().padStart(2, '0')}/${(start.getMonth() + 1).toString().padStart(2, '0')} đến ${end.getDate().toString().padStart(2, '0')}/${(end.getMonth() + 1).toString().padStart(2, '0')}/${end.getFullYear()}`;
  };

  const morningRows = rows.filter(r => r.session === 'morning');
  const afternoonRows = rows.filter(r => r.session === 'afternoon');

  const cellStyle = { border: '1px solid #1f2937', padding: '0.5rem', textAlign: 'center' as const, fontSize: '0.9rem' };
  const inputStyle = { width: '100%', height: '100%', minHeight: '60px', border: '1px dashed #ccc', padding: '0.3rem', resize: 'vertical' as const, textAlign: 'center' as const };

  return (
    <div style={{ paddingBottom: '3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--secondary)', margin: 0 }}>Lịch Học</h2>
          <select 
            className="form-control" 
            style={{ width: '200px', fontWeight: 'bold' }} 
            value={selectedClassId} 
            onChange={e => setSelectedClassId(e.target.value)}
            disabled={role === 'parent' || role === 'teacher'}
          >
            <option value="">-- Chọn Lớp --</option>
            {classes.map(c => <option key={c.id} value={c.id}>Lớp {c.name}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setWeekOffset(weekOffset - 1)} className="btn-secondary" style={{ padding: '0.5rem 1rem', flex: '1' }}>&laquo; Trước</button>
          <span style={{ fontWeight: 'bold', color: 'var(--primary)', whiteSpace: 'nowrap' }}>Tuần {weekOffset === 0 ? 'hiện tại' : (weekOffset > 0 ? `+${weekOffset}` : weekOffset)}</span>
          <button onClick={() => setWeekOffset(weekOffset + 1)} className="btn-secondary" style={{ padding: '0.5rem 1rem', flex: '1' }}>Sau &raquo;</button>
          
          {role !== 'parent' && selectedClassId && (
            isEditing ? (
              <button className="btn-primary" onClick={handleSave} style={{ background: '#4CAF50', padding: '0.5rem 1.5rem', width: '100%', marginTop: '0.5rem' }}>💾 Lưu Kế Hoạch</button>
            ) : (
              <button className="btn-primary" onClick={() => setIsEditing(true)} style={{ padding: '0.5rem 1.5rem', width: '100%', marginTop: '0.5rem' }}>✏️ Chỉnh Sửa</button>
            )
          )}
        </div>
      </div>

      <div style={{ overflowX: 'auto', background: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #1f2937', minWidth: '1000px', background: '#f8fafc' }}>
          <thead>
            <tr>
              <th colSpan={9} style={{ ...cellStyle, border: '2px solid #1f2937', fontSize: '1.4rem', color: '#1f2937', background: 'white', padding: '1rem' }}>
                KẾ HOẠCH GIẢNG DẠY/ WEEKLY PLAN THÁNG {new Date(currentWeekStart).getMonth() + 1}
              </th>
            </tr>
            <tr>
              <th colSpan={7} style={{ ...cellStyle, background: '#e0e7ff', color: '#b91c1c', fontWeight: 'bold' }}>
                Tuần {new Date(currentWeekStart).getDate() > 21 ? 4 : (new Date(currentWeekStart).getDate() > 14 ? 3 : (new Date(currentWeekStart).getDate() > 7 ? 2 : 1))} tháng {new Date(currentWeekStart).getMonth() + 1} năm {new Date(currentWeekStart).getFullYear()} ({getWeekDatesString()})
              </th>
              <th colSpan={2} style={{ ...cellStyle, background: '#e0e7ff', color: '#b91c1c' }}>
                Lớp/ Class: {className || '...'}
              </th>
            </tr>
            <tr>
              <th colSpan={7} style={{ ...cellStyle, background: '#e0e7ff' }}>
                Chủ đề/Theme: {isEditing ? <input type="text" value={theme} onChange={e => setTheme(e.target.value)} style={{ width: '200px', textAlign: 'center', padding: '2px' }} /> : <span style={{ color: '#b91c1c', fontWeight: 'bold' }}>{theme}</span>}
              </th>
              <th colSpan={2} style={{ ...cellStyle, background: '#e0e7ff', color: '#b91c1c' }}>
                Giáo viên: {teacherName || '...'}
              </th>
            </tr>
            <tr>
              <th style={{ ...cellStyle, background: '#e0e7ff', color: '#b91c1c', width: '80px' }}>Buổi</th>
              <th style={{ ...cellStyle, background: '#e0e7ff', color: '#b91c1c', width: '120px' }}>Thời gian/ Time</th>
              <th style={{ ...cellStyle, background: '#e0e7ff', color: '#b91c1c' }}>Thứ hai/ Monday</th>
              <th style={{ ...cellStyle, background: '#e0e7ff', color: '#b91c1c' }}>Thứ ba/ Tuesday</th>
              <th style={{ ...cellStyle, background: '#e0e7ff', color: '#b91c1c' }}>Thứ tư/ Wednesday</th>
              <th style={{ ...cellStyle, background: '#e0e7ff', color: '#b91c1c' }}>Thứ năm/ Thursday</th>
              <th style={{ ...cellStyle, background: '#e0e7ff', color: '#b91c1c' }}>Thứ sáu/ Friday</th>
              <th style={{ ...cellStyle, background: '#e0e7ff', color: '#b91c1c' }}>Thứ bảy/ Saturday</th>
              {isEditing && <th style={{ ...cellStyle, background: '#f3f4f6', width: '60px' }}>Thao tác</th>}
            </tr>
          </thead>
          <tbody>
            {/* SÁNG */}
            {morningRows.map((row, idx) => (
              <tr key={row.id}>
                {idx === 0 && (
                  <td rowSpan={morningRows.length + (isEditing ? 1 : 0)} style={{ ...cellStyle, fontWeight: 'bold', color: '#b91c1c', verticalAlign: 'middle', background: '#f8fafc' }}>
                    Buổi sáng
                  </td>
                )}
                <td style={{ ...cellStyle, color: '#b91c1c', fontWeight: 'bold' }}>
                  {isEditing ? <input value={row.time} onChange={e => updateRow(row.id, 'time', e.target.value)} style={{ width: '100%', textAlign: 'center' }} /> : row.time}
                </td>
                
                {row.isMerged ? (
                  <td colSpan={5} style={{ ...cellStyle, background: '#bfdbfe' }}>
                    {isEditing ? <textarea value={row.content} onChange={e => updateRow(row.id, 'content', e.target.value)} style={{...inputStyle, background: 'transparent'}} /> : <div style={{ whiteSpace: 'pre-wrap' }}>{row.content}</div>}
                  </td>
                ) : (
                  <>
                    <td style={{ ...cellStyle, background: '#dbeafe' }}>{isEditing ? <textarea value={row.mon} onChange={e => updateRow(row.id, 'mon', e.target.value)} style={inputStyle} /> : <div style={{ whiteSpace: 'pre-wrap' }}>{row.mon}</div>}</td>
                    <td style={{ ...cellStyle, background: '#dbeafe' }}>{isEditing ? <textarea value={row.tue} onChange={e => updateRow(row.id, 'tue', e.target.value)} style={inputStyle} /> : <div style={{ whiteSpace: 'pre-wrap' }}>{row.tue}</div>}</td>
                    <td style={{ ...cellStyle, background: '#dbeafe' }}>{isEditing ? <textarea value={row.wed} onChange={e => updateRow(row.id, 'wed', e.target.value)} style={inputStyle} /> : <div style={{ whiteSpace: 'pre-wrap' }}>{row.wed}</div>}</td>
                    <td style={{ ...cellStyle, background: '#dbeafe' }}>{isEditing ? <textarea value={row.thu} onChange={e => updateRow(row.id, 'thu', e.target.value)} style={inputStyle} /> : <div style={{ whiteSpace: 'pre-wrap' }}>{row.thu}</div>}</td>
                    <td style={{ ...cellStyle, background: '#dbeafe' }}>{isEditing ? <textarea value={row.fri} onChange={e => updateRow(row.id, 'fri', e.target.value)} style={inputStyle} /> : <div style={{ whiteSpace: 'pre-wrap' }}>{row.fri}</div>}</td>
                  </>
                )}

                <td style={{ ...cellStyle, background: '#dbeafe' }}>
                  {isEditing ? <textarea value={row.sat} onChange={e => updateRow(row.id, 'sat', e.target.value)} style={inputStyle} /> : <div style={{ whiteSpace: 'pre-wrap' }}>{row.sat}</div>}
                </td>

                {isEditing && (
                  <td style={{ ...cellStyle, background: '#f3f4f6' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
                      <label style={{ fontSize: '0.75rem', cursor: 'pointer' }}><input type="checkbox" checked={row.isMerged} onChange={e => updateRow(row.id, 'isMerged', e.target.checked)} /> Gộp ngang</label>
                      <button onClick={() => removeRow(row.id)} style={{ color: 'red', border: 'none', background: 'transparent', cursor: 'pointer' }}>Xóa</button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {isEditing && (
              <tr>
                <td colSpan={8} style={{ ...cellStyle, textAlign: 'center' }}>
                  <button onClick={() => addRow('morning')} style={{ padding: '0.3rem 1rem', borderRadius: '4px', border: '1px solid #ccc', cursor: 'pointer', background: 'white' }}>+ Thêm dòng Sáng</button>
                </td>
              </tr>
            )}

            {/* CHIỀU */}
            {afternoonRows.map((row, idx) => (
              <tr key={row.id}>
                {idx === 0 && (
                  <td rowSpan={afternoonRows.length + (isEditing ? 1 : 0)} style={{ ...cellStyle, fontWeight: 'bold', color: '#b91c1c', verticalAlign: 'middle', background: '#f8fafc' }}>
                    Buổi chiều
                  </td>
                )}
                <td style={{ ...cellStyle, color: '#b91c1c', fontWeight: 'bold' }}>
                  {isEditing ? <input value={row.time} onChange={e => updateRow(row.id, 'time', e.target.value)} style={{ width: '100%', textAlign: 'center' }} /> : row.time}
                </td>
                
                {row.isMerged ? (
                  <td colSpan={5} style={{ ...cellStyle, background: '#e0e7ff' }}>
                    {isEditing ? <textarea value={row.content} onChange={e => updateRow(row.id, 'content', e.target.value)} style={{...inputStyle, background: 'transparent'}} /> : <div style={{ whiteSpace: 'pre-wrap' }}>{row.content}</div>}
                  </td>
                ) : (
                  <>
                    <td style={{ ...cellStyle, background: '#e0e7ff' }}>{isEditing ? <textarea value={row.mon} onChange={e => updateRow(row.id, 'mon', e.target.value)} style={inputStyle} /> : <div style={{ whiteSpace: 'pre-wrap' }}>{row.mon}</div>}</td>
                    <td style={{ ...cellStyle, background: '#e0e7ff' }}>{isEditing ? <textarea value={row.tue} onChange={e => updateRow(row.id, 'tue', e.target.value)} style={inputStyle} /> : <div style={{ whiteSpace: 'pre-wrap' }}>{row.tue}</div>}</td>
                    <td style={{ ...cellStyle, background: '#e0e7ff' }}>{isEditing ? <textarea value={row.wed} onChange={e => updateRow(row.id, 'wed', e.target.value)} style={inputStyle} /> : <div style={{ whiteSpace: 'pre-wrap' }}>{row.wed}</div>}</td>
                    <td style={{ ...cellStyle, background: '#e0e7ff' }}>{isEditing ? <textarea value={row.thu} onChange={e => updateRow(row.id, 'thu', e.target.value)} style={inputStyle} /> : <div style={{ whiteSpace: 'pre-wrap' }}>{row.thu}</div>}</td>
                    <td style={{ ...cellStyle, background: '#e0e7ff' }}>{isEditing ? <textarea value={row.fri} onChange={e => updateRow(row.id, 'fri', e.target.value)} style={inputStyle} /> : <div style={{ whiteSpace: 'pre-wrap' }}>{row.fri}</div>}</td>
                  </>
                )}

                <td style={{ ...cellStyle, background: '#e0e7ff' }}>
                  {isEditing ? <textarea value={row.sat} onChange={e => updateRow(row.id, 'sat', e.target.value)} style={inputStyle} /> : <div style={{ whiteSpace: 'pre-wrap' }}>{row.sat}</div>}
                </td>

                {isEditing && (
                  <td style={{ ...cellStyle, background: '#f3f4f6' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
                      <label style={{ fontSize: '0.75rem', cursor: 'pointer' }}><input type="checkbox" checked={row.isMerged} onChange={e => updateRow(row.id, 'isMerged', e.target.checked)} /> Gộp ngang</label>
                      <button onClick={() => removeRow(row.id)} style={{ color: 'red', border: 'none', background: 'transparent', cursor: 'pointer' }}>Xóa</button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {isEditing && (
              <tr>
                <td colSpan={8} style={{ ...cellStyle, textAlign: 'center' }}>
                  <button onClick={() => addRow('afternoon')} style={{ padding: '0.3rem 1rem', borderRadius: '4px', border: '1px solid #ccc', cursor: 'pointer', background: 'white' }}>+ Thêm dòng Chiều</button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
