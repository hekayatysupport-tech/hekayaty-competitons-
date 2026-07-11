import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import {
  LogIn, Mail, Lock, Eye, EyeOff, Shield, Feather,
  HelpCircle, Loader2, CheckCircle2, KeyRound, ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';

type Tab = 'participant' | 'admin';

export function LoginPage() {
  const [, setLocation] = useLocation();
  const { isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<Tab>('participant');

  // Participant form
  const [pEmail, setPEmail] = useState('');
  const [pCode, setPCode] = useState('');
  const [pLoading, setPLoading] = useState(false);
  const [showCode, setShowCode] = useState(false);

  // Admin form
  const [aEmail, setAEmail] = useState('');
  const [aPassword, setAPassword] = useState('');
  const [aSecretKey, setASecretKey] = useState('');
  const [aLoading, setALoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);

  // ─── Participant Sign In ───────────────────────────────────────────────────
  const handleParticipantLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pEmail || !pCode) {
      toast.error('يرجى إدخال البريد الإلكتروني والكود');
      return;
    }

    setPLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: pEmail.trim().toLowerCase(),
        password: pCode.trim().toUpperCase(),
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('البريد الإلكتروني أو الكود غير صحيح. تذكر أن الكود يبدأ بـ HKA-2026-');
        } else {
          toast.error(error.message);
        }
        return;
      }

      toast.success('أهلاً بعودتك! 🎉');
      setLocation(`/submission-status?code=${pCode.trim().toUpperCase()}`);
    } finally {
      setPLoading(false);
    }
  };

  // ─── Admin Sign In ─────────────────────────────────────────────────────────
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aEmail || !aPassword || !aSecretKey) {
      toast.error('جميع الحقول مطلوبة');
      return;
    }

    setALoading(true);
    try {
      const res = await fetch(`/api/admin/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: aEmail.trim().toLowerCase(), password: aPassword, secretKey: aSecretKey })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'بيانات الدخول غير صحيحة');
      }

      if (data.session) {
        await supabase.auth.setSession(data.session);
      } else {
        throw new Error('حدث خطأ أثناء استرجاع الجلسة');
      }

      toast.success('مرحباً بك في لوحة الإدارة 🛡️');
      setLocation('/admin');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'بيانات الدخول غير صحيحة');
    } finally {
      setALoading(false);
    }
  };

  const inputClass =
    'w-full bg-white/5 border border-primary/15 rounded-2xl px-5 py-4 text-foreground focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/30 shadow-inner';

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-16 px-4 section-dark overflow-hidden relative font-sans" dir="rtl">
      {/* Background */}
      <div className="absolute inset-0 bg-[#0A0503]" />
      <div className="absolute inset-0 aurora-bg opacity-30 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full border border-primary/30 bg-primary/10 flex items-center justify-center glow-gold">
              <Feather className="w-6 h-6 text-primary" />
            </div>
            <div className="text-right">
              <span className="font-serif text-2xl font-black gold-text tracking-widest uppercase">Hekayaty</span>
              <p className="text-xs text-muted-foreground/50 tracking-widest">AWARDS 2026</p>
            </div>
          </div>
          <h1 className="text-3xl font-black text-foreground font-serif">تسجيل الدخول</h1>
          <p className="text-muted-foreground text-sm mt-2">اختر نوع حسابك للمتابعة</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1.5 mb-8 gap-1.5">
          <button
            onClick={() => setActiveTab('participant')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'participant'
                ? 'bg-primary text-primary-foreground shadow-[0_4px_14px_rgba(201,168,76,0.4)]'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Feather className="w-4 h-4" />
            دخول المشتركين
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'admin'
                ? 'bg-primary text-primary-foreground shadow-[0_4px_14px_rgba(201,168,76,0.4)]'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Shield className="w-4 h-4" />
            دخول المسؤولين
          </button>
        </div>

        {/* Forms */}
        <div className="glass-card rounded-[2rem] overflow-hidden luxury-shadow relative">
          <div className="absolute top-0 left-0 w-full h-1 gold-gradient" />

          <AnimatePresence mode="wait">
            {/* ── Participant Form ── */}
            {activeTab === 'participant' && (
              <motion.div
                key="participant"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="p-8"
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Feather className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-black text-foreground text-xl">بوابة المشتركين</h2>
                    <p className="text-muted-foreground text-xs">أدخل البريد الإلكتروني وكود التسجيل</p>
                  </div>
                </div>

                <form onSubmit={handleParticipantLogin} className="space-y-5">
                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground/80 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-primary" />
                      البريد الإلكتروني
                    </label>
                    <input
                      type="email"
                      value={pEmail}
                      onChange={e => setPEmail(e.target.value)}
                      placeholder="your@email.com"
                      className={inputClass}
                      dir="ltr"
                      required
                    />
                  </div>

                  {/* Code */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground/80 flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-primary" />
                      كود التسجيل (كلمة المرور)
                    </label>
                    <div className="relative">
                      <input
                        type={showCode ? 'text' : 'password'}
                        value={pCode}
                        onChange={e => setPCode(e.target.value.toUpperCase())}
                        placeholder="HKA-2026-XXXX"
                        className={`${inputClass} pl-12 font-mono tracking-widest`}
                        dir="ltr"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCode(v => !v)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Hint */}
                  <div className="flex items-start gap-3 bg-primary/5 border border-primary/15 rounded-xl px-4 py-3 text-xs text-muted-foreground">
                    <HelpCircle className="w-4 h-4 text-primary/60 shrink-0 mt-0.5" />
                    <span>كلمة المرور هي كود تسجيلك الذي استلمته عند التسجيل. مثال: <span className="font-mono text-primary" dir="ltr">HKA-2026-0042</span></span>
                  </div>

                  <button
                    type="submit"
                    disabled={pLoading}
                    className="w-full py-5 gold-gradient text-primary-foreground font-bold text-lg rounded-2xl shadow-[0_4px_20px_rgba(201,168,76,0.3)] hover:glow-gold transition-all flex items-center justify-center gap-3 shimmer-button disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {pLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <LogIn className="w-5 h-5" />
                        دخول
                      </>
                    )}
                  </button>

                  <p className="text-center text-sm text-muted-foreground">
                    لم تسجل بعد؟{' '}
                    <button
                      type="button"
                      onClick={() => setLocation('/register')}
                      className="text-primary font-bold hover:underline"
                    >
                      سجّل الآن
                    </button>
                  </p>
                </form>
              </motion.div>
            )}

            {/* ── Admin Form ── */}
            {activeTab === 'admin' && (
              <motion.div
                key="admin"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="p-8"
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-black text-foreground text-xl">بوابة المسؤولين</h2>
                    <p className="text-muted-foreground text-xs">للوصول إلى لوحة تحكم الإدارة</p>
                  </div>
                </div>

                <form onSubmit={handleAdminLogin} className="space-y-5">
                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground/80 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-primary" />
                      البريد الإلكتروني
                    </label>
                    <input
                      type="email"
                      value={aEmail}
                      onChange={e => setAEmail(e.target.value)}
                      placeholder="admin@hekayaty.com"
                      className={inputClass}
                      dir="ltr"
                      required
                    />
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground/80 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-primary" />
                      كلمة المرور
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={aPassword}
                        onChange={e => setAPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`${inputClass} pl-12`}
                        dir="ltr"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(v => !v)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Secret Key */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground/80 flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-amber-500" />
                      المفتاح السري للإدارة
                    </label>
                    <div className="relative">
                      <input
                        type={showSecretKey ? 'text' : 'password'}
                        value={aSecretKey}
                        onChange={e => setASecretKey(e.target.value)}
                        placeholder="أدخل مفتاح الأمان"
                        className="w-full bg-amber-500/5 border border-amber-500/30 rounded-2xl px-5 py-4 pl-12 text-amber-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition-all placeholder:text-amber-500/40 shadow-inner"
                        dir="ltr"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowSecretKey(v => !v)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500/70 hover:text-amber-400 transition-colors"
                      >
                        {showSecretKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Security notice */}
                  <div className="flex items-start gap-3 bg-amber-500/5 border border-amber-500/20 rounded-xl px-4 py-3 text-xs text-amber-400/70">
                    <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>محمي — الوصول مقتصر على المسؤولين المعتمدين فقط</span>
                  </div>

                  <button
                    type="submit"
                    disabled={aLoading}
                    className="w-full py-5 gold-gradient text-primary-foreground font-bold text-lg rounded-2xl shadow-[0_4px_20px_rgba(201,168,76,0.3)] hover:glow-gold transition-all flex items-center justify-center gap-3 shimmer-button disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {aLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Shield className="w-5 h-5" />
                        دخول الإدارة
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
