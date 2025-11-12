import { useMemo, useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import { Button } from "./Button";
import { DepartmentTable } from "./DepartmentTable";
import { AddDepartmentModal, type NewDepartmentData } from "./AddDepartmentModal";
import { EditDepartmentModal, type DepartmentEditData } from "./EditDepartmentModal";
import { Input } from "./Input";

export type Department = {
  id: string;
  maPhong: string;
  tenPhong: string;
  namThanhLap: number;
  trangThai: "active" | "inactive";
  visible: boolean;
};

type Toast = {
  id: string;
  message: string;
};

export default function DepartmentPage() {
  const seed: Department[] = [
    { id: "1", maPhong: "PKD", tenPhong: "Phòng Kinh Doanh", namThanhLap: 2020, trangThai: "active", visible: true },
    { id: "2", maPhong: "PNS", tenPhong: "Phòng Nhân Sự", namThanhLap: 2019, trangThai: "active", visible: true },
    { id: "3", maPhong: "PKT", tenPhong: "Phòng Kế Toán", namThanhLap: 2018, trangThai: "inactive", visible: true },
  ];

  const [data, setData] = useState<Department[]>(seed);
  const [q, setQ] = useState("");
  const [openAdd, setOpenAdd] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);

  const filtered = useMemo(() => {
    return data.filter((d) => {
      if (q && !(d.tenPhong.toLowerCase().includes(q.toLowerCase()) || d.maPhong.toLowerCase().includes(q.toLowerCase())))
        return false;
      return true;
    });
  }, [data, q]);

  const generateDeptCode = (name: string) => {
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 3);
  }

  const addDepartment = (dept: NewDepartmentData) => {
    const finalCode = dept.maPhong || generateDeptCode(dept.tenPhong);
    const newDepartment: Department = {
      ...dept,
      id: uuidv4(),
      maPhong: finalCode,
      visible: true
    };
    setData((s) => [newDepartment, ...s]);
    showToast("Đã thêm phòng ban");
    setOpenAdd(false);
  };

  const updateDepartment = (updatedData: DepartmentEditData) => {
    if (!editingDepartment) return;

    setData(s => s.map(dept => dept.id === editingDepartment.id ? { ...dept, ...updatedData } : dept));
    showToast("Đã cập nhật phòng ban");
    setEditingDepartment(null);
  };

  const deleteDepartment = (id: string) => {
    const confirmed = window.confirm("Bạn có chắc chắn muốn xoá phòng ban này?");
    if (confirmed) {
      setData((s) => s.filter((dept) => dept.id !== id));
      showToast("Đã xóa phòng ban");
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
    setData((s) =>
      s.map((dept) => (dept.id === id ? { ...dept, visible: !dept.visible } : dept))
    );
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Phòng ban</h1>
          <Button onClick={() => setOpenAdd(true)}>+ Thêm phòng ban</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="md:col-span-2">
                <Input
                placeholder="Tìm theo tên, mã phòng..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                />
            </div>
        </div>

        <DepartmentTable data={filtered} onDelete={deleteDepartment} onToggleVisibility={toggleVisibility} onEdit={handleEdit} />

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

        <AddDepartmentModal
          open={openAdd}
          onClose={() => setOpenAdd(false)}
          onSave={addDepartment}
          generatedCode={"Nhập mã hoặc để trống để tạo tự động"}
        />

        <EditDepartmentModal
          open={!!editingDepartment}
          onClose={() => setEditingDepartment(null)}
          department={editingDepartment}
          onSave={updateDepartment}
        />

      </div>
    </div>
  );
}