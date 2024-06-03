import { getData, setData, User } from './dataStore';
import {
  findSessionV2, BAD_REQUEST, FORBIDDEN, findUser, isMember, isOwner, isMemberDM, clearUserTokens
} from './helper';
import { invalidIdStr, errInsufficentPerms } from './errorMessages';
import HTTPError from 'http-errors';

/**
 * Helper function to remove someone from all channels and change their messages.
 *
 * @param user      Object of person to be removed from Beans
 * @returns         Nothing
 */
function removeFromChannels(user: User): void {
  const dataStore = getData();
  for (const channel of dataStore.channels) {
    if (isMember(channel, user)) {
      const index = channel.allMembers.findIndex(x => x === user.uId);
      channel.allMembers.splice(index, 1);
    }
    if (isOwner(channel, user)) {
      const index = channel.ownerMembers.findIndex(x => x === user.uId);
      channel.ownerMembers.splice(index, 1);
    }
    for (const message of channel.messages) {
      if (message.uId === user.uId) {
        message.message = 'Removed user';
      }
    }
  }
}

/**
 * Helper function to remove someone from all dms and change their messages.
 *
 * @param user      Object of person to be removed from Beans
 * @returns         Nothing
 */
function removeFromAllDms(user: User): void {
  const dataStore = getData();
  for (const dm of dataStore.dms) {
    if (isMemberDM(dm, user)) {
      const index = dm.allMembers.findIndex(x => x === user.uId);
      dm.allMembers.splice(index, 1);
    }
    for (const message of dm.messages) {
      if (message.uId === user.uId) {
        message.message = 'Removed user';
      }
    }
  }
}

/**
 * Function for to check for basic permissions / last global owner.
 *
 * @param user           Id of person to removed from Beans
 * @returns             Empty object
 */
function userPermissionErrorCheck(admin: User, targetUser: User): void {
  const dataStore = getData();
  // If authUserId is not a global owner
  if (admin.permissionId !== 1) {
    throw HTTPError(FORBIDDEN, errInsufficentPerms());
  }
  // If target user does not exist
  if (targetUser === undefined) {
    throw HTTPError(BAD_REQUEST, invalidIdStr('user'));
  }
  const users = dataStore.users;
  const globalOwners = users.filter(x => x.permissionId === 1);
  if (globalOwners.length === 1 && globalOwners[0] === targetUser) {
    throw HTTPError(BAD_REQUEST, 'Last global owner!');
  }
}

/**
 * Helper function to change the users data.
 *
 * @param user      Object of person to be removed from Beans
 * @returns         Nothing
 */
function changeDetails(user: User): void {
  user.email = '';
  user.handleStr = '';
  user.nameFirst = 'Removed';
  user.nameLast = 'user';
  // Password adjusted to make it close to impossible to log back in
  user.password = Date.now() + 'removeduser';
}

/**
 * Function for admin/user/remove/v1.
 *
 * @param token     Token of the user
 * @param uId       Id of person to removed from Beans
 * @returns         Empty object
 */
export function userRemoveV1(token: string, uId: number) {
  const session = findSessionV2(token);
  const dataStore = getData();
  const userRemoved = findUser(dataStore, uId);
  const admin = findUser(dataStore, session.authUserId);
  userPermissionErrorCheck(admin, userRemoved);
  dataStore.sessions = clearUserTokens(userRemoved.uId);
  removeFromChannels(userRemoved);
  removeFromAllDms(userRemoved);
  changeDetails(userRemoved);
  setData(dataStore);
  return {};
}

/**
 * Function for admin/user/remove/v1.
 *
 * @param token         Token of the user
 * @param uId           Id of person to removed from Beans
 * @param permissionId  Either 1 for global owner or 2 other users
 * @returns             Empty object
 */
export function userPermissionChangeV1(token: string, uId: number, permissionId: number) {
  const session = findSessionV2(token);
  const dataStore = getData();
  const userChanged = findUser(dataStore, uId);
  const admin = findUser(dataStore, session.authUserId);
  userPermissionErrorCheck(admin, userChanged);
  if (permissionId !== 1 && permissionId !== 2) {
    throw HTTPError(BAD_REQUEST, invalidIdStr('permission'));
  }
  if (userChanged.permissionId === permissionId) {
    throw HTTPError(BAD_REQUEST, `Already has permission of ${permissionId}`);
  }
  userChanged.permissionId = permissionId;
  setData(dataStore);
  return {};
}
