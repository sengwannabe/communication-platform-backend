import {
  getData, setData,
  User, Notification, Channel, DM,
} from './dataStore';
import { findSessionV2, findUser, isMember, isMemberDM } from './helper';

export function notificationsGetV1(token: string) {
  const session = findSessionV2(token);
  const data = getData();
  const user = findUser(data, session.authUserId);
  return { notifications: user.notifications };
}

/// Push Functions

/**
 * Pushes a tagged notification to users within a given channel or DM,
 * if they have been tagged.
 *
 * @param authUser The authUser that is tagging
 * @param message  The message being sent
 * @param chatType Whether the chat is a channel or DM
 * @param chatId   The channelId or dmId
 * @param chat     The channel or DM the message is sent in
 * @returns        Nothing
 */
export function notificationPushTagged(authUser: User, message: string, chatType: 'channel' | 'dm', chatId: number, chat: Channel | DM) {
  const taggedUsers = notificationFindTagged(message, chat);
  const channelId = chatType === 'channel' ? chatId : -1;
  const dmId = chatType === 'dm' ? chatId : -1;
  for (const user of taggedUsers) {
    const notificationMessage = authUser.handleStr + ' tagged you in ' + chat.name + ': ' + message.slice(0, 20);
    const notification = { channelId, dmId, notificationMessage };
    notificationPush(user, notification);
  }
}

/**
 * Pushes a reacted notification to a user.
 *
 * @param authUser The authUser that is reacting
 * @param user     The user the message belongs to
 * @param channel  The channel if it exists: undefined if it does not.
 * @param dm       The dm if it exists: -1 if it does not.
 * @returns        Nothing
 */
export function notificationPushReacted(authUser: User, user: User, channel: Channel, dm: DM) {
  let chat: Channel | DM;
  if (channel !== undefined) {
    if (!isMember(channel, user)) return;
    chat = channel;
  } else {
    if (!isMemberDM(dm, user)) return;
    chat = dm;
  }
  const channelId = channel !== undefined ? channel.channelId : -1;
  const dmId = dm !== undefined ? dm.dmId : -1;

  const notificationMessage = authUser.handleStr + ' reacted to your message in ' + chat.name;
  const notification = { channelId, dmId, notificationMessage };
  notificationPush(user, notification);
}

/**
 * Pushes an invite notification to the target user.
 *
 * @param authUser  The authUser that is inviting
 * @param user      The user being invited
 * @param channelId The channelId if it exists: -1 if it does not.
 * @param dmId      The dmId if it exists: -1 if it does not.
 * @param chatName  The name of the channel or DM
 * @returns         Nothing
 */
export function notificationPushInvite(authUser: User, user: User, channelId: number, dmId: number, chatName: string) {
  const notificationMessage = authUser.handleStr + ' added you to ' + chatName;
  const notification = { channelId, dmId, notificationMessage };
  notificationPush(user, notification);
}

/// Helper functions

/**
 * Pushes a notification to a user.
 * If the user has over 20 notifications, the oldest one is removed.
 *
 * @param user         The user to get the notification
 * @param notification The notification object
 * @returns            Nothing
 */
function notificationPush(user: User, notification: Notification) {
  user.notifications.unshift(notification);
  if (user.notifications.length > 20) user.notifications.splice(20);
  setData(getData());
}

/**
 * Function to convert a channel or DM into the required types to feed into notification
 * @param channel Channel object: leave undefined if no channel
 * @param dm      DM object: leave undefined if no DM
 * @returns       An object containing relevant fields for notification functions
 */
export function constructChat(channel: Channel, dm: DM):
{ chatType: 'channel' | 'dm', chatId: number, chat: Channel | DM } {
  if (channel !== undefined) {
    return { chatType: 'channel', chatId: channel.channelId, chat: channel };
  }
  return { chatType: 'dm', chatId: dm.dmId, chat: dm };
}

/**
 * Given a message and a channel or DM, returns an array of users that were tagged
 *
 * @param message The message being sent
 * @param chat    The channel or DM the message is sent in
 * @returns       An array of users in the chat that were tagged
 */
function notificationFindTagged(message: string, chat: Channel | DM): User[] {
  const data = getData();
  const words = message.split(/[^A-Za-z0-9@]/).filter(word => word.includes('@'));
  let tags: string[] = [];
  for (const word of words) {
    tags = tags.concat(word.split(/(?=@)/)).filter(word => word !== '@' && word.includes('@'));
  }
  const taggedUsers: User[] = [];
  for (const uId of chat.allMembers) {
    const user = findUser(data, uId);
    const userTag = '@' + user.handleStr;
    if (tags.includes(userTag)) taggedUsers.push(user);
  }
  return taggedUsers;
}
