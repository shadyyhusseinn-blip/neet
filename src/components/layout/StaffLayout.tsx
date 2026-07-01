/**
 * Staff Layout
 * Layout لصفحات الموظفين
 */

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export function StaffLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-[#050508] text-white" dir="rtl">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        currentView="staff"
        onNavigate={() => {}}
        onToggle={toggleSidebar}
        currentUser={{ role: 'staff' }}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen relative z-10 transition-[margin] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] lg:mr-[17rem] mr-0">
        {/* Header */}
        <Header
          isDarkMode={true}
          onToggleTheme={() => {}}
          notifications={[]}
          onOpenNotifications={() => {}}
          onOpenCommandPalette={() => {}}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={toggleSidebar}
          onLogout={() => {}}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar px-3 sm:px-4 md:px-6 pb-6 sm:pb-8 pt-3 sm:pt-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
