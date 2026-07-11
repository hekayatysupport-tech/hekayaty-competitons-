import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, X, LogOut, LogIn, Shield, User, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const Layout = React.memo(function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAdmin, isLoading, signOut } = useAuth();

  const baseLinks = [
    { href: '/', label: 'الرئيسية' },
    { href: '/#about', label: 'عن المسابقة' },
    { href: '/#awards', label: 'الجوائز' },
    { href: '/#terms', label: 'الشروط' },
    { href: '/#faq', label: 'الأسئلة الشائعة' },
    { href: '/#contact', label: 'تواصل معنا' },
  ];

  const adminLinks = isAdmin
    ? [{ href: '/admin', label: 'الإدارة' }]
    : [];

  const savedCode = typeof window !== 'undefined' ? localStorage.getItem('hekayaty_active_code') : null;

  const participantLinks = (!isAdmin && savedCode)
    ? [{ href: `/dashboard?code=${savedCode}`, label: 'لوحة التحكم' }]
    : [];

  const links = [...baseLinks, ...participantLinks, ...adminLinks];

  const handleSignOut = async () => {
    await signOut();
    setIsMobileMenuOpen(false);
    toast('تم تسجيل الخروج');
    setLocation('/');
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans" dir="rtl">
      <header className="fixed top-0 z-50 w-full" style={{ background: 'linear-gradient(180deg, rgba(10,5,3,0.9) 0%, rgba(10,5,3,0.7) 50%, rgba(10,5,3,0) 100%)' }}>
        <div className="container mx-auto px-8 h-24 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex flex-col outline-none z-50">
            <span className="font-serif text-2xl font-bold tracking-[0.25em] gold-text uppercase">Hekayaty</span>
            <span className="text-[10px] text-muted-foreground tracking-[0.3em] uppercase ml-1">AWARDS 2026</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {links.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={`text-[15px] font-bold transition-all duration-300 outline-none relative py-2 ${
                  location === link.href 
                    ? 'gold-text' 
                    : 'text-white/70 hover:text-[#D4AF37]'
                }`}
              >
                {link.label}
                {location === link.href && (
                  <motion.div 
                    layoutId="nav-indicator"
                    className="absolute -bottom-1 left-1/4 right-1/4 h-[2px] bg-[#D4AF37] rounded-full shadow-[0_0_8px_rgba(212,175,55,0.8)]"
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            {!isLoading && (
              user ? (
                <>
                  <div className="flex items-center gap-2 px-4 py-2 bg-black/20 border border-primary/20 rounded-lg">
                    {isAdmin
                      ? <Shield className="w-4 h-4 text-primary" />
                      : <User className="w-4 h-4 text-primary" />
                    }
                    <span className="text-sm text-foreground/80 font-medium max-w-[120px] truncate" dir="ltr">
                      {user.email}
                    </span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 px-4 py-2 bg-black/20 border border-primary/20 rounded-lg text-sm font-bold text-foreground hover:text-rose-400 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    خروج
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="flex items-center gap-2 px-6 py-2.5 bg-black/20 border border-primary/30 rounded-lg text-sm font-bold text-white hover:bg-primary/10 transition-all"
                  >
                    تسجيل الدخول
                    <LogIn className="w-4 h-4 mr-1" />
                  </Link>
                  <Link 
                    href="/register"
                    className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm text-[#120B08] transition-all shimmer-button"
                    style={{ background: 'linear-gradient(135deg, #E6C56A 0%, #D4AF37 50%, #B8860B 100%)' }}
                  >
                    <UserPlus className="w-4 h-4 ml-1" />
                    سجّل الآن
                  </Link>
                </>
              )
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden relative z-50 touch-target flex items-center justify-center text-foreground/80 hover:text-primary transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Mobile Menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="lg:hidden fixed inset-0 z-40 bg-[#120B08] flex flex-col pt-32 px-8"
          >
            <div className="flex flex-col gap-6">
              {links.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-2xl font-black font-serif transition-colors min-h-[44px] flex items-center ${
                    location === link.href ? 'gold-text' : 'text-white hover:text-primary'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              <div className="h-[1px] w-full bg-white/10 my-4" />

              {!isLoading && (
                user ? (
                  <>
                    <div className="flex items-center gap-3 text-foreground/60">
                      {isAdmin
                        ? <Shield className="w-5 h-5 text-primary" />
                        : <User className="w-5 h-5 text-primary" />
                      }
                      <span className="text-sm font-medium truncate" dir="ltr">{user.email}</span>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-3 text-xl font-bold text-rose-400 min-h-[44px]"
                    >
                      <LogOut className="w-5 h-5" />
                      تسجيل الخروج
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-3 min-h-[56px] text-lg font-bold text-white border border-primary/30 rounded-lg hover:bg-primary/10"
                    >
                      تسجيل الدخول
                      <LogIn className="w-5 h-5" />
                    </Link>
                    <Link 
                      href="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-3 min-h-[56px] rounded-lg font-bold text-lg text-[#120B08] shimmer-button mt-2"
                      style={{ background: 'linear-gradient(135deg, #E6C56A 0%, #D4AF37 50%, #B8860B 100%)' }}
                    >
                      <UserPlus className="w-5 h-5" />
                      سجّل الآن
                    </Link>
                  </>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col relative z-10 w-full">
        {children}
      </main>

      <footer className="border-t border-white/5 bg-[#120B08] py-24 mt-auto relative z-10">
        <div className="container mx-auto px-6 text-center">
          <div className="flex flex-col items-center justify-center mb-8">
            <span className="font-serif text-3xl font-bold tracking-[0.25em] gold-text uppercase">Hekayaty</span>
            <span className="text-xs text-muted-foreground tracking-[0.3em] uppercase mt-2">AWARDS 2026</span>
          </div>
          <p className="text-muted-foreground max-w-md mx-auto mb-12 text-sm leading-relaxed">
            نحتفي بالقصص التي تصيغ عالمنا. منصة الجوائز الأدبية الأرقى في الوطن العربي.
          </p>
          <div className="h-[1px] w-24 mx-auto bg-gradient-to-r from-transparent via-primary/30 to-transparent mb-8" />
          <p className="text-xs text-muted-foreground/40 tracking-wider font-serif">
            © 2026 HEKAYATY AWARDS. ALL RIGHTS RESERVED.
          </p>
        </div>
      </footer>
    </div>
  );
});
