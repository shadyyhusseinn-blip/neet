import React from 'react';
import { Camera, Phone, Mail, MapPin, Instagram, Facebook, Twitter } from 'lucide-react';

interface FooterProps {
  showQuickLinks?: boolean;
  showServices?: boolean;
  showContact?: boolean;
  showSocial?: boolean;
  onNavigate?: (sectionId: string) => void;
  className?: string;
}

export default function Footer({
  showQuickLinks = true,
  showServices = true,
  showContact = true,
  showSocial = true,
  onNavigate,
  className = ''
}: FooterProps) {
  const quickLinks = [
    { id: 'services', label: 'الخدمات' },
    { id: 'portfolio', label: 'الأعمال' },
    { id: 'about', label: 'عني' },
    { id: 'contact', label: 'تواصل' }
  ];

  const services = [
    'تصوير الزفاف',
    'تصوير الخطوبة',
    'تصوير المناسبات',
    'تصوير البورتريه'
  ];

  const contactInfo = [
    { icon: Phone, label: '01008189569' },
    { icon: Mail, label: 'shadyyhusseinn@gmail.com' },
    { icon: MapPin, label: 'القاهرة، مصر' }
  ];

  const socialLinks = [
    { icon: Instagram, label: 'Instagram' },
    { icon: Facebook, label: 'Facebook' },
    { icon: Twitter, label: 'Twitter' }
  ];

  return (
    <footer className={`bg-[#050508] border-t border-[#5D3A34]/20 py-12 px-6 ${className}`}>
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Logo & Description */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#5D3A34] to-[#D4AF37] rounded-xl flex items-center justify-center">
                <Camera size={20} className="text-white" />
              </div>
              <span className="text-white font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
                SHADY HUSSEIN
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              استوديو تصوير احترافي يقدم خدمات عالية الجودة للأفراح والمناسبات الخاصة.
            </p>
          </div>

          {/* Quick Links */}
          {showQuickLinks && (
            <div>
              <h4 className="text-white font-bold mb-4">روابط سريعة</h4>
              <ul className="space-y-2">
                {quickLinks.map((link) => (
                  <li key={link.id}>
                    <button
                      onClick={() => onNavigate?.(link.id)}
                      className="text-gray-400 hover:text-[#D4AF37] transition-colors"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Services */}
          {showServices && (
            <div>
              <h4 className="text-white font-bold mb-4">الخدمات</h4>
              <ul className="space-y-2">
                {services.map((service, index) => (
                  <li key={index}>
                    <span className="text-gray-400">{service}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Contact */}
          {showContact && (
            <div>
              <h4 className="text-white font-bold mb-4">تواصل معنا</h4>
              <ul className="space-y-2">
                {contactInfo.map((info, index) => (
                  <li key={index} className="flex items-center gap-2 text-gray-400">
                    <info.icon size={16} className="text-[#D4AF37]" />
                    <span>{info.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Social Links */}
        {showSocial && (
          <div className="flex justify-center gap-4 mb-8">
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href="#"
                className="w-10 h-10 bg-[#5D3A34]/20 border-2 border-[#5D3A34]/30 rounded-xl flex items-center justify-center hover:bg-[#D4AF37]/20 hover:border-[#D4AF37]/40 transition-all"
              >
                <social.icon size={20} className="text-[#D4AF37]" />
              </a>
            ))}
          </div>
        )}

        {/* Copyright */}
        <div className="border-t border-[#5D3A34]/20 pt-8 text-center">
          <p className="text-gray-400">
            © 2024 Shady Hussein Photography. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
}
