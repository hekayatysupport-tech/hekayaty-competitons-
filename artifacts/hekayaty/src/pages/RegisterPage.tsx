import { useState, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation } from 'wouter';
import { useRegistrations, Category, PackageType } from '@/hooks/useRegistrations';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, User, Book, CheckCircle2, Package, Plus, Trash2 } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';

const categoryOptions: Category[] = ['رومانسية', 'إثارة وتشويق', 'فانتازيا', 'واقعية', 'تاريخية', 'رعب'];

const formSchema = z.object({
  packageType: z.enum(['package_a', 'package_b'], { required_error: 'الرجاء اختيار الباقة' }),
  name: z.string().min(3, { message: 'الاسم يجب أن يكون 3 أحرف على الأقل' }),
  email: z.string().email({ message: 'بريد إلكتروني غير صالح' }),
  phone: z.string().min(10, { message: 'رقم هاتف غير صالح' }),
  city: z.string().min(2, { message: 'المدينة مطلوبة' }),
  penName: z.string().optional(),
  stories: z.array(
    z.object({
      title: z.string().min(2, { message: 'اسم القصة مطلوب' }),
      category: z.enum(['رومانسية', 'إثارة وتشويق', 'فانتازيا', 'واقعية', 'تاريخية', 'رعب'], { 
        required_error: 'التصنيف مطلوب' 
      }),
      description: z.string().max(500, { message: 'الوصف يجب ألا يتجاوز 500 حرف' }).optional()
    })
  ).min(1, 'يجب إضافة قصة واحدة على الأقل').max(3, 'لا يمكن إضافة أكثر من 3 قصص'),
  agreement: z.boolean().refine(val => val === true, { message: 'يجب الموافقة على الشروط والأحكام' })
});

export function RegisterPage() {
  const [, setLocation] = useLocation();
  const { setPending, completeRegistration } = useRegistrations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      packageType: 'package_a',
      name: '',
      email: '',
      phone: '',
      city: '',
      penName: '',
      stories: [{ title: '', category: 'رومانسية', description: '' }],
      agreement: false,
    }
  });

  const { fields, append, remove } = useFieldArray({
    name: "stories",
    control: form.control,
  });

  const selectedPackage = form.watch('packageType');
  const maxStories = selectedPackage === 'package_a' ? 1 : 3;

  const nextStep = async () => {
    let isValid = false;
    if (currentStep === 1) {
      isValid = await form.trigger(['packageType']);
    } else if (currentStep === 2) {
      isValid = await form.trigger(['name', 'email', 'phone', 'city', 'penName']);
    }
    if (isValid) setCurrentStep(c => c + 1);
  };

  const prevStep = () => {
    setCurrentStep(c => c - 1);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.stories.length > maxStories) {
      form.setError('stories', { message: `لا يمكنك تجاوز الحد الأقصى للقصص (${maxStories})` });
      return;
    }

    setIsSubmitting(true);

    // Step 1: Save pending data to localStorage
    setPending({
      packageType: values.packageType,
      name: values.name,
      email: values.email,
      phone: values.phone,
      city: values.city,
      penName: values.penName,
      stories: values.stories,
    });

    // Step 2: Complete registration in DB to get the code
    const registration = await completeRegistration();

    if (!registration) {
      toast.error('حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى.');
      setIsSubmitting(false);
      return;
    }

    const { code, email } = registration;

    // Step 3: Auto sign-up the participant with code as password
    const { error: signUpError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password: code,
      options: { data: { full_name: values.name, registration_code: code } },
    });

    if (signUpError && !signUpError.message.includes('already registered')) {
      // Non-fatal: user is registered in DB, just couldn't create auth account
      // They can still log in manually later
      console.warn('Auth sign-up warning:', signUpError.message);
    } else if (!signUpError) {
      // If successfully signed up, sign them in immediately
      await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: code,
      });
    } else {
      // Already registered - sign them in
      await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: code,
      });
    }

    // Step 4: Redirect to payment with code
    setLocation(`/payment?code=${code}`);
  }

  function onInvalidSubmit() {
    const errors = form.formState.errors;
    if (errors.agreement) {
      toast.error('يجب الموافقة على الشروط والأحكام أولاً');
    } else if (errors.stories) {
      toast.error('يرجى ملء جميع حقول القصص بشكل صحيح');
    } else {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
    }
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
    <div className="min-h-[calc(100vh-80px)] py-24 px-4 relative flex flex-col items-center section-dark overflow-hidden font-sans">
      
      {/* Cinematic Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#10061e] via-[#1A0B2E] to-[#150824]" />
      <div className="absolute inset-0 aurora-bg opacity-40" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {particles.map((p, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-primary"
            style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%` }}
            animate={{ y: [0, -50, 0], opacity: [0.1, 0.4, 0.1] }}
            transition={{ duration: p.duration, repeat: Infinity, ease: "linear", delay: p.delay }}
          />
        ))}
      </div>

      <div className="w-full max-w-3xl relative z-10 my-12">
        <div className="text-center mb-16">
          <h1 className="text-fluid-h1 font-black mb-4 gold-text uppercase tracking-widest font-serif drop-shadow-[0_0_20px_rgba(201,168,76,0.2)]">التسجيل</h1>
          <p className="text-white/60 text-lg font-medium">أدخل بياناتك وبيانات عملك الأدبي للمشاركة في 2026.</p>
        </div>

        {/* Stepper */}
        <div className="flex justify-center items-center mb-16 relative max-w-lg mx-auto">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[2px] bg-white/5 z-0" />
          <div 
            className="absolute top-1/2 right-0 -translate-y-1/2 h-[2px] gold-gradient z-0 transition-all duration-500" 
            style={{ width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%', filter: 'drop-shadow(0 0 8px rgba(201,168,76,0.6))' }}
          />
          
          <div className="flex justify-between w-full z-10 relative">
            {/* Step 1: Package */}
            <div className={`flex flex-col items-center gap-4 transition-colors ${currentStep >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${currentStep >= 1 ? 'border-primary/50 gold-gradient text-primary-foreground glow-gold' : 'border-white/10 bg-[#10101a] text-muted-foreground'}`}>
                {currentStep > 1 ? <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" /> : <Package className="w-5 h-5 md:w-6 md:h-6" />}
              </div>
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-center">الباقة</span>
            </div>

            {/* Step 2: Personal */}
            <div className={`flex flex-col items-center gap-4 transition-colors ${currentStep >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${currentStep >= 2 ? 'border-primary/50 gold-gradient text-primary-foreground glow-gold' : 'border-white/10 bg-[#10101a] text-muted-foreground'}`}>
                {currentStep > 2 ? <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" /> : <User className="w-5 h-5 md:w-6 md:h-6" />}
              </div>
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-center">البيانات</span>
            </div>
            
            {/* Step 3: Stories */}
            <div className={`flex flex-col items-center gap-4 transition-colors ${currentStep >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${currentStep >= 3 ? 'border-primary/50 gold-gradient text-primary-foreground glow-gold' : 'border-white/10 bg-[#10101a] text-muted-foreground'}`}>
                <Book className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-center">الأعمال</span>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-[2rem] p-6 md:p-12 luxury-shadow w-full overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 gold-gradient" />

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onInvalidSubmit)}>
              <AnimatePresence mode="wait">
                
                {/* STEP 1: PACKAGE SELECTION */}
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                    className="space-y-8"
                  >
                    <div className="text-center mb-12">
                      <h3 className="text-2xl font-bold text-foreground">اختر باقة المشاركة</h3>
                      <p className="text-muted-foreground text-sm mt-2">اختر الباقة التي تناسب عدد أعمالك الأدبية</p>
                    </div>

                    <FormField
                      control={form.control}
                      name="packageType"
                      render={({ field }) => (
                        <FormItem className="space-y-6">
                          <div className="grid md:grid-cols-2 gap-8">
                            {/* Package A (Ivory) */}
                            <label className={`
                              cursor-pointer relative overflow-hidden rounded-[2rem] p-8 border-2 transition-all duration-300
                              ${field.value === 'package_a' ? 'border-[#1A0B2E] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.2)]' : 'border-[#1A0B2E]/10 bg-white/90 hover:bg-white text-[#1A0B2E] opacity-70 hover:opacity-100'}
                            `}>
                              <input type="radio" value="package_a" className="hidden" checked={field.value === 'package_a'} onChange={() => field.onChange('package_a')} />
                              {field.value === 'package_a' && <div className="absolute top-4 left-4"><CheckCircle2 className="text-[#1A0B2E] w-6 h-6" /></div>}
                              
                              <h4 className="text-xl font-bold text-[#1A0B2E] mb-2 uppercase tracking-wider">الباقة الفردية</h4>
                              <div className="text-4xl font-black text-[#1A0B2E] font-serif mb-4 flex items-baseline gap-1">100 <span className="text-lg font-bold">ج.م</span></div>
                              
                              <ul className="space-y-3 text-sm text-[#1A0B2E]/70 font-medium">
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#1A0B2E]" /> عمل أدبي واحد</li>
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#1A0B2E]" /> شهادة مشاركة رقمية</li>
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#1A0B2E]" /> تقييم لجنة التحكيم</li>
                              </ul>
                            </label>

                            {/* Package B (Deep Purple) */}
                            <label className={`
                              cursor-pointer relative overflow-hidden rounded-[2rem] p-8 border-2 transition-all duration-300
                              ${field.value === 'package_b' ? 'border-primary bg-[#1A0B2E] shadow-[0_10px_30px_rgba(201,168,76,0.2)] energy-border' : 'border-primary/20 bg-[#1A0B2E]/80 hover:bg-[#1A0B2E] hover:border-primary/50 opacity-70 hover:opacity-100'}
                            `}>
                              <div className="absolute top-4 right-4 gold-gradient text-[#1A0B2E] px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">الأكثر طلباً</div>
                              <input type="radio" value="package_b" className="hidden" checked={field.value === 'package_b'} onChange={() => field.onChange('package_b')} />
                              {field.value === 'package_b' && <div className="absolute top-4 left-4"><CheckCircle2 className="text-primary w-6 h-6" /></div>}
                              
                              <h4 className="text-xl font-bold text-white mb-2 uppercase tracking-wider mt-6">الباقة المتعددة</h4>
                              <div className="text-4xl font-black gold-text font-serif mb-4 flex items-baseline gap-1">150 <span className="text-lg font-bold text-white/50">ج.م</span></div>
                              
                              <ul className="space-y-3 text-sm text-white/70 font-medium">
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> حتى ٣ أعمال أدبية</li>
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> شهادة مشاركة رقمية</li>
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> فرصة أكبر للفوز</li>
                              </ul>
                            </label>
                          </div>
                          {form.formState.errors.packageType && <p className="text-center text-destructive text-sm font-medium">{form.formState.errors.packageType.message}</p>}
                        </FormItem>
                      )}
                    />

                    <div className="pt-12">
                      <button 
                        type="button" 
                        onClick={() => {
                          // Adjust fields array based on package choice
                          const currentLen = fields.length;
                          const max = selectedPackage === 'package_a' ? 1 : 3;
                          if (currentLen > max) {
                            for(let i=currentLen-1; i>=max; i--) remove(i);
                          }
                          nextStep();
                        }}
                        className="w-full py-6 px-8 gold-gradient text-primary-foreground font-bold text-lg rounded-2xl shadow-[0_4px_20px_rgba(201,168,76,0.3)] hover:glow-gold transition-all flex items-center justify-center gap-3 shimmer-button"
                      >
                        متابعة
                        <ChevronRight className="w-6 h-6 rotate-180" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: PERSONAL INFO */}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel className="text-foreground/90 font-bold mb-2">الاسم الكامل *</FormLabel>
                            <FormControl>
                              <input 
                                {...field} 
                                className="w-full bg-white/5 border border-primary/15 rounded-2xl px-6 py-4 text-foreground focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/30 shadow-inner"
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
                            <FormLabel className="text-foreground/90 font-bold mb-2">البريد الإلكتروني *</FormLabel>
                            <FormControl>
                              <input 
                                {...field} 
                                type="email"
                                className="w-full bg-white/5 border border-primary/15 rounded-2xl px-6 py-4 text-foreground focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/30 shadow-inner"
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
                            <FormLabel className="text-foreground/90 font-bold mb-2">رقم الهاتف *</FormLabel>
                            <FormControl>
                              <input 
                                {...field} 
                                type="tel"
                                className="w-full bg-white/5 border border-primary/15 rounded-2xl px-6 py-4 text-foreground focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/30 shadow-inner"
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
                            <FormLabel className="text-foreground/90 font-bold mb-2">المدينة *</FormLabel>
                            <FormControl>
                              <input 
                                {...field} 
                                className="w-full bg-white/5 border border-primary/15 rounded-2xl px-6 py-4 text-foreground focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/30 shadow-inner"
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
                            <FormLabel className="text-foreground/90 font-bold mb-2">الاسم المستعار <span className="text-muted-foreground text-sm font-normal">(اختياري)</span></FormLabel>
                            <FormControl>
                              <input 
                                {...field} 
                                className="w-full bg-white/5 border border-primary/15 rounded-2xl px-6 py-4 text-foreground focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/30 shadow-inner"
                                placeholder="الاسم الذي سيظهر للجمهور"
                              />
                            </FormControl>
                            <FormMessage className="text-destructive text-sm" />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="flex gap-6 pt-12">
                      <button 
                        type="button" 
                        onClick={prevStep}
                        className="py-6 px-8 glass-card-light text-foreground font-bold rounded-2xl hover:border-primary/30 transition-colors flex items-center justify-center gap-2 min-w-[120px]"
                      >
                        <ChevronRight className="w-5 h-5" />
                        رجوع
                      </button>
                      <button 
                        type="button" 
                        onClick={nextStep}
                        className="flex-1 py-6 px-8 gold-gradient text-primary-foreground font-bold text-lg rounded-2xl shadow-[0_4px_20px_rgba(201,168,76,0.3)] hover:glow-gold transition-all flex items-center justify-center gap-3 shimmer-button"
                      >
                        متابعة
                        <ChevronRight className="w-6 h-6 rotate-180" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: STORY INFO */}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                    className="space-y-12"
                  >
                    
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-foreground">الأعمال الأدبية</h3>
                      <div className="text-sm font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
                        {fields.length} / {maxStories}
                      </div>
                    </div>

                    {form.formState.errors.root && <p className="text-destructive text-sm text-center font-medium">{form.formState.errors.root.message}</p>}
                    {form.formState.errors.stories?.root && (
                      <p className="text-destructive text-sm text-center">{form.formState.errors.stories.root.message}</p>
                    )}

                    <div className="space-y-8">
                      {fields.map((field, index) => (
                        <div key={field.id} className="glass-card-light border border-white/10 rounded-3xl p-8 relative">
                          {fields.length > 1 && (
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="absolute top-4 left-4 p-2 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-full transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                          <div className="mb-6 text-primary font-bold text-lg">العمل الأدبي #{index + 1}</div>
                          
                          <div className="space-y-8">
                            <FormField
                              control={form.control}
                              name={`stories.${index}.title`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-foreground/90 font-bold mb-2">اسم القصة *</FormLabel>
                                  <FormControl>
                                    <input 
                                      {...field} 
                                      className="w-full bg-white/5 border border-primary/15 rounded-2xl px-6 py-4 text-foreground focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/30 font-serif text-xl shadow-inner"
                                      placeholder="عنوان عملك الأدبي"
                                    />
                                  </FormControl>
                                  <FormMessage className="text-destructive text-sm" />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`stories.${index}.category`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-foreground/90 font-bold mb-2">تصنيف القصة *</FormLabel>
                                  <FormControl>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                                      {categoryOptions.map((cat) => (
                                        <label key={cat} className={`
                                          flex items-center justify-center py-4 px-2 rounded-xl border cursor-pointer transition-all text-center font-bold relative overflow-hidden text-sm
                                          ${field.value === cat 
                                            ? 'bg-primary/10 border-primary text-primary glow-gold shadow-inner' 
                                            : 'bg-black/30 text-foreground/60 border-white/5 hover:bg-white/10 hover:border-primary/30'}
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

                            <FormField
                              control={form.control}
                              name={`stories.${index}.description`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-foreground/90 font-bold mb-2">نبذة مختصرة <span className="text-muted-foreground text-sm font-normal">(اختياري)</span></FormLabel>
                                  <FormControl>
                                    <textarea 
                                      {...field}
                                      rows={2}
                                      className="w-full bg-white/5 border border-primary/15 rounded-2xl px-6 py-4 text-foreground focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/30 shadow-inner resize-none text-sm"
                                      placeholder="اكتب نبذة لا تتجاوز 500 حرف..."
                                    />
                                  </FormControl>
                                  <FormMessage className="text-destructive text-sm" />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {fields.length < maxStories && (
                      <button
                        type="button"
                        onClick={() => append({ title: '', category: 'رومانسية', description: '' })}
                        className="w-full py-6 border-2 border-dashed border-primary/30 text-primary font-bold rounded-3xl flex items-center justify-center gap-2 hover:bg-primary/10 hover:border-primary/50 transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                        إضافة قصة أخرى
                      </button>
                    )}

                    <div className="pt-8 border-t border-white/10">
                      <FormField
                        control={form.control}
                        name="agreement"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-x-reverse space-y-0 rounded-2xl border border-white/5 bg-white/5 p-8">
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
                                أقر بأن الأعمال المقدمة هي من تأليفي الخالص، ولم يسبق نشرها، وأوافق على شروط وأحكام مسابقة حكايتي 2026.
                              </FormLabel>
                              <FormMessage className="text-destructive text-sm mt-2" />
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex gap-6 pt-8">
                      <button 
                        type="button" 
                        onClick={prevStep}
                        className="py-6 px-8 glass-card-light text-foreground font-bold rounded-2xl hover:border-primary/30 transition-colors flex items-center justify-center gap-2 min-w-[120px]"
                      >
                        <ChevronRight className="w-5 h-5" />
                        رجوع
                      </button>
                      <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="flex-1 py-6 px-8 gold-gradient text-primary-foreground font-bold text-lg rounded-2xl shadow-[0_4px_20px_rgba(201,168,76,0.3)] hover:glow-gold transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shimmer-button"
                      >
                        {isSubmitting ? (
                          <div className="w-6 h-6 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        ) : (
                          <>
                            تأكيد الأعمال
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
