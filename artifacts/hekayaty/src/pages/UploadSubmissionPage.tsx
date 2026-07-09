import { useState, useRef, useEffect, useMemo } from 'react';
import { useLocation } from 'wouter';
import { useRegistrations } from '@/hooks/useRegistrations';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud, File, X, CheckCircle2, Loader2, ShieldCheck,
  AlertCircle, BookOpen, Clock, Star, ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

const STEPS = [
  { label: 'اكتمال التسجيل', done: true },
  { label: 'إثبات الدفع', done: true },
  { label: 'رفع الرواية', current: true },
  { label: 'قيد المراجعة', done: false },
  { label: 'القرار النهائي', done: false },
];

function ProgressTimeline({ uploadDone }: { uploadDone: boolean }) {
  const steps = uploadDone
    ? STEPS.map((s, i) => ({ ...s, done: i <= 2, current: i === 3 }))
    : STEPS;

  return (
    <div className="flex items-start justify-center gap-0 mb-12 overflow-x-auto pb-2">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center">
          <div className="flex flex-col items-center min-w-[90px]">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
              step.done
                ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]'
                : step.current
                ? 'bg-primary/20 border-primary shadow-[0_0_20px_rgba(201,168,76,0.6)] animate-pulse'
                : 'bg-white/5 border-white/20'
            }`}>
              {step.done ? (
                <CheckCircle2 className="w-5 h-5 text-white" />
              ) : step.current ? (
                <div className="w-3 h-3 bg-primary rounded-full" />
              ) : (
                <div className="w-2.5 h-2.5 bg-white/20 rounded-full" />
              )}
            </div>
            <p className={`text-xs font-bold mt-2 text-center leading-tight max-w-[80px] ${
              step.done ? 'text-emerald-400' : step.current ? 'text-primary' : 'text-white/30'
            }`}>{step.label}</p>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-12 h-0.5 mb-5 flex-shrink-0 transition-all duration-700 ${
              steps[i + 1]?.done || steps[i].done ? 'bg-emerald-500/60' : 'bg-white/10'
            }`} />
          )}
        </div>
      ))}
    </div>
  );
}

function SuccessParticles() {
  const particles = useMemo(() =>
    Array.from({ length: 20 }).map(() => {
      const angle = Math.random() * Math.PI * 2;
      const d = Math.random() * 180 + 50;
      return {
        x: Math.cos(angle) * d,
        y: Math.sin(angle) * d,
        size: Math.random() * 8 + 3,
        isGold: Math.random() > 0.4,
        delay: Math.random() * 0.3,
        dur: Math.random() * 1.5 + 1,
      };
    }), []);

  return (
    <div className="absolute top-1/2 left-1/2 pointer-events-none">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            backgroundColor: p.isGold ? '#C9A84C' : '#9458FF',
            width: p.size,
            height: p.size,
          }}
          initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
          animate={{ x: p.x, y: p.y, opacity: [0, 1, 0], scale: [0, 1, 0.5] }}
          transition={{ duration: p.dur, delay: p.delay, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

export function UploadSubmissionPage() {
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const code = searchParams.get('code');

  const { getByCode } = useRegistrations();
  const [registration, setRegistration] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);
  const [files, setFiles] = useState<{ [storyId: string]: File }>({});
  const [uploadProgress, setUploadProgress] = useState<{ [storyId: string]: number }>({});
  const [uploadStatus, setUploadStatus] = useState<{ [storyId: string]: 'idle' | 'uploading' | 'success' | 'error' }>({});
  const [allDone, setAllDone] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!code) { setLocation('/'); return; }
    (async () => {
      const data = await getByCode(code);
      if (!data) { toast.error('لم يتم العثور على التسجيل'); setLocation('/'); return; }
      const allowed = ['Payment Submitted', 'Payment Verified', 'Waiting For Novel Upload', 'Needs Attention', 'Novel Uploaded', 'Sent To Telegram', 'Submission Completed', 'Under Review'];
      if (!allowed.includes(data.registrationStatus)) {
        toast.error('يجب تقديم إثبات الدفع أولاً');
        setLocation(`/submission-status?code=${code}`);
        return;
      }
      setRegistration(data);
      setIsLoading(false);
    })();
  }, [code]);

  const validateAndSetFile = (file: File, storyId: string) => {
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowed.includes(file.type) && !['.pdf', '.docx', '.doc'].includes(ext)) {
      toast.error('يسمح فقط بملفات PDF و DOCX'); return;
    }
    if (file.size > 150 * 1024 * 1024) { toast.error('حجم الملف يجب أن يكون أقل من 150MB'); return; }
    setFiles(prev => ({ ...prev, [storyId]: file }));
    setUploadStatus(prev => ({ ...prev, [storyId]: 'idle' }));
  };

  const handleUpload = async (storyId: string, title: string, category: string) => {
    const file = files[storyId];
    if (!file) return;
    setUploadStatus(prev => ({ ...prev, [storyId]: 'uploading' }));
    setUploadProgress(prev => ({ ...prev, [storyId]: 0 }));

    const formData = new FormData();
    formData.append('novel', file);
    formData.append('code', registration.code);
    formData.append('writerName', registration.name);
    formData.append('email', registration.email);
    formData.append('category', category);
    formData.append('novelTitle', title);
    formData.append('registrationId', registration.id);

    const xhr = new XMLHttpRequest();
    const apiUrl = `/api/upload/upload-novel`;

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const p = Math.round((event.loaded * 100) / event.total);
        setUploadProgress(prev => ({ ...prev, [storyId]: Math.min(p, 88) }));
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        setUploadProgress(prev => ({ ...prev, [storyId]: 100 }));
        setUploadStatus(prev => ({ ...prev, [storyId]: 'success' }));
        toast.success(`تم تسليم "${title}" بنجاح`);

        const newStatuses = { ...uploadStatus, [storyId]: 'success' as const };
        const allUploadedNow = registration.stories.every((s: any) =>
          s.upload_status === 'sent' || newStatuses[s.id] === 'success'
        );
        if (allUploadedNow) {
          setAllDone(true);
          setTimeout(() => {
            setLocation(`/dashboard?code=${registration.code}`);
          }, 3500);
        }
      } else {
        setUploadStatus(prev => ({ ...prev, [storyId]: 'error' }));
        try { const r = JSON.parse(xhr.responseText); toast.error(r.error || 'خطأ في الرفع'); }
        catch { toast.error('حدث خطأ أثناء الرفع'); }
      }
    });

    xhr.addEventListener('error', () => {
      setUploadStatus(prev => ({ ...prev, [storyId]: 'error' }));
      toast.error('خطأ في الاتصال بالخادم. تأكد من تشغيل الخادم.');
    });

    xhr.open('POST', `${apiUrl}/${storyId}`);
    xhr.send(formData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center section-dark">
        <div className="text-center">
          <div className="w-16 h-16 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/40 font-medium">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  const currentStory = registration.stories[selectedStoryIndex];
  const isCurrentUploaded = currentStory.upload_status === 'sent' || uploadStatus[currentStory.id] === 'success';

  return (
    <div className="min-h-[calc(100vh-80px)] py-16 px-4 relative section-dark overflow-hidden font-sans" dir="rtl">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#080316] via-[#1A0B2E] to-[#0d0620]" />
      <div className="absolute inset-0 aurora-bg opacity-20 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <AnimatePresence>
        {allDone && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
          >
            <div className="relative text-center">
              <SuccessParticles />
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', bounce: 0.5 }}
                className="w-28 h-28 bg-emerald-500/20 border-2 border-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_60px_rgba(52,211,153,0.5)]"
              >
                <CheckCircle2 className="w-14 h-14 text-emerald-400" />
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-black text-white mb-3"
              >
                تم التسليم بنجاح! 🏆
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-white/60 text-lg mb-6"
              >
                روايتك في طريقها الآن للجنة التحكيم
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-white/30 text-sm flex items-center justify-center gap-2"
              >
                <Loader2 className="w-4 h-4 animate-spin" />
                جاري الانتقال للوحة التحكم...
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mx-auto relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-5 py-2 mb-6"
          >
            <Star className="w-4 h-4 text-primary" />
            <span className="text-primary text-sm font-bold">جوائز حكايتي 2026</span>
          </motion.div>
          <h1 className="text-fluid-h2 font-black text-white mb-3 font-serif">
            مركز تسليم الرواية
          </h1>
          <p className="text-white/50 text-lg leading-relaxed">
            تم استلام إثبات الدفع بنجاح. يمكنك الآن رفع روايتك للمراجعة الرسمية.
          </p>
        </div>

        {/* Progress Timeline */}
        <ProgressTimeline uploadDone={allDone} />

        {/* Main Card */}
        <div className="bg-[#1A0B2E]/80 backdrop-blur-xl rounded-[2rem] border border-primary/25 shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="h-1 w-full gold-gradient" />

          <div className="p-8 md:p-10">
            {/* Registration Info Banner */}
            <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 mb-8">
              <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-0.5">المتسابق</p>
                <p className="text-white font-bold truncate">{registration.name}</p>
              </div>
              <div className="text-left shrink-0">
                <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-0.5">كود التسجيل</p>
                <p className="text-primary font-black font-mono text-sm">{registration.code}</p>
              </div>
            </div>

            {/* Story Tabs */}
            {registration.stories.length > 1 && (
              <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
                {registration.stories.map((story: any, idx: number) => {
                  const done = story.upload_status === 'sent' || uploadStatus[story.id] === 'success';
                  return (
                    <button
                      key={story.id}
                      onClick={() => setSelectedStoryIndex(idx)}
                      className={`px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
                        selectedStoryIndex === idx
                          ? 'bg-primary text-primary-foreground shadow-[0_0_20px_rgba(201,168,76,0.3)]'
                          : 'bg-white/5 text-white/50 hover:bg-white/10'
                      }`}
                    >
                      {done && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      {story.title}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Upload Zone */}
            <AnimatePresence mode="wait">
              {isCurrentUploaded ? (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-emerald-500/10 border-2 border-emerald-400/40 rounded-[1.5rem] p-10 text-center"
                >
                  <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-5 shadow-[0_0_30px_rgba(52,211,153,0.3)]">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                  </div>
                  <h3 className="text-2xl font-black text-emerald-400 mb-2">تم التسليم بنجاح</h3>
                  <p className="text-emerald-400/60 text-sm">تم إرسال روايتك إلى لجنة التحكيم بأمان</p>
                </motion.div>
              ) : (
                <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                  {/* Story Title */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <File className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg leading-tight">{currentStory.title}</h3>
                      <p className="text-white/40 text-sm">{currentStory.category}</p>
                    </div>
                  </div>

                  {/* Drop Zone */}
                  <div
                    onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files[0]) validateAndSetFile(e.dataTransfer.files[0], currentStory.id); }}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    className={`relative border-2 border-dashed rounded-[1.5rem] transition-all duration-300 ${
                      isDragging
                        ? 'border-primary bg-primary/10 scale-[1.01]'
                        : files[currentStory.id]
                        ? 'border-primary/60 bg-primary/5'
                        : 'border-white/15 hover:border-primary/40 hover:bg-white/5'
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept=".pdf,.docx,.doc"
                      onChange={(e) => { if (e.target.files?.[0]) validateAndSetFile(e.target.files[0], currentStory.id); }}
                    />

                    {files[currentStory.id] ? (
                      <div className="p-8 flex flex-col items-center gap-5">
                        <div className="w-20 h-20 bg-primary/15 rounded-2xl flex items-center justify-center relative">
                          <File className="w-10 h-10 text-primary" />
                          {uploadStatus[currentStory.id] !== 'uploading' && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setFiles(p => { const n = {...p}; delete n[currentStory.id]; return n; }); }}
                              className="absolute -top-2 -right-2 w-7 h-7 bg-rose-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                            >
                              <X className="w-3.5 h-3.5 text-white" />
                            </button>
                          )}
                        </div>
                        <div className="text-center">
                          <p className="text-white font-bold text-lg dir-ltr">{files[currentStory.id].name}</p>
                          <p className="text-white/40 text-sm mt-1">{(files[currentStory.id].size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>

                        {uploadStatus[currentStory.id] === 'uploading' && (
                          <div className="w-full max-w-sm">
                            <div className="flex justify-between text-xs text-white/50 mb-2 font-bold">
                              <span className="flex items-center gap-1.5"><Loader2 className="w-3 h-3 animate-spin" /> جاري الإرسال الآمن...</span>
                              <span className="text-primary">{uploadProgress[currentStory.id] || 0}%</span>
                            </div>
                            <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full gold-gradient rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${uploadProgress[currentStory.id] || 0}%` }}
                                transition={{ ease: 'linear' }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full p-12 flex flex-col items-center gap-4 cursor-pointer"
                      >
                        <div className={`w-20 h-20 rounded-full border-2 flex items-center justify-center transition-all ${isDragging ? 'border-primary bg-primary/20' : 'border-white/20 bg-white/5'}`}>
                          <UploadCloud className={`w-9 h-9 ${isDragging ? 'text-primary' : 'text-white/30'}`} />
                        </div>
                        <div className="text-center">
                          <h4 className="text-xl font-bold text-white mb-1">اسحب وأفلت ملف الرواية هنا</h4>
                          <p className="text-white/40 text-sm mb-4">أو انقر لاختيار الملف من جهازك</p>
                          <div className="flex items-center justify-center gap-4 flex-wrap">
                            {[
                              { icon: ShieldCheck, text: 'نقل آمن للجنة' },
                              { icon: null, text: 'PDF, DOCX' },
                              { icon: null, text: 'حد أقصى 150MB' },
                            ].map((item, i) => (
                              <span key={i} className="flex items-center gap-1.5 text-xs text-white/30 font-medium bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                                {item.icon && <item.icon className="w-3.5 h-3.5 text-primary" />}
                                {item.text}
                              </span>
                            ))}
                          </div>
                        </div>
                      </button>
                    )}
                  </div>

                  {/* Error banner */}
                  {uploadStatus[currentStory.id] === 'error' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/30 rounded-xl px-5 py-4 text-rose-400 text-sm font-bold"
                    >
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      حدث خطأ أثناء التسليم. يرجى المحاولة مرة أخرى أو التحقق من اتصالك بالإنترنت.
                    </motion.div>
                  )}

                  {/* Submit button */}
                  {files[currentStory.id] && uploadStatus[currentStory.id] !== 'uploading' && uploadStatus[currentStory.id] !== 'success' && (
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => handleUpload(currentStory.id, currentStory.title, currentStory.category)}
                      className="w-full py-5 gold-gradient text-primary-foreground font-black text-lg rounded-2xl shadow-[0_8px_30px_rgba(201,168,76,0.35)] hover:shadow-[0_8px_40px_rgba(201,168,76,0.5)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 shimmer-button"
                    >
                      تسليم الرواية الرسمية
                      <ChevronRight className="w-5 h-5" />
                    </motion.button>
                  )}

                  {/* Security note */}
                  <div className="flex items-start gap-3 bg-primary/5 border border-primary/15 rounded-xl px-5 py-4 text-white/40 text-xs font-medium">
                    <Clock className="w-4 h-4 text-primary/60 shrink-0 mt-0.5" />
                    ملاحظة: يتم إرسال روايتك مباشرة إلى لجنة التحكيم عبر قناة آمنة. ستظل التسجيل قيد المراجعة حتى يتم التحقق من إثبات الدفع.
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
