import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useRegistrations } from '@/hooks/useRegistrations';
import { motion } from 'framer-motion';
import { CreditCard, ShieldCheck, Lock, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export function PaymentPage() {
  const [location, setLocation] = useLocation();
  const { getPending, completeRegistration } = useRegistrations();
  const [isProcessing, setIsProcessing] = useState(false);
  const pendingData = getPending();

  useEffect(() => {
    // If no pending data is found, user shouldn't be here. Send them to register.
    if (!pendingData) {
      setLocation('/register');
    }
  }, [pendingData, setLocation]);

  if (!pendingData) return null;

  const handlePayment = () => {
    setIsProcessing(true);
    // Simulate processing payment via "Paymob"
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
    <div className="min-h-[calc(100vh-80px)] py-12 px-4 relative flex items-center justify-center">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl grid md:grid-cols-5 gap-8 relative z-10"
      >
        
        {/* Order Summary (Sidebar on desktop) */}
        <div className="md:col-span-2 space-y-6 order-2 md:order-1">
          <div className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
            <h3 className="text-xl font-bold mb-6 border-b border-white/5 pb-4">ملخص التسجيل</h3>
            
            <div className="space-y-4 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>اسم الكاتب</span>
                <span className="text-white font-medium">{pendingData.name}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>اسم القصة</span>
                <span className="text-white font-medium font-serif">{pendingData.storyName}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>التصنيف</span>
                <span className="text-white font-medium">{pendingData.category}</span>
              </div>
              
              <div className="pt-4 border-t border-white/5 mt-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-muted-foreground">رسوم التسجيل</span>
                  <span className="text-white">150 ج.م</span>
                </div>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>رسوم إدارية (Paymob)</span>
                  <span>0 ج.م</span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-primary/20 mt-4 flex justify-between items-center">
                <span className="text-lg font-bold text-white">الإجمالي</span>
                <span className="text-2xl font-black text-primary font-serif">150 ج.م</span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => setLocation('/register')}
            className="w-full flex items-center justify-center gap-2 py-3 text-muted-foreground hover:text-white transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            العودة للتعديل
          </button>
        </div>

        {/* Payment Main Form */}
        <div className="md:col-span-3 order-1 md:order-2">
          <div className="bg-card/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">الدفع الإلكتروني</h2>
                <p className="text-muted-foreground text-sm mt-1 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-green-400" />
                  مدعوم ومحمي بواسطة Paymob
                </p>
              </div>
            </div>

            {/* Fake Paymob Card UI */}
            <div className="space-y-6">
              <div className="bg-black/50 border border-white/10 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                
                <div className="flex justify-between items-center mb-8">
                  <div className="font-serif tracking-widest text-white/40">CARD PAYMENT</div>
                  <div className="flex gap-2">
                    <div className="w-8 h-5 bg-white/10 rounded-sm" />
                    <div className="w-8 h-5 bg-white/10 rounded-sm" />
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs text-white/50 uppercase tracking-wider">Card Number</label>
                    <input 
                      type="text" 
                      placeholder="0000 0000 0000 0000" 
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white font-mono tracking-widest focus:outline-none focus:border-primary transition-colors"
                      dir="ltr"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs text-white/50 uppercase tracking-wider">Expiry</label>
                      <input 
                        type="text" 
                        placeholder="MM/YY" 
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white font-mono tracking-widest focus:outline-none focus:border-primary transition-colors text-center"
                        dir="ltr"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-white/50 uppercase tracking-wider">CVV</label>
                      <input 
                        type="password" 
                        placeholder="•••" 
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white font-mono tracking-widest focus:outline-none focus:border-primary transition-colors text-center"
                        dir="ltr"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs text-white/50 uppercase tracking-wider">Cardholder Name</label>
                    <input 
                      type="text" 
                      placeholder="Name on card" 
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white font-sans focus:outline-none focus:border-primary transition-colors"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex gap-3 text-sm text-primary/90">
                <Lock className="w-5 h-5 shrink-0 mt-0.5" />
                <p>
                  هذه واجهة محاكاة (Placeholder) لأغراض العرض. سيتم إنشاء كود التسجيل الخاص بك فور الضغط على الزر أدناه.
                </p>
              </div>

              <button 
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full py-4 bg-primary text-primary-foreground font-bold text-lg rounded-xl transition-all hover:bg-primary/90 flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(201,168,76,0.3)] disabled:opacity-70 disabled:cursor-not-allowed mt-8"
              >
                {isProcessing ? (
                  <div className="w-6 h-6 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <>
                    إتمام التسجيل (150 ج.م)
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
