import { useEffect, useState, useMemo } from 'react';
import { useLocation, Link } from 'wouter';
import { Registration, RegistrationStatus } from '@/hooks/useRegistrations';
import { useRegistrations } from '@/hooks/useRegistrations';
import { generateReceiptPDF } from '@/lib/pdf';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, LayoutDashboard, Copy, Check, Clock, 
  CheckCircle, XCircle, AlertTriangle, Upload, 
  FileText, CreditCard, Star, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

// ──── helpers ──────────────────────────────────────────────────────────────

function getPaymentLabel(status: RegistrationStatus) {
  if (['Payment Verified', 'Waiting For Novel Upload', 'Novel Uploaded', 
       'Sent To Telegram', 'Submission Completed', 'Under Review', 'Approved'].includes(status))
    return { label: 'تم التحقق', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', icon: CheckCircle };
  if (['Payment Submitted', 'Information Completed'].includes(status))
    return { label: 'قيد المراجعة', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30', icon: Clock };
  if (status === 'Rejected')
    return { label: 'مرفوض', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30', icon: XCircle };
  if (status === 'Needs Attention')
    return { label: 'يحتاج مراجعة', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30', icon: AlertTriangle };
  return { label: 'لم يُقدَّم بعد', color: 'text-white/40', bg: 'bg-white/5 border-white/10', icon: Clock };
}

function getNovelLabel(status: RegistrationStatus) {
  if (['Novel Uploaded', 'Sent To Telegram', 'Submission Completed', 
       'Under Review', 'Approved'].includes(status))
    return { label: 'تم الرفع بنجاح', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', icon: CheckCircle };
  if (['Waiting For Novel Upload', 'Payment Submitted', 'Payment Verified'].includes(status))
    return { label: 'في انتظار الرفع', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30', icon: Upload };
  if (status === 'Needs Attention')
    return { label: 'يحتاج إجراء', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30', icon: AlertTriangle };
  return { label: 'لم يُرفع بعد', color: 'text-white/40', bg: 'bg-white/5 border-white/10', icon: FileText };
}

function getReviewLabel(status: RegistrationStatus) {
  if (status === 'Approved')
    return { label: 'مقبول ✓', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', icon: Star };
  if (status === 'Rejected')
    return { label: 'مرفوض', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30', icon: XCircle };
  if (status === 'Needs Attention')
    return { label: 'يحتاج تصحيح', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30', icon: AlertTriangle };
  if (['Under Review', 'Novel Uploaded', 'Sent To Telegram', 'Submission Completed'].includes(status))
    return { label: 'قيد المراجعة', color: 'text-primary', bg: 'bg-primary/10 border-primary/30', icon: Clock };
  return { label: 'لم تبدأ بعد', color: 'text-white/40', bg: 'bg-white/5 border-white/10', icon: Clock };
}

function canUploadNovel(status: RegistrationStatus) {
  return ['Payment Submitted', 'Payment Verified', 'Waiting For Novel Upload', 'Needs Attention'].includes(status);
}

function hasUploadedNovel(status: RegistrationStatus) {
  return ['Novel Uploaded', 'Sent To Telegram', 'Submission Completed', 'Under Review', 'Approved', 'Rejected'].includes(status);
}

// ──── component ─────────────────────────────────────────────────────────────

export function SuccessPage() {
  const [, setLocation] = useLocation();
  const { getByCode } = useRegistrations();
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const searchParams = new URLSearchParams(window.location.search);
  const code = searchParams.get('code');

  const loadReg = async () => {
    if (!code) { setLocation('/'); return; }
    const reg = await getByCode(code);
    if (!reg) { setLocation('/'); return; }
    setRegistration(reg);
  };

  useEffect(() => { loadReg(); }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadReg();
    setRefreshing(false);
    toast.success('تم تحديث الحالة');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(registration?.code || '');
    setCopied(true);
    toast.success('تم نسخ كود التسجيل');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = () => {
    if (registration) { generateReceiptPDF(registration); toast.success('بدأ تحميل الإيصال'); }
  };

  const particles = useMemo(() => Array.from({ length: 30 }).map(() => {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 250 + 80;
    return { x: Math.cos(angle) * distance, y: Math.sin(angle) * distance, size: Math.random() * 5 + 2, isGold: Math.random() > 0.4, delay: Math.random() * 0.5, duration: Math.random() * 2 + 1.5 };
  }), []);

  if (!registration) return null;

  const status = registration.registrationStatus;
  const paymentInfo  = getPaymentLabel(status);
  const novelInfo    = getNovelLabel(status);
  const reviewInfo   = getReviewLabel(status);
  const canUpload    = canUploadNovel(status);
  const alreadyUp    = hasUploadedNovel(status);

  const heroTitle = status === 'Approved' ? '🏆 مبروك! قبول رسمي' :
                    status === 'Rejected'  ? 'تعذّر قبول الطلب' :
                    alreadyUp              ? 'طلبك قيد المراجعة' :
                    canUpload              ? 'تم استلام إثبات الدفع!' :
                                            'تم التسجيل بنجاح!';

  const heroSub = status === 'Approved'
    ? 'تم قبول طلب مشاركتك رسمياً في جوائز حكايتي 2026. سنتواصل معك قريباً.'
    : status === 'Rejected'
    ? (registration.adminNotes || 'تعذّر قبول طلبك. يمكنك التواصل مع الإدارة لمعرفة التفاصيل.')
    : status === 'Needs Attention'
    ? (registration.adminNotes || 'يرجى مراجعة ملاحظات الإدارة أدناه واتخاذ الإجراء اللازم.')
    : alreadyUp
    ? 'شكراً لك! تم استلام روايتك وهي الآن قيد المراجعة من لجنة التحكيم.'
    : canUpload
    ? 'تم استلام إثبات الدفع. يمكنك الآن رفع روايتك في انتظار مراجعة الدفع.'
    : 'مرحباً بك! احتفظ بكود التسجيل أدناه لمتابعة حالة طلبك.';

  const StatusCard = ({ icon: Icon, label, info, step }: { icon: any; label: string; info: ReturnType<typeof getPaymentLabel>; step: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 + step * 0.1 }}
      className={`flex items-center justify-between p-4 rounded-2xl border ${info.bg}`}
    >
      <div className={`flex items-center gap-2 font-bold text-sm ${info.color}`}>
        <info.icon className="w-4 h-4 shrink-0" />
        {info.label}
      </div>
      <span className="text-white/60 text-sm font-medium">{label}</span>
    </motion.div>
  );

  return (
    <div className="min-h-[calc(100vh-80px)] py-16 px-4 relative flex items-center justify-center overflow-hidden section-dark font-sans">
      
      {/* Background */}
      <div className="absolute inset-0 bg-[#0A0503]" />
      <div className="absolute inset-0 aurora-bg opacity-30 pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-[700px] h-[700px] bg-primary/10 blur-[100px] rounded-full mix-blend-screen" />
      </div>

      {/* Particles */}
      <div className="absolute top-1/2 left-1/2 pointer-events-none">
        {particles.map((p, i) => (
          <motion.div key={i} className="absolute rounded-full"
            style={{ backgroundColor: p.isGold ? '#C9A84C' : '#9458FF', width: p.size, height: p.size }}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
            animate={{ x: p.x, y: p.y, opacity: [0, 1, 0], scale: [0, 1, 0.5] }}
            transition={{ duration: p.duration, delay: p.delay, ease: 'easeOut' }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, type: 'spring', bounce: 0.4 }}
        className="w-full max-w-2xl relative z-10"
      >
        <div className="bg-[#120B08] border border-primary/30 rounded-[2.5rem] shadow-[0_20px_50px_rgba(201,168,76,0.15)] glow-gold relative overflow-hidden energy-border">
          <div className="absolute top-0 left-0 w-full h-2 gold-gradient" />

          {/* Header */}
          <div className="px-8 pt-12 pb-8 text-center border-b border-white/5">
            {/* Success / Status Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', bounce: 0.6 }}
              className="w-24 h-24 mx-auto mb-8 relative flex items-center justify-center"
            >
              <div className={`absolute inset-0 blur-xl rounded-full ${status === 'Approved' ? 'bg-primary/30' : status === 'Rejected' ? 'bg-rose-500/20' : 'bg-emerald-500/20'}`} />
              {status === 'Approved' ? (
                <Star className="w-14 h-14 text-primary relative z-10 drop-shadow-[0_0_15px_rgba(201,168,76,0.6)]" />
              ) : status === 'Rejected' ? (
                <XCircle className="w-14 h-14 text-rose-400 relative z-10" />
              ) : (
                <svg viewBox="0 0 100 100" className="w-full h-full text-[#34d399] overflow-visible relative z-10 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]">
                  <circle cx="50" cy="50" r="45" fill="rgba(52,211,153,0.15)" />
                  <motion.path d="M30 50 L45 65 L70 35" fill="transparent" strokeWidth="8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, delay: 0.6 }} />
                </svg>
              )}
            </motion.div>

            <h1 className="text-3xl md:text-4xl font-black mb-4 gold-text font-serif">{heroTitle}</h1>
            <p className="text-white/65 text-base leading-relaxed max-w-md mx-auto">{heroSub}</p>

            {/* Admin Notes alert */}
            <AnimatePresence>
              {status === 'Needs Attention' && registration.adminNotes && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-300 text-sm text-right leading-relaxed">
                  <span className="font-bold block mb-1">ملاحظة من الإدارة:</span>
                  {registration.adminNotes}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="px-8 py-8 space-y-6">

            {/* Registration Code */}
            <div className="bg-black/30 border border-primary/20 rounded-[1.5rem] p-6 relative shadow-inner">
              <p className="text-xs text-primary/70 uppercase tracking-[0.2em] mb-3 font-bold text-center">كود التسجيل</p>
              <div className="flex justify-center gap-1.5 dir-ltr">
                {registration.code.split('').map((char, i) => (
                  <motion.span key={i}
                    initial={{ opacity: 0, y: 15, scale: 0.5 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.8 + i * 0.05, type: 'spring' }}
                    className="text-3xl md:text-5xl font-black font-serif text-white drop-shadow-[0_0_10px_rgba(201,168,76,0.3)]"
                  >{char}</motion.span>
                ))}
              </div>
              <button onClick={handleCopyCode}
                className="absolute top-4 left-4 p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:text-primary text-white/50 transition-all active:scale-95"
                title="نسخ الكود">
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Registration Info */}
            <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden text-right text-sm">
              <div className="grid grid-cols-2 p-4 border-b border-white/5">
                <span className="text-white/55">اسم الكاتب</span>
                <span className="font-bold text-white">{registration.name}</span>
              </div>
              <div className="grid grid-cols-2 p-4 border-b border-white/5 bg-white/[0.02]">
                <span className="text-white/55">الباقة</span>
                <span className="font-bold text-white">{registration.packageType === 'package_a' ? 'الباقة الأساسية' : 'الباقة المتقدمة'}</span>
              </div>
              <div className="grid grid-cols-2 p-4">
                <span className="text-white/55">الأعمال الأدبية</span>
                <span className="font-bold text-white font-serif">{registration.stories?.map(s => s.title).join('، ') || 'بدون عنوان'}</span>
              </div>
            </div>

            {/* Status Tracking Cards */}
            <div>
              <p className="text-xs text-primary/70 uppercase tracking-[0.2em] mb-3 font-bold text-right">حالة الطلب</p>
              <div className="space-y-2">
                <StatusCard step={0} icon={CreditCard}    label="حالة الدفع"     info={paymentInfo} />
                <StatusCard step={1} icon={Upload}        label="رفع الرواية"    info={novelInfo} />
                <StatusCard step={2} icon={Star}          label="المراجعة النهائية" info={reviewInfo} />
              </div>
            </div>

            {/* Prompt to upload after payment submitted */}
            <AnimatePresence>
              {canUpload && !alreadyUp && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm text-right leading-relaxed">
                  📩 <span className="font-bold">تم استلام إثبات الدفع بنجاح.</span> يمكنك الآن رفع روايتك بينما يقوم فريقنا بمراجعة الدفع.
                </motion.div>
              )}
            </AnimatePresence>

            {/* Refresh */}
            <button onClick={handleRefresh} disabled={refreshing}
              className="w-full py-3 flex items-center justify-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors font-medium">
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              تحديث الحالة
            </button>

            {/* Action Buttons */}
            <div className={`grid gap-4 pt-2 ${canUpload && !alreadyUp ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {canUpload && !alreadyUp ? (
                <>
                  <Link href={`/upload-submission?code=${registration.code}`}
                    className="py-5 gold-gradient text-primary-foreground font-bold rounded-2xl transition-all flex items-center justify-center gap-3 shadow-[0_4px_20px_rgba(201,168,76,0.3)] hover:shadow-[0_4px_30px_rgba(201,168,76,0.5)] hover:-translate-y-1 shimmer-button text-lg">
                    <Upload className="w-5 h-5" />
                    رفع الرواية الآن
                  </Link>
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={handleDownloadPDF}
                      className="py-4 border border-primary/40 gold-text font-bold rounded-2xl transition-all flex items-center justify-center gap-2 hover:bg-primary/10 active:scale-95 text-sm">
                      <Download className="w-4 h-4 text-primary" />
                      إيصال
                    </button>
                    <Link href={`/dashboard?code=${registration.code}`}
                      className="py-4 bg-white/5 text-white/70 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 hover:bg-white/10 hover:text-white text-sm">
                      <LayoutDashboard className="w-4 h-4" />
                      لوحتي
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <button onClick={handleDownloadPDF}
                    className="py-5 border border-primary/50 gold-text font-bold rounded-2xl transition-all flex items-center justify-center gap-3 hover:bg-primary/10 hover:border-primary active:scale-95">
                    <Download className="w-5 h-5 text-primary" />
                    تحميل الإيصال
                  </button>
                  <Link href={`/dashboard?code=${registration.code}`}
                    className="py-5 gold-gradient text-primary-foreground font-bold rounded-2xl transition-all flex items-center justify-center gap-3 shadow-[0_4px_20px_rgba(201,168,76,0.3)] hover:shadow-[0_4px_30px_rgba(201,168,76,0.5)] hover:-translate-y-1 shimmer-button">
                    <LayoutDashboard className="w-5 h-5" />
                    لوحة التحكم
                  </Link>
                </>
              )}
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
}
