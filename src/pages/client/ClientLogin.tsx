import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Lock, Mail } from 'lucide-react';
import { clientLogin } from '../../services/clientAuth';
import { Button } from '../../shared/ui/Button';
import { Input } from '../../shared/ui/Input';
import { motion } from 'motion/react';

export function ClientLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await clientLogin(email, password);
      // Store client data in localStorage or state
      localStorage.setItem('clientData', JSON.stringify(result.client));
      navigate(`/client/portal/${result.client.id}`);
    } catch (err: any) {
      setError(err.message || 'فشل تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="glass-panel p-8 rounded-2xl border border-white/10">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/25">
              <Camera size={40} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">بوابة العملاء</h1>
            <p className="text-gray-400 text-sm">سجل دخولك لعرض وتحميل صورك</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="البريد الإلكتروني"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              icon={<Mail size={18} />}
              iconPosition="left"
            />

            <Input
              label="كلمة المرور"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              icon={<Lock size={18} />}
              iconPosition="left"
            />

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              loading={loading}
            >
              تسجيل الدخول
            </Button>

            {/* Developer Login Button */}
            <Button
              type="button"
              variant="secondary"
              size="md"
              fullWidth
              onClick={() => {
                const devClientId = 'dev-client-123';
                localStorage.setItem('clientData', JSON.stringify({
                  id: devClientId,
                  name: 'مطور',
                  email: 'dev@example.com'
                }));
                navigate(`/client/portal/${devClientId}`);
              }}
            >
              دخول كمطور
            </Button>
          </form>

          {/* Help */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              تواصل مع المصور إذا نسيت كلمة المرور
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
