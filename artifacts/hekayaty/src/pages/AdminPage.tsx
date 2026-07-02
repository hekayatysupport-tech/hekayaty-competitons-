import { useState, useEffect } from 'react';
import { useRegistrations, Registration, PaymentStatus } from '@/hooks/useRegistrations';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Search, Filter, Shield, MoreVertical, CheckCircle, XCircle, Clock, Users, ArrowUpRight } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const { getRegistrations, updateStatus, seedFakeData } = useRegistrations();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '1234') {
      setIsAuthenticated(true);
      seedFakeData(); // Ensure we have some data
      setRegistrations(getRegistrations());
    } else {
      toast.error('رمز المرور غير صحيح');
      setPin('');
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      setRegistrations(getRegistrations());
    }
  }, [isAuthenticated, getRegistrations]);

  const handleStatusChange = (code: string, status: PaymentStatus) => {
    updateStatus(code, status);
    setRegistrations(getRegistrations());
    
    if (status === 'verified') {
      toast.success('تم التحقق من الدفع بنجاح');
    } else if (status === 'rejected') {
      toast.error('تم رفض التسجيل');
    } else {
      toast('تم إعادة التسجيل إلى قيد المراجعة');
    }
  };

  const filteredRegs = registrations.filter(r => {
    const q = searchQuery.toLowerCase();
    return (
      r.code.toLowerCase().includes(q) ||
      r.name.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.phone.includes(q)
    );
  }).sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime());

  const stats = {
    total: registrations.length,
    pending: registrations.filter(r => r.paymentStatus === 'pending').length,
    verified: registrations.filter(r => r.paymentStatus === 'verified').length,
    rejected: registrations.filter(r => r.paymentStatus === 'rejected').length,
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 section-dark overflow-hidden relative">
        <div className="absolute inset-0 aurora-bg opacity-50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
        
        {/* Floating particles */}
        {[...Array(10)].map((_, i) => (
          <div key={`p-${i}`} className="absolute rounded-full bg-primary float" 
               style={{ width: Math.random()*3+1, height: Math.random()*3+1, left: `${Math.random()*100}%`, top: `${Math.random()*100}%`, animationDelay: `${Math.random()*5}s`, opacity: 0.3 }} />
        ))}

        <motion.div 
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="w-full max-w-md glass-card p-12 rounded-[3rem] text-center glow-gold relative z-10"
        >
          <div className="w-24 h-24 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center mx-auto mb-10 shadow-[0_0_30px_rgba(201,168,76,0.2)]">
            <Lock className="w-10 h-10 text-primary animate-pulse" strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl font-black mb-4 text-foreground font-serif tracking-wide">بوابة الإدارة</h1>
          <p className="text-muted-foreground mb-12 text-sm uppercase tracking-widest font-bold">الوصول المصرح فقط (1234)</p>
          
          <form onSubmit={handleLogin} className="space-y-8">
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••"
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-6 text-center text-4xl tracking-[1em] focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all text-primary font-mono shadow-inner"
              autoFocus
              dir="ltr"
            />
            <button 
              type="submit"
              className="w-full py-6 gold-gradient text-primary-foreground font-bold text-xl rounded-2xl shadow-[0_0_20px_rgba(201,168,76,0.3)] hover:shadow-[0_0_30px_rgba(201,168,76,0.5)] transition-all flex items-center justify-center gap-3 shimmer-button"
            >
              دخول
              <ArrowUpRight className="w-6 h-6" />
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] py-16 px-4 md:px-8 section-dark">
      <div className="max-w-7xl mx-auto space-y-12">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-4">
          <div>
            <h1 className="text-4xl font-black flex items-center gap-4 text-foreground font-serif">
              <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20 glow-gold">
                <Shield className="w-8 h-8 text-primary" strokeWidth={1.5} />
              </div>
              إدارة التسجيلات
            </h1>
            <p className="text-muted-foreground mt-4 text-lg">نظرة عامة على المتسابقين المسجلين في دورة 2026</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'إجمالي التسجيلات', value: stats.total, icon: <Users className="w-6 h-6 text-primary" />, color: 'gold-text', glow: 'glow-gold', border: 'border-primary/20' },
            { label: 'قيد المراجعة', value: stats.pending, icon: <Clock className="w-6 h-6 text-amber-400" />, color: 'text-amber-400', glow: 'shadow-[0_0_20px_rgba(251,191,36,0.1)]', border: 'border-amber-400/20' },
            { label: 'تم التحقق', value: stats.verified, icon: <CheckCircle className="w-6 h-6 text-[#34d399]" />, color: 'text-[#34d399]', glow: 'shadow-[0_0_20px_rgba(52,211,153,0.1)]', border: 'border-[#34d399]/20' },
            { label: 'مرفوض', value: stats.rejected, icon: <XCircle className="w-6 h-6 text-rose-400" />, color: 'text-rose-400', glow: 'shadow-[0_0_20px_rgba(244,63,94,0.1)]', border: 'border-rose-400/20' },
          ].map((stat, i) => (
            <div key={i} className={`glass-card border ${stat.border} rounded-3xl p-8 ${stat.glow} flex flex-col justify-between relative overflow-hidden`}>
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full opacity-30" />
              <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="p-3 bg-black/40 rounded-2xl border border-white/5">
                  {stat.icon}
                </div>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
              </div>
              <p className={`text-5xl font-black font-serif ${stat.color} relative z-10 drop-shadow-md`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-5 glass-card p-5 rounded-[2rem] border-white/10 luxury-shadow">
          <div className="relative flex-1">
            <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="بحث بالاسم، الكود، الإيميل، أو الهاتف..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 pr-16 pl-6 text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all text-lg font-medium shadow-inner"
            />
          </div>
          <button className="flex items-center justify-center gap-3 px-10 py-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors font-bold text-foreground">
            <Filter className="w-5 h-5" />
            تصفية
          </button>
        </div>

        {/* Table */}
        <div className="glass-card rounded-[2.5rem] overflow-hidden luxury-shadow border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead className="text-xs text-primary/60 uppercase tracking-[0.2em] section-elevated border-b border-white/10">
                <tr>
                  <th className="px-8 py-6 font-bold">الكود</th>
                  <th className="px-8 py-6 font-bold">الاسم</th>
                  <th className="px-8 py-6 font-bold">الاتصال</th>
                  <th className="px-8 py-6 font-bold">القصة / التصنيف</th>
                  <th className="px-8 py-6 font-bold">التاريخ</th>
                  <th className="px-8 py-6 font-bold">الحالة</th>
                  <th className="px-8 py-6 font-bold text-center">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence>
                  {filteredRegs.map((reg) => (
                    <motion.tr 
                      key={reg.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-8 py-6 font-serif font-black gold-text tracking-widest whitespace-nowrap" dir="ltr">{reg.code}</td>
                      <td className="px-8 py-6">
                        <div className="font-bold text-foreground text-lg whitespace-nowrap">{reg.name}</div>
                        {reg.penName && <div className="text-xs text-primary/80 mt-2 bg-primary/10 border border-primary/20 inline-block px-2.5 py-1 rounded-md">مستعار: {reg.penName}</div>}
                      </td>
                      <td className="px-8 py-6 text-muted-foreground">
                        <div dir="ltr" className="text-right font-medium text-foreground whitespace-nowrap">{reg.phone}</div>
                        <div className="text-xs mt-1 whitespace-nowrap opacity-70">{reg.email}</div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="font-bold text-foreground font-serif text-lg whitespace-nowrap">{reg.storyName}</div>
                        <div className="text-xs text-primary font-bold mt-2 bg-primary/10 border border-primary/20 inline-block px-3 py-1 rounded-full whitespace-nowrap">{reg.category}</div>
                      </td>
                      <td className="px-8 py-6 text-muted-foreground font-medium whitespace-nowrap opacity-80" dir="ltr">
                        {new Date(reg.registeredAt).toLocaleDateString('en-GB')}
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        {reg.paymentStatus === 'pending' && <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold shadow-[0_0_10px_rgba(251,191,36,0.1)]"><Clock className="w-4 h-4"/> قيد المراجعة</span>}
                        {reg.paymentStatus === 'verified' && <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#34d399]/10 border border-[#34d399]/20 text-[#34d399] text-xs font-bold shadow-[0_0_10px_rgba(52,211,153,0.1)]"><CheckCircle className="w-4 h-4"/> تم التحقق</span>}
                        {reg.paymentStatus === 'rejected' && <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold shadow-[0_0_10px_rgba(244,63,94,0.1)]"><XCircle className="w-4 h-4"/> مرفوض</span>}
                      </td>
                      <td className="px-8 py-6 text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="p-3 hover:bg-white/10 rounded-2xl transition-colors outline-none focus:ring-2 focus:ring-primary/30 text-foreground">
                            <MoreVertical className="w-5 h-5" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 bg-[#0a0a0f]/95 backdrop-blur-xl border-primary/20 shadow-[0_10px_40px_rgba(0,0,0,0.5)] rounded-2xl p-2 text-right z-50">
                            <DropdownMenuItem 
                              className="cursor-pointer focus:bg-amber-500/10 focus:text-amber-400 text-foreground flex items-center justify-end gap-3 rounded-xl py-3 font-bold transition-colors"
                              onClick={() => handleStatusChange(reg.code, 'pending')}
                            >
                              قيد المراجعة
                              <Clock className="w-4 h-4 text-amber-500" />
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="cursor-pointer focus:bg-[#34d399]/10 focus:text-[#34d399] text-foreground flex items-center justify-end gap-3 rounded-xl py-3 font-bold mt-1 transition-colors"
                              onClick={() => handleStatusChange(reg.code, 'verified')}
                            >
                              تم التحقق
                              <CheckCircle className="w-4 h-4 text-[#34d399]" />
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="cursor-pointer focus:bg-rose-500/10 focus:text-rose-400 text-foreground flex items-center justify-end gap-3 rounded-xl py-3 font-bold mt-1 transition-colors"
                              onClick={() => handleStatusChange(reg.code, 'rejected')}
                            >
                              مرفوض
                              <XCircle className="w-4 h-4 text-rose-500" />
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                
                {filteredRegs.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-8 py-20 text-center text-muted-foreground font-medium text-lg">
                      لا توجد تسجيلات مطابقة للبحث.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
