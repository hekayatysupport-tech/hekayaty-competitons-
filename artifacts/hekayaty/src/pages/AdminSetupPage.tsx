import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, UserPlus, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const ROLES = [
  { value: 'super_admin', label: 'مدير عام', desc: 'كامل الصلاحيات' },
  { value: 'awards_manager', label: 'مدير الجوائز', desc: 'إدارة الفعاليات والتسجيلات' },
  { value: 'reviewer', label: 'مراجع', desc: 'عرض ومراجعة التسجيلات فقط' },
  { value: 'finance_manager', label: 'مدير مالي', desc: 'التحقق من المدفوعات' },
];

export function AdminSetupPage() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('super_admin');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState<{ email: string; role: string } | null>(null);
  const [allRegistered, setAllRegistered] = useState<{ email: string; role: string }[]>([]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || password.length < 6 || !name || !secretKey) {
      toast.error('جميع الحقول مطلوبة، وكلمة المرور يجب ألا تقل عن 6 أحرف');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('كلمتا المرور غير متطابقتين');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, secretKey, role })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'فشل إنشاء الحساب');
      }

      if (data.session) {
        await supabase.auth.setSession(data.session);
      }

      const entry = { email, role: ROLES.find(r => r.value === role)?.label || role };
      setAllRegistered(prev => [...prev, entry]);
      setRegistered(entry);
      toast.success(`تم تسجيل ${email} كمسؤول بنجاح! جاري الانتقال لوحة الإدارة...`);

      setTimeout(() => setLocation('/admin'), 1500);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'حدث خطأ أثناء التسجيل');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] py-16 px-4 section-dark overflow-hidden relative flex items-center justify-center">
      <div className="absolute inset-0 aurora-bg opacity-40 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-5xl relative z-10 grid md:grid-cols-5 gap-8">

        {/* Left: Form */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="md:col-span-3"
        >
          <div className="glass-card rounded-[2.5rem] p-8 md:p-12 luxury-shadow relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 gold-gradient" />

            {/* Header */}
            <div className="flex items-center gap-5 mb-10">
              <div className="w-16 h-16 rounded-full border border-primary/30 bg-primary/10 flex items-center justify-center glow-gold">
                <ShieldCheck className="w-8 h-8 text-primary" strokeWidth={1.5} />
              </div>
              <div>
                <h1 className="text-3xl font-black text-foreground font-serif">تسجيل مسؤول جديد</h1>
                <p className="text-muted-foreground text-sm mt-1">صفحة إعداد النظام — مؤقتة</p>
              </div>
            </div>

            <form onSubmit={handleRegister} className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-foreground/80">الاسم الكامل</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="اسم المسؤول"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-foreground focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/40"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-foreground/80">البريد الإلكتروني *</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@hekayaty.com"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-foreground focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/40"
                  dir="ltr"
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-foreground/80">كلمة المرور *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="6 أحرف على الأقل"
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 pr-14 text-foreground focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/40"
                    dir="ltr"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-foreground/80">تأكيد كلمة المرور *</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="أعد إدخال كلمة المرور"
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 pr-14 text-foreground focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/40"
                    dir="ltr"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(p => !p)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Secret Key */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-foreground/80">المفتاح السري للإدارة (Secret Key) *</label>
                <div className="relative">
                  <input
                    type={showSecretKey ? 'text' : 'password'}
                    value={secretKey}
                    onChange={e => setSecretKey(e.target.value)}
                    placeholder="أدخل مفتاح الأمان"
                    className="w-full bg-amber-500/5 border border-amber-500/30 rounded-2xl px-6 py-4 pr-14 text-amber-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition-all placeholder:text-amber-500/40"
                    dir="ltr"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecretKey(p => !p)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500/70 hover:text-amber-400 transition-colors"
                  >
                    {showSecretKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Role Selector */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-foreground/80">الصلاحية</label>
                <div className="grid grid-cols-2 gap-3">
                  {ROLES.map(r => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRole(r.value)}
                      className={`p-4 rounded-2xl border text-right transition-all ${
                        role === r.value
                          ? 'bg-primary/10 border-primary/50 glow-gold'
                          : 'bg-black/30 border-white/10 hover:border-primary/30'
                      }`}
                    >
                      <p className={`font-bold text-sm ${role === r.value ? 'text-primary' : 'text-foreground'}`}>{r.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{r.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 gold-gradient text-primary-foreground font-bold text-lg rounded-2xl shadow-[0_0_20px_rgba(201,168,76,0.3)] hover:shadow-[0_0_30px_rgba(201,168,76,0.5)] transition-all flex items-center justify-center gap-3 shimmer-button disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    تسجيل كمسؤول
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>

        {/* Right: Registered list */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-2 space-y-6"
        >
          {/* Security Notice */}
          <div className="glass-card rounded-[2rem] p-6 border-amber-500/20 bg-amber-500/5">
            <div className="flex items-start gap-4">
              <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-400 text-sm mb-1">صفحة مؤقتة</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  هذه الصفحة للإعداد الأولي فقط. بعد انتهائك من التسجيل، اطلب إخفاء هذه الصفحة. جميع الحسابات المنشأة هنا ستبقى محفوظة في قاعدة البيانات.
                </p>
              </div>
            </div>
          </div>

          {/* Registered List */}
          <div className="glass-card rounded-[2rem] p-6">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              المسجلون في هذه الجلسة
            </h3>
            <AnimatePresence>
              {allRegistered.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">لم يتم تسجيل أي مسؤول بعد</p>
              ) : (
                <div className="space-y-3">
                  {allRegistered.map((admin, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-4 h-4 text-[#34d399] shrink-0" />
                        <div>
                          <p className="text-sm font-bold text-foreground" dir="ltr">{admin.email}</p>
                          <p className="text-xs text-primary/70">{admin.role}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>

          {allRegistered.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card rounded-[2rem] p-6 border-[#34d399]/20 bg-[#34d399]/5"
            >
              <div className="flex items-start gap-4">
                <AlertCircle className="w-5 h-5 text-[#34d399] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[#34d399] text-sm mb-1">جاهز للإغلاق</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    عند انتهائك من التسجيل، أخبر المساعد بإخفاء هذه الصفحة. الحسابات المنشأة ستبقى نشطة.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

      </div>
    </div>
  );
}
