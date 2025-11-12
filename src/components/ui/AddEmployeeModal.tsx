
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
  photo?: string;
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
    photo: '',
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setFormData({
        name: '',
        code: '',
        dept: '',
        position: 'Nhân viên',
        salary: 0,
        status: 'active',
        photo: '',
      });
      setPhotoPreview(null);
    }
  }, [open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'salary' ? parseFloat(value) || 0 : value }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setFormData(prev => ({ ...prev, photo: result }));
      setPhotoPreview(result);
    };
    reader.readAsDataURL(file);
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
        <div>
          <label className="block text-sm font-medium mb-1">Ảnh nhân viên</label>
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
          />
          <div className="mt-3">
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="Xem trước"
                className="w-24 h-24 rounded-xl object-cover border border-gray-200 shadow-sm"
              />
            ) : (
              <p className="text-xs text-gray-500">
                Chưa chọn ảnh. Bạn có thể upload file JPG/PNG dưới 5MB.
              </p>
            )}
          </div>
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
