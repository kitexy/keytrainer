import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Layout/Sidebar'
import Practice from './pages/Practice'
import FingerTraining from './pages/FingerTraining'
import Lessons from './pages/Lessons'
import SpeedTest from './pages/SpeedTest'
import Stats from './pages/Stats'
import Settings from './pages/Settings'
import ToastContainer from './components/Toast/ToastContainer'

export default function App() {
  return (
    <MemoryRouter>
      <div className="flex h-screen bg-gray-950 text-gray-100 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/finger" replace />} />
            <Route path="/finger" element={<FingerTraining />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/lessons" element={<Lessons />} />
            <Route path="/speed" element={<SpeedTest />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
        <ToastContainer />
      </div>
    </MemoryRouter>
  )
}
