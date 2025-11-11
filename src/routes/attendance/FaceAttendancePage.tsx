import { useState } from 'react';
import { Link } from 'react-router-dom';
import FaceAttendanceShell from './components/FaceAttendanceShell';
import './attendance.css';

const nhanVienDemo = {
  hoTen: 'Nguyễn Minh Anh',
  maNhanVien: 'HRP-2025-0089',
  boPhan: 'Nhân sự',
  chucVu: 'HR Manager',
  caLam: '09:00 - 18:00',
};

const dinhDangThoiGian = () =>
  new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date());

const FaceAttendancePage = () => {
  const [thongBao, setThongBao] = useState<string | null>(null);
  const [loaiThongBao, setLoaiThongBao] = useState<'in' | 'out' | null>(null);

  const xuLyChamCong = (kieu: 'in' | 'out') => {
    const noiDung =
      kieu === 'in'
        ? `Check-in thành công lúc ${dinhDangThoiGian()}`
        : `Check-out thành công lúc ${dinhDangThoiGian()}`;
    setThongBao(noiDung);
    setLoaiThongBao(kieu);
    setTimeout(() => setThongBao(null), 4000);
  };

  return (
    <div className="trang-cham-cong">
      <div className="khung-noi-dung-cham-cong">
        <header className="phan-dau-cham-cong">
        
          <h1 className="tieu-de-cham-cong">Chấm công bằng khuôn mặt</h1>
          
        </header>

        <section className="noi-dung-cham-cong">
          <div className="khoi-camera">
            <div className="khung-camera">
              <FaceAttendanceShell />
            </div>

            {thongBao && (
              <div
                className={`thong-bao ${loaiThongBao === 'in' ? 'thong-bao-thanh-cong' : 'thong-bao-thong-tin'}`}
              >
                {thongBao}
              </div>
            )}

            <div className="Nut-xac-nhan">
              <button className="nut-check-in" onClick={() => xuLyChamCong('in')}>
                 Check-in
              </button>
              <button className="nut-check-out" onClick={() => xuLyChamCong('out')}>
                 Check-out
              </button>
            </div>
          </div>

          <div className="thong-tin-nhan-vien">
            <div>
              <p className="nhan-nho">Thông tin nhân viên</p>
              <h2 className="ten-nhan-vien">{nhanVienDemo.hoTen}</h2>
              <p className="chuc-vu">{nhanVienDemo.chucVu}</p>
            </div>
            <dl className="bang-thong-tin">
              <div>
                <dt>Mã nhân viên</dt>
                <dd>{nhanVienDemo.maNhanVien}</dd>
              </div>
              <div>
                <dt>Bộ phận</dt>
                <dd>{nhanVienDemo.boPhan}</dd>
              </div>
              <div>
                <dt>Ca làm</dt>
                <dd>{nhanVienDemo.caLam}</dd>
              </div>
              <div>
                <dt>Trạng thái</dt>
                <dd className={loaiThongBao === 'out' ? 'trang-thai-xam' : 'trang-thai-xanh'}>
                  {loaiThongBao === 'out' ? 'Đã check-out' : 'Đang làm việc'}
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <footer className="chan-trang-cham-cong">
          <Link to="/" className="nut-quay-lai">
            ← Quay lại trang chủ
          </Link>
         
        </footer>
      </div>
    </div>
  );
};

export default FaceAttendancePage;
