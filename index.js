const TelegramApi = require('node-telegram-bot-api');
const { inlineKeyboard } = require('telegraf/markup');
const {gameOptions, againOptions} = require('./options');
const { message } = require('telegraf/filters');
const token = require('./token');

// для виконання HTTP запитів -> axios
// основна функція = відправляти запити до зовнішніх API або серверів і отримувати відповідь
const axios = require("axios"); 

const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send("Bot is running");
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

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
const userStates = {};

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
        {command: '/game', description: 'guess right number'}, 
        {command: '/weather', description: 'find out the weather'}
    ]);

    // async?? глянути асинхронні функції
    bot.on('message', async msg => {
        // var for user input
        const text = msg.text;
        const chatId = msg.chat.id;
        const userName = msg.from.first_name || msg.from.username || 'underfiend';
        const userNickname = msg.from.username || msg.from.first_name;
    
        if (userStates[chatId] === 'waiting_for_city') {
            const city = text;

            try {
                const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=fe6cdc2335eb98949a3089d566577564`);
                const data = response.data;
                const weather = data.weather[0].description;
                const temperature = data.main.temp - 273.15;
                const humidity = data.main.humidity;
                const pressure = data.main.pressure;
                const windSpeed = data.wind.speed;

                const message = `The weather in ${data.name} is ${weather} with a temperature of ${temperature.toFixed(2)}°C. The humidity is ${humidity}%, the pressure is ${pressure}hPa, and the wind speed is ${windSpeed}m/s.`;
    
                bot.sendMessage(chatId, message);
            } catch (error) {
                // console.log(error)
                bot.sendMessage(chatId, `Can't find city ${city}`);
            }
        }

        delete userStates[chatId];
        // console.log(msg);
        if (text === '/start') {
            await bot.sendSticker(chatId, 'https://sl.combot.org/jk1g7/webp/5xf09f98b2.webp');
            await bot.sendMessage(chatId, `Welcome there, ${userNickname}`);
        }
        else if (text === '/info') {
            await bot.sendMessage(chatId, `Your name is ${userName}, and you are slave. I guessed right, didn't I? 😸`);
            await bot.sendSticker(chatId, 'https://sl.combot.org/video_gachi/webp/12xf09f91a8e2808df09fa6b0.webp');
        }
        else if (text === '/game') {
            return startGame(chatId);
        }
        else if (text === '/clear') {
            await bot.deleteMessage(chatId, chat.id)
        } 
        else if (text === '/weather') {
            userStates[chatId] = 'waiting_for_city';

            await bot.sendMessage(chatId, 'Enter the name of the city');
        }
        // else {
        //     return bot.sendMessage(chatId, `Sorry, I didn't understand your question 🙃`);
        // }
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


/*
    bot.command('deleteAll', async (ctx) => {
        let res = await ctx.reply('deleting');
        console.log(res);
        for(let i = res.message_id; i >= 0; i--) {
            console.log(chat_id: ${ctx.chat.id}, message_id: ${i});
            try {
                let res = await ctx.telegram.deleteMessage(ctx.chat.id, i);
                console.log(res);
            } catch (e) {
                console.error(e);
            }
        }
    });

    bot.launch();

    // bot.launch() є стандартним методом у бібліотеці Telegraf для запуску бота на Node.js.
*/