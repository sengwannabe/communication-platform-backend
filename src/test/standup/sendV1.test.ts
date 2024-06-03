import {
  BAD_REQUEST,
  FORBIDDEN,
  clearV1,
  standupStartV1,
  standupSendV1,
  channelsCreateV3,
  channelInviteV3,
  channelMessagesV3,
} from '../wrapper';
import { createUser, lorem1001char } from '../testHelper';

const sleep = (delayTime: number) => new Promise(callback => setTimeout(callback, delayTime));

describe('Successful standupSendV1 Tests', () => {
  beforeEach(() => {
    clearV1();
  });

  test('single member channel', async () => {
    const authUser = createUser();
    const channel1 = channelsCreateV3(authUser.authUser1.token, 'channel1', true);
    const length = 2;
    standupStartV1(authUser.authUser1.token, channel1.channelId, length);
    const message = 'winner winner';
    standupSendV1(authUser.authUser1.token, channel1.channelId, message);
    await sleep(length * 2000);
    const start = 0;
    const channelMessage = channelMessagesV3(authUser.authUser1.token, channel1.channelId, start);
    expect(channelMessage).toStrictEqual(
      {
        messages: [
          {
            messageId: expect.any(Number),
            uId: authUser.authUser1.authUserId,
            message: expect.any(String),
            timeSent: expect.any(Number),
            reacts: expect.anything(),
            isPinned: false,
          }
        ],

        start: 0,
        end: -1,
      }
    );
  });

  test('multiple member channel', async () => {
    const authUser = createUser();
    const channel1 = channelsCreateV3(authUser.authUser1.token, 'channel1', true);
    channelInviteV3(authUser.authUser1.token, channel1.channelId, authUser.authUser2.authUserId);
    channelInviteV3(authUser.authUser1.token, channel1.channelId, authUser.authUser3.authUserId);
    channelInviteV3(authUser.authUser1.token, channel1.channelId, authUser.authUser4.authUserId);
    const length = 2;
    standupStartV1(authUser.authUser1.token, channel1.channelId, length);
    const message = 'winner winner';
    standupSendV1(authUser.authUser1.token, channel1.channelId, message);
    const message1 = 'chicken dinner';
    standupSendV1(authUser.authUser2.token, channel1.channelId, message1);
    await sleep(length * 1000);
    const start = 0;
    const channelMessages = channelMessagesV3(authUser.authUser1.token, channel1.channelId, start);
    expect(channelMessages).toStrictEqual(
      {
        messages: [
          {
            messageId: expect.any(Number),
            uId: authUser.authUser1.authUserId,
            message: expect.any(String),
            timeSent: expect.any(Number),
            reacts: expect.anything(),
            isPinned: false,
          }
        ],

        start: 0,
        end: -1,
      }
    );
  });
});

describe('Unsuccessful standupSendV1 Tests', () => {
  beforeEach(() => {
    clearV1();
  });

  test('token is invalid', () => {
    const authUser = createUser();
    const channel1 = channelsCreateV3(authUser.authUser1.token, 'channel1', true);
    const length = 2;
    standupStartV1(authUser.authUser1.token, channel1.channelId, length);
    const message = 'winner winner';
    expect(() => standupSendV1(authUser.authUser1.token + 100, channel1.channelId, message)).toThrow(Error(FORBIDDEN));
  });

  test('channelId is invalid, not refer to any valid channels', () => {
    const authUser = createUser();
    const channel1 = channelsCreateV3(authUser.authUser1.token, 'channel1', true);
    const length = 2;
    standupStartV1(authUser.authUser1.token, channel1.channelId, length);
    const message = 'winner winner';
    expect(() => standupSendV1(authUser.authUser1.token, channel1.channelId + 100, message)).toThrow(Error(BAD_REQUEST));
  });

  test('an active standup is not currently running in the channel', () => {
    const authUser = createUser();
    const channel1 = channelsCreateV3(authUser.authUser1.token, 'channel1', true);
    const message = 'winner winner';
    expect(() => standupSendV1(authUser.authUser1.token, channel1.channelId, message)).toThrow(Error(BAD_REQUEST));
  });

  test('length of message is over 1000 characters', () => {
    const authUser = createUser();
    const channel1 = channelsCreateV3(authUser.authUser1.token, 'channel1', true);
    const length = 2;
    standupStartV1(authUser.authUser1.token, channel1.channelId, length);
    const message = lorem1001char();
    expect(() => standupSendV1(authUser.authUser1.token, channel1.channelId, message)).toThrow(Error(BAD_REQUEST));
  });

  test('channelId is valid and authorised user is not a member of the channel', () => {
    const authUser = createUser();
    const channel1 = channelsCreateV3(authUser.authUser1.token, 'channel1', true);
    const message = 'hello world';
    expect(() => standupSendV1(authUser.authUser2.token, channel1.channelId, message)).toThrow(Error(FORBIDDEN));
  });
});
