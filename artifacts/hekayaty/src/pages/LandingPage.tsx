import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Feather, ChevronDown, Award, Calendar, BookOpen, Star, HelpCircle } from 'lucide-react';

const ParticleBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-primary/20"
          style={{
            width: Math.random() * 6 + 2 + 'px',
            height: Math.random() * 6 + 2 + 'px',
            top: Math.random() * 100 + '%',
            left: Math.random() * 100 + '%',
          }}
          animate={{
            y: [0, -40, 0],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
};

export function LandingPage() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

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
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-4 z-10 pt-20">
        <ParticleBackground />
        
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background/0 to-background pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] md:w-[40vw] md:h-[40vw] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative z-10 max-w-4xl mx-auto flex flex-col items-center"
        >
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border border-primary/40 bg-primary/5 flex items-center justify-center text-primary mb-8 shadow-[0_0_30px_rgba(201,168,76,0.2)]">
            <Feather className="w-10 h-10 md:w-12 md:h-12" />
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/60">
            جوائز حكايتي
          </h1>
          <p className="font-serif text-xl md:text-2xl text-primary tracking-[0.4em] mb-8 font-bold uppercase">
            Awards 2026
          </p>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-12 font-medium">
            المنصة الأرقى للأدب العربي المعاصر. هنا تولد الروايات التي ستخلد في الذاكرة، وهنا يُحتفى بأقلام الغد.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 items-center mb-16">
            <Link 
              href="/register" 
              className="group relative px-8 py-4 bg-primary text-primary-foreground font-bold text-lg rounded-full overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(201,168,76,0.4)] outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="relative flex items-center gap-2">
                سجّل الآن
                <Feather className="w-5 h-5" />
              </span>
            </Link>
            <Link 
              href="/dashboard"
              className="px-8 py-4 bg-white/5 text-white font-bold text-lg rounded-full border border-white/10 hover:bg-white/10 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            >
              متابعة التسجيل
            </Link>
          </div>

          <div className="flex gap-4 md:gap-8 text-center bg-card/40 backdrop-blur-md border border-white/10 p-6 rounded-2xl">
            {[
              { label: 'يوم', value: timeLeft.days },
              { label: 'ساعة', value: timeLeft.hours },
              { label: 'دقيقة', value: timeLeft.minutes },
              { label: 'ثانية', value: timeLeft.seconds },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center">
                <span className="text-3xl md:text-4xl font-bold font-serif text-primary">{item.value}</span>
                <span className="text-xs md:text-sm text-muted-foreground uppercase tracking-widest mt-1">{item.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          animate={{ y: [0, 10, 0] }} 
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 text-white/30"
        >
          <ChevronDown className="w-8 h-8" />
        </motion.div>
      </section>

      {/* About Section */}
      <section className="py-24 px-4 relative z-10 bg-secondary/30 border-y border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <BookOpen className="w-12 h-12 text-primary mx-auto opacity-80" />
            <h2 className="text-3xl md:text-4xl font-bold">عن الجائزة</h2>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              جوائز حكايتي هي احتفالية أدبية سنوية تهدف إلى اكتشاف وتسليط الضوء على الأصوات الإبداعية الشابة في العالم العربي. نؤمن بأن كل قصة تستحق أن تُروى، وكل كاتب يستحق مسرحاً بحجم موهبته. في عام 2026، نفتح أبواب الخيال لستة تصنيفات أدبية تتنافس على شرف الصدارة.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Awards Section */}
      <section className="py-32 px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Award className="w-12 h-12 text-primary mx-auto mb-6 opacity-80" />
            <h2 className="text-4xl font-bold mb-4">قيمة الجوائز</h2>
            <p className="text-muted-foreground">تُمنح الجوائز للأعمال الثلاثة الأفضل من بين جميع التصنيفات</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'المركز الثاني', prize: '30,000 ج.م', delay: 0.2, scale: 0.95 },
              { title: 'المركز الأول', prize: '50,000 ج.م', sub: '+ درع حكايتي الذهبي', delay: 0, scale: 1.05, highlight: true },
              { title: 'المركز الثالث', prize: '15,000 ج.م', delay: 0.4, scale: 0.95 },
            ].map((award, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: award.delay }}
                className={`relative flex flex-col items-center p-10 rounded-3xl backdrop-blur-md border ${
                  award.highlight 
                    ? 'bg-primary/10 border-primary/50 shadow-[0_0_40px_rgba(201,168,76,0.15)] z-10 md:-translate-y-4' 
                    : 'bg-card border-white/10'
                }`}
                style={{ transform: `scale(${award.scale})` }}
              >
                {award.highlight && (
                  <div className="absolute -top-4 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-bold tracking-widest uppercase">
                    الجائزة الكبرى
                  </div>
                )}
                <Star className={`w-12 h-12 mb-6 ${award.highlight ? 'text-primary fill-primary/20' : 'text-muted-foreground'}`} />
                <h3 className="text-2xl font-bold mb-2">{award.title}</h3>
                <div className="text-4xl font-black font-serif text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 my-4">
                  {award.prize}
                </div>
                {award.sub && <p className="text-primary font-bold mt-2">{award.sub}</p>}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-24 px-4 bg-secondary/30 border-y border-white/5 relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <Calendar className="w-12 h-12 text-primary mx-auto mb-6 opacity-80" />
            <h2 className="text-4xl font-bold mb-4">الخط الزمني</h2>
            <p className="text-muted-foreground">رحلة المنافسة من التسجيل وحتى التتويج</p>
          </motion.div>

          <div className="relative">
            {/* Horizontal line for desktop, vertical for mobile */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-white/10 -translate-y-1/2 rounded-full" />
            <div className="md:hidden absolute top-0 right-8 w-1 h-full bg-white/10 rounded-full" />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-4">
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
                  className="relative flex md:flex-col items-center md:text-center gap-6 md:gap-0 z-10"
                >
                  <div className="w-16 h-16 shrink-0 rounded-full bg-background border-4 border-primary flex items-center justify-center md:mb-6 shadow-[0_0_20px_rgba(201,168,76,0.3)]">
                    <span className="font-serif font-bold text-xl text-primary">{i + 1}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-white">{step.title}</h3>
                    <p className="text-sm text-primary mb-3 font-serif tracking-wider">{step.date}</p>
                    <p className="text-sm text-muted-foreground">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 px-4 relative z-10">
        <div className="max-w-3xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <HelpCircle className="w-12 h-12 text-primary mx-auto mb-6 opacity-80" />
            <h2 className="text-4xl font-bold mb-4">الأسئلة الشائعة</h2>
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
                className="bg-card/50 border border-white/5 rounded-2xl p-6 hover:bg-card hover:border-white/10 transition-colors"
              >
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  {faq.q}
                </h3>
                <p className="text-muted-foreground pr-5 leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-4 relative z-10 overflow-hidden">
        <div className="absolute inset-0 bg-primary/5" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-black mb-6">قصتك تنتظر من يكتشفها</h2>
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              بادر بالتسجيل الآن وكن جزءاً من الحدث الأدبي الأضخم لعام 2026.
            </p>
            <Link 
              href="/register" 
              className="inline-flex items-center gap-3 px-12 py-5 bg-primary text-primary-foreground font-bold text-xl rounded-full overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_50px_rgba(201,168,76,0.5)]"
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
