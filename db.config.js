import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import dotenv from 'dotenv';
dotenv.config();

console.log('init db');

const dbClient = new DynamoDB({
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const docClient = DynamoDBDocument.from(dbClient);

const USERS_TABLE = 'users';
const USERS_TABLE_INDEX_CHAT_ID = 'chatId-gsi';

const COLUMNS = {
  [USERS_TABLE]: {
    ID: 'id',
    CHAT_ID: 'chatId',
    TIME_ZONE: 'userTZ',
    TODAY_CONSUMPTION: 'todayConsumption', // todo rename to dailyConsumption
  }
}

export {
  docClient,
  USERS_TABLE,
  USERS_TABLE_INDEX_CHAT_ID,
  COLUMNS
}
