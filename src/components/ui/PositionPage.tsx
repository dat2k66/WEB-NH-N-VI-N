import { useMemo, useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from 'uuid';
import { Button } from "./Button";
import { PositionTable } from "./PositionTable";
import { AddPositionModal, type NewPositionData } from "./AddPositionModal";
import { EditPositionModal, type PositionEditData } from "./EditPositionModal";
import { Input } from "./Input";
import type { Employee } from "./EmployeePage";
import { EmployeesListModal } from "./EmployeesListModal";
import { generatePositionShortCode } from "../../utils/employeeCode";
// IMPORT SERVICE MỚI
import { positionsService } from "../../services/positionsService";

export type Position = {
  id: string;
  maChucVu: string;
  tenChucVu: string;
  moTa?: string;
  capDo?: "ADMIN" | "MANAGER" | "STAFF" | "INTERN" | string;
  quyenHan?: string[];
  trangThai: "active" | "inactive";
  visible: boolean;
  soNhanSu?: number;
};

type Toast = {
  id: string;
  message: string;
};

// Hàm ánh xạ dữ liệu từ API (MySQL snake_case) sang format Frontend (camelCase)
const mapApiToPosition = (item: any): Position => ({
    id: String(item.id),
    maChucVu: item.ma_chuc_vu,
    tenChucVu: item.ten_chuc_vu,
    moTa: item.mo_ta,
    capDo: item.cap_do,
    trangThai: item.trang_thai,
    quyenHan: item.quyen_han ? JSON.parse(item.quyen_han) : [], // Parse JSON string
    visible: true, // Mặc định hiển thị trên UI
});


export default function PositionPage() {
  
  const [data, setData] = useState<Position[]>([]);
  const [dangTai, datDangTai] = useState(true); // Thêm state loading

  const [q, setQ] = useState("");
  const [openAdd, setOpenAdd] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [page, setPage] = useState(1);
  const [employeeCounts, setEmployeeCounts] = useState<Record<string, number>>({});
  const [positionEmployees, setPositionEmployees] = useState<Employee[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [employeeModalOpen, setEmployeeModalOpen] = useState(false);
  const PAGE_SIZE = 4;

  const showToast = useCallback((message: string) => {
    const toastId = uuidv4();
    setToasts((prevToasts) => [...prevToasts, { id: toastId, message }]);
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== toastId));
    }, 3000);
  }, []);

  // Hàm tải dữ liệu chính từ Backend
  const taiDuLieuChucVu = useCallback(async () => {
    datDangTai(true);
    try {
      const duLieuTuAPI = await positionsService.list();
      const duLieuFormatted = duLieuTuAPI.map(mapApiToPosition);
      setData(duLieuFormatted);
    } catch (error) {
      showToast("Lỗi tải dữ liệu chức vụ: " + (error as Error).message);
      setData([]);
    } finally {
      datDangTai(false);
    }
  }, [showToast]);

  // THAY THẾ LOGIC LOAD LÚC KHỞI TẠO
  useEffect(() => {
    taiDuLieuChucVu();

    // Giữ nguyên logic đồng bộ số lượng nhân sự theo chức vụ (dùng tạm localStorage)
    const syncEmployeeCounts = () => {
      try {
        const raw = localStorage.getItem("employeesData");
        if (!raw) {
          setEmployeeCounts({});
          return;
        }
        const employees = JSON.parse(raw) as Employee[];
        const counts = employees.reduce<Record<string, number>>((acc, emp) => {
          acc[emp.position] = (acc[emp.position] || 0) + 1;
          return acc;
        }, {});
        setEmployeeCounts(counts);
      } catch (error) {
        console.warn("Không đọc được employeesData:", error);
        setEmployeeCounts({});
      }
    };

    syncEmployeeCounts();
    window.addEventListener("storage", syncEmployeeCounts);
    window.addEventListener("focus", syncEmployeeCounts);
    return () => {
      window.removeEventListener("storage", syncEmployeeCounts);
      window.removeEventListener("focus", syncEmployeeCounts);
    };
  }, [taiDuLieuChucVu]); // Phụ thuộc vào hàm tải dữ liệu chính

  const filtered = useMemo(() => {
    const result = data.filter((d) => {
      if (q && !(d.tenChucVu.toLowerCase().includes(q.toLowerCase()) || d.maChucVu.toLowerCase().includes(q.toLowerCase())))
        return false;
      return true;
    });
    const maxPage = Math.max(1, Math.ceil(result.length / PAGE_SIZE));
    if (page > maxPage) {
      setPage(maxPage);
    }
    return result;
  }, [data, q, page]);

  const generatePosCode = (name: string) => {
    return generatePositionShortCode(name) || "X";
  };

  // THAY THẾ LOGIC THÊM CHỨC VỤ (CREATE)
  const addPosition = async (pos: NewPositionData) => {
    try {
      const finalCode = pos.maChucVu || generatePosCode(pos.tenChucVu);
      
      await positionsService.create({ 
          ...pos, 
          maChucVu: finalCode,
          quyenHan: pos.quyenHan, // Mảng sẽ được stringify ở Backend
      });

      showToast("Đã thêm chức vụ thành công!");
      setOpenAdd(false);
      taiDuLieuChucVu(); // Tải lại dữ liệu
    } catch (error) {
      showToast("Lỗi khi thêm chức vụ: " + (error as Error).message);
    }
  };

  // THAY THẾ LOGIC CẬP NHẬT CHỨC VỤ (UPDATE)
  const updatePosition = async (updatedData: PositionEditData) => {
    if (!editingPosition) return;

    try {
        // Lấy lại các trường cần thiết khác để gửi đi
        const payload = {
            ...updatedData,
            capDo: editingPosition.capDo, // Giữ nguyên cấp độ, mô tả
            moTa: editingPosition.moTa,
            quyenHan: editingPosition.quyenHan,
        };
        await positionsService.update(editingPosition.id, payload);

        showToast("Đã cập nhật chức vụ thành công!");
        setEditingPosition(null);
        taiDuLieuChucVu(); // Tải lại dữ liệu
    } catch (error) {
        showToast("Lỗi khi cập nhật chức vụ: " + (error as Error).message);
    }
  };

  // THAY THẾ LOGIC XÓA CHỨC VỤ (DELETE)
  const deletePosition = async (id: string) => {
    const confirmed = window.confirm("Bạn có chắc chắn muốn xoá chức vụ này?");
    if (confirmed) {
      try {
        await positionsService.delete(id);
        showToast("Đã xóa chức vụ!");
        taiDuLieuChucVu(); // Tải lại dữ liệu
      } catch (error) {
        showToast("Lỗi khi xóa chức vụ: " + (error as Error).message);
      }
    }
  };

  // THAY THẾ LOGIC ĐẢO TRẠNG THÁI (Toggle)
  const toggleVisibility = async (id: string) => {
    const position = data.find(p => p.id === id);
    if (!position) return;

    const nextStatus = position.trangThai === "active" ? "inactive" : "active";
    const nextVisible = !position.visible;

    try {
        const payload = {
            maChucVu: position.maChucVu,
            tenChucVu: position.tenChucVu,
            trangThai: nextStatus, 
            capDo: position.capDo,
            moTa: position.moTa,
            quyenHan: position.quyenHan,
        };
        await positionsService.update(id, payload);

        // Cập nhật state UI nhanh
        setData(dsCu => dsCu.map(p => p.id === id ? {...p, trangThai: nextStatus, visible: nextVisible} : p));
        showToast(`Đã chuyển trạng thái sang ${nextStatus === 'active' ? 'Hoạt động' : 'Ngưng'}`);
    } catch (error) {
        showToast("Lỗi khi thay đổi trạng thái: " + (error as Error).message);
    }
  };


  const handleEdit = (position: Position) => {
    setEditingPosition(position);
  };

  const handleViewEmployees = (position: Position) => {
    setSelectedPosition(position);
    // Vẫn dùng tạm localStorage cho nhân viên
    try {
      const raw = localStorage.getItem("employeesData");
      if (!raw) {
        setPositionEmployees([]);
      } else {
        const employees = JSON.parse(raw) as Employee[];
        const filteredEmployees = employees.filter(
          (emp) => emp.position === position.tenChucVu
        );
        setPositionEmployees(filteredEmployees);
      }
    } catch (error) {
      console.warn("Không đọc được employeesData:", error);
      setPositionEmployees([]);
    }
    setEmployeeModalOpen(true);
  };

  const closeEmployeeModal = () => {
    setEmployeeModalOpen(false);
    setPositionEmployees([]);
    setSelectedPosition(null);
  };

  // Logic hiển thị Loading State
  if (dangTai) {
    return (
        <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
            <p className="text-xl font-semibold text-purple-600">Đang tải dữ liệu chức vụ...</p>
        </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Chức vụ</h1>
          <Button onClick={() => setOpenAdd(true)}>+ Thêm chức vụ</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="md:col-span-2">
                <Input placeholder="Tìm theo tên, mã chức vụ..." value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
        </div>

        <PositionTable
          data={filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((position) => ({
            ...position,
            soNhanSu: employeeCounts[position.tenChucVu] || 0,
          }))}
          totalCount={filtered.length}
          page={page}
          pageSize={PAGE_SIZE}
          pageCount={Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))}
          onPageChange={setPage}
          onDelete={deletePosition}
          onToggleVisibility={toggleVisibility}
          onEdit={handleEdit}
          onViewEmployees={handleViewEmployees}
        />

        <div className="fixed bottom-4 right-4 space-y-2 z-50">
          {toasts.map((toast) => (<div key={toast.id} className="bg-gray-800 text-white py-2 px-4 rounded-lg shadow-lg animate-fade-in-out">{toast.message}</div>))}
        </div>

        <EmployeesListModal
          open={employeeModalOpen}
          onClose={closeEmployeeModal}
          title={
            selectedPosition
              ? `Nhân sự - ${selectedPosition.tenChucVu}`
              : "Nhân sự theo chức vụ"
          }
          employees={positionEmployees}
          description={
            positionEmployees.length
              ? `Có ${positionEmployees.length} nhân viên giữ chức vụ ${selectedPosition?.tenChucVu ?? ""}.`
              : undefined
          }
          emptyDescription="Chưa có nhân viên nào giữ chức vụ này."
        />

        <AddPositionModal open={openAdd} onClose={() => setOpenAdd(false)} onSave={addPosition} />

        <EditPositionModal open={!!editingPosition} onClose={() => setEditingPosition(null)} position={editingPosition} onSave={updatePosition} />

      </div>
    </div>
  );
}