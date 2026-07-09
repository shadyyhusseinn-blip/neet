import React from 'react';
import { Instagram, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

interface InstagramPost {
  id: string;
  imageUrl: string;
  caption?: string;
  likes?: number;
  permalink?: string;
}

interface InstagramFeedProps {
  posts?: InstagramPost[];
  username?: string;
}

const defaultPosts: InstagramPost[] = [
  {
    id: '1',
    imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400',
    caption: 'جلسة تصوير رائعة',
    likes: 120,
    permalink: '#'
  },
  {
    id: '2',
    imageUrl: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=400',
    caption: 'لحظات لا تنسى',
    likes: 85,
    permalink: '#'
  },
  {
    id: '3',
    imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400',
    caption: 'تصوير طبيعي',
    likes: 200,
    permalink: '#'
  },
  {
    id: '4',
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400',
    caption: 'بورتريه احترافي',
    likes: 150,
    permalink: '#'
  },
  {
    id: '5',
    imageUrl: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=400',
    caption: 'زفاف ساحر',
    likes: 300,
    permalink: '#'
  },
  {
    id: '6',
    imageUrl: 'https://images.unsplash.com/photo-1504198266287-1659872e6590?w=400',
    caption: 'حدث خاص',
    likes: 95,
    permalink: '#'
  }
];

export default function InstagramFeed({
  posts = defaultPosts,
  username = '@studio'
}: InstagramFeedProps) {
  return (
    <section className="py-20 lg:py-32 bg-neutral-900/50">
      <div className="max-w-7xl mx-auto px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Instagram className="w-8 h-8 text-pink-500" />
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
              تابعنا على Instagram
            </h2>
          </div>
          <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
            شاهد أحدث أعمالنا ولحظات التصوير المميزة
          </p>
          <a
            href={`https://instagram.com/${username.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-4 text-pink-400 hover:text-pink-300 transition-colors"
          >
            <span>{username}</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {posts.map((post, index) => (
            <motion.a
              key={post.id}
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="relative group aspect-square overflow-hidden rounded-xl cursor-pointer"
            >
              <img
                src={post.imageUrl}
                alt={post.caption || 'Instagram post'}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  {post.caption && (
                    <p className="text-white text-sm mb-2 line-clamp-2">
                      {post.caption}
                    </p>
                  )}
                  {post.likes && (
                    <div className="flex items-center gap-2 text-white/80 text-sm">
                      <span className="font-semibold">♥</span>
                      <span>{post.likes}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.a>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <a
            href={`https://instagram.com/${username.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all"
          >
            <Instagram className="w-5 h-5" />
            متابعة على Instagram
          </a>
        </motion.div>
      </div>
    </section>
  );
}
