import { motion } from 'motion/react';
import { Camera, Heart, Calendar, Users, Star, Check } from 'lucide-react';

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold mb-4">خدماتنا</h1>
          <p className="text-xl text-gray-300">نقدم لكم أفضل خدمات التصوير الاحترافي</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 hover:bg-white/20 transition-colors"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl flex items-center justify-center mb-6">
                <service.icon size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4">{service.title}</h3>
              <p className="text-gray-300 mb-6">{service.description}</p>
              <ul className="space-y-2">
                {service.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-300">
                    <Check size={16} className="text-green-400" />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

const services = [
  {
    icon: Camera,
    title: 'تصوير الأفراح',
    description: 'نغطي كل لحظة خاصة في يوم زفافك',
    features: ['تصوير احترافي', 'فيديو سينمائي', 'ألبوم صور فاخر', 'تغطية كاملة']
  },
  {
    icon: Heart,
    title: 'تصوير الخطوبة',
    description: 'وثق لحظات الفرح والسعادة',
    features: ['جلسات تصوير', 'تصوير خارجي', 'مونتاج احترافي', 'صور عالية الجودة']
  },
  {
    icon: Calendar,
    title: 'تصوير المناسبات',
    description: 'جميع المناسبات الخاصة والعامة',
    features: ['أعياد ميلاد', 'حفلات تخرج', 'اجتماعات شركات', 'فعاليات خاصة']
  },
  {
    icon: Users,
    title: 'تصوير البورتريه',
    description: 'صور شخصية احترافية',
    features: ['صور شخصية', 'صور عائلية', 'صور عمل', 'إبداع فني']
  },
  {
    icon: Star,
    title: 'تصوير المنتجات',
    description: 'صور منتجات عالية الجودة',
    features: ['تصوير تجاري', 'صور إعلانية', 'تصوير فني', 'مونتاج احترافي']
  },
  {
    icon: Calendar,
    title: 'تصوير الشركات',
    description: 'تغطية فعاليات الشركات',
    features: ['مؤتمرات', 'اجتماعات', 'فعاليات', 'تقارير سنوية']
  }
];
