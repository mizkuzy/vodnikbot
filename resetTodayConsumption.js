import {COLUMNS, USERS_TABLE} from './db.config.js'
import moment from 'moment-timezone';
import {getUsers, updateUser} from './db.js';

export async function resetTodayConsumption() {
  try {
    const users = await getUsers([COLUMNS[USERS_TABLE].ID, COLUMNS[USERS_TABLE].CHAT_ID, COLUMNS[USERS_TABLE].TIME_ZONE]);

    const chatIdsUpdate = [];

    const updatePromises = users.map(item => {
      const {id, chatId, userTZ} = item;
      const userLocalTime = moment().tz(userTZ);

      if (userLocalTime.hour() === 0) {
        chatIdsUpdate.push(chatId);
        return updateUser(id, chatId, {todayConsumption: 0})
      }
    });

    const usersUpdate = updatePromises.filter(Boolean);

    await Promise.all(usersUpdate);
    console.log(
      usersUpdate.length > 0
        ?`Successfully reset todayConsumption for ${chatIdsUpdate.join(', ')} users`
        :'No users to reset todayConsumption'
    );
  } catch (error) {
    console.error('Error resetting todayConsumption:', error);
  }
}
