import TelegramApi from 'node-telegram-bot-api';
import {createUser, getUser, testFn, updateUser} from './db.js';
import {checkIfNumber} from './utils.js';
import {COLUMNS, USERS_TABLE} from './db.config.js';

const DEFAULT_TIMEZONE = "Europe/Moscow"

const addLiquid = async (bot, chatId, amount) => {
  try {
    const {id, todayConsumption = 0} = await getUser(chatId)
    const newTodayConsumption = todayConsumption + amount;

    const updatedUser = await updateUser(id, chatId, {todayConsumption: newTodayConsumption})

    return bot.sendMessage(chatId, `You've added ${amount} ml of liquid. Total: ${updatedUser.todayConsumption} ml. You have ${2000 - updatedUser.todayConsumption} ml left to reach your daily goal`)
  } catch (e) {
    return  bot.sendMessage(chatId, `Unfortunately I can not add liquid for you. Please try again later`)
  }
}

const initBot = async () => {
  const token = process.env.TELEGRAM_API_TOKEN;
  const bot = new TelegramApi(token, {polling: true})

  await bot.setMyCommands([
    {command: '/start', description: 'Start to log your liquid consumption'},
    {command: '/info', description: 'Today liquid consumption'},
  ])

  bot.on('message', async (msg) => {
    const msgText = msg.text
    const chatId = msg.chat.id

    console.log('raw msgText', msgText);

    try {
      switch (msgText) {
        case '/start': {
          try {
            await createUser({chatId, [COLUMNS[USERS_TABLE].TIME_ZONE]: DEFAULT_TIMEZONE})
          } catch (e) {
            await bot.sendMessage(chatId, 'Unfortunately I can not create a user for you or it is already created. Please try again later')
          }

          await bot.sendMessage(chatId, 'Hello! I am your liquid consumption bot. I will help you to log your liquid consumption. Every time you drink some liquid, just write me the amount of liquid you drank. I will log it for you. Default daily goal is 2000 ml. You can also ask me for today liquid consumption by typing /info')
          break
        }
        case '/info':
          const user = await getUser(chatId)

          const todayConsumption = user.todayConsumption ?? 0

          return bot.sendMessage(chatId, `Today you've drunk ${todayConsumption} ml of liquid. You have ${2000 - todayConsumption} ml left to reach your daily goal`)
        default: {
          const isInputNumber = checkIfNumber(msgText?.trim())

          if (!isInputNumber) {
            return bot.sendMessage(chatId, 'Please enter a positive integer number')
          }

          try {
            const liquidAmount = Number(msgText)
            await addLiquid(bot, chatId, liquidAmount)
          } catch (e) {
            await bot.sendMessage(chatId, `There is an error. Please try again later, error: ${e}`)
          }
        }
      }
    } catch (e) {
      return bot.sendMessage(chatId, `Error: ${e}`)
    }
  })
}

export {
  initBot
}
