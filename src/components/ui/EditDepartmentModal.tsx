import { useState, useEffect, type FormEvent } from "react";
import { Modal } from "./Modal";
import { Input } from "./Input";
import { Select } from "./Select";
import { Button } from "./Button";
import type { Department } from "./DepartmentPage";

export type DepartmentEditData = {
  maPhong: string;
  tenPhong: string;
  namThanhLap: number;
  trangThai: "active" | "inactive";
};

export function EditDepartmentModal({
  open,
  onClose,
  onSave,
  department,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: DepartmentEditData) => void;
  department: Department | null;
}) {
  const [formData, setFormData] = useState<DepartmentEditData>({
    maPhong: '',
    tenPhong: '',
    namThanhLap: new Date().getFullYear(),
    trangThai: 'active',
  });

  useEffect(() => {
    if (department) {
      setFormData({
        maPhong: department.maPhong,
        tenPhong: department.tenPhong,
        namThanhLap: department.namThanhLap,
        trangThai: department.trangThai,
      });
    }
  }, [department]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'namThanhLap' ? parseInt(value, 10) || 0 : value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.tenPhong) return alert("Tên phòng không được để trống");
    onSave(formData);
  };

  if (!department) return null;

  return (
    <Modal open={open} onClose={onClose} title="Chỉnh sửa phòng ban">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Mã phòng</label>
          <Input name="maPhong" value={formData.maPhong} onChange={handleChange} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tên phòng</label>
          <Input name="tenPhong" value={formData.tenPhong} onChange={handleChange} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Năm thành lập</label>
          <Input name="namThanhLap" type="number" value={formData.namThanhLap} onChange={handleChange} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Trạng thái</label>
          <Select name="trangThai" value={formData.trangThai} onChange={handleChange}>
            <option value="active">Hoạt động</option>
            <option value="inactive">Ngưng</option>
          </Select>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="ghost" type="button" onClick={onClose}>Huỷ</Button>
          <Button type="submit">Lưu thay đổi</Button>
        </div>
      </form>
    </Modal>
  );
}