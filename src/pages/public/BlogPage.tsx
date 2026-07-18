import { motion } from 'motion/react';
import { Calendar, User, ArrowRight } from 'lucide-react';

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold mb-4">المدونة</h1>
          <p className="text-xl text-gray-300">أحدث الأخبار والمقالات</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden hover:bg-white/20 transition-colors"
            >
              <div className="h-48 bg-gradient-to-br from-pink-500 to-purple-500"></div>
              <div className="p-6">
                <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    {post.date}
                  </div>
                  <div className="flex items-center gap-2">
                    <User size={16} />
                    {post.author}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3">{post.title}</h3>
                <p className="text-gray-300 mb-4">{post.excerpt}</p>
                <button className="flex items-center gap-2 text-pink-400 hover:text-pink-300 transition-colors">
                  اقرأ المزيد <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

const blogPosts = [
  {
    title: 'نصائح لتصوير الأفراح المثالي',
    excerpt: 'تعرف على أفضل النصائح للحصول على صور زفاف احترافية',
    date: '2024-01-15',
    author: 'شادي حسين'
  },
  {
    title: 'أحدث اتجاهات التصوير في 2024',
    excerpt: 'اكتشف أحدث صيحات وتوجهات عالم التصوير',
    date: '2024-01-10',
    author: 'شادي حسين'
  },
  {
    title: 'كيف تختار مصور الزفاف المناسب',
    excerpt: 'دليل شامل لاختيار المصور المثالي ليوم زفافك',
    date: '2024-01-05',
    author: 'شادي حسين'
  }
];
