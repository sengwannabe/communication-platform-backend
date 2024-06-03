import { getTime } from '../../helper';
import { createUser } from '../testHelper';
import { BAD_REQUEST, FORBIDDEN, clearV1, standupStartV1, channelsCreateV3, channelInviteV3 } from '../wrapper';

describe('Successful standupStartV1 Tests', () => {
  beforeEach(() => {
    clearV1();
  });

  test('single member channel', () => {
    const authUser = createUser();
    const channel1 = channelsCreateV3(authUser.authUser1.token, 'channel1', true);
    const length = 10;
    const time = getTime();
    const standup = standupStartV1(authUser.authUser1.token, channel1.channelId, length);
    expect(standup).toEqual(
      {
        timeFinish: expect.any(Number),
      }
    );
    expect(standup.timeFinish).toBeGreaterThanOrEqual(Math.floor(time / 1000 + length));
    expect(standup.timeFinish).toBeLessThan(time / 1000 + length + 2);
  });

  test('multiple member channel', () => {
    const authUser = createUser();
    const channel1 = channelsCreateV3(authUser.authUser1.token, 'channel1', true);
    channelInviteV3(authUser.authUser1.token, channel1.channelId, authUser.authUser2.authUserId);
    channelInviteV3(authUser.authUser1.token, channel1.channelId, authUser.authUser3.authUserId);
    channelInviteV3(authUser.authUser1.token, channel1.channelId, authUser.authUser4.authUserId);
    const length = 90;
    const time = getTime();
    const standup = standupStartV1(authUser.authUser1.token, channel1.channelId, length);
    expect(standup).toEqual(
      {
        timeFinish: expect.any(Number),
      }
    );
    expect(standup.timeFinish).toBeGreaterThanOrEqual(Math.floor(time / 1000 + length));
    expect(standup.timeFinish).toBeLessThan(time / 1000 + length + 2);
  });
});

describe('Unsuccessful standupStartV1 Tests', () => {
  beforeEach(() => {
    clearV1();
  });

  test('token is invalid', () => {
    const authUser = createUser();
    const channel1 = channelsCreateV3(authUser.authUser1.token, 'channel1', true);
    const length = 90;
    expect(() => standupStartV1(authUser.authUser1.token + 100, channel1.channelId, length)).toThrow(Error(FORBIDDEN));
  });

  test('channelId is invalid, not refer to any valid channels', () => {
    const authUser = createUser();
    const channel1 = channelsCreateV3(authUser.authUser1.token, 'channel1', true);
    const length = 90;
    expect(() => standupStartV1(authUser.authUser1.token, channel1.channelId + 100, length)).toThrow(Error(BAD_REQUEST));
  });

  test('length is a negative number', () => {
    const authUser = createUser();
    const channel1 = channelsCreateV3(authUser.authUser1.token, 'channel1', true);
    const length = -90;
    expect(() => standupStartV1(authUser.authUser1.token, channel1.channelId, length)).toThrow(Error(BAD_REQUEST));
  });

  test('channelId is valid and authorised user is not a member of the channel', () => {
    const authUser = createUser();
    const channel1 = channelsCreateV3(authUser.authUser1.token, 'channel1', true);
    const length = 90;
    expect(() => standupStartV1(authUser.authUser2.token, channel1.channelId, length)).toThrow(Error(FORBIDDEN));
  });
});
