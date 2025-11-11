/* ============================================================
 📁 FILE: src/components/Employee/EmployeeTable.tsx
   → Bảng danh sách nhân viên
============================================================ */

type Employee = {
  id: string;
  code: string;
  name: string;
  dept: string;
  status: "active" | "inactive";
};

export function EmployeeTable({ data }: { data: Employee[] }) {
  return (
    <div className="bg-white rounded-md border">
      <table className="min-w-full text-left">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-sm">Mã NV</th>
            <th className="px-4 py-3 text-sm">Họ và tên</th>
            <th className="px-4 py-3 text-sm">Phòng ban</th>
            <th className="px-4 py-3 text-sm">Trạng thái</th>
            <th className="px-4 py-3 text-sm">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 && (
            <tr>
              <td
                colSpan={5}
                className="p-6 text-center text-sm text-gray-500"
              >
                Không có dữ liệu
              </td>
            </tr>
          )}
          {data.map((d) => (
            <tr key={d.id} className="border-t">
              <td className="px-4 py-3">{d.code}</td>
              <td className="px-4 py-3">{d.name}</td>
              <td className="px-4 py-3">{d.dept}</td>
              <td className="px-4 py-3">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    d.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {d.status === "active" ? "Hoạt động" : "Ngưng"}
                </span>
              </td>
              <td className="px-4 py-3">
                <button className="text-blue-600 hover:underline mr-2">
                  Sửa
                </button>
                <button className="text-red-600 hover:underline">Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}