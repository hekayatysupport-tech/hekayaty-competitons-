import { useState, useEffect } from 'react';
import { useRegistrations, Registration, RegistrationStatus } from '@/hooks/useRegistrations';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Search, Shield, MoreVertical, CheckCircle, XCircle, Clock, Users, LogOut, Loader2, Image as ImageIcon, MessageSquare, Ticket, FileText, Upload, Star, AlertTriangle, CreditCard, ArrowUpRight, Filter } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  
  const { getRegistrations, updateStatus } = useRegistrations();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dataLoading, setDataLoading] = useState(false);

  // Modals state
  const [proofModal, setProofModal] = useState<{ isOpen: boolean; type?: string; data?: string; code?: string }>({ isOpen: false });
  const [statusModal, setStatusModal] = useState<{ isOpen: boolean; code: string; status: RegistrationStatus }>({ isOpen: false, code: '', status: 'Payment Submitted' });
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      setIsAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchRegistrations = async () => {
    setDataLoading(true);
    const data = await getRegistrations();
    setRegistrations(data);
    setDataLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchRegistrations();
    }
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error('بيانات الدخول غير صحيحة');
      setPassword('');
    }
    setLoginLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setRegistrations([]);
    toast('تم تسجيل الخروج بنجاح');
  };

  const confirmStatusChange = async () => {
    const { code, status } = statusModal;
    const success = await updateStatus(code, status, adminNotes);
    
    if (success) {
      setRegistrations(prev =>
        prev.map(r => r.code === code ? { ...r, registrationStatus: status, adminNotes: adminNotes } : r)
      );
      if (status === 'Approved') toast.success('تم قبول الطلب نهائياً ✓');
      else if (status === 'Rejected') toast.error('تم رفض الطلب');
      else if (status === 'Needs Attention') toast('تم إرسال طلب التصحيح للمشترك');
      else if (status === 'Payment Verified') toast.success('تم التحقق من الدفع');
      else toast('تم تحديث الحالة');
    } else {
      toast.error('حدث خطأ أثناء تحديث الحالة');
    }
    
    setStatusModal({ isOpen: false, code: '', status: 'Payment Submitted' });
    setAdminNotes('');
  };

  const filteredRegs = registrations.filter(r => {
    const q = searchQuery.toLowerCase();
    return (
      r.code.toLowerCase().includes(q) ||
      r.name.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.phone.includes(q) ||
      (r.paymentReference && r.paymentReference.toLowerCase().includes(q))
    );
  }).sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime());

  // Enhanced Stats
  const verifiedRevenue = registrations.filter(r => ['Payment Verified','Waiting For Novel Upload','Novel Uploaded','Under Review','Approved'].includes(r.registrationStatus)).reduce((acc, curr) => acc + (curr.packageType === 'package_a' ? 100 : 150), 0);
  const pendingRevenue  = registrations.filter(r => r.registrationStatus === 'Payment Submitted').reduce((acc, curr) => acc + (curr.packageType === 'package_a' ? 100 : 150), 0);
  const totalStories    = registrations.reduce((acc, curr) => acc + (curr.stories?.length || 0), 0);
  const packageACount   = registrations.filter(r => r.packageType === 'package_a').length;
  const packageBCount   = registrations.filter(r => r.packageType === 'package_b').length;

  const stats = {
    total: registrations.length,
    pending: registrations.filter(r => r.registrationStatus === 'Payment Submitted' || r.registrationStatus === 'Waiting For Novel Upload').length,
    underReview: registrations.filter(r => r.registrationStatus === 'Under Review').length,
    approved: registrations.filter(r => r.registrationStatus === 'Approved').length,
    rejected: registrations.filter(r => r.registrationStatus === 'Rejected').length,
    needsAttention: registrations.filter(r => r.registrationStatus === 'Needs Attention').length,
    revenue: verifiedRevenue,
    expectedRevenue: verifiedRevenue + pendingRevenue,
    stories: totalStories,
    pkgA: packageACount,
    pkgB: packageBCount
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center section-dark">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 section-dark overflow-hidden relative font-sans">
        <div className="absolute inset-0 bg-[#0A0503]" />
        <div className="absolute inset-0 aurora-bg opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
        
        {[...Array(10)].map((_, i) => (
          <div key={`p-${i}`} className="absolute rounded-full bg-primary float" 
               style={{ width: Math.random()*3+1, height: Math.random()*3+1, left: `${Math.random()*100}%`, top: `${Math.random()*100}%`, animationDelay: `${Math.random()*5}s`, opacity: 0.3 }} />
        ))}

        <motion.div 
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="w-full max-w-md bg-[#120B08] border border-primary/30 p-12 rounded-[3rem] text-center glow-gold relative z-10 shadow-[0_20px_50px_rgba(201,168,76,0.15)] energy-border"
        >
          <div className="w-24 h-24 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center mx-auto mb-10 shadow-[0_0_30px_rgba(201,168,76,0.2)]">
            <Lock className="w-10 h-10 text-primary animate-pulse" strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl font-black mb-4 text-foreground font-serif tracking-wide">بوابة الإدارة</h1>
          <p className="text-muted-foreground mb-12 text-sm uppercase tracking-widest font-bold">الوصول المصرح فقط</p>
          
          <form onSubmit={handleLogin} className="space-y-6 text-right">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-foreground/80">البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@hekayaty.com"
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-foreground focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all"
                dir="ltr"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-foreground/80">كلمة المرور</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-center text-3xl tracking-[0.5em] focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all text-primary font-mono shadow-inner"
                required
              />
            </div>
            <button 
              type="submit"
              disabled={loginLoading}
              className="w-full py-6 gold-gradient text-primary-foreground font-bold text-xl rounded-2xl shadow-[0_0_20px_rgba(201,168,76,0.3)] hover:shadow-[0_0_30px_rgba(201,168,76,0.5)] transition-all flex items-center justify-center gap-3 shimmer-button disabled:opacity-70"
            >
              {loginLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>دخول <ArrowUpRight className="w-6 h-6" /></>}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] py-24 px-4 md:px-8 section-dark font-sans relative">
      <div className="absolute inset-0 bg-[#0A0503] pointer-events-none" />
      <div className="absolute inset-0 aurora-bg opacity-20 pointer-events-none" />
      
      <div className="max-w-[1400px] mx-auto space-y-12 relative z-10">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-black flex items-center gap-4 text-foreground font-serif">
              <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20 glow-gold">
                <Shield className="w-8 h-8 text-primary" strokeWidth={1.5} />
              </div>
              لوحة التحكم
            </h1>
            <p className="text-muted-foreground mt-4 text-lg">نظرة شاملة على التسجيلات، الأرباح، والأعمال الأدبية لدورة 2026</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-400 transition-colors font-bold text-foreground"
          >
            <LogOut className="w-5 h-5" />
            تسجيل الخروج
          </button>
        </div>

        {/* Enhanced Stats Row 1: Users & Revenue */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-[#120B08] border border-primary/30 rounded-3xl p-8 glow-gold flex flex-col justify-between relative overflow-hidden shadow-[0_10px_30px_rgba(201,168,76,0.1)] energy-border">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full opacity-30 pointer-events-none" />
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="p-3 bg-black/40 rounded-2xl border border-white/5"><Users className="w-6 h-6 text-primary" /></div>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">المشتركون</p>
            </div>
            <p className="text-5xl font-black font-serif gold-text relative z-10 drop-shadow-md">
              {dataLoading ? <Loader2 className="w-8 h-8 animate-spin" /> : stats.total}
            </p>
          </div>

          <div className="bg-[#120B08] border border-[#34d399]/30 rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden shadow-[0_10px_30px_rgba(52,211,153,0.1)] energy-border">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#34d399]/5 pointer-events-none" />
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#34d399]/10 rounded-full opacity-30 pointer-events-none" />
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="p-3 bg-black/40 rounded-2xl border border-[#34d399]/10"><CreditCard className="w-6 h-6 text-[#34d399]" /></div>
              <p className="text-sm font-bold text-[#34d399] uppercase tracking-widest">أرباح محققة</p>
            </div>
            <p className="text-4xl font-black font-serif text-[#34d399] relative z-10 drop-shadow-md dir-ltr text-right">
              {dataLoading ? <Loader2 className="w-8 h-8 animate-spin" /> : `${stats.revenue} EGP`}
            </p>
          </div>

          <div className="bg-[#120B08] border border-amber-400/30 rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden shadow-[0_10px_30px_rgba(251,191,36,0.1)] energy-border">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-amber-400/5 pointer-events-none" />
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="p-3 bg-black/40 rounded-2xl border border-amber-400/10"><Clock className="w-6 h-6 text-amber-400" /></div>
              <p className="text-sm font-bold text-amber-400 uppercase tracking-widest">بانتظار التأكيد</p>
            </div>
            <p className="text-4xl font-black font-serif text-amber-400 relative z-10 drop-shadow-md">
              {dataLoading ? <Loader2 className="w-8 h-8 animate-spin" /> : stats.pending}
            </p>
            <p className="text-xs text-amber-400/70 mt-2 font-bold">(أرباح متوقعة: {stats.expectedRevenue} ج.م)</p>
          </div>

          <div className="bg-[#120B08] border border-primary/30 rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden shadow-[0_10px_30px_rgba(201,168,76,0.1)] energy-border">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-primary/5 pointer-events-none" />
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="p-3 bg-black/40 rounded-2xl border border-white/5"><FileText className="w-6 h-6 text-primary" /></div>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">الأعمال المشاركة</p>
            </div>
            <p className="text-5xl font-black font-serif text-foreground relative z-10 drop-shadow-md">
              {dataLoading ? <Loader2 className="w-8 h-8 animate-spin" /> : stats.stories}
            </p>
            <p className="text-xs text-muted-foreground mt-2 font-bold text-left w-full flex justify-between">
              <span>فردية: {stats.pkgA}</span>
              <span>متعددة: {stats.pkgB}</span>
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-6 bg-[#120B08] p-6 rounded-[2rem] border border-primary/30 shadow-[0_10px_30px_rgba(201,168,76,0.1)] energy-border">
          <div className="relative flex-1">
            <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="بحث بالاسم، الكود، الهاتف، الإيميل، أو الرقم المرجعي..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-2xl py-6 pr-16 pl-6 text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all text-lg font-medium shadow-inner"
            />
          </div>
          <button
            onClick={fetchRegistrations}
            disabled={dataLoading}
            className="flex items-center justify-center gap-3 px-10 py-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors font-bold text-foreground disabled:opacity-50"
          >
            {dataLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Filter className="w-5 h-5" />}
            تحديث
          </button>
        </div>

        {/* Table */}
        <div className="bg-[#120B08] rounded-[2.5rem] overflow-hidden border border-primary/30 shadow-[0_20px_50px_rgba(201,168,76,0.15)] energy-border relative">
          <div className="absolute top-0 left-0 w-full h-1 gold-gradient" />
          <div className="overflow-x-auto">
            {/* Desktop Table */}
            <table className="w-full text-sm text-right hidden lg:table">
              <thead className="text-xs text-primary uppercase tracking-[0.2em] bg-black/40 border-b border-primary/20">
                <tr>
                  <th className="px-6 py-6 font-bold">الكود</th>
                  <th className="px-6 py-6 font-bold">الاسم والاتصال</th>
                  <th className="px-6 py-6 font-bold">الباقة / الأعمال</th>
                  <th className="px-6 py-6 font-bold">إثبات الدفع</th>
                  <th className="px-6 py-6 font-bold">الحالة</th>
                  <th className="px-6 py-6 font-bold text-center">الإجراء</th>
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
                      <td className="px-6 py-6">
                        <div className="font-serif font-black gold-text tracking-widest whitespace-nowrap" dir="ltr">{reg.code}</div>
                        <div className="text-[10px] text-muted-foreground mt-2" dir="ltr">{new Date(reg.registeredAt).toLocaleDateString('en-GB')}</div>
                      </td>
                      
                      <td className="px-6 py-6">
                        <div className="font-bold text-foreground text-lg whitespace-nowrap">{reg.name}</div>
                        <div className="text-xs text-muted-foreground mt-1" dir="ltr">{reg.phone}</div>
                        <div className="text-[10px] opacity-70 truncate max-w-[150px]">{reg.email}</div>
                      </td>
                      
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-2 mb-2">
                          <Ticket className="w-4 h-4 text-primary" />
                          <span className="font-bold text-foreground">
                            {reg.packageType === 'package_a' ? 'فردية (100ج)' : 'متعددة (150ج)'}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {reg.stories?.length || 0} عمل أدبي
                        </div>
                        {reg.stories && reg.stories.length > 0 && (
                          <div className="text-[10px] text-primary/70 font-bold mt-1 truncate">
                            {reg.stories[0].title} {reg.stories.length > 1 ? `(+${reg.stories.length - 1} أخرى)` : ''}
                          </div>
                        )}
                        {reg.stories && reg.stories.length > 0 && reg.stories[0].upload_status === 'sent' && (
                          <div className="text-[10px] text-[#34d399] font-bold mt-1 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> تم استلام الملف
                          </div>
                        )}
                      </td>
                      
                      <td className="px-6 py-6">
                        {reg.paymentProofUrl ? (
                          <button 
                            onClick={() => setProofModal({ isOpen: true, type: 'screenshot', data: reg.paymentProofUrl, code: reg.code })}
                            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg hover:bg-indigo-500/20 transition-colors font-bold text-xs"
                          >
                            <ImageIcon className="w-4 h-4" /> عرض الصورة
                          </button>
                        ) : reg.paymentReference ? (
                          <button 
                            onClick={() => setProofModal({ isOpen: true, type: 'reference', data: reg.paymentReference, code: reg.code })}
                            className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors font-bold text-xs"
                          >
                            <Ticket className="w-4 h-4" /> {reg.paymentReference}
                          </button>
                        ) : (
                          <span className="text-xs text-muted-foreground">بدون إثبات</span>
                        )}
                      </td>
                      
                      <td className="px-6 py-6 whitespace-nowrap">
                        {/* Payment Submitted - waiting admin payment review */}
                        {reg.registrationStatus === 'Payment Submitted' && <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold"><CreditCard className="w-4 h-4"/> مراجعة الدفع</span>}
                        {/* Waiting for novel - payment received, novel not yet uploaded */}
                        {reg.registrationStatus === 'Waiting For Novel Upload' && <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold"><Upload className="w-4 h-4"/> ينتظر الرواية</span>}
                        {/* Novel uploaded, payment verified - full under review */}
                        {reg.registrationStatus === 'Under Review' && <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold"><Clock className="w-4 h-4"/> قيد المراجعة</span>}
                        {/* Approved */}
                        {reg.registrationStatus === 'Approved' && <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold"><Star className="w-4 h-4"/> مقبول ✓</span>}
                        {/* Rejected */}
                        {reg.registrationStatus === 'Rejected' && (
                          <div className="flex flex-col gap-1.5 items-start">
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold"><XCircle className="w-4 h-4"/> مرفوض</span>
                            {reg.adminNotes && <span className="text-[10px] text-rose-400 max-w-[130px] truncate" title={reg.adminNotes}>{reg.adminNotes}</span>}
                          </div>
                        )}
                        {/* Needs attention */}
                        {reg.registrationStatus === 'Needs Attention' && (
                          <div className="flex flex-col gap-1.5 items-start">
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold"><AlertTriangle className="w-4 h-4"/> يحتاج تصحيح</span>
                            {reg.adminNotes && <span className="text-[10px] text-orange-400 max-w-[130px] truncate" title={reg.adminNotes}>{reg.adminNotes}</span>}
                          </div>
                        )}
                        {/* Fallback for old statuses */}
                        {!['Payment Submitted','Waiting For Novel Upload','Under Review','Approved','Rejected','Needs Attention'].includes(reg.registrationStatus) && (
                          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/50 text-xs font-bold">{reg.registrationStatus}</span>
                        )}
                      </td>
                      
                      <td className="px-6 py-6 text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="p-3 hover:bg-white/10 rounded-2xl transition-colors outline-none focus:ring-2 focus:ring-primary/30 text-foreground">
                            <MoreVertical className="w-5 h-5" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56 bg-[#0a0a0f]/95 backdrop-blur-xl border-primary/20 shadow-[0_10px_40px_rgba(0,0,0,0.5)] rounded-2xl p-2 text-right z-50">
                            {/* --- Payment Actions --- */}
                            <DropdownMenuItem 
                              className="cursor-pointer focus:bg-emerald-500/10 focus:text-emerald-400 text-foreground flex items-center justify-end gap-3 rounded-xl py-3 font-bold transition-colors"
                              onClick={() => { setStatusModal({ isOpen: true, code: reg.code, status: 'Payment Verified' }); setAdminNotes(reg.adminNotes || ''); }}
                            >
                              تأكيد الدفع
                              <CreditCard className="w-4 h-4 text-emerald-400" />
                            </DropdownMenuItem>
                            {/* --- Submission Review Actions --- */}
                            <DropdownMenuItem 
                              className="cursor-pointer focus:bg-primary/10 focus:text-primary text-foreground flex items-center justify-end gap-3 rounded-xl py-3 font-bold mt-1 transition-colors"
                              onClick={() => { setStatusModal({ isOpen: true, code: reg.code, status: 'Approved' }); setAdminNotes(reg.adminNotes || ''); }}
                            >
                              قبول الطلب نهائياً
                              <Star className="w-4 h-4 text-primary" />
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="cursor-pointer focus:bg-orange-500/10 focus:text-orange-400 text-foreground flex items-center justify-end gap-3 rounded-xl py-3 font-bold mt-1 transition-colors"
                              onClick={() => { setStatusModal({ isOpen: true, code: reg.code, status: 'Needs Attention' }); setAdminNotes(reg.adminNotes || ''); }}
                            >
                              طلب تصحيح
                              <AlertTriangle className="w-4 h-4 text-orange-400" />
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="cursor-pointer focus:bg-rose-500/10 focus:text-rose-400 text-foreground flex items-center justify-end gap-3 rounded-xl py-3 font-bold mt-1 transition-colors"
                              onClick={() => { setStatusModal({ isOpen: true, code: reg.code, status: 'Rejected' }); setAdminNotes(reg.adminNotes || ''); }}
                            >
                              رفض الطلب
                              <XCircle className="w-4 h-4 text-rose-500" />
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                
                {!dataLoading && filteredRegs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center text-muted-foreground font-medium text-lg">
                      لا توجد تسجيلات مطابقة للبحث.
                    </td>
                  </tr>
                )}

                {dataLoading && (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center">
                      <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Mobile Cards */}
            <div className="lg:hidden flex flex-col divide-y divide-white/5">
              <AnimatePresence>
                {filteredRegs.map((reg) => (
                  <motion.div 
                    key={reg.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-6 flex flex-col gap-4 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-serif font-black gold-text tracking-widest" dir="ltr">{reg.code}</div>
                        <div className="font-bold text-foreground text-lg mt-1">{reg.name}</div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors outline-none text-foreground min-w-[44px] min-h-[44px] flex items-center justify-center">
                          <MoreVertical className="w-5 h-5" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 bg-[#0a0a0f]/95 backdrop-blur-xl border-primary/20 shadow-[0_10px_40px_rgba(0,0,0,0.5)] rounded-2xl p-2 text-right z-50">
                          {/* --- Payment Actions --- */}
                          <DropdownMenuItem 
                            className="cursor-pointer focus:bg-emerald-500/10 focus:text-emerald-400 text-foreground flex items-center justify-end gap-3 rounded-xl py-3 font-bold transition-colors"
                            onClick={() => { setStatusModal({ isOpen: true, code: reg.code, status: 'Payment Verified' }); setAdminNotes(reg.adminNotes || ''); }}
                          >
                            تأكيد الدفع
                            <CreditCard className="w-4 h-4 text-emerald-400" />
                          </DropdownMenuItem>
                          {/* --- Submission Review Actions --- */}
                          <DropdownMenuItem 
                            className="cursor-pointer focus:bg-primary/10 focus:text-primary text-foreground flex items-center justify-end gap-3 rounded-xl py-3 font-bold mt-1 transition-colors"
                            onClick={() => { setStatusModal({ isOpen: true, code: reg.code, status: 'Approved' }); setAdminNotes(reg.adminNotes || ''); }}
                          >
                            قبول الطلب نهائياً
                            <Star className="w-4 h-4 text-primary" />
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="cursor-pointer focus:bg-orange-500/10 focus:text-orange-400 text-foreground flex items-center justify-end gap-3 rounded-xl py-3 font-bold mt-1 transition-colors"
                            onClick={() => { setStatusModal({ isOpen: true, code: reg.code, status: 'Needs Attention' }); setAdminNotes(reg.adminNotes || ''); }}
                          >
                            طلب تصحيح
                            <AlertTriangle className="w-4 h-4 text-orange-400" />
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="cursor-pointer focus:bg-rose-500/10 focus:text-rose-400 text-foreground flex items-center justify-end gap-3 rounded-xl py-3 font-bold mt-1 transition-colors"
                            onClick={() => { setStatusModal({ isOpen: true, code: reg.code, status: 'Rejected' }); setAdminNotes(reg.adminNotes || ''); }}
                          >
                            رفض الطلب
                            <XCircle className="w-4 h-4 text-rose-500" />
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground text-xs mb-1">تاريخ التسجيل</div>
                        <div dir="ltr" className="text-right">{new Date(reg.registeredAt).toLocaleDateString('en-GB')}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-xs mb-1">الهاتف</div>
                        <div dir="ltr" className="text-right">{reg.phone}</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-lg text-xs font-bold text-foreground">
                        <Ticket className="w-3.5 h-3.5 text-primary" />
                        {reg.packageType === 'package_a' ? 'فردية' : 'متعددة'}
                      </span>
                      {reg.paymentProofUrl ? (
                        <button 
                          onClick={() => setProofModal({ isOpen: true, type: 'screenshot', data: reg.paymentProofUrl, code: reg.code })}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-lg text-xs font-bold"
                        >
                          <ImageIcon className="w-3.5 h-3.5" /> صورة الدفع
                        </button>
                      ) : reg.paymentReference ? (
                        <button 
                          onClick={() => setProofModal({ isOpen: true, type: 'reference', data: reg.paymentReference, code: reg.code })}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-lg text-xs font-bold"
                        >
                          <Ticket className="w-3.5 h-3.5" /> المرجعي
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 text-muted-foreground rounded-lg text-xs font-bold">
                          بدون إثبات
                        </span>
                      )}
                    </div>

                    <div>
                      {reg.registrationStatus === 'Payment Submitted' && <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold"><CreditCard className="w-3.5 h-3.5"/> مراجعة الدفع</span>}
                      {reg.registrationStatus === 'Waiting For Novel Upload' && <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold"><Upload className="w-3.5 h-3.5"/> ينتظر الرواية</span>}
                      {reg.registrationStatus === 'Under Review' && <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-bold"><Clock className="w-3.5 h-3.5"/> قيد المراجعة</span>}
                      {reg.registrationStatus === 'Approved' && <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold"><Star className="w-3.5 h-3.5"/> مقبول ✓</span>}
                      {reg.registrationStatus === 'Rejected' && <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold"><XCircle className="w-3.5 h-3.5"/> مرفوض</span>}
                      {reg.registrationStatus === 'Needs Attention' && <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold"><AlertTriangle className="w-3.5 h-3.5"/> يحتاج تصحيح</span>}
                      {!['Payment Submitted','Waiting For Novel Upload','Under Review','Approved','Rejected','Needs Attention'].includes(reg.registrationStatus) && (
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/50 text-xs font-bold">{reg.registrationStatus}</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {!dataLoading && filteredRegs.length === 0 && (
                <div className="p-12 text-center text-muted-foreground font-medium">
                  لا توجد تسجيلات مطابقة للبحث.
                </div>
              )}

              {dataLoading && (
                <div className="p-12 text-center">
                  <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Proof Modal */}
      <AnimatePresence>
        {proofModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setProofModal({ isOpen: false })}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }} 
              className="glass-card w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-[2rem] border-primary/30 luxury-shadow relative z-10 flex flex-col"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/40">
                <h3 className="text-xl font-bold text-foreground">إثبات الدفع ({proofModal.code})</h3>
                <button onClick={() => setProofModal({ isOpen: false })} className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-foreground"><XCircle className="w-6 h-6" /></button>
              </div>
              <div className="p-6 overflow-auto bg-[#0a0a0f] flex items-center justify-center min-h-[300px]">
                {proofModal.type === 'screenshot' ? (
                  <img src={proofModal.data} alt="Payment Proof" className="max-w-full rounded-xl border border-white/10 shadow-2xl" />
                ) : (
                  <div className="text-center">
                    <p className="text-muted-foreground mb-4">الرقم المرجعي (Reference Number)</p>
                    <p className="text-4xl font-black font-serif gold-text tracking-widest bg-white/5 px-8 py-4 rounded-2xl border border-white/10 select-all">{proofModal.data}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Status Update Modal */}
      <AnimatePresence>
        {statusModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setStatusModal({ isOpen: false, code: '', status: 'Payment Submitted' })}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }} 
              className="glass-card w-full max-w-lg rounded-[2rem] border-primary/30 luxury-shadow relative z-10 p-8"
            >
              <h3 className="text-2xl font-black text-foreground mb-2 text-center">تحديث حالة التسجيل</h3>
              <p className="text-center text-muted-foreground mb-8 font-serif gold-text tracking-widest">{statusModal.code}</p>
              
              <div className="space-y-6">
                <div className="p-4 rounded-xl border border-white/10 bg-black/40 flex items-center justify-between">
                  <span className="font-bold text-foreground">الحالة الجديدة:</span>
                  {statusModal.status === 'Payment Verified'  && <span className="text-emerald-400 font-bold flex items-center gap-2"><CreditCard className="w-5 h-5"/> تأكيد الدفع</span>}
                  {statusModal.status === 'Approved'          && <span className="text-primary font-bold flex items-center gap-2"><Star className="w-5 h-5"/> قبول نهائي</span>}
                  {statusModal.status === 'Needs Attention'   && <span className="text-orange-400 font-bold flex items-center gap-2"><AlertTriangle className="w-5 h-5"/> طلب تصحيح</span>}
                  {statusModal.status === 'Rejected'          && <span className="text-rose-500 font-bold flex items-center gap-2"><XCircle className="w-5 h-5"/> رفض</span>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground/80">ملاحظات الإدارة (تظهر للمستخدم في حسابه)</label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder={statusModal.status === 'Rejected' ? "الرجاء توضيح سبب الرفض..." : statusModal.status === 'Needs Attention' ? "ما الإجراء المطلوب من المشترك؟" : "ملاحظات إضافية (اختياري)..."}
                    rows={4}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-foreground focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/30 resize-none shadow-inner"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setStatusModal({ isOpen: false, code: '', status: 'Payment Submitted' })}
                    className="flex-1 py-4 glass-card-light text-foreground font-bold rounded-xl hover:bg-white/10 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button 
                    onClick={confirmStatusChange}
                    className={`flex-1 py-4 font-bold text-xl rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${
                      statusModal.status === 'Approved'       ? 'gold-gradient text-black' : 
                      statusModal.status === 'Rejected'       ? 'bg-rose-500 text-white hover:bg-rose-600' : 
                      statusModal.status === 'Needs Attention' ? 'bg-orange-500 text-white hover:bg-orange-600' :
                      statusModal.status === 'Payment Verified' ? 'bg-emerald-500 text-black hover:bg-emerald-400' :
                      'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    تأكيد وحفظ
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
