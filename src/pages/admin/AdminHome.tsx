import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Breadcrumbs } from '../../components/navigation/Breadcrumbs';
import { Card, CardContent } from '../../design-system/components';
import { MobileNavigation } from '../../components/mobile/MobileNavigation';
import {
  Calendar,
  Globe,
  Users,
  Camera,
  Code,
  ArrowRight
} from 'lucide-react';

export default function AdminHome() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isDeveloper = user?.role === 'admin';

  const sections = [
    {
      id: 'bookings',
      title: 'الحجوزات',
      description: 'إدارة الحجوزات والمواعيد',
      icon: Calendar,
      color: 'from-blue-500 to-cyan-500',
      path: '/admin/bookings'
    },
    {
      id: 'galleries',
      title: 'المعارض',
      description: 'إدارة معارض الصور',
      icon: Globe,
      color: 'from-emerald-500 to-green-500',
      path: '/admin/galleries'
    },
    {
      id: 'users',
      title: 'المستخدمين',
      description: 'إدارة المستخدمين والصلاحيات',
      icon: Users,
      color: 'from-purple-500 to-pink-500',
      path: '/admin/users'
    },
    {
      id: 'client-gallery',
      title: 'معرض العملاء',
      description: 'إدارة صور العملاء',
      icon: Camera,
      color: 'from-orange-500 to-orange-600',
      path: '/admin/client-gallery'
    },
    {
      id: 'developer',
      title: 'المطور',
      description: 'أدوات المطور والإعدادات',
      icon: Code,
      color: 'from-indigo-500 to-purple-500',
      path: '/admin/developer'
    }
  ];

  const stats = [
    { label: 'العملاء', value: '150+', icon: Users, color: 'text-purple-400' },
    { label: 'الحجوزات', value: '320+', icon: Calendar, color: 'text-blue-400' },
    { label: 'المعارض', value: '45+', icon: Camera, color: 'text-emerald-400' },
    { label: 'الإيرادات', value: '500K+', icon: Users, color: 'text-amber-400' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] p-8">
      <MobileNavigation />
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs />
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            لوحة الإدارة
          </h1>
          <p className="text-gray-400 text-lg">مرحباً، {user?.name || 'المدير'}</p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {stats.map((stat, index) => (
            <Card key={index} variant="elevated" className="p-6">
              <CardContent>
                <div className="flex items-center gap-3 mb-2">
                  <stat.icon size={20} className={stat.color} />
                  <span className="text-gray-400 text-sm">{stat.label}</span>
                </div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Main Sections */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section, index) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                variant="elevated" 
                className="cursor-pointer hover:scale-105 transition-transform h-full"
                onClick={() => navigate(section.path)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center`}>
                      <section.icon size={28} className="text-white" />
                    </div>
                    <ArrowRight size={20} className="text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{section.title}</h3>
                  <p className="text-gray-400 text-sm">{section.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Developer Access */}
        {isDeveloper && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6"
          >
            <Card 
              variant="glass" 
              className="cursor-pointer hover:scale-[1.02] transition-transform"
              onClick={() => navigate('/developer')}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Code size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">المطور</h3>
                      <p className="text-sm text-gray-400">أدوات المطور والتشخيص</p>
                    </div>
                  </div>
                  <ArrowRight size={20} className="text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
