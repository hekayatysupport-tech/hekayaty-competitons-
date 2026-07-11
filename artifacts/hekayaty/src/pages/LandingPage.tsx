import { useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { Link } from 'wouter';
import { ChevronDown, Trophy, BookOpen, Users, Wallet, CheckCircle, Edit3, Image as ImageIcon, CheckSquare, Sparkles, HelpCircle, Award, PenTool, Play, Megaphone, Star, ChevronLeft } from 'lucide-react';
import React from 'react';

export const LandingPage = React.memo(function LandingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 1.2, ease: "easeOut", staggerChildren: 0.15 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-[#0A0503] w-full flex flex-col font-sans relative overflow-x-hidden" dir="rtl">
      
      {/* 1. Cinematic Hero Section */}
      <section className="relative w-full h-[100dvh] min-h-[800px] flex flex-col justify-center px-8 z-10 overflow-hidden">
        {/* Background Image (Covering everything) */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('/Gemini_Generated_Image_sy1f0gsy1f0gsy1f.jpg')` }}
        />
        
        {/* Gradient Overlay for Text Readability */}
        {/* Only darkening the left side where the text is, keeping the right side fully clear */}
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#0A0503]/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0503] via-transparent to-transparent" />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-[1400px] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center h-full pt-16 pb-40"
        >
          {/* Right Side Typography (Because RTL, right means the textual part which is on the physical right in the DOM, but rendered on the right side of the screen? Wait, in RTL, `grid-cols-2` puts the first element on the RIGHT. The photo has text on the LEFT. 
              Let's force left-aligned text in a specific absolute or flex layout to perfectly match the photo.
              The photo shows text on the LEFT side of the screen.
          */}
          <div className="hidden lg:block">
            {/* Empty space for the trophy on the right side of the background image */}
          </div>

          <div className="flex flex-col items-start text-right" style={{ direction: 'rtl' }}>
            <motion.h1 variants={itemVariants} className="text-5xl md:text-6xl lg:text-7xl font-bold mb-4 text-white font-serif leading-[1.3] drop-shadow-2xl">
              مسابقة حكاياتي<br/>
              <span className="text-[#D4AF37]">للنشر المجاني </span>
              <span className="text-[#E6C56A]">2026</span>
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-lg md:text-xl text-white/80 max-w-xl leading-relaxed mb-10 font-medium drop-shadow-md">
              فرصتك لتصبح جزءاً من الجيل الجديد من الكتاب. اكتب شغفك، وشارك في أكبر مسابقة للنشر المجاني بالتعاون مع نخبة من دور النشر الرائدة.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-6 items-center w-full justify-start">
              <Link 
                href="/register" 
                className="text-[#120B08] px-8 py-4 rounded-xl font-bold text-lg hover:-translate-y-1 transition-all flex items-center justify-center gap-3 shadow-[0_4px_20px_rgba(212,175,55,0.3)]"
                style={{ background: 'linear-gradient(135deg, #E6C56A 0%, #D4AF37 50%, #B8860B 100%)' }}
              >
                سجل مشاركتك الآن
                <ChevronLeft className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* 2. Overlapping Statistics Cards */}
      <section className="relative z-20 -mt-32 px-4 mb-20 w-full flex justify-center">
        <div className="max-w-[1400px] w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Star, title: 'نشر مجاني', sub: 'أفضل 15 عملاً' },
            { icon: Megaphone, title: 'تسويق ودعم', sub: 'لحملة أعمالك الفائزة' },
            { icon: Trophy, title: 'شهادة رسمية', sub: 'لكل مشارك' },
            { icon: Users, title: 'لجنة تحكيم', sub: 'متخصصة ومحايدة' },
          ].map((stat, i) => (
            <div 
              key={i} 
              className="flex flex-col items-center justify-center text-center p-8 rounded-3xl backdrop-blur-xl border border-[#D4AF37]/30 shadow-[0_10px_40px_rgba(0,0,0,0.5)] transition-transform hover:-translate-y-2"
              style={{ background: 'linear-gradient(180deg, rgba(36,22,14,0.6) 0%, rgba(18,11,8,0.9) 100%)' }}
            >
              <stat.icon className="w-10 h-10 text-[#D4AF37] mb-4" strokeWidth={1.5} />
              <h3 className="text-xl font-bold text-white mb-2">{stat.title}</h3>
              <p className="text-[#D4AF37] text-sm">{stat.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3.5 About Section */}
      <section className="py-24 px-4 relative z-10 w-full flex justify-center border-t border-[#D4AF37]/10" id="about">
        <div className="max-w-[1200px] w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-black mb-6 text-white font-serif">عن <span className="text-[#D4AF37]">المسابقة</span></h2>
            <div className="w-16 h-1 bg-gradient-to-r from-[#E6C56A] to-[#B8860B] rounded-full mb-8" />
            <p className="text-lg text-white/80 leading-relaxed font-medium mb-6">
              مسابقة حكاياتي مبادرة تهدف إلى دعم جيل جديد من الكتّاب العرب، وفتح أبواب النشر أمام أصوات إبداعية شابة تستحق أن تُسمع.
            </p>
            <p className="text-lg text-white/80 leading-relaxed font-medium">
              نؤمن بأن كل قصة تستحق أن تُروى. لذلك نمنح الفائزين فرصة نشر مجاني حقيقي بالتعاون مع دور نشر معتمدة.
            </p>
          </div>
          <div className="relative rounded-[2rem] overflow-hidden border border-[#D4AF37]/20 p-2">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#D4AF37]/10 to-transparent" />
            <img src="/Gemini_Generated_Image_sy1f0gsy1f0gsy1f.jpg" alt="About Hekayaty" loading="lazy" decoding="async" className="w-full h-[400px] object-cover rounded-3xl opacity-80 mix-blend-luminosity hover:mix-blend-normal transition-all duration-700" />
          </div>
        </div>
      </section>

      {/* 4. Luxury Awards Section */}
      <section className="py-32 px-4 section-dark relative z-10 overflow-hidden" id="awards">
        <div className="absolute top-0 right-0 w-full h-[500px] bg-primary/5 blur-[150px] pointer-events-none" />
        
        <div className="max-w-[1200px] mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-6 text-white font-serif leading-tight">
              جوائز تليق <span className="text-[#D4AF37]">بإبداعك</span>
            </h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto font-medium">
              نحتفي بالتميز الأدبي ونقدم دعماً حقيقياً للروائيين الصاعدين لوضع أقدامهم على بداية طريق النشر الاحترافي.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            
            {/* Category 1 */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-[1px] rounded-[2rem] relative overflow-hidden group"
              style={{ background: 'linear-gradient(135deg, #E6C56A 0%, #D4AF37 50%, #B8860B 100%)' }}
            >
              <div className="bg-[#120B08] h-full rounded-[2rem] p-10 md:p-14 relative z-10 flex flex-col justify-between">
                <div>
                  <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mb-8">
                    <Trophy className="w-10 h-10 text-[#D4AF37]" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-3xl md:text-4xl font-black text-[#D4AF37] font-serif mb-6">أفضل 15 عمل</h3>
                  <ul className="space-y-4 mb-8 text-white/80 font-medium">
                    <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-[#D4AF37] shrink-0" /> <span className="text-lg">نشر مجاني بالكامل مع دور النشر</span></li>
                    <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-[#D4AF37] shrink-0" /> <span className="text-lg">توزيع في معارض الكتب الدولية</span></li>
                    <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-[#D4AF37] shrink-0" /> <span className="text-lg">حملة تسويقية احترافية للعمل</span></li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Category 2 */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-card-premium rounded-[2rem] p-10 md:p-14 flex flex-col justify-between hover:border-primary/40 transition-colors"
            >
              <div>
                <div className="w-20 h-20 rounded-full bg-[#120B08]/50 border border-primary/20 flex items-center justify-center mb-8">
                  <Award className="w-10 h-10 text-[#D4AF37]/70" strokeWidth={1.5} />
                </div>
                <h3 className="text-3xl md:text-4xl font-black text-white font-serif mb-6">أفضل 15 عمل التالية</h3>
                <ul className="space-y-4 mb-8 text-white/70 font-medium">
                  <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-[#D4AF37]/70 shrink-0" /> <span className="text-lg">النشر الرقمي على منصة حكاياتي</span></li>
                  <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-[#D4AF37]/70 shrink-0" /> <span className="text-lg">دعم جماهيري وتسويق إلكتروني</span></li>
                  <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-[#D4AF37]/70 shrink-0" /> <span className="text-lg">مراجعة نقدية وتوجيه أدبي</span></li>
                </ul>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 5. Competition Journey (Timeline) */}
      <section className="py-24 px-4 section-ivory relative z-10" id="timeline">
        <div className="max-w-[1200px] mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-3xl md:text-4xl font-black mb-6 text-[#120B08] font-serif">رحلة <span className="text-[#D4AF37]">النجاح</span></h2>
            <div className="w-20 h-1 gold-gradient mx-auto rounded-full" />
          </motion.div>

          <div className="relative">
            {/* Desktop connecting line */}
            <div className="hidden lg:block absolute top-[40px] left-[10%] right-[10%] h-[2px] bg-primary/20 z-0" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-4 relative z-10">
              {[
                { num: 1, title: 'التسجيل', icon: PenTool },
                { num: 2, title: 'الدفع', icon: Wallet },
                { num: 3, title: 'رفع العمل', icon: BookOpen },
                { num: 4, title: 'المراجعة', icon: CheckSquare },
                { num: 5, title: 'التحكيم', icon: Users },
                { num: 6, title: 'النتائج', icon: Trophy },
              ].map((step, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-row lg:flex-col items-center lg:text-center gap-6 lg:gap-4 group"
                >
                  <div className="w-20 h-20 shrink-0 bg-[#24160E] border-2 border-primary/30 rounded-full flex items-center justify-center shadow-lg relative group-hover:border-[#D4AF37] group-hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all duration-300">
                    <div className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-r from-[#E6C56A] to-[#B8860B] text-[#120B08] rounded-full text-sm font-bold flex items-center justify-center font-serif shadow-md">{step.num}</div>
                    <step.icon className="w-8 h-8 text-[#D4AF37]" strokeWidth={1.5} />
                  </div>
                  <div className="text-right lg:text-center">
                    <h4 className="font-bold text-[#120B08] text-lg mb-1">{step.title}</h4>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. Registration Packages */}
      <section className="py-32 px-4 section-elevated relative z-10" id="packages">
        <div className="max-w-[1000px] mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-6 text-white font-serif">باقات <span className="text-[#D4AF37]">المشاركة</span></h2>
            <div className="w-20 h-1 bg-gradient-to-r from-[#E6C56A] to-[#B8860B] mx-auto rounded-full" />
            <p className="text-white/60 mt-6 font-medium text-lg">اختر الباقة المناسبة لحجم عملك الأدبي. جميع الباقات تتيح المشاركة برواية واحدة فقط.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            
            {/* Package 1 */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-card-premium rounded-[2rem] p-10 md:p-12 border border-primary/20 relative overflow-hidden flex flex-col justify-between group hover:border-primary/50 transition-colors"
            >
              <div>
                <div className="flex justify-between items-start mb-8">
                  <div className="w-16 h-16 rounded-full bg-[#D4AF37]/5 flex items-center justify-center border border-[#D4AF37]/20">
                    <BookOpen className="w-8 h-8 text-[#D4AF37]/70" strokeWidth={1.5} />
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-bold text-white/50 tracking-widest uppercase mb-2">الباقة الأولى</h3>
                    <h4 className="text-2xl font-black text-white font-serif">الأعمال القصيرة</h4>
                  </div>
                </div>
                
                <div className="mb-8 border-b border-white/10 pb-8 text-right">
                  <div className="flex items-baseline justify-end gap-2 flex-row-reverse">
                    <span className="text-6xl font-black text-white font-serif">100</span>
                    <span className="text-xl font-bold text-white/50">ج.م</span>
                  </div>
                  <p className="text-[#D4AF37]/80 mt-2 font-bold text-lg">رواية لا تتجاوز ٢٥,٠٠٠ كلمة</p>
                </div>

                <ul className="space-y-4 mb-12 text-white/80 font-medium text-right">
                  <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-[#D4AF37]/70" /> <span>المشاركة بعمل أدبي واحد</span></li>
                  <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-[#D4AF37]/70" /> <span>شهادة مشاركة رسمية</span></li>
                  <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-[#D4AF37]/70" /> <span>تأهل للجوائز الرئيسية</span></li>
                </ul>
              </div>

              <Link href="/register" className="w-full py-5 bg-[#120B08] text-white rounded-xl font-bold text-center border border-[#D4AF37]/30 hover:bg-[#D4AF37]/10 transition-colors shadow-lg text-lg">
                اختر هذه الباقة
              </Link>
            </motion.div>

            {/* Package 2 */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-[2px] rounded-[2rem] relative overflow-hidden flex flex-col justify-between energy-border shadow-[0_20px_50px_rgba(212,175,55,0.15)]"
              style={{ background: 'linear-gradient(135deg, #E6C56A 0%, #D4AF37 50%, #B8860B 100%)' }}
            >
              <div className="bg-[#120B08] h-full rounded-[2rem] p-10 md:p-12 relative z-10 flex flex-col justify-between">
                <div className="absolute top-6 left-6 text-[#120B08] px-4 py-2 rounded-full text-xs font-bold tracking-widest shadow-md z-10" style={{ background: 'linear-gradient(135deg, #E6C56A 0%, #D4AF37 50%, #B8860B 100%)' }}>
                  الأكثر اختياراً
                </div>

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-8">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/30 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                      <BookOpen className="w-8 h-8 text-[#D4AF37]" strokeWidth={1.5} />
                    </div>
                    <div className="text-left">
                      <h3 className="text-sm font-bold text-[#D4AF37] tracking-widest uppercase mb-2">الباقة الثانية</h3>
                      <h4 className="text-2xl font-black text-white font-serif">الأعمال الطويلة</h4>
                    </div>
                  </div>
                  
                  <div className="mb-8 border-b border-white/10 pb-8 text-right">
                    <div className="flex items-baseline justify-end gap-2 flex-row-reverse">
                      <span className="text-6xl font-black text-[#D4AF37] font-serif">150</span>
                      <span className="text-xl font-bold text-white/50">ج.م</span>
                    </div>
                    <p className="text-[#D4AF37] mt-2 font-bold text-lg">رواية تزيد عن ٣٥,٠٠٠ كلمة</p>
                  </div>

                  <ul className="space-y-4 mb-12 text-white/90 font-medium text-right">
                    <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-[#D4AF37]" /> <span>المشاركة بعمل أدبي طويل</span></li>
                    <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-[#D4AF37]" /> <span>شهادة مشاركة رسمية</span></li>
                    <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-[#D4AF37]" /> <span>تأهل للجوائز الرئيسية</span></li>
                  </ul>
                </div>

                <Link href="/register" className="w-full py-5 text-[#120B08] rounded-xl font-bold text-center hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all shimmer-button relative z-10 text-lg" style={{ background: 'linear-gradient(135deg, #E6C56A 0%, #D4AF37 50%, #B8860B 100%)' }}>
                  اختر هذه الباقة
                </Link>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 6.5 Terms Section */}
      <section className="py-24 px-4 relative z-10 section-dark border-t border-[#D4AF37]/10" id="terms">
        <div className="max-w-[1000px] mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-6 text-white font-serif">شروط <span className="text-[#D4AF37]">المشاركة</span></h2>
            <div className="w-20 h-1 bg-gradient-to-r from-[#E6C56A] to-[#B8860B] mx-auto rounded-full" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              "أن يكون العمل أصلياً ومكتوباً باللغة العربية الفصحى.",
              "ألا يكون العمل قد سبق نشره ورقياً أو إلكترونياً بأي شكل.",
              "يجب أن يمتلك الكاتب حقوق الملكية الفكرية الكاملة للعمل.",
              "الالتزام بعدد الكلمات المحدد في الباقة المختارة (حتى 25 ألف كلمة للأعمال القصيرة، وأكثر من 35 ألف للأعمال الطويلة).",
              "ألا يحتوي العمل على ما يسيء للأديان أو يحرض على العنف أو الكراهية.",
              "تُرسل الأعمال في ملفات رقمية (PDF أو Word) بعد إتمام سداد رسوم التسجيل بنجاح."
            ].map((term, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? 20 : -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-4 items-start bg-[#120B08] p-6 rounded-2xl border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 transition-colors shadow-lg"
              >
                <div className="w-8 h-8 rounded-full bg-[#D4AF37]/10 flex items-center justify-center shrink-0 border border-[#D4AF37]/30 text-[#D4AF37] font-bold">
                  {i + 1}
                </div>
                <p className="text-white/80 leading-relaxed font-medium mt-1 text-lg">
                  {term}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FAQ Section */}
      <section className="py-32 px-4 relative z-10 section-dark border-t border-white/5" id="faq">
        <div className="max-w-3xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <HelpCircle className="w-12 h-12 text-[#D4AF37] mx-auto mb-6 opacity-80" strokeWidth={1} />
            <h2 className="text-3xl md:text-4xl font-black mb-6 text-white font-serif">الأسئلة <span className="text-[#D4AF37]">الشائعة</span></h2>
            <div className="w-16 h-1 bg-gradient-to-r from-[#E6C56A] to-[#B8860B] mx-auto rounded-full" />
          </motion.div>

          <div className="space-y-4">
            {[
              { 
                q: 'هل يمكنني المشاركة بأكثر من عمل أدبي؟', 
                a: 'نعم، نوفر باقتين للتسجيل: باقة ما يصل إلى ٢٥,٠٠٠ كلمة (١٠٠ جنيه) تتيح لك المشاركة بعمل واحد لا يتجاوز ٢٥,٠٠٠ كلمة، بينما باقة أكثر من ٣٥,٠٠٠ كلمة (١٥٠ جنيه) تتيح لك المشاركة بعمل واحد يزيد عن ٣٥,٠٠٠ كلمة.' 
              },
              { 
                q: 'كم تبلغ رسوم التسجيل وكيف يمكنني الدفع؟', 
                a: 'رسوم باقة ما يصل إلى ٢٥,٠٠٠ كلمة ١٠٠ جنيه مصري، وباقة أكثر من ٣٥,٠٠٠ كلمة ١٥٠ جنيه مصري. يتم الدفع حصرياً عن طريق تطبيق إنستاباي (InstaPay)، ثم إدخال رسالة تأكيد الدفع لإتمام التسجيل.' 
              },
              { 
                q: 'كيف يمكنني متابعة حالة التسجيل ومراجعة الدفع؟', 
                a: 'بمجرد التسجيل، ستحصل على "كود تسجيل" فريد. يمكنك استخدام هذا الكود في صفحة "متابعة التسجيل" للدخول إلى لوحة التحكم الخاصة بك ومتابعة حالة الدفع ومراجعة ملاحظات الإدارة.' 
              },
              { 
                q: 'ماذا يحدث إذا تم رفض إثبات الدفع الخاص بي؟', 
                a: 'إذا كان إيصال الدفع غير واضح أو غير صحيح، ستقوم الإدارة برفضه مع كتابة ملاحظة توضح السبب. ستظهر هذه الملاحظة فوراً في لوحة التحكم الخاصة بك لتقوم بالتواصل معنا أو إعادة الدفع.' 
              },
              { 
                q: 'هل يجب أن تكون القصة منشورة سابقاً؟', 
                a: 'تُقبل فقط الأعمال غير المنشورة (سواء ورقياً أو إلكترونياً) لضمان حصرية المسابقة وتكافؤ الفرص بين جميع المشتركين.' 
              },
              { 
                q: 'هل يمكنني استخدام اسم مستعار للرواية؟', 
                a: 'نعم بالتأكيد، يمكنك كتابة "الاسم الفني" أو المستعار الذي تفضل النشر به، مع الاحتفاظ ببيانات اتصالك الحقيقية بسرية تامة لغرض تواصل الإدارة معك.' 
              },
            ].map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`glass-card-light rounded-2xl overflow-hidden transition-all duration-300 ${activeFaq === i ? 'border-[#D4AF37]/40 bg-white/5' : ''}`}
              >
                <button 
                  className="w-full text-right p-6 md:p-8 flex justify-between items-center focus:outline-none hover:bg-white/5 transition-colors"
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                >
                  <span className="font-bold text-lg md:text-xl text-white pr-2">{faq.q}</span>
                  <div className={`shrink-0 w-10 h-10 rounded-full border border-[#D4AF37]/20 flex items-center justify-center transition-all duration-300 ${activeFaq === i ? 'rotate-180 bg-[#D4AF37]/20 glow-gold text-[#D4AF37]' : 'text-white/50'}`}>
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </button>
                <AnimatePresence>
                  {activeFaq === i && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-8 pb-8 text-white/60 leading-relaxed border-t border-white/5 pt-6 text-lg font-medium"
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

      {/* 7.5 Contact Section */}
      <section className="py-24 px-4 relative z-10 border-t border-[#D4AF37]/10 bg-[#120B08]" id="contact">
        <div className="max-w-[1200px] mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-6 text-white font-serif">تواصل <span className="text-[#D4AF37]">معنا</span></h2>
            <div className="w-20 h-1 bg-gradient-to-r from-[#E6C56A] to-[#B8860B] mx-auto rounded-full" />
            <p className="text-white/60 mt-6 font-medium text-lg">نحن هنا للإجابة على جميع استفساراتك وتقديم الدعم اللازم.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex flex-col items-center text-center p-8 glass-card-premium rounded-3xl border border-[#D4AF37]/20">
              <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">البريد الإلكتروني</h3>
              <p className="text-[#D4AF37] font-medium" dir="ltr">support@hekayaty.com</p>
            </div>

            <div className="flex flex-col items-center text-center p-8 glass-card-premium rounded-3xl border border-[#D4AF37]/20">
              <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">رقم الهاتف</h3>
              <p className="text-[#D4AF37] font-medium" dir="ltr">+20 123 456 7890</p>
            </div>

            <div className="flex flex-col items-center text-center p-8 glass-card-premium rounded-3xl border border-[#D4AF37]/20">
              <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">العنوان</h3>
              <p className="text-[#D4AF37] font-medium">القاهرة، جمهورية مصر العربية</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-4 relative z-10 bg-[#120B08] overflow-hidden border-t border-[#D4AF37]/10">
        <div className="absolute inset-0 aurora-bg opacity-20" />
        <div className="max-w-4xl mx-auto text-center relative z-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            className="border border-[#D4AF37]/30 p-12 md:p-24 rounded-[3rem] glow-gold bg-black/40 backdrop-blur-xl luxury-shadow"
          >
            <Sparkles className="w-16 h-16 text-[#D4AF37] mx-auto mb-10" strokeWidth={1.5} />
            <h2 className="text-3xl md:text-5xl font-black mb-8 text-[#D4AF37] font-serif leading-tight">إبداعك يستحق أن يرى النور</h2>
            <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed font-bold">
              انضم إلى الحدث الأدبي الأرقى لعام 2026 واصنع الفارق.
            </p>
            <Link 
              href="/register" 
              className="inline-flex items-center justify-center gap-4 px-12 py-6 text-[#120B08] font-bold text-2xl rounded-full shadow-[0_0_30px_rgba(212,175,55,0.3)] hover:shadow-[0_0_50px_rgba(212,175,55,0.5)] transition-all shimmer-button"
              style={{ background: 'linear-gradient(135deg, #E6C56A 0%, #D4AF37 50%, #B8860B 100%)' }}
            >
              <Trophy className="w-6 h-6" />
              ابدأ رحلتك الآن
            </Link>
          </motion.div>
        </div>
      </section>

    </div>
  );
});
