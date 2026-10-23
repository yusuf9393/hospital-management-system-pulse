import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar.jsx'

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar />
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  )
}
