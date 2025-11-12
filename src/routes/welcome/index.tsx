import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import anhTrangChu from '@/assets/anhtrangchu.png';
import anhDangNhap from '@/assets/dangnhap.png';
import { adminAccount, verifyAdminLogin } from '@/services/mocks/auth';
import './welcome.css';

const menuItems = ['Tài liệu', 'Hỗ trợ', 'Đăng nhập'];

const TrangChaoMung = () => {
  const navigate = useNavigate();
  const [moDangNhapQuanTri, setMoDangNhapQuanTri] = useState(false);
  const [email, setEmail] = useState(adminAccount.email);
  const [matKhau, setMatKhau] = useState(adminAccount.password);
  const [thongBaoLoi, setThongBaoLoi] = useState<string | null>(null);

  const xuLyDangNhap = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (verifyAdminLogin(email, matKhau)) {
      setThongBaoLoi(null);
      setMoDangNhapQuanTri(false);
      navigate('/admin');
    } else {
      setThongBaoLoi('Email hoặc mật khẩu không đúng.');
    }
  };

  return (
    <div className="nen-trang-chao">
      <div className="khung-noi-dung-trang">
        <header className="than-dieu-huong">
          <div className="cum-can-giua">
            <div className="logo-hr">H</div>
            <div className="chu-logo">HR Pro</div>
          </div>
          
        </header>

        <section className="phan-anh-hung">
          <div className="hang-chao-mung">
            <div className="noi-dung-anh-hung">
              <p className="tieu-de-phu">HR Pro Suite</p>
              <h1 className="tieu-de-chao">Chào mừng đến HR Pro</h1>
              <p className="doan-mo-ta-chao">
                Chấm công FaceID, tính lương tự động, quản trị nhân sự tập trung. 
              </p>
              
            </div>
            <div className="hop-anh-thu-nho">
              <div className="the-thong-tin-nhan-vien">
              
                <div className="the-nhan-dien-khuon-mat">
                  <div className="dong-nhan-dien">
                    <span>Nhận diện khuôn mặt</span>
                    <span>Confidence 98%</span>
                  </div>
                  <img src={anhTrangChu} alt="Nhận diện" className="anh-nhan-dien" />
                </div>
              </div>
            </div>
          </div>

          <div className="vung-the-chuc-nang">
            <div className="the-cham-cong">
              <div className="tieu-de-the">
                <p className="dong-tieu-de-the">Chấm công - dành cho Nhân viên</p>
                
              </div>
              <h3 className="ten-the">Chấm công</h3>
              <p className="mo-ta-the">Check-in/Check-out bằng nhận diện khuôn mặt, nhanh và chính xác.</p>
              <div className="vung-nut-hanh-dong">
                <button
                  className="nut-trang-cham-cong"
                  onClick={() => navigate('/attendance')}
                >
                  Chấm công
                </button>
               
              </div>
            </div>
            <div className="the-quan-tri">
              <div className="tieu-de-the">
                <p className="dong-tieu-de-the">Quản trị - dành cho Quản lý</p>
                
              </div>
              <h3 className="ten-the">Quản trị</h3>
              <p className="mo-ta-the">Lịch phòng ban, chức vụ, lương, báo cáo theo thời gian thực.</p>
              <div className="vung-nut-hanh-dong">
                <button className="nut-trang-quan-tri" onClick={() => setMoDangNhapQuanTri(true)}>
                  Đến bảng Quản trị
                </button>
                
              </div>
            </div>
          </div>
        </section>

     

     

        {moDangNhapQuanTri && (
          <div className="lop-phu-dang-nhap" role="dialog" aria-modal="true">
            <div className="hop-dang-nhap">
              <div className="phan-chao-dang-nhap">
                <p className="tieu-de-dang-nhap">HR Pro Admin</p>
                <p className="mo-ta-dang-nhap">
                  Đăng nhập để truy cập bảng quản trị, theo dõi dữ liệu thời gian thực và duyệt yêu cầu.
                </p>
                <img src={anhDangNhap} alt="Mô tả đăng nhập" className="anh-dang-nhap" />
              </div>
              <div className="cot-dang-nhap">
                <button
                  type="button"
                  className="nut-dong-modal"
                  onClick={() => setMoDangNhapQuanTri(false)}
                  aria-label="Đóng đăng nhập"
                >
                  ✕
                </button>
                <div className="phan-dau-form">
                  <p className="nhan-form">Chào mừng quay lại</p>
                  <h2 className="tieu-de-form">Đăng nhập quản trị</h2>
                  <p className="mo-ta-form">Nhập thông tin tài khoản demo phía dưới để tiếp tục.</p>
                </div>
                <form className="form-dang-nhap" onSubmit={xuLyDangNhap}>
                  <label className="nhan-truong">
                    Email
                    <input
                      className="truong-nhap"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="admin@hrpro.vn"
                    />
                  </label>
                  <label className="nhan-truong">
                    Mật khẩu
                    <input
                      className="truong-nhap"
                      type="password"
                      value={matKhau}
                      onChange={(event) => setMatKhau(event.target.value)}
                      placeholder="••••••••"
                    />
                  </label>
                  {thongBaoLoi && <p className="thong-bao-loi">{thongBaoLoi}</p>}
                  <div className="dong-tuy-chon">
                   
                  </div>
                  <button type="submit" className="nut-dang-nhap">
                    Đăng nhập
                  </button>
                  <p className="ghi-chu-demo">
                    Demo: {adminAccount.email} / {adminAccount.password}
                  </p>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrangChaoMung;
