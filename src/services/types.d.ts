export type DepartmentStatus = 'active' | 'inactive';

export interface Department {
  id: string;
  code: string;
  name: string;
  foundedYear: number;
  status: DepartmentStatus;
}

export interface Position {
  id: string;
  code: string;
  name: string;
  description?: string;
}

export interface Employee {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string;
  phone?: string;
  departmentId: string;
  positionId: string;
  baseSalary: number;
  status: 'active' | 'inactive';
  joinedAt: string;
}

export interface SalaryBaseHistory {
  employeeId: string;
  baseSalary: number;
  effectiveFromMonth: string;
}

export interface WorkSession {
  id: string;
  employeeId: string;
  startAt: string;
  endAt?: string;
  source: string;
  confidence?: number;
  liveness?: string;
  note?: string;
}

export interface MonthlyPayroll {
  employeeId: string;
  year: number;
  month: number;
  totalHours: number;
  overtimeHours: number;
  baseSalary: number;
  overtimePay: number;
  totalPay: number;
  status: 'draft' | 'approved' | 'paid';
}
