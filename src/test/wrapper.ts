import request from 'sync-request';
import { port, url } from '../config.json';
export const SERVER_URL = `${url}:${port}`;

import { UserDetails } from '../dataStore';

export const BAD_REQUEST = '400';
export const FORBIDDEN = '403';

/// other

/**
 * Wrapper function to help send requests to the /clear/v1 route.
 *
 * @returns       An empty object
 */
export function clearV1() {
  const res = request(
    'DELETE',
    SERVER_URL + '/clear/v1',
    {
      qs: {}
    }
  );
  return JSON.parse(res.getBody() as string);
}

/// auth

export function authRegisterV3(email: string, password: string, nameFirst: string, nameLast: string) {
  const res = request(
    'POST',
    SERVER_URL + '/auth/register/v3',
    {
      json:
      {
        email: email,
        password: password,
        nameFirst: nameFirst,
        nameLast: nameLast
      }
    }
  );
  if (res.statusCode !== 200) throw new Error(res.statusCode.toString());
  return JSON.parse(res.body as string);
}

export function authLoginV2(email: string, password: string) {
  const res = request(
    'POST',
    SERVER_URL + '/auth/login/v3',
    {
      json:
      {
        email: email,
        password: password,
      }
    }
  );
  if (res.statusCode !== 200) throw new Error(res.statusCode.toString());
  return JSON.parse(res.body as string);
}

export function authLogoutV2(token: string) {
  const res = request(
    'POST',
    SERVER_URL + '/auth/logout/v2',
    {
      headers:
      {
        token: token,
      }
    }
  );
  if (res.statusCode !== 200) throw new Error(res.statusCode.toString());
  return JSON.parse(res.body as string);
}

export function authPasswordResetRequestV1(email: string) {
  const res = request(
    'POST',
    SERVER_URL + '/auth/passwordreset/request/v1',
    {
      json:
      {
        email: email,
      }
    }
  );
  return JSON.parse(res.body as string);
}

export function authPasswordResetResetV1(resetCode: string, newPassword: string) {
  const res = request(
    'POST',
    SERVER_URL + '/auth/passwordreset/reset/v1',
    {
      json:
      {
        resetCode: resetCode,
        newPassword: newPassword
      }
    }
  );
  if (res.statusCode !== 200) throw new Error(res.statusCode.toString());
  return JSON.parse(res.body as string);
}

/// channel

export function channelAddownerV2(token: string, channelId: number, uId: number) {
  const res = request(
    'POST',
    SERVER_URL + '/channel/addowner/v2',
    {
      headers:
      {
        token: token,
      },
      json:
      {
        channelId: channelId,
        uId: uId
      }
    }
  );
  if (res.statusCode !== 200) throw new Error(res.statusCode.toString());
  return JSON.parse(res.getBody() as string);
}

export function channelDetailsV3(token: string, channelId: number) {
  const res = request(
    'GET',
    SERVER_URL + '/channel/details/v3',
    {
      headers: {
        token: token
      },
      qs: {
        channelId: channelId
      }
    }
  );
  if (res.statusCode !== 200) throw new Error(res.statusCode.toString());
  return JSON.parse(res.getBody() as string);
}

/**
 * Wrapper function to help send requests to the /channel/invite/v3 route.
 *
 * @param token     The token of the current user
 * @param channelId The channelId of the channel to invite to
 * @param uId       The uId of the user to invite
 * @returns         An empty object
 */
export function channelInviteV3(token: string, channelId: number, uId: number) {
  const res = request(
    'POST',
    SERVER_URL + '/channel/invite/v3',
    {
      headers: {
        token: token,
      },
      json: {
        channelId: channelId,
        uId: uId,
      }
    }
  );
  if (res.statusCode !== 200) throw new Error(res.statusCode.toString());
  return JSON.parse(res.getBody() as string);
}

export function channelJoinV3(token: string, channelId: number) {
  const res = request(
    'POST',
    SERVER_URL + '/channel/join/v3',
    {
      headers: {
        token: token
      },
      json: {
        channelId: channelId
      }
    }
  );
  if (res.statusCode !== 200) throw new Error(res.statusCode.toString());
  return JSON.parse(res.getBody() as string);
}

export function channelLeaveV2(token: string, channelId: number) {
  const res = request(
    'POST',
    SERVER_URL + '/channel/leave/v2',
    {
      headers: {
        token: token
      },
      json: {
        channelId: channelId
      }
    }
  );
  if (res.statusCode !== 200) throw new Error(res.statusCode.toString());
  return JSON.parse(res.getBody() as string);
}

/**
 * Wrapper function to send requests to channelMessagesV3 functions
 * @param token The token of the current user
 * @param channelId The channel to get
 * @param start From which index to retrieve messages from
 * @returns
 */
export function channelMessagesV3(token: string, channelId: number, start: number) {
  const res = request(
    'GET',
    SERVER_URL + '/channel/messages/v3',
    {
      headers: {
        token: token
      },
      qs: {
        channelId,
        start
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

export function channelRemoveownerV2(token: string, channelId: number, uId: number) {
  const res = request(
    'POST',
    SERVER_URL + '/channel/removeowner/v2',
    {
      headers:
      {
        token: token,
      },
      json:
      {
        channelId: channelId,
        uId: uId
      }
    }
  );
  if (res.statusCode !== 200) throw new Error(res.statusCode.toString());
  return JSON.parse(res.getBody() as string);
}

/// channels

export function channelsCreateV3(token: string, name: string, isPublic: boolean) {
  const res = request(
    'POST',
    SERVER_URL + '/channels/create/v3',
    {
      headers:
      {
        token: token,
      },
      json:
      {
        name: name,
        isPublic: isPublic
      }
    }
  );
  if (res.statusCode !== 200) throw new Error(res.statusCode.toString());
  return JSON.parse(res.getBody() as string);
}

export function channelsListAllV3(token: string) {
  const res = request(
    'GET',
    SERVER_URL + '/channels/listAll/v3',
    {
      headers:
      {
        token: token,
      }
    }
  );
  if (res.statusCode !== 200) throw new Error(res.statusCode.toString());
  return JSON.parse(res.getBody() as string);
}

export function channelsListV3(token: string) {
  const res = request(
    'GET',
    SERVER_URL + '/channels/list/v3',
    {
      headers:
      {
        token,
      }
    }
  );
  if (res.statusCode !== 200) throw new Error(res.statusCode.toString());
  return JSON.parse(res.getBody() as string);
}

/// dm

export function dmCreateV2(token: string, uIds: number[]) {
  const res = request(
    'POST',
    SERVER_URL + '/dm/create/v2',
    {
      headers:
      {
        token: token
      },
      json:
      {
        uIds: uIds
      }
    }
  );
  if (res.statusCode !== 200) throw new Error(res.statusCode.toString());
  return JSON.parse(res.getBody() as string);
}

export function dmDetailsV2(token: string, dmId: number | number[]) {
  const res = request(
    'GET',
    SERVER_URL + '/dm/details/v2',
    {
      headers: {
        token
      },
      qs: {
        dmId
      }
    }
  );
  if (res.statusCode !== 200) throw new Error(res.statusCode.toString());
  return JSON.parse(res.getBody() as string);
}

export function dmLeaveV2(token: string, dmId: number | number[]) {
  const res = request(
    'POST',
    SERVER_URL + '/dm/leave/v2',
    {
      headers: {
        token
      },
      json: {
        dmId
      }
    }
  );
  if (res.statusCode !== 200) throw new Error(res.statusCode.toString());
  return JSON.parse(res.getBody() as string);
}

export function dmListV2(token: string) {
  const res = request(
    'GET',
    SERVER_URL + '/dm/list/v2',
    {
      headers:
      {
        token: token
      },
    }
  );
  if (res.statusCode !== 200) throw new Error(res.statusCode.toString());
  return JSON.parse(res.getBody() as string);
}

export function dmMessagesV2(token: string, dmId: number | number[], start: number) {
  const res = request(
    'GET',
    SERVER_URL + '/dm/messages/v2',
    {
      headers: {
        token
      },
      qs: {
        dmId,
        start
      }
    }
  );
  if (res.statusCode !== 200) throw new Error(res.statusCode.toString());
  return JSON.parse(res.getBody() as string);
}

export function dmRemoveV2(token: string, dmId: number) {
  const res = request(
    'DELETE',
    SERVER_URL + '/dm/remove/v2',
    {
      headers: {
        token
      },
      qs: {
        dmId
      }
    }
  );
  if (res.statusCode !== 200) throw new Error(res.statusCode.toString());
  return JSON.parse(res.getBody() as string);
}

/// message

/**
 * Wrapper function to help send requests to the /message/edit/v2 route.
 *
 * @param token     The token of the authenticated user
 * @param messageId The messageId of the message to edit
 * @param message   The edited message
 * @returns         None
 */
export function messageEditV2(token: string, messageId: number, message: string) {
  const res = request(
    'PUT',
    SERVER_URL + '/message/edit/v2',
    {
      headers: {
        token: token,
      },
      json: {
        messageId,
        message,
      }
    }
  );
  if (res.statusCode !== 200) throw new Error(res.statusCode.toString());
  return JSON.parse(res.getBody() as string);
}

/**
 * Wrapper function to help send requests to the /message/pin/v1 route.
 *
 * @param token     The token of the authenticated user
 * @param messageId The messageId of the message to pin
 * @returns         None
 */
export function messagePinV1(token: string, messageId: number) {
  const res = request(
    'POST',
    SERVER_URL + '/message/pin/v1',
    {
      headers: {
        token: token,
      },
      json: {
        messageId: messageId,
      }
    }
  );
  if (res.statusCode !== 200) throw new Error(res.statusCode.toString());
  return JSON.parse(res.getBody() as string);
}

/**
 * Wrapper function to help send requests to the /message/react/v1 route.
 *
 * @param token     The token of the authenticated user
 * @param messageId The messageId of the message to react to
 * @param reactId   The id of the reaction to add
 * @returns         None
 */
export function messageReactV1(token: string, messageId: number, reactId: number) {
  const res = request(
    'POST',
    SERVER_URL + '/message/react/v1',
    {
      headers: {
        token: token,
      },
      json: {
        messageId: messageId,
        reactId: reactId,
      }
    }
  );
  if (res.statusCode !== 200) throw new Error(res.statusCode.toString());
  return JSON.parse(res.getBody() as string);
}

/**
 * Wrapper function to help send requests to the /message/remove/v2 route.
 *
 * @param token     The token of the authenticated user
 * @param messageId The messageId of the message to remove
 * @returns         None
 */
export function messageRemoveV2(token: string, messageId: number) {
  const res = request(
    'DELETE',
    SERVER_URL + '/message/remove/v2',
    {
      headers: {
        token: token,
      },
      qs: {
        messageId: messageId,
      }
    }
  );
  if (res.statusCode !== 200) throw new Error(res.statusCode.toString());
  return JSON.parse(res.getBody() as string);
}

/**
 * Wrapper function to help send requests to the /message/senddm/v2 route.
 *
 * @param token   The token of the current user
 * @param dmId    The dmId of the DM to send to
 * @param message The message to send
 * @returns       The id of the message sent
 */
export function messageSenddmV2(token: string, dmId: number, message: string) {
  const res = request(
    'POST',
    SERVER_URL + '/message/senddm/v2',
    {
      headers: {
        token: token,
      },
      json: {
        dmId: dmId,
        message: message,
      }
    }
  );
  if (res.statusCode !== 200) throw new Error(res.statusCode.toString());
  return JSON.parse(res.getBody() as string);
}

/**
 * Wrapper function to help send requests to the /message/send/v2 route.
 *
 * @param token     The token of the current user
 * @param channelId The channelId of the message to send to
 * @param message   The message to send
 * @returns         The id of the message sent
 */
export function messageSendV2(token: string, channelId: number, message: string) {
  const res = request(
    'POST',
    SERVER_URL + '/message/send/v2',
    {
      headers: {
        token: token,
      },
      json: {
        channelId: channelId,
        message: message,
      }
    }
  );
  if (res.statusCode !== 200) throw new Error(res.statusCode.toString());
  return JSON.parse(res.getBody() as string);
}

/**
 * Wrapper for /message/sendlater/v1
 *
 * @param token     The token of the authorised user
 * @param channelId The channel to send the message to
 * @param message   The message to send
 * @param timeSent  The time in the future to send the message
 * @returns         The id of the message sent
 */
export function messageSendLaterV1(token: string, channelId: number, message: string, timeSent: number) {
  const res = request(
    'POST',
    SERVER_URL + '/message/sendlater/v1',
    {
      headers: {
        token: token,
      },
      json: {
        channelId: channelId,
        message: message,
        timeSent: timeSent
      }
    }
  );
  if (res.statusCode !== 200) throw new Error(res.statusCode.toString());
  return JSON.parse(res.getBody() as string);
}

/**
 * Wrapper for /message/sendlaterdm/v1
 *
 * @param token     The token of the authorised user
 * @param dmId      The dm to send the message to
 * @param message   The message to send
 * @param timeSent  The time in the future to send the message
 * @returns         The id of the message sent
 */
export function messageSendLaterDmV1(token: string, dmId: number, message: string, timeSent: number) {
  const res = request(
    'POST',
    SERVER_URL + '/message/sendlaterdm/v1',
    {
      headers: {
        token: token,
      },
      json: {
        dmId: dmId,
        message: message,
        timeSent: timeSent
      }
    }
  );
  if (res.statusCode !== 200) throw new Error(res.statusCode.toString());
  return JSON.parse(res.getBody() as string);
}

/**
 * Wrapper function to help send requests to the /message/unpin/v1 route.
 *
 * @param token     The token of the authenticated user
 * @param messageId The messageId of the message to unpin
 * @returns         None
 */
export function messageUnpinV1(token: string, messageId: number) {
  const res = request(
    'POST',
    SERVER_URL + '/message/unpin/v1',
    {
      headers: {
        token: token,
      },
      json: {
        messageId: messageId,
      }
    }
  );
  if (res.statusCode !== 200) throw new Error(res.statusCode.toString());
  return JSON.parse(res.getBody() as string);
}

/**
 * Wrapper function to help send requests to the /message/unreact/v1 route.
 *
 * @param token     The token of the authenticated user
 * @param messageId The messageId of the message to unreact to
 * @param reactId   The id of the reaction to remove
 * @returns         None
 */
export function messageUnreactV1(token: string, messageId: number, reactId: number) {
  const res = request(
    'POST',
    SERVER_URL + '/message/unreact/v1',
    {
      headers: {
        token: token,
      },
      json: {
        messageId: messageId,
        reactId: reactId,
      }
    }
  );
  if (res.statusCode !== 200) throw new Error(res.statusCode.toString());
  return JSON.parse(res.getBody() as string);
}

/**
 *
 * Wrapper for messageShareV1
 *
 * @param token       token of the active user
 * @param ogMessageId id of the original message to be shared
 * @param message     optional additional message
 * @param channelId   id of the channel to be shared to, is -1 if sent to dm
 * @param dmId        id of the dm to be shared to, is -1 if sent to channel
 * @returns           id of the shared message
 */
export function messageShareV1(token: string, ogMessageId: number, message: string, channelId: number, dmId: number) {
  const res = request(
    'POST',
    SERVER_URL + '/message/share/v1',
    {
      headers: {
        token: token,
      },
      json: {
        ogMessageId: ogMessageId,
        message: message,
        channelId: channelId,
        dmId: dmId,
      }
    }
  );
  if (res.statusCode !== 200) throw new Error(res.statusCode.toString());
  return JSON.parse(res.getBody() as string);
}

/**
 * Wrapper function to help send requests to the /notifications/get/v1 route.
 *
 * @param token     The token of the authenticated user
 * @returns         An object containing notifications
 */
export function notificationsGetV1(token: string) {
  const res = request(
    'GET',
    SERVER_URL + '/notifications/get/v1',
    {
      headers: {
        token: token,
      },
    }
  );
  if (res.statusCode !== 200) throw new Error(res.statusCode.toString());
  return JSON.parse(res.getBody() as string);
}

/// users

/**
 * Wrapper function to help send requests to the /users/all/v2 route.
 * @param token The token of the current user
 * @returns An array of objects where each object contains type users.
 */
export function usersAllV2(token: string) {
  const res = request(
    'GET',
    SERVER_URL + '/users/all/v2',
    {
      headers: {
        token: token,
      },
      qs: {}
    }
  );
  if (res.statusCode !== 200) throw new Error(res.statusCode.toString());
  return JSON.parse(res.getBody() as string);
}

/**
 * Updates the authorised user's email address.
 * @param token The token of the current user.
 * @param email The email to change to.
 * @returns {}
 */
export function userProfileSetemailV2(token: string, email: string): Record<string, never> {
  const res = request(
    'PUT',
    SERVER_URL + '/user/profile/setemail/v2',
    {
      headers: {
        token: token,
      },
      json:
      {
        email: email
      }
    }
  );
  if (res.statusCode !== 200) throw new Error(res.statusCode.toString());
  return JSON.parse(res.getBody() as string);
}

/**
 * Wrapper function to help send requests to the /user/profile/sethandle/v2 route.
 * @param token The token of the current user.
 * @param handleStr The handlestring to change to.
 * @returns empty object
 */
export function userProfileSetHandleV2(token: string, handleStr: string): Record<string, never> {
  const res = request(
    'PUT',
    SERVER_URL + '/user/profile/sethandle/v2',
    {
      headers: {
        token: token,
      },
      json:
      {
        handleStr: handleStr,
      }
    }
  );
  if (res.statusCode !== 200) throw new Error(res.statusCode.toString());
  return JSON.parse(res.getBody() as string);
}

/**
 * Wrapper function to help send requests to the /user/profile/Setnamev1 route.
 * @param token The token of the user.
 * @param nameFirst First name to change to
 * @param nameLast Last name to change to
 * @returns
 */
export function userProfileSetnameV2(token: string, nameFirst: string, nameLast: string) {
  const res = request(
    'PUT',
    SERVER_URL + '/user/profile/setname/v2',
    {
      headers: {
        token: token,
      },
      json:
      {
        nameFirst: nameFirst,
        nameLast: nameLast
      }
    }
  );
  if (res.statusCode !== 200) throw new Error(res.statusCode.toString());
  return JSON.parse(res.getBody() as string);
}

/**
 * Wrapper function to help send requests to the /user/profile/v3 route.
 *
 * @param token The token of the current user
 * @param uId   The uId of the user to search for
 * @returns     An object of the user
 */
export function userProfileV3(token: string, uId: number): UserDetails {
  const res = request(
    'GET',
    SERVER_URL + '/user/profile/v3',
    {
      headers: {
        token,
      },
      qs: {
        uId,
      }
    }
  );
  if (res.statusCode !== 200) throw new Error(res.statusCode.toString());
  return JSON.parse(res.getBody() as string);
}

/**
 *
 * Function searches and returns messages that contain queryString
 *
 * @param token    authUser active token
 * @param queryStr the string too look for
 * @returns        array of messages that the user is in with searched string
 */
export function searchV1(token: string, queryStr: string) {
  const res = request(
    'GET',
    SERVER_URL + '/search/v1',
    {
      headers: {
        token,
      },
      qs: {
        queryStr,
      }
    }
  );
  if (res.statusCode !== 200) throw new Error(res.statusCode.toString());
  return JSON.parse(res.getBody() as string);
}

/// admin
export function userRemoveV1(token: string, uId: number) {
  const res = request(
    'DELETE',
    SERVER_URL + '/admin/user/remove/v1',
    {
      headers: {
        token
      },
      qs: {
        uId
      }
    }
  );
  if (res.statusCode !== 200) throw new Error(res.statusCode.toString());
  return JSON.parse(res.getBody() as string);
}

export function userPermissionChangeV1(token: string, uId: number, permissionId: number) {
  const res = request(
    'POST',
    SERVER_URL + '/admin/userpermission/change/v1',
    {
      headers: {
        token: token
      },
      json:
      {
        uId: uId,
        permissionId: permissionId,
      }
    }
  );
  if (res.statusCode !== 200) throw new Error(res.statusCode.toString());
  return JSON.parse(res.body as string);
}

/// standup

export function standupStartV1(token: string, channelId: string, length: number) {
  const res = request(
    'POST',
    SERVER_URL + '/standup/start/v1',
    {
      headers:
      {
        token: token,
      },
      json:
      {
        channelId: channelId,
        length: length,
      }
    }
  );
  if (res.statusCode !== 200) throw new Error(res.statusCode.toString());
  return JSON.parse(res.getBody() as string);
}

export function standupActiveV1(token: string, channelId: number) {
  const res = request(
    'GET',
    SERVER_URL + '/standup/active/v1',
    {
      headers:
      {
        token: token,
      },
      qs:
      {
        channelId: channelId,
      }
    }
  );
  if (res.statusCode !== 200) throw new Error(res.statusCode.toString());
  return JSON.parse(res.getBody() as string);
}

export function standupSendV1(token: string, channelId: string, message: string) {
  const res = request(
    'POST',
    SERVER_URL + '/standup/send/v1',
    {
      headers:
      {
        token: token,
      },
      json:
      {
        channelId: channelId,
        message: message,
      }
    }
  );
  if (res.statusCode !== 200) throw new Error(res.statusCode.toString());
  return JSON.parse(res.getBody() as string);
}

/// user stat

export function userStatsV1(token: string) {
  const res = request(
    'GET',
    SERVER_URL + '/user/stats/v1',
    {
      headers: {
        token: token,
      },
      qs: {}
    }
  );
  if (res.statusCode !== 200) throw new Error(res.statusCode.toString());
  return JSON.parse(res.getBody() as string);
}

export function usersStatsV1(token: string) {
  const res = request(
    'GET',
    SERVER_URL + '/users/stats/v1',
    {
      headers: {
        token: token,
      },
      qs: {}
    }
  );
  if (res.statusCode !== 200) throw new Error(res.statusCode.toString());
  return JSON.parse(res.getBody() as string);
}

export function profileUploadPhotoV1(imgUrl: string, xStart: number, yStart: number, xEnd: number, yEnd: number, token: string) {
  const res = request(
    'POST',
    SERVER_URL + '/user/profile/uploadphoto/v1',
    {
      headers: {
        token: token,
      },
      json:
      {
        imgUrl: imgUrl,
        xStart: xStart,
        yStart: yStart,
        xEnd: xEnd,
        yEnd: yEnd,
      }
    }
  );
  if (res.statusCode !== 200) throw new Error(res.statusCode.toString());
  return JSON.parse(res.body as string);
}
