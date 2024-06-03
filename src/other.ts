import { getData, setData, defaultData, MessageDetails, getTemp, setTemp } from './dataStore';
import { BAD_REQUEST, clearImages, findSessionV2, findUser, getReactStatus, IMG_LOCATION, isMember, isMemberDM } from './helper';
import HTTPError from 'http-errors';
import { errTooLong, errTooShort } from './errorMessages';

/**
 * Resets the internal data of the application to its initial state.
 *
 * @returns N/A
 */
export function clearV1() {
  setData(defaultData());
  clearImages(IMG_LOCATION);
  clearTimeouts();
  return {};
}

export function clearTimeouts() {
  let temp = getTemp();
  for (const timeout of temp) {
    clearTimeout(timeout);
  }
  temp = [];
  setTemp(temp);
}

/**
 *
 * Function searches and returns messages that contain queryString
 *
 * @param token    authUser active token
 * @param queryStr the string too look for
 * @returns        array of messages that the user is in with searched string
 */
export function searchV1(token: string, queryStr: string): { messages: MessageDetails[] } {
  const dataStore = getData();
  const session = findSessionV2(token);
  const user = findUser(dataStore, session.authUserId);
  const adjustedQuery = queryStr.toLowerCase();

  if (queryStr.length < 1 || queryStr === ' ') {
    throw HTTPError(BAD_REQUEST, errTooShort('queryStr', '1'));
  }

  if (queryStr.length > 1000) {
    throw HTTPError(BAD_REQUEST, errTooLong('queryStr', '1000'));
  }

  const messages: MessageDetails[] = [];
  for (const dm of dataStore.dms.filter(dm => isMemberDM(dm, user))) {
    for (const message of dm.messages) {
      const adjustedMessage = message.message.toLowerCase();
      if (adjustedMessage.includes(adjustedQuery)) {
        messages.push(
          {
            messageId: message.messageId,
            uId: message.uId,
            message: message.message,
            timeSent: message.timeSent,
            reacts: getReactStatus(session.authUserId, message),
            isPinned: message.isPinned
          }
        );
      }
    }
  }
  for (const channel of dataStore.channels.filter(channel => isMember(channel, user))) {
    for (const message of channel.messages) {
      const adjustedMessage = message.message.toLowerCase();
      if (adjustedMessage.includes(adjustedQuery)) {
        messages.push(
          {
            messageId: message.messageId,
            uId: message.uId,
            message: message.message,
            timeSent: message.timeSent,
            reacts: getReactStatus(session.authUserId, message),
            isPinned: message.isPinned
          }
        );
      }
    }
  }

  return {
    messages: messages
  };
}
