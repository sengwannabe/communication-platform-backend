import { getData, setData, UserStats } from './dataStore';
import {
  findSessionV2, findEmail, IdCreate, clearUserTokens,
  passwordHasher, createToken, BAD_REQUEST, findUser, DEFAULT_PROFILE_URL
} from './helper';
import { invalidEmailStr, invalidNameStr, invalidPasswordStr, emailInUseStr } from './errorMessages';
import validator from 'validator';
import HTTPError from 'http-errors';
import nodemailer from 'nodemailer';
import { usersStatsV1, initialStats } from './users';

/**
 * Function to check if account can be made
 *
 * @param email     email used to register for login
 * @param password  password used to register for login
 * @param nameFirst First name of user
 * @param nameLast  Last name of user
 * @returns         Error string if error
 */
function registerErrorCheckV2(email: string, password: string, nameFirst: string, nameLast: string): void {
  if (nameFirst.length <= 0 || nameFirst.length > 50) {
    throw HTTPError(BAD_REQUEST, invalidNameStr('first'));
  }
  if (nameLast.length <= 0 || nameLast.length > 50) {
    throw HTTPError(BAD_REQUEST, invalidNameStr('last'));
  }
  if (password.length < 6) {
    throw HTTPError(BAD_REQUEST, invalidPasswordStr());
  }
  if (validator.isEmail(email) === false) {
    throw HTTPError(BAD_REQUEST, invalidEmailStr());
  }
  if (findEmail(getData(), email) !== undefined) {
    throw HTTPError(BAD_REQUEST, emailInUseStr());
  }
}

/**
 * Function to form handleStr
 *
 * @param nameFirst First name of user
 * @param nameLast  Last name of user
 * @returns         handleStr of user
 */
function handleStrForm(nameFirst: string, nameLast: string): string {
  nameFirst = nameFirst.replace(/[^a-z0-9]/g, '');
  nameLast = nameLast.replace(/[^a-z0-9]/g, '');
  let handleStr = nameFirst + nameLast;
  handleStr = handleStr.slice(0, 20);
  return handleStr;
}

/**
 * Function to check if name has already exists, concatenates a number if it does
 *
 * @param handleStr Username of user
 * @returns         handleStr of user
 */
function concatHandleStr(handleStr: string): string {
  const data = getData();
  let nameArray = [];
  for (const people of data.users) {
    if ((people.handleStr).startsWith(handleStr)) {
      nameArray.push(people.handleStr);
    }
  }
  nameArray = nameArray.sort();
  let concatenate = -1;
  let newName = handleStr;
  for (const people of nameArray) {
    if (newName === people) {
      concatenate++;
    }
    if (concatenate !== -1) {
      newName = handleStr + concatenate;
    }
  }
  return newName;
}
/**
 * Function to check if account can be made
 *
 * @param nameFirst First name of user
 * @param nameLast  Last name of user
 * @returns         Handlestr
 */
function handleStrCreate(nameFirst: string, nameLast: string): string {
  let handleStr = '';
  const firstName = nameFirst.toLowerCase();
  const lastName = nameLast.toLowerCase();
  handleStr = handleStrForm(firstName, lastName);
  handleStr = concatHandleStr(handleStr);
  return handleStr;
}

interface AuthUserId {
  token: string,
  authUserId: number,
}

/**
 * Function to register a new user
 *
 * @param email     email used to register for login
 * @param password  password used to register for login
 * @param nameFirst First name of user
 * @param nameLast  Last name of user
 * @returns         Id of user
 */
export function authRegisterV3(email: string, password: string, nameFirst: string, nameLast: string): AuthUserId {
  const dataStore = getData();
  registerErrorCheckV2(email, password, nameFirst, nameLast);
  const handleStr = handleStrCreate(nameFirst, nameLast);
  const userId = IdCreate();
  let permissionId = 2;
  if (Object.keys(dataStore.users).length === 0) {
    permissionId = 1;
  }
  const initialstats: UserStats = {
    channelsJoined: [],
    dmsJoined: [],
    messagesSent: [],
    involvementRate: 0
  };
  dataStore.users.push({
    uId: userId,
    handleStr: handleStr,
    email: email,
    nameFirst: nameFirst,
    nameLast: nameLast,
    password: passwordHasher(password),
    permissionId: permissionId,
    stats: initialstats,
    profileImgUrl: DEFAULT_PROFILE_URL,
    notifications: [],
  });
  const token = createToken(userId, dataStore);
  usersStatsV1(token);
  setData(dataStore);
  initialStats(token);
  return {
    token: token,
    authUserId: userId,
  };
}

/**
 *
 * Function returns the authUser's authUserId when logged in
 *
 * @param email    email used for login
 * @param password password used for login
 * @returns        authorised user id
 */
export function authLoginV3(email: string, password: string): AuthUserId {
  const dataStore = getData();
  const user = findEmail(dataStore, email);
  // entered email does not belong to a user or password is wrong
  if (user === undefined) {
    throw HTTPError(BAD_REQUEST, invalidEmailStr());
  } else if (passwordHasher(password) !== user.password) {
    throw HTTPError(BAD_REQUEST, invalidPasswordStr());
  }
  const token = createToken(user.uId, dataStore);
  setData(dataStore);
  return {
    token: token,
    authUserId: user.uId,
  };
}

/**
 * Function to logout a user by invalidating their given token
 *
 * @param token     user's token
 * @returns         Empty object
 */
export function authLogoutV2(token: string) {
  const dataStore = getData();
  const session = findSessionV2(token);
  const sessions = dataStore.sessions;
  const index = sessions.findIndex(x => x === session);
  sessions.splice(index, 1);
  setData(dataStore);
  return {};
}

/**
 * Function for user to request to reset their password
 *
 * @param email     user's email
 * @returns         Empty object
 */
export function authPasswordResetRequestV1(email: string) {
  const dataStore = getData();
  const user = findEmail(dataStore, email);
  // If statement to ensure that request is sent to someone actually registered
  if (user) {
    const code = IdCreate() + 'RESET';
    dataStore.passwordrequests.push({
      uId: user.uId,
      code: code
    });
    const transporter = nodemailer.createTransport({
      host: 'smtp-domaindomaindomain.alwaysdata.net',
      port: 587,
      secure: false,
      auth: {
        user: 'domaindomaindomain@alwaysdata.net',
        pass: 'ZD6h3%%D3RT*n7#u',
      },
    });
    transporter.sendMail({
      from: '"donotreply" <domaindomaindomain@alwaysdata.net>',
      to: email,
      subject: 'Password reset code',
      text: `Here is your reset code ${code}`,
      html: `Here is your reset code: <b> ${code} </b>`,
    });
    dataStore.sessions = clearUserTokens(user.uId);
    setData(dataStore);
  }
  return {};
}

/**
 * Function for user to reset their password
 *
 * @param resetCode     Code from password reset request
 * @param newPassword   New password for password to be set to
 * @returns             Empty object
 */
export function authPasswordResetResetV1(resetCode: string, newPassword: string) {
  const dataStore = getData();
  const passwordRequests = dataStore.passwordrequests;
  // findIndex will return -1 if it doesn't find the given code
  const index = passwordRequests.findIndex(x => x.code === resetCode);
  if (index === -1) {
    throw HTTPError(BAD_REQUEST, 'invalid code');
  }
  if (newPassword.length < 6) {
    throw HTTPError(BAD_REQUEST, invalidPasswordStr());
  }
  const user = findUser(dataStore, passwordRequests[index].uId);
  user.password = passwordHasher(newPassword);
  passwordRequests.splice(index, 1);
  setData(dataStore);
  return {};
}
