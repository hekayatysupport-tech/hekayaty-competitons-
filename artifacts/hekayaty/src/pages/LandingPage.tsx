import { useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { Link } from 'wouter';
import { ChevronDown, Trophy, BookOpen, Users, Wallet, CheckCircle, Edit3, Image as ImageIcon, CheckSquare, Sparkles, HelpCircle } from 'lucide-react';

export function LandingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

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
    <div className="min-h-screen bg-background w-full overflow-x-hidden flex flex-col font-sans">
      
      {/* 1. Cinematic Hero Section */}
      <section className="relative min-h-[100dvh] flex flex-col items-center justify-center text-center px-4 z-10 pt-24 pb-12 overflow-hidden section-dark">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#10061e] via-[#1A0B2E] to-[#150824]" />
        <div className="absolute inset-0 aurora-bg opacity-70" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

        {/* Floating Particles */}
        {[...Array(30)].map((_, i) => (
          <div 
            key={`spark-${i}`} 
            className="absolute rounded-full bg-primary float" 
            style={{ 
              width: Math.random()*3+1, 
              height: Math.random()*3+1, 
              left: `${Math.random()*100}%`, 
              top: `${Math.random()*100}%`, 
              animationDelay: `${Math.random()*5}s`, 
              opacity: Math.random()*0.5 + 0.2 
            }} 
          />
        ))}

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-6xl mx-auto flex flex-col items-center w-full"
        >
          {/* Trophy Image */}
          <motion.div variants={itemVariants} className="relative w-full max-w-2xl mx-auto mb-12">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
            <img 
              src="/hero-trophy.png" 
              alt="Hekayaty Awards Trophy" 
              className="w-full h-auto object-contain relative z-10 drop-shadow-[0_0_50px_rgba(201,168,76,0.3)] float-slow"
              style={{ maxHeight: '50vh' }}
            />
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-fluid-h1 font-black mb-4 text-foreground font-serif uppercase tracking-wider drop-shadow-[0_0_40px_rgba(201,168,76,0.2)]">
            HEKAYATY
          </motion.h1>
          
          <motion.h2 variants={itemVariants} className="text-fluid-h3 gold-text tracking-[0.4em] mb-8 font-bold uppercase font-serif">
            AWARDS 2026
          </motion.h2>

          <motion.div variants={itemVariants} className="flex items-center justify-center gap-6 w-full max-w-xl mb-8">
             <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-primary/40" />
             <div className="w-2 h-2 rounded-full bg-primary/40 rotate-45" />
             <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-primary/40" />
          </motion.div>
          
          <motion.p variants={itemVariants} className="text-fluid-p text-muted-foreground/90 max-w-2xl leading-relaxed mb-12 font-medium">
            The Largest Arabic Novel Competition<br/>
            <span className="text-primary/80 mt-2 block">Your story deserves to be told.</span>
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-6 items-center">
            <Link 
              href="/register" 
              className="gold-gradient text-primary-foreground px-12 py-6 rounded-full font-bold text-lg hover:glow-gold hover:-translate-y-1 transition-all shimmer-button flex items-center gap-3 shadow-[0_4px_20px_rgba(201,168,76,0.3)]"
            >
              Register Your Novel
            </Link>
            <Link 
              href="/dashboard"
              className="px-12 py-6 glass-card-light text-foreground font-bold text-lg rounded-full border border-white/10 hover:border-primary/40 hover:bg-white/5 transition-all"
            >
              Track Application
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* 2. Stats Bar */}
      <section className="relative z-20 -mt-16 px-4">
        <div className="max-w-6xl mx-auto glass-card border-primary/20 rounded-[2rem] p-6 md:p-12 luxury-shadow flex flex-wrap md:flex-nowrap justify-between gap-8 md:gap-4 items-center bg-[#1A0B2E]/90">
          {[
            { icon: Users, value: '1,247', label: 'Registered Writers' },
            { icon: BookOpen, value: '2,689', label: 'Submitted Novels' },
            { icon: Trophy, value: '15', label: 'Winners' },
            { icon: Wallet, value: '250,000+ EGP', label: 'Total Prizes' },
          ].map((stat, i) => (
            <div key={i} className="flex items-center gap-4 w-full md:w-auto justify-center md:justify-start">
              <stat.icon className="w-10 h-10 text-primary opacity-80" strokeWidth={1.5} />
              <div className="text-left">
                <div className="text-3xl font-black gold-text font-serif">{stat.value}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider font-bold">{stat.label}</div>
              </div>
              {i !== 3 && <div className="hidden md:block w-[1px] h-12 bg-white/10 ml-4" />}
            </div>
          ))}
        </div>
      </section>

      {/* 3. Winners Section (Ivory) */}
      <section className="py-32 px-4 section-ivory relative z-10">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 md:text-left flex flex-col md:flex-row justify-between items-end gap-8"
          >
            <div className="max-w-2xl">
              <h2 className="text-fluid-h2 font-black mb-6 text-[#1A0B2E] uppercase font-serif tracking-wide leading-tight">
                15 WINNERS.<br/>15 PUBLISHING CONTRACTS.
              </h2>
              <p className="text-lg text-[#1A0B2E]/70 font-medium">
                The top 15 novels will be published for free by our official publishing partners, distributed across the Arab world, and showcased in major book fairs.
              </p>
            </div>
            <Link href="/register" className="shrink-0 px-8 py-4 bg-[#1A0B2E] text-white rounded-full font-bold hover:bg-[#2a124a] transition-colors shadow-lg">
              View Prizes Details
            </Link>
          </motion.div>

          <div className="grid grid-cols-5 gap-4 md:gap-8 max-w-5xl mx-auto">
            {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].map((num) => (
              <motion.div 
                key={num}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: num * 0.05 }}
                className="flex flex-col items-center gap-2 group"
              >
                <div className="relative w-16 h-16 md:w-24 md:h-24 rounded-full bg-[#1A0B2E]/5 border border-[#1A0B2E]/10 flex items-center justify-center group-hover:bg-[#1A0B2E]/10 transition-colors">
                   <Trophy className="w-8 h-8 md:w-12 md:h-12 text-[#C9A84C]" strokeWidth={1} />
                   <div className="absolute -top-2 -right-2 w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#1A0B2E] text-[#C9A84C] flex items-center justify-center font-bold font-serif text-sm md:text-base border border-[#C9A84C]/30 shadow-md">
                     {num}
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Publishing Partners */}
      <section className="py-24 px-4 bg-[#1A0B2E] border-y border-white/5 relative z-10">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-xl font-bold text-white/50 uppercase tracking-[0.3em] mb-12 font-serif">Official Publishing Partners</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {['Dar Dawen', 'Kalimat', 'Dar El Shorouk', 'Nofal', 'Aseer Elkotb'].map((partner, i) => (
              <div key={i} className="aspect-[2/1] border border-white/10 rounded-xl flex items-center justify-center bg-black/20 hover:bg-white/5 hover:border-primary/30 transition-all cursor-pointer group">
                <span className="font-serif font-bold text-white/40 group-hover:text-primary transition-colors text-lg tracking-wider">{partner}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Packages Section (Ivory background for the section, cards differ) */}
      <section className="py-32 px-4 section-ivory relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-fluid-h2 font-black mb-6 text-[#1A0B2E] uppercase tracking-widest font-serif">Choose Your Package</h2>
            <div className="w-24 h-1 bg-[#1A0B2E]/20 mx-auto rounded-full" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            
            {/* Package A (Ivory styling) */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-[2rem] p-12 border border-[#1A0B2E]/10 shadow-[0_20px_40px_rgba(0,0,0,0.05)] relative overflow-hidden flex flex-col justify-between hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-shadow"
            >
              <div>
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-sm font-bold text-[#1A0B2E]/50 tracking-widest uppercase mb-2">Package A</h3>
                    <h4 className="text-3xl font-black text-[#1A0B2E] font-serif">Single Novel</h4>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-[#1A0B2E]/5 flex items-center justify-center border border-[#1A0B2E]/10">
                    <BookOpen className="w-8 h-8 text-[#1A0B2E]/70" strokeWidth={1.5} />
                  </div>
                </div>
                
                <div className="mb-8 border-b border-[#1A0B2E]/10 pb-8">
                  <div className="flex items-baseline gap-2">
                    <span className="text-6xl font-black text-[#1A0B2E] font-serif">100</span>
                    <span className="text-xl font-bold text-[#1A0B2E]/50">EGP</span>
                  </div>
                  <p className="text-[#1A0B2E]/60 mt-2 font-medium">Submit 1 novel</p>
                </div>

                <ul className="space-y-4 mb-12 text-[#1A0B2E]/80 font-medium text-left" dir="ltr">
                  <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-[#C9A84C]" /> Access to all categories</li>
                  <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-[#C9A84C]" /> Official participation certificate</li>
                </ul>
              </div>

              <Link href="/register" className="w-full py-6 bg-[#1A0B2E] text-white rounded-xl font-bold text-center hover:bg-[#2a124a] transition-colors shadow-lg">
                Choose This Package
              </Link>
            </motion.div>

            {/* Package B (Deep Purple styling) */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-[#1A0B2E] rounded-[2rem] p-12 border border-primary/30 shadow-[0_20px_50px_rgba(201,168,76,0.15)] relative overflow-hidden flex flex-col justify-between energy-border"
            >
              <div className="absolute top-6 right-6 gold-gradient text-[#1A0B2E] px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase shadow-md z-10">
                Most Popular
              </div>
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-sm font-bold text-primary tracking-widest uppercase mb-2">Package B</h3>
                    <h4 className="text-3xl font-black text-white font-serif">Up To 3 Novels</h4>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/30">
                    <BookOpen className="w-8 h-8 text-primary" strokeWidth={1.5} />
                  </div>
                </div>
                
                <div className="mb-8 border-b border-white/10 pb-8">
                  <div className="flex items-baseline gap-2">
                    <span className="text-6xl font-black gold-text font-serif">150</span>
                    <span className="text-xl font-bold text-white/50">EGP</span>
                  </div>
                  <p className="text-white/60 mt-2 font-medium">Submit up to 3 novels</p>
                </div>

                <ul className="space-y-4 mb-12 text-white/80 font-medium text-left" dir="ltr">
                  <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-primary" /> Access to all categories</li>
                  <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-primary" /> Official participation certificate</li>
                  <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-primary" /> Higher chance of winning</li>
                </ul>
              </div>

              <Link href="/register" className="w-full py-6 gold-gradient text-[#1A0B2E] rounded-xl font-bold text-center hover:shadow-[0_0_20px_rgba(201,168,76,0.4)] transition-all shimmer-button relative z-10">
                Choose This Package
              </Link>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 6. How It Works */}
      <section className="py-24 px-4 section-ivory relative z-10 pb-32">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-fluid-h3 font-black mb-4 text-[#1A0B2E] uppercase tracking-widest font-serif">How It Works</h2>
            <div className="w-16 h-1 bg-primary mx-auto rounded-full" />
          </motion.div>

          <div className="flex flex-col md:flex-row justify-between items-start gap-8 md:gap-4 relative">
             {/* Desktop connecting line */}
             <div className="hidden md:block absolute top-10 left-10 right-10 h-[2px] bg-[#1A0B2E]/10 z-0" />

             {[
               { num: 1, title: 'Choose Your Package', desc: 'Select the package that suits you', icon: Edit3 },
               { num: 2, title: 'Fill Your Information', desc: 'Enter your details and novel information', icon: CheckSquare },
               { num: 3, title: 'Make Payment', desc: 'Pay via InstaPay and upload proof', icon: Wallet },
               { num: 4, title: 'Wait For Approval', desc: 'Our team will review your payment', icon: ImageIcon },
               { num: 5, title: "You're In!", desc: 'You are now an official participant', icon: Trophy },
             ].map((step, i) => (
               <motion.div 
                 key={i}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: i * 0.1 }}
                 className="relative z-10 flex flex-row md:flex-col items-center md:text-center gap-6 md:gap-4 w-full"
               >
                 <div className="w-20 h-20 shrink-0 bg-white border border-[#1A0B2E]/10 rounded-full flex items-center justify-center shadow-md relative">
                   <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#1A0B2E] text-white rounded-full text-xs font-bold flex items-center justify-center font-serif">{step.num}</div>
                   <step.icon className="w-8 h-8 text-[#1A0B2E]" strokeWidth={1.5} />
                 </div>
                 <div className="text-left md:text-center">
                   <h4 className="font-bold text-[#1A0B2E] mb-1">{step.title}</h4>
                   <p className="text-xs text-[#1A0B2E]/60 max-w-[150px] mx-auto leading-relaxed">{step.desc}</p>
                 </div>
               </motion.div>
             ))}
          </div>
        </div>
      </section>

      {/* 7. FAQ Section (Dark) */}
      <section className="py-32 px-4 relative z-10 section-dark border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <HelpCircle className="w-12 h-12 text-primary mx-auto mb-6 opacity-80" strokeWidth={1} />
            <h2 className="text-fluid-h2 font-black mb-6 text-foreground font-serif uppercase tracking-widest">الأسئلة الشائعة</h2>
            <div className="w-16 h-1 gold-gradient mx-auto rounded-full" />
          </motion.div>

          <div className="space-y-4">
            {[
              { 
                q: 'هل يمكنني المشاركة بأكثر من عمل أدبي؟', 
                a: 'نعم، نوفر باقتين للتسجيل: الباقة الفردية تتيح لك المشاركة بعمل واحد فقط، بينما تتيح لك الباقة المتعددة المشاركة بما يصل إلى 3 أعمال أدبية في نفس التسجيل.' 
              },
              { 
                q: 'كم تبلغ رسوم التسجيل وكيف يمكنني الدفع؟', 
                a: 'رسوم الباقة الفردية 100 جنيه مصري، والباقة المتعددة 150 جنيه مصري. يتم الدفع حصرياً عن طريق تطبيق إنستاباي (InstaPay)، ثم إرفاق صورة الإيصال (سكرين شوت) أو إدخال الرقم المرجعي لإتمام التسجيل.' 
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
                className={`glass-card rounded-2xl overflow-hidden transition-all duration-300 ${activeFaq === i ? 'border-primary/40 bg-white/5' : ''}`}
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
      <section className="py-32 px-4 relative z-10 bg-[#1A0B2E] overflow-hidden">
        <div className="absolute inset-0 aurora-bg opacity-30" />
        <div className="max-w-4xl mx-auto text-center relative z-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            className="border border-primary/30 p-12 md:p-24 rounded-[3rem] glow-gold bg-black/20 backdrop-blur-xl"
          >
            <Sparkles className="w-16 h-16 text-primary mx-auto mb-12" strokeWidth={1} />
            <h2 className="text-fluid-h2 font-black mb-8 gold-text font-serif leading-tight">Your Story Deserves The Spotlight</h2>
            <p className="text-lg md:text-xl text-white/60 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
              Join the most prestigious Arabic literary event of 2026.
            </p>
            <Link 
              href="/register" 
              className="inline-flex items-center justify-center gap-4 px-12 py-6 gold-gradient text-[#1A0B2E] font-bold text-xl rounded-full shadow-[0_0_30px_rgba(201,168,76,0.3)] hover:shadow-[0_0_50px_rgba(201,168,76,0.5)] transition-all shimmer-button"
            >
              Register Now
              <Trophy className="w-6 h-6" />
            </Link>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
