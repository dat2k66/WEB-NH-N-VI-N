// src/services/employeesService.ts
import { apiFetch } from './api';
import type { NewEmployeeData } from '../components/ui/AddEmployeeModal';
import type { EmployeeEditData } from '../components/ui/EditEmployeeModal';

// Đảm bảo API_BASE_URL là tuyệt đối để tránh lỗi 404
const API = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:5000';

// Kiểu dữ liệu chuẩn của Frontend Employee (đã được backend ánh xạ về)
export type EmployeeApiResult = {
  id: string;
  code: string;
  name: string;
  dept: string; // Tên phòng ban
  position: string; // Tên chức vụ
  salary: number;
  status: "active" | "inactive";
  photo: string | null;
  taiKhoan: string;
  matKhau: string;
  has_face_registered: boolean;
};


export const employeesService = {
  // 1. LẤY TẤT CẢ NHÂN VIÊN (READ)
  list: async () => {
    return apiFetch<EmployeeApiResult[]>(`${API}/api/employees`);
  },

  // 2. THÊM NHÂN VIÊN MỚI (CREATE)
  create: async (data: NewEmployeeData) => {
    return apiFetch<any>(`${API}/api/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
  },
  
  // 3. CẬP NHẬT NHÂN VIÊN (UPDATE)
  update: async (id: string, data: EmployeeEditData) => {
    return apiFetch<any>(`${API}/api/employees/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
  },

  // 4. XÓA NHÂN VIÊN (DELETE)
  delete: async (id: string) => {
    return apiFetch<any>(`${API}/api/employees/${id}`, {
        method: 'DELETE',
    });
  },
  
  // 5. Đăng nhập chấm công (NEWLY ADDED)
  employeeLogin: async (taiKhoan: string, matKhau: string) => {
    const data = { taiKhoan, matKhau };
    return apiFetch<{ success: boolean, employeeId: string }>(`${API}/api/employees/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },
}; // <-- ĐÂY LÀ DẤU ĐÓNG BỊ THIẾU