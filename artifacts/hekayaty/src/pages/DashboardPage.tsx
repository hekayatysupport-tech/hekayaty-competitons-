import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { useRegistrations, Registration, RegistrationStatus } from '@/hooks/useRegistrations';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, Clock, XCircle, AlertTriangle, Upload, Star,
  RefreshCw, Copy, Check, ChevronRight, BookOpen, Calendar,
  Package, User, Feather, Mail, Search, FileText,
  CreditCard, Shield, Award, ChevronDown, ChevronUp, Loader2,
  Bell, MessageSquare, Sparkles, FileCheck2, ShieldCheck,
  MapPin, Phone, Trophy, Zap, HelpCircle
} from 'lucide-react';
import { toast } from 'sonner';

/* ── constants ──────────────────────────────────────────────────────────────── */

const FAQ = [
  { q: 'متى يتم الإعلان عن النتائج؟', a: 'يتم الإعلان عن النتائج النهائية خلال 60 يوم عمل من تاريخ انتهاء التسجيل في نوفمبر 2026.' },
  { q: 'كيف يتم التحقق من الدفع؟', a: 'تقوم الإدارة بمراجعة إثبات الدفع يدوياً خلال 3-5 أيام عمل وإشعارك بالنتيجة عبر البريد الإلكتروني.' },
  { q: 'هل يمكنني تعديل روايتي بعد التسليم؟', a: 'لا يمكن تعديل الرواية بعد التسليم الرسمي. يرجى التأكد من صحة الملف قبل الرفع.' },
  { q: 'كيف أتواصل مع الإدارة؟', a: 'يمكنك التواصل عبر البريد الإلكتروني hekayatysupport@gmail.com وسيتم الرد خلال يوم عمل.' },
  { q: 'ما الصيغ المقبولة للرواية؟', a: 'نقبل ملفات PDF وDOCX فقط بحد أقصى 20 ميجابايت.' },
  { q: 'هل يمكنني الاشتراك بأكثر من رواية؟', a: 'كلتا الباقتين تتيحان تسليم رواية واحدة فقط. الباقة الأولى (١٠٠ ج.م) للأعمال التي لا تتجاوز ٢٥,٠٠٠ كلمة، والباقة الثانية (١٥٠ ج.م) للأعمال التي تزيد عن ٣٥,٠٠٠ كلمة.' },
];

const PRIZE_INFO = [
  { place: 'المركز الأول', prize: '5,000 ج.م + شهادة تكريم ذهبية', icon: '🥇', color: 'from-yellow-500/20 to-amber-500/10', border: 'border-yellow-500/30' },
  { place: 'المركز الثاني', prize: '3,000 ج.م + شهادة تكريم فضية', icon: '🥈', color: 'from-slate-400/20 to-slate-500/10', border: 'border-slate-400/30' },
  { place: 'المركز الثالث', prize: '1,500 ج.م + شهادة تكريم برونزية', icon: '🥉', color: 'from-amber-700/20 to-amber-800/10', border: 'border-amber-700/30' },
];

const JUDGING_CRITERIA = [
  { label: 'أصالة الفكرة والإبداع', weight: '25%', icon: '💡' },
  { label: 'جودة الأسلوب الأدبي', weight: '30%', icon: '✍️' },
  { label: 'تطور الشخصيات والحبكة', weight: '20%', icon: '👥' },
  { label: 'البنية السردية والتسلسل', weight: '15%', icon: '📖' },
  { label: 'اللغة والتدفق والإيقاع', weight: '10%', icon: '🎵' },
];

const TIMELINE_STEPS = [
  { label: 'اكتمال التسجيل', icon: User },
  { label: 'تسليم إثبات الدفع', icon: CreditCard },
  { label: 'قيد المراجعة', icon: BookOpen },
  { label: 'تقييم لجنة التحكيم', icon: Trophy },
  { label: 'القرار النهائي', icon: Star },
];

/* ── helpers ──────────────────────────────────────────────────────────────── */

function getStatusInfo(reg: Registration) {
  const status = reg.registrationStatus;
  
  if (status === 'Approved') return { label: 'مقبول 🏆', subtitle: 'تهانينا! تم قبول مشاركتك في المسابقة', color: 'text-emerald-400', bg: 'bg-emerald-500/8 border-emerald-500/25', glow: 'shadow-[0_0_40px_rgba(52,211,153,0.12)]', icon: Trophy, dot: 'bg-emerald-400' };
  if (status === 'Rejected') return { label: 'مرفوض', subtitle: 'نأسف، لم يتم قبول عملك في هذه الدورة', color: 'text-rose-400', bg: 'bg-rose-500/8 border-rose-500/25', glow: '', icon: XCircle, dot: 'bg-rose-400' };
  if (status === 'Needs Attention') return { label: 'يحتاج تصحيح', subtitle: 'يوجد إجراء مطلوب منك — تحقق من رسالة الإدارة', color: 'text-orange-400', bg: 'bg-orange-500/8 border-orange-500/25', glow: '', icon: AlertTriangle, dot: 'bg-orange-400' };
  if (['Under Review', 'Novel Uploaded', 'Sent To Telegram', 'Submission Completed', 'Payment Submitted', 'Waiting For Novel Upload', 'Payment Verified'].includes(status)) return { label: 'قيد المراجعة', subtitle: 'عملك تحت المراجعة الرسمية', color: 'text-primary', bg: 'bg-primary/8 border-primary/25', glow: 'shadow-[0_0_40px_rgba(201,168,76,0.1)]', icon: BookOpen, dot: 'bg-primary' };
  return { label: 'قيد المعالجة', subtitle: 'جاري معالجة طلبك — انتظر التأكيد من الإدارة', color: 'text-white/40', bg: 'bg-white/5 border-white/10', glow: '', icon: Clock, dot: 'bg-white/30' };
}

function getTimelineStep(reg: Registration): number {
  const status = reg.registrationStatus;

  if (['Approved', 'Rejected'].includes(status)) return 4;
  if (['Judging'].includes(status)) return 3;
  if (['Under Review', 'Novel Uploaded', 'Sent To Telegram', 'Submission Completed', 'Payment Submitted', 'Waiting For Novel Upload', 'Payment Verified', 'Needs Attention'].includes(status)) return 2;
  if (status === 'Information Completed') return 1;
  return 0;
}

/* ── micro-components ─────────────────────────────────────────────────────── */

function Accordion({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/8 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-5 text-right hover:bg-white/4 transition-colors">
        <span className="font-bold text-white/80 text-sm leading-relaxed">{q}</span>
        {open ? <ChevronUp className="w-4 h-4 text-primary shrink-0 mr-3" /> : <ChevronDown className="w-4 h-4 text-white/25 shrink-0 mr-3" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <p className="px-5 pb-5 text-white/45 text-sm leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SearchView({ onFound }: { onFound: (code: string) => void }) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    let code = input.trim().toUpperCase();
    if (/^\d{1,4}$/.test(code)) code = `HKA-2026-${code.padStart(4, '0')}`;
    setLoading(true);
    setTimeout(() => { setLoading(false); onFound(code); }, 200);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 relative section-dark" dir="rtl">
      <div className="absolute inset-0 bg-[#0A0503]" />
      <div className="absolute inset-0 aurora-bg opacity-15 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg relative z-10 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="w-24 h-24 bg-primary/10 border border-primary/25 rounded-3xl flex items-center justify-center mx-auto mb-7 glow-gold"
        >
          <Award className="w-12 h-12 text-primary" strokeWidth={1.5} />
        </motion.div>

        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/25 rounded-full px-4 py-1.5 mb-5">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="text-primary text-xs font-bold tracking-widest">HEKAYATY AWARDS 2026</span>
        </div>

        <h1 className="text-4xl font-black text-white font-serif mb-3">لوحة التحكم الشخصية</h1>
        <p className="text-white/35 text-sm mb-10 leading-relaxed">أدخل كود التسجيل للوصول لبوابة متابعة مشاركتك في المسابقة</p>

        <form onSubmit={handleSubmit} className="relative">
          <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/25 pointer-events-none" />
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="HKA-2026-XXXX"
            dir="ltr"
            className="w-full bg-white/5 border border-white/12 rounded-2xl py-5 pr-14 pl-36 text-white text-center text-lg placeholder:text-white/15 focus:outline-none focus:border-primary/40 focus:bg-white/8 transition-all font-mono shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute inset-y-2 left-2 px-8 gold-gradient text-primary-foreground font-bold rounded-xl disabled:opacity-70 flex items-center gap-2 hover:-translate-y-px transition-transform"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'دخول'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

/* ── Main Dashboard ─────────────────────────────────────────────────────────── */

export function DashboardPage() {
  const [, setLocation] = useLocation();
  const { getByCode } = useRegistrations();
  const [reg, setReg] = useState<Registration | null>(null);
  const [loadingReg, setLoadingReg] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'submission' | 'info'>('overview');

  const params = new URLSearchParams(window.location.search);
  const codeParam = params.get('code');

  const loadReg = useCallback(async (code: string) => {
    setLoadingReg(true);
    const data = await getByCode(code);
    if (data) { 
      setReg(data); 
      setNotFound(false); 
      localStorage.setItem('hekayaty_active_code', code);
    } else { 
      setNotFound(true); 
    }
    setLoadingReg(false);
  }, []);

  useEffect(() => {
    if (codeParam) {
      loadReg(codeParam);
    } else {
      const savedCode = localStorage.getItem('hekayaty_active_code');
      if (savedCode) {
        setLocation(`/dashboard?code=${savedCode}`);
      }
    }
  }, [codeParam, loadReg, setLocation]);

  const handleSearch = (code: string) => { loadReg(code); };

  const handleRefresh = async () => {
    if (!reg) return;
    setRefreshing(true);
    await loadReg(reg.code);
    setRefreshing(false);
    toast.success('تم تحديث البيانات');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(reg?.code || '');
    setCopied(true);
    toast.success('تم نسخ الكود');
    setTimeout(() => setCopied(false), 2000);
  };

  // Search screen
  if (!codeParam && !reg) {
    return (
      <div className="relative section-dark overflow-hidden font-sans">
        <div className="absolute inset-0 aurora-bg opacity-15 pointer-events-none" />
        {notFound && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-rose-500/15 border border-rose-500/30 text-rose-400 px-6 py-3 rounded-xl text-sm font-bold backdrop-blur"
          >
            لم يتم العثور على هذا الكود — تحقق وأعد المحاولة
          </motion.div>
        )}
        <SearchView onFound={handleSearch} />
      </div>
    );
  }

  if (loadingReg || !reg) return (
    <div className="min-h-screen flex items-center justify-center section-dark">
      <div className="text-center">
        <div className="w-16 h-16 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/35 font-medium text-sm">جاري تحميل لوحة التحكم...</p>
      </div>
    </div>
  );

  const statusInfo = getStatusInfo(reg);
  const timelineStep = getTimelineStep(reg);
  const StatusIcon = statusInfo.icon;
  const daysSince = Math.floor((Date.now() - new Date(reg.registeredAt).getTime()) / (1000 * 60 * 60 * 24));
  const packageLabel = reg.packageType === 'package_a' ? 'الباقة الفردية' : 'الباقة المتعددة';
  const packagePrice = reg.packageType === 'package_a' ? '100 ج.م' : '150 ج.م';

  const tabs = [
    { key: 'overview', label: 'نظرة عامة', icon: Zap },
    { key: 'submission', label: 'التسليم', icon: FileCheck2 },
    { key: 'info', label: 'معلومات', icon: BookOpen },
  ];

  return (
    <div className="min-h-[calc(100vh-80px)] pb-20 relative section-dark overflow-hidden font-sans" dir="rtl">
      {/* Background */}
      <div className="absolute inset-0 bg-[#0A0503]" />
      <div className="absolute inset-0 aurora-bg opacity-15 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[300px] bg-primary/4 blur-[130px] rounded-full pointer-events-none" />

      {/* Sticky top bar */}
      <div className="border-b border-white/5 bg-[#0d0620]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 bg-primary/12 border border-primary/20 rounded-xl flex items-center justify-center shrink-0">
              <Award className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-white/25 text-[10px] font-bold uppercase tracking-widest leading-none mb-0.5">لوحة التحكم</p>
              <p className="text-primary font-black font-mono text-sm leading-none truncate" dir="ltr">{reg.code}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleRefresh}
              className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/8 flex items-center justify-center text-white/40 hover:text-white transition-all"
              title="تحديث"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/8 rounded-xl px-3 py-2 text-white/40 hover:text-white text-xs font-bold transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? 'تم النسخ' : 'نسخ الكود'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pt-7 space-y-5">

        {/* ── STATUS HERO CARD ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-[2rem] border p-7 md:p-8 relative overflow-hidden ${statusInfo.bg} ${statusInfo.glow}`}
        >
          {/* Glow blob */}
          <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full opacity-30 blur-3xl pointer-events-none" style={{ background: `radial-gradient(circle, ${statusInfo.color.includes('emerald') ? 'rgba(52,211,153,0.4)' : statusInfo.color.includes('primary') ? 'rgba(201,168,76,0.4)' : statusInfo.color.includes('rose') ? 'rgba(244,63,94,0.4)' : 'rgba(255,255,255,0.1)'}, transparent)` }} />

          <div className="flex flex-col sm:flex-row sm:items-center gap-5 relative z-10">
            <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl border flex items-center justify-center shrink-0 ${statusInfo.bg}`}>
              <StatusIcon className={`w-8 h-8 md:w-10 md:h-10 ${statusInfo.color}`} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2 h-2 rounded-full ${statusInfo.dot} animate-pulse`} />
                <p className="text-white/35 text-xs font-bold uppercase tracking-[0.2em]">حالة مشاركتك الحالية</p>
              </div>
              <h2 className={`text-3xl md:text-4xl font-black leading-tight ${statusInfo.color}`}>{statusInfo.label}</h2>
              <p className="text-white/35 text-sm mt-2 leading-relaxed">
                {reg.adminNotes || statusInfo.subtitle}
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── QUICK STATS ROW ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: Package, label: 'الباقة', val: packageLabel, sub: packagePrice },
            { icon: Calendar, label: 'تاريخ التسجيل', val: new Date(reg.registeredAt).toLocaleDateString('ar-EG'), sub: null },
            { icon: Clock, label: 'أيام منذ التسجيل', val: `${daysSince} يوم`, sub: null },
            { icon: BookOpen, label: 'عدد الأعمال', val: `${reg.stories.length} أعمال`, sub: null },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-[#14092a]/70 backdrop-blur border border-white/7 rounded-2xl p-5"
            >
              <item.icon className="w-4 h-4 text-primary/50 mb-2.5" />
              <p className="text-white/25 text-[10px] font-bold uppercase tracking-widest mb-1">{item.label}</p>
              <p className="text-white font-bold text-base leading-tight">{item.val}</p>
              {item.sub && <p className="text-primary/60 text-xs font-bold mt-0.5">{item.sub}</p>}
            </motion.div>
          ))}
        </div>

        {/* ── TABS ── */}
        <div className="flex gap-1.5 bg-white/4 border border-white/7 rounded-2xl p-1.5">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                activeTab === tab.key
                  ? 'bg-primary text-primary-foreground shadow-[0_0_20px_rgba(201,168,76,0.35)]'
                  : 'text-white/35 hover:text-white/60'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* ══ OVERVIEW TAB ══ */}
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">

              {/* Participant Info */}
              <div className="bg-[#14092a]/70 backdrop-blur border border-white/7 rounded-[2rem] p-7">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-primary/12 rounded-xl flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="text-white font-black text-base">بيانات المشارك</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  {[
                    { icon: User, label: 'الاسم الكامل', val: reg.name },
                    { icon: Feather, label: 'الاسم المستعار', val: reg.penName || '—' },
                    { icon: MapPin, label: 'المدينة', val: reg.city },
                    { icon: Mail, label: 'البريد الإلكتروني', val: reg.email },
                    { icon: Phone, label: 'رقم الهاتف', val: reg.phone },
                    { icon: Package, label: 'الباقة المختارة', val: `${packageLabel} — ${packagePrice}` },
                  ].map((item, i) => (
                    <div key={i}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <item.icon className="w-3 h-3 text-primary/50" />
                        <p className="text-white/25 text-[10px] font-bold uppercase tracking-wider">{item.label}</p>
                      </div>
                      <p className="text-white font-medium text-sm leading-relaxed break-all">{item.val}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Competition Journey Timeline */}
              <div className="bg-[#14092a]/70 backdrop-blur border border-white/7 rounded-[2rem] p-7">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-8 h-8 bg-primary/12 rounded-xl flex items-center justify-center">
                    <Star className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="text-white font-black text-base">رحلة المشاركة</h3>
                </div>
                <div className="space-y-0">
                  {TIMELINE_STEPS.map((step, i) => {
                    const done = i < timelineStep;
                    const current = i === timelineStep;
                    const StepIcon = step.icon;
                    return (
                      <div key={i} className="flex items-start gap-4">
                        <div className="flex flex-col items-center">
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: i * 0.07 }}
                            className={`w-9 h-9 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                              done ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.45)]' :
                              current ? 'bg-primary/15 border-primary shadow-[0_0_16px_rgba(201,168,76,0.4)] animate-pulse' :
                              'bg-white/4 border-white/12'
                            }`}
                          >
                            {done ? <CheckCircle2 className="w-4 h-4 text-white" /> :
                             current ? <div className="w-2.5 h-2.5 bg-primary rounded-full" /> :
                             <StepIcon className="w-4 h-4 text-white/15" />}
                          </motion.div>
                          {i < TIMELINE_STEPS.length - 1 && (
                            <div className={`w-0.5 h-9 mt-1 rounded-full transition-all ${done ? 'bg-emerald-500/45' : 'bg-white/7'}`} />
                          )}
                        </div>
                        <div className="pb-8 pt-1.5">
                          <p className={`font-bold text-sm leading-tight ${done ? 'text-emerald-400' : current ? 'text-primary' : 'text-white/22'}`}>
                            {step.label}
                          </p>
                          {current && (
                            <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 rounded-full px-2 py-0.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                              المرحلة الحالية
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Notifications / Admin Messages */}
              <div className="bg-[#14092a]/70 backdrop-blur border border-white/7 rounded-[2rem] p-7">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/12 rounded-xl flex items-center justify-center">
                      <Bell className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="text-white font-black text-base">تحديثات المسابقة</h3>
                  </div>
                  {reg.adminNotes && <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
                </div>

                {reg.adminNotes ? (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-4 bg-primary/6 border border-primary/20 rounded-2xl p-5"
                  >
                    <div className="w-10 h-10 bg-primary/15 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                      <MessageSquare className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-primary/70 text-[10px] font-bold uppercase tracking-widest">رسالة رسمية من الإدارة</p>
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      </div>
                      <p className="text-white/80 font-medium text-sm leading-relaxed">{reg.adminNotes}</p>
                    </div>
                  </motion.div>
                ) : (
                  <div className="text-center py-8">
                    <Bell className="w-10 h-10 text-white/10 mx-auto mb-3" />
                    <p className="text-white/22 text-sm">لا توجد تحديثات جديدة حالياً</p>
                    <p className="text-white/15 text-xs mt-1">سيتم إشعارك عبر البريد الإلكتروني عند أي تحديث</p>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setLocation(`/submission-status?code=${reg.code}`)}
                  className="py-4 bg-white/5 hover:bg-white/8 border border-white/8 text-white/55 hover:text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <FileCheck2 className="w-4 h-4" />
                  متابعة التسليم
                </button>
                <a
                  href="mailto:hekayatysupport@gmail.com"
                  className="py-4 bg-white/5 hover:bg-white/8 border border-white/8 text-white/55 hover:text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <Mail className="w-4 h-4" />
                  تواصل معنا
                </a>
              </div>
            </motion.div>
          )}

          {/* ══ SUBMISSION TAB ══ */}
          {activeTab === 'submission' && (
            <motion.div key="submission" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">

              {/* 4 Status Mini-Cards */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: CreditCard, title: 'حالة الدفع', status: (() => {
                    const s = reg.registrationStatus;
                    if (['Payment Verified','Under Review','Approved','Novel Uploaded','Sent To Telegram','Submission Completed','Waiting For Novel Upload'].includes(s))
                      return { label: 'تم التحقق', color: 'text-emerald-400', bg: 'bg-emerald-500/8 border-emerald-500/20' };
                    if (s === 'Rejected') return { label: 'مرفوض', color: 'text-rose-400', bg: 'bg-rose-500/8 border-rose-500/20' };
                    return { label: 'في انتظار التحقق', color: 'text-amber-400', bg: 'bg-amber-500/8 border-amber-500/20' };
                  })() },
                  { icon: Upload, title: 'حالة الرواية', status: (() => {
                    const s = reg.registrationStatus;
                    if (['Novel Uploaded','Sent To Telegram','Submission Completed','Under Review','Approved'].includes(s))
                      return { label: 'تم الرفع', color: 'text-emerald-400', bg: 'bg-emerald-500/8 border-emerald-500/20' };
                    if (s === 'Needs Attention') return { label: 'يحتاج إجراء', color: 'text-orange-400', bg: 'bg-orange-500/8 border-orange-500/20' };
                    return { label: 'في انتظار الرفع', color: 'text-amber-400', bg: 'bg-amber-500/8 border-amber-500/20' };
                  })() },
                  { icon: BookOpen, title: 'حالة المراجعة', status: (() => {
                    const s = reg.registrationStatus;
                    if (s === 'Approved') return { label: 'مقبول', color: 'text-emerald-400', bg: 'bg-emerald-500/8 border-emerald-500/20' };
                    if (s === 'Rejected') return { label: 'مرفوض', color: 'text-rose-400', bg: 'bg-rose-500/8 border-rose-500/20' };
                    if (['Under Review','Novel Uploaded','Sent To Telegram','Submission Completed'].includes(s)) return { label: 'قيد المراجعة', color: 'text-primary', bg: 'bg-primary/8 border-primary/20' };
                    return { label: 'لم تبدأ بعد', color: 'text-white/28', bg: 'bg-white/4 border-white/8' };
                  })() },
                  { icon: Star, title: 'القرار النهائي', status: (() => {
                    const s = reg.registrationStatus;
                    if (s === 'Approved') return { label: 'مقبول 🏆', color: 'text-emerald-400', bg: 'bg-emerald-500/8 border-emerald-500/20' };
                    if (s === 'Rejected') return { label: 'غير مقبول', color: 'text-rose-400', bg: 'bg-rose-500/8 border-rose-500/20' };
                    if (s === 'Needs Attention') return { label: 'يحتاج تصحيح', color: 'text-orange-400', bg: 'bg-orange-500/8 border-orange-500/20' };
                    return { label: 'قيد الانتظار', color: 'text-white/28', bg: 'bg-white/4 border-white/8' };
                  })() },
                ].map((card, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className={`rounded-2xl border p-5 ${card.status.bg}`}
                  >
                    <div className="flex items-center gap-2 text-white/30 mb-3">
                      <card.icon className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-widest">{card.title}</span>
                    </div>
                    <p className={`text-xl font-black leading-tight ${card.status.color}`}>{card.status.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Stories Details */}
              <div className="bg-[#14092a]/70 backdrop-blur border border-white/7 rounded-[2rem] p-7">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-primary/12 rounded-xl flex items-center justify-center">
                    <Feather className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="text-white font-black text-base">الأعمال الأدبية المُقدَّمة</h3>
                </div>
                <div className="space-y-3">
                  {reg.stories.map((story, i) => {
                    const uploaded = story.upload_status === 'sent';
                    return (
                      <div key={i} className={`border rounded-2xl p-5 ${uploaded ? 'bg-emerald-500/5 border-emerald-500/18' : 'bg-white/4 border-white/8'}`}>
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-bold font-serif leading-tight">{story.title}</h4>
                            <p className="text-white/35 text-xs mt-1">{story.category}</p>
                          </div>
                          <span className={`shrink-0 flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${
                            uploaded ? 'bg-emerald-500/12 text-emerald-400 border-emerald-500/22' : 'bg-amber-500/12 text-amber-400 border-amber-500/22'
                          }`}>
                            {uploaded ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            {uploaded ? 'تم الرفع' : 'لم يُرفع بعد'}
                          </span>
                        </div>
                        {uploaded && story.file_name && (
                          <div className="flex flex-wrap gap-3 pt-3 border-t border-white/5 text-xs text-white/28">
                            <span className="flex items-center gap-1.5"><FileText className="w-3 h-3 text-primary/40" />{story.file_name}</span>
                            {story.file_size && <span>{(story.file_size / 1024 / 1024).toFixed(2)} MB</span>}
                            <span className="flex items-center gap-1 text-emerald-400/55"><ShieldCheck className="w-3 h-3" />أُرسل للجنة</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={() => setLocation(`/submission-status?code=${reg.code}`)}
                  className="w-full py-4 bg-primary/8 hover:bg-primary/15 border border-primary/20 hover:border-primary/35 text-primary font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
                >
                  عرض صفحة متابعة التسليم التفصيلية
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ══ INFO TAB ══ */}
          {activeTab === 'info' && (
            <motion.div key="info" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">

              {/* Prizes */}
              <div className="bg-[#14092a]/70 backdrop-blur border border-white/7 rounded-[2rem] p-7">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-primary/12 rounded-xl flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="text-white font-black text-base">جوائز المسابقة</h3>
                </div>
                <div className="space-y-3">
                  {PRIZE_INFO.map((p, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className={`flex items-center justify-between bg-gradient-to-l ${p.color} border ${p.border} rounded-2xl px-5 py-4`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{p.icon}</span>
                        <p className="text-white font-bold">{p.place}</p>
                      </div>
                      <p className="text-primary font-black text-sm">{p.prize}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Judging Criteria */}
              <div className="bg-[#14092a]/70 backdrop-blur border border-white/7 rounded-[2rem] p-7">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-primary/12 rounded-xl flex items-center justify-center">
                    <Shield className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="text-white font-black text-base">معايير التحكيم</h3>
                </div>
                <div className="space-y-3">
                  {JUDGING_CRITERIA.map((c, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <span className="text-xl">{c.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-white/65 text-sm font-medium">{c.label}</p>
                          <span className="text-primary font-black text-sm">{c.weight}</span>
                        </div>
                        <div className="h-1.5 bg-white/6 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: c.weight }}
                            transition={{ delay: 0.3 + i * 0.1, duration: 0.8, ease: 'easeOut' }}
                            className="h-full gold-gradient rounded-full"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Important Dates */}
              <div className="bg-[#14092a]/70 backdrop-blur border border-white/7 rounded-[2rem] p-7">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-primary/12 rounded-xl flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="text-white font-black text-base">المواعيد المهمة</h3>
                </div>
                <div className="space-y-0">
                  {[
                    { label: 'آخر موعد للتسجيل', date: '31 أغسطس 2026', icon: '📅' },
                    { label: 'بدء مرحلة التقييم', date: '1 سبتمبر 2026', icon: '📋' },
                    { label: 'الإعلان عن النتائج', date: '30 نوفمبر 2026', icon: '📢' },
                    { label: 'حفل التكريم والجوائز', date: 'ديسمبر 2026', icon: '🎖️' },
                  ].map((d, i) => (
                    <div key={i} className="flex items-center gap-4 py-4 border-b border-white/5 last:border-0">
                      <span className="text-xl">{d.icon}</span>
                      <div className="flex-1">
                        <p className="text-white/55 text-sm">{d.label}</p>
                      </div>
                      <p className="text-primary font-bold text-sm shrink-0">{d.date}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* FAQ */}
              <div className="bg-[#14092a]/70 backdrop-blur border border-white/7 rounded-[2rem] p-7">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-primary/12 rounded-xl flex items-center justify-center">
                    <HelpCircle className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="text-white font-black text-base">الأسئلة الشائعة</h3>
                </div>
                <div className="space-y-2">
                  {FAQ.map((item, i) => <Accordion key={i} q={item.q} a={item.a} />)}
                </div>
              </div>

              {/* Contact */}
              <div className="bg-[#14092a]/70 backdrop-blur border border-white/7 rounded-[2rem] p-7">
                <h3 className="text-white font-black text-base mb-5">التواصل مع فريق حكايتي</h3>
                <a
                  href="mailto:hekayatysupport@gmail.com"
                  className="flex items-center gap-4 bg-primary/6 hover:bg-primary/12 border border-primary/18 hover:border-primary/30 rounded-2xl p-5 transition-all group"
                >
                  <div className="w-12 h-12 bg-primary/15 rounded-2xl flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-white/35 text-[10px] font-bold uppercase tracking-widest mb-1">البريد الإلكتروني</p>
                    <p className="text-white font-bold group-hover:text-primary transition-colors">hekayatysupport@gmail.com</p>
                    <p className="text-white/25 text-xs mt-0.5">الرد خلال 24 ساعة عمل</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-primary/40 mr-auto group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center text-white/12 text-xs pb-4">
          جوائز حكايتي 2026 — جميع الحقوق محفوظة
        </p>
      </div>
    </div>
  );
}
