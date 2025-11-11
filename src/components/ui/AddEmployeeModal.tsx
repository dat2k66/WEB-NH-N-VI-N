/* ============================================================
 📁 FILE: src/components/Employee/AddEmployeeModal.tsx
   → Form thêm nhân viên hiển thị trong popup
============================================================ */
import { useState, type FormEvent } from "react";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Button } from "../ui/Button";

type EmployeeIn = {
  code: string;
  name: string;
  dept: string;
  status: "active" | "inactive";
};

export function AddEmployeeModal({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (e: EmployeeIn) => void;
}) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [dept, setDept] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name || !code) return alert("Vui lòng nhập mã và tên");
    onSave({ code, name, dept, status });
    setCode("");
    setName("");
    setDept("");
    setStatus("active");
  };

  return (
    <Modal open={open} onClose={onClose} title="Thêm nhân viên">
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Họ tên</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Họ và tên"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Mã</label>
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Mã NV"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Phòng ban</label>
          <Input
            value={dept}
            onChange={(e) => setDept(e.target.value)}
            placeholder="Phòng ban"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Trạng thái</label>
          <Select value={status} onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}>
            <option value="active">Hoạt động</option>
            <option value="inactive">Ngưng</option>
          </Select>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="ghost" type="button" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit">Lưu</Button>
        </div>
      </form>
    </Modal>
  );
}