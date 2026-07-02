import { useState } from 'react';
import { useRegistrations, Registration, PaymentStatus } from '@/hooks/useRegistrations';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, AlertCircle, CheckCircle, Clock, XCircle, Feather, BookOpen, MapPin, Ticket } from 'lucide-react';

export function DashboardPage() {
  const { getByCode } = useRegistrations();
  const [searchInput, setSearchInput] = useState('');
  const [result, setResult] = useState<Registration | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    
    let codeToSearch = searchInput.trim().toUpperCase();
    if (/^\d{1,4}$/.test(codeToSearch)) {
      codeToSearch = `HKA-2026-${codeToSearch.padStart(4, '0')}`;
    }

    const reg = getByCode(codeToSearch);
    setResult(reg);
    setHasSearched(true);
  };

  const getStatusDisplay = (status: PaymentStatus) => {
    switch (status) {
      case 'verified':
        return {
          color: 'text-[#34d399]',
          bg: 'bg-[#34d399]/10',
          border: 'border-[#34d399]/30',
          shadow: 'shadow-[0_0_15px_rgba(52,211,153,0.2)]',
          icon: <CheckCircle className="w-5 h-5 text-[#34d399]" />,
          text: 'تم التأكيد'
        };
      case 'rejected':
        return {
          color: 'text-rose-400',
          bg: 'bg-rose-500/10',
          border: 'border-rose-500/30',
          shadow: 'shadow-[0_0_15px_rgba(244,63,94,0.2)]',
          icon: <XCircle className="w-5 h-5 text-rose-400" />,
          text: 'مرفوض'
        };
      case 'pending':
      default:
        return {
          color: 'text-amber-400',
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/30',
          shadow: 'shadow-[0_0_15px_rgba(251,191,36,0.2)]',
          icon: <Clock className="w-5 h-5 text-amber-400" />,
          text: 'قيد المراجعة'
        };
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] py-20 px-4 relative section-dark overflow-hidden">
      {/* Background Aurora */}
      <div className="absolute top-0 left-0 right-0 h-[500px] aurora-bg opacity-30 pointer-events-none" />
      
      <div className="max-w-4xl mx-auto relative z-10">
        
        <div className="text-center mb-16">
          <div className="w-24 h-24 rounded-full border border-primary/20 bg-primary/5 flex items-center justify-center mx-auto mb-8 glow-gold">
            <Ticket className="w-10 h-10 text-primary" strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 text-foreground tracking-wide font-sans">تتبع التسجيل</h1>
          <p className="text-muted-foreground text-lg">أدخل كود التسجيل الخاص بك لمتابعة حالة طلبك</p>
        </div>

        {/* Search Bar */}
        <div className="glass-card p-6 md:p-8 rounded-[2.5rem] mb-16 relative z-20 luxury-shadow border-primary/20">
          <form onSubmit={handleSearch} className="relative">
            <div className="absolute inset-y-0 right-0 flex items-center pr-6 pointer-events-none text-muted-foreground">
              <Search className="w-6 h-6" />
            </div>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-full py-6 pr-16 pl-40 text-xl text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all font-serif dir-ltr shadow-inner"
              placeholder="HKA-2026-XXXX"
              dir="ltr"
            />
            <button 
              type="submit"
              className="absolute inset-y-2 left-2 px-10 gold-gradient text-primary-foreground font-bold rounded-full transition-all shadow-[0_0_15px_rgba(201,168,76,0.3)] hover:shadow-[0_0_25px_rgba(201,168,76,0.5)] hover:scale-105 active:scale-95 text-lg shimmer-button"
            >
              بحث
            </button>
          </form>
        </div>

        <AnimatePresence mode="wait">
          {hasSearched && !result && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card border-rose-500/30 rounded-[2rem] p-12 text-center flex flex-col items-center luxury-shadow relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-rose-500/5" />
              <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mb-6 border border-rose-500/20 shadow-[0_0_30px_rgba(244,63,94,0.15)] relative z-10">
                <AlertCircle className="w-10 h-10 text-rose-400" />
              </div>
              <h3 className="text-3xl font-bold text-foreground mb-4 relative z-10">لم يتم العثور على التسجيل</h3>
              <p className="text-muted-foreground text-lg relative z-10 max-w-lg">تأكد من إدخال الكود بشكل صحيح. الصيغة المعتمدة هي HKA-2026-XXXX</p>
            </motion.div>
          )}

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-8"
            >
              {result.paymentStatus === 'verified' && (
                <div className="glass-card border-[#34d399]/40 p-8 rounded-3xl flex items-center gap-6 font-bold text-lg luxury-shadow relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-r from-transparent via-[#34d399]/5 to-[#34d399]/10" />
                  <div className="absolute top-0 right-0 w-2 h-full bg-[#34d399] shadow-[0_0_15px_rgba(52,211,153,0.8)]" />
                  <div className="w-16 h-16 bg-[#34d399]/10 border border-[#34d399]/30 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(52,211,153,0.2)] shrink-0 relative z-10">
                    <CheckCircle className="w-8 h-8 text-[#34d399]" />
                  </div>
                  <div className="relative z-10">
                    <span className="block text-2xl mb-1 text-foreground">تسجيل مؤكد</span>
                    <span className="text-[#34d399] text-sm font-medium tracking-wide">أنت الآن مرشح رسمي في جوائز حكايتي 2026</span>
                  </div>
                </div>
              )}

              <div className="glass-card rounded-[2.5rem] overflow-hidden luxury-shadow glow-gold relative">
                <div className="absolute top-0 left-0 w-full h-1 gold-gradient" />
                
                <div className="p-8 md:p-12 flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-white/10 relative bg-white/5">
                  <div className="energy-border inline-block p-4 rounded-2xl bg-black/40">
                    <p className="text-sm text-primary/70 uppercase tracking-[0.2em] mb-2 font-bold">كود المتسابق</p>
                    <div className="text-4xl md:text-5xl font-black font-serif gold-text tracking-widest dir-ltr">
                      {result.code}
                    </div>
                  </div>
                  
                  {(() => {
                    const status = getStatusDisplay(result.paymentStatus);
                    return (
                      <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl border ${status.bg} ${status.border} ${status.shadow} backdrop-blur-md`}>
                        {status.icon}
                        <span className={`font-bold text-xl ${status.color}`}>{status.text}</span>
                      </div>
                    );
                  })()}
                </div>

                <div className="p-8 md:p-12 grid md:grid-cols-2 gap-12 bg-black/20">
                  <div className="space-y-10">
                    <div className="flex items-start gap-6">
                      <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        <Feather className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-primary/60 mb-2 font-bold uppercase tracking-widest">الكاتب</p>
                        <p className="text-2xl font-bold text-foreground">{result.name}</p>
                        {result.penName && (
                          <p className="text-sm text-primary/80 mt-2 font-medium bg-primary/10 border border-primary/20 inline-block px-3 py-1 rounded-md">مستعار: {result.penName}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-6">
                      <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        <MapPin className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-primary/60 mb-2 font-bold uppercase tracking-widest">المدينة</p>
                        <p className="text-2xl font-bold text-foreground">{result.city}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-10">
                    <div className="flex items-start gap-6">
                      <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/30 glow-gold flex items-center justify-center shrink-0">
                        <BookOpen className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-primary/60 mb-2 font-bold uppercase tracking-widest">العمل الأدبي</p>
                        <p className="text-3xl font-bold text-foreground font-serif leading-tight">{result.storyName}</p>
                        <span className="inline-block mt-4 text-sm font-bold bg-white/5 border border-white/10 text-muted-foreground px-5 py-2 rounded-xl">
                          {result.category}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-6">
                      <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        <Clock className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-primary/60 mb-2 font-bold uppercase tracking-widest">تاريخ التسجيل</p>
                        <p className="text-2xl font-bold text-foreground dir-ltr text-right">
                          {new Date(result.registeredAt).toLocaleDateString('en-GB')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
