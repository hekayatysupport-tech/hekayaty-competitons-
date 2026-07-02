import { useState } from 'react';
import { useRegistrations, Registration } from '@/hooks/useRegistrations';
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

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'verified':
        return {
          color: 'text-emerald-700',
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
          text: 'تم التأكيد'
        };
      case 'rejected':
        return {
          color: 'text-rose-700',
          bg: 'bg-rose-50',
          border: 'border-rose-200',
          icon: <XCircle className="w-5 h-5 text-rose-500" />,
          text: 'مرفوض'
        };
      case 'pending':
      default:
        return {
          color: 'text-amber-700',
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          icon: <Clock className="w-5 h-5 text-amber-500" />,
          text: 'قيد المراجعة'
        };
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] py-20 px-4 relative bg-background">
      <div className="max-w-3xl mx-auto">
        
        <div className="text-center mb-16">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 luxury-shadow">
            <Ticket className="w-10 h-10 text-primary" strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl font-bold mb-4 text-foreground">تتبع التسجيل</h1>
          <p className="text-muted-foreground text-lg">أدخل كود التسجيل الخاص بك لمتابعة حالة طلبك</p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative mb-16 z-20">
          <div className="absolute inset-y-0 right-0 flex items-center pr-6 pointer-events-none text-muted-foreground">
            <Search className="w-6 h-6" />
          </div>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-white border border-black/5 rounded-full py-6 pr-16 pl-36 text-xl text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 luxury-shadow transition-all font-serif"
            placeholder="مثال: HKA-2026-0001"
            dir="ltr"
          />
          <button 
            type="submit"
            className="absolute inset-y-3 left-3 px-8 gold-gradient text-white font-bold rounded-full transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
          >
            بحث
          </button>
        </form>

        <AnimatePresence mode="wait">
          {hasSearched && !result && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-rose-100 rounded-3xl p-10 text-center flex flex-col items-center luxury-shadow"
            >
              <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-rose-500" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">لم يتم العثور على التسجيل</h3>
              <p className="text-muted-foreground text-lg">تأكد من إدخال الكود بشكل صحيح. الصيغة المعتمدة هي HKA-2026-XXXX</p>
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
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 text-emerald-800 p-6 rounded-3xl flex items-center gap-4 font-bold text-lg luxury-shadow relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-2 h-full bg-emerald-400" />
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0">
                    <CheckCircle className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <span className="block text-xl mb-1">تسجيل مؤكد</span>
                    <span className="text-emerald-600/80 text-sm font-normal">أنت الآن مرشح رسمي في جوائز حكايتي 2026</span>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-[2rem] overflow-hidden luxury-shadow border border-black/5">
                <div className="bg-background p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-black/5 relative">
                  <div className="absolute top-0 left-0 w-full h-1 gold-gradient" />
                  <div>
                    <p className="text-sm text-muted-foreground uppercase tracking-widest mb-2 font-bold">كود المتسابق</p>
                    <div className="text-3xl md:text-4xl font-black font-serif text-foreground tracking-widest dir-ltr">
                      {result.code}
                    </div>
                  </div>
                  
                  {(() => {
                    const status = getStatusDisplay(result.paymentStatus);
                    return (
                      <div className={`flex items-center gap-2 px-6 py-3 rounded-full border ${status.bg} ${status.border} shadow-sm`}>
                        {status.icon}
                        <span className={`font-bold text-lg ${status.color}`}>{status.text}</span>
                      </div>
                    );
                  })()}
                </div>

                <div className="p-8 md:p-10 grid md:grid-cols-2 gap-10">
                  <div className="space-y-8">
                    <div className="flex items-start gap-5">
                      <div className="w-12 h-12 rounded-full bg-background border border-black/5 flex items-center justify-center shrink-0">
                        <Feather className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1 font-bold">الكاتب</p>
                        <p className="text-xl font-bold text-foreground">{result.name}</p>
                        {result.penName && (
                          <p className="text-sm text-primary mt-1 font-medium bg-primary/5 inline-block px-2 py-0.5 rounded">مستعار: {result.penName}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-5">
                      <div className="w-12 h-12 rounded-full bg-background border border-black/5 flex items-center justify-center shrink-0">
                        <MapPin className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1 font-bold">المدينة</p>
                        <p className="text-xl font-bold text-foreground">{result.city}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="flex items-start gap-5">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <BookOpen className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1 font-bold">العمل الأدبي</p>
                        <p className="text-2xl font-bold text-foreground font-serif">{result.storyName}</p>
                        <span className="inline-block mt-3 text-sm font-bold bg-background border border-black/5 text-muted-foreground px-4 py-1.5 rounded-full">
                          {result.category}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-5">
                      <div className="w-12 h-12 rounded-full bg-background border border-black/5 flex items-center justify-center shrink-0">
                        <Clock className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1 font-bold">تاريخ التسجيل</p>
                        <p className="text-xl font-bold text-foreground dir-ltr text-right">
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
