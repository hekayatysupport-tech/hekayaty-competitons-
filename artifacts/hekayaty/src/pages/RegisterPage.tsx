import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation } from 'wouter';
import { useRegistrations, Category } from '@/hooks/useRegistrations';
import { motion, AnimatePresence } from 'framer-motion';
import { Feather, ChevronRight, AlertCircle, User, Book, CheckCircle2 } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const categoryOptions: Category[] = ['رومانسية', 'إثارة وتشويق', 'فانتازيا', 'واقعية', 'تاريخية', 'رعب'];

const formSchema = z.object({
  name: z.string().min(3, { message: 'الاسم يجب أن يكون 3 أحرف على الأقل' }),
  email: z.string().email({ message: 'بريد إلكتروني غير صالح' }),
  phone: z.string().min(10, { message: 'رقم هاتف غير صالح' }),
  city: z.string().min(2, { message: 'المدينة مطلوبة' }),
  penName: z.string().optional(),
  storyName: z.string().min(2, { message: 'اسم القصة مطلوب' }),
  category: z.enum(['رومانسية', 'إثارة وتشويق', 'فانتازيا', 'واقعية', 'تاريخية', 'رعب'], { 
    required_error: 'الرجاء اختيار تصنيف' 
  }),
  agreement: z.boolean().refine(val => val === true, { message: 'يجب الموافقة على الشروط والأحكام' })
});

export function RegisterPage() {
  const [, setLocation] = useLocation();
  const { setPending } = useRegistrations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      city: '',
      penName: '',
      storyName: '',
      agreement: false,
    }
  });

  const nextStep = async () => {
    const fieldsToValidate = ['name', 'email', 'phone', 'city', 'penName'] as const;
    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) setCurrentStep(2);
  };

  const prevStep = () => {
    setCurrentStep(1);
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    setTimeout(() => {
      setPending({
        name: values.name,
        email: values.email,
        phone: values.phone,
        city: values.city,
        penName: values.penName,
        storyName: values.storyName,
        category: values.category as Category,
      });
      setLocation('/payment');
    }, 800);
  }

  const slideVariants = {
    enter: { x: 50, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 },
  };

  const particles = useMemo(() => Array.from({ length: 15 }).map(() => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 5,
    duration: Math.random() * 10 + 10,
  })), []);

  return (
    <div className="min-h-[calc(100vh-80px)] py-16 px-4 relative flex flex-col items-center section-dark overflow-hidden">
      
      {/* Background Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((p, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-primary"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.x}%`,
              top: `${p.y}%`,
            }}
            animate={{
              y: [0, -50, 0],
              opacity: [0.1, 0.4, 0.1],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              ease: "linear",
              delay: p.delay,
            }}
          />
        ))}
      </div>

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10 my-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black mb-4 gold-text uppercase tracking-widest font-serif">التسجيل</h1>
          <p className="text-muted-foreground text-lg">أدخل بياناتك وبيانات عملك الأدبي للمشاركة في 2026.</p>
        </div>

        {/* Stepper */}
        <div className="flex justify-center items-center mb-16 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-[2px] bg-white/5 z-0" />
          <div 
            className="absolute top-1/2 right-1/2 -translate-y-1/2 h-[2px] gold-gradient z-0 transition-all duration-500" 
            style={{ width: currentStep === 2 ? '16rem' : '0', filter: 'drop-shadow(0 0 8px rgba(201,168,76,0.6))' }}
          />
          
          <div className="flex justify-between w-64 z-10 relative">
            <div className={`flex flex-col items-center gap-3 transition-colors ${currentStep >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${currentStep >= 1 ? 'border-primary/50 gold-gradient text-primary-foreground glow-gold' : 'border-white/10 bg-[#10101a] text-muted-foreground'}`}>
                {currentStep > 1 ? <CheckCircle2 className="w-6 h-6" /> : <User className="w-6 h-6" />}
              </div>
              <span className="text-xs font-bold uppercase tracking-widest">البيانات</span>
            </div>
            
            <div className={`flex flex-col items-center gap-3 transition-colors ${currentStep >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${currentStep >= 2 ? 'border-primary/50 gold-gradient text-primary-foreground glow-gold' : 'border-white/10 bg-[#10101a] text-muted-foreground'}`}>
                <Book className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest">العمل الأدبي</span>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-[2rem] p-8 md:p-12 luxury-shadow w-full overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 gold-gradient" />

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <AnimatePresence mode="wait">
                
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel className="text-foreground/90 font-bold">الاسم الكامل *</FormLabel>
                            <FormControl>
                              <input 
                                {...field} 
                                className="w-full bg-white/5 border border-primary/15 rounded-2xl px-5 py-4 text-foreground focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/30 shadow-inner"
                                placeholder="كما هو في الهوية الوطنية"
                              />
                            </FormControl>
                            <FormMessage className="text-destructive text-sm" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground/90 font-bold">البريد الإلكتروني *</FormLabel>
                            <FormControl>
                              <input 
                                {...field} 
                                type="email"
                                className="w-full bg-white/5 border border-primary/15 rounded-2xl px-5 py-4 text-foreground focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/30 shadow-inner"
                                placeholder="example@domain.com"
                                dir="ltr"
                              />
                            </FormControl>
                            <FormMessage className="text-destructive text-sm" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground/90 font-bold">رقم الهاتف *</FormLabel>
                            <FormControl>
                              <input 
                                {...field} 
                                type="tel"
                                className="w-full bg-white/5 border border-primary/15 rounded-2xl px-5 py-4 text-foreground focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/30 shadow-inner"
                                placeholder="01xxxxxxxxx"
                                dir="ltr"
                              />
                            </FormControl>
                            <FormMessage className="text-destructive text-sm" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground/90 font-bold">المدينة *</FormLabel>
                            <FormControl>
                              <input 
                                {...field} 
                                className="w-full bg-white/5 border border-primary/15 rounded-2xl px-5 py-4 text-foreground focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/30 shadow-inner"
                                placeholder="القاهرة، الإسكندرية..."
                              />
                            </FormControl>
                            <FormMessage className="text-destructive text-sm" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="penName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground/90 font-bold">الاسم المستعار <span className="text-muted-foreground text-sm font-normal">(اختياري)</span></FormLabel>
                            <FormControl>
                              <input 
                                {...field} 
                                className="w-full bg-white/5 border border-primary/15 rounded-2xl px-5 py-4 text-foreground focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/30 shadow-inner"
                                placeholder="الاسم الذي سيظهر للجمهور"
                              />
                            </FormControl>
                            <FormMessage className="text-destructive text-sm" />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="pt-8">
                      <button 
                        type="button" 
                        onClick={nextStep}
                        className="w-full py-5 gold-gradient text-primary-foreground font-bold text-lg rounded-2xl shadow-[0_4px_20px_rgba(201,168,76,0.3)] hover:glow-gold transition-all flex items-center justify-center gap-3 shimmer-button"
                      >
                        التالي
                        <ChevronRight className="w-6 h-6 rotate-180" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                    className="space-y-8"
                  >
                    <FormField
                      control={form.control}
                      name="storyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground/90 font-bold">اسم القصة *</FormLabel>
                          <FormControl>
                            <input 
                              {...field} 
                              className="w-full bg-white/5 border border-primary/15 rounded-2xl px-5 py-5 text-foreground focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/30 font-serif text-2xl text-center shadow-inner"
                              placeholder="عنوان عملك الأدبي"
                            />
                          </FormControl>
                          <FormMessage className="text-destructive text-sm" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground/90 font-bold">تصنيف القصة *</FormLabel>
                          <FormControl>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                              {categoryOptions.map((cat) => (
                                <label key={cat} className={`
                                  flex items-center justify-center py-5 px-2 rounded-2xl border cursor-pointer transition-all text-center font-bold relative overflow-hidden
                                  ${field.value === cat 
                                    ? 'bg-primary/10 border-primary text-primary glow-gold shadow-inner' 
                                    : 'glass-card-light text-foreground/60 hover:bg-white/10 hover:border-primary/30'}
                                `}>
                                  <input 
                                    type="radio" 
                                    className="hidden" 
                                    value={cat} 
                                    checked={field.value === cat}
                                    onChange={() => field.onChange(cat)}
                                  />
                                  {field.value === cat && <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent pointer-events-none" />}
                                  <span className="relative z-10">{cat}</span>
                                </label>
                              ))}
                            </div>
                          </FormControl>
                          <FormMessage className="text-destructive text-sm" />
                        </FormItem>
                      )}
                    />

                    <div className="pt-6 border-t border-white/10">
                      <FormField
                        control={form.control}
                        name="agreement"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-x-reverse space-y-0 rounded-2xl border border-white/5 bg-white/5 p-6">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="w-5 h-5 mt-0.5 rounded border-primary/30 text-primary focus:ring-primary accent-primary cursor-pointer bg-background"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-foreground/80 cursor-pointer leading-relaxed text-sm font-medium">
                                أقر بأن العمل المقدم هو من تأليفي الخالص، ولم يسبق نشره، وأوافق على شروط وأحكام مسابقة حكايتي 2026.
                              </FormLabel>
                              <FormMessage className="text-destructive text-sm mt-2" />
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button 
                        type="button" 
                        onClick={prevStep}
                        className="py-5 px-6 glass-card-light text-foreground font-bold rounded-2xl hover:border-primary/30 transition-colors flex items-center justify-center gap-2 min-w-[120px]"
                      >
                        <ChevronRight className="w-5 h-5" />
                        السابق
                      </button>
                      <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="flex-1 py-5 gold-gradient text-primary-foreground font-bold text-lg rounded-2xl shadow-[0_4px_20px_rgba(201,168,76,0.3)] hover:glow-gold transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shimmer-button"
                      >
                        {isSubmitting ? (
                          <div className="w-6 h-6 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        ) : (
                          <>
                            المتابعة للدفع
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
