import { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import "./admin.css";

const tabs = [
  { id: "employees", label: "Nhân viên" },
  { id: "departments", label: "Phòng ban" },
  { id: "positions", label: "Chức vụ" },
  { id: "reports", label: "Báo cáo" },
];

function DangPhatTrien({ title }: { title: string }) {
  return (
    <div className="khung-dang-phat-trien">
      <p className="nhan-dang-phat-trien">Đang phát triển</p>
      <h2 className="tieu-de-dang-phat-trien">{title}</h2>
      <p className="mo-ta-dang-phat-trien">
        Tính năng cho mục này sẽ sớm được hoàn thiện. Vui lòng quay lại tab "Nhân viên" để quản lý nhân sự.
      </p>
    </div>
  );
}

export default function AdminLayout() {
  const [activeTab, setActiveTab] = useState("employees");

  return (
    <div className="nen-quan-tri">
      <header className="phan-dau-quan-tri">
        <div className="thanh-logo-va-menu">
          <Link to="/" className="cum-logo-quan-tri" aria-label="Quay về trang chào mừng">
            <div className="logo-quan-tri">H</div>
            <div className="ten-logo-quan-tri">HR Pro</div>
          </Link>
          <nav className="thanh-dieu-huong-quan-tri">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`nut-chuyen-tab ${
                  activeTab === tab.id ? "nut-tab-dang-chon" : "nut-tab-thuong"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        <nav className="thanh-dieu-huong-quan-tri-mobile">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`nut-chuyen-tab ${
                activeTab === tab.id ? "nut-tab-dang-chon" : "nut-tab-thuong"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="noi-dung-quan-tri">
        {activeTab === "employees" ? <Outlet /> : <DangPhatTrien title={tabs.find((t) => t.id === activeTab)?.label ?? ""} />}
      </main>
    </div>
  );
}
