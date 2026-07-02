import { useState, useEffect } from 'react';
import { useRegistrations, Registration, PaymentStatus } from '@/hooks/useRegistrations';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Search, Filter, Shield, MoreVertical, CheckCircle, XCircle, Clock } from 'lucide-react';
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

  // Filter registrations
  const filteredRegs = registrations.filter(r => {
    const q = searchQuery.toLowerCase();
    return (
      r.code.toLowerCase().includes(q) ||
      r.name.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.phone.includes(q)
    );
  }).sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime());

  // Stats
  const stats = {
    total: registrations.length,
    pending: registrations.filter(r => r.paymentStatus === 'pending').length,
    verified: registrations.filter(r => r.paymentStatus === 'verified').length,
    rejected: registrations.filter(r => r.paymentStatus === 'rejected').length,
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-card/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl text-center shadow-2xl"
        >
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold mb-2">لوحة الإدارة</h1>
          <p className="text-muted-foreground mb-8">الرجاء إدخال رمز المرور للوصول إلى لوحة التحكم (الرمز: 1234)</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-center text-2xl tracking-[1em] focus:outline-none focus:border-primary transition-colors text-white"
              autoFocus
              dir="ltr"
            />
            <button 
              type="submit"
              className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              <Lock className="w-5 h-5" />
              دخول
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              إدارة التسجيلات
            </h1>
            <p className="text-muted-foreground mt-2">إجمالي المتسابقين المسجلين في دورة 2026</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'إجمالي التسجيلات', value: stats.total, color: 'text-white' },
            { label: 'قيد المراجعة', value: stats.pending, color: 'text-amber-500' },
            { label: 'تم التحقق', value: stats.verified, color: 'text-green-500' },
            { label: 'مرفوض', value: stats.rejected, color: 'text-red-500' },
          ].map((stat, i) => (
            <div key={i} className="bg-card/40 border border-white/5 rounded-2xl p-5">
              <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
              <p className={`text-3xl font-bold font-serif ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="بحث بالاسم، الكود، الإيميل، أو الهاتف..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pr-11 pl-4 text-white focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
            <Filter className="w-5 h-5" />
            تصفية
          </button>
        </div>

        {/* Table */}
        <div className="bg-card/60 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead className="text-xs text-white/50 uppercase bg-black/40 border-b border-white/5">
                <tr>
                  <th className="px-6 py-4 font-medium">الكود</th>
                  <th className="px-6 py-4 font-medium">الاسم</th>
                  <th className="px-6 py-4 font-medium">الاتصال</th>
                  <th className="px-6 py-4 font-medium">القصة / التصنيف</th>
                  <th className="px-6 py-4 font-medium">تاريخ التسجيل</th>
                  <th className="px-6 py-4 font-medium">الحالة</th>
                  <th className="px-6 py-4 font-medium text-center">إجراء</th>
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
                      <td className="px-6 py-4 font-serif text-primary tracking-wider" dir="ltr">{reg.code}</td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-white">{reg.name}</div>
                        {reg.penName && <div className="text-xs text-muted-foreground mt-0.5">مستعار: {reg.penName}</div>}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        <div dir="ltr" className="text-right">{reg.phone}</div>
                        <div>{reg.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-white font-serif">{reg.storyName}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{reg.category}</div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground" dir="ltr">
                        {new Date(reg.registeredAt).toLocaleDateString('en-GB')}
                      </td>
                      <td className="px-6 py-4">
                        {reg.paymentStatus === 'pending' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-500 text-xs font-medium"><Clock className="w-3.5 h-3.5"/> قيد المراجعة</span>}
                        {reg.paymentStatus === 'verified' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-500/10 text-green-500 text-xs font-medium"><CheckCircle className="w-3.5 h-3.5"/> تم التحقق</span>}
                        {reg.paymentStatus === 'rejected' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-500/10 text-red-500 text-xs font-medium"><XCircle className="w-3.5 h-3.5"/> مرفوض</span>}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="p-2 hover:bg-white/10 rounded-lg transition-colors outline-none">
                            <MoreVertical className="w-5 h-5 text-muted-foreground" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 bg-card border-white/10 text-right">
                            <DropdownMenuItem 
                              className="cursor-pointer focus:bg-white/5 focus:text-white flex items-center justify-end gap-2"
                              onClick={() => handleStatusChange(reg.code, 'pending')}
                            >
                              قيد المراجعة
                              <Clock className="w-4 h-4 text-amber-500" />
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="cursor-pointer focus:bg-white/5 focus:text-white flex items-center justify-end gap-2"
                              onClick={() => handleStatusChange(reg.code, 'verified')}
                            >
                              تم التحقق
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="cursor-pointer focus:bg-white/5 focus:text-white flex items-center justify-end gap-2"
                              onClick={() => handleStatusChange(reg.code, 'rejected')}
                            >
                              مرفوض
                              <XCircle className="w-4 h-4 text-red-500" />
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                
                {filteredRegs.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                      لا يوجد تسجيلات مطابقة للبحث.
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
