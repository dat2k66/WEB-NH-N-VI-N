import { useMemo, useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import { Button } from "./Button";
import { PositionTable } from "./PositionTable";
import { AddPositionModal, type NewPositionData } from "./AddPositionModal";
import { EditPositionModal, type PositionEditData } from "./EditPositionModal";
import { Input } from "./Input";

export type Position = {
  id: string;
  maChucVu: string;
  tenChucVu: string;
  trangThai: "active" | "inactive";
  visible: boolean;
};

type Toast = {
  id: string;
  message: string;
};

export default function PositionPage() {
  const seed: Position[] = [
    { id: "1", maChucVu: "GD", tenChucVu: "Giám đốc", trangThai: "active", visible: true },
    { id: "2", maChucVu: "TP", tenChucVu: "Trưởng phòng", trangThai: "active", visible: true },
    { id: "3", maChucVu: "NV", tenChucVu: "Nhân viên", trangThai: "inactive", visible: true },
  ];

  const [data, setData] = useState<Position[]>(seed);
  const [q, setQ] = useState("");
  const [openAdd, setOpenAdd] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);

  const filtered = useMemo(() => {
    return data.filter((d) => {
      if (q && !(d.tenChucVu.toLowerCase().includes(q.toLowerCase()) || d.maChucVu.toLowerCase().includes(q.toLowerCase())))
        return false;
      return true;
    });
  }, [data, q]);

  const generatePosCode = (name: string) => {
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 3);
  }

  const addPosition = (pos: NewPositionData) => {
    const finalCode = pos.maChucVu || generatePosCode(pos.tenChucVu);
    const newPosition: Position = {
      ...pos,
      id: uuidv4(),
      maChucVu: finalCode,
      visible: true
    };
    setData((s) => [newPosition, ...s]);
    showToast("Đã thêm chức vụ");
    setOpenAdd(false);
  };

  const updatePosition = (updatedData: PositionEditData) => {
    if (!editingPosition) return;

    setData(s => s.map(pos => pos.id === editingPosition.id ? { ...pos, ...updatedData } : pos));
    showToast("Đã cập nhật chức vụ");
    setEditingPosition(null);
  };

  const deletePosition = (id: string) => {
    const confirmed = window.confirm("Bạn có chắc chắn muốn xoá chức vụ này?");
    if (confirmed) {
      setData((s) => s.filter((pos) => pos.id !== id));
      showToast("Đã xóa chức vụ");
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
      s.map((pos) => (pos.id === id ? { ...pos, visible: !pos.visible } : pos))
    );
  };

  const handleEdit = (position: Position) => {
    setEditingPosition(position);
  };

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

        <PositionTable data={filtered} onDelete={deletePosition} onToggleVisibility={toggleVisibility} onEdit={handleEdit} />

        <div className="fixed bottom-4 right-4 space-y-2 z-50">
          {toasts.map((toast) => (<div key={toast.id} className="bg-gray-800 text-white py-2 px-4 rounded-lg shadow-lg animate-fade-in-out">{toast.message}</div>))}
        </div>

        <AddPositionModal open={openAdd} onClose={() => setOpenAdd(false)} onSave={addPosition} generatedCode={"Nhập mã hoặc để trống để tạo tự động"} />

        <EditPositionModal open={!!editingPosition} onClose={() => setEditingPosition(null)} position={editingPosition} onSave={updatePosition} />

      </div>
    </div>
  );
}