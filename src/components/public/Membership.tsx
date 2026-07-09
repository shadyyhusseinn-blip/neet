import React from 'react';
import { Crown, Check, Star } from 'lucide-react';
import { motion } from 'motion/react';

interface MembershipTier {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  popular?: boolean;
  color: string;
}

const defaultTiers: MembershipTier[] = [
  {
    id: 'basic',
    name: 'الأساسية',
    price: 0,
    period: 'مجاني',
    features: [
      'وصول للمعرض العام',
      'خصم 5% على الحجوزات',
      'تحديثات أسبوعية',
      'دعم عبر البريد الإلكتروني'
    ],
    color: 'from-gray-700 to-gray-900'
  },
  {
    id: 'pro',
    name: 'المحترف',
    price: 299,
    period: 'شهرياً',
    features: [
      'كل مميزات الأساسية',
      'خصم 15% على الحجوزات',
      'معرض خاص',
      'تحديثات يومية',
      'دعم على مدار الساعة',
      'جلسة تصوير مجانية سنوياً',
      'وصول للباقات الحصرية'
    ],
    popular: true,
    color: 'from-purple-700 to-purple-900'
  },
  {
    id: 'premium',
    name: 'الذهبية',
    price: 599,
    period: 'شهرياً',
    features: [
      'كل مميزات المحترف',
      'خصم 25% على الحجوزات',
      'معرض خاص مع علامة مائية',
      'أولوية في الحجز',
      'مدير حساب شخصي',
      'جلستان تصوير مجانيتان سنوياً',
      'وصول للباقات الحصرية',
      'دعم VIP',
      'هدايا حصرية'
    ],
    color: 'from-yellow-600 to-yellow-800'
  }
];

interface MembershipProps {
  tiers?: MembershipTier[];
}

export default function Membership({ tiers = defaultTiers }: MembershipProps) {
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
            <Crown className="w-8 h-8 text-yellow-500" />
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
              برامج العضوية
            </h2>
          </div>
          <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
            اختر العضوية المناسبة لك واستمتع بمزايا حصرية
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative rounded-2xl overflow-hidden ${
                tier.popular ? 'ring-2 ring-yellow-500 scale-105' : ''
              }`}
            >
              {tier.popular && (
                <div className="absolute top-0 left-0 right-0 bg-yellow-500 text-black text-center py-2 font-semibold text-sm">
                  الأكثر شعبية
                </div>
              )}

              <div className={`bg-gradient-to-br ${tier.color} p-8 pt-${tier.popular ? '12' : '8'}`}>
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-white">
                      {tier.price === 0 ? 'مجاني' : tier.price}
                    </span>
                    {tier.price > 0 && (
                      <span className="text-neutral-300">/{tier.period}</span>
                    )}
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                      <span className="text-neutral-200">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button className="w-full py-3 rounded-lg font-semibold transition-all ${
                  tier.popular
                    ? 'bg-yellow-500 hover:bg-yellow-400 text-black'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }">
                  {tier.price === 0 ? 'اشترك مجاناً' : 'اشترك الآن'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="flex items-center justify-center gap-2 text-neutral-400">
            <Star className="w-5 h-5 text-yellow-500" />
            <p>يمكنك إلغاء الاشتراك في أي وقت</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
