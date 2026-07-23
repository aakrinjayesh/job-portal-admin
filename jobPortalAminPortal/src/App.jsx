// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { App as AntApp } from "antd";
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
import AdminPostjob from "./pages/AdminPostjob";
import PayoutsManager from "./pages/PayoutsManager";
import SeedSocialManager from "./pages/SeedSocialManager";
import NetworkingRecommend from "./pages/NetworkingRecommend";
import VisitorDashboard from "./pages/VisitorDashboard";

export default function App() {
  return (
    <AntApp>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/admin/login" replace />} />
          <Route path="/admin/login" element={<AdminLogin />} />
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
            path="/admin/postjob"
            element={
              <AdminLayout>
                <AdminPostjob />
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
          {/* New pages */}
          <Route
            path="/admin/payouts"
            element={
              <AdminLayout>
                <PayoutsManager />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/seed-social"
            element={
              <AdminLayout>
                <SeedSocialManager />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/networking-recommend"
            element={
              <AdminLayout>
                <NetworkingRecommend />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/visitors"
            element={
              <AdminLayout>
                <VisitorDashboard />
              </AdminLayout>
            }
          />
        </Routes>
      </BrowserRouter>
    </AntApp>
  );
}
