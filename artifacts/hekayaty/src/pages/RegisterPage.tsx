import { useState } from 'react';
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

  return (
    <div className="min-h-[calc(100vh-80px)] py-16 px-4 relative flex flex-col items-center lavender-section">
      <div className="w-full max-w-2xl relative z-10 mb-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4 text-foreground">التسجيل</h1>
          <p className="text-muted-foreground text-lg">أدخل بياناتك وبيانات عملك الأدبي للمشاركة.</p>
        </div>

        {/* Stepper */}
        <div className="flex justify-center items-center mb-12 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-[2px] bg-black/5 z-0" />
          <div 
            className="absolute top-1/2 right-1/2 -translate-y-1/2 h-[2px] bg-primary z-0 transition-all duration-500" 
            style={{ width: currentStep === 2 ? '16rem' : '0' }}
          />
          
          <div className="flex justify-between w-64 z-10 relative">
            <div className={`flex flex-col items-center gap-2 transition-colors ${currentStep >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors bg-white ${currentStep >= 1 ? 'border-primary shadow-[0_0_15px_rgba(201,168,76,0.3)]' : 'border-black/10'}`}>
                {currentStep > 1 ? <CheckCircle2 className="w-6 h-6 text-primary" /> : <User className="w-5 h-5" />}
              </div>
              <span className="text-xs font-bold">البيانات</span>
            </div>
            
            <div className={`flex flex-col items-center gap-2 transition-colors ${currentStep >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors bg-white ${currentStep >= 2 ? 'border-primary shadow-[0_0_15px_rgba(201,168,76,0.3)]' : 'border-black/10'}`}>
                <Book className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold">العمل الأدبي</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 md:p-12 luxury-shadow w-full overflow-hidden">
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
                            <FormLabel className="text-foreground font-bold">الاسم الكامل *</FormLabel>
                            <FormControl>
                              <input 
                                {...field} 
                                className="w-full bg-background border border-black/10 rounded-2xl px-5 py-4 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-muted-foreground/50"
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
                            <FormLabel className="text-foreground font-bold">البريد الإلكتروني *</FormLabel>
                            <FormControl>
                              <input 
                                {...field} 
                                type="email"
                                className="w-full bg-background border border-black/10 rounded-2xl px-5 py-4 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-muted-foreground/50"
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
                            <FormLabel className="text-foreground font-bold">رقم الهاتف *</FormLabel>
                            <FormControl>
                              <input 
                                {...field} 
                                type="tel"
                                className="w-full bg-background border border-black/10 rounded-2xl px-5 py-4 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-muted-foreground/50"
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
                            <FormLabel className="text-foreground font-bold">المدينة *</FormLabel>
                            <FormControl>
                              <input 
                                {...field} 
                                className="w-full bg-background border border-black/10 rounded-2xl px-5 py-4 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-muted-foreground/50"
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
                            <FormLabel className="text-foreground font-bold">الاسم المستعار <span className="text-muted-foreground text-sm font-normal">(اختياري)</span></FormLabel>
                            <FormControl>
                              <input 
                                {...field} 
                                className="w-full bg-background border border-black/10 rounded-2xl px-5 py-4 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-muted-foreground/50"
                                placeholder="الاسم الذي سيظهر للجمهور"
                              />
                            </FormControl>
                            <FormMessage className="text-destructive text-sm" />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="pt-6">
                      <button 
                        type="button" 
                        onClick={nextStep}
                        className="w-full py-4 gold-gradient text-white font-bold text-lg rounded-2xl shadow-[0_4px_14px_rgba(201,168,76,0.3)] hover:shadow-[0_6px_20px_rgba(201,168,76,0.4)] transition-all flex items-center justify-center gap-2"
                      >
                        التالي
                        <ChevronRight className="w-5 h-5 rotate-180" />
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
                    className="space-y-6"
                  >
                    <FormField
                      control={form.control}
                      name="storyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground font-bold">اسم القصة *</FormLabel>
                          <FormControl>
                            <input 
                              {...field} 
                              className="w-full bg-background border border-black/10 rounded-2xl px-5 py-4 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-muted-foreground/50 font-serif text-lg text-center"
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
                          <FormLabel className="text-foreground font-bold">تصنيف القصة *</FormLabel>
                          <FormControl>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              {categoryOptions.map((cat) => (
                                <label key={cat} className={`
                                  flex items-center justify-center p-4 rounded-2xl border cursor-pointer transition-all text-center font-bold
                                  ${field.value === cat 
                                    ? 'bg-primary/5 border-primary text-primary shadow-[0_0_0_1px_rgba(201,168,76,1)]' 
                                    : 'bg-background border-black/10 text-muted-foreground hover:bg-black/5 hover:border-black/20'}
                                `}>
                                  <input 
                                    type="radio" 
                                    className="hidden" 
                                    value={cat} 
                                    checked={field.value === cat}
                                    onChange={() => field.onChange(cat)}
                                  />
                                  {cat}
                                </label>
                              ))}
                            </div>
                          </FormControl>
                          <FormMessage className="text-destructive text-sm" />
                        </FormItem>
                      )}
                    />

                    <div className="pt-6 border-t border-black/5">
                      <FormField
                        control={form.control}
                        name="agreement"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-x-reverse space-y-0 rounded-2xl border border-black/5 bg-background p-5">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="w-5 h-5 mt-0.5 rounded border-black/20 text-primary focus:ring-primary accent-primary bg-white cursor-pointer"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-foreground cursor-pointer leading-relaxed text-sm font-medium">
                                أقر بأن العمل المقدم هو من تأليفي الخالص، ولم يسبق نشره، وأوافق على شروط وأحكام مسابقة حكايتي 2026.
                              </FormLabel>
                              <FormMessage className="text-destructive text-sm mt-2" />
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex gap-4 pt-6">
                      <button 
                        type="button" 
                        onClick={prevStep}
                        className="py-4 px-6 bg-background text-foreground font-bold rounded-2xl border border-black/10 hover:bg-black/5 transition-colors flex items-center justify-center gap-2"
                      >
                        <ChevronRight className="w-5 h-5" />
                        السابق
                      </button>
                      <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="flex-1 py-4 gold-gradient text-white font-bold text-lg rounded-2xl shadow-[0_4px_14px_rgba(201,168,76,0.3)] hover:shadow-[0_6px_20px_rgba(201,168,76,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shimmer-button"
                      >
                        {isSubmitting ? (
                          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
