// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLogin from "./pages/AdminLogin";
import Dashboard from "./pages/Dashboard";
import AdminLayout from "./layouts/AdminLayout";
import QueryManager from "./pages/QueryManager";
import Organizations from "./pages/Organizations";
import OrganizationDetails from "./pages/OrganizationDetails";
import AdminCreateUser from "./pages/AdminCreateUser";
import PromoCodeManager from "./pages/PromoCodeManager";
import UserLookup from "./pages/Userlookup";
import PlanlimitsAdmin from "./pages/PlanlimitsAdmin";
import AddCompany from "./pages/AddCompany";
import BulkCompanyUpload from "./pages/BulkCompanyUpload";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/login" replace />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        {/* <Route path="/admin/dashboard" element={<Dashboard />} /> */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminLayout>
              <Dashboard />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/query"
          element={
            <AdminLayout>
              <QueryManager />
            </AdminLayout>
          }
        />

        <Route
          path="/admin/organizations"
          element={
            <AdminLayout>
              <Organizations />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/organizations/:id"
          element={
            <AdminLayout>
              <OrganizationDetails />
            </AdminLayout>
          }
        />

        <Route
          path="/admin/users/add"
          element={
            <AdminLayout>
              <AdminCreateUser />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/promocode"
          element={
            <AdminLayout>
              <PromoCodeManager />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/planlimitsadmin"
          element={
            <AdminLayout>
              <PlanlimitsAdmin />
            </AdminLayout>
          }
        />

        <Route
          path="/admin/users/search"
          element={
            <AdminLayout>
              <UserLookup />
            </AdminLayout>
          }
        />

        <Route
          path="/admin/add-company"
          element={
            <AdminLayout>
              <AddCompany />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/bulk-company"
          element={
            <AdminLayout>
              <BulkCompanyUpload />
            </AdminLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
