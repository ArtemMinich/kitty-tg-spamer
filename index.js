const TelegramBot = require('node-telegram-bot-api');
const schedule = require('node-schedule');

const token = '7738609078:AAHqilcAKL7d6wbJieydra2iTzNB40Bu4ck';

const bot = new TelegramBot(token, { polling: true });

const stickerPack = 'kittysforlife_by_fStikBot';

const activeChats = {};

async function getStickerSet() {
  try {
    const stickerSet = await bot.getStickerSet(stickerPack);
    return stickerSet.stickers;
  } catch (error) {
    console.error('Error getting sticker set:', error);
    return [];
  }
}

async function sendRandomSticker(chatId) {
  try {
    const stickers = await getStickerSet();
    
    if (stickers.length === 0) {
      bot.sendMessage(chatId, 'Не вдалося отримати стікери з пака 😿');
      return;
    }
    
    const randomIndex = Math.floor(Math.random() * stickers.length);
    const randomSticker = stickers[randomIndex];
    
    await bot.sendSticker(chatId, randomSticker.file_id);
    console.log(`Sent a kitty sticker to chat ${chatId}`);
  } catch (error) {
    console.error('Error sending sticker:', error);
  }
}

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  
  await bot.sendMessage(chatId, 'Привіт Аня! Я буду надсилати тобі милих котиків кожні 5 хвилин! 😺');
  
  await sendRandomSticker(chatId);
  
  if (!activeChats[chatId]) {
    activeChats[chatId] = schedule.scheduleJob('*/10 * * * *', async () => {
      await sendRandomSticker(chatId);
    });
    
    console.log(`Started scheduled kitty stickers for chat ${chatId}`);
  } else {
    await bot.sendMessage(chatId, 'Розсилка котиків вже активна! 😸');
  }
});

bot.onText(/\/stop/, (msg) => {
  const chatId = msg.chat.id;
  
  if (activeChats[chatId]) {
    activeChats[chatId].cancel();
    delete activeChats[chatId];
    bot.sendMessage(chatId, 'Розсилку котиків зупинено. Щоб знову отримувати котиків, відправ /start');
    console.log(`Stopped scheduled kitty stickers for chat ${chatId}`);
  } else {
    bot.sendMessage(chatId, 'Розсилка котиків не була активна 🤔');
  }
});

bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 
    'Доступні команди:\n' +
    '/start - Почати отримувати котиків кожні 5 хвилин\n' +
    '/stop - Зупинити розсилку котиків\n' +
    '/help - Показати цю довідку'
  );
});

bot.on('error', (error) => {
  console.error('Telegram bot error:', error);
});

console.log('Bot is running...');