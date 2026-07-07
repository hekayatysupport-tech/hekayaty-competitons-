import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Feather, Menu, X, LogOut, LogIn, Shield, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAdmin, isLoading, signOut } = useAuth();

  const baseLinks = [
    { href: '/', label: 'الرئيسية' },
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
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <header className="sticky top-0 z-50 w-full border-b" style={{ borderColor: 'rgba(201,168,76,0.12)', background: 'rgba(9,9,15,0.85)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}>
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group outline-none">
            <motion.div 
              animate={{ boxShadow: ['0 0 10px rgba(201,168,76,0.1)', '0 0 25px rgba(201,168,76,0.4)', '0 0 10px rgba(201,168,76,0.1)'] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="w-10 h-10 rounded-full border border-primary/20 bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary/10 transition-all duration-300 relative"
            >
              <Feather className="w-5 h-5 relative z-10" />
            </motion.div>
            <div className="flex flex-col">
              <span className="font-serif text-lg font-bold tracking-[0.2em] gold-text leading-none uppercase mt-1">Hekayaty</span>
              <span className="text-[10px] text-muted-foreground/60 tracking-widest mt-1">AWARDS 2026</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={`text-sm font-semibold transition-all duration-300 outline-none relative py-2 ${
                  location === link.href 
                    ? 'text-primary' 
                    : 'text-foreground/60 hover:text-primary'
                }`}
              >
                {link.label}
                {location === link.href && (
                  <motion.div 
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-full shadow-[0_0_8px_rgba(201,168,76,0.8)]"
                  />
                )}
              </Link>
            ))}

            {/* Auth Buttons */}
            {!isLoading && (
              user ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
                    {isAdmin
                      ? <Shield className="w-4 h-4 text-primary" />
                      : <User className="w-4 h-4 text-primary" />
                    }
                    <span className="text-xs text-foreground/70 font-medium max-w-[120px] truncate" dir="ltr">
                      {user.email}
                    </span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm font-bold text-foreground/70 hover:text-rose-400 hover:border-rose-400/30 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    خروج
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    href="/login"
                    className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-full text-sm font-bold text-foreground/70 hover:text-primary hover:border-primary/30 transition-all"
                  >
                    <LogIn className="w-4 h-4" />
                    تسجيل الدخول
                  </Link>
                  <Link 
                    href="/register"
                    className="gold-gradient text-primary-foreground px-6 py-2.5 rounded-full font-bold text-sm shadow-[0_4px_14px_rgba(201,168,76,0.1)] hover:glow-gold hover:-translate-y-0.5 transition-all shimmer-button"
                  >
                    سجّل الآن
                  </Link>
                </div>
              )
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden relative z-50 min-w-[44px] min-h-[44px] flex items-center justify-center text-foreground/80 hover:text-primary transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
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
            className="md:hidden fixed inset-0 z-40 bg-[#09090F] flex flex-col pt-24 px-6"
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

              <div className="h-[1px] w-full bg-white/10 my-2" />

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
                      className="flex items-center gap-3 min-h-[44px] text-xl font-bold text-foreground/70 hover:text-primary"
                    >
                      <LogIn className="w-5 h-5" />
                      تسجيل الدخول
                    </Link>
                    <Link 
                      href="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="gold-gradient text-primary-foreground px-6 min-h-[56px] flex items-center justify-center rounded-2xl font-bold text-lg glow-gold shimmer-button"
                    >
                      سجّل الآن
                    </Link>
                  </>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col relative z-10">
        {children}
      </main>

      <footer className="border-t border-white/5 bg-[#050508] py-24 mt-auto relative z-10">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-8">
            <Feather className="w-6 h-6 text-primary" />
            <span className="font-serif text-2xl font-bold tracking-[0.2em] uppercase mt-1 gold-text">Hekayaty</span>
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
}
