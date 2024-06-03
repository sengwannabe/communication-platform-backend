import { getData, Message, Channel, setData, DM, User, Session, DataStore, getTemp, setTemp } from './dataStore';
import {
  findSessionV2, findUser, findChannel, findDM, findMessage,
  isMember, isMemberDM, isOwner, isOwnerDM, isGlobalOwner,
  getTime, IdCreate, BAD_REQUEST, FORBIDDEN, getReactStatus,
} from './helper';
import HTTPError from 'http-errors';
import { errInsufficentPerms, errNotFound, errTooLong, errTooShort, invalidIdStr, notMember } from './errorMessages';
import { userStatsMessagesSent, usersStatsMessagesExist } from './users';
import { constructChat, notificationPushReacted, notificationPushTagged } from './notifications';

/**
 * Send a message from the authorised user to the channel specified by channelId.
 *
 * @param token     The token of the authorised user
 * @param channelId The channel to send the message to
 * @param message   The message to send
 * @returns         The id of the message sent
 */
export function messageSendV2(token: string, channelId: number, message: string): { messageId: number } {
  const messageObj = messageSendCore(token, channelId, message, 'channel', findChannel, isMember);
  usersStatsMessagesExist(token);
  userStatsMessagesSent(token);
  return { messageId: messageObj.messageId };
}

/**
 * Send a message from the authorised user to the channel specified by dmId.
 *
 * @param token   The token of the authorised user
 * @param dmId    The DM to send the message to
 * @param message The message to send
 * @returns       The id of the message sent
 */
export function messageSenddmV2(token: string, dmId: number, message: string): { messageId: number } {
  const messageObj = messageSendCore(token, dmId, message, 'dm', findDM, isMemberDM);
  usersStatsMessagesExist(token);
  return { messageId: messageObj.messageId };
}

/**
 * Send a message from the authorised user to the channel specified by channelId in a certain amount of time
 *
 * @param token     The token of the authorised user
 * @param channelId The channel to send the message to
 * @param message   The message to send
 * @param timeSent  The time in the future to send the message
 * @returns         The id of the message sent
 */

export function messageSendLaterV1(token: string, channelId: number, message: string, timeSent: number): { messageId: number } {
  if (timeSent < Date.now()) {
    throw HTTPError(BAD_REQUEST, 'Time is in the past');
  }

  const messageId = IdCreate();
  const messageObj = generateMessageforLater(token, channelId, messageId, message, 'dm', findChannel, isMember);

  const dataStore = getData();
  const channel = findChannel(dataStore, channelId);

  const delayTime = timeSent - Date.now();
  const timeOutId = setTimeout(() => sendMessage(channel.messages, messageObj), delayTime);
  const temp = getTemp();
  temp.push(timeOutId);
  setTemp(temp);
  return {
    messageId: messageId
  };
}

/**
 * Send a message from the authorised user to the dm specified by dmId in a certain amount of time
 *
 * @param token     The token of the authorised user
 * @param dmId      The dm to send the message to
 * @param message   The message to send
 * @param timeSent  The time in the future to send the message
 * @returns         The id of the message sent
 */
export function messageSendLaterDmV1(token: string, dmId: number, message: string, timeSent: number): { messageId: number } {
  if (timeSent < Date.now()) {
    throw HTTPError(BAD_REQUEST, 'Time is in the past');
  }

  const messageId = IdCreate();
  const messageObj = generateMessageforLater(token, dmId, messageId, message, 'dm', findDM, isMemberDM);

  const dataStore = getData();
  const dm = findDM(dataStore, dmId);

  const delayTime = timeSent - Date.now();
  const timeOutId = setTimeout(() => sendMessage(dm.messages, messageObj), delayTime);
  const temp = getTemp();
  temp.push(timeOutId);
  setTemp(temp);
  return {
    messageId: messageId
  };
}

/**
 * Given a messageId for a message, this message is removed from the channel/DM
 *
 * @param token     The token of the authorised user
 * @param messageId The messageId of the message to delete
 * @returns         Nothing
 */
export function messageRemoveV2(token: string, messageId: number) {
  const session = findSessionV2(token);
  const data = getData();
  const { message, channel, dm } = messageAssert(session, messageId, (message, user) => message.uId !== user.uId);
  const chat = channel !== undefined ? channel : dm;
  messageRemoveChat(message, chat);
  usersStatsMessagesExist(token);
  setData(data);
  return {};
}

/**
 * Given a message, update its text with new text.
 * If the new message is an empty string, the message is deleted.
 *
 * @param token      The token of the authorised user
 * @param messageId  The messageId of the message to edit
 * @param newMessage The edited message
 * @returns          Nothing
 */
export function messageEditV2(token: string, messageId: number, newMessage: string) {
  if (newMessage === '') return messageRemoveV2(token, messageId);
  const session = findSessionV2(token);
  const data = getData();
  if (newMessage.length > 1000) throw HTTPError(BAD_REQUEST, errTooLong('message', '1000'));
  const { message, channel, dm } = messageAssert(session, messageId, (message, user) => message.uId !== user.uId);

  message.message = newMessage;
  setData(data);

  const { chatType, chatId, chat } = constructChat(channel, dm);
  notificationPushTagged(findUser(data, session.authUserId), newMessage, chatType, chatId, chat);
  return {};
}

/**
 * Given a message within a channel or DM the authorised user is
 * part of, adds a "react" to that particular message.
 *
 * @param token     The token of the authorised user
 * @param messageId The messageId of the message to react to
 * @param reactId   The id of the reaction to add
 * @returns         Nothing
 */
export function messageReactV1(token: string, messageId: number, reactId: number) {
  const session = findSessionV2(token);
  const data = getData();
  const { message, channel, dm } = messageAssert(session, messageId, () => false);

  const reacts = getReactStatus(session.authUserId, message).find(o => o.reactId === reactId);
  if (reacts === undefined) throw HTTPError(BAD_REQUEST, invalidIdStr('reactId'));
  if (reacts.isThisUserReacted) throw HTTPError(BAD_REQUEST, 'user has already reacted.');

  const addReact = message.reacts.find(o => o.reactId === reactId);
  addReact.uIds.push(session.authUserId);
  setData(data);

  notificationPushReacted(findUser(data, session.authUserId), findUser(data, message.uId), channel, dm);

  return {};
}

/**
 * Given a message within a channel or DM the authorised user is
 * part of, removes a "react" to that particular message.
 *
 * @param token     The token of the authorised user
 * @param messageId The messageId of the message to unreact to
 * @param reactId   The id of the reaction to remove
 * @returns         Nothing
 */
export function messageUnreactV1(token: string, messageId: number, reactId: number) {
  const session = findSessionV2(token);
  const data = getData();
  const { message } = messageAssert(session, messageId, () => false);

  const reacts = getReactStatus(session.authUserId, message).find(o => o.reactId === reactId);
  if (reacts === undefined) throw HTTPError(BAD_REQUEST, invalidIdStr('reactId'));
  if (!reacts.isThisUserReacted) throw HTTPError(BAD_REQUEST, 'user has not reacted.');

  const removeReact = message.reacts.find(o => o.reactId === reactId);
  removeReact.uIds.splice(removeReact.uIds.indexOf(session.authUserId), 1);
  setData(data);

  return {};
}

/**
 * Given a message within a channel or DM, marks it as "pinned".
 *
 * @param token     The token of the authorised user
 * @param messageId THe messageId of the message to pin
 * @returns         Nothing
 */
export function messagePinV1(token: string, messageId: number) {
  const session = findSessionV2(token);
  const data = getData();
  const { message } = messageAssert(session, messageId, () => true);
  if (message.isPinned) throw HTTPError(BAD_REQUEST, 'message is already pinned');

  message.isPinned = true;
  setData(data);
  return {};
}

/**
 *
 * Function shares an exisitng message to the wanted channel/dm with an optional additional message
 *
 * @param token       token of the active user
 * @param ogMessageId id of the original message to be shared
 * @param message     optional additional message
 * @param channelId   id of the channel to be shared to, is -1 if sent to dm
 * @param dmId        id of the dm to be shared to, is -1 if sent to channel
 * @returns           id of the shared message
 */
export function messageShareV1(token: string, ogMessageId: number, message: string, channelId: number, dmId: number): { sharedMessageId: number } {
  const dataStore = getData();
  const session = findSessionV2(token);
  const user = findUser(dataStore, session.authUserId);
  const channel = findChannel(dataStore, channelId);
  const dm = findDM(dataStore, dmId);

  // both channelId and dmId are invalid
  if (dm === undefined && channel === undefined) {
    throw HTTPError(BAD_REQUEST, invalidIdStr('channel and dm '));
  }

  // channelId and dmId are valid, but user is not part of the channel/dm the message is sent to
  if (channelId === -1 && !isMemberDM(dm, user)) {
    throw HTTPError(FORBIDDEN, notMember('dm'));
  } else if (dmId === -1 && !isMember(channel, user)) {
    throw HTTPError(FORBIDDEN, notMember('channel'));
  }

  // neither channelId nor dmId is -1
  if (channelId !== -1 && dmId !== -1) throw HTTPError(BAD_REQUEST, 'channelId and dmId are both not -1');

  // ogMessage not valid
  const ogMessageObj = findMessage(dataStore, user, ogMessageId);
  if (ogMessageObj.message === undefined) throw HTTPError(BAD_REQUEST, invalidIdStr('message'));

  // message greater than 1000
  if (message.length > 1000) throw HTTPError(BAD_REQUEST, errTooLong('Optional message', '1000'));

  const ogMessage = ogMessageObj.message.message;
  const sharedMessage = `${message}\n---\n${ogMessage}\n---`;
  const shareMessageObj = generateMessage(user, sharedMessage);

  if (dmId === -1) {
    sendMessage(channel.messages, shareMessageObj);
  }
  if (channelId === -1) {
    sendMessage(dm.messages, shareMessageObj);
  }

  return { sharedMessageId: shareMessageObj.messageId };
}

/**
 * Given a message within a channel or DM, removes its mark as "pinned".
 *
 * @param token     The token of the authorised user
 * @param messageId THe messageId of the message to pin
 * @returns         Nothing
 */
export function messageUnpinV1(token: string, messageId: number) {
  const session = findSessionV2(token);
  const data = getData();
  const { message } = messageAssert(session, messageId, () => true);
  if (!message.isPinned) throw HTTPError(BAD_REQUEST, 'message is not pinned');

  message.isPinned = false;
  setData(data);
  return {};
}

// Local Helper Functions

/**
 * Core function dictating logic for both messageSend and messageSenddm
 *
 * @param token    The token of the authorised user
 * @param chatId   The channel/DM to send the message to
 * @param message  The message to send
 * @param chatType The chat type (i.e. 'channel' or 'DM'): used only for error messages
 * @param fnFind   The function used to find the chat
 * @param fnMember The function used to determine if the user is a member of the chat
 * @returns        A full message object of the sent message
 */
function messageSendCore(token: string, chatId: number, message: string, chatType: 'channel' | 'dm',
  fnFind: (data: DataStore, chatId: number) => Channel | DM,
  fnMember: (chat: Channel | DM, user: User) => boolean) {
  const session = findSessionV2(token);
  const data = getData();
  const user = findUser(data, session.authUserId);
  const chat = fnFind(data, chatId);
  if (chat === undefined) throw HTTPError(BAD_REQUEST, invalidIdStr(chatType));
  if (!fnMember(chat, user)) throw HTTPError(FORBIDDEN, notMember(chatType));

  if (message.length < 1) throw HTTPError(BAD_REQUEST, errTooShort('message', '1'));
  if (message.length > 1000) throw HTTPError(BAD_REQUEST, errTooLong('message', '1000'));

  const messageObj = generateMessage(user, message);
  chat.messages.unshift(messageObj);
  notificationPushTagged(user, message, chatType, chatId, chat);
  setData(data);
  return messageObj;
}

/**
 * Core function to generate message for messageSendLater and messageSendLaterDm to send later
 *
 * @param token     The token of the authorised user
 * @param chatId    The channel/DM to send the message to
 * @param messageId The previously create Id of the message
 * @param message   The message to send
 * @param type      The chat type (i.e. 'channel' or 'DM'): used only for error messages
 * @param fnFind    The function used to find the chat
 * @param fnMember  The function used to determine if the user is a member of the chat
 * @returns         A full message object of the sent message
 */
function generateMessageforLater(token: string, chatId: number, messageId: number, message: string, type: string,
  fnFind: (data: DataStore, chatId: number) => Channel | DM,
  fnMember: (chat: Channel | DM, user: User) => boolean): Message {
  const session = findSessionV2(token);
  const data = getData();
  const user = findUser(data, session.authUserId);
  const chat = fnFind(data, chatId);
  if (chat === undefined) throw HTTPError(BAD_REQUEST, invalidIdStr(type));
  if (!fnMember(chat, user)) throw HTTPError(FORBIDDEN, notMember(type));

  if (message.length < 1) throw HTTPError(BAD_REQUEST, errTooShort('message', '1'));
  if (message.length > 1000) throw HTTPError(BAD_REQUEST, errTooLong('message', '1000'));

  const timeSent = getTime();
  return {
    messageId: messageId,
    uId: user.uId,
    message: message,
    timeSent: timeSent,
    reacts: [{
      reactId: 1,
      uIds: [],
    }],
    isPinned: false,
  };
}

/**
 * Generates a new message object
 *
 * @param user    User object
 * @param message Message string
 * @returns       Message object
 */
export function generateMessage(user: User, message: string): Message {
  const messageId = IdCreate();
  const timeSent = getTime();
  return {
    messageId: messageId,
    uId: user.uId,
    message: message,
    timeSent: timeSent,
    reacts: [{
      reactId: 1,
      uIds: [],
    }],
    isPinned: false,
  };
}

/**
 *
 * Function is called to send a message
 *
 * @param group   The group wanted to send to
 * @param message The message object wanting to send
 */
function sendMessage(group: Message[], message: Message) {
  const dataStore = getData();
  group.unshift(message);
  setData(dataStore);
}

/**
 * Deletes a message from either a channel or DM.
 *
 * @param message The message object to delete.
 * @param chat    The channel or DM to delete from.
 */
function messageRemoveChat(message: Message, chat: Channel | DM) {
  const index = chat.messages.indexOf(message);
  chat.messages.splice(index, 1);
}

/**
 * Checks whether a message exists, and optionally, whether the user has required permissions.
 *
 * @param session    The session of the authorised user
 * @param messageId  The id of the message to check for
 * @param extraCheck The function to run an extra check with over message and user.
 * @returns          An object containing message, channel, and dm.
 */
function messageAssert(session: Session, messageId: number, extraCheck: (message: Message, user: User) => boolean) {
  const data = getData();
  const user = findUser(data, session.authUserId);
  const { message, channel, dm } = findMessage(data, user, messageId);
  if (message === undefined) throw HTTPError(BAD_REQUEST, errNotFound('message'));
  if (channel !== undefined) {
    if (extraCheck(message, user) && !isOwner(channel, user) && !isGlobalOwner(user)) {
      throw HTTPError(FORBIDDEN, errInsufficentPerms());
    }
  } else {
    if (extraCheck(message, user) && !isOwnerDM(dm, user) && !isGlobalOwner(user)) {
      throw HTTPError(FORBIDDEN, errInsufficentPerms());
    }
  }
  return { message, channel, dm };
}
