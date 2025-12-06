import { apiFetch } from './api';
import type {
  AttendanceType,
  EnrollFacePayload,
  EnrollFaceResponse,
  FaceCheckPayload,
  FaceCheckResponse,
} from './types'; 

// Khai báo API_BASE an toàn hơn
const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:5000';

const buildApiUrl = (path: string) => `${API_BASE}${path}`;

const getJson = async <T>(path: string) => apiFetch<T>(buildApiUrl(path));

const postJson = async <T>(path: string, body: unknown) =>
  apiFetch<T>(buildApiUrl(path), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

export const attendanceService = {
  // 1. ĐĂNG KÝ KHUÔN MẶT
  enrollFace: async (payload: EnrollFacePayload) => {
    const response = await postJson<EnrollFaceResponse>('/api/enroll-face', payload);
    return { ...response, source: 'remote' as const };
  },
  
  // 2. CHẤM CÔNG
  checkInWithFace: async (payload: FaceCheckPayload) => {
    const response = await postJson<FaceCheckResponse>('/api/checkin', payload);
    return { ...response, source: 'remote' as const };
  },
  
  // 3. KIỂM TRA TRẠNG THÁI KHUÔN MẶT (FIX LỖI)
  hasFaceEnrollment: async (employeeId: string) => {
    if (!employeeId) return false; 
    try {
        // Gọi API GET /api/employees/:id/face (đã có trong employeeRoutes.js)
        const response = await getJson<{ registered: boolean }>(
            `/api/employees/${employeeId}/face`
        );
        // Trả về true nếu Backend báo đã đăng ký
        return response?.registered === true; 
    } catch (error) {
        // Lỗi này thường do Backend báo 404/500, ta log lại và trả về false
        console.warn(`Lỗi khi kiểm tra trạng thái khuôn mặt cho ID ${employeeId}.`, error);
        return false; 
    }
  },

  // 4. LẤY LỊCH SỬ CHẤM CÔNG
  getAttendanceHistory: async (employeeId: string) => {
    return getJson<any[]>(`/api/attendance/${employeeId}`);
  },

  // ... (Bỏ qua các hàm local storage không cần thiết)
};