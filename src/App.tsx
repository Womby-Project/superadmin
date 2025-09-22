
import MainDashboard from './pages/DashboardPage'
import { Routes, Route } from "react-router-dom"
import AuthUserProvider from "./components/AuthProvider"
import './App.css'

function App() {
  return (
    
    <Routes>
      <Route
        path="/"
        element={
          <MainDashboard />
        }
      />
    </Routes>
   
  )
}

export default App
