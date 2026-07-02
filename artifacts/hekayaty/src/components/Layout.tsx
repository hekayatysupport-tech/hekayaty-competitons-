import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Feather, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const links = [
    { href: '/', label: 'الرئيسية' },
    { href: '/dashboard', label: 'لوحة التحكم' },
    { href: '/admin', label: 'الإدارة' },
  ];

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
            <Link 
              href="/register"
              className="gold-gradient text-primary-foreground px-6 py-2.5 rounded-full font-bold text-sm shadow-[0_4px_14px_rgba(201,168,76,0.1)] hover:glow-gold hover:-translate-y-0.5 transition-all shimmer-button"
            >
              سجّل الآن
            </Link>
          </nav>

          <button 
            className="md:hidden p-2 text-foreground/80 hover:text-primary transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="md:hidden absolute top-20 left-0 right-0 border-b z-40"
            style={{ borderColor: 'rgba(201,168,76,0.12)', background: 'rgba(9,9,15,0.95)', backdropFilter: 'blur(24px)' }}
          >
            <div className="flex flex-col px-6 py-6 gap-6">
              {links.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-base font-semibold transition-colors ${
                    location === link.href ? 'text-primary' : 'text-foreground/70 hover:text-primary'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link 
                href="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="gold-gradient text-primary-foreground px-6 py-3 rounded-xl font-bold text-center mt-2 glow-gold shimmer-button"
              >
                سجّل الآن
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col relative z-10">
        {children}
      </main>

      <footer className="border-t border-white/5 bg-[#050508] py-16 mt-auto relative z-10">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Feather className="w-6 h-6 text-primary" />
            <span className="font-serif text-2xl font-bold tracking-[0.2em] uppercase mt-1 gold-text">Hekayaty</span>
          </div>
          <p className="text-muted-foreground max-w-md mx-auto mb-10 text-sm leading-relaxed">
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
