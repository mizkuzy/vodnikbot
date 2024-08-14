import {DataTypes} from 'sequelize'
import sequelize from './db.js';

const User = sequelize.define(
  'users',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    chatId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },
    dailyGoal: {type: DataTypes.INTEGER, defaultValue: 2000},
    todayConsumption: {type: DataTypes.INTEGER, defaultValue: 0},
  },
  {
    tableName: 'users',
    timestamps: true,
  },
);

export {
  User
}
