import { Outlet } from 'react-router-dom'
import ManagerSidebar from '../components/layout/ManagerSidebar'
import ManagerHeader from '../components/layout/ManagerHeader'

const ManagerLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <ManagerHeader />
      <div className="flex">
        <ManagerSidebar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default ManagerLayout
