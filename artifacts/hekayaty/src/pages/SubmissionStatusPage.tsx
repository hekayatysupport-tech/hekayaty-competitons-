import { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation } from 'wouter';
import { useRegistrations, Registration, RegistrationStatus } from '@/hooks/useRegistrations';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, Clock, XCircle, AlertTriangle, Upload, FileText,
  CreditCard, Star, RefreshCw, Copy, Check, ChevronRight,
  BookOpen, Calendar, Package, User, Feather, HelpCircle, Mail,
  ShieldCheck, Award, MessageSquare, Sparkles, FileCheck2, Loader2
} from 'lucide-react';
import { toast } from 'sonner';

/* ── helpers ──────────────────────────────────────────────────────────────── */

function getPaymentInfo(status: RegistrationStatus) {
  if (['Payment Verified','Waiting For Novel Upload','Novel Uploaded','Sent To Telegram',
       'Submission Completed','Under Review','Approved'].includes(status))
    return { label: 'تم التحقق', sublabel: 'تم التحقق من دفعتك بنجاح', color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/8', glow: 'shadow-[0_0_30px_rgba(52,211,153,0.15)]', icon: CheckCircle2, dot: 'bg-emerald-400' };
  if (['Payment Submitted','Information Completed','Waiting For Payment'].includes(status))
    return { label: 'في انتظار التحقق', sublabel: 'سيتم مراجعة الدفعة خلال 3-5 أيام', color: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/8', glow: '', icon: Clock, dot: 'bg-amber-400' };
  if (status === 'Rejected')
    return { label: 'مرفوض', sublabel: 'تواصل مع الإدارة لمعرفة السبب', color: 'text-rose-400', border: 'border-rose-500/30', bg: 'bg-rose-500/8', glow: '', icon: XCircle, dot: 'bg-rose-400' };
  return { label: 'لم يُقدَّم بعد', sublabel: 'لم يتم تقديم إثبات الدفع', color: 'text-white/30', border: 'border-white/10', bg: 'bg-white/5', glow: '', icon: Clock, dot: 'bg-white/20' };
}

function getNovelInfo(status: RegistrationStatus) {
  if (['Novel Uploaded','Sent To Telegram','Submission Completed','Under Review','Approved'].includes(status))
    return { label: 'تم الرفع بنجاح', sublabel: 'الرواية وصلت للجنة التحكيم', color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/8', icon: FileCheck2, dot: 'bg-emerald-400' };
  if (['Waiting For Novel Upload','Payment Submitted','Payment Verified','Needs Attention'].includes(status))
    return { label: 'في انتظار الرفع', sublabel: 'قم برفع ملف روايتك الآن', color: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/8', icon: Upload, dot: 'bg-amber-400' };
  return { label: 'لم يُرفع بعد', sublabel: 'ستتمكن من الرفع بعد تأكيد الدفع', color: 'text-white/30', border: 'border-white/10', bg: 'bg-white/5', icon: FileText, dot: 'bg-white/20' };
}

function getReviewInfo(status: RegistrationStatus) {
  if (status === 'Approved') return { label: 'مقبول', sublabel: 'تهانينا! تم قبول عملك', color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/8', icon: Award, dot: 'bg-emerald-400' };
  if (status === 'Rejected') return { label: 'مرفوض', sublabel: 'لم يُقبل العمل في هذه الدورة', color: 'text-rose-400', border: 'border-rose-500/30', bg: 'bg-rose-500/8', icon: XCircle, dot: 'bg-rose-400' };
  if (status === 'Needs Attention') return { label: 'يحتاج تصحيح', sublabel: 'تحقق من رسالة الإدارة', color: 'text-orange-400', border: 'border-orange-500/30', bg: 'bg-orange-500/8', icon: AlertTriangle, dot: 'bg-orange-400' };
  if (['Under Review','Novel Uploaded','Sent To Telegram','Submission Completed'].includes(status))
    return { label: 'قيد المراجعة', sublabel: 'اللجنة تراجع عملك حالياً', color: 'text-primary', border: 'border-primary/30', bg: 'bg-primary/8', icon: BookOpen, dot: 'bg-primary' };
  return { label: 'لم تبدأ بعد', sublabel: 'ستبدأ بعد اكتمال الرفع', color: 'text-white/30', border: 'border-white/10', bg: 'bg-white/5', icon: Clock, dot: 'bg-white/20' };
}

function getDecisionInfo(status: RegistrationStatus) {
  if (status === 'Approved') return { label: 'مقبول 🏆', sublabel: 'تهانينا! أنت من الفائزين', color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/8', icon: Star, dot: 'bg-emerald-400' };
  if (status === 'Rejected') return { label: 'غير مقبول', sublabel: 'نتمنى لك حظاً أوفر في الدورة القادمة', color: 'text-rose-400', border: 'border-rose-500/30', bg: 'bg-rose-500/8', icon: XCircle, dot: 'bg-rose-400' };
  if (status === 'Needs Attention') return { label: 'يحتاج مراجعة', sublabel: 'يرجى اتخاذ الإجراء المطلوب', color: 'text-orange-400', border: 'border-orange-500/30', bg: 'bg-orange-500/8', icon: AlertTriangle, dot: 'bg-orange-400' };
  return { label: 'قيد الانتظار', sublabel: 'سيتم الإعلان عند انتهاء المراجعة', color: 'text-white/30', border: 'border-white/10', bg: 'bg-white/5', icon: Clock, dot: 'bg-white/20' };
}

function getTimelineStep(status: RegistrationStatus): number {
  if (['Approved', 'Rejected'].includes(status)) return 5;
  if (status === 'Under Review') return 4;
  if (['Novel Uploaded', 'Sent To Telegram', 'Submission Completed'].includes(status)) return 3;
  if (['Payment Submitted', 'Payment Verified', 'Waiting For Novel Upload', 'Needs Attention'].includes(status)) return 2;
  if (status === 'Information Completed') return 1;
  return 0;
}

function canUploadNovel(status: RegistrationStatus) {
  return ['Payment Submitted', 'Payment Verified', 'Waiting For Novel Upload', 'Needs Attention'].includes(status);
}

const TIMELINE_STEPS = [
  { key: 'reg', label: 'اكتمال التسجيل', desc: 'تم تسجيل بياناتك بنجاح', icon: CheckCircle2 },
  { key: 'pay', label: 'تسليم إثبات الدفع', desc: 'تم استلام إثبات الدفع', icon: CreditCard },
  { key: 'novel', label: 'رفع الرواية', desc: 'تم تسليم الرواية للجنة', icon: Upload },
  { key: 'review', label: 'قيد المراجعة', desc: 'اللجنة تراجع طلبك', icon: BookOpen },
  { key: 'jury', label: 'تقييم لجنة التحكيم', desc: 'مرحلة التقييم النهائية', icon: Award },
  { key: 'decision', label: 'القرار النهائي', desc: 'إعلان نتائج المسابقة', icon: Star },
];

/* ── sub-components ───────────────────────────────────────────────────────── */

function StatusCard({ icon: Icon, title, info, delay, action }: { icon: any; title: string; info: any; delay: number; action?: { label: string; onClick: () => void } }) {
  const InfoIcon = info.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`rounded-2xl border p-6 flex flex-col gap-3 ${info.bg} ${info.border} ${info.glow ?? ''}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-white/40">
          <Icon className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-widest">{title}</span>
        </div>
        <span className={`w-2.5 h-2.5 rounded-full ${info.dot} shadow-[0_0_8px_currentColor]`} />
      </div>
      <div>
        <p className={`text-xl font-black ${info.color} leading-tight`}>{info.label}</p>
        <p className="text-white/30 text-xs mt-1 leading-relaxed">{info.sublabel}</p>
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-1 flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 transition-colors"
        >
          {action.label} <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
    </motion.div>
  );
}

/* ── main component ───────────────────────────────────────────────────────── */

export function SubmissionStatusPage() {
  const [, setLocation] = useLocation();
  const { getByCode } = useRegistrations();
  const [reg, setReg] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);

  const searchParams = new URLSearchParams(window.location.search);
  const code = searchParams.get('code');

  const load = useCallback(async () => {
    if (!code) { setLocation('/'); return; }
    const data = await getByCode(code);
    if (!data) { setLocation('/'); return; }
    setReg(data);
    setLoading(false);
  }, [code]);

  useEffect(() => { load(); }, [load]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
    toast.success('تم تحديث الحالة');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(reg?.code || '');
    setCopied(true);
    toast.success('تم نسخ الكود');
    setTimeout(() => setCopied(false), 2000);
  };

  // Celebration particles for Approved
  const particles = useMemo(() =>
    Array.from({ length: 20 }).map(() => {
      const angle = Math.random() * Math.PI * 2;
      const d = Math.random() * 220 + 80;
      return { x: Math.cos(angle) * d, y: Math.sin(angle) * d, size: Math.random() * 5 + 2, isGold: Math.random() > 0.4, delay: Math.random() * 0.6, dur: Math.random() * 2.5 + 1.5 };
    }), []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center section-dark">
      <div className="text-center">
        <div className="w-16 h-16 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/40 font-medium">جاري تحميل بيانات تسجيلك...</p>
      </div>
    </div>
  );

  if (!reg) return null;

  const status = reg.registrationStatus;
  const timelineStep = getTimelineStep(status);
  const payInfo = getPaymentInfo(status);
  const novelInfo = getNovelInfo(status);
  const reviewInfo = getReviewInfo(status);
  const decisionInfo = getDecisionInfo(status);
  const canUpload = canUploadNovel(status);
  const packageLabel = reg.packageType === 'package_a' ? 'الباقة الفردية (100 ج.م)' : 'الباقة المتعددة (150 ج.م)';

  return (
    <div className="min-h-[calc(100vh-80px)] py-12 px-4 relative section-dark overflow-hidden font-sans" dir="rtl">
      {/* Background */}
      <div className="absolute inset-0 bg-[#0A0503]" />
      <div className="absolute inset-0 aurora-bg opacity-15 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-primary/4 blur-[150px] rounded-full pointer-events-none" />

      {/* Approval Celebration */}
      <AnimatePresence>
        {status === 'Approved' && (
          <div className="fixed top-1/2 left-1/2 pointer-events-none z-0">
            {particles.map((p, i) => (
              <motion.div key={i} className="absolute rounded-full"
                style={{ backgroundColor: p.isGold ? '#C9A84C' : '#7c3aed', width: p.size, height: p.size }}
                animate={{ x: [0, p.x], y: [0, p.y], opacity: [0, 1, 0], scale: [0, 1.2, 0] }}
                transition={{ duration: p.dur, delay: p.delay + i * 0.08, repeat: Infinity, repeatDelay: 4 }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto relative z-10 space-y-5"
      >
        {/* ── Hero Header ── */}
        <div className="bg-[#14092a]/90 backdrop-blur-xl border border-primary/20 rounded-[2rem] overflow-hidden shadow-[0_20px_70px_rgba(0,0,0,0.6)]">
          <div className="h-1 w-full gold-gradient" />
          <div className="p-6 md:p-8">
            {/* Top row */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-7">
              <div>
                <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/25 rounded-full px-4 py-1.5 mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span className="text-primary text-xs font-bold tracking-widest uppercase">Hekayaty Awards 2026</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-white font-serif leading-tight">مركز متابعة التسليم</h1>
                <p className="text-white/40 text-sm mt-2">صفحتك الرسمية لمتابعة حالة مشاركتك في المسابقة</p>
              </div>
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-white/50 hover:text-white text-sm font-bold transition-all shrink-0 self-start"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'يتم التحديث...' : 'تحديث الحالة'}
              </button>
            </div>

            {/* Registration Code */}
            <div className="flex items-center gap-4 bg-black/30 border border-primary/15 rounded-2xl p-5 mb-6">
              <div className="flex-1 min-w-0">
                <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">كود التسجيل</p>
                <p className="text-primary font-black font-mono text-2xl md:text-3xl tracking-widest" dir="ltr">{reg.code}</p>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 border border-primary/25 rounded-xl px-4 py-2.5 text-primary text-sm font-bold transition-all shrink-0"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'تم النسخ' : 'نسخ'}
              </button>
            </div>

            {/* Participant Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { icon: User, label: 'المشارك', val: reg.name },
                { icon: Feather, label: 'الاسم المستعار', val: reg.penName || '—' },
                { icon: Package, label: 'الباقة', val: packageLabel },
                { icon: Calendar, label: 'تاريخ التسجيل', val: new Date(reg.registeredAt).toLocaleDateString('ar-EG') },
                { icon: BookOpen, label: 'عدد الأعمال', val: `${reg.stories.length} أعمال أدبية` },
                { icon: Award, label: 'الدورة', val: 'جوائز حكايتي 2026' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className="bg-white/4 border border-white/8 rounded-xl p-4"
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    {item.icon && <item.icon className="w-3 h-3 text-primary/60" />}
                    <p className="text-white/30 text-[10px] font-bold uppercase tracking-wider">{item.label}</p>
                  </div>
                  <p className="text-white font-bold text-sm leading-tight">{item.val}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Admin Message Banner ── */}
        <AnimatePresence>
          {reg.adminNotes && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`border rounded-2xl p-6 ${
                status === 'Approved' ? 'bg-emerald-500/8 border-emerald-500/35' :
                status === 'Rejected' ? 'bg-rose-500/8 border-rose-500/35' :
                status === 'Needs Attention' ? 'bg-orange-500/8 border-orange-500/35' :
                'bg-primary/8 border-primary/35'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  status === 'Approved' ? 'bg-emerald-500/20' :
                  status === 'Rejected' ? 'bg-rose-500/20' :
                  status === 'Needs Attention' ? 'bg-orange-500/20' : 'bg-primary/20'
                }`}>
                  <MessageSquare className={`w-5 h-5 ${
                    status === 'Approved' ? 'text-emerald-400' :
                    status === 'Rejected' ? 'text-rose-400' :
                    status === 'Needs Attention' ? 'text-orange-400' : 'text-primary'
                  }`} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <p className="text-white/50 text-xs font-bold uppercase tracking-widest">تحديثات المسابقة — رسالة الإدارة</p>
                    <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                      status === 'Approved' ? 'bg-emerald-400' :
                      status === 'Rejected' ? 'bg-rose-400' :
                      status === 'Needs Attention' ? 'bg-orange-400' : 'bg-primary'
                    }`} />
                  </div>
                  <p className="text-white font-medium leading-relaxed text-sm">{reg.adminNotes}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── 4 Status Cards ── */}
        <div>
          <h2 className="text-white/40 text-xs font-bold uppercase tracking-[0.2em] mb-4 px-1">حالة الطلب التفصيلية</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <StatusCard
              icon={CreditCard} title="حالة الدفع" info={payInfo} delay={0.05}
            />
            <StatusCard
              icon={Upload} title="تسليم الرواية" info={novelInfo} delay={0.10}
              action={canUpload ? { label: 'رفع الرواية الآن', onClick: () => setLocation(`/upload-submission?code=${reg.code}`) } : undefined}
            />
            <StatusCard
              icon={BookOpen} title="حالة المراجعة" info={reviewInfo} delay={0.15}
            />
            <StatusCard
              icon={Star} title="القرار النهائي" info={decisionInfo} delay={0.20}
            />
          </div>
        </div>

        {/* ── Competition Progress Timeline ── */}
        <div className="bg-[#14092a]/80 backdrop-blur border border-white/8 rounded-[2rem] p-7 md:p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-primary/15 rounded-xl flex items-center justify-center">
              <Star className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-white font-black text-lg">مسار المشاركة</h2>
          </div>
          <div className="space-y-0">
            {TIMELINE_STEPS.map((step, i) => {
              const done = i < timelineStep;
              const current = i === timelineStep;
              const StepIcon = step.icon;
              return (
                <div key={step.key} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: i * 0.08 }}
                      className={`w-9 h-9 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                        done ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.5)]' :
                        current ? 'bg-primary/20 border-primary shadow-[0_0_18px_rgba(201,168,76,0.5)] animate-pulse' :
                        'bg-white/4 border-white/12'
                      }`}
                    >
                      {done ? <CheckCircle2 className="w-4 h-4 text-white" /> :
                       current ? <div className="w-2.5 h-2.5 bg-primary rounded-full" /> :
                       <StepIcon className="w-4 h-4 text-white/15" />}
                    </motion.div>
                    {i < TIMELINE_STEPS.length - 1 && (
                      <div className={`w-0.5 h-10 mt-1 rounded-full transition-all duration-700 ${done ? 'bg-emerald-500/50' : 'bg-white/8'}`} />
                    )}
                  </div>
                  <div className="pb-8 pt-1">
                    <p className={`font-bold text-sm leading-tight ${done ? 'text-emerald-400' : current ? 'text-primary' : 'text-white/25'}`}>
                      {step.label}
                    </p>
                    {(done || current) && (
                      <p className="text-white/30 text-xs mt-0.5">{step.desc}</p>
                    )}
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

        {/* ── Uploaded Novels Details ── */}
        <div className="bg-[#14092a]/80 backdrop-blur border border-white/8 rounded-[2rem] p-7 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-primary/15 rounded-xl flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-white font-black text-lg">الأعمال المُقدَّمة</h2>
          </div>
          <div className="space-y-3">
            {reg.stories.map((story, i) => {
              const uploaded = story.upload_status === 'sent';
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`border rounded-2xl p-5 transition-all ${uploaded ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-white/4 border-white/8'}`}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-bold text-base font-serif leading-tight">{story.title}</h3>
                      <p className="text-white/40 text-xs mt-1">{story.category}</p>
                    </div>
                    <span className={`shrink-0 flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${
                      uploaded ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' : 'bg-amber-500/15 text-amber-400 border-amber-500/25'
                    }`}>
                      {uploaded ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {uploaded ? 'تم الرفع' : 'في انتظار الرفع'}
                    </span>
                  </div>
                  {uploaded && story.file_name && (
                    <div className="flex flex-wrap gap-3 pt-3 border-t border-white/6 text-xs text-white/30">
                      <span className="flex items-center gap-1.5"><FileText className="w-3 h-3 text-primary/50" />{story.file_name}</span>
                      {story.file_size && <span className="flex items-center gap-1">{(story.file_size / 1024 / 1024).toFixed(2)} MB</span>}
                      <span className="flex items-center gap-1 text-emerald-400/60"><ShieldCheck className="w-3 h-3" />تم الإرسال للجنة</span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="space-y-3">
          {canUpload && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setLocation(`/upload-submission?code=${reg.code}`)}
              className="w-full py-5 gold-gradient text-primary-foreground font-black text-lg rounded-2xl shadow-[0_8px_30px_rgba(201,168,76,0.35)] hover:shadow-[0_8px_40px_rgba(201,168,76,0.5)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 shimmer-button"
            >
              <Upload className="w-5 h-5" />
              رفع الرواية الآن
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          )}

          <button
            onClick={() => setLocation(`/dashboard?code=${reg.code}`)}
            className="w-full py-4 bg-primary/10 hover:bg-primary/20 border border-primary/25 hover:border-primary/40 text-primary font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
          >
            الانتقال للوحة التحكم الشخصية
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="grid grid-cols-2 gap-3">
            <a
              href="mailto:hekayatysupport@gmail.com"
              className="py-4 bg-white/5 hover:bg-white/8 border border-white/8 text-white/50 hover:text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 text-sm"
            >
              <Mail className="w-4 h-4" />
              تواصل مع الدعم
            </a>
            <button
              onClick={handleRefresh}
              className="py-4 bg-white/5 hover:bg-white/8 border border-white/8 text-white/50 hover:text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 text-sm"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              تحديث الحالة
            </button>
          </div>
        </div>

        <p className="text-center text-white/15 text-xs pb-4">
          جوائز حكايتي 2026 — يتم تحديث الحالة تلقائياً عند اتخاذ أي إجراء من قِبل الإدارة
        </p>
      </motion.div>
    </div>
  );
}
