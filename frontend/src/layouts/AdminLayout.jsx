import { Outlet } from 'react-router-dom'
import AdminSidebar from '../components/layout/AdminSidebar'
import AdminHeader from '../components/layout/AdminHeader'

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
