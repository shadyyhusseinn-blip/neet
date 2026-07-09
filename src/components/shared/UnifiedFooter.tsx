import React from 'react';
import { Camera, Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { colors } from '../../theme/colors';

interface UnifiedFooterProps {
  currentSystem?: 'public' | 'gallery' | 'admin';
}

export default function UnifiedFooter({ currentSystem = 'public' }: UnifiedFooterProps) {
  const navigate = useNavigate();

  const getSystemColor = (system: string) => {
    switch (system) {
      case 'gallery':
        return colors.accent[500];
      case 'admin':
        return colors.neutral[500];
      default:
        return colors.primary[500];
    }
  };

  const socialLinks = [
    { icon: Facebook, label: 'فيسبوك', href: '#' },
    { icon: Instagram, label: 'إنستغرام', href: '#' },
    { icon: Twitter, label: 'تويتر', href: '#' },
    { icon: Youtube, label: 'يوتيوب', href: '#' },
  ];

  const quickLinks = [
    { label: 'الرئيسية', path: '/' },
    { label: 'المعرض', path: '/gallery' },
    { label: 'الباقات', path: '/packages' },
    { label: 'تواصل', path: '/contact' },
  ];

  const contactInfo = [
    { icon: Phone, label: '+966 50 123 4567', value: '+966501234567' },
    { icon: Mail, label: 'info@shadyphotography.com', value: 'info@shadyphotography.com' },
    { icon: MapPin, label: 'الرياض، المملكة العربية السعودية', value: '' },
  ];

  return (
    <footer 
      className="border-t border-white/10 mt-auto"
      style={{ backgroundColor: colors.background.secondary }}
    >
      <div className="px-6 py-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ 
                  background: currentSystem === 'gallery' ? colors.gradient.secondary : colors.gradient.primary 
                }}
              >
                <Camera size={20} className="text-white" />
              </div>
              <div>
                <p className="text-lg font-bold text-white">شادي حسين</p>
                <p 
                  className="text-xs"
                  style={{ color: currentSystem === 'gallery' ? colors.accent[400] : colors.primary[400] }}
                >
                  استوديو التصوير
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-400">
              تخليد اللحظات الثمينة بجودة فائقة واحترافية عالية
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-white mb-4">روابط سريعة</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <button
                    onClick={() => navigate(link.path)}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-bold text-white mb-4">تواصل معنا</h3>
            <ul className="space-y-3">
              {contactInfo.map((info, index) => (
                <li key={index} className="flex items-center gap-2">
                  <info.icon size={16} className="text-gray-500" />
                  <span className="text-sm text-gray-400">{info.label}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-sm font-bold text-white mb-4">تابعنا</h3>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                  aria-label={social.label}
                >
                  <social.icon size={18} className="text-gray-400" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © 2024 شادي حسين Photography. جميع الحقوق محفوظة.
          </p>
          <div className="flex gap-4">
            <button className="text-sm text-gray-500 hover:text-white transition-colors">
              سياسة الخصوصية
            </button>
            <button className="text-sm text-gray-500 hover:text-white transition-colors">
              الشروط والأحكام
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
