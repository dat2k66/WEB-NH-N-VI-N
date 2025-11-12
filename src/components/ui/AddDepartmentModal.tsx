import { useState, type FormEvent, useEffect } from "react";
import { Modal } from "./Modal";
import { Input } from "./Input";
import { Button } from "./Button";
import { Select } from "./Select";

export type NewDepartmentData = {
  maPhong: string;
  tenPhong: string;
  namThanhLap: number;
  trangThai: "active" | "inactive";
};

export function AddDepartmentModal({
  open,
  onClose,
  onSave,
  generatedCode,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: NewDepartmentData) => void;
  generatedCode: string;
}) {
  const [formData, setFormData] = useState<NewDepartmentData>({
    maPhong: '',
    tenPhong: '',
    namThanhLap: new Date().getFullYear(),
    trangThai: 'active',
  });

  useEffect(() => {
    if (open) {
      setFormData({
        maPhong: '',
        tenPhong: '',
        namThanhLap: new Date().getFullYear(),
        trangThai: 'active',
      });
    }
  }, [open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'namThanhLap' ? parseInt(value, 10) || 0 : value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.tenPhong) {
      alert("Vui lòng nhập Tên phòng.");
      return;
    }
    onSave(formData);
  };

  return (
    <Modal open={open} onClose={onClose} title="Thêm phòng ban">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Mã phòng</label>
          <Input name="maPhong" value={formData.maPhong} onChange={handleChange} placeholder={generatedCode} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tên phòng</label>
          <Input name="tenPhong" value={formData.tenPhong} onChange={handleChange} placeholder="VD: Phòng Kinh Doanh" required />
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
          <Button type="submit">Lưu</Button>
        </div>
      </form>
    </Modal>
  );
}