import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calculator, DollarSign, Plus, Minus, Info } from 'lucide-react';

const BASE_PACKAGES = [
  {
    id: 'bronze',
    name: 'باقة البرونز',
    price: 5000,
    features: ['تصوير 4 ساعات', '100 صور محررة', 'معرض رقمي', 'حقوق الصور']
  },
  {
    id: 'silver',
    name: 'باقة الفضة',
    price: 8000,
    features: ['تصوير 6 ساعات', '200 صور محررة', 'معرض رقمي', 'ألبوم فوتوغرافي', 'حقوق الصور']
  },
  {
    id: 'gold',
    name: 'باقة الذهب',
    price: 12000,
    features: ['تصوير 8 ساعات', '300 صور محررة', 'معرض رقمي', 'ألبوم فوتوغرافي', 'فيديو سينمائي', 'حقوق الصور']
  },
  {
    id: 'platinum',
    name: 'باقة البلاتين',
    price: 20000,
    features: ['تصوير 12 ساعة', '500 صور محررة', 'معرض رقمي', 'ألبوم فوتوغرافي', 'فيديو سينمائي', 'تصوير طائرة درون', 'حقوق الصور']
  }
];

const ADD_ONS = [
  { id: 'extra-hours', name: 'ساعات إضافية', price: 1000, unit: 'ساعة' },
  { id: 'drone', name: 'تصوير طائرة درون', price: 3000, unit: '' },
  { id: 'album', name: 'ألبوم إضافي', price: 1500, unit: '' },
  { id: 'video', name: 'فيديو سينمائي', price: 5000, unit: '' },
  { id: 'rush', name: 'تسليم سريع (48 ساعة)', price: 2000, unit: '' },
  { id: 'second-shooter', name: 'مصور ثاني', price: 4000, unit: '' }
];

export function PriceCalculator() {
  const [selectedPackage, setSelectedPackage] = useState(BASE_PACKAGES[0]);
  const [selectedAddOns, setSelectedAddOns] = useState<Record<string, number>>({});
  const [customHours, setCustomHours] = useState(0);

  const handleAddOnChange = (addOnId: string, delta: number) => {
    setSelectedAddOns(prev => {
      const current = (prev[addOnId] as number) || 0;
      const newValue = Math.max(0, current + delta);
      return { ...prev, [addOnId]: newValue };
    });
  };

  const calculateTotal = () => {
    let total = selectedPackage.price;

    Object.entries(selectedAddOns).forEach(([addOnId, quantity]) => {
      const addOn = ADD_ONS.find(a => a.id === addOnId);
      if (addOn && (quantity as number) > 0) {
        total += addOn.price * (quantity as number);
      }
    });

    return total;
  };

  const total = calculateTotal();

  return (
    <div className="bg-gradient-to-br from-[#0a0a0f] via-[#0d0d15] to-[#080910] py-16">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            حاسبة الأسعار
          </h2>
          <p className="text-gray-400">احسب تكلفة تصويرك المثالي</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Package Selection */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6"
          >
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Calculator size={24} className="text-purple-400" />
              اختر الباقة الأساسية
            </h3>

            <div className="space-y-4">
              {BASE_PACKAGES.map((pkg) => (
                <button
                  key={pkg.id}
                  onClick={() => setSelectedPackage(pkg)}
                  className={`w-full p-4 rounded-xl border transition-all text-right ${
                    selectedPackage.id === pkg.id
                      ? 'bg-purple-500/20 border-purple-500/30'
                      : 'bg-white/5 border-white/10 hover:border-purple-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-white">{pkg.name}</span>
                    <span className="text-purple-400 font-bold">{pkg.price.toLocaleString()} ج.م</span>
                  </div>
                  <ul className="text-sm text-gray-400 space-y-1">
                    {pkg.features.map((feature, index) => (
                      <li key={index}>• {feature}</li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Add-ons */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6"
          >
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Plus size={24} className="text-purple-400" />
              خدمات إضافية
            </h3>

            <div className="space-y-4">
              {ADD_ONS.map((addOn) => (
                <div key={addOn.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div className="flex-1">
                    <p className="font-semibold text-white">{addOn.name}</p>
                    <p className="text-sm text-gray-400">
                      {addOn.price.toLocaleString()} ج.م{addOn.unit && ` / ${addOn.unit}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAddOnChange(addOn.id, -1)}
                      className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors"
                    >
                      <Minus size={16} className="text-white" />
                    </button>
                    <span className="w-8 text-center text-white font-semibold">
                      {selectedAddOns[addOn.id] || 0}
                    </span>
                    <button
                      onClick={() => handleAddOnChange(addOn.id, 1)}
                      className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center hover:bg-purple-600 transition-colors"
                    >
                      <Plus size={16} className="text-white" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Total */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 mb-2">الإجمالي التقديري</p>
              <div className="flex items-center gap-3">
                <DollarSign size={32} className="text-purple-400" />
                <p className="text-4xl md:text-5xl font-bold text-white">
                  {total.toLocaleString()} ج.م
                </p>
              </div>
            </div>
            <button className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition-all">
              احجز الآن
            </button>
          </div>
          <div className="mt-4 flex items-start gap-2 text-sm text-gray-400">
            <Info size={16} className="flex-shrink-0 mt-0.5" />
            <p>هذا السعر تقديري وقد يتغير حسب المتطلبات الفعلية. تواصل معنا للحصول على عرض سعر دقيق.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
