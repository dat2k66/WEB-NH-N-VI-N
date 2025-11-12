import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import FaceAttendanceShell from './components/FaceAttendanceShell';
import './attendance.css';

type AttendanceRecord = {
  date: string; // YYYY-MM-DD
  checkIn: string; // ISO timestamp
  checkOut: string; // ISO timestamp
};

const tinhTongGioTrongThang = (
  records: AttendanceRecord[],
  year: number,
  month: number
) => {
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0);
  let totalMinutes = 0;

  records.forEach(({ date, checkIn, checkOut }) => {
    const currentDay = new Date(date);
    if (currentDay < startOfMonth || currentDay > endOfMonth) return;

    const inTime = new Date(checkIn);
    const outTime = new Date(checkOut);
    if (Number.isNaN(inTime.getTime()) || Number.isNaN(outTime.getTime()))
      return;

    let diffMs = outTime.getTime() - inTime.getTime();
   

    const crossesLunch =
      inTime.getHours() < 12 && outTime.getHours() > 13;
    if (crossesLunch) diffMs -= 60 * 60 * 1000; 

    totalMinutes += Math.max(0, diffMs / (1000 * 60));
  });

  return Number((totalMinutes / 60).toFixed(2));
};

const loadEmployees = () => {
  const stored = localStorage.getItem("employeesData");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.warn("Không đọc được employeesData:", error);
    }
  }
  return [
    { id: "1", code: "PDT", name: "Nguyễn Minh Anh", dept: "Phòng Kinh Doanh", position: "Nhân viên", salary: 10000000, status: "active", visible: true },
    { id: "2", code: "PCT", name: "Nguyễn Minh Tạo", dept: "Trưởng phòng", position: "Trưởng phòng", salary: 20000000, status: "active", visible: true },
    { id: "3", code: "PKT", name: "Trần Quỳnh", dept: "Chăm sóc KH", position: "Nhân viên", salary: 12000000, status: "inactive", visible: true },
  ];
};

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
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [hasRegisteredFace, setHasRegisteredFace] = useState(false);

  useEffect(() => {
    const employeeId = searchParams.get('id');
    if (employeeId) {
      const employeesData = loadEmployees();
      const foundEmployee = employeesData.find((emp) => emp.id === employeeId);
      setEmployee(foundEmployee || null);
    }
  }, [searchParams]);
  useEffect(() => {
    if (!employee) {
      setHasRegisteredFace(false);
      return;
    }
    const faceData = localStorage.getItem(`faceData:${employee.id}`);
    setHasRegisteredFace(!!faceData);
  }, [employee]);
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);
const [checkOutTime, setCheckOutTime] = useState<Date | null>(null);
const tongGioThangNay = useMemo(() => {
  const now = new Date();
  return tinhTongGioTrongThang(
    attendanceRecords,
    now.getFullYear(),
    now.getMonth() + 1
  );
}, [attendanceRecords]);

  useEffect(() => {
    if (!employee) return;
    const now = new Date();
    const payload = {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      hours: tongGioThangNay,
    };
    localStorage.setItem(
      `workingHours:${employee.id}`,
      JSON.stringify(payload)
    );
  }, [employee, tongGioThangNay]);

  const xuLyChamCong = (kieu: 'in' | 'out') => {
    if (!employee) {
      setThongBao("Không tồn tại nhân viên để chấm công");
      setLoaiThongBao(null);
      setTimeout(() => setThongBao(null), 4000);
      return;
    }
    const registeredFace = localStorage.getItem(`faceData:${employee.id}`);
    if (!registeredFace) {
      setThongBao("Không tìm thấy dữ liệu khuôn mặt. Vui lòng đăng ký trước.");
      setLoaiThongBao(null);
      setTimeout(() => setThongBao(null), 4000);
      return;
    }
    const now = new Date();
    const noiDung =
      kieu === 'in'
        ? `Check-in thành công lúc ${now.toLocaleTimeString("vi-VN")}`
      : `Check-out thành công lúc ${now.toLocaleTimeString("vi-VN")}`;
    setThongBao(noiDung);
    setLoaiThongBao(kieu);
    setTimeout(() => setThongBao(null), 4000);
    const lastCheckIn = checkInTime;
    if (kieu === "in") {
    setCheckInTime(now);
    setCheckOutTime(null); // reset cho ca mới
  } else {
    if (!lastCheckIn) return;
    setCheckOutTime(now);
    tinhThoiGianLam(lastCheckIn, now);
    const recordDate = now.toISOString().split('T')[0];
    setAttendanceRecords(prev => [
      ...prev,
      {
        date: recordDate,
        checkIn: lastCheckIn.toISOString(),
        checkOut: now.toISOString(),
      },
    ]);
  }
  };
 const [soGioLam, setSoGioLam] = useState(0);

const tinhThoiGianLam = (inTime: Date, outTime: Date) => {
  let diffMs = outTime.getTime() - inTime.getTime();
 

  const minutes = diffMs / (1000 * 60);
  const hours = minutes / 60;

  const lunchBreak = 1; // giờ
  const hasLunchBreak = inTime.getHours() < 12 && outTime.getHours() > 13;

  const rawHours = hasLunchBreak ? hours - lunchBreak : hours;
  const finalHours = Math.max(0, Number(rawHours.toFixed(2)));

  setSoGioLam(finalHours);
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
                    <dt>Nhận diện khuôn mặt</dt>
                    <dd className={hasRegisteredFace ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                      {hasRegisteredFace ? "Đã đăng ký" : "Chưa đăng ký"}
                    </dd>
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
