/**
 * Public Layout
 * Layout للصفحات العامة (الصفحة الرئيسية، معرض الأعمال، إلخ)
 */

import React from 'react';
import { Outlet } from 'react-router-dom';
import { StickyNavigation } from '../../components/StickyNavigation';

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-[#050508] text-white">
      <StickyNavigation />
      <main className="min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
