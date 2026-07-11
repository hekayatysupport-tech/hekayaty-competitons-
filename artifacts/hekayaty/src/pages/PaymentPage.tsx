import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'wouter';
import { useRegistrations } from '@/hooks/useRegistrations';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Lock, ArrowRight, Wallet, CheckCircle2, UploadCloud, FileImage, Type, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export const PaymentPage = React.memo(function PaymentPage() {
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const code = searchParams.get('code');

  const { getByCode, submitPaymentProof } = useRegistrations();
  const [isProcessing, setIsProcessing] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [registration, setRegistration] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (!code) {
      setLocation('/register');
      return;
    }
    (async () => {
      const data = await getByCode(code);
      if (!data) {
        toast.error('لم يتم العثور على التسجيل');
        setLocation('/register');
        return;
      }
      setRegistration(data);
      setIsLoading(false);
    })();
  }, [code, setLocation]);

  if (isLoading || !registration) {
    return (
      <div className="min-h-screen flex items-center justify-center section-dark">
        <div className="text-center">
          <div className="w-16 h-16 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/40 font-medium">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  const packagePrice = registration.packageType === 'package_a' ? 100 : 150;
  const packageName = registration.packageType === 'package_a' ? 'الباقة الفردية' : 'الباقة المتعددة';



  const handlePayment = async () => {
    if (!referenceNumber.trim()) {
      toast.error("يرجى إدخال رقم عملية إنستاباي");
      return;
    }

    setIsProcessing(true);
    try {
      // Save proof in DB via SECURITY DEFINER RPC
      const proofSaved = await submitPaymentProof(registration.code, 'reference', referenceNumber);
      if (!proofSaved) {
        throw new Error('فشل حفظ إثبات الدفع. يرجى المحاولة مرة أخرى.');
      }

      setLocation(`/upload-submission?code=${registration.code}`);
    } catch (e) {
      console.error(e);
      toast.error("حدث خطأ أثناء إتمام عملية الدفع. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] py-24 px-4 relative flex items-center justify-center section-dark overflow-hidden font-sans">
      
      {/* Background Atmosphere */}
      <div className="absolute inset-0 bg-[#0A0503]" />
      <div className="absolute inset-0 aurora-bg opacity-30 pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-5xl grid md:grid-cols-5 gap-8 relative z-10"
      >
        
        {/* Order Summary (Ivory Card) */}
        <div className="md:col-span-2 space-y-6 order-2 md:order-1">
          <div className="bg-white rounded-[2rem] p-8 shadow-[0_20px_40px_rgba(0,0,0,0.2)] relative overflow-hidden text-[#120B08]">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#120B08]/5 blur-3xl rounded-full" />
            
            <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#120B08]/10 flex items-center justify-center border border-[#120B08]/20">
                <Wallet className="w-5 h-5 text-[#120B08]" />
              </div>
              ملخص التسجيل
            </h3>
            
            <div className="space-y-6 text-sm relative z-10 font-medium">
              <div className="flex justify-between border-b border-[#120B08]/10 pb-4">
                <span className="text-[#120B08]/60">اسم الكاتب</span>
                <span className="font-bold">{registration.name}</span>
              </div>
              <div className="flex justify-between border-b border-[#120B08]/10 pb-4">
                <span className="text-[#120B08]/60">الباقة المختارة</span>
                <span className="text-white font-bold bg-[#120B08] px-3 py-1 rounded-full text-xs shadow-md">{packageName}</span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="text-[#120B08]/60">عدد الأعمال المدخلة</span>
                <span className="font-bold">{registration.stories?.length || 0} أعمال</span>
              </div>
              
              <div className="pt-6 border-t border-[#120B08]/10 mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[#120B08]/60">رسوم التسجيل</span>
                  <span className="font-bold">{packagePrice} ج.م</span>
                </div>
              </div>
              
              <div className="pt-8 mt-4 flex flex-col items-center">
                <span className="text-sm text-[#120B08]/50 mb-2 uppercase tracking-widest font-bold">الإجمالي المطلوب</span>
                <span className="text-6xl font-black text-[#120B08] font-serif dir-ltr drop-shadow-sm">{packagePrice} EGP</span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => setLocation('/register')}
            className="w-full flex items-center justify-center gap-2 py-4 text-white/60 hover:text-white font-bold transition-colors bg-white/5 rounded-2xl hover:bg-white/10"
          >
            <ArrowRight className="w-4 h-4" />
            العودة لتعديل البيانات
          </button>
        </div>

        {/* Payment Main Form (Deep Purple Card) */}
        <div className="md:col-span-3 order-1 md:order-2">
          <div className="bg-[#120B08] rounded-[2rem] p-8 md:p-12 border border-primary/30 shadow-[0_20px_50px_rgba(201,168,76,0.15)] relative h-full energy-border">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
            
            <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8 border-b border-white/10 pb-8 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-lg p-2">
                <img src="https://hekayaty.com/wp-content/uploads/2023/12/InstaPay-Logo.png" alt="InstaPay" className="w-full h-full object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement?.classList.add('glow-gold', 'text-primary', 'bg-[#120B08]'); e.currentTarget.parentElement?.insertAdjacentHTML('beforeend', '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>'); }} />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-foreground font-sans">الدفع عبر إنستاباي</h2>
                <div className="flex items-center gap-3 mt-2">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md" style={{ boxShadow: '0 0 10px rgba(52,211,153,0.2)' }}>
                    <ShieldCheck className="w-4 h-4" /> دفع يدوي آمن
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {/* Instructions */}
              <div className="bg-[#833a92]/5 border border-[#833a92]/20 rounded-2xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#833a92]/10 blur-2xl rounded-full pointer-events-none" />
                <h4 className="font-bold text-foreground mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#833a92]/20 text-[#833a92] flex items-center justify-center text-sm">1</span>
                  قم بتحويل المبلغ إلى:
                </h4>
                <div className="text-3xl font-black font-serif text-[#833a92] dir-ltr text-center py-4 bg-white/5 rounded-xl border border-white/10 mb-4 select-all shadow-inner">
                  01272404623
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  برجاء تحويل مبلغ <strong className="text-foreground">{packagePrice} جنيه مصري</strong> بدقة. أي اختلاف في المبلغ قد يؤدي لتأخير مراجعة طلبك.
                </p>
              </div>

              {/* Proof Upload */}
              <div className="space-y-4">
                <h4 className="font-bold text-foreground flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm">2</span>
                  إرفاق إثبات الدفع:
                </h4>
                
                
                <div className="pt-4 space-y-2">
                  <label className="text-xs text-foreground/70 font-bold">الرقم المرجعي (Reference Number)</label>
                  <input 
                    type="text" 
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    placeholder="أدخل الرقم المرجعي للعملية..." 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-foreground focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/30 shadow-inner"
                    dir="ltr"
                  />
                </div>

              </div>

              <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-6 flex gap-4 text-sm text-amber-500/90 font-medium items-start">
                <Lock className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />
                <p className="leading-relaxed">
                  ملاحظة هامة: التسجيل غير مكتمل حتى يتم مراجعة الدفع يدوياً من قبل الإدارة. سيتم إرسال الكود لك، ويمكنك متابعة حالة طلبك لاحقاً.
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
                    إرسال الطلب وإتمام التسجيل
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

      </motion.div>
    </div>
  );
});
