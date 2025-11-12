import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import FaceAttendanceShell from './components/FaceAttendanceShell';
import './attendance.css';

const employeesData = [
  { id: "1", code: "PDT", name: "Nguyễn Minh Anh", dept: "Phòng Kinh Doanh", position: "Nhân viên", salary: 10000000, status: "active", visible: true },
  { id: "2", code: "PCT", name: "Nguyễn Minh Tạo", dept: "Trưởng phòng", position: "Trưởng phòng", salary: 20000000, status: "active", visible: true },
  { id: "3", code: "PKT", name: "Trần Quỳnh", dept: "Chăm sóc KH", position: "Nhân viên", salary: 12000000, status: "inactive", visible: true },
];

const dinhDangThoiGian = () =>
  new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date());

const FaceAttendancePage = () => {
  const [searchParams] = useSearchParams();
  const [employee, setEmployee] = useState<any>(null);
  const [thongBao, setThongBao] = useState<string | null>(null);
  const [loaiThongBao, setLoaiThongBao] = useState<'in' | 'out' | null>(null);

  useEffect(() => {
    const employeeId = searchParams.get('id');
    if (employeeId) {
      const foundEmployee = employeesData.find(emp => emp.id === employeeId);
      setEmployee(foundEmployee || null);
    }
  }, [searchParams]);

  const xuLyChamCong = (kieu: 'in' | 'out') => {
    if (!employee) {
      setThongBao("Chưa chọn nhân viên để chấm công.");
      return;
    }
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
            {employee ? (
              <>
                <div>
                  <p className="nhan-nho">Thông tin nhân viên</p>
                  <h2 className="ten-nhan-vien">{employee.name}</h2>
                  <p className="chuc-vu">{employee.position}</p>
                </div>
                <dl className="bang-thong-tin">
                  <div>
                    <dt>Mã nhân viên</dt>
                    <dd>{employee.code}</dd>
                  </div>
                  <div>
                    <dt>Bộ phận</dt>
                    <dd>{employee.dept}</dd>
                  </div>
                  <div>
                    <dt>Ca làm</dt>
                    <dd>09:00 - 18:00</dd>
                  </div>
                  <div>
                    <dt>Trạng thái</dt>
                    <dd className={loaiThongBao === 'out' ? 'trang-thai-xam' : 'trang-thai-xanh'}>
                      {loaiThongBao === 'out' ? 'Đã check-out' : 'Đang làm việc'}
                    </dd>
                  </div>
                </dl>
              </>
            ) : (
              <p>Không tìm thấy thông tin nhân viên. Vui lòng quay lại và chọn một nhân viên.</p>
            )}
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
