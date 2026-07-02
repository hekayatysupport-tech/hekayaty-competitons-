import { useEffect, useState } from 'react';
import { useLocation, Link } from 'wouter';
import { Registration } from '@/hooks/useRegistrations';
import { generateReceiptPDF } from '@/lib/pdf';
import { motion } from 'framer-motion';
import { Download, LayoutDashboard, Copy, Check } from 'lucide-react';
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
    <div className="min-h-[calc(100vh-80px)] py-16 px-4 relative flex items-center justify-center overflow-hidden bg-background">
      
      {/* Confetti simulation using CSS keyframes would go here, 
          for now using framer motion floating particles for celebration effect */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-3 h-3 rounded-sm ${i % 2 === 0 ? 'bg-primary' : 'bg-accent'} opacity-40`}
            initial={{ 
              top: '100%', 
              left: `${Math.random() * 100}%`,
              rotate: 0 
            }}
            animate={{ 
              top: '-10%', 
              rotate: 360 * (Math.random() > 0.5 ? 1 : -1) 
            }}
            transition={{ 
              duration: Math.random() * 3 + 2, 
              ease: "easeOut",
              delay: Math.random() * 0.5
            }}
          />
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: 'spring', bounce: 0.4 }}
        className="w-full max-w-2xl relative z-10"
      >
        <div className="bg-white rounded-[2.5rem] p-8 md:p-14 text-center luxury-shadow relative overflow-hidden border border-black/5">
          
          <div className="absolute top-0 left-0 w-full h-3 gold-gradient" />

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', bounce: 0.6 }}
            className="w-28 h-28 mx-auto mb-8 relative"
          >
            <svg viewBox="0 0 100 100" className="w-full h-full text-emerald-500 overflow-visible">
              <circle cx="50" cy="50" r="45" fill="currentColor" fillOpacity="0.1" />
              <motion.path 
                d="M30 50 L45 65 L70 35" 
                fill="transparent" 
                strokeWidth="8" 
                stroke="currentColor" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
              />
            </svg>
          </motion.div>

          <h1 className="text-4xl font-black mb-4 text-foreground">اكتمل التسجيل!</h1>
          <p className="text-muted-foreground text-lg mb-10 max-w-md mx-auto leading-relaxed">
            مرحباً بك في عالم حكايتي. لقد تم استلام طلبك بنجاح. احتفظ بكود التسجيل التالي لمتابعة حالة طلبك.
          </p>

          <div className="bg-background border border-black/5 rounded-3xl p-8 mb-10 relative">
            <p className="text-sm text-muted-foreground uppercase tracking-widest mb-4 font-bold">كود التسجيل</p>
            <div className="flex justify-center gap-1 dir-ltr mb-4">
              {registration.code.split('').map((char, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + (index * 0.05) }}
                  className="text-4xl md:text-5xl font-black font-serif gold-text tracking-tight"
                >
                  {char}
                </motion.span>
              ))}
            </div>
            <button 
              onClick={handleCopyCode}
              className="absolute top-4 left-4 p-2.5 rounded-xl bg-white border border-black/5 hover:bg-gray-50 text-muted-foreground transition-all shadow-sm active:scale-95"
              title="نسخ الكود"
            >
              {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>

          <div className="bg-background rounded-2xl border border-black/5 overflow-hidden mb-10 text-right text-sm">
            <div className="grid grid-cols-2 p-4 border-b border-black/5 bg-white">
              <span className="text-muted-foreground">اسم الكاتب</span>
              <span className="font-bold text-foreground">{registration.name}</span>
            </div>
            <div className="grid grid-cols-2 p-4 border-b border-black/5">
              <span className="text-muted-foreground">العمل الأدبي</span>
              <span className="font-bold text-foreground font-serif">{registration.storyName}</span>
            </div>
            <div className="grid grid-cols-2 p-4 bg-white">
              <span className="text-muted-foreground">حالة الطلب</span>
              <span className="font-bold text-amber-500 flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                </span>
                قيد المراجعة
              </span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <button 
              onClick={handleDownloadPDF}
              className="py-4 border-2 border-primary text-primary font-bold rounded-2xl transition-all flex items-center justify-center gap-2 hover:bg-primary/5 active:scale-95"
            >
              <Download className="w-5 h-5" />
              تحميل الإيصال
            </button>
            <Link 
              href="/dashboard"
              className="py-4 gold-gradient text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              <LayoutDashboard className="w-5 h-5" />
              الذهاب للوحة التحكم
            </Link>
          </div>
          
        </div>
      </motion.div>
    </div>
  );
}
