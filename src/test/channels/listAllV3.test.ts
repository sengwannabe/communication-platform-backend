import { FORBIDDEN, clearV1, authRegisterV3, channelsCreateV3, channelsListAllV3 } from '../wrapper';

// Test case for channelsListAllV3
// - Successful channel creation
// - Test name has valid length
// - Test token is valid

describe('Successful channel listAll', () => {
  beforeEach(() => {
    clearV1();
  });

  test('One user created public and private channels', () => {
    const authUser1 = authRegisterV3('stevenpool1@gmail.com', 'coolpassword1', 'Steve', 'Gregory');
    const channel1 = channelsCreateV3(authUser1.token, 'channel1', true);
    const channel2 = channelsCreateV3(authUser1.token, 'channel2', true);
    const channel3 = channelsCreateV3(authUser1.token, 'channel3', false);
    expect(channelsListAllV3(authUser1.token)).toEqual({
      channels: [
        {
          channelId: channel1.channelId,
          name: 'channel1',
        },
        {
          channelId: channel2.channelId,
          name: 'channel2',
        },
        {
          channelId: channel3.channelId,
          name: 'channel3',
        },
      ]
    }
    );
  });

  test('One user created all public channels', () => {
    const authUser1 = authRegisterV3('stevenpool1@gmail.com', 'coolpassword1', 'Steve', 'Gregory');
    const channel1 = channelsCreateV3(authUser1.token, 'channel1', true);
    const channel2 = channelsCreateV3(authUser1.token, 'channel2', true);
    const channel3 = channelsCreateV3(authUser1.token, 'channel3', true);
    expect(channelsListAllV3(authUser1.token)).toEqual({
      channels: [
        {
          channelId: channel1.channelId,
          name: 'channel1',
        },
        {
          channelId: channel2.channelId,
          name: 'channel2',
        },
        {
          channelId: channel3.channelId,
          name: 'channel3',
        },
      ]
    }
    );
  });

  test('Multiple users created public and private channels', () => {
    const authUser1 = authRegisterV3('stevenpool1@gmail.com', 'coolpassword1', 'Steve', 'Gregory');
    const authUser2 = authRegisterV3('stevoking@gmail.com', 'coolpassword12', 'Stevo', 'King');
    const channel1 = channelsCreateV3(authUser1.token, 'channel1', true);
    const channel2 = channelsCreateV3(authUser1.token, 'channel2', true);
    const channel3 = channelsCreateV3(authUser1.token, 'channel3', false);
    const channel4 = channelsCreateV3(authUser2.token, 'channel4', true);
    const channel5 = channelsCreateV3(authUser2.token, 'channel5', false);
    expect(channelsListAllV3(authUser1.token)).toEqual({
      channels: [
        {
          channelId: channel1.channelId,
          name: 'channel1',
        },
        {
          channelId: channel2.channelId,
          name: 'channel2',
        },
        {
          channelId: channel3.channelId,
          name: 'channel3',
        },
        {
          channelId: channel4.channelId,
          name: 'channel4',
        },
        {
          channelId: channel5.channelId,
          name: 'channel5',
        }
      ]
    }
    );
  });

  test('No channel created', () => {
    const authUser1 = authRegisterV3('stevenpool1@gmail.com', 'coolpassword1', 'Steve', 'Gregory');
    expect(channelsListAllV3(authUser1.token)).toEqual({ channels: [] });
  });
});

describe('Unsuccessful channel listAll', () => {
  beforeEach(() => {
    clearV1();
  });

  test('token is invalid - user is not existing', () => {
    const authUser1 = authRegisterV3('stevenpool123@gmail.com', 'coolpassword1', 'Steve', 'Gregory');
    channelsCreateV3(authUser1.token, 'channel1', true);
    expect(() => channelsListAllV3(authUser1.token + 100)).toThrow(Error(FORBIDDEN));
  });
});
