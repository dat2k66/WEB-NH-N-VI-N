
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Button } from "../ui/Button";
import { EmployeeTable } from "./EmployeeTable";
import { AddEmployeeModal } from "./AddEmployeeModal";

type Employee = {
  id: string;
  code: string;
  name: string;
  dept: string;
  status: "active" | "inactive";
};

export default function EmployeePage() {
  const navigate = useNavigate();
  const seed: Employee[] = [
    { id: "1", code: "PDT", name: "Nguyễn Minh Anh", dept: "Phòng Kinh Doanh", status: "active" },
    { id: "2", code: "PCT", name: "Nguyễn Minh Tạo", dept: "Trưởng phòng", status: "active" },
    { id: "3", code: "PKT", name: "Trần Quỳnh", dept: "Chăm sóc KH", status: "inactive" },
  ];

  const [data, setData] = useState<Employee[]>(seed);
  const [q, setQ] = useState("");
  const [dept, setDept] = useState("all");
  const [status, setStatus] = useState("all");
  const [openAdd, setOpenAdd] = useState(false);

  const filtered = useMemo(() => {
    return data.filter((d) => {
      if (dept !== "all" && d.dept !== dept) return false;
      if (status !== "all" && d.status !== status) return false;
      if (q && !(`${d.name} ${d.code} ${d.dept}`.toLowerCase().includes(q.toLowerCase())))
        return false;
      return true;
    });
  }, [data, q, dept, status]);

  const addEmployee = (emp: Omit<Employee, "id">) => {
    setData((s) => [{ ...emp, id: String(Date.now()) }, ...s]);
  };

  return (
    
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Danh sách Nhân viên</h1>
        <div className="flex items-center gap-2">
          <Button onClick={() => navigate('/cham-cong')}>+ Đăng ký khuôn mặt</Button>
          <Button onClick={() => setOpenAdd(true)}>+ Thêm nhân viên</Button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="md:col-span-2">
          <Input
            placeholder="Tìm theo tên, mã nhân viên..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div>
          <Select value={dept} onChange={(e) => setDept(e.target.value)}>
            <option value="all">Tất cả phòng ban</option>
            <option value="Phòng Kinh Doanh">Phòng Kinh Doanh</option>
            <option value="Trưởng phòng">Trưởng phòng</option>
            <option value="Chăm sóc KH">Chăm sóc KH</option>
          </Select>
        </div>
        <div>
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Ngưng</option>
          </Select>
        </div>
      </div>

      {/* Table */}
      <EmployeeTable data={filtered} />

      {/* Add Modal */}
      <AddEmployeeModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onSave={(e) => {
          addEmployee(e);
          setOpenAdd(false);
        }}
      />
    </div>
  );
}