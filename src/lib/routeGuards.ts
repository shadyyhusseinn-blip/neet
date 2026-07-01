import React from 'react';
import { useAuthStore } from '../stores/authStore';
import { Navigate, useLocation } from 'react-router-dom';

export interface RouteGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireRole?: 'admin' | 'staff' | 'client';
  fallback?: React.ReactNode;
}

export function RouteGuard({
  children,
  requireAuth = true,
  requireRole,
  fallback,
}: RouteGuardProps) {
  const { user, isLoggedIn, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return fallback || React.createElement('div', { className: 'flex items-center justify-center min-h-screen' }, 'جاري التحميل...');
  }

  if (requireAuth && !isLoggedIn) {
    return React.createElement(Navigate, { to: '/login', state: { from: location }, replace: true });
  }

  if (requireRole && user?.role !== requireRole) {
    return React.createElement(Navigate, { to: '/unauthorized', replace: true });
  }

  return React.createElement(React.Fragment, null, children);
}

export function AdminGuard({ children, fallback }: Omit<RouteGuardProps, 'requireAuth' | 'requireRole'>) {
  return React.createElement(RouteGuard, { requireAuth: true, requireRole: 'admin', fallback }, children);
}

export function StaffGuard({ children, fallback }: Omit<RouteGuardProps, 'requireAuth' | 'requireRole'>) {
  return React.createElement(RouteGuard, { requireAuth: true, requireRole: 'staff', fallback }, children);
}

export function ClientGuard({ children, fallback }: Omit<RouteGuardProps, 'requireAuth' | 'requireRole'>) {
  return React.createElement(RouteGuard, { requireAuth: true, requireRole: 'client', fallback }, children);
}

export function PublicGuard({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuthStore();
  const location = useLocation();

  if (isLoggedIn) {
    const from = (location.state as any)?.from || '/admin';
    return React.createElement(Navigate, { to: from, replace: true });
  }

  return React.createElement(React.Fragment, null, children);
}
