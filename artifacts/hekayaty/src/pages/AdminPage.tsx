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
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 bg-background">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white border border-black/5 p-10 rounded-[2.5rem] text-center luxury-shadow"
        >
          <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border border-black/5">
            <Lock className="w-8 h-8 text-primary" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-bold mb-3 text-foreground">بوابة الإدارة</h1>
          <p className="text-muted-foreground mb-10 text-sm">أدخل رمز المرور للوصول إلى بيانات المسابقة (1234)</p>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••"
              className="w-full bg-background border border-black/10 rounded-2xl px-4 py-5 text-center text-3xl tracking-[1em] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-foreground font-mono"
              autoFocus
              dir="ltr"
            />
            <button 
              type="submit"
              className="w-full py-5 gold-gradient text-white font-bold text-lg rounded-2xl shadow-[0_8px_20px_rgba(201,168,76,0.2)] hover:shadow-[0_8px_30px_rgba(201,168,76,0.3)] transition-all flex items-center justify-center gap-2"
            >
              دخول
              <ArrowUpRight className="w-5 h-5" />
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] py-12 px-4 md:px-8 bg-background">
      <div className="max-w-7xl mx-auto space-y-10">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3 text-foreground">
              <Shield className="w-8 h-8 text-primary" strokeWidth={1.5} />
              إدارة التسجيلات
            </h1>
            <p className="text-muted-foreground mt-2">نظرة عامة على المتسابقين المسجلين في دورة 2026</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'إجمالي التسجيلات', value: stats.total, icon: <Users className="w-5 h-5 text-primary" />, color: 'text-foreground' },
            { label: 'قيد المراجعة', value: stats.pending, icon: <Clock className="w-5 h-5 text-amber-500" />, color: 'text-amber-600' },
            { label: 'تم التحقق', value: stats.verified, icon: <CheckCircle className="w-5 h-5 text-emerald-500" />, color: 'text-emerald-600' },
            { label: 'مرفوض', value: stats.rejected, icon: <XCircle className="w-5 h-5 text-rose-500" />, color: 'text-rose-600' },
          ].map((stat, i) => (
            <div key={i} className="bg-white border border-black/5 rounded-3xl p-6 luxury-shadow flex flex-col justify-between relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-background rounded-full opacity-50" />
              <div className="flex items-center gap-3 mb-4 relative z-10">
                <div className="p-2 bg-background rounded-xl border border-black/5">
                  {stat.icon}
                </div>
                <p className="text-sm font-bold text-muted-foreground">{stat.label}</p>
              </div>
              <p className={`text-4xl font-black font-serif ${stat.color} relative z-10`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl border border-black/5 luxury-shadow">
          <div className="relative flex-1">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="بحث بالاسم، الكود، الإيميل، أو الهاتف..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-black/5 rounded-xl py-4 pr-12 pl-4 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all text-sm font-medium"
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-8 py-4 bg-background border border-black/5 rounded-xl hover:bg-black/5 transition-colors font-bold text-foreground">
            <Filter className="w-5 h-5" />
            تصفية
          </button>
        </div>

        {/* Table */}
        <div className="bg-white border border-black/5 rounded-[2rem] overflow-hidden luxury-shadow">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead className="text-xs text-muted-foreground uppercase bg-background border-b border-black/5">
                <tr>
                  <th className="px-8 py-5 font-bold tracking-wider">الكود</th>
                  <th className="px-8 py-5 font-bold tracking-wider">الاسم</th>
                  <th className="px-8 py-5 font-bold tracking-wider">الاتصال</th>
                  <th className="px-8 py-5 font-bold tracking-wider">القصة / التصنيف</th>
                  <th className="px-8 py-5 font-bold tracking-wider">التاريخ</th>
                  <th className="px-8 py-5 font-bold tracking-wider">الحالة</th>
                  <th className="px-8 py-5 font-bold tracking-wider text-center">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                <AnimatePresence>
                  {filteredRegs.map((reg) => (
                    <motion.tr 
                      key={reg.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-background transition-colors"
                    >
                      <td className="px-8 py-5 font-serif font-bold text-primary tracking-wider whitespace-nowrap" dir="ltr">{reg.code}</td>
                      <td className="px-8 py-5">
                        <div className="font-bold text-foreground whitespace-nowrap">{reg.name}</div>
                        {reg.penName && <div className="text-xs text-muted-foreground mt-1 bg-black/5 inline-block px-2 py-0.5 rounded">مستعار: {reg.penName}</div>}
                      </td>
                      <td className="px-8 py-5 text-muted-foreground">
                        <div dir="ltr" className="text-right font-medium text-foreground whitespace-nowrap">{reg.phone}</div>
                        <div className="text-xs mt-1 whitespace-nowrap">{reg.email}</div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="font-bold text-foreground font-serif whitespace-nowrap">{reg.storyName}</div>
                        <div className="text-xs text-primary font-bold mt-1 bg-primary/10 inline-block px-2 py-0.5 rounded-full whitespace-nowrap">{reg.category}</div>
                      </td>
                      <td className="px-8 py-5 text-muted-foreground font-medium whitespace-nowrap" dir="ltr">
                        {new Date(reg.registeredAt).toLocaleDateString('en-GB')}
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        {reg.paymentStatus === 'pending' && <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-100 text-amber-700 text-xs font-bold shadow-sm"><Clock className="w-3.5 h-3.5"/> قيد المراجعة</span>}
                        {reg.paymentStatus === 'verified' && <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold shadow-sm"><CheckCircle className="w-3.5 h-3.5"/> تم التحقق</span>}
                        {reg.paymentStatus === 'rejected' && <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-100 text-rose-700 text-xs font-bold shadow-sm"><XCircle className="w-3.5 h-3.5"/> مرفوض</span>}
                      </td>
                      <td className="px-8 py-5 text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="p-2.5 hover:bg-black/5 rounded-xl transition-colors outline-none focus:ring-2 focus:ring-primary/20">
                            <MoreVertical className="w-5 h-5 text-foreground" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 bg-white border-black/5 shadow-xl rounded-xl p-2 text-right">
                            <DropdownMenuItem 
                              className="cursor-pointer focus:bg-amber-50 focus:text-amber-700 flex items-center justify-end gap-3 rounded-lg py-2.5 font-bold"
                              onClick={() => handleStatusChange(reg.code, 'pending')}
                            >
                              قيد المراجعة
                              <Clock className="w-4 h-4 text-amber-500" />
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="cursor-pointer focus:bg-emerald-50 focus:text-emerald-700 flex items-center justify-end gap-3 rounded-lg py-2.5 font-bold mt-1"
                              onClick={() => handleStatusChange(reg.code, 'verified')}
                            >
                              تم التحقق
                              <CheckCircle className="w-4 h-4 text-emerald-500" />
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="cursor-pointer focus:bg-rose-50 focus:text-rose-700 flex items-center justify-end gap-3 rounded-lg py-2.5 font-bold mt-1"
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
                    <td colSpan={7} className="px-8 py-16 text-center text-muted-foreground font-medium">
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
