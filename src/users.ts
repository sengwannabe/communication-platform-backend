import { getData, setData, UserDetails, UserStats, WorkplaceStats } from './dataStore';
import { findSessionV2, findUser, findEmail, BAD_REQUEST, getTime, isMember, isMemberDM, getImage, IMG_TEMP_SUFFIX, IMG_SUFFIX, IMG_LOCATION, IMG_SERVER } from './helper';
import { invalidIdStr, invalidNameStr, emailInUseStr, invalidEmailStr } from './errorMessages';
import validator from 'validator';
import HTTPError from 'http-errors';
import Jimp from 'jimp';
import { unlink } from 'fs';
import sizeOf from 'image-size';

/**
 * Functions returns information about all users
 * user ID, email, first name, last name, and handle
 * @param token The token of the current user
 * @returns An array onpm i --savef objects where each object contains type users.
 */
export function usersAllV2(token:string): { users:UserDetails[] } {
  findSessionV2(token);
  const data = getData();
  const userdetails:UserDetails[] = [];
  for (const user of data.users) {
    if (user.email !== '') {
      const userdata = {
        uId: user.uId,
        email: user.email,
        nameFirst: user.nameFirst,
        nameLast: user.nameLast,
        handleStr: user.handleStr,
        profileImgUrl: user.profileImgUrl,
      };
      userdetails.push(userdata);
    }
  }
  const users = userdetails;
  return { users };
}

/**
 * For a valid user, returns information about their
 * user ID, email, first name, last name, and handle
 *
 * @param token The token of the active user
 * @param uId   The uId to search for
 * @returns     An object of the user's details
 */
export function userProfileV3(token: string, uId: number): { user: UserDetails } {
  findSessionV2(token);
  const data = getData();
  const user = findUser(data, uId);
  if (user === undefined) {
    throw HTTPError(BAD_REQUEST, invalidIdStr('u'));
  }

  const userDetails = {
    uId: user.uId,
    email: user.email,
    nameFirst: user.nameFirst,
    nameLast: user.nameLast,
    handleStr: user.handleStr,
    profileImgUrl: user.profileImgUrl,
  };

  return { user: userDetails };
}

/**
 * Updates the authorised user's email address.
 * @param token The token of the current user.
 * @param email The email to change to.
 * @returns {}
 */
export function userProfileSetEmailV2(token: string, email: string) {
  const data = getData();
  const session = findSessionV2(token);

  if (findEmail(data, email) !== undefined) {
    throw HTTPError(BAD_REQUEST, emailInUseStr());
  }

  if (!validator.isEmail(email)) {
    throw HTTPError(BAD_REQUEST, invalidEmailStr());
  }

  const authuser = findUser(data, session.authUserId);
  authuser.email = email;
  setData(data);
  return {};
}

/**
 * Updates the authorised user's handle (i.e. display name).
 * @param token The token of the active user
 * @param handleStr The handlesring to change to
 * @returns {}
 */
export function userProfileSetHandleV2(token: string, handleStr: string) {
  const data = getData();
  const session = findSessionV2(token);
  if (!handleStr.match(/^[0-9a-zA-Z]+$/)) {
    throw HTTPError(BAD_REQUEST, 'handleString contains non alpha-numeric characters');
  }

  if (handleStr.length > 20) {
    throw HTTPError(BAD_REQUEST, 'handleString length is > 20');
  }

  if (handleStr.length < 3) {
    throw HTTPError(BAD_REQUEST, 'handleString length is < 3');
  }

  const user = data.users.find(o => o.handleStr === handleStr);
  if (user !== undefined) {
    throw HTTPError(BAD_REQUEST, 'handleString is already in use');
  }

  const authuser = findUser(data, session.authUserId);
  authuser.handleStr = handleStr;
  setData(data);
  return {};
}

/**
 * Updates the authorised user's first and last name.
 * @param token The token of the active user
 * @param nameFirst First name to change to
 * @param nameLast Last name to change to
 * @returns {}
 */
export function userProfileSetNameV2(token: string, nameFirst: string, nameLast: string) {
  const data = getData();
  const session = findSessionV2(token);

  if (nameFirst.length < 1 || nameFirst.length > 50) {
    throw HTTPError(BAD_REQUEST, invalidNameStr('First'));
  }

  if (nameLast.length < 1 || nameLast.length > 50) {
    throw HTTPError(BAD_REQUEST, invalidNameStr('Last'));
  }

  const authuser = findUser(data, session.authUserId);
  authuser.nameFirst = nameFirst;
  authuser.nameLast = nameLast;
  setData(data);
  return {};
}
/**
 * Fetches the required statistics about this user's use of UNSW Beans.
 * @param token The token of the active user
 * @returns users stats
 */
export function userStatsV1(token: string): UserStats {
  const data = getData();
  const session = findSessionV2(token);
  const user = findUser(data, session.authUserId);

  let totalMessages = 0;
  for (let i = 0; i < data.channels.length; i++) {
    totalMessages = totalMessages + data.channels[i].messages.length;
  }
  const joinedDMs = user.stats.dmsJoined[user.stats.dmsJoined.length - 1].numDmsJoined;
  const joinedChannels = user.stats.channelsJoined[user.stats.channelsJoined.length - 1].numChannelsJoined;
  const myMessages = user.stats.messagesSent[user.stats.messagesSent.length - 1].numMessagesSent;

  user.stats.involvementRate = involvementRate(joinedChannels, joinedDMs, myMessages, data.channels.length, data.dms.length, totalMessages);
  setData(data);
  return user.stats;
}

/**
 * Updates the joinedchannel section of the users stats
 * @param token: The token of the active user
 */
export function userStatsJoinedChannel(token: string) {
  const data = getData();
  const session = findSessionV2(token);
  const time = getTime();
  const user = findUser(data, session.authUserId);

  let joinedChannels = 0;
  for (const channel of data.channels) {
    if (isMember(channel, user)) {
      joinedChannels++;
    }
  }
  const channelsJoined = {
    numChannelsJoined: joinedChannels,
    timeStamp: time,
  };
  user.stats.channelsJoined.push(channelsJoined);
  setData(data);
  userStatsV1(token);
}

/**
 * Updates the JoinedDms section of the users Stats
 * @param token The token of the active user
 */
export function userStatsJoinedDMS(token:string) {
  const data = getData();
  const session = findSessionV2(token);
  const time = getTime();
  const user = findUser(data, session.authUserId);

  let joinedDMs = 0;
  for (const dms of data.dms) {
    if (isMemberDM(dms, user)) {
      joinedDMs++;
    }
  }
  const dmsJoined = {
    numDmsJoined: joinedDMs,
    timeStamp: time,
  };
  user.stats.dmsJoined.push(dmsJoined);
  setData(data);
  userStatsV1(token);
}
/**
 * Updates the Messages Sent section of the users stats
 * @param token The token of the active user
 */
export function userStatsMessagesSent(token: string) {
  const data = getData();
  const session = findSessionV2(token);
  const time = getTime();
  const user = findUser(data, session.authUserId);

  let myMessages = user.stats.messagesSent[user.stats.messagesSent.length - 1].numMessagesSent;
  myMessages++;
  const messageSent = {
    numMessagesSent: myMessages,
    timeStamp: time,
  };
  user.stats.messagesSent.push(messageSent);
  setData(data);
  userStatsV1(token);
}

/**
 * Function that calculates a users involvement rate
 * @param joinedChannel Number of channels joined
 * @param joinedDMs Numer of dms joined
 * @param myMessages Number of messages sent
 * @param channelsLength Total number of channels
 * @param dmsLength Total number of dms
 * @param totalMessages Total number of messages
 * @returns involvement Rate
 */
function involvementRate(joinedChannel: number, joinedDMs: number, myMessages: number,
  channelsLength: number, dmsLength: number, totalMessages: number): number {
  const involvementRateNum = joinedChannel + joinedDMs + myMessages;
  const involvementRateDen = channelsLength + dmsLength + totalMessages;
  if (involvementRateDen === 0 || involvementRateNum === 0) {
    return 0;
  } else {
    return (involvementRateNum / involvementRateDen);
  }
}

/**
 * Fuction that initialises empty stats
 * @param token token of the active User
 */
export function initialStats(token: string) {
  const data = getData();
  const session = findSessionV2(token);
  const time = getTime();
  const user = findUser(data, session.authUserId);
  const channelsJoined = {
    numChannelsJoined: 0,
    timeStamp: time,
  };
  const dmsJoined = {
    numDmsJoined: 0,
    timeStamp: time,
  };
  const messageSent = {
    numMessagesSent: 0,
    timeStamp: time,
  };
  user.stats.channelsJoined.push(channelsJoined);
  user.stats.dmsJoined.push(dmsJoined);
  user.stats.messagesSent.push(messageSent);
  setData(data);
}

/**
 * Fetches the required statistics about the workspace's use of UNSW Beans.
 * @param token token of the active user
 * @returns workspace stats
 */
export function usersStatsV1(token: string): WorkplaceStats {
  const data = getData();
  findSessionV2(token);

  let joinedDMorChannel = 0;
  for (const user of data.users) {
    const index = user.stats.channelsJoined.length - 1;
    const index2 = user.stats.dmsJoined.length - 1;
    if (index >= 0 || index2 >= 0) {
      if (user.stats.channelsJoined[index].numChannelsJoined >= 1 ||
        user.stats.dmsJoined[index2].numDmsJoined >= 1) {
        joinedDMorChannel++;
      }
    }
  }
  data.stats.utilizationRate = joinedDMorChannel / data.users.length;
  setData(data);
  return data.stats;
}

/**
 * Updates the Channels Exist section of the workplace stats
 * @param token token of the current
 */
export function usersStatsChannelsExist(token: string) {
  const data = getData();
  findSessionV2(token);
  const time = getTime();
  const channelsExistObj = {
    numChannelsExist: data.channels.length,
    timeStamp: time,
  };
  data.stats.channelsExist.push(channelsExistObj);
  setData(data);
  usersStatsV1(token);
}

/**
 * Updates the Dms exist sextion of the workplace stats
 * @param token token of the current user
 */
export function usersStatsDmsExist(token: string) {
  const data = getData();
  findSessionV2(token);
  const time = getTime();
  const dmsExistObj = {
    numDmsExist: data.dms.length,
    timeStamp: time,
  };
  data.stats.dmsExist.push(dmsExistObj);
  setData(data);
  usersStatsV1(token);
}

/**
 * Updates the Messages Exists section of the workplace stats
 * @param token token of the current user.
 */
export function usersStatsMessagesExist(token: string) {
  const data = getData();
  findSessionV2(token);
  const time = getTime();
  let totalMessages = 0;
  for (let i = 0; i < data.channels.length; i++) {
    totalMessages = totalMessages + data.channels[i].messages.length;
  }
  for (let i = 0; i < data.dms.length; i++) {
    totalMessages = totalMessages + data.dms[i].messages.length;
  }
  const messagesExist = {
    numMessagesExist: totalMessages,
    timeStamp: time,
  };
  data.stats.messagesExist.push(messagesExist);
  setData(data);
  usersStatsV1(token);
}

/**
 * Uploads a photo to the datastore and sets it as the user profile
 *
 * @param ImgUrl image url to get
 * @param xStart x position to start crop
 * @param yStart y position to start crop
 * @param xEnd   x position to end crop
 * @param yEnd   y position to end crop
 * @param token  token of the authorised user
 * @returns      Nothing
 */
export function profileUploadPhotoV1(imgUrl: string, xStart: number, yStart: number, xEnd: number, yEnd: number, token: string) {
  const data = getData();
  const session = findSessionV2(token);
  const authuser = findUser(data, session.authUserId);

  if (!imgUrl.includes('.jpg')) {
    throw HTTPError(BAD_REQUEST, 'Non JPG file');
  }

  const filename = IMG_LOCATION + String(authuser.uId);

  getImage(imgUrl, filename + IMG_TEMP_SUFFIX);
  const dimensions = sizeOf(filename + IMG_TEMP_SUFFIX);
  const message = constrainDimensions(xStart, yStart, xEnd, yEnd, dimensions);
  if (message !== '') removeAndThrow(filename + IMG_TEMP_SUFFIX, message);

  cropImage(filename, xStart, yStart, xEnd, yEnd);
  authuser.profileImgUrl = IMG_SERVER + filename + IMG_SUFFIX;
  setData(data);
  return {};
}

function constrainDimensions(
  xStart: number, yStart: number,
  xEnd: number, yEnd: number,
  dimensions: { width: number, height: number }): string {
  if (xStart < 0 || xStart > dimensions.width) return 'xStart out of bounds';
  if (yStart < 0 || yStart > dimensions.height) return 'yStart out of bounds';
  if (xEnd < 0 || xEnd > dimensions.width) return 'xEnd out of bounds';
  if (yEnd < 0 || yEnd > dimensions.height) return 'yEnd out of bounds';
  if (xEnd <= xStart || yEnd <= yStart) return 'End is less than start';
  return '';
}

async function cropImage(path: string, xStart: number, yStart: number, xEnd: number, yEnd: number) {
  const image = await Jimp.read(path + IMG_TEMP_SUFFIX);
  image.crop(xStart, yStart, xEnd - xStart, yEnd - yStart);
  image.write(path + IMG_SUFFIX);
  unlink(path + IMG_TEMP_SUFFIX, (err) => {
    if (err) throw err;
  });
}

function removeAndThrow(filename: string, message: string) {
  unlink(filename, (err) => {
    if (err) throw err;
  });
  throw HTTPError(BAD_REQUEST, message);
}
