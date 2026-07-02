import { useEffect, useState } from 'react';
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
    <div className="min-h-[calc(100vh-80px)] py-16 px-4 relative flex items-center justify-center bg-background">

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-5xl grid md:grid-cols-5 gap-8 relative z-10"
      >
        
        {/* Order Summary */}
        <div className="md:col-span-2 space-y-6 order-2 md:order-1">
          <div className="bg-white rounded-3xl p-8 luxury-shadow border-t-4 border-primary relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px]" />
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" />
              ملخص التسجيل
            </h3>
            
            <div className="space-y-5 text-sm relative z-10">
              <div className="flex justify-between text-muted-foreground border-b border-black/5 pb-4">
                <span>اسم الكاتب</span>
                <span className="text-foreground font-bold">{pendingData.name}</span>
              </div>
              <div className="flex justify-between text-muted-foreground border-b border-black/5 pb-4">
                <span>اسم القصة</span>
                <span className="text-foreground font-bold font-serif">{pendingData.storyName}</span>
              </div>
              <div className="flex justify-between text-muted-foreground pb-2">
                <span>التصنيف</span>
                <span className="text-foreground font-bold bg-background px-3 py-1 rounded-full text-xs">{pendingData.category}</span>
              </div>
              
              <div className="pt-6 border-t border-black/10 mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-muted-foreground">رسوم التسجيل</span>
                  <span className="text-foreground font-bold">150 ج.م</span>
                </div>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>رسوم إدارية</span>
                  <span>0 ج.م</span>
                </div>
              </div>
              
              <div className="pt-6 mt-4 flex flex-col items-center">
                <span className="text-sm text-muted-foreground mb-1 uppercase tracking-widest">الإجمالي المطلوب</span>
                <span className="text-5xl font-black gold-text font-serif dir-ltr">150 EGP</span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => setLocation('/register')}
            className="w-full flex items-center justify-center gap-2 py-4 text-muted-foreground hover:text-foreground font-medium transition-colors bg-white rounded-2xl border border-black/5 luxury-shadow"
          >
            <ArrowRight className="w-4 h-4" />
            العودة لتعديل البيانات
          </button>
        </div>

        {/* Payment Main Form */}
        <div className="md:col-span-3 order-1 md:order-2">
          <div className="bg-white rounded-3xl p-8 md:p-10 luxury-shadow relative overflow-hidden h-full">
            <div className="flex items-center gap-4 mb-10 border-b border-black/5 pb-6">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <CreditCard className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">الدفع الإلكتروني</h2>
                <div className="flex items-center gap-3 mt-2">
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                    <ShieldCheck className="w-3.5 h-3.5" /> آمن ومشفر
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">مدعوم بـ Paymob</span>
                </div>
              </div>
            </div>

            {/* Fake Paymob Card UI */}
            <div className="space-y-8">
              <div className="bg-gradient-to-br from-accent/5 to-primary/5 border border-accent/20 rounded-2xl p-8 relative overflow-hidden shadow-inner">
                
                <div className="flex justify-between items-center mb-8">
                  <div className="font-serif tracking-widest text-accent font-bold text-sm">PAYMOB SECURE</div>
                  <div className="flex gap-1.5">
                    <div className="w-8 h-5 bg-accent/20 rounded" />
                    <div className="w-8 h-5 bg-primary/30 rounded" />
                  </div>
                </div>

                <div className="space-y-6 relative z-10">
                  <div className="space-y-2">
                    <label className="text-xs text-foreground font-bold uppercase tracking-wider">رقم البطاقة</label>
                    <input 
                      type="text" 
                      placeholder="0000 0000 0000 0000" 
                      className="w-full bg-white border border-black/10 rounded-xl px-5 py-4 text-foreground font-mono tracking-widest focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all shadow-sm"
                      dir="ltr"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs text-foreground font-bold uppercase tracking-wider">تاريخ الانتهاء</label>
                      <input 
                        type="text" 
                        placeholder="MM/YY" 
                        className="w-full bg-white border border-black/10 rounded-xl px-5 py-4 text-foreground font-mono tracking-widest focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all shadow-sm text-center"
                        dir="ltr"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-foreground font-bold uppercase tracking-wider">رمز التحقق (CVV)</label>
                      <input 
                        type="password" 
                        placeholder="•••" 
                        className="w-full bg-white border border-black/10 rounded-xl px-5 py-4 text-foreground font-mono tracking-widest focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all shadow-sm text-center"
                        dir="ltr"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs text-foreground font-bold uppercase tracking-wider">اسم حامل البطاقة</label>
                    <input 
                      type="text" 
                      placeholder="الاسم كما هو مطبوع على البطاقة" 
                      className="w-full bg-white border border-black/10 rounded-xl px-5 py-4 text-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all shadow-sm"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex gap-3 text-sm text-primary font-medium">
                <Lock className="w-5 h-5 shrink-0 mt-0.5" />
                <p>
                  هذه واجهة محاكاة (Placeholder) لأغراض العرض. سيتم إنشاء كود التسجيل الخاص بك فور الضغط على الزر أدناه.
                </p>
              </div>

              <button 
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full py-5 gold-gradient text-white font-bold text-xl rounded-2xl shadow-[0_8px_30px_rgba(201,168,76,0.3)] hover:shadow-[0_8px_40px_rgba(201,168,76,0.4)] transition-all flex items-center justify-center gap-2 hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 shimmer-button"
              >
                {isProcessing ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
