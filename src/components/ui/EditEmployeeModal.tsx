
import { useState, useEffect, type FormEvent } from "react";
import { Modal } from "./Modal";
import { Input } from "./Input";
import { Select } from "./Select";
import { Button } from "./Button";
import type { Employee } from "./EmployeePage";

export type EmployeeEditData = {
  code: string;
  name: string;
  dept: string;
  position: string;
  salary: number;
  status: "active" | "inactive";
};

export function EditEmployeeModal({
  open,
  onClose,
  onSave,
  employee,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: EmployeeEditData) => void;
  employee: Employee | null;
}) {
  const [formData, setFormData] = useState<EmployeeEditData>({
    code: '',
    name: '',
    dept: '',
    position: '',
    salary: 0,
    status: 'active',
  });

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name,
        dept: employee.dept,
        position: employee.position,
        salary: employee.salary,
        code: employee.code,
        status: employee.status,
      });
    }
  }, [employee]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'salary' ? parseFloat(value) || 0 : value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name) return alert("Tên không được để trống");
    onSave(formData);
  };

  if (!employee) return null;

  return (
    <Modal open={open} onClose={onClose} title="Chỉnh sửa nhân viên">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Mã nhân viên</label>
          <Input name="code" value={formData.code} onChange={handleChange} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Họ tên</label>
          <Input name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Phòng ban</label>
          <Input name="dept" value={formData.dept} onChange={handleChange} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Chức vụ</label>
          <Input name="position" value={formData.position} onChange={handleChange} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Lương cơ bản</label>
          <Input name="salary" type="number" value={formData.salary} onChange={handleChange}  required />
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
          <Button type="submit">Lưu thay đổi</Button>
        </div>
      </form>
    </Modal>
  );
}