import { useEffect, useState, useMemo } from 'react';
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

  const handleCopyCode = () => {
    navigator.clipboard.writeText(registration?.code || '');
    setCopied(true);
    toast.success('تم نسخ كود التسجيل');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = () => {
    if (registration) {
      generateReceiptPDF(registration);
      toast.success('بدأ تحميل الإيصال');
    }
  };

  const particles = useMemo(() => Array.from({ length: 40 }).map(() => {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 300 + 100;
    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      size: Math.random() * 6 + 2,
      isGold: Math.random() > 0.4,
      delay: Math.random() * 0.5,
      duration: Math.random() * 2 + 1.5
    };
  }), []);

  if (!registration) return null;

  return (
    <div className="min-h-[calc(100vh-80px)] py-16 px-4 relative flex items-center justify-center overflow-hidden section-dark">
      
      {/* Background Celebration Atmosphere */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-[800px] h-[800px] bg-primary/10 blur-[100px] rounded-full mix-blend-screen" />
      </div>
      
      {/* Radial light rays */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div 
            key={`burst-${i}`} 
            className="absolute w-[800px] h-[2px] bg-gradient-to-r from-transparent via-primary/20 to-transparent"
            style={{ transform: `rotate(${i * 45}deg)` }}
          />
        ))}
      </div>

      {/* Particle burst */}
      <div className="absolute top-1/2 left-1/2 pointer-events-none">
        {particles.map((p, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{ backgroundColor: p.isGold ? '#C9A84C' : '#9458FF', width: p.size, height: p.size }}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
            animate={{ x: p.x, y: p.y, opacity: [0, 1, 0], scale: [0, 1, 0.5] }}
            transition={{ duration: p.duration, delay: p.delay, ease: "easeOut" }}
          />
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, type: 'spring', bounce: 0.5 }}
        className="w-full max-w-2xl relative z-10"
      >
        <div className="glass-card rounded-[2.5rem] p-8 md:p-14 text-center luxury-shadow glow-gold relative overflow-hidden">
          
          <div className="absolute top-0 left-0 w-full h-2 gold-gradient" />

          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: 'spring', bounce: 0.6, duration: 0.8 }}
            className="w-32 h-32 mx-auto mb-10 relative flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full" />
            <svg viewBox="0 0 100 100" className="w-full h-full text-[#34d399] overflow-visible relative z-10 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]">
              <circle cx="50" cy="50" r="45" fill="rgba(52,211,153,0.15)" />
              <motion.path 
                d="M30 50 L45 65 L70 35" 
                fill="transparent" 
                strokeWidth="8" 
                stroke="currentColor" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
              />
            </svg>
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-black mb-6 gold-text font-serif">اكتمل التسجيل!</h1>
          <p className="text-muted-foreground text-lg mb-12 max-w-md mx-auto leading-relaxed">
            مرحباً بك في عالم حكايتي. لقد تم استلام طلبك بنجاح. احتفظ بكود التسجيل التالي لمتابعة حالة طلبك.
          </p>

          <div className="bg-[#0a0a0f] border border-primary/20 rounded-[2rem] p-8 mb-10 relative energy-border">
            <p className="text-sm text-primary/70 uppercase tracking-[0.2em] mb-4 font-bold">كود التسجيل</p>
            <div className="flex justify-center gap-2 dir-ltr mb-4">
              {registration.code.split('').map((char, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: 20, scale: 0.5 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 1 + (index * 0.05), type: 'spring' }}
                  className="text-4xl md:text-6xl font-black font-serif gold-text tracking-tight drop-shadow-[0_0_15px_rgba(201,168,76,0.3)]"
                >
                  {char}
                </motion.span>
              ))}
            </div>
            <button 
              onClick={handleCopyCode}
              className="absolute top-4 left-4 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:text-primary text-muted-foreground transition-all active:scale-95"
              title="نسخ الكود"
            >
              {copied ? <Check className="w-5 h-5 text-[#34d399]" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>

          <div className="bg-white/5 rounded-3xl border border-white/10 overflow-hidden mb-12 text-right text-sm">
            <div className="grid grid-cols-2 p-5 border-b border-white/5 bg-white/5">
              <span className="text-muted-foreground font-medium">اسم الكاتب</span>
              <span className="font-bold text-foreground">{registration.name}</span>
            </div>
            <div className="grid grid-cols-2 p-5 border-b border-white/5">
              <span className="text-muted-foreground font-medium">العمل الأدبي</span>
              <span className="font-bold text-foreground font-serif text-lg">{registration.storyName}</span>
            </div>
            <div className="grid grid-cols-2 p-5 bg-white/5">
              <span className="text-muted-foreground font-medium">حالة الطلب</span>
              <span className="font-bold text-amber-400 flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                </span>
                قيد المراجعة
              </span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <button 
              onClick={handleDownloadPDF}
              className="py-5 border border-primary/50 gold-text font-bold rounded-2xl transition-all flex items-center justify-center gap-3 hover:bg-primary/10 hover:border-primary active:scale-95"
            >
              <Download className="w-5 h-5 text-primary" />
              تحميل الإيصال
            </button>
            <Link 
              href="/dashboard"
              className="py-5 gold-gradient text-primary-foreground font-bold rounded-2xl transition-all flex items-center justify-center gap-3 shadow-[0_4px_20px_rgba(201,168,76,0.3)] hover:shadow-[0_4px_30px_rgba(201,168,76,0.5)] hover:-translate-y-1 shimmer-button"
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
