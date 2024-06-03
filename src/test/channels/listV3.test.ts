import { FORBIDDEN, clearV1, authRegisterV3, channelInviteV3, channelsCreateV3, channelsListV3 } from '../wrapper';

// Test case for channelsCreateV1
// - Successful channel creation
// - Test name has valid length
// - Test authUserId is valid

describe('Successful channel listing', () => {
  beforeEach(() => {
    clearV1();
  });

  test('user is owner of multiple channels', () => {
    const authUser1 = authRegisterV3('stevenpool1@gmail.com', 'coolpassword1', 'Steve', 'Gregory');
    const channel1 = channelsCreateV3(authUser1.token, 'channel1', true);
    const channel2 = channelsCreateV3(authUser1.token, 'channel2', false);
    expect(channelsListV3(authUser1.token)).toEqual({
      channels: [
        {
          channelId: channel1.channelId,
          name: 'channel1',
        },
        {
          channelId: channel2.channelId,
          name: 'channel2',
        }
      ]
    }
    );
  });

  test('user is not a member of multiple channels', () => {
    const authUser1 = authRegisterV3('stevenpool1@gmail.com', 'coolpassword1', 'Steve', 'Gregory');
    const authUser2 = authRegisterV3('stevoKing2@gmail.com', 'coolpassword2', 'Stevo', 'King');
    const channel1 = channelsCreateV3(authUser1.token, 'channel1', true);
    channelsCreateV3(authUser2.token, 'channel2', true);
    channelInviteV3(authUser1.token, channel1.channelId, authUser2.authUserId);
    expect(channelsListV3(authUser1.token)).toEqual({
      channels: [
        {
          channelId: channel1.channelId,
          name: 'channel1',
        }
      ]
    }
    );
  });

  test('user is member of multiple channels', () => {
    const authUser1 = authRegisterV3('stevenpool1@gmail.com', 'coolpassword1', 'Steve', 'Gregory');
    const authUser2 = authRegisterV3('stevoKing2@gmail.com', 'coolpassword2', 'Stevo', 'King');
    const channel1 = channelsCreateV3(authUser1.token, 'channel1', true);
    const channel2 = channelsCreateV3(authUser2.token, 'channel2', true);
    channelInviteV3(authUser1.token, channel1.channelId, authUser2.authUserId);
    expect(channelsListV3(authUser2.token)).toEqual({
      channels: [
        {
          channelId: channel1.channelId,
          name: 'channel1',
        },
        {
          channelId: channel2.channelId,
          name: 'channel2',
        }
      ]
    }
    );
  });

  test('User is not a member of any channel', () => {
    const authUser1 = authRegisterV3('stevenpool1@gmail.com', 'coolpassword1', 'Steve', 'Gregory');
    expect(channelsListV3(authUser1.token)).toEqual({ channels: [] });
  });
});

describe('Unsuccessful channel listing', () => {
  beforeEach(() => {
    clearV1();
  });

  test('authUserId is invalid - user is not existing', () => {
    const authUser1 = authRegisterV3('stevenpool123@gmail.com', 'coolpassword1', 'Steve', 'Gregory');
    expect(() => channelsListV3(authUser1.token + 100)).toThrow(Error(FORBIDDEN));
  });
});
