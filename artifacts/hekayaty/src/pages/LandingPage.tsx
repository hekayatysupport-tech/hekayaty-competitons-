import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';
import { Feather, ChevronDown, Award, Calendar, BookOpen, Star, HelpCircle, Trophy, Sparkles } from 'lucide-react';

const ParticleBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {[...Array(25)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-[#C9A84C]"
          style={{
            width: Math.random() * 4 + 1 + 'px',
            height: Math.random() * 4 + 1 + 'px',
            top: Math.random() * 100 + '%',
            left: Math.random() * 100 + '%',
            opacity: Math.random() * 0.5 + 0.1,
          }}
          animate={{
            y: [0, -80, 0],
            opacity: [0, Math.random() * 0.8 + 0.2, 0],
          }}
          transition={{
            duration: Math.random() * 5 + 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 3,
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

  return (
    <div className="min-h-screen bg-background w-full overflow-hidden flex flex-col">
      
      {/* Hero Section */}
      <section className="relative min-h-[95vh] flex flex-col items-center justify-center text-center px-4 z-10 pt-20 overflow-hidden">
        <ParticleBackground />
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] md:w-[40vw] md:h-[40vw] bg-[#C9A84C]/5 blur-[120px] rounded-full pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative z-10 max-w-4xl mx-auto flex flex-col items-center"
        >
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="w-20 h-20 md:w-24 md:h-24 rounded-full border border-primary/20 bg-white flex items-center justify-center text-primary mb-8 luxury-shadow"
          >
            <Feather className="w-10 h-10 md:w-12 md:h-12" />
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tight text-foreground font-serif uppercase">
            Hekayaty
          </h1>
          <h2 className="text-xl md:text-2xl lg:text-3xl gold-text tracking-[0.3em] mb-8 font-bold uppercase font-serif">
            Literary Awards 2026
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-12 font-medium">
            المنصة الأرقى للأدب العربي المعاصر. هنا تولد الروايات التي ستخلد في الذاكرة، وهنا يُحتفى بأقلام الغد.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 items-center mb-20">
            <Link 
              href="/register" 
              className="gold-gradient text-white px-10 py-5 rounded-full font-bold text-lg shadow-[0_8px_30px_rgba(201,168,76,0.3)] hover:shadow-[0_8px_40px_rgba(201,168,76,0.4)] hover:-translate-y-1 transition-all shimmer-button flex items-center gap-2"
            >
              سجّل عملك الآن
              <Feather className="w-5 h-5" />
            </Link>
            <Link 
              href="/dashboard"
              className="px-10 py-5 bg-white text-foreground font-bold text-lg rounded-full border border-black/5 hover:bg-gray-50 transition-colors luxury-shadow"
            >
              متابعة التسجيل
            </Link>
          </div>

          <div className="flex gap-4 md:gap-8 text-center glass-card px-8 py-6 rounded-3xl luxury-shadow">
            {[
              { label: 'يوم', value: timeLeft.days },
              { label: 'ساعة', value: timeLeft.hours },
              { label: 'دقيقة', value: timeLeft.minutes },
              { label: 'ثانية', value: timeLeft.seconds },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center min-w-[60px] md:min-w-[80px]">
                <span className="text-3xl md:text-5xl font-bold font-serif text-foreground">{String(item.value).padStart(2, '0')}</span>
                <span className="text-xs md:text-sm text-primary uppercase tracking-widest mt-2 font-bold">{item.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          animate={{ y: [0, 10, 0] }} 
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 text-muted-foreground/50"
        >
          <ChevronDown className="w-8 h-8" />
        </motion.div>
      </section>

      {/* About Section */}
      <section className="py-24 px-4 relative z-10 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <BookOpen className="w-12 h-12 text-primary mx-auto" strokeWidth={1.5} />
            <h2 className="text-3xl md:text-4xl font-bold">عن الجائزة</h2>
            <div className="w-16 h-1 bg-primary/30 mx-auto rounded-full" />
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              جوائز حكايتي هي احتفالية أدبية سنوية تهدف إلى اكتشاف وتسليط الضوء على الأصوات الإبداعية الشابة في العالم العربي. نؤمن بأن كل قصة تستحق أن تُروى، وكل كاتب يستحق مسرحاً بحجم موهبته. في عام 2026، نفتح أبواب الخيال لستة تصنيفات أدبية تتنافس على شرف الصدارة.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Awards Section */}
      <section className="py-32 px-4 relative z-10 bg-background">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <Award className="w-12 h-12 text-primary mx-auto mb-6" strokeWidth={1.5} />
            <h2 className="text-4xl font-bold mb-4">قيمة الجوائز</h2>
            <div className="w-16 h-1 bg-primary/30 mx-auto rounded-full mb-6" />
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
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: award.delay }}
                className={`relative flex flex-col items-center p-12 rounded-3xl bg-white luxury-shadow transition-transform duration-300 hover:-translate-y-2 ${
                  award.highlight 
                    ? 'border-t-4 border-primary z-10 md:scale-110 py-16' 
                    : 'border border-black/5'
                }`}
              >
                {award.highlight && (
                  <div className="absolute -top-4 gold-gradient text-white px-6 py-1.5 rounded-full text-sm font-bold tracking-widest uppercase shadow-md">
                    الجائزة الكبرى
                  </div>
                )}
                <Trophy className={`w-16 h-16 mb-8 ${award.highlight ? 'text-primary' : 'text-muted-foreground/50'}`} strokeWidth={1} />
                <h3 className="text-xl text-muted-foreground font-bold mb-4">{award.title}</h3>
                <div className={`text-4xl font-black font-serif my-2 ${award.highlight ? 'gold-text' : 'text-foreground'}`}>
                  {award.prize}
                </div>
                {award.sub && <p className="text-primary font-bold mt-4 flex items-center gap-1"><Sparkles className="w-4 h-4"/> {award.sub}</p>}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-32 px-4 bg-white relative z-10 overflow-hidden">
        <div className="max-w-5xl mx-auto relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-24"
          >
            <Calendar className="w-12 h-12 text-primary mx-auto mb-6" strokeWidth={1.5} />
            <h2 className="text-4xl font-bold mb-4">الخط الزمني</h2>
            <div className="w-16 h-1 bg-primary/30 mx-auto rounded-full mb-6" />
            <p className="text-muted-foreground text-lg">رحلة المنافسة من التسجيل وحتى التتويج</p>
          </motion.div>

          <div className="relative">
            {/* Desktop line */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-[2px] bg-primary/20 -translate-y-1/2" />
            {/* Mobile line */}
            <div className="md:hidden absolute top-0 right-10 w-[2px] h-full bg-primary/20" />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-6 relative z-10">
              {[
                { title: 'التسجيل', desc: 'استقبال الأعمال المشاركة وتأكيد صحتها', date: 'يناير - مارس 2026' },
                { title: 'التحكيم', desc: 'مراجعة الأعمال من قبل لجنة من كبار النقاد', date: 'أبريل - يونيو 2026' },
                { title: 'الإعلان', desc: 'إعلان القائمة القصيرة للمرشحين', date: 'أغسطس 2026' },
                { title: 'التكريم', desc: 'الحفل الختامي وتوزيع الجوائز', date: 'أكتوبر 2026' },
              ].map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`relative flex md:flex-col items-center gap-6 md:gap-0 ${
                    i % 2 === 0 ? 'md:-translate-y-16' : 'md:translate-y-16'
                  }`}
                >
                  <div className="w-20 h-20 shrink-0 rounded-full bg-white border-4 border-white flex items-center justify-center md:mb-6 shadow-[0_0_20px_rgba(201,168,76,0.2)] z-10 relative">
                    <div className="absolute inset-0 rounded-full gold-gradient opacity-20 animate-ping" style={{ animationDuration: '3s' }} />
                    <div className="absolute inset-1 rounded-full gold-gradient flex items-center justify-center">
                       <span className="font-serif font-bold text-2xl text-white">{i + 1}</span>
                    </div>
                  </div>
                  <div className="md:text-center bg-background/50 backdrop-blur-sm p-6 rounded-2xl border border-black/5 w-full">
                    <p className="text-sm text-primary mb-2 font-bold tracking-wider">{step.date}</p>
                    <h3 className="text-xl font-bold mb-2 text-foreground">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Sponsors Section */}
      <section className="py-24 px-4 relative z-10 bg-background">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold text-muted-foreground uppercase tracking-widest mb-4">شركاء النجاح</h2>
            <div className="w-12 h-1 bg-black/10 mx-auto rounded-full" />
          </motion.div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="aspect-video bg-white rounded-2xl border border-black/5 flex items-center justify-center grayscale hover:grayscale-0 opacity-50 hover:opacity-100 transition-all duration-500 luxury-shadow cursor-pointer"
              >
                <div className="w-2/3 h-1/3 bg-black/10 rounded" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 px-4 relative z-10 bg-white border-y border-black/5">
        <div className="max-w-3xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <HelpCircle className="w-12 h-12 text-primary mx-auto mb-6" strokeWidth={1.5} />
            <h2 className="text-4xl font-bold mb-4">الأسئلة الشائعة</h2>
            <div className="w-16 h-1 bg-primary/30 mx-auto rounded-full" />
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
                className="bg-background rounded-2xl border border-black/5 overflow-hidden"
              >
                <button 
                  className="w-full text-right p-6 flex justify-between items-center focus:outline-none focus:bg-gray-50 transition-colors"
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                >
                  <span className="font-bold text-lg text-foreground pr-2">{faq.q}</span>
                  <div className={`w-8 h-8 rounded-full border border-primary/20 flex items-center justify-center text-primary transition-transform duration-300 ${activeFaq === i ? 'rotate-180 bg-primary/10' : ''}`}>
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </button>
                <AnimatePresence>
                  {activeFaq === i && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-8 pb-6 text-muted-foreground leading-relaxed border-t border-black/5 pt-4"
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
      <section className="py-40 px-4 relative z-10 lavender-section">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-white p-12 md:p-20 rounded-[3rem] luxury-shadow border border-white/50"
          >
            <Sparkles className="w-12 h-12 text-accent mx-auto mb-8" strokeWidth={1.5} />
            <h2 className="text-4xl md:text-5xl font-black mb-6 text-foreground">قصتك تنتظر من يكتشفها</h2>
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              بادر بالتسجيل الآن وكن جزءاً من الحدث الأدبي الأضخم لعام 2026.
            </p>
            <Link 
              href="/register" 
              className="inline-flex items-center gap-3 px-12 py-5 gold-gradient text-white font-bold text-xl rounded-full shadow-[0_8px_30px_rgba(201,168,76,0.3)] hover:shadow-[0_8px_40px_rgba(201,168,76,0.4)] hover:-translate-y-1 transition-all shimmer-button"
            >
              سجّل عملك الآن
              <Feather className="w-6 h-6" />
            </Link>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
