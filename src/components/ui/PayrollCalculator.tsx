import { Link } from "react-router-dom";

type PayrollCalculatorProps = {
  employeeName?: string | null;
  employeeCode?: string | null;
  employeeId?: string | null;
  dept?: string | null;
  position?: string | null;
  salary?: number;
  totalHours?: number;
};


export const PayrollCalculator = ({
  employeeName,
  employeeCode,
  employeeId,
  dept,
  position,
  salary,
  totalHours,
}: PayrollCalculatorProps) => {
  const formatMoney = (value: number) =>
    Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);

  const baseSalary = typeof salary === "number" ? salary : 0;
  const hoursThisMonth = typeof totalHours === "number" ? totalHours : 0;
  const extraHours = Math.max(0, hoursThisMonth - 40);
  const overtimePay =
    extraHours > 0 ? (baseSalary / 40) * extraHours * 1.5 : 0;
  const totalSalary = baseSalary + overtimePay;
  const luongText = baseSalary > 0 ? formatMoney(baseSalary) : "—";
  const overtimeText = overtimePay > 0 ? formatMoney(overtimePay) : "—";
  const totalSalaryText =
    totalSalary > 0 ? formatMoney(totalSalary) : "—";

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Thông tin  lương của nhân viên
          </h1>
        
        </div>
        <Link
          to="/admin"
          className="inline-flex items-center px-4 py-2 text-sm font-semibold text-blue-600 bg-white border border-blue-200 rounded-md hover:bg-blue-50"
        >
          ← Quay lại danh sách nhân viên
        </Link>
      </div>

      <section className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <p className="text-sm text-gray-500 uppercase tracking-wide">
              Nhân viên
            </p>
            <p className="text-xl font-semibold text-gray-900">
              {employeeName ?? "Chưa chọn"}
            </p>
          </div>
          <div className="text-sm text-gray-500">
            <p>
              Mã nhân viên:{" "}
              <span className="font-medium text-gray-800">
                {employeeCode ?? "—"}
              </span>
            </p>
            <p>
              ID hệ thống:{" "}
              <span className="font-medium text-gray-800">
                {employeeId ?? "—"}
              </span>
            </p>
          </div>
          <div className="text-sm text-gray-500">
            <p>
              Phòng ban:{" "}
              <span className="font-medium text-gray-800">{dept ?? "—"}</span>
            </p>
            <p>
              Chức vụ:{" "}
              <span className="font-medium text-gray-800">
                {position ?? "—"}
              </span>
            </p>
            {typeof salary === "number" && (
              <p>
                Lương cơ bản:{" "}
                <span className="font-medium text-gray-800">
                  {Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(salary)}
                </span>
              </p>
            )}
          </div>
        </div>

        <div className="border-t border-dashed pt-4 text-gray-600 text-sm">
          <h1 className="Luong-co-ban">
            Số giờ làm trong tháng:{" "}
            <span>
              {typeof totalHours === "number" ? `${totalHours} giờ` : "—"}
            </span>
          </h1>
          <div className="co-ban">
            <h1>Lương cơ bản:</h1>
            <p>{luongText}</p>
            <p>Lương làm thêm: {overtimeText}</p>
            <p>Tổng lương: {totalSalaryText}</p>
          </div>
          
        </div>
      </section>
    </div>
  );
};
