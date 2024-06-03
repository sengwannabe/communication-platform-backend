import { findSessionV2, BAD_REQUEST, FORBIDDEN, isMember, findChannel, getTime, findUser } from './helper';
import { getData, setData, StandupDetail, User, Channel, getTemp, setTemp } from './dataStore';
import { invalidIdStr, errTooLong } from './errorMessages';
import { messageSendV2 } from './message';
import { usersStatsMessagesExist, userStatsMessagesSent } from './users';
import HTTPError from 'http-errors';

/**
 * For a given channel, starts a standup period lasting length seconds.
 * @param token Unique session for user
 * @param channelId Unique id for a channel
 * @param length lasting time of the standup window
 */
export function standupStartV1(token: string, channelId: number, length: number) : { timeFinish : number } {
  const dataStore = getData();
  const session = findSessionV2(token);
  const timeFinish = (getTime() + 1000 * length) / 1000;
  const channel = findChannel(dataStore, channelId);
  const user = findUser(dataStore, session.authUserId);

  InputValidation(token, channel, user);

  // Check for active standup
  if (channel.standup.isActive) {
    throw HTTPError(BAD_REQUEST, 'an active standup is currently running in the channel');
  }

  // length is negative
  if (length < 0) {
    throw HTTPError(BAD_REQUEST, 'length is a negative integer');
  }
  channel.standup.isActive = true;
  channel.standup.message = [];
  channel.standup.timeFinish = timeFinish;

  const timeOutId = setTimeout(() => finishStandup(token, channel.channelId), length * 1000);
  const temp = getTemp();
  temp.push(timeOutId);
  setTemp(temp);
  // clearTimeout(timeOutId);
  setData(dataStore);

  return {
    timeFinish: timeFinish,
  };
}

function finishStandup(token: string, channelId: number) {
  const data = getData();
  const channel = findChannel(data, channelId);
  if (channel !== undefined) {
    const message1 = channel.standup.message.join('\n');
    messageSendV2(token, channelId, message1);
    userStatsMessagesSent(token);
    usersStatsMessagesExist(token);

    // Reset for new standup
    channel.standup.isActive = false;
    channel.standup.message = [];
    channel.standup.timeFinish = null;
    setData(data);
  }
}

/**
 * For a given channel, returns whether a standup is active in it, and what time the standup finishes.
 * @param token Unique session for user
 * @param channelId Unique id for a channel
 * @returns whether a standup is active in the channel and its timeFinish
 */
export function standupActiveV1(token: string, channelId: number) : StandupDetail {
  const dataStore = getData();
  const session = findSessionV2(token);
  const user = findUser(dataStore, session.authUserId);
  const channel = findChannel(dataStore, channelId);

  InputValidation(token, channel, user);

  return {
    isActive: channel.standup.isActive,
    timeFinish: channel.standup.timeFinish
  };
}

function InputValidation(token: string, channel: Channel, user: User) {
  if (channel === undefined) {
    throw HTTPError(BAD_REQUEST, invalidIdStr('channel '));
  }
  // Invalid autherised user
  if (!isMember(channel, user)) {
    throw HTTPError(FORBIDDEN, invalidIdStr('authUser '));
  }
}

/**
 * Send a message to get buffered in the standup queue
 * @param token Unique session for user
 * @param channelId Unique id for a channel
 * @param message String to be sent
 */
export function standupSendV1(token: string, channelId: number, message: string) {
  const dataStore = getData();
  const session = findSessionV2(token);

  // Invalid channelId
  const channel = findChannel(dataStore, channelId);
  if (channel === undefined) {
    throw HTTPError(BAD_REQUEST, invalidIdStr('channel '));
  }
  // Invalid autherised user
  const user = findUser(dataStore, session.authUserId);
  if (!isMember(channel, user)) {
    throw HTTPError(FORBIDDEN, invalidIdStr('authUser '));
  }
  // Check for active standup
  if (channel.standup.isActive === false) {
    throw HTTPError(BAD_REQUEST, 'an active standup is not currently running in the channel');
  }
  // Check for length of the message to be less than 1000 characters
  if (message.length > 1000) {
    throw HTTPError(BAD_REQUEST, errTooLong('message', '1000'));
  }
  const bufferedMess = user.handleStr + ': ' + message;
  channel.standup.message.push(bufferedMess);
  return {};
}
