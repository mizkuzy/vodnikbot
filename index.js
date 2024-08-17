import dotenv from 'dotenv';
dotenv.config();

import {initBot} from './bot.js';
import {resetTodayConsumption} from './resetTodayConsumption.js';
import cron from 'node-cron';

const start = async () => {
  console.log('start');
  try {
    await initBot();
    await runCron();
  } catch (e) {
    console.log('Something went wrong', e);
  }


  // todo learn why 'callback_query
  // bot.on('callback_query', async (msg) => {
  //   const chatId = msg.message.chat.id
  //   const userAnswer = msg.data
  //
  //   const gameAnswer = chats[chatId];
  //
  //   const user = await User.findOne({where: {chatId}})
  //   if (!user) {
  //     return bot.sendMessage(chatId, `User data is not found. Please click start`)
  //   }
  //   if (Number(userAnswer) === Number(gameAnswer)) {
  //     user.rightAnswers += 1
  //     await bot.sendMessage(chatId, `You've guessed!`, againOptions)
  //   } else {
  //     user.wrongAnswers += 1
  //     await bot.sendMessage(chatId, `You've not guessed! The number was ${gameAnswer}`, againOptions)
  //   }
  //   user.save()
  // })
}

const runCron = async () => {
  // Schedule the reset function to run every hour
  cron.schedule('*/30 * * * * *', async () => {
    console.log('Checking if reset is needed...');
    await resetTodayConsumption();
  });

}
await start()
