import TelegramApi from 'node-telegram-bot-api'
import {againOptions, gameOptions} from './options.js';
import dotenv from 'dotenv';

dotenv.config();

const token = process.env.TELEGRAM_API_TOKEN;
const bot = new TelegramApi(token, {polling: true})

const chats = {}

const startGame = async (chatId) => {
  await bot.sendMessage(chatId, `I'm guessing a number from 0 to 9`)
  chats[chatId] = Math.floor(Math.random() * 10)
  await bot.sendMessage(chatId, `I've guessed. Try to guess it!`, gameOptions)

  console.error(`GUESSED NUMBER: ${chats[chatId]}`)
}

const start = () => {
  bot.setMyCommands([
    {command: '/start', description: 'Начальное приветствие и стикер в подарок'},
    {command: '/info', description: 'Информация о пользователе'},
    {command: '/game', description: 'guess the number'}
  ])

  bot.on('message', async (msg) => {
    const text = msg.text
    const chatId = msg.chat.id

    console.log(text)
    console.log(chatId)

    switch (text) {
      case '/start': {
        await bot.sendMessage(chatId, 'Привет, я бот. Погнали')
        // get sticker from https://tlgrm.ru/stickers
        await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/e65/38d/e6538d88-ed55-39d9-a67f-ad97feea9c01/1.webp')
        break
      }
      case '/help':
        return bot.sendMessage(chatId, 'Помоги себе сам')
      case '/info':
        return bot.sendMessage(chatId, `Your name is ${msg.from.first_name} ${msg.from.last_name}`)
      case '/game':
        return startGame(chatId)
      default:
        return bot.sendMessage(chatId, `Ты: ${text}`)
    }
  })
  // why 'callback_query
  bot.on('callback_query', async (msg) => {
    const chatId = msg.message.chat.id
    const userAnswer = msg.data

    if (userAnswer === '/again') {
      return startGame(chatId)
    }

    const gameAnswer = chats[chatId];

    if (Number(userAnswer) === Number(gameAnswer)) {
      await bot.sendMessage(chatId, `You've guessed!`, againOptions)
    } else {
      await bot.sendMessage(chatId, `You've not guessed! The number was ${gameAnswer}`, againOptions)
    }
  })
}

start()
