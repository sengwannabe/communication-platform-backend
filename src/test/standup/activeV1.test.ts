import { BAD_REQUEST, FORBIDDEN, clearV1, standupStartV1, standupActiveV1, channelsCreateV3, channelInviteV3 } from '../wrapper';
import { createUser } from '../testHelper';

describe('Successful standupActiveV1 Tests', () => {
  beforeEach(() => {
    clearV1();
  });

  test('single member channel', () => {
    const authUser = createUser();
    const channel1 = channelsCreateV3(authUser.authUser1.token, 'channel1', true);
    const length = 2;
    standupStartV1(authUser.authUser1.token, channel1.channelId, length);
    expect(standupActiveV1(authUser.authUser1.token, channel1.channelId)).toEqual(
      {
        isActive: true,
        timeFinish: expect.any(Number),
      }
    );
  });

  test('multiple member channel', () => {
    const authUser = createUser();
    const channel1 = channelsCreateV3(authUser.authUser1.token, 'channel1', true);
    channelInviteV3(authUser.authUser1.token, channel1.channelId, authUser.authUser2.authUserId);
    channelInviteV3(authUser.authUser1.token, channel1.channelId, authUser.authUser3.authUserId);
    channelInviteV3(authUser.authUser1.token, channel1.channelId, authUser.authUser4.authUserId);
    const length = 2;
    standupStartV1(authUser.authUser1.token, channel1.channelId, length);
    expect(standupActiveV1(authUser.authUser2.token, channel1.channelId)).toEqual(
      {
        isActive: true,
        timeFinish: expect.any(Number)
      }
    );
  });

  test('no active standup in the channel', () => {
    const authUser = createUser();
    const channel1 = channelsCreateV3(authUser.authUser1.token, 'channel1', true);
    expect(standupActiveV1(authUser.authUser1.token, channel1.channelId)).toEqual(
      {
        isActive: false,
        timeFinish: null,
      }
    );
  });
});

describe('Unsuccessful standupActiveV1 Tests', () => {
  beforeEach(() => {
    clearV1();
  });

  test('token is invalid', () => {
    const authUser = createUser();
    const channel1 = channelsCreateV3(authUser.authUser1.token, 'channel1', true);
    const length = 90;
    standupStartV1(authUser.authUser1.token, channel1.channelId, length);
    expect(() => standupActiveV1(authUser.authUser1.token + 1000, channel1.channelId)).toThrow(Error(FORBIDDEN));
  });

  test('channelId is invalid, not refer to any valid channels', () => {
    const authUser = createUser();
    const channel1 = channelsCreateV3(authUser.authUser1.token, 'channel1', true);
    const length = 90;
    standupStartV1(authUser.authUser1.token, channel1.channelId, length);
    expect(() => standupActiveV1(authUser.authUser1.token, channel1.channelId + 100)).toThrow(Error(BAD_REQUEST));
  });

  test('channelId is valid and authorised user is not a member of the channel', () => {
    const authUser = createUser();
    const channel1 = channelsCreateV3(authUser.authUser1.token, 'channel1', true);
    const length = 90;
    standupStartV1(authUser.authUser1.token, channel1.channelId, length);
    expect(() => standupActiveV1(authUser.authUser2.token, channel1.channelId)).toThrow(Error(FORBIDDEN));
  });
});
