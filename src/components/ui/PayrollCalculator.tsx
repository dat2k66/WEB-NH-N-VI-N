// src/components/ui/PayrollCalculator.tsx
import { Link } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { payrollService, type PayrollReportEntry } from "../../services/payrollService";

type PayrollCalculatorProps = {
  employeeName?: string | null;
  employeeCode?: string | null;
  employeeId?: string | null;
  dept?: string | null;
  position?: string | null;
};


export const PayrollCalculator = ({
  employeeName,
  employeeCode,
  employeeId,
  dept,
  position,
}: PayrollCalculatorProps) => {

  const [reportData, setReportData] = useState<PayrollReportEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const currentMonth = useMemo(() => new Date().getMonth() + 1, []);
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  useEffect(() => {
    if (!employeeId) return;

    const fetchPayroll = async () => {
        setLoading(true);
        try {
            // Gọi API tính lương thực tế
            const reports = await payrollService.listReport(currentMonth, currentYear);
            const employeeReport = reports.find(r => r.employeeId.toString() === employeeId);
            setReportData(employeeReport || null);
        } catch (error) {
            console.error("Lỗi tải báo cáo lương:", error);
            setReportData(null);
        } finally {
            setLoading(false);
        }
    };

    fetchPayroll();
  }, [employeeId, currentMonth, currentYear]);


  const formatMoney = (value: number) =>
    Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);

  const baseSalary = reportData?.baseSalary ?? 0;
  const hoursThisMonth = reportData?.totalHours ?? 0;
  const overtimeHours = reportData?.overtimeHours ?? 0;
  const overtimePay = reportData?.overtimePay ?? 0;
  const totalSalary = reportData?.finalSalary ?? 0;

  const detailRows = [
    { label: "Mã nhân viên", value: employeeCode ?? "—" },
    { label: "Phòng ban", value: dept ?? "—" },
    { label: "Chức vụ", value: position ?? "—" },
    {
      label: "Giờ làm tháng này",
      value: hoursThisMonth > 0 ? `${hoursThisMonth} giờ` : "—",
    },
  ];

  const summaryCards = [
    {
      title: "Lương cơ bản",
      value: baseSalary > 0 ? formatMoney(baseSalary) : "—",
      description: "Theo hợp đồng lao động",
    },
    {
      title: "Giờ làm thêm",
      value: `${overtimeHours.toFixed(2)}h`,
      description: "Áp dụng sau 40h/tuần",
    },
    {
      title: "Lương làm thêm",
      value: overtimePay > 0 ? formatMoney(overtimePay) : "—",
      description: "Nhân hệ số 150%",
    },
    {
      title: "Tổng lương thực nhận",
      value: totalSalary > 0 ? formatMoney(totalSalary) : "—",
      description: `Tháng ${currentMonth}/${currentYear}`,
      highlight: true,
    },
  ];
  
  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <p className="text-xl font-semibold text-blue-600">Đang tính toán lương thực tế...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            Hồ sơ lương
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Thông tin lương nhân viên
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Tổng hợp thu nhập dựa trên dữ liệu chấm công thực tế từ **`backendhi`**
          </p>
        </div>
        <Link
          to="/admin"
          className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:border-blue-400 hover:text-blue-700"
        >
          ← Quay lại bảng điều khiển
        </Link>
      </div>

      <section className="grid gap-6 lg:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-xl font-semibold text-blue-500">
              {employeeName ? employeeName.charAt(0) : "?"}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Nhân sự
              </p>
              <p className="text-lg font-semibold text-slate-900">
                {employeeName ?? "Chưa chọn"}
              </p>
              <p className="text-sm text-slate-500">
                {position ?? "Chưa cập nhật"} • {dept ?? "—"}
              </p>
            </div>
          </div>

          <dl className="mt-6 space-y-3 text-sm text-slate-600">
            {detailRows.map(({ label, value }) => (
              <div
                key={label}
                className="flex items-center justify-between border-b border-dashed border-slate-100 pb-2 last:border-none"
              >
                <dt>{label}</dt>
                <dd className="font-semibold text-slate-900">{value}</dd>
              </div>
            ))}
          </dl>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-semibold text-slate-900">
            Tóm tắt thu nhập tháng này ({currentMonth}/{currentYear})
          </h2>
          <p className="text-sm text-slate-500">
            Dữ liệu được tính toán dựa trên giờ làm việc thực tế từ hệ thống chấm công.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {summaryCards.map(({ title, value, description, highlight }) => (
              <div
                key={title}
                className={`rounded-xl border p-4 ${
                  highlight
                    ? "border-blue-200 bg-white shadow-md"
                    : "border-slate-100 bg-white/80"
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {title}
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {value}
                </p>
                <p className="mt-1 text-xs text-slate-500">{description}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
};