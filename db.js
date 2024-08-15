import {docClient, USERS_TABLE, USERS_TABLE_INDEX_CHAT_ID} from './db.config.js'
import {v4 as uuid} from 'uuid';
import {ScanCommand, UpdateCommand} from '@aws-sdk/lib-dynamodb';
import {DescribeTableCommand} from '@aws-sdk/client-dynamodb';

export const testFn = async () => {
  try {
    const command = new DescribeTableCommand({ TableName: USERS_TABLE });
    const response = await docClient.send(command);
    console.log('response', JSON.stringify(response, null, 2));
    return response.Table;
  } catch (error) {
    console.error('Error describing table:', error);
    throw error;
  }
}

const createUser = async (data = {}) => {
  console.log(`try to create user by chatId ${chatId}`);
  try {
    const user = await getUser(data.chatId)

    console.log('user', user);
    if (user) {
      throw new Error('User is already exists')
    }

    const id = uuid();

    const params = {
      TableName: USERS_TABLE,
      Item: {
        id,
        ...data
      }
    }

    const response = await docClient.put(params);
    console.log('createOrGetUser.response', response);
  } catch (e) {
    console.error('createOrGetUser.error', e);
    throw new Error('Error to createOrGetUser', e)
  }
}

const updateUser = async (id, chatId, updateFields) => {
  console.log(`try to update user by id=${id},chatId=${chatId}, updateFields ${JSON.stringify(updateFields)}`);
  try {
    const updateExpressions = [];
    const expressionAttributeValues = {};

    for (const [key, value] of Object.entries(updateFields)) {
      updateExpressions.push(`${key} = :${key}`);
      expressionAttributeValues[`:${key}`] = value;
    }

    const updateExpression = `SET ${updateExpressions.join(', ')}`;

    const params = {
      TableName: USERS_TABLE,
      Key: {id, chatId},
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    };

    const response = await docClient.send(new UpdateCommand(params));
    console.log('updateUser.response', response);

    const {Attributes: updatedUser}= response;
    return updatedUser;
  } catch (e) {
    console.error('updateUser.error', e);
    throw new Error(e.message)
  }
};

const getUsers = async () => {
  const command = new ScanCommand({
    TableName: USERS_TABLE,
  });

  try {
    const {Items = []} = await docClient.send(command)
    return {success: true, data: Items}

  } catch (error) {
    return {success: false, data: null}
  }

}

const getUser = async (chatId) => {
  console.log(`try to get user by chatId ${chatId}`);
  try {
    const response = await docClient.scan({
      TableName: USERS_TABLE,
      FilterExpression: 'chatId = :chatId',
      ExpressionAttributeValues: {
        ':chatId': chatId,
      },
    });
    const {Items = []} = response;
    console.log('getUser.response', response);

    return Items[0];
  } catch (e) {
    console.error('getUser.error', e);
    throw new Error('Error to get user. Please click /start')
  }
}

export {
  createUser,
  updateUser,
  getUsers,
  getUser,
}
