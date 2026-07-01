import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path: string;
}

export function Breadcrumbs() {
  const location = useLocation();
  const navigate = useNavigate();

  const pathSegments = location.pathname.split('/').filter(Boolean);

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'الرئيسية', path: '/' },
    ...pathSegments.map((segment, index) => {
      const path = '/' + pathSegments.slice(0, index + 1).join('/');
      const label = getBreadcrumbLabel(segment);
      return { label, path };
    }),
  ];

  const getBreadcrumbLabel = (segment: string): string => {
    const labels: Record<string, string> = {
      admin: 'الإدارة',
      staff: 'الموظفين',
      developer: 'المطور',
      'client-manager': 'إدارة الصفحة',
      selection: 'الاختيار',
      dashboard: 'لوحة التحكم',
      bookings: 'الحجوزات',
      galleries: 'المعارض',
      clients: 'العملاء',
      settings: 'الإعدادات',
      logs: 'السجلات',
      backup: 'النسخ الاحتياطي',
      management: 'الإدارة',
      appearance: 'المظهر',
      public: 'العامة',
    };
    return labels[segment] || segment;
  };

  const handleBreadcrumbClick = (path: string) => {
    navigate(path);
  };

  return (
    <nav className="flex items-center gap-2 text-sm">
      {breadcrumbs.map((item, index) => (
        <React.Fragment key={item.path}>
          {index > 0 && (
            <ChevronLeft size={16} className="text-gray-500" />
          )}
          {index === breadcrumbs.length - 1 ? (
            <span className="text-white font-medium">{item.label}</span>
          ) : (
            <motion.button
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleBreadcrumbClick(item.path)}
              className="text-gray-400 hover:text-white transition-colors flex items-center gap-1"
            >
              {index === 0 && <Home size={14} />}
              {item.label}
            </motion.button>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
