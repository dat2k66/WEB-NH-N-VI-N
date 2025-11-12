import { useState, useEffect, type FormEvent } from "react";
import { Modal } from "./Modal";
import { Input } from "./Input";
import { Select } from "./Select";
import { Button } from "./Button";
import type { Position } from "./PositionPage";

export type PositionEditData = {
  maChucVu: string;
  tenChucVu: string;
  trangThai: "active" | "inactive";
};

export function EditPositionModal({
  open,
  onClose,
  onSave,
  position,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: PositionEditData) => void;
  position: Position | null;
}) {
  const [formData, setFormData] = useState<PositionEditData>({
    maChucVu: '',
    tenChucVu: '',
    trangThai: 'active',
  });

  useEffect(() => {
    if (position) {
      setFormData({
        maChucVu: position.maChucVu,
        tenChucVu: position.tenChucVu,
        trangThai: position.trangThai,
      });
    }
  }, [position]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.tenChucVu) return alert("Tên chức vụ không được để trống");
    onSave(formData);
  };

  if (!position) return null;

  return (
    <Modal open={open} onClose={onClose} title="Chỉnh sửa chức vụ">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Mã chức vụ</label>
          <Input name="maChucVu" value={formData.maChucVu} onChange={handleChange} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tên chức vụ</label>
          <Input name="tenChucVu" value={formData.tenChucVu} onChange={handleChange} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Trạng thái</label>
          <Select name="trangThai" value={formData.trangThai} onChange={handleChange}><option value="active">Hoạt động</option><option value="inactive">Ngưng</option></Select>
        </div>
        <div className="flex justify-end gap-2 pt-4"><Button variant="ghost" type="button" onClick={onClose}>Huỷ</Button><Button type="submit">Lưu thay đổi</Button></div>
      </form>
    </Modal>
  );
}