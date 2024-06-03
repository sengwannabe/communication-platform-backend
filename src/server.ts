import express, { json, NextFunction, Request, Response } from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import errorHandler from 'middleware-http-errors';
import { authRegisterV3, authLoginV3, authLogoutV2, authPasswordResetRequestV1, authPasswordResetResetV1 } from './auth';
import { channelDetailsV3, channelMessagesV3, channelInviteV3, channelJoinV3, channelLeaveV2, channelAddOwnerV2, channelRemoveOwnerV2 } from './channel';
import { channelsCreateV3, channelsListAllV3, channelsListV3 } from './channels';
import { dmCreateV2, dmLeaveV2, dmRemoveV2, dmListV2, dmDetailsV2, dmMessagesV2 } from './dm';
import { usersAllV2, userProfileV3, userProfileSetEmailV2, userProfileSetHandleV2, userProfileSetNameV2, userStatsV1, usersStatsV1, profileUploadPhotoV1 } from './users';
import { userRemoveV1, userPermissionChangeV1 } from './admin';
import { standupStartV1, standupActiveV1, standupSendV1 } from './standup';
import { clearV1, searchV1 } from './other';
import { messageSendV2, messageSenddmV2, messageSendLaterV1, messageSendLaterDmV1, messageRemoveV2, messageEditV2, messageReactV1, messageUnreactV1, messagePinV1, messageUnpinV1, messageShareV1 } from './message';
import { notificationsGetV1 } from './notifications';

// Set up web app
const app = express();
// Use middleware that allows us to access the JSON body of requests
app.use(json());
// Use middleware that allows for access from other domains
app.use(cors());

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'localhost';

// for logging errors (print to terminal)
// Place BEFORE routes
app.use(morgan('dev'));

// Example get request
app.get('/echo', (req: Request, res: Response, next) => {
  try {
    const data = req.query.echo as string;
    return res.json(echo(data));
  } catch (err) {
    next(err);
  }
});

/// auth

// For registering users
app.post('/auth/register/v3', (req: Request, res: Response) => {
  const { email, password, nameFirst, nameLast } = req.body;
  res.json(authRegisterV3(email, password, nameFirst, nameLast));
});

// For users to login
app.post('/auth/login/v3', (req: Request, res: Response) => {
  const { email, password } = req.body;
  res.json(authLoginV3(email, password));
});

// For users to logout
app.post('/auth/logout/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  res.json(authLogoutV2(token));
});

// For users to request for password reset
app.post('/auth/passwordreset/request/v1', (req: Request, res: Response) => {
  const { email } = req.body;
  res.json(authPasswordResetRequestV1(email));
});

// For users to reset their password
app.post('/auth/passwordreset/reset/v1', (req: Request, res: Response) => {
  const { resetCode, newPassword } = req.body;
  res.json(authPasswordResetResetV1(resetCode, newPassword));
});

/// channel

// To find channel details
app.get('/channel/details/v3', (req: Request, res: Response) => {
  const token = req.header('token');
  const channelId = parseInt(req.query.channelId as string);
  res.json(channelDetailsV3(token, channelId));
});

// To get channel messages
app.get('/channel/messages/v3', (req: Request, res: Response) => {
  const token = req.header('token');
  const channelId = parseInt(req.query.channelId as string);
  const start = parseInt(req.query.start as string);
  res.json(channelMessagesV3(token, channelId, start));
});

// Channel Invite
app.post('/channel/invite/v3', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const { channelId, uId } = req.body;
  res.json(channelInviteV3(token, channelId, uId));
});

// To find channel details
app.post('/channel/join/v3', (req: Request, res: Response) => {
  const token = req.header('token');
  const { channelId } = req.body;
  res.json(channelJoinV3(token, channelId));
});

// For any member to leave a channel
app.post('/channel/leave/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const channelId = parseInt(req.body.channelId as string);
  res.json(channelLeaveV2(token, channelId));
});

// To add new owner to channel
app.post('/channel/addowner/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const channelId = parseInt(req.body.channelId as string);
  const uId = parseInt(req.body.uId as string);
  res.json(channelAddOwnerV2(token, channelId, uId));
});

// To remove owner from channel
app.post('/channel/removeowner/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const channelId = parseInt(req.body.channelId as string);
  const uId = parseInt(req.body.uId as string);
  res.json(channelRemoveOwnerV2(token, channelId, uId));
});

/// channels

// Channel Create
app.post('/channels/create/v3', (req: Request, res: Response) => {
  const token = req.header('token');
  const { name, isPublic } = req.body;
  res.json(channelsCreateV3(token, name, isPublic));
});

// Channel List
app.get('/channels/list/v3', (req: Request, res: Response) => {
  const token = req.header('token');
  return res.json(channelsListV3(token));
});

// Channel List All
app.get('/channels/listAll/v3', (req: Request, res: Response) => {
  const token = req.header('token');
  return res.json(channelsListAllV3(token));
});

/// dm

// DM Create
app.post('/dm/create/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const uIds = req.body.uIds;
  return res.json(dmCreateV2(token, uIds));
});

// DM Remove
app.delete('/dm/remove/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const dmId = parseInt(req.query.dmId as string);
  res.json(dmRemoveV2(token, dmId));
});

// To remove a member from a dm
app.post('/dm/leave/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const { dmId } = req.body;
  return res.json(dmLeaveV2(token, dmId));
});

// DM List
app.get('/dm/list/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  return res.json(dmListV2(token));
});

// To find dm details
app.get('/dm/details/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const dmId = parseInt(req.query.dmId as string);
  return res.json(dmDetailsV2(token, dmId));
});

// To find a DM's messages
app.get('/dm/messages/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const dmId = parseInt(req.query.dmId as string);
  const start = parseInt(req.query.start as string);
  return res.json(dmMessagesV2(token, dmId, start));
});

/// message

// Message Send
app.post('/message/send/v2', (req: Request, res: Response, next) => {
  const token = req.headers.token as string;
  const { channelId, message } = req.body;
  res.json(messageSendV2(token, channelId, message));
});

// Message Senddm
app.post('/message/senddm/v2', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const { dmId, message } = req.body;
  return res.json(messageSenddmV2(token, dmId, message));
});

// Message SendLater
app.post('/message/sendlater/v1', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const { channelId, message, timeSent } = req.body;
  res.json(messageSendLaterV1(token, channelId, message, timeSent));
});

// Message SendLater
app.post('/message/sendlaterdm/v1', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const { dmId, message, timeSent } = req.body;
  res.json(messageSendLaterDmV1(token, dmId, message, timeSent));
});

// Message Remove
app.delete('/message/remove/v2', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const messageId = parseInt(req.query.messageId as string);
  return res.json(messageRemoveV2(token, messageId));
});

// Message Edit
app.put('/message/edit/v2', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const { messageId, message } = req.body;
  return res.json(messageEditV2(token, messageId, message));
});

// Message React
app.post('/message/react/v1', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const { messageId, reactId } = req.body;
  return res.json(messageReactV1(token, messageId, reactId));
});

// Message Unreact
app.post('/message/unreact/v1', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const { messageId, reactId } = req.body;
  return res.json(messageUnreactV1(token, messageId, reactId));
});

// Message Pin
app.post('/message/pin/v1', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const { messageId } = req.body;
  return res.json(messagePinV1(token, messageId));
});

// Message Share
app.post('/message/share/v1', (req: Request, res: Response) => {
  const token = req.header('token') as string;
  const { ogMessageId, message, channelId, dmId } = req.body;
  return res.json(messageShareV1(token, ogMessageId, message, channelId, dmId));
});

// Message Unpin
app.post('/message/unpin/v1', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const { messageId } = req.body;
  return res.json(messageUnpinV1(token, messageId));
});

/// notifications

app.get('/notifications/get/v1', (req: Request, res: Response) => {
  const token = req.header('token');
  return res.json(notificationsGetV1(token));
});

/// user

// For all user details
app.get('/users/all/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  return res.json(usersAllV2(token));
});

// User Profile
app.get('/user/profile/v3', (req: Request, res: Response) => {
  const token = req.header('token');
  const uId = parseInt(req.query.uId as string);
  return res.json(userProfileV3(token, uId));
});

// To set new email
app.put('/user/profile/setemail/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const { email } = req.body;
  return res.json(userProfileSetEmailV2(token, email));
});

// To set new handle
app.put('/user/profile/sethandle/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const { handleStr } = req.body;
  return res.json(userProfileSetHandleV2(token, handleStr));
});

// To set new nameFirst and nameLast
app.put('/user/profile/setname/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const { nameFirst, nameLast } = req.body;
  return res.json(userProfileSetNameV2(token, nameFirst, nameLast));
});

app.get('/user/stats/v1', (req: Request, res: Response) => {
  const token = req.header('token');
  return res.json(userStatsV1(token));
});

app.get('/users/stats/v1', (req: Request, res: Response) => {
  const token = req.header('token');
  return res.json(usersStatsV1(token));
});
// Search

// Finds all messages containing queryStr
app.get('/search/v1', (req: Request, res: Response) => {
  const token = req.header('token');
  const queryStr = req.query.queryStr as string;
  return res.json(searchV1(token, queryStr));
});

/// admin

// To remove a user from beans
app.delete('/admin/user/remove/v1', (req: Request, res: Response) => {
  const token = req.header('token');
  const uId = parseInt(req.query.uId as string);
  res.json(userRemoveV1(token, uId));
});

// To change a user's permission id
app.post('/admin/userpermission/change/v1', (req: Request, res: Response) => {
  const token = req.header('token');
  const { uId, permissionId } = req.body;
  res.json(userPermissionChangeV1(token, uId, permissionId));
});

// Clears the database
app.delete('/clear/v1', (req: Request, res: Response) => {
  res.json(clearV1());
});

// used to serve images stored on the server
app.use('/static', express.static('static'));

// To upload a photo
app.post('/user/profile/uploadphoto/v1', (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('token');
    const { xStart, xEnd, yStart, yEnd, imgUrl } = req.body;
    res.json(profileUploadPhotoV1(imgUrl, xStart, yStart, xEnd, yEnd, token));
  } catch (error) {
    console.log('Caught');

    next(error);
  }
});

// handles errors nicely, must use AFTER declaring routes
app.use(errorHandler());

// start server
const server = app.listen(PORT, HOST, () => {
  // DO NOT CHANGE THIS LINE
  console.log(`⚡️ Server listening on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
});

/// standup

// Standup start
app.post('/standup/start/v1', (req: Request, res: Response) => {
  const token = req.header('token');
  const { channelId, length } = req.body;
  res.json(standupStartV1(token, channelId, length));
});

// Standup active

app.get('/standup/active/v1', (req: Request, res: Response) => {
  const token = req.header('token');
  const channelId = parseInt(req.query.channelId as string);
  res.json(standupActiveV1(token, channelId));
});

// Standup send

app.post('/standup/send/v1', (req: Request, res: Response) => {
  const token = req.header('token');
  const { channelId, message } = req.body;
  res.json(standupSendV1(token, channelId, message));
});
