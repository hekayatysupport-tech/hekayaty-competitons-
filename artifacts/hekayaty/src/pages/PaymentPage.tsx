import { useEffect, useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { useRegistrations } from '@/hooks/useRegistrations';
import { motion } from 'framer-motion';
import { CreditCard, ShieldCheck, Lock, ArrowRight, Wallet } from 'lucide-react';
import { toast } from 'sonner';

export function PaymentPage() {
  const [location, setLocation] = useLocation();
  const { getPending, completeRegistration } = useRegistrations();
  const [isProcessing, setIsProcessing] = useState(false);
  const pendingData = getPending();

  useEffect(() => {
    if (!pendingData) {
      setLocation('/register');
    }
  }, [pendingData, setLocation]);

  if (!pendingData) return null;

  const handlePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const newReg = completeRegistration();
      if (newReg) {
        setLocation(`/success?code=${newReg.code}`);
      } else {
        toast.error("حدث خطأ أثناء إتمام التسجيل. يرجى المحاولة مرة أخرى.");
        setIsProcessing(false);
      }
    }, 2000);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] py-16 px-4 relative flex items-center justify-center section-dark overflow-hidden">
      
      {/* Background Atmosphere */}
      <div className="absolute inset-0 aurora-bg opacity-40 pointer-events-none" />
      
      {/* Volumetric light rays */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex justify-center">
        {[...Array(6)].map((_, i) => (
          <div key={`ray-${i}`} className="light-ray absolute top-0 h-full w-[1px] bg-gradient-to-b from-transparent via-primary/30 to-transparent"
            style={{ left: `${20 + i * 12}%`, opacity: 0.04 + i * 0.02, animationDelay: `${i * 0.5}s` }} />
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-5xl grid md:grid-cols-5 gap-8 relative z-10"
      >
        
        {/* Order Summary */}
        <div className="md:col-span-2 space-y-6 order-2 md:order-1">
          <div className="glass-card rounded-[2rem] p-8 luxury-shadow relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 gold-gradient" />
            
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 blur-3xl rounded-full" />
            
            <h3 className="text-xl font-bold mb-8 flex items-center gap-3 text-foreground">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-primary" />
              </div>
              ملخص التسجيل
            </h3>
            
            <div className="space-y-5 text-sm relative z-10">
              <div className="flex justify-between text-muted-foreground border-b border-primary/10 pb-4">
                <span>اسم الكاتب</span>
                <span className="text-foreground font-bold">{pendingData.name}</span>
              </div>
              <div className="flex justify-between text-muted-foreground border-b border-primary/10 pb-4">
                <span>اسم القصة</span>
                <span className="text-foreground font-bold font-serif">{pendingData.storyName}</span>
              </div>
              <div className="flex justify-between text-muted-foreground pb-2">
                <span>التصنيف</span>
                <span className="text-primary font-bold bg-primary/10 px-3 py-1 rounded-full text-xs">{pendingData.category}</span>
              </div>
              
              <div className="pt-6 border-t border-white/5 mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-muted-foreground">رسوم التسجيل</span>
                  <span className="text-foreground font-bold">150 ج.م</span>
                </div>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>رسوم إدارية</span>
                  <span>0 ج.م</span>
                </div>
              </div>
              
              <div className="pt-8 mt-4 flex flex-col items-center">
                <span className="text-sm text-primary/60 mb-2 uppercase tracking-widest font-bold">الإجمالي المطلوب</span>
                <span className="text-6xl font-black gold-text font-serif dir-ltr drop-shadow-md">150 EGP</span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => setLocation('/register')}
            className="w-full flex items-center justify-center gap-2 py-4 text-muted-foreground hover:text-foreground font-bold transition-colors glass-card-light rounded-2xl hover:border-primary/30"
          >
            <ArrowRight className="w-4 h-4" />
            العودة لتعديل البيانات
          </button>
        </div>

        {/* Payment Main Form */}
        <div className="md:col-span-3 order-1 md:order-2">
          <div className="glass-card rounded-[2rem] p-8 md:p-10 luxury-shadow relative h-full">
            <div className="flex items-center gap-5 mb-10 border-b border-white/5 pb-8">
              <div className="w-16 h-16 rounded-full border border-primary/30 bg-primary/10 flex items-center justify-center text-primary glow-gold">
                <CreditCard className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-foreground font-sans">الدفع الإلكتروني</h2>
                <div className="flex items-center gap-3 mt-3">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md" style={{ boxShadow: '0 0 10px rgba(52,211,153,0.2)' }}>
                    <ShieldCheck className="w-4 h-4" /> آمن ومشفر
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">مدعوم بـ Paymob</span>
                </div>
              </div>
            </div>

            {/* Fake Paymob Card UI */}
            <div className="space-y-8">
              <div className="bg-gradient-to-br from-[#1c1236] to-[#1a1710] border border-accent/30 rounded-[2rem] p-8 relative overflow-hidden shadow-[inset_0_0_40px_rgba(148,90,255,0.05)]">
                
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 blur-[80px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />

                <div className="flex justify-between items-center mb-10 relative z-10">
                  <div className="font-serif tracking-widest text-accent font-bold text-sm">PAYMOB SECURE</div>
                  <div className="flex gap-2">
                    <div className="w-10 h-6 bg-accent/40 rounded-md backdrop-blur-sm" />
                    <div className="w-10 h-6 bg-primary/40 rounded-md backdrop-blur-sm -ml-4 mix-blend-screen" />
                  </div>
                </div>

                <div className="space-y-6 relative z-10">
                  <div className="space-y-2">
                    <label className="text-xs text-foreground/70 font-bold uppercase tracking-wider">رقم البطاقة</label>
                    <input 
                      type="text" 
                      placeholder="0000 0000 0000 0000" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-foreground font-mono tracking-widest focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all placeholder:text-muted-foreground/30"
                      dir="ltr"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs text-foreground/70 font-bold uppercase tracking-wider">تاريخ الانتهاء</label>
                      <input 
                        type="text" 
                        placeholder="MM/YY" 
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-foreground font-mono tracking-widest focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all placeholder:text-muted-foreground/30 text-center"
                        dir="ltr"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-foreground/70 font-bold uppercase tracking-wider">رمز التحقق (CVV)</label>
                      <input 
                        type="password" 
                        placeholder="•••" 
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-foreground font-mono tracking-widest focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all placeholder:text-muted-foreground/30 text-center"
                        dir="ltr"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs text-foreground/70 font-bold uppercase tracking-wider">اسم حامل البطاقة</label>
                    <input 
                      type="text" 
                      placeholder="الاسم كما هو مطبوع على البطاقة" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all placeholder:text-muted-foreground/30"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 flex gap-4 text-sm text-primary font-medium items-start">
                <Lock className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  هذه واجهة محاكاة (Placeholder) لأغراض العرض. سيتم إنشاء كود التسجيل الخاص بك فور الضغط على الزر أدناه.
                </p>
              </div>

              <button 
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full py-6 gold-gradient text-primary-foreground font-bold text-xl rounded-2xl shadow-[0_8px_30px_rgba(201,168,76,0.3)] hover:glow-gold transition-all flex items-center justify-center gap-3 hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 shimmer-button"
              >
                {isProcessing ? (
                  <div className="w-6 h-6 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <>
                    تأكيد الدفع (150 ج.م)
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
