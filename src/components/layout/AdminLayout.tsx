/**
 * Admin Layout
 * Layout لصفحات الإدارة
 */

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';
import Header from './Header';

export function AdminLayout() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);

  const handleLogout = () => {
    // Implement logout logic
    console.log('Logout');
  };

  return (
    <div className="min-h-screen bg-[#050508] text-white" dir="rtl">
      {/* Header */}
      <Header
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        notifications={notifications}
        onOpenNotifications={() => setNotifications([])}
        onOpenCommandPalette={() => {}}
        isSidebarOpen={false}
        onToggleSidebar={() => {}}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen relative z-10">
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar px-3 sm:px-4 md:px-6 pb-24 sm:pb-28 pt-3 sm:pt-4">
          <Outlet />
        </main>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation onLogout={handleLogout} />
    </div>
  );
}
