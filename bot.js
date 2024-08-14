import TelegramApi from 'node-telegram-bot-api';
import {User} from './models.js';

const addLiquid = async (bot, chatId, amount, user) => {
  user.todayConsumption += amount
  await user.save()

  return bot.sendMessage(chatId, `You've added ${amount} ml of liquid. Total: ${user.todayConsumption} ml. You have ${2000 - user.todayConsumption} ml left to reach your daily goal`)
}

const getUser = async (chatId, createNew) => {
  const user = await User.findOne({where: {chatId}})

  if (!user && createNew) {
    return await User.create({
      chatId,
    })
  }

  if (!user) {
    throw new Error('User data is not found. Please click /start')
  }

  return user
}

const initBot = async () => {
  const token = process.env.TELEGRAM_API_TOKEN;
  const bot = new TelegramApi(token, {polling: true})

  bot.setMyCommands([
    {command: '/start', description: 'Start to log your liquid consumption'},
    {command: '/info', description: 'Today liquid consumption'},
  ])

  bot.on('message', async (msg) => {
    const msgText = msg.text
    const chatId = msg.chat.id

    console.log('msgText', msgText);
    try {
      switch (msgText) {
        case '/start': {
          await getUser(chatId, true)

          await bot.sendMessage(chatId, 'Hello! I am your liquid consumption bot. I will help you to log your liquid consumption. Every time you drink some liquid, just write me the amount of liquid you drank. I will log it for you. Default daily goal is 2000 ml. You can also ask me for today liquid consumption by typing /info')
          break
        }
        case '/info':
          const user = await getUser(chatId, true)

          return bot.sendMessage(chatId, `Today you've drunk ${user.todayConsumption ?? 0} ml of liquid. You have ${2000 - user.todayConsumption} ml left to reach your daily goal`)
        default: {
          // todo validate amount
          const user = await getUser(chatId, true)

          const ko = Number(msgText)
          console.log('Number(msgText)', ko, typeof ko);
          await addLiquid(bot, chatId, Number(msgText), user)
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
