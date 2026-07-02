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
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/30">
      <header className="sticky top-0 z-50 w-full border-b border-black/5 bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group outline-none">
            <div className="w-10 h-10 rounded-full border border-primary/20 bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary/10 transition-all duration-300">
              <Feather className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-lg font-bold tracking-[0.2em] text-primary leading-none uppercase mt-1">Hekayaty</span>
              <span className="text-[10px] text-muted-foreground tracking-widest mt-1">AWARDS 2026</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={`text-sm font-semibold transition-all duration-300 outline-none relative py-2 ${
                  location === link.href 
                    ? 'text-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {link.label}
                {location === link.href && (
                  <motion.div 
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                  />
                )}
              </Link>
            ))}
            <Link 
              href="/register"
              className="gold-gradient text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-[0_4px_14px_rgba(201,168,76,0.4)] hover:shadow-[0_6px_20px_rgba(201,168,76,0.5)] hover:-translate-y-0.5 transition-all shimmer-button"
            >
              سجّل الآن
            </Link>
          </nav>

          <button 
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-black/5 overflow-hidden"
          >
            <div className="flex flex-col px-6 py-4 gap-4">
              {links.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-base font-semibold py-2 ${
                    location === link.href ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link 
                href="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="gold-gradient text-white px-6 py-3 rounded-xl font-bold text-center mt-2 shadow-[0_4px_14px_rgba(201,168,76,0.4)]"
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

      <footer className="border-t border-black/5 bg-white py-16 mt-auto relative z-10">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-6 text-primary">
            <Feather className="w-6 h-6" />
            <span className="font-serif text-2xl font-bold tracking-[0.2em] uppercase mt-1">Hekayaty</span>
          </div>
          <p className="text-muted-foreground max-w-md mx-auto mb-10 text-sm leading-relaxed">
            نحتفي بالقصص التي تصيغ عالمنا. منصة الجوائز الأدبية الأرقى في الوطن العربي.
          </p>
          <div className="h-[1px] w-24 mx-auto bg-gradient-to-r from-transparent via-primary/30 to-transparent mb-8" />
          <p className="text-xs text-muted-foreground/60 tracking-wider font-serif">
            © 2026 HEKAYATY AWARDS. ALL RIGHTS RESERVED.
          </p>
        </div>
      </footer>
    </div>
  );
}
