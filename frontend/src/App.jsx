import { Toaster } from 'react-hot-toast'
import { Route, Routes,Navigate } from 'react-router-dom'
import Login from './pages/Login'
import ProtectedLayout from './components/ProtectedLayout'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import Session from './pages/Session'
import Pricing from './pages/Pricing'
import MeetingRoom from './pages/MeetingRoom'

export default function App() {
  return (
    <>
      <Toaster />

      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login mode="login" />} />
        <Route path="/register" element={<Login mode="register" />} />

        {/* Private routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<ProtectedLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/sessions" element={<Session />} />
            <Route path="/pricing" element={<Pricing />} />
          </Route>
          <Route  path='/meeting/:meetingId' element={<MeetingRoom />} />
        </Route>

        {/* other routes */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  )
}

