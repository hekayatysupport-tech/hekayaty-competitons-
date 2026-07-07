import * as dotenv from 'dotenv';
dotenv.config();
import { Router } from 'express';
import multer from 'multer';
import { sendNovelToTelegram } from '../services/telegram';
import { logger } from '../lib/logger';
import fs from 'fs';
import path from 'path';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

const router = Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9.]/g, '_'));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 20 * 1024 * 1024 // 20 MB max
  },
  fileFilter: (req, file, cb) => {
    // Check MIME and Extension
    const allowedMimeTypes = [
      'application/pdf', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];
    const allowedExtensions = ['.pdf', '.docx', '.doc'];
    
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and DOC/DOCX are allowed. Executables and other files are strictly rejected.'));
    }
  }
});

router.post('/upload-novel/:storyId', upload.single('novel'), async (req, res) => {
  let uploadedFilePath = '';
  
  try {
    const { storyId } = req.params;
    const { code, writerName, email, category, novelTitle, registrationId } = req.body;
    
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    uploadedFilePath = req.file.path;

    const metadata = {
      code,
      novelTitle,
      writerName,
      category,
      email,
      submissionDate: new Date().toISOString().split('T')[0]
    };

    logger.info({ storyId, metadata }, 'Starting Telegram novel upload');

    // 1. Send to Telegram
    const telegramRes = await sendNovelToTelegram(uploadedFilePath, metadata);

    // 2. Update Story and Registration via SECURITY DEFINER RPC
    const { error: dbError } = await supabase.rpc('mark_story_uploaded', {
      p_story_id: storyId,
      p_registration_id: registrationId || null,
      p_telegram_message_id: telegramRes.messageId.toString(),
      p_telegram_file_id: telegramRes.fileId.toString(),
      p_file_name: req.file.originalname,
      p_file_size: req.file.size,
      p_mime_type: req.file.mimetype
    });

    if (dbError) {
      logger.error({ dbError }, 'Failed to update database via RPC after Telegram upload, but Telegram send was successful.');
    }

    // 4. Delete temp file
    if (fs.existsSync(uploadedFilePath)) {
      fs.unlinkSync(uploadedFilePath);
    }

    res.json({ success: true, message: 'Novel successfully submitted to Telegram', telegramRes });

  } catch (error: any) {
    logger.error({ err: error }, 'Upload route error');
    
    // Clean up file if it exists
    if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
      fs.unlinkSync(uploadedFilePath);
    }

    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export default router;
