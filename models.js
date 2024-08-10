import { Sequelize, DataTypes } from 'sequelize'
import sequelize from './db.js';

const User = sequelize.define(
  'user',
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
    rightAnswers: {type: DataTypes.INTEGER, defaultValue: 0},
    wrongAnswers: {type: DataTypes.INTEGER, defaultValue: 0},
  },
  {
    // Other model options go here
  },
);

export {
  User
}
