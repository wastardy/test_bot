const TelegramApi = require('node-telegram-bot-api');
const { inlineKeyboard } = require('telegraf/markup');
const {gameOptions, againOptions} = require('./options');
const token = '7407618628:AAEVX73ZLx1MwHbrfwjYHd3Rit151OXofWo';

// about polling & webhook
/*
    polling: true - бот буде використовувати --> long polling <--. 

    - БОТ ДАЄ ЗАПИТ на сервер, чи є якісь повідомлення
    - сервер тримає з'єднання відкритим і чекає поки з'являться потрібні повідомлення або подія
    - як тільки з'являється потрібне повідомлення, сервер відповідає боту
    - після отримання відповіді, бот знову дає запит на сервер

    polling: false, since webhook is using 

    - бот встановлює вебхук: каже серверу телеграм "якщо є нове повідомлення, відправляй за адресою URL"
    - коли з'являється нове повідомлення, сервер телеграм сам його відправляє на вказану адресу
    - бот отримує повідомлення і обробляє його

    --------------------------------------------------------------

    Різниця між Long Polling і Webhook:
    Long Polling: Бот постійно питає сервер, чи є щось нове.
    Webhook: Сервер сам повідомляє бота про новини, як тільки вони з'являються.
*/
const bot = new TelegramApi(token, {polling:true} );

const chats = {};
const attempts = {};



const startGame = async (chatId) => {
    await bot.sendMessage(chatId, 'I will pick a number from 1 to 9\nand you guess it! 😈');

    const randomNumber = Math.floor(Math.random() * 9) + 1;
    chats[chatId] = randomNumber;
    attempts[chatId] = 0;

    await bot.sendMessage(chatId, 'Guess Number!', gameOptions);
}

const start = () => {
    bot.setMyCommands([
        {command: '/start', description: 'start chat with bot'},
        {command: '/info', description: 'information about you'}, 
        {command: '/game', description: 'guess right number'}
    ]);

    // async?? глянути асинхронні функції
    bot.on('message', async msg => {
        // var for user input
        const text = msg.text;
        const chatId = msg.chat.id;
    
        if (text === '/start') {
            await bot.sendSticker(chatId, 'https://sl.combot.org/jk1g7/webp/5xf09f98b2.webp');
            await bot.sendMessage(chatId, `Welcome there, ${msg.chat.username}`);
        }
        else if (text === '/info') {
            await bot.sendMessage(chatId, `Your name is ${msg.chat.first_name}, and you are slave. I guessed right, didn't I? 😸`);
            await bot.sendSticker(chatId, 'https://sl.combot.org/video_gachi/webp/12xf09f91a8e2808df09fa6b0.webp');
        }
        else if (text === '/game') {
            return startGame(chatId);
        }
        else {
            return bot.sendMessage(chatId, `Sorry, I didn't understand your question 🙃`);
        }
        // console.log(msg);
    });

    bot.on('callback_query', async msg => {
        const data = msg.data;
        const chatId = msg.message.chat.id; 

        if (!attempts[chatId]) {
            attempts[chatId] = 0;
        }

        if (data === '/again') {
            return startGame(chatId);
        }

        if (data == chats[chatId]) {
            await bot.sendMessage(chatId, `Congratulations, you guessed right number ${chats[chatId]})`, againOptions);
        
            delete attempts[chatId];
        }
        else {
            attempts[chatId]++;

            if (attempts[chatId] === 3) {
                await bot.sendMessage(chatId, `You loose, right number was ${chats[chatId]}`, againOptions);

                delete attempts[chatId];
            }
            else {
                await bot.sendMessage(chatId, `Sorry, you didn't guess. \nYou have <b>${3 - attempts[chatId]} attempts</b> left.`, {parse_mode: 'HTML'});
            }
        }
    });
};

start();