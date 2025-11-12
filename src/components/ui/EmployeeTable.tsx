
export type EmployeeTableProps = {
  id: string;
  code: string;
  name: string;
  dept: string;
  position: string;
  status: "active" | "inactive";
  visible: boolean;
  salary: number;
};

export function EmployeeTable({
  data,
  onDelete,
  onEdit,
  onToggleVisibility,
  onRegisterFace,
  onViewPayroll,
  onViewDetail,
}: {
  data: EmployeeTableProps[];
  onDelete: (id: string) => void;
  onEdit?: (employee: EmployeeTableProps) => void; // Optional now
  onToggleVisibility: (id: string) => void;
  onRegisterFace: (employee: EmployeeTableProps) => void;
  onViewPayroll?: (employee: EmployeeTableProps) => void;
  onViewDetail?: (employee: EmployeeTableProps) => void;
}) {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-x-auto">
      <table className="min-w-full text-left">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-sm text-black">Mã NV</th>
            <th className="px-4 py-3 text-sm text-black">Họ và tên</th>
            <th className="px-4 py-3 text-sm text-black">Phòng ban</th>
            <th className="px-4 py-3 text-sm text-black">Chức vụ</th>
            <th className="px-4 py-3 text-sm text-black">Lương (VNĐ/tháng)</th>
            <th className="px-4 py-3 text-sm text-black">Trạng thái</th>
            <th className="px-4 py-3 text-sm text-black">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 && (
            <tr>
              <td
                colSpan={7}
                className="p-6 text-center text-sm text-gray-500"
              >
                Không có dữ liệu
              </td>
            </tr>

          )}
          {data.map((d) => (
            <tr key={d.id} className="border-t border-gray-200 hover:bg-gray-50" style={{ display: d.visible ? '' : 'none' }}>
                <td className="px-4 py-3 text-black">{d.code}</td>
                <td className="px-4 py-3 text-black">{d.name}</td>
                <td className="px-4 py-3 text-black">{d.dept}</td>
                <td className="px-4 py-3 text-black">{d.position}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => onViewPayroll && onViewPayroll(d)}
                    className="px-3 py-1 text-sm font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-full hover:bg-blue-100 transition-colors"
                  >
                    Lương
                  </button>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
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
                <td className="px-4 py-3 space-x-4 whitespace-nowrap">
                  <button
                    title="Sửa"
                    onClick={() => onEdit && onEdit(d)} className="text-blue-500 hover:text-blue-800">✏️</button>
                  <button
                    title="Xem thông tin"
                    className="text-gray-500 hover:text-gray-800"
                    onClick={() => onViewDetail && onViewDetail(d)}
                  >
                    👁️
                  </button>
                  <button title="Xoá" onClick={() => onDelete(d.id)} className="text-red-500 hover:text-red-800">❌</button>
                  <button
                    title="Đăng ký khuôn mặt"
                    onClick={() => onRegisterFace(d)} className="text-green-500 hover:text-green-800">👤</button>
                </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
