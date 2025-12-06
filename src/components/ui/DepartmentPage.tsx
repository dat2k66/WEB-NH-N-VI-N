import { useMemo, useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from 'uuid';
import { Button } from "./Button";
import { DepartmentTable } from "./DepartmentTable";
import { AddDepartmentModal, type NewDepartmentData } from "./AddDepartmentModal";
import { EditDepartmentModal, type DepartmentEditData } from "./EditDepartmentModal";
import { Input } from "./Input";
import type { Employee } from "./EmployeePage";
import { EmployeesListModal } from "./EmployeesListModal";
import { generateDepartmentCode } from "../../utils/employeeCode";
// IMPORT SERVICE MỚI
import { departmentsService } from "../../services/departmentsService"; 

// Kiểu dữ liệu chuẩn của Frontend (cần ánh xạ từ API Result)
export type Department = {
  id: string;
  maPhong: string;
  tenPhong: string;
  namThanhLap: number;
  trangThai: "active" | "inactive";
  visible: boolean; 
};

type ThongBao = {
  id: string;
  noiDung: string;
};

// Hàm ánh xạ dữ liệu từ API (MySQL snake_case) sang format Frontend (camelCase)
const mapApiToDepartment = (item: any): Department => ({
    id: String(item.id),
    maPhong: item.ma_phong,
    tenPhong: item.ten_phong,
    namThanhLap: item.nam_thanh_lap,
    trangThai: item.trang_thai,
    visible: true, // Mặc định hiển thị trên UI
});


export default function DepartmentPage() {
  
  const [danhSachPhongBan, capNhatDanhSachPhongBan] = useState<Department[]>([]);
  const [dangTai, datDangTai] = useState(true); // Thêm state loading
  
  // ... các states khác giữ nguyên ...
  const [tuKhoa, capNhatTuKhoa] = useState("");
  const [moThemPhongBan, datMoThemPhongBan] = useState(false);
  const [danhSachThongBao, capNhatThongBao] = useState<ThongBao[]>([]);
  const [phongDangSua, capNhatPhongDangSua] = useState<Department | null>(null);
  const [trangHienTai, capNhatTrangHienTai] = useState(1);
  const [soNhanSuTheoPhong, capNhatSoNhanSuTheoPhong] = useState<Record<string, number>>({});
  const [moCuaSoNhanSu, datMoCuaSoNhanSu] = useState(false);
  const [nhanSuPhongChon, capNhatNhanSuPhongChon] = useState<Employee[]>([]);
  const [phongDuocChon, capNhatPhongDuocChon] = useState<Department | null>(null);
  const SO_MUC_MOI_TRANG = 4;

  const hienThongBao = useCallback((noiDung: string) => {
    const idThongBao = uuidv4();
    capNhatThongBao((dsCu) => [...dsCu, { id: idThongBao, noiDung }]);
    setTimeout(() => {
      capNhatThongBao((dsCu) => dsCu.filter((tb) => tb.id !== idThongBao));
    }, 3000);
  }, []);

  // Hàm tải dữ liệu chính từ Backend
  const taiDuLieuPhongBan = useCallback(async () => {
    datDangTai(true);
    try {
      const duLieuTuAPI = await departmentsService.list();
      const duLieuFormatted = duLieuTuAPI.map(mapApiToDepartment);
      capNhatDanhSachPhongBan(duLieuFormatted);
    } catch (error) {
      hienThongBao("Lỗi tải dữ liệu phòng ban: " + (error as Error).message);
      capNhatDanhSachPhongBan([]);
    } finally {
      datDangTai(false);
    }
  }, [hienThongBao]);


  // THAY THẾ LOGIC LOAD LÚC KHỞI TẠO
  useEffect(() => {
    taiDuLieuPhongBan();

    // Logic đồng bộ nhân sự theo phòng (vẫn phải dùng tạm localStorage cho nhân viên)
    const dongBoNhanSuTheoPhong = () => {
      try {
        const raw = localStorage.getItem("employeesData"); 
        if (!raw) {
          capNhatSoNhanSuTheoPhong({});
          return;
        }
        const employees = JSON.parse(raw) as { dept: string }[];
        const counts = employees.reduce<Record<string, number>>((acc, emp) => {
          acc[emp.dept] = (acc[emp.dept] || 0) + 1;
          return acc;
        }, {});
        capNhatSoNhanSuTheoPhong(counts);
      } catch (error) {
        console.warn("Không đọc được employeesData:", error);
        capNhatSoNhanSuTheoPhong({});
      }
    };

    dongBoNhanSuTheoPhong();
    window.addEventListener("storage", dongBoNhanSuTheoPhong);
    window.addEventListener("focus", dongBoNhanSuTheoPhong);
    return () => {
      window.removeEventListener("storage", dongBoNhanSuTheoPhong);
      window.removeEventListener("focus", dongBoNhanSuTheoPhong);
    };
  }, [taiDuLieuPhongBan]);


  const danhSachDaLoc = useMemo(() => {
    const ketQua = danhSachPhongBan.filter((phong) => {
      if (
        tuKhoa &&
        !(
          phong.tenPhong.toLowerCase().includes(tuKhoa.toLowerCase()) ||
          phong.maPhong.toLowerCase().includes(tuKhoa.toLowerCase())
        )
      )
        return false;
      return true;
    });
    const tongTrang = Math.max(1, Math.ceil(ketQua.length / SO_MUC_MOI_TRANG));
    if (trangHienTai > tongTrang) {
      capNhatTrangHienTai(tongTrang);
    }
    return ketQua;
  }, [danhSachPhongBan, tuKhoa, trangHienTai]);

  const taoMaPhongBan = (tenPhong: string) => {
    return generateDepartmentCode(tenPhong);
  };

  // THAY THẾ LOGIC THÊM PHÒNG BAN (CREATE)
  const themPhongBan = async (phongMoi: NewDepartmentData) => {
    try {
      const maPhong = phongMoi.maPhong || taoMaPhongBan(phongMoi.tenPhong);
      
      await departmentsService.create({
          maPhong,
          tenPhong: phongMoi.tenPhong,
          namThanhLap: phongMoi.namThanhLap,
          trangThai: phongMoi.trangThai
      });

      hienThongBao("Đã thêm phòng ban thành công!");
      datMoThemPhongBan(false);
      taiDuLieuPhongBan(); // Tải lại dữ liệu sau khi thêm
    } catch (error) {
      hienThongBao("Lỗi khi thêm phòng ban: " + (error as Error).message);
    }
  };

  // THAY THẾ LOGIC CẬP NHẬT PHÒNG BAN (UPDATE)
  const capNhatPhongBan = async (duLieuMoi: DepartmentEditData) => {
    if (!phongDangSua) return;

    try {
        await departmentsService.update(phongDangSua.id, {
            maPhong: duLieuMoi.maPhong,
            tenPhong: duLieuMoi.tenPhong,
            namThanhLap: duLieuMoi.namThanhLap,
            trangThai: duLieuMoi.trangThai,
        });

        hienThongBao("Đã cập nhật phòng ban thành công!");
        capNhatPhongDangSua(null);
        taiDuLieuPhongBan(); // Tải lại dữ liệu sau khi cập nhật
    } catch (error) {
        hienThongBao("Lỗi khi cập nhật phòng ban: " + (error as Error).message);
    }
  };

  // THAY THẾ LOGIC XÓA PHÒNG BAN (DELETE)
  const xoaPhongBan = async (id: string) => {
    const xacNhan = window.confirm("Bạn có chắc chắn muốn xoá phòng ban này?");
    if (xacNhan) {
      try {
        await departmentsService.delete(id);
        hienThongBao("Đã xóa phòng ban!");
        // Tải lại dữ liệu sau khi xóa
        taiDuLieuPhongBan();
      } catch (error) {
        hienThongBao("Lỗi khi xóa phòng ban: " + (error as Error).message);
      }
    }
  };

  // THAY THẾ LOGIC ĐẢO TRẠNG THÁI (Toggle)
  // GỌI API UPDATE ĐỂ THAY ĐỔI TRẠNG THÁI DB
  const daoTrangThaiHienThi = async (id: string) => {
    const phong = danhSachPhongBan.find(p => p.id === id);
    if (!phong) return;

    const nextStatus = phong.trangThai === "active" ? "inactive" : "active";
    const nextVisible = !phong.visible; 

    try {
        await departmentsService.update(id, {
            maPhong: phong.maPhong,
            tenPhong: phong.tenPhong,
            namThanhLap: phong.namThanhLap,
            trangThai: nextStatus, // Gửi trạng thái mới lên DB
        });

        // Cập nhật state UI nhanh
        capNhatDanhSachPhongBan(dsCu => dsCu.map(p => p.id === id ? {...p, trangThai: nextStatus, visible: nextVisible} : p));
        hienThongBao(`Đã chuyển trạng thái sang ${nextStatus === 'active' ? 'Hoạt động' : 'Ngưng'}`);
    } catch (error) {
        hienThongBao("Lỗi khi thay đổi trạng thái: " + (error as Error).message);
    }
  };


  const chonPhongBanSua = (phong: Department) => {
    capNhatPhongDangSua(phong);
  };

  const xemNhanSuPhong = (phong: Department) => {
    capNhatPhongDuocChon(phong);
    // Vẫn dùng tạm localStorage cho nhân viên, vì chưa migrate Employee CRUD
    try {
      const duLieuNhanVien = localStorage.getItem("employeesData");
      if (!duLieuNhanVien) {
        capNhatNhanSuPhongChon([]);
      } else {
        const nhanVien = JSON.parse(duLieuNhanVien) as Employee[];
        const nhanSuTheoPhong = nhanVien.filter((nv) => nv.dept === phong.tenPhong);
        capNhatNhanSuPhongChon(nhanSuTheoPhong);
      }
    } catch (error) {
      console.warn("Không đọc được employeesData:", error);
      capNhatNhanSuPhongChon([]);
    }
    datMoCuaSoNhanSu(true);
  };

  const dongCuaSoNhanSu = () => {
    datMoCuaSoNhanSu(false);
    capNhatNhanSuPhongChon([]);
    capNhatPhongDuocChon(null);
  };

  // Logic hiển thị Loading State
  if (dangTai) {
    return (
        <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
            <p className="text-xl font-semibold text-blue-600">Đang tải dữ liệu phòng ban...</p>
        </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Phòng ban</h1>
          <Button onClick={() => datMoThemPhongBan(true)}>+ Thêm phòng ban</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="md:col-span-2">
                <Input
                placeholder="Tìm theo tên, mã phòng..."
                value={tuKhoa}
                onChange={(e) => {
                  capNhatTrangHienTai(1);
                  capNhatTuKhoa(e.target.value);
                }}
                />
            </div>
        </div>

        <DepartmentTable
          data={danhSachDaLoc.slice((trangHienTai - 1) * SO_MUC_MOI_TRANG, trangHienTai * SO_MUC_MOI_TRANG).map((dept) => ({
            ...dept,
            nhanSu: soNhanSuTheoPhong[dept.tenPhong] || 0,
          }))}
          totalCount={danhSachDaLoc.length}
          page={trangHienTai}
          pageSize={SO_MUC_MOI_TRANG}
          pageCount={Math.max(1, Math.ceil(danhSachDaLoc.length / SO_MUC_MOI_TRANG))}
          onPageChange={capNhatTrangHienTai}
          onDelete={xoaPhongBan}
          onToggleVisibility={daoTrangThaiHienThi}
          onEdit={chonPhongBanSua}
          onViewEmployees={xemNhanSuPhong}
        />

        <div className="fixed bottom-4 right-4 space-y-2 z-50">
          {danhSachThongBao.map((thongBao) => (
            <div
              key={thongBao.id}
              className="bg-gray-800 text-white py-2 px-4 rounded-lg shadow-lg animate-fade-in-out"
            >
              {thongBao.noiDung}
            </div>
          ))}
        </div>

        <EmployeesListModal
          open={moCuaSoNhanSu}
          onClose={dongCuaSoNhanSu}
          title={
            phongDuocChon
              ? `Nhân sự - ${phongDuocChon.tenPhong}`
              : "Nhân sự phòng ban"
          }
          employees={nhanSuPhongChon}
          description={
            nhanSuPhongChon.length
              ? `Có ${nhanSuPhongChon.length} nhân viên thuộc ${phongDuocChon?.tenPhong ?? "phòng ban"}.`
              : undefined
          }
          emptyDescription="Chưa có nhân viên nào trong phòng ban này."
        />

        <AddDepartmentModal
          open={moThemPhongBan}
          onClose={() => datMoThemPhongBan(false)}
          onSave={themPhongBan}
        />

        <EditDepartmentModal
          open={!!phongDangSua}
          onClose={() => capNhatPhongDangSua(null)}
          department={phongDangSua}
          onSave={capNhatPhongBan}
        />

      </div>
    </div>
  );
}