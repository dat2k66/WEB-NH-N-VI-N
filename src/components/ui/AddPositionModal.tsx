import { useState, type FormEvent, useEffect } from "react";
import { Modal } from "./Modal";
import { Input } from "./Input";
import { Button } from "./Button";
import { Select } from "./Select";

export type NewPositionData = {
  maChucVu: string;
  tenChucVu: string;
  trangThai: "active" | "inactive";
};

export function AddPositionModal({
  open,
  onClose,
  onSave,
  generatedCode,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: NewPositionData) => void;
  generatedCode: string;
}) {
  const [formData, setFormData] = useState<NewPositionData>({
    maChucVu: '',
    tenChucVu: '',
    trangThai: 'active',
  });

  useEffect(() => {
    if (open) {
      setFormData({
        maChucVu: '',
        tenChucVu: '',
        trangThai: 'active',
      });
    }
  }, [open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.tenChucVu) {
      alert("Vui lòng nhập Tên chức vụ.");
      return;
    }
    onSave(formData);
  };

  return (
    <Modal open={open} onClose={onClose} title="Thêm chức vụ">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Mã chức vụ</label>
          <Input name="maChucVu" value={formData.maChucVu} onChange={handleChange} placeholder={generatedCode} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tên chức vụ</label>
          <Input name="tenChucVu" value={formData.tenChucVu} onChange={handleChange} placeholder="VD: Trưởng phòng" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Trạng thái</label>
          <Select name="trangThai" value={formData.trangThai} onChange={handleChange}><option value="active">Hoạt động</option><option value="inactive">Ngưng</option></Select>
        </div>
        <div className="flex justify-end gap-2 pt-4"><Button variant="ghost" type="button" onClick={onClose}>Huỷ</Button><Button type="submit">Lưu</Button></div>
      </form>
    </Modal>
  );
}