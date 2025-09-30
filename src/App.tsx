import { Routes, Route } from "react-router-dom";
import AuthUserProvider from "./components/AuthProvider";
import ProtectedRoute from "./components/ProtectedRoutes";

import LoginPage from "./pages/LoginPage";
import Registration from "./pages/RegistrationPage";

import MainDashboard from "./pages/DashboardPage";
import DirectoryPage from "./pages/DirectoryPage";
import ApprovalPage from "./pages/ApprovalPage";
import HealthCenterPage from "./pages/HealthCenterPage";
import ServiceFeePage from "./pages/ServiceFeePage";
import SettingsPage from "./pages/SettingsPage";
import InformativeContentPage from "./pages/InformativeContentPage";
import ForumPage from "./pages/ForumPage";

function App() {
  return (
    <AuthUserProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/registration" element={<Registration />} />

        {/* 🔒 All protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<MainDashboard />} />
          <Route path="/obgyndirectory" element={<DirectoryPage />} />
          <Route path="/approvals-list" element={<ApprovalPage />} />
          <Route path="/healthcenter-management" element={<HealthCenterPage />} />
          <Route path="/informative-content" element={<InformativeContentPage />} />
          <Route path="/forum-management" element={<ForumPage />} />
          <Route path="/service-fee" element={<ServiceFeePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </AuthUserProvider>
  );
}

export default App;
