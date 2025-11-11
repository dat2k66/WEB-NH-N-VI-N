
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TrangChaoMung from './routes/welcome';
import AttendancePage from './routes/attendance';
import EmployeePage from './components/ui/EmployeePage';
import AdminLayout from './components/ui/AdminLayout';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TrangChaoMung />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<EmployeePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
