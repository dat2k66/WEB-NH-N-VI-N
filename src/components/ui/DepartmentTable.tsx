export type DepartmentTableProps = {
    id: string;
    maPhong: string;
    tenPhong: string;
    namThanhLap: number;
    trangThai: "active" | "inactive";
    visible: boolean;
};

export function DepartmentTable({
  data,
  onDelete,
  onEdit,
  onToggleVisibility,
}: {
  data: DepartmentTableProps[];
  onDelete: (id: string) => void;
  onEdit?: (department: DepartmentTableProps) => void;
  onToggleVisibility: (id: string) => void;
}) {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-x-auto">
      <table className="min-w-full text-left">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-sm text-black">Mã phòng</th>
            <th className="px-4 py-3 text-sm text-black">Tên phòng</th>
            <th className="px-4 py-3 text-sm text-black">Năm thành lập</th>
            <th className="px-4 py-3 text-sm text-black">Trạng thái</th>
            <th className="px-4 py-3 text-sm text-black">Hành động</th>
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
            <tr key={d.id} className="border-t border-gray-200 hover:bg-gray-50" style={{ display: d.visible ? '' : 'none' }}>
                <td className="px-4 py-3 text-black">{d.maPhong}</td>
                <td className="px-4 py-3 text-black">{d.tenPhong}</td>
                <td className="px-4 py-3 text-black">{d.namThanhLap}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      d.trangThai === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {d.trangThai === "active" ? "Hoạt động" : "Ngưng"}
                  </span>
                </td>
                <td className="px-4 py-3 space-x-4 whitespace-nowrap">
                  <button
                    title="Sửa"
                    onClick={() => onEdit && onEdit(d)} className="text-blue-500 hover:text-blue-800">✏️</button>
                  <button
                    title={d.visible ? "Ẩn" : "Hiện"}
                    className="text-gray-500 hover:text-gray-800"
                    onClick={() => onToggleVisibility(d.id)}
                  >
                    {d.visible ? '👁️' : '👁️‍🗨️'}
                  </button>
                  <button title="Xoá" onClick={() => onDelete(d.id)} className="text-red-500 hover:text-red-800">❌</button>
                </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}