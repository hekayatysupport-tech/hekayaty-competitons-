import { useState } from 'react';
import { useRegistrations, Registration } from '@/hooks/useRegistrations';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, AlertCircle, CheckCircle, Clock, XCircle, Feather, BookOpen, MapPin } from 'lucide-react';

export function DashboardPage() {
  const { getByCode } = useRegistrations();
  const [searchInput, setSearchInput] = useState('');
  const [result, setResult] = useState<Registration | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    
    // Auto format code if user typed just the numbers
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
          color: 'text-green-500',
          bg: 'bg-green-500/10',
          border: 'border-green-500/20',
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
          text: 'تم التأكيد'
        };
      case 'rejected':
        return {
          color: 'text-red-500',
          bg: 'bg-red-500/10',
          border: 'border-red-500/20',
          icon: <XCircle className="w-5 h-5 text-red-500" />,
          text: 'مرفوض'
        };
      case 'pending':
      default:
        return {
          color: 'text-amber-500',
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/20',
          icon: <Clock className="w-5 h-5 text-amber-500" />,
          text: 'قيد المراجعة'
        };
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] py-16 px-4 relative">
      <div className="max-w-3xl mx-auto">
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-white">لوحة تحكم المتسابقين</h1>
          <p className="text-muted-foreground text-lg">أدخل كود التسجيل الخاص بك لمتابعة حالة طلبك</p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative mb-12 z-20">
          <div className="absolute inset-y-0 right-0 flex items-center pr-5 pointer-events-none text-muted-foreground">
            <Search className="w-6 h-6" />
          </div>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-card/50 backdrop-blur-md border border-white/10 rounded-full py-5 pr-14 pl-32 text-lg text-white placeholder:text-white/20 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-2xl transition-all"
            placeholder="مثال: HKA-2026-0001"
            dir="ltr"
          />
          <button 
            type="submit"
            className="absolute inset-y-2 left-2 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-full transition-colors"
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
              className="bg-destructive/10 border border-destructive/20 rounded-2xl p-8 text-center flex flex-col items-center"
            >
              <AlertCircle className="w-12 h-12 text-destructive mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">لم يتم العثور على التسجيل</h3>
              <p className="text-muted-foreground">تأكد من إدخال الكود بشكل صحيح. الصيغة المعتمدة هي HKA-2026-XXXX</p>
            </motion.div>
          )}

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              {result.paymentStatus === 'verified' && (
                <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-2xl flex items-center justify-center gap-3 font-bold text-lg">
                  🎉 تم تأكيد تسجيلك بنجاح. أنت الآن مرشح رسمي في جوائز حكايتي 2026!
                </div>
              )}

              <div className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                <div className="bg-black/40 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5">
                  <div>
                    <p className="text-sm text-white/40 uppercase tracking-widest mb-1">كود المتسابق</p>
                    <div className="text-3xl font-black font-serif text-primary tracking-widest dir-ltr">
                      {result.code}
                    </div>
                  </div>
                  
                  {(() => {
                    const status = getStatusDisplay(result.paymentStatus);
                    return (
                      <div className={`flex items-center gap-2 px-5 py-2.5 rounded-full border ${status.bg} ${status.border}`}>
                        {status.icon}
                        <span className={`font-bold ${status.color}`}>{status.text}</span>
                      </div>
                    );
                  })()}
                </div>

                <div className="p-6 md:p-8 grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                        <Feather className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">الكاتب</p>
                        <p className="text-lg font-bold text-white">{result.name}</p>
                        {result.penName && (
                          <p className="text-sm text-primary mt-1">الاسم المستعار: {result.penName}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">المدينة</p>
                        <p className="text-lg font-bold text-white">{result.city}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <BookOpen className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">العمل الأدبي</p>
                        <p className="text-xl font-bold text-white font-serif">{result.storyName}</p>
                        <span className="inline-block mt-2 text-xs bg-white/10 text-white px-3 py-1 rounded-full">
                          {result.category}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                        <Clock className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">تاريخ التسجيل</p>
                        <p className="text-lg font-bold text-white dir-ltr text-right">
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
