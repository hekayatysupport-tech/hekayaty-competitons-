import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation } from 'wouter';
import { useRegistrations, Category } from '@/hooks/useRegistrations';
import { motion } from 'framer-motion';
import { Feather, ChevronRight, AlertCircle } from 'lucide-react';
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

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    // Simulate slight network delay for premium feel
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

  return (
    <div className="min-h-[calc(100vh-80px)] py-12 px-4 relative flex items-center justify-center">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl relative z-10"
      >
        <div className="text-center mb-10">
          <Feather className="w-12 h-12 text-primary mx-auto mb-6" />
          <h1 className="text-4xl font-bold mb-4">استمارة التسجيل</h1>
          <p className="text-muted-foreground text-lg">أدخل بياناتك وبيانات عملك الأدبي للمشاركة في الدورة الحالية.</p>
        </div>

        <div className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              {/* Writer Details */}
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-primary flex items-center gap-2 border-b border-white/5 pb-4">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  بيانات الكاتب
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/80">الاسم الكامل *</FormLabel>
                        <FormControl>
                          <input 
                            {...field} 
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-white/20"
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
                        <FormLabel className="text-white/80">البريد الإلكتروني *</FormLabel>
                        <FormControl>
                          <input 
                            {...field} 
                            type="email"
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-white/20"
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
                        <FormLabel className="text-white/80">رقم الهاتف *</FormLabel>
                        <FormControl>
                          <input 
                            {...field} 
                            type="tel"
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-white/20"
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
                        <FormLabel className="text-white/80">المدينة *</FormLabel>
                        <FormControl>
                          <input 
                            {...field} 
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-white/20"
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
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-white/80">الاسم المستعار <span className="text-muted-foreground text-sm font-normal">(اختياري)</span></FormLabel>
                        <FormControl>
                          <input 
                            {...field} 
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-white/20"
                            placeholder="الاسم الذي سيظهر للجمهور في حال تأهلك"
                          />
                        </FormControl>
                        <FormMessage className="text-destructive text-sm" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Story Details */}
              <div className="space-y-6 pt-4">
                <h2 className="text-xl font-bold text-primary flex items-center gap-2 border-b border-white/5 pb-4">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  بيانات العمل
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="storyName"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-white/80">اسم القصة *</FormLabel>
                        <FormControl>
                          <input 
                            {...field} 
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-white/20 font-serif text-lg"
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
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-white/80">تصنيف القصة *</FormLabel>
                        <FormControl>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {categoryOptions.map((cat) => (
                              <label key={cat} className={`
                                flex items-center justify-center p-3 rounded-xl border cursor-pointer transition-all text-center
                                ${field.value === cat 
                                  ? 'bg-primary/20 border-primary text-primary font-bold shadow-[0_0_15px_rgba(201,168,76,0.15)]' 
                                  : 'bg-black/40 border-white/10 text-white/60 hover:bg-white/5 hover:border-white/20'}
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
                </div>
              </div>

              {/* Agreement & Submit */}
              <div className="pt-8 space-y-8">
                <FormField
                  control={form.control}
                  name="agreement"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-x-reverse space-y-0 rounded-xl border border-white/5 bg-white/5 p-4">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="w-5 h-5 mt-0.5 rounded border-white/20 text-primary focus:ring-primary accent-primary bg-black/40"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-white/80 cursor-pointer leading-relaxed">
                          أقر بأن العمل المقدم هو من تأليفي الخالص، ولم يسبق نشره، وأوافق على شروط وأحكام مسابقة حكايتي 2026.
                        </FormLabel>
                        <FormMessage className="text-destructive text-sm mt-2" />
                      </div>
                    </FormItem>
                  )}
                />

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full py-5 bg-primary text-primary-foreground font-bold text-xl rounded-xl transition-all hover:bg-primary/90 flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(201,168,76,0.3)] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="w-6 h-6 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    <>
                      المتابعة للدفع
                      <ChevronRight className="w-6 h-6 rotate-180" />
                    </>
                  )}
                </button>
              </div>

            </form>
          </Form>
        </div>
      </motion.div>
    </div>
  );
}
