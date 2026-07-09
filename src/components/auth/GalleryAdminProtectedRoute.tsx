/**
 * Gallery Admin Protected Route
 * حماية مسارات مدير المعارض
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

interface GalleryAdminProtectedRouteProps {
  children: React.ReactNode;
}

export default function GalleryAdminProtectedRoute({ children }: GalleryAdminProtectedRouteProps) {
  const { isLoggedIn, user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] flex items-center justify-center">
        <div className="text-white">جاري التحميل...</div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/gallery-admin/login" replace />;
  }

  // Check if user has gallery-manager role or admin role
  if (user?.role !== 'gallery-manager' && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
