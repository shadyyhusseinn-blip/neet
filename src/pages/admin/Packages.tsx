import { useEffect, useMemo, useState } from 'react';
import {
  Camera,
  Edit,
  Film,
  Gem,
  Grid3X3,
  Package,
  Plus,
  Save,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { storage } from '../../services/storage';
import { Package as PackageType, PackageCategory } from '../../types';
import { cn, toArabicDigits } from '../../lib/utils';
import { audioService } from '../../services/audio';
import PageLayout from '../../components/layout/PageLayout';
import SearchInput from '../../components/ui/SearchInput';
import EmptyState from '../../components/ui/EmptyState';
import { UI } from '../../lib/ui';
import { usePackages } from '../../hooks/useFirestoreData';

type PackageDraft = {
  id?: string;
  name: string;
  price: number;
  category: PackageCategory;
  description: string;
  isActive: boolean;
};

const categoryTabs = [
  { id: 'all', label: 'الكل', icon: Grid3X3 },
  { id: 'photography', label: 'فوتوغراف', icon: Camera },
  { id: 'video', label: 'فيديو', icon: Film },
  { id: 'printing', label: 'طباعة', icon: Package },
  { id: 'promo', label: 'عروض', icon: Gem },
];

const categoryLabels: Record<string, string> = {
  photography: 'تصوير',
  video: 'فيديو',
  printing: 'طباعة',
  locations: 'لوكيشن',
  rooms: 'غرف',
  promo: 'ترويجي',
};

export default function Packages() {
  const { packages: firestorePackages, loading } = usePackages();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [editorOpen, setEditorOpen] = useState(false);
  const [draft, setDraft] = useState<PackageDraft>(emptyDraft());

  const filteredPackages = useMemo(
    () =>
      firestorePackages.filter((pkg) => {
        const matchesCategory = activeCategory === 'all' || pkg.category === activeCategory;
        const search = searchTerm.trim().toLowerCase();
        const matchesSearch =
          !search ||
          pkg.name.toLowerCase().includes(search) ||
          pkg.description.toLowerCase().includes(search);
        return matchesCategory && matchesSearch;
      }),
    [activeCategory, firestorePackages, searchTerm]
  );

  const stats = useMemo(() => {
    const active = firestorePackages.filter((pkg) => pkg.isActive !== false).length;
    const totalValue = firestorePackages.reduce((sum, pkg) => sum + (pkg.price || 0), 0);
    const averagePrice = firestorePackages.length ? Math.round(totalValue / firestorePackages.length) : 0;
    return { total: firestorePackages.length, active, averagePrice, totalValue };
  }, [firestorePackages]);

  const openNewEditor = () => {
    setDraft(emptyDraft());
    setEditorOpen(true);
    audioService.playClick();
  };

  const openEditEditor = (pkg: PackageType) => {
    setDraft({
      id: pkg.id,
      name: pkg.name,
      price: pkg.price,
      category: pkg.category,
      description: pkg.description,
      isActive: pkg.isActive !== false,
    });
    setEditorOpen(true);
    audioService.playClick();
  };

  const savePackage = () => {
    if (!draft.name.trim() || draft.price <= 0) {
      storage.toast('أدخل اسم الباقة وسعرًا صحيحًا.', 'error');
      return;
    }

    if (draft.id) {
      // Update via Firestore
      const updatedPackage = {
        id: draft.id,
        name: draft.name.trim(),
        price: draft.price,
        category: draft.category,
        description: draft.description || '',
        features: draft.features || [],
        duration: draft.duration || 0,
        photos: draft.photos || [],
        isActive: draft.isActive,
        createdAt: new Date().toISOString(),
      };
      storage.savePackage(updatedPackage);
    } else {
      storage.savePackage({
        id: Date.now().toString(),
        name: draft.name.trim(),
        price: draft.price,
        category: draft.category,
        description: draft.description.trim(),
        isActive: draft.isActive,
      } as PackageType);
    }

    setEditorOpen(false);
    setDraft(emptyDraft());
    audioService.playSuccess();
  };

  const handleDelete = (id: string) => {
    if (!confirm('هل تريد حذف هذه الباقة؟')) return;
    storage.deletePackage(id);
    audioService.playClick();
  };

  return (
    <PageLayout
      title="صفحة الباقات"
      subtitle="إدارة عروض التصوير والفيديو والخدمات المرتبطة بنمط أوضح."
      stats={[
        { label: 'إجمالي الباقات', value: stats.total, icon: Package },
        { label: 'الباقات النشطة', value: stats.active, icon: Gem },
        { label: 'متوسط السعر', value: stats.averagePrice, suffix: 'ج.م', icon: Camera },
        { label: 'إجمالي التسعير', value: stats.totalValue, suffix: 'ج.م', icon: Film },
      ]}
      tabs={categoryTabs}
      activeTab={activeCategory}
      onTabChange={(id) => {
        setActiveCategory(id);
        audioService.playClick();
      }}
      actions={
        <button type="button" onClick={openNewEditor} className="btn-primary">
          <Plus size={18} />
          إضافة باقة
        </button>
      }
      toolbar={
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="ابحث عن باقة..."
          className="w-full sm:w-80"
        />
      }
    >
      <div className="space-y-6">
        <section
          className={cn(
            UI.section,
            'relative overflow-hidden border-primary/15 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.14),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))]'
          )}
        >
          <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary">
                <Gem size={14} />
                إدارة باقات أكثر وضوحًا
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight text-text-main">
                  صفحة الباقات أصبحت أقرب للإدارة الفعلية لا مجرد العرض.
                </h2>
                <p className="mt-3 max-w-3xl text-sm md:text-base text-text-muted leading-7">
                  يمكنك الآن تصفية الباقات، البحث فيها، وتحريرها أو إضافة باقات جديدة من نفس
                  الشاشة مع قراءة أسرع للأسعار والتصنيفات والحالة.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <QuickStat title="تصوير" value={countByCategory(firestorePackages, 'photography')} />
              <QuickStat title="فيديو" value={countByCategory(firestorePackages, 'video')} />
              <QuickStat title="طباعة" value={countByCategory(firestorePackages, 'printing')} />
              <QuickStat title="ترويجي" value={countByCategory(firestorePackages, 'promo')} />
            </div>
          </div>
        </section>

        {filteredPackages.length === 0 ? (
          <EmptyState
            title="لا توجد باقات مطابقة"
            description="جرّب تغيير التصنيف أو نص البحث."
            icon={Package}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredPackages.map((pkg, index) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className={cn(UI.card, 'space-y-5')}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                    {pkg.category === 'video' ? <Film size={20} /> : pkg.category === 'promo' ? <Gem size={20} /> : <Camera size={20} />}
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => openEditEditor(pkg)} className="btn-ghost p-2">
                      <Edit size={16} />
                    </button>
                    <button type="button" onClick={() => handleDelete(pkg.id)} className="btn-ghost p-2 text-danger">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-display font-semibold text-text-main">{pkg.name}</h3>
                  <p className="text-sm text-text-muted mt-2 leading-6 min-h-12">
                    {pkg.description || 'لا يوجد وصف مضاف لهذه الباقة حتى الآن.'}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-2xl font-display font-bold text-primary">
                    {toArabicDigits(pkg.price.toLocaleString())}
                    <span className="text-xs text-text-muted font-normal mr-1">ج.م</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="badge-muted">{categoryLabels[pkg.category] || pkg.category}</span>
                    <span className={pkg.isActive !== false ? 'badge-success' : 'badge-warning'}>
                      {pkg.isActive !== false ? 'نشطة' : 'موقوفة'}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {editorOpen && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70"
              onClick={() => setEditorOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              className={cn(UI.modal, 'relative z-10 w-full max-w-3xl space-y-5')}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-display font-semibold text-text-main">
                    {draft.id ? 'تعديل الباقة' : 'إضافة باقة جديدة'}
                  </h3>
                  <p className="text-sm text-text-muted">حدّث تفاصيل الباقة ثم احفظ التغييرات.</p>
                </div>
                <button type="button" onClick={() => setEditorOpen(false)} className="btn-ghost p-2">
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field
                  label="اسم الباقة"
                  value={draft.name}
                  onChange={(value) => setDraft((prev) => ({ ...prev, name: value }))}
                />
                <Field
                  label="السعر"
                  type="number"
                  value={String(draft.price || '')}
                  onChange={(value) => setDraft((prev) => ({ ...prev, price: Number(value) || 0 }))}
                />
                <div className="space-y-2">
                  <label className="text-xs text-text-muted">التصنيف</label>
                  <select
                    value={draft.category}
                    onChange={(event) =>
                      setDraft((prev) => ({ ...prev, category: event.target.value as PackageCategory }))
                    }
                    className="field-input h-12 text-sm"
                  >
                    {Object.entries(categoryLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-text-muted">الحالة</label>
                  <select
                    value={draft.isActive ? 'active' : 'inactive'}
                    onChange={(event) =>
                      setDraft((prev) => ({ ...prev, isActive: event.target.value === 'active' }))
                    }
                    className="field-input h-12 text-sm"
                  >
                    <option value="active">نشطة</option>
                    <option value="inactive">موقوفة</option>
                  </select>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs text-text-muted">الوصف</label>
                  <textarea
                    value={draft.description}
                    onChange={(event) =>
                      setDraft((prev) => ({ ...prev, description: event.target.value }))
                    }
                    className="field-input min-h-32 resize-none py-3 text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button type="button" onClick={savePackage} className="btn-primary">
                  <Save size={16} />
                  حفظ الباقة
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageLayout>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs text-text-muted">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="field-input h-12 text-sm"
      />
    </div>
  );
}

function QuickStat({ title, value }: { title: string; value: number }) {
  return (
    <div className={cn(UI.card, 'space-y-2')}>
      <p className="text-xs text-text-muted">{title}</p>
      <p className="text-xl font-display font-bold text-text-main">{toArabicDigits(value)}</p>
    </div>
  );
}

function emptyDraft(): PackageDraft {
  return {
    name: '',
    price: 0,
    category: 'photography',
    description: '',
    isActive: true,
  };
}

function countByCategory(packages: PackageType[], category: PackageCategory) {
  return packages.filter((pkg) => pkg.category === category).length;
}
