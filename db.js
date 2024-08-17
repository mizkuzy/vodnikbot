import {docClient, USERS_TABLE} from './db.config.js'
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
  console.log(`try to create user with data ${JSON.stringify(data, null, 2)}`);
  try {
    const user = await getUser(data.chatId)

    if (user) {
      // todo suggest to reset user data
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
    console.log('updateUser.response', response.Attributes);

    const {Attributes: updatedUser}= response;
    return updatedUser;
  } catch (e) {
    console.error('updateUser.error', e);
    throw new Error(e.message)
  }
};

const getUsers = async (projectionParams) => {
  console.log('try to get all users, projectionParams', projectionParams);

  const command = new ScanCommand({
    TableName: USERS_TABLE,
    ProjectionExpression: projectionParams ? projectionParams.join(', ') : undefined,
  });

  try {
    const {Items: data = []} = await docClient.send(command)
    return data

  } catch (e) {
    throw new Error(e.message)
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
    console.log('getUser.response', response.Items);

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
