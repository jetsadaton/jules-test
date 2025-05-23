import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

if (!token || !chatId) {
  console.error('Telegram Bot Token or Chat ID is missing. Please check your .env file.');
  // Optionally, throw an error to prevent the application from running without full configuration
  // throw new Error('Telegram Bot Token or Chat ID is missing.'); 
}

let bot: TelegramBot | null = null;

if (token) {
  bot = new TelegramBot(token); // We don't need to poll, just send messages
  console.log('Telegram Bot initialized.');
} else {
  console.warn('Telegram Bot Token not found. Telegram notifications will be disabled.');
}

export async function sendNewEpisodeNotification(
  siteName: string,
  episodeTitle: string,
  episodeUrl: string
): Promise<void> {
  if (!bot || !chatId) {
    console.warn('Telegram bot not initialized or Chat ID missing. Cannot send notification.');
    return;
  }

  const message = `
🎉 *New Episode Alert!* 🎉

**Manga:** ${siteName}
**Episode:** ${episodeTitle}
**Link:** ${episodeUrl}

Enjoy reading!
  `;

  try {
    await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    console.log(`Sent Telegram notification for ${siteName} - ${episodeTitle}`);
  } catch (error) {
    console.error(`Failed to send Telegram notification for ${siteName}:`, error);
    // Depending on the error, you might want to implement retries or specific error handling
  }
}
