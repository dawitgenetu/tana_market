import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import ManagerSidebar from '../components/layout/ManagerSidebar'
import ManagerHeader from '../components/layout/ManagerHeader'

const ManagerLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <ManagerHeader onToggleSidebar={() => setIsSidebarOpen(true)} />
      <div className="flex flex-1 relative">
        <ManagerSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-30 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
        <main className="flex-1 w-full min-w-0 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default ManagerLayout
