import {
  getData, setData,
  UserDetails, MessageDetails
} from './dataStore';
import {
  findSessionV2, findUser, findChannel,
  getMembersDetails, getReactStatus,
  isMember, isOwner,
  BAD_REQUEST, FORBIDDEN,
} from './helper';
import { notificationPushInvite } from './notifications';
import { invalidIdStr, alreadyMember, notMember, errInsufficentPerms } from './errorMessages';
import HTTPError from 'http-errors';
import { userStatsJoinedChannel } from './users';

interface ChannelExtDetails {
  name: string,
  isPublic: boolean,
  ownerMembers: UserDetails[],
  allMembers: UserDetails[],
}

interface ChannelMessages {
  messages: MessageDetails[],
  start: number,
  end: number,
}

/**
 * Function takes in token and channelId to find details of, and returns channel object
 *
 * @param token      authUsers token
 * @param channelId  Unique id for channel
 * @returns          Object containing details of the channel
 */
export function channelDetailsV3(token: string, channelId: number): ChannelExtDetails {
  const dataStore = getData();
  const session = findSessionV2(token);
  const user = findUser(dataStore, session.authUserId);

  // channelId does not refer to a valid channel
  const channel = findChannel(dataStore, channelId);
  if (channel === undefined) {
    throw HTTPError(BAD_REQUEST, invalidIdStr('channel'));
  }
  // channelId is valid but authUserId is not a member of the channel
  if (!isMember(channel, user)) {
    throw HTTPError(FORBIDDEN, notMember('channel'));
  }

  const channelMembers = getMembersDetails(dataStore, channel.allMembers);
  const channelOwnerMembers = getMembersDetails(dataStore, channel.ownerMembers);

  return {
    name: channel.name,
    isPublic: channel.isPublic,
    ownerMembers: channelOwnerMembers,
    allMembers: channelMembers
  };
}

/**
 * Given a channel with ID channelId that the authorised user is a member of,
 * returns up to 50 messages between index start and "start + 50".
 * @param token Token of the user
 * @param channelId Id of the channel
 * @param start From which index to retrieve messages from
 * @returns Up to 50 messages
 */
export function channelMessagesV3(token: string, channelId: number, start: number): ChannelMessages {
  const session = findSessionV2(token);
  const data = getData();
  const user = findUser(data, session.authUserId);

  // Checks if channelId refers to a valid channel
  const channel = findChannel(data, channelId);
  if (channel === undefined) {
    throw HTTPError(BAD_REQUEST, invalidIdStr('channel'));
  }

  // Checks if user is member of the channel
  if (!isMember(channel, user)) {
    throw HTTPError(FORBIDDEN, notMember('channel'));
  }

  // Checks if given start is greater than total messages in the channel
  if (start > channel.messages.length) {
    throw HTTPError(BAD_REQUEST, 'start is greater than the total number of messages in the channel');
  }

  // returns up to 50 messages between index "start" and "start + 50"
  let end = start + 50;
  if (end >= channel.messages.length) {
    end = -1;
  }

  let messageLength: number;
  end === -1 ? messageLength = channel.messages.length : messageLength = (start + 50);
  const messages = channel.messages.slice(start, messageLength);

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

/**
 * Invites a user with ID uId to join a channel with ID channelId.
 * Once invited, the user is added to the channel immediately.
 * In both public and private channels, all members are able to invite users.
 *
 * @param token      Token of the authorised user
 * @param channelId  Id of the channel to invite to
 * @param uId        Id of the user to invite
 * @returns          Nothing
 */
export function channelInviteV3(token: string, channelId: number, uId: number) {
  const session = findSessionV2(token);

  const data = getData();
  const authUser = findUser(data, session.authUserId);
  const channel = findChannel(data, channelId);
  if (channel === undefined) throw HTTPError(BAD_REQUEST, invalidIdStr('channel'));

  if (!isMember(channel, authUser)) throw HTTPError(FORBIDDEN, notMember('channel'));
  const user = findUser(data, uId);
  if (user === undefined) throw HTTPError(BAD_REQUEST, invalidIdStr('u'));
  if (isMember(channel, user)) throw HTTPError(BAD_REQUEST, alreadyMember('channel'));

  channel.allMembers.push(uId);
  notificationPushInvite(authUser, user, channelId, -1, channel.name);
  return {};
}

/**
 * Function takes in an token and channelId, and adds the valid authUserId to the channel, return nothing
 *
 * @param token      authUsers token
 * @param channelId  Unique id for channel
 * @returns          Nothing
 */
export function channelJoinV3(token: string, channelId: number) {
  const dataStore = getData();
  const session = findSessionV2(token);
  const user = findUser(dataStore, session.authUserId);

  // channelId does not refer to a valid channel
  const channel = findChannel(dataStore, channelId);
  if (channel === undefined) {
    throw HTTPError(BAD_REQUEST, invalidIdStr('channel'));
  }

  // channelId is valid but authUserId is already a member of the channel
  if (isMember(channel, user)) {
    throw HTTPError(BAD_REQUEST, alreadyMember('channel'));
  }

  // channelId refers to a private channel, when authUserId is not a member and not a global owner
  if (!channel.isPublic && !isMember(channel, user) && user.permissionId === 2) {
    throw HTTPError(FORBIDDEN, 'the channel is private and authUser is not a member');
  }
  channel.allMembers.push(session.authUserId);
  userStatsJoinedChannel(token);
  return {};
}

/**
 * Function for channelLeaveV2.
 *
 * @param token      Token of the user
 * @param channelId  Id of the channel
 * @returns          empty object or error message
 */
export function channelLeaveV2(token: string, channelId: number) {
  const session = findSessionV2(token);
  const dataStore = getData();
  const user = findUser(dataStore, session.authUserId);
  const channel = findChannel(dataStore, channelId);

  // If the channel does not exist
  if (channel === undefined) {
    throw HTTPError(BAD_REQUEST, invalidIdStr('channel'));
  }
  // If they're not a member in the channel
  if (!isMember(channel, user)) {
    throw HTTPError(FORBIDDEN, notMember('channel'));
  }

  let index = channel.allMembers.findIndex(x => x === user.uId);
  channel.allMembers.splice(index, 1);

  if (isOwner(channel, user)) {
    index = channel.ownerMembers.findIndex(x => x === user.uId);
    channel.ownerMembers.splice(index, 1);
  }
  userStatsJoinedChannel(token);
  setData(dataStore);
  return {};
}

/**
 * Function for channelAddOwnerV2.
 *
 * @param token      Token of the user
 * @param channelId  Id of the channel
 * @param uId        Id of person to become owner
 * @returns          empty object or error message
 */
export function channelAddOwnerV2(token: string, channelId: number, uId: number) {
  const session = findSessionV2(token);
  const dataStore = getData();
  const channel = findChannel(dataStore, channelId);

  // If the channel does not exist
  if (channel === undefined) {
    throw HTTPError(BAD_REQUEST, invalidIdStr('channel'));
  }

  const userAdded = findUser(dataStore, uId);
  const owner = findUser(dataStore, session.authUserId);

  // If either person does not exist
  if (userAdded === undefined) {
    throw HTTPError(BAD_REQUEST, invalidIdStr('uId'));
  }

  // If either the person adding someone or person to be added is NOT a member
  if (!isMember(channel, userAdded)) {
    throw HTTPError(BAD_REQUEST, invalidIdStr('uId'));
  }
  if (!isMember(channel, owner)) {
    throw HTTPError(FORBIDDEN, invalidIdStr('authUserId'));
  }

  // If the person to be added is already a owner
  if (isOwner(channel, userAdded)) {
    throw HTTPError(BAD_REQUEST, 'user is already an owner');
  }

  // If person adding someone is a owner in the channel OR they're a global owner
  if (isOwner(channel, owner) || owner.permissionId === 1) {
    channel.ownerMembers.push(userAdded.uId);
  } else {
    throw HTTPError(FORBIDDEN, errInsufficentPerms());
  }
  setData(dataStore);
  return {};
}

/**
 * Function for channelRemoveOwnerV2.
 *
 * @param token      Token of the user
 * @param channelId  Id of the channel
 * @param uId        Id of person to removed from owner
 * @returns          empty object or error message
 */
export function channelRemoveOwnerV2(token: string, channelId: number, uId: number) {
  const session = findSessionV2(token);
  const dataStore = getData();
  const channel = findChannel(dataStore, channelId);

  // If the channel does not exist
  if (channel === undefined) {
    throw HTTPError(BAD_REQUEST, invalidIdStr('channel'));
  }

  const userRemoved = findUser(dataStore, uId);
  const owner = findUser(dataStore, session.authUserId);

  // If person being removed does not exist
  if (userRemoved === undefined) {
    throw HTTPError(BAD_REQUEST, invalidIdStr('uId'));
  }
  // If person to be removed is NOT a owner
  if (!isOwner(channel, userRemoved)) {
    throw HTTPError(BAD_REQUEST, 'user is not an owner');
  }

  // If the person to be removed is the last owner
  if (channel.ownerMembers.length === 1) {
    throw HTTPError(BAD_REQUEST, 'user is last owner, cannot remove');
  }

  // If person removing someone is a owner in the channel OR they're a global owner
  if (isOwner(channel, owner) || (owner.permissionId === 1 && isMember(channel, owner))) {
    const index = channel.ownerMembers.findIndex(x => x === uId);
    channel.ownerMembers.splice(index, 1);
  } else {
    throw HTTPError(FORBIDDEN, errInsufficentPerms());
  }
  setData(dataStore);
  return {};
}
