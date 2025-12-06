// src/services/payrollService.ts
import { apiFetch } from './api';

const API = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:5000';

export type PayrollReportEntry = {
    employeeId: number;
    code: string;
    name: string;
    baseSalary: number;
    totalHours: number;
    overtimeHours: number;
    overtimePay: number;
    finalSalary: number;
};

export const payrollService = {
  // GỌI API TÍNH LƯƠNG THEO CÔNG THỨC 40 GIỜ
  listReport: async (month: number, year: number) => {
    return apiFetch<PayrollReportEntry[]>(`${API}/api/payroll-report?month=${month}&year=${year}`);
  },
};