
import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';
import { Button } from "./Button";
import { EmployeeTable } from "./EmployeeTable";
import { AddEmployeeModal } from "./AddEmployeeModal";
import { EditEmployeeModal, type EmployeeEditData } from "./EditEmployeeModal";
import { FilterBar } from "./FilterBar"; // Đảm bảo import đúng component
import type { NewEmployeeData } from './AddEmployeeModal';
import { EmployeeDetailModal } from "./EmployeeDetailModal";
import { FaceRegistrationModal } from "./FaceRegistrationModal";

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
  faceData?: string;
};

type Toast = {
  id: string;
  message: string;
};

export default function EmployeePage() {
  const navigate = useNavigate();
  const seed: Employee[] = [
    { id: "1", code: "PDT", name: "Nguyễn Minh Anh", dept: "Phòng Kinh Doanh", position: "Nhân viên", salary: 10000000, status: "active", visible: true, photo: "https://i.pravatar.cc/150?img=3" },
    { id: "2", code: "PCT", name: "Nguyễn Minh Tạo", dept: "Trưởng phòng", position: "Trưởng phòng", salary: 20000000, status: "active", visible: true, photo: "https://i.pravatar.cc/150?img=15" },
    { id: "3", code: "PKT", name: "Trần Quỳnh", dept: "Chăm sóc KH", position: "Nhân viên", salary: 12000000, status: "inactive", visible: true, photo: "https://i.pravatar.cc/150?img=32" },
  ];

  const [data, setData] = useState<Employee[]>(() => {
    const stored = localStorage.getItem("employeesData");
    if (stored) {
      try {
        return JSON.parse(stored) as Employee[];
      } catch (error) {
        console.warn("Không đọc được employeesData:", error);
      }
    }
    localStorage.setItem("employeesData", JSON.stringify(seed));
    return seed;
  });
  const [q, setQ] = useState("");
  const [dept, setDept] = useState("all");
  const [status, setStatus] = useState("all");
  const [openAdd, setOpenAdd] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [detailEmployee, setDetailEmployee] = useState<Employee | null>(null);
  const [faceEmployee, setFaceEmployee] = useState<Employee | null>(null);

  const filtered = useMemo(() => {
    return data.filter((d) => {
      if (dept !== "all" && d.dept !== dept) return false;
      if (status !== "all" && d.status !== status) return false;
      if (q && !(d.name.toLowerCase().includes(q.toLowerCase())))
        return false;
      return true;
    });
  }, [data, q, dept, status]);

  const getCodePart = (text: string) => {
    return text.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 3);
  }

  const generateEmployeeCode = (dept: string, position: string, existingEmployees: Employee[]) => {
    const deptCode = getCodePart(dept);
    const posCode = getCodePart(position);
    const prefix = `${deptCode}${posCode}`;
    
    const nextId = (existingEmployees.length + 1).toString().padStart(4, '0');
    return `${prefix}${nextId}`;
  };

  const addEmployee = (emp: NewEmployeeData) => {
    const finalCode = emp.code || generateEmployeeCode(emp.dept, emp.position, data);
    const newEmployee: Employee = { 
      ...emp, 
      id: uuidv4(), 
      code: finalCode,
      visible: true 
    };
    setData((s) => {
      const next = [newEmployee, ...s];
      localStorage.setItem("employeesData", JSON.stringify(next));
      return next;
    });
    showToast("Đã thêm nhân viên");
    setOpenAdd(false);
  };

  const updateEmployee = (updatedData: EmployeeEditData) => {
    if (!editingEmployee) return;
    
    setData((s) => {
      const next = s.map((emp) =>
        emp.id === editingEmployee.id ? { ...emp, ...updatedData } : emp
      );
      localStorage.setItem("employeesData", JSON.stringify(next));
      return next;
    });
    showToast("Đã cập nhật nhân viên");
    setEditingEmployee(null);
  };

  const deleteEmployee = (id: string) => {
    const confirmed = window.confirm("Bạn có chắc chắn muốn xoá nhân viên này?");
    if (confirmed) {
      setData((s) => {
        const next = s.filter((emp) => emp.id !== id);
        localStorage.setItem("employeesData", JSON.stringify(next));
        return next;
      });
      showToast("Đã xóa nhân viên");
    }
  };

  const showToast = (message: string) => {
    const toastId = uuidv4();
    setToasts((prevToasts) => [...prevToasts, { id: toastId, message }]);
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== toastId));
    }, 3000);
  };

  const toggleVisibility = (id: string) => {
    setData((s) => {
      const next = s.map((emp) =>
        emp.id === id ? { ...emp, visible: !emp.visible } : emp
      );
      localStorage.setItem("employeesData", JSON.stringify(next));
      return next;
    });
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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Nhân viên</h1>
          <Button onClick={() => setOpenAdd(true)}>+ Thêm nhân viên</Button>
        </div>

        <FilterBar 
          q={q} onQueryChange={setQ}
          dept={dept} onDeptChange={setDept}
          status={status} onStatusChange={setStatus}
        />

        <EmployeeTable
          data={filtered}
          onDelete={deleteEmployee}
          onToggleVisibility={toggleVisibility}
          onEdit={handleEdit}
          onRegisterFace={handleRegisterFace}
          onViewPayroll={handleViewPayroll}
          onViewDetail={handleViewDetail}
        />

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
          generatedCode={"Nhập mã hoặc để trống để tạo tự động"}
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
          }}
          onCapture={(image) => {
            if (!faceEmployee) return;
            setData((current) => {
              const next = current.map((emp) =>
                emp.id === faceEmployee.id ? { ...emp, faceData: image } : emp
              );
              localStorage.setItem("employeesData", JSON.stringify(next));
              return next;
            });
            localStorage.setItem(`faceData:${faceEmployee.id}`, image);
          }}
          onRetake={() => {
            if (!faceEmployee) return;
            setData((current) => current.map((emp) =>
              emp.id === faceEmployee.id ? { ...emp, faceData: undefined } : emp
            ));
            localStorage.removeItem(`faceData:${faceEmployee.id}`);
          }}
        />

      </div>
    </div>
  );
}
