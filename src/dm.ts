import { findSessionV2, findUser, findDM, isMemberDM, isOwnerDM, IdCreate, BAD_REQUEST, FORBIDDEN, getMembersDetails, getReactStatus } from './helper';
import { getData, setData, DMDetails, Message, MessageDetails, UserDetails, User } from './dataStore';
import { notificationPushInvite } from './notifications';
import { invalidIdStr, notMember } from './errorMessages';
import HTTPError from 'http-errors';
import { userStatsJoinedDMS, usersStatsMessagesExist, usersStatsDmsExist } from './users';

interface DMMessages {
  messages: MessageDetails[],
  start: number,
  end: number
}

/**
 *
 * @param token Unique session for user
 * @param uIds contains the user(s) that this DM is directed to, and will not include the creator.
 * @returns dmId - unique id for the dm
 */
export function dmCreateV2(token: string, uIds: number[]) : { dmId: number } {
  const dataStore = getData();
  const session = findSessionV2(token);

  // Invalid uIds
  const users: User[] = [];
  const nameArray = [];
  const message: Message[] = [];
  const owner = findUser(dataStore, session.authUserId);
  const allMembers = [owner.uId];
  nameArray.push(owner.handleStr);
  for (const uId of uIds) {
    const user = findUser(dataStore, uId);
    if (user === undefined) {
      throw HTTPError(BAD_REQUEST, invalidIdStr('user '));
    }
    if (users.includes(user)) {
      throw HTTPError(BAD_REQUEST, invalidIdStr('duplicated user '));
    }
    users.push(user);
    allMembers.push(user.uId);
    nameArray.push(user.handleStr);
  }
  // generate unique id for this dm
  const dmId = IdCreate();
  // sorting array name alphabetically and join them to a single string separating by comma space
  nameArray.sort();
  const dmName = nameArray.join(', ');
  // Update dms in dataStore
  dataStore.dms.push({
    dmId: dmId,
    name: dmName,
    ownerId: session.authUserId,
    allMembers: allMembers,
    messages: message,
  });
  for (const user of users) {
    notificationPushInvite(owner, user, -1, dmId, dmName);
  }
  setData(dataStore);
  userStatsJoinedDMS(token);
  usersStatsDmsExist(token);
  return {
    dmId: dmId,
  };
}

/**
 * Remove an existing DM, so all members are no longer in the DM.
 * This can only be done by the original creator of the DM.
 * @param token : Unique session Id for a user
 * @param dmId : Unique Id for a dm
 */
export function dmRemoveV2(token: string, dmId: number) {
  // token is invalid
  const session = findSessionV2(token);
  const dataStore = getData();
  const user = findUser(dataStore, session.authUserId);
  // dmId is not valid
  const dm = findDM(dataStore, dmId);
  if (dm === undefined) {
    throw HTTPError(BAD_REQUEST, invalidIdStr('dm'));
  }
  // dmId is valid, checking if dmId is owner of this dm
  if (!isOwnerDM(dm, user)) {
    throw HTTPError(FORBIDDEN, invalidIdStr('dmId owner'));
  }
  // dmId is valid and the authorised user is no longer in the DM
  if (!isMemberDM(dm, user)) {
    throw HTTPError(FORBIDDEN, invalidIdStr('already left dm'));
  }
  // Remove dm
  const dmIndex = dataStore.dms.findIndex(x => x === dm);
  dataStore.dms.splice(dmIndex, 1);
  setData(dataStore);
  usersStatsMessagesExist(token);
  usersStatsDmsExist(token);
  return {};
}

/**
 * Function takes in user token and dmId, and if valid removes user of inputted token from the dm
 *
 *  @param token user token
 * @param dmId  id of the dm wanted
 * @returns
 */
export function dmLeaveV2(token: string, dmId: number) {
  const dataStore = getData();
  const session = findSessionV2(token);

  // invalid dmId inputted
  const dm = findDM(dataStore, dmId);
  if (dm === undefined) {
    throw HTTPError(BAD_REQUEST, invalidIdStr('dm'));
  }

  // dmId is valid but authUser is not a member
  const user = findUser(dataStore, session.authUserId);
  if (!isMemberDM(dm, user)) {
    throw HTTPError(FORBIDDEN, notMember('dm'));
  }

  const memberIndex = dm.allMembers.findIndex(x => x === user.uId);
  dm.allMembers.splice(memberIndex, 1);
  setData(dataStore);
  userStatsJoinedDMS(token);
  return {};
}

/**
 * Returns the list of DMs that the user is a member of.
 * @param token Unique session for a user
 * @returns an object contains list of DMs that the user is a member of
 */
export function dmListV2(token: string): { dms: DMDetails[] } {
  const dataStore = getData();
  const session = findSessionV2(token);
  const dmArray: DMDetails[] = [];
  const user = findUser(dataStore, session.authUserId);
  for (const dm of dataStore.dms) {
    if (dm.allMembers.includes(user.uId)) {
      dmArray.push({
        dmId: dm.dmId,
        name: dm.name
      });
    }
  }
  return {
    dms: dmArray,
  };
}

/**
 * Function takes in user token and dmId, and if valid returns dm details
 *
 * @param token user token
 * @param dmId  id of the dm wanted
 * @returns     details of the dm or error
 */
export function dmDetailsV2(token: string, dmId: number): { name: string, members: UserDetails[] } {
  const dataStore = getData();
  const session = findSessionV2(token);

  // invalid dmId inputted
  const dm = findDM(dataStore, dmId);
  if (dm === undefined) {
    throw HTTPError(BAD_REQUEST, invalidIdStr('dm'));
  }

  // dmId is valid but authUser is not a member
  const user = findUser(dataStore, session.authUserId);
  if (!isMemberDM(dm, user)) {
    throw HTTPError(FORBIDDEN, notMember('dm'));
  }

  const dmMembers = getMembersDetails(dataStore, dm.allMembers);

  return {
    name: dm.name,
    members: dmMembers
  };
}

/**
 * Function takes in user token and dmId, and if valid returns the messages of the dm
 *
 *  @param token user token
 * @param dmId   id of the dm wanted
 * @param start  index of where the messages are to be returned
 * @returns      array of the dm's messages or error
 */
export function dmMessagesV2(token: string, dmId: number, start: number): DMMessages {
  const dataStore = getData();
  const session = findSessionV2(token);

  // invalid dmId inputted
  const dm = findDM(dataStore, dmId);
  if (dm === undefined) {
    throw HTTPError(BAD_REQUEST, invalidIdStr('dm'));
  }

  // dmId is valid but authUser is not a member
  const user = findUser(dataStore, session.authUserId);
  if (!isMemberDM(dm, user)) {
    throw HTTPError(FORBIDDEN, notMember('dm'));
  }

  // start value is not valid
  if (start > dm.messages.length) {
    throw HTTPError(BAD_REQUEST, 'Start value is greater than the list of DM messages');
  }

  // return value of end
  let end = start + 50;
  if (end >= dm.messages.length) {
    end = -1;
  }

  let messageLength: number;
  end === -1 ? messageLength = dm.messages.length : messageLength = (start + 50);
  const messages = dm.messages.slice(start, messageLength);

  const messagesDetails: MessageDetails[] = [];
  for (const message of messages) {
    messagesDetails.push({
      messageId: message.messageId,
      uId: message.uId,
      message: message.message,
      timeSent: message.timeSent,
      reacts: getReactStatus(session.authUserId, message),
      isPinned: message.isPinned,
    });
  }

  return {
    messages: messagesDetails,
    start: start,
    end: end
  };
}
