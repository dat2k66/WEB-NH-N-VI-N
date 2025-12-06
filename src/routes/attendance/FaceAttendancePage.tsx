import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FaceAttendanceShell, {
  type FaceAttendanceShellHandle,
} from './components/FaceAttendanceShell';
import './attendance.css';
import { captureFaceDescriptor, descriptorToArray } from '../../lib/faceRecognition';
import { attendanceService } from '../../services/attendanceService';

type AttendanceHistoryRecord = {
  id: string;
  type: 'checkin' | 'checkout';
  timestamp: string;
  durationHours?: number;
};

const HISTORY_LIMIT = 200;

// Hàm định dạng tiền tệ an toàn (sử dụng dấu chấm làm phân cách hàng nghìn)
const formatVND = (value: number) => {
    const formattedNumber = new Intl.NumberFormat('vi-VN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Math.round(value));
    return `${formattedNumber}₫`;
};


const addHistoryRecord = (employeeId: string, record: AttendanceHistoryRecord) => {
  if (typeof localStorage === 'undefined') return;
  const key = `attendanceHistory:${employeeId}`;
  let current: AttendanceHistoryRecord[] = [];
  const raw = localStorage.getItem(key);
  if (raw) {
    try {
      current = JSON.parse(raw) as AttendanceHistoryRecord[];
    } catch (error) {
      console.warn('Không đọc được attendanceHistory:', error);
    }
  }
  current.push(record);
  if (current.length > HISTORY_LIMIT) {
    current = current.slice(-HISTORY_LIMIT);
  }
  localStorage.setItem(key, JSON.stringify(current));
};

const loadHistory = (employeeId: string): AttendanceHistoryRecord[] => {
  if (typeof localStorage === 'undefined') return [];
  const raw = localStorage.getItem(`attendanceHistory:${employeeId}`);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as AttendanceHistoryRecord[]) : [];
  } catch (error) {
    console.warn('Không đọc được attendanceHistory:', error);
    return [];
  }
};

const readMonthlyHours = (employeeId: string) => {
  if (typeof localStorage === 'undefined') return 0;
  const raw = localStorage.getItem(`workingHours:${employeeId}`);
  if (!raw) return 0;
  try {
    const parsed = JSON.parse(raw) as { year: number; month: number; hours: number };
    const now = new Date();
    if (parsed.year === now.getFullYear() && parsed.month === now.getMonth() + 1) {
      return Number(parsed.hours) || 0;
    }
  } catch (error) {
    console.warn('Không đọc được workingHours:', error);
  }
  return 0;
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
  return []; // TRẢ VỀ MẢNG RỖNG NẾU KHÔNG CÓ DỮ LIỆU ĐÃ TẢI
};

const THOI_GIAN_MO_PHONG = 3600 * 5; // 1 giây thực tế = 10 giờ chấm công

const FaceAttendancePage = () => {
  const navigate = useNavigate();
  const [employees] = useState(loadEmployees);
  const [employee, setEmployee] = useState<any>(null);
  const [thongBao, setThongBao] = useState<string | null>(null);
  const [loaiThongBao, setLoaiThongBao] = useState<'in' | 'out' | null>(null);
  const [hasRegisteredFace, setHasRegisteredFace] = useState(false);
  const [dangChamCong, setDangChamCong] = useState(false);
  const shellRef = useRef<FaceAttendanceShellHandle | null>(null);
  const [historyRecords, setHistoryRecords] = useState<AttendanceHistoryRecord[]>([]);
  const [monthlyHours, setMonthlyHours] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [showSalaryDetail, setShowSalaryDetail] = useState(false); 
  
const baseSalary = Number(employee?.salary) || 0;
const hourlyRate = baseSalary / 160;
const hasBaseSalary = monthlyHours >= 40;
const overtimeHours = Math.max(0, monthlyHours - 40);
const overtimePay = hasBaseSalary ? overtimeHours * hourlyRate * 1.5 : 0; // Thêm *1.5 cho OT
const projectedSalary = baseSalary + overtimePay; // Total Salary = Base + OT
  
  const capNhatGioLamThangNay = useCallback((gioMoi: number) => {
    if (!employee || gioMoi <= 0) return;
    const now = new Date();
    const key = `workingHours:${employee.id}`;
    const nextHours = Number((monthlyHours + gioMoi).toFixed(2));
    const payload = {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      hours: nextHours,
    };
    setMonthlyHours(nextHours);
    localStorage.setItem(key, JSON.stringify(payload));
  }, [employee, monthlyHours]);


  // HÀM KIỂM TRA TRẠNG THÁI VÀ ĐỒNG BỘ DỮ LIỆU
  const syncEmployeeData = useCallback(async (emp: any) => {
      if (!emp) {
          setHasRegisteredFace(false);
          setHistoryRecords([]);
          setMonthlyHours(0);
          return;
      }
      
      // 1. Kiểm tra trạng thái đăng ký khuôn mặt TỪ API
      const registered = await attendanceService.hasFaceEnrollment(emp.id);
      setHasRegisteredFace(registered);
      
      // 2. Tải lịch sử và giờ làm từ Local Storage (Chưa migrate Attendance History)
      setHistoryRecords(loadHistory(emp.id).reverse());
      setMonthlyHours(readMonthlyHours(emp.id));

  }, []);

  // USE EFFECT CHÍNH: Tải dữ liệu nhân viên từ Local Storage (đã được ghi từ EmployeePage)
  useEffect(() => {
    const storedId = localStorage.getItem("attendanceEmployeeId");
    if (!storedId) {
      navigate('/', { replace: true });
      return;
    }
    
    // Đảm bảo dữ liệu nhân viên được load đầy đủ
    const foundEmployee = employees.find((emp: any) => emp.id === storedId); 
    
    if (foundEmployee) {
      setEmployee(foundEmployee);
      syncEmployeeData(foundEmployee); // Gọi hàm sync dữ liệu ngay
    } else {
      // Trường hợp hiếm: ID có trong local storage nhưng không có trong danh sách employees
      navigate('/', { replace: true });
    }
    
  }, [employees, navigate, syncEmployeeData]); 

  const [checkInTime, setCheckInTime] = useState<Date | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<Date | null>(null);


const tinhThoiGianLam = (inTime: Date, outTime: Date) => {
  const diffMs = outTime.getTime() - inTime.getTime();
  const minutes = diffMs / (1000 * 60);
  const hours = minutes / 60;

  const lunchBreak = 1; // giờ thực tế
  const hasLunchBreak = inTime.getHours() < 12 && outTime.getHours() > 13;

  const realHours = hasLunchBreak ? hours - lunchBreak : hours;
  const simulatedHours = Math.max(0, Number((realHours * THOI_GIAN_MO_PHONG).toFixed(2)));

  capNhatGioLamThangNay(simulatedHours);
  return simulatedHours;
};

  const xuLyChamCong = async (kieu: 'in' | 'out') => {
    if (!employee) {
      setThongBao("Không tồn tại nhân viên để chấm công");
      setLoaiThongBao(null);
      setTimeout(() => setThongBao(null), 4000);
      return;
    }
    
    // QUAN TRỌNG: Kiểm tra trạng thái đã đăng ký lần nữa trước khi chấm công
    const isRegistered = await attendanceService.hasFaceEnrollment(employee.id);
    setHasRegisteredFace(isRegistered);

    if (!isRegistered) {
      setThongBao("Không tìm thấy dữ liệu khuôn mặt. Vui lòng đăng ký trước.");
      setLoaiThongBao(null);
      setTimeout(() => setThongBao(null), 4000);
      return;
    }
    
    const videoElement = shellRef.current?.getVideoElement();
    if (!videoElement) {
      setThongBao("Không tìm thấy camera. Vui lòng kiểm tra lại thiết bị.");
      setLoaiThongBao(null);
      setTimeout(() => setThongBao(null), 4000);
      return;
    }
    
    setDangChamCong(true);
    try {
      const result = await captureFaceDescriptor(videoElement);
      if (!result.descriptor) {
        setThongBao("Không nhận diện được khuôn mặt. Vui lòng đứng gần và thử lại.");
        setLoaiThongBao(null);
        setTimeout(() => setThongBao(null), 4000);
        return;
      }
      
      // GỌI API CHECKIN VỚI LOGIC FIX PHÂN TÍCH JSON BÊN BACKEND
      const response = await attendanceService.checkInWithFace({
        embedding: descriptorToArray(result.descriptor),
        type: kieu === 'in' ? 'checkin' : 'checkout',
        threshold: 0.5,
      });

      if (response.employeeId !== employee.id) {
        setThongBao("Khuôn mặt không khớp với nhân viên đang chọn.");
        setLoaiThongBao(null);
        setTimeout(() => setThongBao(null), 4000);
        return;
      }
      
      const eventTime = new Date(response.timestamp);
      const noiDung =
        kieu === 'in'
          ? `Check-in thành công lúc ${eventTime.toLocaleTimeString("vi-VN")} (độ khớp ${response.distance.toFixed(3)})`
          : `Check-out thành công lúc ${eventTime.toLocaleTimeString("vi-VN")} (độ khớp ${response.distance.toFixed(3)})`;
      setThongBao(noiDung);
      setLoaiThongBao(kieu);
      setTimeout(() => setThongBao(null), 4000);
      
      const lastCheckIn = checkInTime;
      let workedHours: number | undefined;
      
      if (kieu === "in") {
        setCheckInTime(eventTime);
        setCheckOutTime(null);
      } else {
        if (!lastCheckIn) return;
        setCheckOutTime(eventTime);
        workedHours = tinhThoiGianLam(lastCheckIn, eventTime);
      }

      addHistoryRecord(employee.id, {
        id: `${employee.id}-${eventTime.getTime()}-${kieu}`,
        type: kieu === 'in' ? 'checkin' : 'checkout',
        timestamp: eventTime.toISOString(),
        durationHours: workedHours,
      });
      // Cập nhật lại lịch sử và giờ làm sau khi chấm công
      setHistoryRecords(loadHistory(employee.id).reverse());
      setMonthlyHours(readMonthlyHours(employee.id));
      
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Không thể chấm công bằng khuôn mặt.";
      setThongBao(message);
      setLoaiThongBao(null);
      setTimeout(() => setThongBao(null), 4000);
    } finally {
      setDangChamCong(false);
    }
  };


  return (
    <div className="trang-cham-cong">
      <div className="khung-noi-dung-cham-cong">
        <header className="phan-dau-cham-cong">
          <h1 className="tieu-de-cham-cong">Chấm công bằng khuôn mặt</h1>
          <button
            type="button"
            className="nut-quay-lai"
            onClick={() => {
              localStorage.removeItem("attendanceEmployeeId");
              navigate('/');
            }}
          >
            Đổi tài khoản
          </button>
        </header>

        <section className="noi-dung-cham-cong">
          <div className="khoi-camera">
            <div className="khung-camera">
              <FaceAttendanceShell ref={shellRef} />
            </div>

            {thongBao && (
              <div
                className={`thong-bao ${loaiThongBao === 'in' ? 'thong-bao-thanh-cong' : 'thong-bao-thong-tin'}`}
              >
                {thongBao}
              </div>
            )}

            <div className="Nut-xac-nhan">
              <button className="nut-check-in" onClick={() => xuLyChamCong('in')} disabled={dangChamCong}>
                 {dangChamCong ? 'Đang xử lý...' : 'Check-in'}
              </button>
              <button className="nut-check-out" onClick={() => xuLyChamCong('out')} disabled={dangChamCong}>
                 {dangChamCong ? 'Đang xử lý...' : 'Check-out'}
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
                <div className="mt-4">
                  <button
                    type="button"
                    className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition"
                    onClick={() => setShowHistory((prev) => !prev)}
                  >
                    {showHistory
                      ? "Ẩn lịch sử & thống kê"
                      : "Xem lịch sử, chấm công & tổng lương"}
                  </button>
                </div>
                {showHistory && (
                  <div className="mt-4 space-y-4">
                    {/* TÁI CẤU TRÚC KHỐI THỐNG KÊ */}
                    <div className="grid gap-3 md:grid-cols-2">
                        {/* 1. Tổng giờ đã làm */}
                        <div className="rounded-xl bg-slate-50 p-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Tổng số giờ đã làm
                            </p>
                            <p className="text-2xl font-bold text-slate-900 mt-1">{monthlyHours.toFixed(2)}h</p>
                        </div>

                        {/* 2. Tổng lần chấm công */}
                        <div className="rounded-xl bg-slate-50 p-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Tổng lần chấm công
                            </p>
                            <p className="text-2xl font-bold text-slate-900 mt-1">{historyRecords.length}</p>
                        </div>
                    </div>
                    
                    {/* 3. Tổng tiền lương dự kiến (Chuyển xuống dưới, toàn màn hình và làm nút bấm) */}
                    <button
                        type="button"
                        className="w-full text-left rounded-xl border border-emerald-100 bg-emerald-50/70 p-3 transition hover:bg-emerald-100"
                        onClick={() => setShowSalaryDetail((prev) => !prev)}
                    >
                        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                            Tổng tiền lương dự kiến {showSalaryDetail ? '↑' : '↓'}
                        </p>
                        <p className="text-3xl font-bold text-emerald-800 mt-1">
                            {formatVND(projectedSalary)}
                        </p>
                    </button>

                    {/* 4. Chi tiết Lương (Hiển thị khi bấm vào) */}
                    {showSalaryDetail && (
                        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm text-sm">
                            <p className="font-semibold text-slate-700 mb-2">Chi tiết tính toán:</p>
                            <dl className="space-y-1">
                                <div className="flex justify-between">
                                    <dt className="text-slate-500">Lương cơ bản tháng</dt>
                                    <dd className="font-medium">{formatVND(baseSalary)}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-slate-500">Giờ làm tiêu chuẩn (Mốc)</dt>
                                    <dd className="font-medium">40 giờ</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-slate-500">Giờ làm thêm</dt>
                                    <dd className={`font-medium ${overtimeHours > 0 ? 'text-orange-600' : ''}`}>{overtimeHours.toFixed(2)} giờ</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-slate-500">Lương làm thêm (Hệ số 1.5)</dt>
                                    <dd className="font-medium text-orange-600">{formatVND(overtimePay)}</dd>
                                </div>
                                <hr className="my-2 border-slate-100" />
                                <div className="flex justify-between">
                                    <dt className="font-bold">TỔNG THỰC NHẬN</dt>
                                    <dd className="font-bold text-emerald-700">{formatVND(projectedSalary)}</dd>
                                </div>
                            </dl>
                            <p className="text-xs text-slate-500 mt-3">
                                {hasBaseSalary
                                    ? `Đã đủ 40 giờ. Lương tính theo: LCB + OT * 1.5`
                                    : 'Chưa đủ 40 giờ. Lương dự kiến bằng Lương cơ bản.'}
                            </p>
                        </div>
                    )}


                    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                      <p className="text-sm font-semibold text-slate-700 mb-3">Lịch sử chấm công gần đây</p>
                      {historyRecords.length === 0 ? (
                        <p className="text-sm text-slate-500">Chưa có dữ liệu chấm công.</p>
                      ) : (
                        <ul className="space-y-2 max-h-60 overflow-y-auto pr-1">
                          {historyRecords.slice(0, 8).map((record) => {
                            const time = new Date(record.timestamp);
                            return (
                              <li
                                key={record.id}
                                className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2 text-sm"
                              >
                                <div>
                                  <p className="font-semibold text-slate-900">
                                    {record.type === 'checkin' ? 'Check-in' : 'Check-out'}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {time.toLocaleDateString('vi-VN')} • {time.toLocaleTimeString('vi-VN')}
                                  </p>
                                </div>
                                {typeof record.durationHours === 'number' && record.durationHours > 0 && (
                                  <span className="text-xs font-semibold text-emerald-600">
                                    +{record.durationHours.toFixed(2)}h
                                  </span>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p>
                Không tìm thấy thông tin đăng nhập. Vui lòng quay lại trang chủ và đăng nhập lại để chấm công.
              </p>
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