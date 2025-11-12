
import { useState, type FormEvent, useEffect } from "react";
import { Modal } from "./Modal";
import { Input } from "./Input";
import { Button } from "./Button";
import { Select } from "./Select";

export type NewEmployeeData = {
  name: string;
  code: string;
  dept: string;
  position: string;
  salary: number;
  status: "active" | "inactive";
};

export function AddEmployeeModal({
  open,
  onClose,
  onSave,
  generatedCode,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: NewEmployeeData) => void;
  generatedCode: string;
}) {
  const [formData, setFormData] = useState<NewEmployeeData>({
    name: '',
    code: '',
    dept: '',
    position: 'Nhân viên',
    salary: 0,
    status: 'active',
  });

  useEffect(() => {
    if (open) {
      setFormData({
        name: '',
        code: '',
        dept: '',
        position: 'Nhân viên',
        salary: 0,
        status: 'active',
      });
    }
  }, [open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'salary' ? parseFloat(value) || 0 : value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) {
      alert("Vui lòng nhập đủ Mã NV và Họ tên.");
      return;
    }
    onSave(formData);
  };

  return (
    <Modal open={open} onClose={onClose} title="Thêm nhân viên">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Mã NV</label>
          <Input name="code" value={formData.code} onChange={handleChange} placeholder={generatedCode} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Họ và tên</label>
          <Input name="name" value={formData.name} onChange={handleChange} placeholder="Họ và tên" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Phòng ban</label>
          <Input name="dept" value={formData.dept} onChange={handleChange} placeholder="VD: Phòng Kinh Doanh" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Chức vụ</label>
          <Input name="position" value={formData.position} onChange={handleChange} placeholder="VD: Nhân viên" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Lương cơ bản</label>
          <Input name="salary" type="number" value={formData.salary} onChange={handleChange} placeholder="Lương cơ bản" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Trạng thái</label>
          <Select name="status" value={formData.status} onChange={handleChange}>
            <option value="active">Hoạt động</option>
            <option value="inactive">Ngưng</option>
          </Select>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="ghost" type="button" onClick={onClose}>
            Huỷ
          </Button>
          <Button type="submit">Lưu</Button>
        </div>
      </form>
    </Modal>
  );
}