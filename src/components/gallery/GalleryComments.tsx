import React, { useState } from 'react';
import { MessageCircle, Send, Trash2, ThumbsUp } from 'lucide-react';
import { motion } from 'motion/react';
import { colors } from '../../theme/colors';

interface Comment {
  id: string;
  author: string;
  text: string;
  date: string;
  likes: number;
  isLiked?: boolean;
}

interface GalleryCommentsProps {
  galleryId: string;
  comments?: Comment[];
  onAddComment?: (comment: Omit<Comment, 'id' | 'date' | 'likes'>) => void;
  onDeleteComment?: (commentId: string) => void;
  onLikeComment?: (commentId: string) => void;
}

export default function GalleryComments({
  galleryId,
  comments = [],
  onAddComment,
  onDeleteComment,
  onLikeComment,
}: GalleryCommentsProps) {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddComment?.({
        author: 'زائر',
        text: newComment.trim(),
      });
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays < 7) return `منذ ${diffDays} يوم`;
    return date.toLocaleDateString('ar-SA');
  };

  return (
    <div className="space-y-6">
      {/* Add Comment Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-xl"
        style={{ backgroundColor: colors.background.card, border: `1px solid ${colors.border.primary}` }}
      >
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: colors.text.primary }}>
          <MessageCircle size={20} />
          أضف تعليقك
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="اكتب تعليقك هنا..."
            className="w-full px-4 py-3 rounded-xl text-white placeholder:text-gray-500 focus:outline-none resize-none"
            style={{ 
              backgroundColor: colors.background.secondary,
              border: `1px solid ${colors.border.primary}`,
            }}
            rows={3}
            maxLength={500}
          />
          <div className="flex justify-between items-center">
            <span className="text-xs" style={{ color: colors.text.tertiary }}>
              {newComment.length}/500
            </span>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={!newComment.trim() || isSubmitting}
              className="flex items-center gap-2 px-6 py-2 rounded-xl text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: colors.gradient.primary }}
            >
              <Send size={16} />
              {isSubmitting ? 'جاري الإرسال...' : 'إرسال'}
            </motion.button>
          </div>
        </form>
      </motion.div>

      {/* Comments List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold" style={{ color: colors.text.primary }}>
          التعليقات ({comments.length})
        </h3>
        
        {comments.length === 0 ? (
          <div 
            className="text-center py-8 rounded-xl"
            style={{ backgroundColor: colors.background.card, border: `1px solid ${colors.border.primary}` }}
          >
            <MessageCircle size={48} className="mx-auto mb-4" style={{ color: colors.text.tertiary }} />
            <p style={{ color: colors.text.tertiary }}>لا توجد تعليقات بعد. كن أول من يعلق!</p>
          </div>
        ) : (
          comments.map((comment, index) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-xl"
              style={{ backgroundColor: colors.background.card, border: `1px solid ${colors.border.primary}` }}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: colors.gradient.primary }}
                  >
                    {comment.author.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-sm" style={{ color: colors.text.primary }}>
                      {comment.author}
                    </p>
                    <p className="text-xs" style={{ color: colors.text.tertiary }}>
                      {formatDate(comment.date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onLikeComment?.(comment.id)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all ${
                      comment.isLiked ? 'text-red-400' : ''
                    }`}
                    style={{ 
                      backgroundColor: comment.isLiked ? colors.secondary[900] : colors.background.secondary,
                    }}
                  >
                    <ThumbsUp size={14} />
                    <span className="text-xs">{comment.likes}</span>
                  </motion.button>
                  {onDeleteComment && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onDeleteComment(comment.id)}
                      className="p-1 rounded-lg transition-all"
                      style={{ color: colors.text.tertiary }}
                    >
                      <Trash2 size={14} />
                    </motion.button>
                  )}
                </div>
              </div>
              <p className="text-sm" style={{ color: colors.text.secondary }}>
                {comment.text}
              </p>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
