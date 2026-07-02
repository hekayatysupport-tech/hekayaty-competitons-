import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence, type Variants, useMotionValue, useSpring } from 'framer-motion';
import { Link } from 'wouter';
import { Feather, ChevronDown, Award, Calendar, BookOpen, Sparkles, HelpCircle, Trophy } from 'lucide-react';

const CinematicHero = () => {
  // Use framer-motion values — no React state, no re-renders on mousemove
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const portalX = useSpring(rawX, { stiffness: 50, damping: 20, mass: 1 });
  const portalY = useSpring(rawY, { stiffness: 50, damping: 20, mass: 1 });
  const particlesX = useSpring(rawX, { stiffness: 30, damping: 25 });
  const particlesY = useSpring(rawY, { stiffness: 30, damping: 25 });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      rawX.set(nx * 15);
      rawY.set(ny * 15);
    };
    window.addEventListener('mousemove', handler, { passive: true });
    return () => window.removeEventListener('mousemove', handler);
  }, [rawX, rawY]);

  const particles = useMemo(() => Array.from({ length: 40 }).map(() => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1,
    delay: Math.random() * 5,
    duration: Math.random() * 8 + 4,
    isGold: Math.random() > 0.3
  })), []);

  const books = useMemo(() => Array.from({ length: 5 }).map(() => ({
    top: Math.random() * 80 + 10,
    left: Math.random() * 80 + 10,
    rotate: Math.random() * 60 - 30,
    delay: Math.random() * 2
  })), []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Layer 0 — Deep space */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050508] via-[#09090f] to-[#09090f]" />
      
      {/* Layer 1 — Aurora */}
      <div className="absolute inset-0 aurora-bg opacity-60" />

      {/* Layer 2 — Light rays */}
      {[...Array(6)].map((_, i) => (
        <div key={`ray-${i}`} className="light-ray absolute top-0 h-full w-[1px] bg-gradient-to-b from-transparent via-primary/20 to-transparent"
          style={{ left: `${15 + i * 14}%`, opacity: 0.04 + i * 0.01, animationDelay: `${i * 0.7}s` }} />
      ))}

      {/* Layer 3 — Portal (parallax) */}
      <motion.div 
        className="absolute top-1/2 left-1/2"
        style={{ x: portalX, y: portalY, translateX: '-50%', translateY: '-50%' }}
      >
        <div className="w-[500px] h-[500px] md:w-[700px] md:h-[700px] rounded-full border border-primary/10 absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2" style={{ boxShadow: '0 0 60px rgba(201,168,76,0.08) inset, 0 0 120px rgba(201,168,76,0.05)' }} />
        <div className="w-[300px] h-[300px] md:w-[450px] md:h-[450px] rounded-full absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2" style={{ background: 'radial-gradient(ellipse, rgba(148,90,255,0.12) 0%, rgba(201,168,76,0.06) 40%, transparent 70%)' }} />
      </motion.div>

      {/* Layer 4 — Particles */}
      <motion.div 
        className="absolute inset-0"
        style={{ x: particlesX, y: particlesY }}
      >
        {particles.map((p, i) => (
          <motion.div
            key={`p-${i}`}
            className="absolute rounded-full"
            style={{
              width: p.size + 'px',
              height: p.size + 'px',
              left: p.x + '%',
              top: p.y + '%',
              backgroundColor: p.isGold ? '#C9A84C' : '#9458FF'
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              ease: "linear",
              delay: p.delay,
            }}
          />
        ))}
      </motion.div>

      {/* Layer 5 — Floating book silhouettes */}
      {books.map((b, i) => (
        <div 
          key={`b-${i}`} 
          className="absolute float-slow border border-primary/20 bg-primary/5 rounded opacity-10"
          style={{
            width: '40px',
            height: '60px',
            top: b.top + '%',
            left: b.left + '%',
            transform: `rotate(${b.rotate}deg)`,
            animationDelay: `${b.delay}s`
          }}
        />
      ))}
    </div>
  );
};

export function LandingPage() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    const targetDate = new Date('2026-12-31T23:59:59');
    
    const interval = setInterval(() => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();
      
      if (difference <= 0) {
        clearInterval(interval);
        return;
      }
      
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 60 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 1, ease: "easeOut", staggerChildren: 0.2 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-background w-full overflow-hidden flex flex-col">
      
      {/* Hero Section */}
      <section className="relative min-h-[100dvh] flex flex-col items-center justify-center text-center px-4 z-10 pt-20 overflow-hidden">
        <CinematicHero />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-4xl mx-auto flex flex-col items-center"
        >
          <motion.div variants={itemVariants} className="flex items-center gap-4 mb-8">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-primary/50" />
            <span className="font-serif tracking-[0.4em] text-primary/70 text-xs uppercase font-bold">
              HEKAYATY LITERARY UNIVERSE — 2026
            </span>
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-primary/50" />
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-6xl md:text-8xl lg:text-9xl font-black mb-4 text-foreground font-sans uppercase drop-shadow-[0_0_60px_rgba(201,168,76,0.3)]">
            جوائز حكايتي
          </motion.h1>
          
          <motion.h2 variants={itemVariants} className="text-2xl md:text-3xl gold-text tracking-[0.5em] mb-10 font-bold uppercase font-serif">
            AWARDS 2026
          </motion.h2>
          
          <motion.p variants={itemVariants} className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed mb-12 font-medium">
            المنصة الأرقى للأدب العربي المعاصر. هنا تولد الروايات التي ستخلد في الذاكرة، وهنا يُحتفى بأقلام الغد.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-6 items-center mb-24">
            <Link 
              href="/register" 
              className="gold-gradient text-primary-foreground px-10 py-5 rounded-full font-bold text-lg hover:glow-gold hover:-translate-y-1 transition-all shimmer-button flex items-center gap-3 shadow-[0_4px_20px_rgba(201,168,76,0.3)]"
            >
              سجّل الآن
              <Trophy className="w-5 h-5" />
            </Link>
            <Link 
              href="/dashboard"
              className="px-10 py-5 glass-card-light text-foreground font-bold text-lg rounded-full border border-white/5 hover:border-primary/30 transition-colors"
            >
              متابعة التسجيل
            </Link>
          </motion.div>

          <motion.div variants={itemVariants} className="flex gap-4 md:gap-6 text-center">
            {[
              { label: 'يوم', value: timeLeft.days },
              { label: 'ساعة', value: timeLeft.hours },
              { label: 'دقيقة', value: timeLeft.minutes },
              { label: 'ثانية', value: timeLeft.seconds },
            ].map((item, i) => (
              <div key={i} className="glass-card rounded-2xl p-4 md:p-6 flex flex-col items-center min-w-[70px] md:min-w-[100px] energy-border">
                <span className="text-3xl md:text-5xl font-black font-serif gold-text drop-shadow-md">{String(item.value).padStart(2, '0')}</span>
                <span className="text-xs md:text-sm text-primary/60 uppercase tracking-widest mt-2 font-bold">{item.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div 
          animate={{ y: [0, 10, 0] }} 
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 text-muted-foreground/30 hover:text-primary/70 transition-colors cursor-pointer"
        >
          <ChevronDown className="w-8 h-8" />
        </motion.div>
      </section>

      {/* About Section */}
      <section className="py-32 px-4 relative z-10 section-elevated border-y border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-12"
          >
            <div className="relative inline-block">
              <div className="absolute inset-0 glow-gold opacity-50 rounded-full blur-xl" />
              <BookOpen className="w-16 h-16 text-primary relative z-10 mx-auto" strokeWidth={1} />
            </div>
            
            <div className="flex items-center justify-center gap-6">
              <div className="h-[1px] w-24 bg-gradient-to-r from-transparent to-primary/40" />
              <div className="w-2 h-2 rounded-full bg-primary/40" />
              <div className="h-[1px] w-24 bg-gradient-to-l from-transparent to-primary/40" />
            </div>

            <p className="text-xl md:text-2xl text-foreground/90 leading-loose max-w-3xl mx-auto font-medium">
              جوائز حكايتي هي احتفالية أدبية سنوية تهدف إلى اكتشاف وتسليط الضوء على الأصوات الإبداعية الشابة في العالم العربي. نؤمن بأن كل قصة تستحق أن تُروى، وكل كاتب يستحق مسرحاً بحجم موهبته. في عام 2026، نفتح أبواب الخيال لستة تصنيفات أدبية تتنافس على شرف الصدارة.
            </p>

            <div className="flex items-center justify-center gap-6">
              <div className="h-[1px] w-24 bg-gradient-to-r from-transparent to-primary/40" />
              <div className="w-2 h-2 rounded-full bg-primary/40" />
              <div className="h-[1px] w-24 bg-gradient-to-l from-transparent to-primary/40" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Awards Section */}
      <section className="py-40 px-4 relative z-10 section-dark overflow-hidden">
        <div className="absolute inset-0 aurora-bg opacity-30" />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-24"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-6 gold-text uppercase tracking-widest font-serif">قيمة الجوائز</h2>
            <p className="text-muted-foreground text-lg">تُمنح الجوائز للأعمال الثلاثة الأفضل من بين جميع التصنيفات</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {[
              { title: 'المركز الثاني', prize: '30,000 ج.م', delay: 0.2 },
              { title: 'المركز الأول', prize: '50,000 ج.م', sub: '+ درع حكايتي الذهبي', delay: 0, highlight: true },
              { title: 'المركز الثالث', prize: '15,000 ج.م', delay: 0.4 },
            ].map((award, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: award.delay }}
                whileHover={{ y: -16, transition: { duration: 0.3 } }}
                className={`relative flex flex-col items-center p-12 rounded-3xl glass-card luxury-shadow transition-all duration-300 group overflow-hidden ${
                  award.highlight ? 'z-10 md:scale-110 border-primary/50 glow-gold py-16' : 'energy-border'
                }`}
              >
                {/* Shimmer sweep on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out" />
                
                {award.highlight && (
                  <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-primary/0 via-primary to-primary/0" />
                )}

                {award.highlight && (
                  <div className="absolute -top-4 gold-gradient text-primary-foreground px-6 py-1.5 rounded-full text-sm font-bold tracking-widest uppercase shadow-md">
                    الجائزة الكبرى
                  </div>
                )}
                
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full" />
                  <Trophy className={`w-20 h-20 relative z-10 ${award.highlight ? 'text-primary' : 'text-muted-foreground/50'}`} strokeWidth={1} />
                </div>
                
                <h3 className="text-xl text-foreground/80 font-bold mb-4 uppercase tracking-widest">{award.title}</h3>
                <div className={`text-4xl lg:text-5xl font-black font-serif my-2 drop-shadow-md ${award.highlight ? 'gold-text glow-gold' : 'text-primary/90'}`}>
                  {award.prize}
                </div>
                {award.sub && <p className="text-primary font-bold mt-6 flex items-center gap-2"><Sparkles className="w-4 h-4"/> {award.sub}</p>}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-40 px-4 section-elevated relative z-10 overflow-hidden border-y border-white/5">
        <div className="max-w-6xl mx-auto relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-32"
          >
            <Calendar className="w-12 h-12 text-primary mx-auto mb-6 opacity-80" strokeWidth={1} />
            <h2 className="text-4xl font-black mb-4 text-foreground uppercase tracking-widest">الخط الزمني</h2>
            <div className="w-16 h-1 gold-gradient mx-auto rounded-full mb-6" />
            <p className="text-muted-foreground text-lg">رحلة المنافسة من التسجيل وحتى التتويج</p>
          </motion.div>

          <div className="relative">
            {/* Desktop line */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-[2px] bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 -translate-y-1/2" style={{ boxShadow: '0 0 15px rgba(201,168,76,0.3)' }}>
               {/* Traveling light */}
               <motion.div 
                 animate={{ x: ['0%', '100%'] }} 
                 transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                 className="absolute top-1/2 w-32 h-[2px] bg-gradient-to-r from-transparent via-white to-transparent -translate-y-1/2" 
               />
            </div>
            
            {/* Mobile line */}
            <div className="md:hidden absolute top-0 right-10 w-[2px] h-full bg-gradient-to-b from-primary/0 via-primary/50 to-primary/0 shadow-[0_0_15px_rgba(201,168,76,0.3)]" />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-6 relative z-10">
              {[
                { title: 'التسجيل', desc: 'استقبال الأعمال المشاركة وتأكيد صحتها', date: 'يناير - مارس 2026' },
                { title: 'التحكيم', desc: 'مراجعة الأعمال من قبل لجنة من كبار النقاد', date: 'أبريل - يونيو 2026' },
                { title: 'الإعلان', desc: 'إعلان القائمة القصيرة للمرشحين', date: 'أغسطس 2026' },
                { title: 'التكريم', desc: 'الحفل الختامي وتوزيع الجوائز', date: 'أكتوبر 2026' },
              ].map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className={`relative flex md:flex-col items-center gap-6 md:gap-0 group ${
                    i % 2 === 0 ? 'md:-translate-y-20' : 'md:translate-y-20'
                  }`}
                >
                  <div className="w-20 h-20 shrink-0 rounded-full bg-[#10101a] border border-primary/30 flex items-center justify-center md:mb-8 luxury-shadow z-10 relative group-hover:glow-gold transition-all duration-300">
                    <div className="absolute inset-1 rounded-full gold-gradient flex items-center justify-center opacity-90 group-hover:opacity-100 transition-opacity">
                       <span className="font-serif font-bold text-2xl text-primary-foreground">{i + 1}</span>
                    </div>
                  </div>
                  <div className="md:text-center glass-card p-8 rounded-3xl w-full group-hover:-translate-y-2 transition-transform duration-300">
                    <p className="text-sm gold-text mb-3 font-bold tracking-widest uppercase">{step.date}</p>
                    <h3 className="text-2xl font-black mb-3 text-foreground">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Sponsors Section */}
      <section className="py-32 px-4 relative z-10 section-dark border-b border-white/5">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <h2 className="text-xl font-bold text-muted-foreground uppercase tracking-[0.3em] mb-6">شركاء النجاح</h2>
            <div className="w-12 h-[1px] bg-primary/20 mx-auto rounded-full" />
          </motion.div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="aspect-video glass-card-light rounded-2xl flex items-center justify-center grayscale opacity-40 hover:grayscale-0 hover:opacity-100 hover:border-primary/30 transition-all duration-500 cursor-pointer"
              >
                <div className="w-2/3 h-1/3 bg-white/10 rounded" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-40 px-4 relative z-10 section-elevated">
        <div className="max-w-3xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <HelpCircle className="w-12 h-12 text-primary mx-auto mb-6 opacity-80" strokeWidth={1} />
            <h2 className="text-4xl font-black mb-6 text-foreground">الأسئلة الشائعة</h2>
            <div className="w-16 h-1 gold-gradient mx-auto rounded-full" />
          </motion.div>

          <div className="space-y-4">
            {[
              { q: 'هل يمكنني المشاركة بأكثر من قصة؟', a: 'لا، يُسمح لكل كاتب بالمشاركة بعمل واحد فقط في دورة 2026 لضمان تكافؤ الفرص.' },
              { q: 'هل يجب أن تكون القصة منشورة سابقاً؟', a: 'تُقبل فقط الأعمال غير المنشورة (سواء ورقياً أو إلكترونياً) لضمان حصرية المسابقة.' },
              { q: 'كيف يتم تأكيد دفع رسوم التسجيل؟', a: 'بعد تحويل الرسوم (150 جنيه مصري)، يتم رفع الإيصال وسيتم مراجعته من قبل الإدارة خلال 48 ساعة لتأكيد تسجيلك.' },
              { q: 'هل يمكنني استخدام اسم مستعار؟', a: 'نعم، نوفر خيار التسجيل باسم مستعار مع الاحتفاظ ببياناتك الحقيقية بسرية تامة لدى الإدارة.' },
            ].map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`glass-card rounded-2xl overflow-hidden transition-all duration-300 ${activeFaq === i ? 'energy-border bg-[#10101a]' : ''}`}
              >
                <button 
                  className="w-full text-right p-6 md:p-8 flex justify-between items-center focus:outline-none hover:bg-white/5 transition-colors"
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                >
                  <span className="font-bold text-lg md:text-xl text-foreground pr-2">{faq.q}</span>
                  <div className={`shrink-0 w-10 h-10 rounded-full border border-primary/20 flex items-center justify-center transition-all duration-300 ${activeFaq === i ? 'rotate-180 bg-primary/20 glow-gold text-primary' : 'text-muted-foreground'}`}>
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </button>
                <AnimatePresence>
                  {activeFaq === i && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-8 pb-8 text-muted-foreground leading-relaxed border-t border-white/5 pt-6 text-lg"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-40 px-4 relative z-10 section-dark overflow-hidden">
        <div className="absolute inset-0 aurora-bg opacity-50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-12 md:p-24 rounded-[3rem] glow-gold luxury-shadow"
          >
            <Sparkles className="w-16 h-16 text-primary mx-auto mb-10" strokeWidth={1} />
            <h2 className="text-4xl md:text-6xl font-black mb-8 gold-text font-serif leading-tight">قصتك تنتظر من يكتشفها</h2>
            <p className="text-xl md:text-2xl text-muted-foreground mb-16 max-w-2xl mx-auto leading-relaxed">
              بادر بالتسجيل الآن وكن جزءاً من الحدث الأدبي الأضخم لعام 2026.
            </p>
            <Link 
              href="/register" 
              className="inline-flex items-center justify-center gap-4 px-14 py-6 gold-gradient text-primary-foreground font-bold text-xl rounded-full shadow-[0_0_40px_rgba(201,168,76,0.4)] hover:shadow-[0_0_60px_rgba(201,168,76,0.6)] hover:-translate-y-1 transition-all shimmer-button"
            >
              سجّل عملك الآن
              <Trophy className="w-6 h-6" />
            </Link>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
