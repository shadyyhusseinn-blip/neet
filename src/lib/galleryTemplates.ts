export interface GalleryTemplate {
  id: string;
  name: string;
  description: string;
  preview: string;
  layout: 'grid' | 'masonry' | 'timeline' | 'minimal';
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
  features: string[];
}

export const galleryTemplates: GalleryTemplate[] = [
  {
    id: 'classic-elegant',
    name: 'كلاسيكي أنيق',
    description: 'تصميم كلاسيكي مع ألوان دافئة وتخطيط شبكي',
    preview: '📸',
    layout: 'grid',
    colors: {
      primary: '#D4AF37',
      secondary: '#8B5A2B',
      background: '#0a0a0f',
      text: '#ffffff'
    },
    features: ['شبكة متساوية', 'ألوان ذهبية', 'خلفية داكنة']
  },
  {
    id: 'modern-minimal',
    name: 'حديث بسيط',
    description: 'تصميم بسيط وأنيق مع مساحات بيضاء',
    preview: '✨',
    layout: 'minimal',
    colors: {
      primary: '#ffffff',
      secondary: '#f0f0f0',
      background: '#ffffff',
      text: '#000000'
    },
    features: ['مساحات بيضاء', 'خطوط نظيفة', 'تصميم بسيط']
  },
  {
    id: 'timeline-story',
    name: 'خط زمني',
    description: 'عرض الصور كقصة زمنية',
    preview: '📅',
    layout: 'timeline',
    colors: {
      primary: '#5D3A34',
      secondary: '#D4AF37',
      background: '#1a1a1a',
      text: '#ffffff'
    },
    features: ['خط زمني', 'قصص مصورة', 'ترتيب زمني']
  },
  {
    id: 'masonry-artistic',
    name: 'فني متعدد الأحجام',
    description: 'تصميم فني بأحجام مختلفة للصور',
    preview: '🎨',
    layout: 'masonry',
    colors: {
      primary: '#C9A962',
      secondary: '#5D3A34',
      background: '#0f0f0f',
      text: '#ffffff'
    },
    features: ['أحجام مختلفة', 'تصميم فني', 'تباين عالي']
  }
];

export const getTemplateById = (id: string): GalleryTemplate | undefined => {
  return galleryTemplates.find(template => template.id === id);
};
