import { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';
import { Button } from "./Button";
import { EmployeeTable } from "./EmployeeTable";
import { AddEmployeeModal } from "./AddEmployeeModal";
import { EditEmployeeModal, type EmployeeEditData } from "./EditEmployeeModal";
import { FilterBar } from "./FilterBar";
import type { NewEmployeeData } from './AddEmployeeModal';
import { EmployeeDetailModal } from "./EmployeeDetailModal";
import { FaceRegistrationModal } from "./FaceRegistrationModal";
import { AttendanceHistoryModal } from "./AttendanceHistoryModal";
import { employeesService, type EmployeeApiResult } from "../../services/employeesService"; 

export type Employee = {
  id: string;
  code: string;
  name: string;
  dept: string;
  position: string;
  salary: number;
  status: "active" | "inactive";
  visible: boolean;
  photo?: string;
  joinOrder?: number;
  taiKhoan: string;
  matKhau: string;
};

type Toast = {
  id: string;
  message: string;
};


const mapApiToEmployee = (item: EmployeeApiResult): Employee => ({
    id: String(item.id),
    code: item.code,
    name: item.name,
    dept: item.dept,
    position: item.position,
    salary: item.salary,
    status: item.status,
    photo: item.photo ?? undefined,
    taiKhoan: item.taiKhoan,
    matKhau: item.matKhau,
    visible: true,
});


export default function EmployeePage() {
  const navigate = useNavigate();
  const PAGE_SIZE = 4;

  const [data, setData] = useState<Employee[]>([]);
  const [dangTai, datDangTai] = useState(true); 

  const [q, setQ] = useState("");
  const [dept, setDept] = useState("all");
  const [status, setStatus] = useState("all");
  const [openAdd, setOpenAdd] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [detailEmployee, setDetailEmployee] = useState<Employee | null>(null);
  const [faceEmployee, setFaceEmployee] = useState<Employee | null>(null);
  const [attendanceEmployee, setAttendanceEmployee] = useState<Employee | null>(null);
  const [page, setPage] = useState(1);
  
  const nextJoinOrder = 0; 

  const showToast = useCallback((message: string) => {
    const toastId = uuidv4();
    setToasts((prevToasts) => [...prevToasts, { id: toastId, message }]);
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== toastId));
    }, 3000);
  }, []);
  
  
  const taiDuLieuNhanVien = useCallback(async () => {
    datDangTai(true);
    try {
      const duLieuTuAPI = await employeesService.list();
      const duLieuFormatted = duLieuTuAPI.map(mapApiToEmployee);
      setData(duLieuFormatted);
      // Ghi đè Local Storage để AttendancePage có thể đọc được
      localStorage.setItem("employeesData", JSON.stringify(duLieuFormatted)); 
    } catch (error) {
      showToast("Lỗi tải dữ liệu nhân viên: " + (error as Error).message);
      setData([]);
    } finally {
      datDangTai(false);
    }
  }, [showToast]);

  
  useEffect(() => {
    taiDuLieuNhanVien();
  }, [taiDuLieuNhanVien]);


  const filtered = useMemo(() => {
    return data.filter((d) => {
      if (dept !== "all" && d.dept !== dept) return false;
      if (status !== "all" && d.status !== status) return false;
      if (q && !(d.name.toLowerCase().includes(q.toLowerCase()) || d.code.toLowerCase().includes(q.toLowerCase())))
        return false;
      return true;
    });
  }, [data, q, dept, status]);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    setPage((prev) => Math.min(prev, maxPage));
  }, [filtered.length]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const handleQueryChange = (value: string) => {
    setPage(1);
    setQ(value);
  };

  const handleDeptChange = (value: string) => {
    setPage(1);
    setDept(value);
  };

  const handleStatusChange = (value: string) => {
    setPage(1);
    setStatus(value);
  };

  const addEmployee = async (emp: NewEmployeeData) => {
    try {
        await employeesService.create(emp);
        
        showToast("Đã thêm nhân viên thành công!");
        setOpenAdd(false);
        taiDuLieuNhanVien(); 
    } catch (error) {
        showToast("Lỗi khi thêm nhân viên: " + (error as Error).message);
    }
  };

  const updateEmployee = async (updatedData: EmployeeEditData) => {
    if (!editingEmployee) return;
    
    try {
        await employeesService.update(editingEmployee.id, updatedData);

        showToast("Đã cập nhật nhân viên thành công!");
        setEditingEmployee(null);
        taiDuLieuNhanVien(); 
    } catch (error) {
        showToast("Lỗi khi cập nhật nhân viên: " + (error as Error).message);
    }
  };

  const deleteEmployee = async (id: string) => {
    const confirmed = window.confirm("Bạn có chắc chắn muốn xoá nhân viên này?");
    if (confirmed) {
      try {
        await employeesService.delete(id);
        showToast("Đã xóa nhân viên");
        taiDuLieuNhanVien(); 
      } catch (error) {
        showToast("Lỗi khi xóa nhân viên: " + (error as Error).message);
      }
    }
  };


  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
  };

  const handleRegisterFace = (employee: Employee) => {
    setFaceEmployee(employee);
  };

  const handleViewDetail = (employee: Employee) => {
    setDetailEmployee(employee);
  };

  const handleViewAttendance = (employee: Employee) => {
    setAttendanceEmployee(employee);
  };

  const handleViewPayroll = (employee: Employee) => {
    
    const workingHours = localStorage.getItem(`workingHours:${employee.id}`);
    let monthlyHours = "0";

    if (workingHours) {
      try {
        const parsed = JSON.parse(workingHours) as {
          year: number;
          month: number;
          hours: number;
        };
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();
        if (
          parsed &&
          parsed.year === currentYear &&
          parsed.month === currentMonth &&
          typeof parsed.hours === "number"
        ) {
          monthlyHours = String(parsed.hours);
        }
      } catch (error) {
        console.warn("Không đọc được dữ liệu workingHours:", error);
      }
    }

    const query = new URLSearchParams({
      employeeId: employee.id,
      code: employee.code,
      name: employee.name,
      dept: employee.dept,
      position: employee.position,
      salary: String(employee.salary),
      hours: monthlyHours,
    });
    navigate(`/admin/payroll?${query.toString()}`);
  };

  if (dangTai) {
    return (
        <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
            <p className="text-xl font-semibold text-blue-600">Đang tải dữ liệu nhân viên...</p>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div
          className="flex items-center gap-2 text-slate-500 text-sm font-medium cursor-pointer w-max hover:text-slate-700 transition"
          onClick={() => navigate("/")}
        >
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm border border-slate-200">
            ←
          </span>
          Quay lại
        </div>

        <div className="rounded-[32px] bg-white/90 p-8 shadow-[0_25px_60px_rgba(15,23,42,0.08)] border border-slate-100">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-blue-500 uppercase tracking-wide">Quản trị nhân sự</p>
              <h1 className="mt-2 text-4xl font-bold text-slate-900">Nhân viên</h1>
              <p className="mt-1 text-base text-slate-500">
                Quản lý danh sách và thông tin nhân sự
              </p>
            </div>
            <div className="flex flex-col items-end gap-4">
              <Button
                className="rounded-full px-5 py-2 text-base shadow-lg shadow-blue-200"
                onClick={() => setOpenAdd(true)}
              >
                + Thêm nhân viên
              </Button>
            </div>
          </div>

          <div className="mt-8">
            <FilterBar
              q={q}
              onQueryChange={handleQueryChange}
              dept={dept}
              onDeptChange={handleDeptChange}
              status={status}
              onStatusChange={handleStatusChange}
            />
          </div>

          <div className="mt-6">
        <EmployeeTable
          data={paginatedData}
          totalCount={filtered.length}
          page={page}
          pageSize={PAGE_SIZE}
          pageCount={Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))}
          onPageChange={setPage}
          onDelete={deleteEmployee}
          onEdit={handleEdit}
          onRegisterFace={handleRegisterFace}
          onViewPayroll={handleViewPayroll}
          onViewDetail={handleViewDetail}
          onViewAttendance={handleViewAttendance}
        />
          </div>
        </div>

        <div className="fixed bottom-4 right-4 space-y-2 z-50">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className="bg-gray-800 text-white py-2 px-4 rounded-lg shadow-lg animate-fade-in-out"
            >
              {toast.message}
            </div>
          ))}
        </div>

        <AddEmployeeModal
          open={openAdd}
          onClose={() => setOpenAdd(false)}
          onSave={addEmployee}
          nextJoinOrder={nextJoinOrder}
        />

        <EditEmployeeModal
          open={!!editingEmployee}
          onClose={() => setEditingEmployee(null)}
          employee={editingEmployee}
          onSave={updateEmployee}
        />

        <EmployeeDetailModal
          open={!!detailEmployee}
          onClose={() => setDetailEmployee(null)}
          employee={detailEmployee}
        />

        <FaceRegistrationModal
          open={!!faceEmployee}
          onClose={() => setFaceEmployee(null)}
          employee={faceEmployee}
          onSaved={() => {
            showToast("Đã lưu khuôn mặt nhân viên");
            setFaceEmployee(null);
            taiDuLieuNhanVien();
          }}
        />
        <AttendanceHistoryModal
          open={!!attendanceEmployee}
          onClose={() => setAttendanceEmployee(null)}
          employee={attendanceEmployee}
        />

      </div>
    </div>
  );
}