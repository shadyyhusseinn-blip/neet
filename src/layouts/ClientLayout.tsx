import React from 'react';
import { Outlet } from 'react-router-dom';

export default function ClientLayout() {
  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white font-['Cairo','Tajawal',sans-serif]">
      <Outlet />
    </div>
  );
}
