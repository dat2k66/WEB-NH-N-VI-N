import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { Button } from "./Button";
import { Select } from "./Select";

// Sử dụng lại kiểu Employee từ EmployeePage để đảm bảo tính nhất quán
type Employee = {
  id: string;
  name: string;
  salary: number;
};

// Đồng bộ dữ liệu nhân viên với EmployeePage.tsx
const employees: Employee[] = [
  { id: "1", name: "Nguyễn Minh Anh", salary: 10000000 },
  { id: "2", name: "Nguyễn Minh Tạo", salary: 20000000 },
  { id: "3", name: "Trần Quỳnh", salary: 12000000 },
];


const generateYearlyReport = (baseSalary: number, year: number) => {
  const yearMultiplier = 1 + (year - 2024) * 0.05;
  const details = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const currentBaseSalary = baseSalary * yearMultiplier;
    const bonus = currentBaseSalary * (0.1 + Math.random() * 0.2);
    const netIncome = currentBaseSalary + bonus;
    const difference = netIncome - currentBaseSalary;

    return {
      month,
      baseSalary: Math.round(currentBaseSalary),
      netIncome: Math.round(netIncome),
      difference: Math.round(difference),
    };
  });

  const total = details.reduce((sum, item) => sum + item.netIncome, 0);
  const trend = details.slice(0, 6).map(d => ({ m: d.month, v: d.netIncome / 1_000_000 }));

  return { summary: { total, trend }, details };
};

const generateAllReports = () => {
  const reportData: Record<string, Record<string, any>> = {};
  const years = [2025, 2024];

  years.forEach(year => {
    reportData[year] = {};
    employees.forEach(employee => {
      const report = generateYearlyReport(employee.salary, year);
      const prevYearTotal = generateYearlyReport(employee.salary, year - 1).summary.total;
      report.summary.change = prevYearTotal > 0 ? parseFloat((((report.summary.total - prevYearTotal) / prevYearTotal) * 100).toFixed(1)) : 0;
      reportData[year][employee.name] = report;
    });
  });
  return reportData;
}

const reportData = generateAllReports();

const formatCurrency = (value: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

const Header = () => (
  <div className="flex items-center justify-between mb-6">
    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Báo cáo thu nhập năm</h1>
  </div>
);

// Định nghĩa kiểu cho props của FilterBar
type FilterBarProps = {
  year: string; setYear: (y: string) => void;
  employee: string; setEmployee: (e: string) => void;
  employeeList: Employee[];
};

const FilterBar = ({ year, setYear, employee, setEmployee, employeeList }: FilterBarProps) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
    <div>
      <label className="block text-sm font-medium mb-1">Năm</label>
      <Select value={year} onChange={(e) => setYear(e.target.value)}>
        <option value="2025">Năm 2025</option>
        <option value="2024">Năm 2024</option>
      </Select>
    </div>
    <div>
      <label className="block text-sm font-medium mb-1">Nhân viên</label>
      <Select value={employee} onChange={(e) => setEmployee(e.target.value)}>
        {employeeList.map((emp) => (
          <option key={emp.id} value={emp.name}>{emp.name}</option>
        ))}
      </Select>
    </div>
  </div>
);

const IncomeChart = ({ data }: { data: any[] }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <h2 className="text-xl font-semibold mb-4 text-gray-800">Lương thực nhận hàng tháng</h2>
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" tickFormatter={(tick) => `T${tick}`} />
          <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `${value / 1000000}tr`} />
          <Tooltip formatter={(value: number) => [formatCurrency(value), "Thực nhận"]} />
          <Bar dataKey="netIncome" name="Lương thực nhận" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const IncomeTable = ({ data }: { data: any[] }) => (
  <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden mt-6">
    <table className="min-w-full text-left">
      <thead className="bg-gray-50 border-b border-gray-200">
        <tr>
          {["Tháng", "Lương cơ bản", "Lương thực nhận", "Chênh lệch"].map((head) => (
            <th key={head} className="px-4 py-3 text-sm text-black font-medium">{head}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr key={row.month} className="border-t border-gray-200 hover:bg-gray-50">
            <td className="px-4 py-3 text-black font-medium">Tháng {row.month}</td>
            <td className="px-4 py-3 text-black">{formatCurrency(row.baseSalary)}</td>
            <td className="px-4 py-3 text-black font-semibold">{formatCurrency(row.netIncome)}</td>
            <td className={`px-4 py-3 font-medium ${row.difference > 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(row.difference)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const SummaryCard = ({ summary, year }: { summary: any, year: string }) => (
  <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
    <h3 className="font-semibold text-gray-600">Tổng thu nhập năm {year}</h3>
    <p className="text-3xl font-bold text-gray-900">{formatCurrency(summary.total)}</p>
    <div className="flex items-center gap-2">
      <span className="px-2 py-1 text-sm font-bold bg-green-100 text-green-700 rounded-full">
        {summary.change >= 0 ? `+${summary.change}` : summary.change}%
      </span>
      <span className="text-sm text-gray-500">so với năm trước</span>
    </div>
    <div style={{ width: "100%", height: 80 }}>
      <ResponsiveContainer>
        <LineChart data={summary.trend} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <Line type="monotone" dataKey="v" stroke="#10b981" strokeWidth={2} dot={false} />
          <Tooltip content={() => null} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const Footer = ({ onExport }: { onExport: () => void }) => (
  <footer className="mt-8 pt-6 border-t border-gray-200">
    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
      <div className="flex items-center gap-6">
        <Button onClick={onExport}>Xuất CSV/PDF</Button>
        <div className="flex items-center gap-4">
          <Checkbox label="Đã duyệt" />
          <Checkbox label="Chưa duyệt" defaultChecked />
        </div>
      </div>
      <p className="text-sm text-gray-500">© {new Date().getFullYear()} HR Pro</p>
    </div>
  </footer>
);

export default function IncomeReportPage() {
  const [year, setYear] = useState("2025");
  const [employee, setEmployee] = useState(employees[0].name);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const currentData = useMemo(() => {
    return reportData[year]?.[employee] || { summary: { total: 0, change: 0, trend: [] }, details: [] };
  }, [year, employee]);

  const handleExport = () => {
    setToastMessage("Đã tạo báo cáo thành công");
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <Header />
        <FilterBar year={year} setYear={setYear} employee={employee} setEmployee={setEmployee} employeeList={employees} />

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <IncomeChart data={currentData.details} />
            <IncomeTable data={currentData.details} />
          </div>
          <div className="lg:col-span-1">
            <SummaryCard summary={currentData.summary} year={year} />
          </div>
        </main>

        <Footer onExport={handleExport} />
      </div>

      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white py-2 px-4 rounded-lg shadow-lg animate-fade-in-out">
          {toastMessage}
        </div>
      )}
    </div>
  );
}

const Checkbox = ({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
        <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" {...props} />
        {label}
    </label>
);