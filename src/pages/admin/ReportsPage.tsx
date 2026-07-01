import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FileText, Download, Calendar, Filter, Search, Plus } from 'lucide-react';
import { Card, CardContent } from '../../design-system/components';

const reports = [
  { id: 1, name: 'تقرير الإيرادات الشهري', date: '2024-01-15', type: 'مالي', status: 'جاهز' },
  { id: 2, name: 'تقرير الحجوزات الربع سنوي', date: '2024-01-10', type: 'حجوزات', status: 'جاهز' },
  { id: 3, name: 'تقرير العملاء السنوي', date: '2024-01-05', type: 'عملاء', status: 'جاهز' },
  { id: 4, name: 'تقرير الأداء الشهري', date: '2024-01-01', type: 'أداء', status: 'قيد المعالجة' }
];

export default function ReportsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || report.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            التقارير
          </h1>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all">
            <Plus size={20} />
            <span>إنشاء تقرير جديد</span>
          </button>
        </div>

        {/* Filters */}
        <Card variant="elevated" className="p-6 mb-8">
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="ابحث في التقارير..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-10 pl-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/30"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white"
              >
                <option value="all">جميع الأنواع</option>
                <option value="مالي">مالي</option>
                <option value="حجوزات">حجوزات</option>
                <option value="عملاء">عملاء</option>
                <option value="أداء">أداء</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Reports List */}
        <div className="space-y-4">
          {filteredReports.map((report, index) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card variant="elevated" className="p-6">
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center">
                        <FileText size={24} className="text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{report.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            <span>{report.date}</span>
                          </div>
                          <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs">
                            {report.type}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            report.status === 'جاهز' 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {report.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">
                      <Download size={20} />
                      <span>تحميل</span>
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
