import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { firebaseService } from '../../services/firebase';
import { motion } from 'motion/react';
import { Save } from 'lucide-react';
import ViewShell from '../../components/layout/ViewShell';

export default function ManagerNotes() {
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const db = firebaseService.getDB();
        const notesDoc = await getDoc(doc(db, 'settings', 'manager_notes'));
        if (notesDoc.exists()) {
          setNotes(notesDoc.data().content || '');
        }
      } catch (error) {
        console.error('Error fetching notes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const db = firebaseService.getDB();
      await setDoc(doc(db, 'settings', 'manager_notes'), {
        content: notes,
        updatedAt: new Date().toISOString()
      });
      alert('تم حفظ الملحوظات بنجاح');
    } catch (error) {
      console.error('Error saving notes:', error);
      alert('فشل حفظ الملحوظات');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ViewShell title="ملحوظات المدير" subtitle="كتابة ملحوظات للموظفين">
        <div className="h-full flex items-center justify-center">
          <p className="text-slate-400">جاري التحميل...</p>
        </div>
      </ViewShell>
    );
  }

  return (
    <ViewShell title="ملحوظات المدير" subtitle="كتابة ملحوظات للموظفين">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-to-r from-slate-600/20 to-pink-600/20 rounded-full blur-[150px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.1, 0.25, 0.1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-gradient-to-r from-indigo-600/15 to-slate-600/15 rounded-full blur-[180px]"
        />
      </div>

      <div className="relative z-10 h-full flex flex-col">
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">ملحوظات المدير</h2>
              <p className="text-slate-400 text-sm mt-1">اكتب ملحوظات للموظفين ستظهر في صفحة الموظفين</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all hover:scale-105 disabled:opacity-50 shadow-lg shadow-blue-500/20"
            >
              <Save size={20} />
              <span>{saving ? 'جاري الحفظ...' : 'حفظ'}</span>
            </motion.button>
          </div>

          <div className="flex-1">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="اكتب ملحوظاتك هنا..."
              className="w-full h-full min-h-[400px] px-6 py-4 bg-black/40 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none backdrop-blur-xl leading-relaxed shadow-xl transition-all hover:scale-[1.01]"
              dir="rtl"
            />
          </div>
        </div>
      </div>
    </ViewShell>
  );
}
