import express, { Request, Response } from 'express';
import cors from 'cors';
import multer from 'multer';
import axios from 'axios';
import FormData from 'form-data';
import rateLimit from 'express-rate-limit';
import { createClient } from '@supabase/supabase-js';

const app = express();

// ─── Supabase Clients ────────────────────────────────────────────────────────
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

// Service-role client (bypasses RLS) for server-side ops
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Multer (memory storage — no disk needed on Vercel) ──────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
  fileFilter: (_req: any, file: any, cb: any) => {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ];
    const ext = file.originalname.split('.').pop()?.toLowerCase();
    if (allowed.includes(file.mimetype) && ['pdf', 'docx', 'doc'].includes(ext || '')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and DOC/DOCX are allowed.'));
    }
  },
});

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Novel Upload ─────────────────────────────────────────────────────────────
app.post('/api/upload/upload-novel/:storyId', upload.single('novel'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { storyId } = req.params;
    const { code, writerName, email, category, novelTitle, registrationId } = req.body;

    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      res.status(500).json({ error: 'Telegram configuration missing on server' });
      return;
    }

    // Build Telegram caption
    const submissionDate = new Date().toISOString().split('T')[0];
    const caption =
      `🏆 Hekayaty Awards 2026\n━━━━━━━━━━━━━━━━━━━━━━\n` +
      `🆔 Registration Code\n${code}\n` +
      `📚 Novel\n${novelTitle}\n` +
      `👤 Writer\n${writerName}\n` +
      `📂 Category\n${category}\n` +
      `📧 Email\n${email}\n` +
      `📅 Submitted\n${submissionDate}\n` +
      `━━━━━━━━━━━━━━━━━━━━━━\n✨ Official Competition Submission`;

    // Send buffer directly to Telegram (no disk write needed)
    const formData = new FormData();
    formData.append('chat_id', chatId);
    formData.append('caption', caption);
    formData.append('document', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const telegramRes = await axios.post(
      `https://api.telegram.org/bot${token}/sendDocument`,
      formData,
      { headers: formData.getHeaders(), timeout: 55000 },
    );

    if (!telegramRes.data?.ok) {
      throw new Error(`Telegram API Error: ${telegramRes.data?.description}`);
    }

    const message = telegramRes.data.result;
    const messageId = message.message_id.toString();
    const fileId = message.document?.file_id || '';

    // Update Supabase via SECURITY DEFINER RPC
    const { error: dbError } = await supabaseAdmin.rpc('mark_story_uploaded', {
      p_story_id: storyId,
      p_registration_id: registrationId || null,
      p_telegram_message_id: messageId,
      p_telegram_file_id: fileId,
      p_file_name: req.file.originalname,
      p_file_size: req.file.size,
      p_mime_type: req.file.mimetype,
    });

    if (dbError) {
      console.error('DB update error after Telegram send:', dbError);
    }

    res.json({ success: true, message: 'Novel successfully submitted to Telegram', messageId, fileId });
  } catch (error: any) {
    console.error('Upload error:', error?.response?.data || error?.message);
    res.status(500).json({ error: error?.response?.data?.description || error?.message || 'Internal server error' });
  }
});

// ─── Admin Auth ───────────────────────────────────────────────────────────────
const adminAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many authentication attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY;

// POST /api/admin/auth/login
app.post('/api/admin/auth/login', adminAuthLimiter, async (req: Request, res: Response): Promise<void> => {
  const { email, password, secretKey } = req.body;

  if (!email || !password || !secretKey) {
    res.status(400).json({ error: 'Email, password, and secret key are required' });
    return;
  }

  if (secretKey !== ADMIN_SECRET_KEY) {
    res.status(401).json({ error: 'Invalid administrator credentials.' });
    return;
  }

  try {
    let { data: authData, error: authError } = await (supabaseAdmin.auth as any).signInWithPassword({ email, password });

    if (authError || !authData?.user) {
      const { data: signUpData, error: signUpError } = await (supabaseAdmin.auth as any).signUp({
        email,
        password,
        options: { data: { full_name: 'Admin' } },
      });

      if (signUpError || !signUpData?.user) {
        res.status(401).json({ error: 'Invalid administrator credentials.' });
        return;
      }

      const { error: rpcError } = await supabaseAdmin.rpc('register_as_admin', {
        p_user_id: signUpData.user.id,
        p_secret_key: secretKey,
        p_role: 'super_admin',
      });

      if (rpcError) {
        res.status(500).json({ error: 'Failed to assign admin role' });
        return;
      }

      const { data: autoSignIn, error: autoErr } = await (supabaseAdmin.auth as any).signInWithPassword({ email, password });
      if (autoErr || !autoSignIn?.user) {
        res.status(500).json({ error: 'Created but failed to auto-login' });
        return;
      }
      authData = autoSignIn;
    }

    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('admin_roles')
      .select('id, role')
      .eq('user_id', authData.user!.id)
      .maybeSingle();

    if (roleError || !roleData) {
      res.status(403).json({ error: 'Invalid administrator credentials.' });
      return;
    }

    res.json({ success: true, session: authData.session, user: authData.user, role: roleData.role });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/admin/auth/register
app.post('/api/admin/auth/register', adminAuthLimiter, async (req: Request, res: Response): Promise<void> => {
  const { email, password, name, secretKey, role = 'super_admin' } = req.body;

  if (!email || !password || !name || !secretKey) {
    res.status(400).json({ error: 'All fields are required' });
    return;
  }

  if (secretKey !== ADMIN_SECRET_KEY) {
    res.status(401).json({ error: 'Invalid administrator key.' });
    return;
  }

  try {
    const { data: authData, error: signUpError } = await (supabaseAdmin.auth as any).signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });

    if (signUpError || !authData?.user) {
      res.status(400).json({ error: signUpError?.message || 'Failed to create account' });
      return;
    }

    const { error: rpcError } = await supabaseAdmin.rpc('register_as_admin', {
      p_user_id: authData.user.id,
      p_secret_key: secretKey,
      p_role: role,
    });

    if (rpcError) {
      res.status(500).json({ error: 'Failed to assign admin role' });
      return;
    }

    const { data: signInData, error: signInError } = await (supabaseAdmin.auth as any).signInWithPassword({ email, password });

    if (signInError) {
      res.status(500).json({ error: 'Created but failed to auto-login' });
      return;
    }

    res.json({ success: true, session: signInData.session, user: signInData.user, role });
  } catch (error) {
    console.error('Admin register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default app;
