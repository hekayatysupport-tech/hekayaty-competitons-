import { useEffect, useState } from 'react';
import { useLocation, Link } from 'wouter';
import { Registration } from '@/hooks/useRegistrations';
import { generateReceiptPDF } from '@/lib/pdf';
import { motion } from 'framer-motion';
import { CheckCircle2, Download, LayoutDashboard, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

export function SuccessPage() {
  const [, setLocation] = useLocation();
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get('code');

    if (!code) {
      setLocation('/');
      return;
    }

    // Read directly from localStorage to avoid depending on unstable function references
    let regs: Registration[] = [];
    try {
      regs = JSON.parse(localStorage.getItem('hekayaty_registrations') || '[]');
    } catch {
      regs = [];
    }
    const reg = regs.find(r => r.code === code) ?? null;

    if (!reg) {
      setLocation('/');
      return;
    }

    setRegistration(reg);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!registration) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(registration.code);
    setCopied(true);
    toast.success('تم نسخ كود التسجيل');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = () => {
    generateReceiptPDF(registration);
    toast.success('بدأ تحميل الإيصال');
  };

  return (
    <div className="min-h-[calc(100vh-80px)] py-12 px-4 relative flex items-center justify-center">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-[500px] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring', bounce: 0.4 }}
        className="w-full max-w-2xl relative z-10"
      >
        <div className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 text-center shadow-2xl relative overflow-hidden">
          
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-green-500/50 to-transparent" />

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
            className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </motion.div>

          <h1 className="text-4xl font-bold mb-4">تم التسجيل بنجاح ✅</h1>
          <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
            مرحباً بك في عالم حكايتي. لقد تم استلام طلبك وهو الآن قيد المراجعة. احتفظ بكود التسجيل التالي للرجوع إليه لاحقاً.
          </p>

          <div className="bg-black/50 border border-primary/30 rounded-2xl p-8 mb-8 relative group">
            <p className="text-sm text-primary/80 uppercase tracking-widest mb-3">كود التسجيل الخاص بك</p>
            <div className="text-4xl md:text-5xl font-black font-serif text-transparent bg-clip-text bg-gradient-to-r from-[#c9a84c] to-[#f0c76e] tracking-widest mb-4 dir-ltr">
              {registration.code}
            </div>
            <button 
              onClick={handleCopyCode}
              className="absolute top-4 left-4 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
              title="نسخ الكود"
            >
              {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
            </button>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-sm font-medium">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              حالة الدفع: قيد المراجعة
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <button 
              onClick={handleDownloadPDF}
              className="py-4 border border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              تحميل الإيصال
            </button>
            <Link 
              href="/dashboard"
              className="py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl transition-all flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(201,168,76,0.3)]"
            >
              <LayoutDashboard className="w-5 h-5" />
              عرض لوحة التحكم
            </Link>
          </div>
          
        </div>
      </motion.div>
    </div>
  );
}
