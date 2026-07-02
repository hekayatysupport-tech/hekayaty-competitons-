import React from 'react';
import { Link, useLocation } from 'wouter';
import { Feather } from 'lucide-react';

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const links = [
    { href: '/', label: 'الرئيسية' },
    { href: '/register', label: 'سجّل الآن' },
    { href: '/dashboard', label: 'لوحة التحكم' },
    { href: '/admin', label: 'الإدارة' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/30">
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/60 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group outline-none">
            <div className="w-10 h-10 rounded-full border border-primary/30 bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 group-hover:shadow-[0_0_15px_rgba(201,168,76,0.3)] transition-all duration-300">
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
                className={`text-sm font-semibold transition-all duration-300 hover:text-primary outline-none focus-visible:text-primary ${
                  location === link.href 
                    ? 'text-primary drop-shadow-[0_0_8px_rgba(201,168,76,0.5)]' 
                    : 'text-muted-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col relative z-10">
        {children}
      </main>

      <footer className="border-t border-white/5 bg-background/80 py-16 mt-auto relative z-10">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-6 text-primary">
            <Feather className="w-6 h-6 opacity-80" />
            <span className="font-serif text-2xl font-bold tracking-[0.2em] uppercase mt-1">Hekayaty</span>
          </div>
          <p className="text-muted-foreground max-w-md mx-auto mb-10 text-sm leading-relaxed">
            نحتفي بالقصص التي تصيغ عالمنا. منصة الجوائز الأدبية الأرقى في الوطن العربي.
          </p>
          <div className="h-[1px] w-24 mx-auto bg-gradient-to-r from-transparent via-primary/30 to-transparent mb-8" />
          <p className="text-xs text-white/30 tracking-wider">
            © 2026 جوائز حكايتي. جميع الحقوق محفوظة.
          </p>
        </div>
      </footer>
    </div>
  );
}
