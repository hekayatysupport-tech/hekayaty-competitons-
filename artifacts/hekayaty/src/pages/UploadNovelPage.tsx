import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useRegistrations } from '@/hooks/useRegistrations';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, File, X, CheckCircle2, Loader2, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export function UploadNovelPage() {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const code = searchParams.get('code');
  
  const { getByCode } = useRegistrations();
  const [registration, setRegistration] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);
  const [files, setFiles] = useState<{ [storyId: string]: File }>({});
  const [uploadProgress, setUploadProgress] = useState<{ [storyId: string]: number }>({});
  const [uploadStatus, setUploadStatus] = useState<{ [storyId: string]: 'idle' | 'uploading' | 'success' | 'error' }>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!code) {
      setLocation('/');
      return;
    }

    const loadData = async () => {
      const data = await getByCode(code);
      if (!data) {
        toast.error('لم يتم العثور على التسجيل');
        setLocation('/');
        return;
      }
      
      const allowedStatuses = ['Payment Submitted', 'Payment Verified', 'Waiting For Novel Upload', 'Novel Uploaded', 'Submission Completed', 'Under Review', 'Needs Attention'];
      if (!allowedStatuses.includes(data.registrationStatus)) {
        toast.error('يجب تقديم إثبات الدفع أولاً قبل رفع الرواية');
        setLocation(`/success?code=${code}`);
        return;
      }

      setRegistration(data);
      setIsLoading(false);
    };

    loadData();
  }, [code, setLocation]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, storyId: string) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      validateAndSetFile(file, storyId);
    }
  };

  const validateAndSetFile = (file: File, storyId: string) => {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
    const allowedExtensions = ['.pdf', '.docx', '.doc'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(ext)) {
      toast.error('عذراً، يسمح فقط بملفات PDF و DOCX');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast.error('حجم الملف يجب أن يكون أقل من 20 ميجابايت');
      return;
    }

    setFiles(prev => ({ ...prev, [storyId]: file }));
    setUploadStatus(prev => ({ ...prev, [storyId]: 'idle' }));
  };

  const handleDrop = (e: React.DragEvent, storyId: string) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0], storyId);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
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

    try {
      const xhr = new XMLHttpRequest();
      
      const apiUrl = `${import.meta.env.VITE_API_URL || ''}/api/upload/upload-novel`;

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded * 100) / event.total);
          // Only go up to 90%, last 10% is Telegram sending time
          setUploadProgress(prev => ({ ...prev, [storyId]: Math.min(progress, 90) }));
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setUploadProgress(prev => ({ ...prev, [storyId]: 100 }));
          setUploadStatus(prev => ({ ...prev, [storyId]: 'success' }));
          toast.success(`تم رفع وإرسال ${title} بنجاح`);
          
          // Check if all are uploaded
          const allUploaded = registration.stories.every((s: any) => 
             s.id === storyId || uploadStatus[s.id] === 'success' || s.upload_status === 'sent'
          );
          if (allUploaded) {
            setTimeout(() => {
              setLocation(`/success?code=${registration.code}&uploadComplete=true`);
            }, 2000);
          }
        } else {
          setUploadStatus(prev => ({ ...prev, [storyId]: 'error' }));
          try {
            const res = JSON.parse(xhr.responseText);
            toast.error(res.error || 'حدث خطأ أثناء الرفع');
          } catch {
            toast.error('حدث خطأ أثناء الرفع');
          }
        }
      });

      xhr.addEventListener('error', () => {
        setUploadStatus(prev => ({ ...prev, [storyId]: 'error' }));
        toast.error('خطأ في الاتصال بالخادم');
      });

      xhr.open('POST', `${apiUrl}/${storyId}`);
      xhr.send(formData);

    } catch (error) {
      setUploadStatus(prev => ({ ...prev, [storyId]: 'error' }));
      toast.error('حدث خطأ غير متوقع');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center section-dark">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  const currentStory = registration.stories[selectedStoryIndex];
  const isUploaded = currentStory.upload_status === 'sent' || uploadStatus[currentStory.id] === 'success';

  return (
    <div className="min-h-[calc(100vh-80px)] py-24 px-4 relative flex items-center justify-center section-dark overflow-hidden font-sans">
      <div className="absolute inset-0 bg-gradient-to-b from-[#10061e] via-[#1A0B2E] to-[#150824]" />
      <div className="absolute inset-0 aurora-bg opacity-30 pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-4xl relative z-10"
      >
        <div className="text-center mb-12">
          <div className="w-20 h-20 rounded-full border border-primary/20 bg-primary/5 flex items-center justify-center mx-auto mb-6 glow-gold">
            <UploadCloud className="w-10 h-10 text-primary" strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 text-foreground font-serif tracking-wide drop-shadow-md">تسليم الرواية</h1>
          <p className="text-white/60 text-lg">الخطوة الأخيرة لدخول المنافسة الرسمية لجوائز حكايتي</p>
        </div>

        <div className="bg-[#1A0B2E] rounded-[2rem] p-8 md:p-12 border border-primary/30 shadow-[0_20px_50px_rgba(201,168,76,0.15)] relative energy-border">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />

          {/* Story Tabs (If multiple) */}
          {registration.stories.length > 1 && (
            <div className="flex gap-4 mb-8 border-b border-white/10 pb-4 overflow-x-auto custom-scrollbar">
              {registration.stories.map((story: any, idx: number) => {
                const storyUploaded = story.upload_status === 'sent' || uploadStatus[story.id] === 'success';
                return (
                  <button
                    key={story.id}
                    onClick={() => setSelectedStoryIndex(idx)}
                    className={`px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-2 ${selectedStoryIndex === idx ? 'bg-primary text-primary-foreground shadow-lg' : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'}`}
                  >
                    {storyUploaded && <CheckCircle2 className="w-4 h-4" />}
                    {story.title}
                  </button>
                );
              })}
            </div>
          )}

          <div className="space-y-8 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <File className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">{currentStory.title}</h3>
                <p className="text-muted-foreground text-sm">{currentStory.category}</p>
              </div>
            </div>

            {isUploaded ? (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-[#34d399]/10 border border-[#34d399]/30 rounded-2xl p-8 text-center"
              >
                <div className="w-16 h-16 bg-[#34d399]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-[#34d399]" />
                </div>
                <h4 className="text-[#34d399] font-bold text-xl mb-2">تم التسليم بنجاح</h4>
                <p className="text-[#34d399]/70 text-sm">تم إرسال روايتك إلى لجنة التحكيم بأمان.</p>
              </motion.div>
            ) : (
              <div className="space-y-6">
                <div 
                  onDrop={(e) => handleDrop(e, currentStory.id)}
                  onDragOver={handleDragOver}
                  className={`border-2 border-dashed rounded-[2rem] p-12 text-center transition-all ${files[currentStory.id] ? 'border-primary bg-primary/5' : 'border-white/20 hover:border-primary/50 hover:bg-white/5'}`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".pdf,.docx,.doc"
                    onChange={(e) => handleFileSelect(e, currentStory.id)}
                  />

                  {files[currentStory.id] ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center text-primary relative">
                        <File className="w-8 h-8" />
                        {uploadStatus[currentStory.id] !== 'uploading' && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); setFiles(prev => { const n = {...prev}; delete n[currentStory.id]; return n; }); }}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <div>
                        <p className="text-foreground font-bold dir-ltr">{files[currentStory.id].name}</p>
                        <p className="text-muted-foreground text-sm">{(files[currentStory.id].size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>

                      {uploadStatus[currentStory.id] === 'uploading' && (
                        <div className="w-full max-w-md mt-4">
                          <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                            <motion.div 
                              className="h-full gold-gradient"
                              initial={{ width: 0 }}
                              animate={{ width: `${uploadProgress[currentStory.id] || 0}%` }}
                            />
                          </div>
                          <p className="text-xs text-primary mt-2 flex items-center justify-center gap-2">
                            <Loader2 className="w-3 h-3 animate-spin" /> جاري الإرسال الآمن...
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                      <UploadCloud className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h4 className="text-xl font-bold text-foreground mb-2">اسحب وأفلت ملف الرواية هنا</h4>
                      <p className="text-muted-foreground text-sm mb-6">أو انقر لاختيار الملف من جهازك</p>
                      <div className="flex items-center justify-center gap-4 text-xs text-white/40">
                        <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-primary" /> نقل آمن للجنة التحكيم</span>
                        <span>PDF, DOCX</span>
                        <span>الحد الأقصى 20MB</span>
                      </div>
                    </div>
                  )}
                </div>

                {files[currentStory.id] && uploadStatus[currentStory.id] !== 'uploading' && (
                  <button 
                    onClick={() => handleUpload(currentStory.id, currentStory.title, currentStory.category)}
                    className="w-full py-4 gold-gradient text-primary-foreground font-bold text-xl rounded-2xl shadow-[0_0_20px_rgba(201,168,76,0.3)] hover:shadow-[0_0_30px_rgba(201,168,76,0.5)] transition-all flex items-center justify-center gap-3 shimmer-button"
                  >
                    تسليم الرواية الرسمية <ArrowRight className="w-6 h-6" />
                  </button>
                )}
                
                {uploadStatus[currentStory.id] === 'error' && (
                  <div className="flex items-center gap-2 text-rose-400 bg-rose-500/10 p-4 rounded-xl border border-rose-500/20 text-sm font-bold">
                    <AlertCircle className="w-5 h-5" /> حدث خطأ أثناء التسليم. يرجى المحاولة مرة أخرى.
                  </div>
                )}
              </div>
            )}
            
          </div>
        </div>
      </motion.div>
    </div>
  );
}
