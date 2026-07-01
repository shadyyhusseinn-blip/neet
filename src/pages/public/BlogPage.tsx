import React from 'react';
import { motion } from 'motion/react';
import { Calendar, User, ArrowLeft, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const blogPosts = [
  {
    id: 1,
    title: 'نصائح لتصوير الزفاف المثالي',
    excerpt: 'تعرف على أفضل النصائح للحصول على صور زفاف احترافية وخالدة',
    author: 'شادي حسين',
    date: '2024-01-15',
    readTime: '5 دقائق',
    category: 'نصائح',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800'
  },
  {
    id: 2,
    title: 'كيف تختار المصور المناسب لزفافك؟',
    excerpt: 'دليل شامل لاختيار مصور الزفاف المثالي يناسب ميزانيتك وتوقعاتك',
    author: 'شادي حسين',
    date: '2024-01-10',
    readTime: '7 دقائق',
    category: 'دليل',
    image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800'
  },
  {
    id: 3,
    title: 'أحدث اتجاهات تصوير الأفراح 2024',
    excerpt: 'اكتشف أحدث الاتجاهات في عالم تصوير الأفراح هذا العام',
    author: 'شادي حسين',
    date: '2024-01-05',
    readTime: '4 دقائق',
    category: 'اتجاهات',
    image: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800'
  }
];

export default function BlogPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0d0d15] to-[#080910] text-white">
      {/* Header */}
      <div className="pt-24 pb-12 text-center">
        <motion.button
          onClick={() => navigate('/')}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span>العودة للرئيسية</span>
        </motion.button>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
        >
          المدونة
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-gray-400 text-lg"
        >
          نصائح وإرشادات في عالم التصوير
        </motion.p>
      </div>

      {/* Blog Posts */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all cursor-pointer"
              onClick={() => navigate(`/blog/${post.id}`)}
            >
              <div className="aspect-video bg-gradient-to-br from-purple-900/50 to-pink-900/50">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4 text-sm text-gray-400">
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full">
                    {post.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>{post.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{post.readTime}</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{post.title}</h3>
                <p className="text-gray-400 mb-4 line-clamp-2">{post.excerpt}</p>
                <div className="flex items-center gap-2 text-gray-400">
                  <User size={16} />
                  <span>{post.author}</span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  );
}
