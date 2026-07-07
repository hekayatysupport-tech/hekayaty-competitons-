import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import { logger } from '../lib/logger';

export interface TelegramMetadata {
  code: string;
  novelTitle: string;
  writerName: string;
  category: string;
  email: string;
  submissionDate: string;
}

export async function sendNovelToTelegram(filePath: string, metadata: TelegramMetadata): Promise<{ messageId: string, fileId: string }> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    throw new Error('Telegram configuration missing: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID');
  }

  const url = `https://api.telegram.org/bot${token}/sendDocument`;

  const caption = `🏆 Hekayaty Awards 2026\n━━━━━━━━━━━━━━━━━━━━━━\n🆔 Registration Code\n${metadata.code}\n📚 Novel\n${metadata.novelTitle}\n👤 Writer\n${metadata.writerName}\n📂 Category\n${metadata.category}\n📧 Email\n${metadata.email}\n📅 Submitted\n${metadata.submissionDate}\n━━━━━━━━━━━━━━━━━━━━━━\n✨ Official Competition Submission`;

  const formData = new FormData();
  formData.append('chat_id', chatId);
  formData.append('caption', caption);
  formData.append('document', fs.createReadStream(filePath));

  try {
    const response = await axios.post(url, formData, {
      headers: {
        ...formData.getHeaders()
      }
    });

    if (response.data && response.data.ok) {
      const message = response.data.result;
      return {
        messageId: message.message_id.toString(),
        fileId: message.document?.file_id || ''
      };
    } else {
      logger.error({ responseData: response.data }, 'Telegram API returned not ok');
      throw new Error(`Telegram API Error: ${response.data.description}`);
    }
  } catch (error: any) {
    logger.error({ err: error.response?.data || error.message }, 'Failed to send document to Telegram');
    throw new Error(`Failed to send document to Telegram: ${error.response?.data?.description || error.message}`);
  }
}
