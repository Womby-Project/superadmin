import MainDashboard from './pages/DashboardPage'
import DirectoryPage from './pages/DirectoryPage'
import ApprovalPage from './pages/ApprovalPage'
import { Routes, Route } from "react-router-dom"
import HealthCenterPage from './pages/HealthCenterPage'
import ServiceFeePage from './pages/ServiceFeePage'
import SettingsPage from './pages/SettingsPage'
import InformativeContentPage from './pages/InformativeContentPage'
import ForumPage from './pages/ForumPage'
import AuthUserProvider from "./components/AuthProvider"

function App() {
  return (
      <Routes>
        <Route path="/" element={<MainDashboard />} />
        <Route path="/obgyndirectory" element={<DirectoryPage />} />
        <Route path="/aprrovals-list" element={<ApprovalPage />} />
        <Route path="/healthcenter-management" element={<HealthCenterPage />} />
        <Route path="/informative-content" element={<InformativeContentPage />} />
        <Route path="/service-fee" element={<ServiceFeePage />} />
        <Route path="/settings" element={<SettingsPage/>}/>
        <Route path="/forum-management" element={<ForumPage/>}/>
      </Routes>
  )
}

export default App
