import { getData, DataStore, User, UserDetails, Channel, DM, Session, Message, ReactsDetails } from './dataStore';
import { invalidTokenStr } from './errorMessages';
import { createHmac } from 'crypto';
import generateUniqueId from 'generate-unique-id';
import HTTPError from 'http-errors';
import request from 'sync-request';
import fs from 'fs';
import path from 'path';

export const BAD_REQUEST = 400;
export const FORBIDDEN = 403;

export const IMG_SERVER = 'averyuninterestingwebsite.alwaysdata.net/';
export const IMG_TEMP_SUFFIX = '.temp.jpg';
export const IMG_SUFFIX = '.jpg';
export const IMG_LOCATION = 'static/profile/';
export const DEFAULT_PROFILE_URL = IMG_SERVER + 'static/profile.jpg';

/**
 * Find a session given the token, and return the session object, if it exists.
 * If not, it will return 'undefined'.
 *
 * @param token The token to search for.
 * @returns     A session object, assuming no error.
 */
export function findSessionV2(token: string): Session {
  const data = getData();
  token = tokenHasher(token);
  const session = data.sessions.find(o => o.token === token);
  if (session === undefined) throw HTTPError(FORBIDDEN, invalidTokenStr());
  return session;
}

/**
 * Find a user given their userId and return the user object, if it exists.
 * If not, it will return 'undefined'.
 *
 * @param data The data pulled from dataStore.
 * @param uId  The user id to search for.
 * @returns    A user object, assuming no error.
 */

export function findUser(data: DataStore, uId: number): (User | undefined) {
  return data.users.find(o => o.uId === uId);
}

/**
 * Find a channel given their channelId, and return the channel object, if it exists.
 * If not, it will return 'undefined'.
 *
 * @param data      The data pulled from dataStore.
 * @param channelId The channel id to search for.
 * @returns         A user object, assuming no error.
 */

export function findChannel(data: DataStore, channelId: number): (Channel | undefined) {
  return data.channels.find(o => o.channelId === channelId);
}
/**
 * Find a DM given their dmId, and return the dm object, if it exists.
 * If not, it will return 'undefined'.
 *
 * @param data  The data pulled from dataStore.
 * @param dmId  The dm id to search for.
 * @returns     A user object, assuming no error.
 */
export function findDM(data: DataStore, dmId: number): (DM | undefined) {
  return data.dms.find(o => o.dmId === dmId);
}

/**
 * Find a user given their email, and return the user object, if it exists.
 * If not, it will return 'undefined'.
 *
 * @param data  The data pulled from dataStore.
 * @param email The email to search for.
 * @returns     A user object, assuming no error.
 */
export function findEmail(data: DataStore, email: string): (User | undefined) {
  return data.users.find(o => o.email === email);
}

/**
 * Find a message given the messageId and the user calling the function.
 * The function will only search through channels and DMs the user is a member of.
 * Returns the message object if it exists, along with the channel/DM object that it originated from.
 * If not, it will return 'undefined'.
 *
 * @param data      The data pulled from dataStore.
 * @param user      The user calling the function.
 * @param messageId The messageId to search for.
 * @returns         An object containing message and channel or DM.
 */
export function findMessage(data: DataStore, user: User, messageId: number): ({ message: Message, channel?: Channel, dm?: DM } | undefined) {
  for (const channel of data.channels) {
    if (!isMember(channel, user)) continue;
    const message = channel.messages.find(o => o.messageId === messageId);
    if (message !== undefined) return { message, channel };
  }
  for (const dm of data.dms) {
    if (!isMemberDM(dm, user)) continue;
    const message = dm.messages.find(o => o.messageId === messageId);
    if (message !== undefined) return { message, dm };
  }
  return { message: undefined };
}

/**
 * Takes a message and returns a copy of the reacts array, giving details
 * on the reacts.
 *
 * @param authUserId The user calling the function
 * @param message    The message object
 * @returns          An object containing all reacts and their details
 */
export function getReactStatus(authUserId: number, message: Message): ReactsDetails[] {
  const reactsDetails: ReactsDetails[] = [];
  for (const reacts of message.reacts) {
    reactsDetails.push({
      reactId: reacts.reactId,
      uIds: reacts.uIds,
      isThisUserReacted: reacts.uIds.includes(authUserId),
    });
  }
  return reactsDetails;
}

/**
 * Function to generate a unique id
 *
 * @returns A generated id
 */
export function IdCreate(): number {
  let userId = generateUniqueId({
    length: 15,
    useLetters: false
  });
  userId = parseInt(userId);
  return userId;
}

/**
 * Gets the current time as a unix timestamp.
 *
 * @returns The current time
 */
export function getTime(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * Check whether a user is a member of a channel,
 * returning true or false depending on the result.
 *
 * @param channel The channel object to search in.
 * @param user    The user to search for.
 * @returns       The boolean result.
 */
export function isMember(channel: Channel, user: User): boolean {
  return channel.allMembers.includes(user.uId);
}
/**
 * Check whether a user is a member of a DM,
 * returning true or false depending on the result.
 *
 * @param dm   The channel object to search in.
 * @param user The user to search for.
 * @returns    The boolean result.
 */
export function isMemberDM(dm: DM, user: User): boolean {
  return dm.allMembers.includes(user.uId);
}

/**
 * Check whether a user is an owner of a channel,
 * returning true or false depending on the result.
 *
 * @param channel The channel object to search in.
 * @param user    The user to search for.
 * @returns       The boolean result.
 */
export function isOwner(channel: Channel, user: User): boolean {
  return channel.ownerMembers.includes(user.uId);
}

/**
 * Check whether a user is an owner of a dm,
 * returning true or false depending on the result.
 *
 * @param dm      The dm object to search in.
 * @param user    The user to search for.
 * @returns       The boolean result.
 */
export function isOwnerDM(dm: DM, user: User): boolean {
  return (dm.ownerId === user.uId);
}

/**
 * Check whether a user is a global owner,
 * returning true or false depending on the result.
 *
 * @param user The user to check.
 * @returns    The boolean result.
 */
export function isGlobalOwner(user: User): boolean {
  return user.permissionId === 1;
}

/**
 * Hashes a given password for dataStore,
 *
 * @param password The password to be hashed.
 * @returns        The hashed password.
 */
export function passwordHasher(password: string): string {
  return createHmac('sha256', '22pasUNSWord').update(password).digest('hex');
}

/**
 * Hashes a given token for dataStore,
 *
 * @param token The token to be hashed.
 * @returns        The hashed token.
 */
export function tokenHasher(token: string): string {
  return createHmac('sha256', '22TOKEN22').update(token).digest('hex');
}

/**
 * Function takes in an array of uIds to find the details of
 *
 * @param dataStore The datastore
 * @param group     The array containing uIds of the specific group, e.g. dm.allMembers or channel.ownerMembers
 * @returns         An array of type UserDetails of the members in the group
 */
export function getMembersDetails(dataStore: DataStore, group: Array<number>): UserDetails[] {
  const members = [];
  for (const groupee of group) {
    const user = findUser(dataStore, groupee);
    members.push(
      {
        uId: user.uId,
        handleStr: user.handleStr,
        email: user.email,
        nameFirst: user.nameFirst,
        nameLast: user.nameLast,
        profileImgUrl: user.profileImgUrl,
      }
    );
  }
  return members;
}

/**
 * Creates token and adds it to dataStore,
 *
 * @param authUserId A user's uId.
 * @returns          The hashed token.
 */
export function createToken(authUserId: number, dataStore: DataStore): string {
  const token = IdCreate() + 't';
  dataStore.sessions.push({
    token: tokenHasher(token),
    authUserId: authUserId
  });
  return token;
}

/**
 * Helper function clear all of someones tokens.
 *
 * @param uId       Id of person to removed from Beans
 * @returns         Nothing
 */
export function clearUserTokens(uId: number): Session[] {
  const dataStore = getData();
  const sessions = dataStore.sessions;
  return sessions.filter(x => x.authUserId !== uId);
}

/**
 * Helper function that downloads an image and throws an error if it cant
 * @param ImgUrl url of the image to download
 * @param name name of the user downloading the image to save the filename under
 */
export function getImage(ImgUrl: string, name: string) {
  const res = request(
    'GET',
    ImgUrl
  );
  let body;
  try {
    body = res.getBody();
  } catch {
    throw HTTPError(400, 'Error obtaining image');
  }
  const outputLoc = name;
  fs.writeFileSync(outputLoc, body, { flag: 'w' });
}

/**
 * Given a directory, clears all images from it.
 *
 * @param directory The directory to remove all images from
 */
export function clearImages(directory: string) {
  fs.readdir(directory, (err, files) => {
    if (err) console.log(err);
    for (const file of files) {
      if (file.includes('.jpg')) {
        fs.unlink(path.join(directory, file), (err) => {
          if (err) console.log(err);
        });
      }
    }
  });
}
