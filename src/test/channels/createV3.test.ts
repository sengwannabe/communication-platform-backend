import { BAD_REQUEST, FORBIDDEN, clearV1, authRegisterV3, channelsCreateV3, channelsListAllV3 } from '../wrapper';

describe('Successful channelsCreateV3 test', () => {
  beforeEach(() => {
    clearV1();
  });

  test('Successful channel creation', () => {
    const authUser1 = authRegisterV3('stevenpool123@gmail.com', 'coolpassword1', 'Steve', 'Gregory');
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
});

describe('Unsuccessful tests', () => {
  beforeEach(() => {
    clearV1();
  });
  test('Name has less than 1 character', () => {
    const authUser1 = authRegisterV3('stevenpool123@gmail.com', 'coolpassword1', 'Steve', 'Gregory');
    expect(() => channelsCreateV3(authUser1.token, '', true)).toThrow(Error(BAD_REQUEST));
  });

  test('Name has more than 20 characters', () => {
    const authUser1 = authRegisterV3('stevenpool123@gmail.com', 'coolpassword1', 'Steve', 'Gregory');
    expect(() => channelsCreateV3(authUser1.token, 'NameHasMoreThan20Characters', true)).toThrow(Error(BAD_REQUEST));
  });

  test('authUserId is invalid', () => {
    const authUser1 = authRegisterV3('stevenpool123@gmail.com', 'coolpassword1', 'Steve', 'Gregory');
    expect(() => channelsCreateV3(authUser1.token + 100, 'ChannelName', true)).toThrow(Error(FORBIDDEN));
  });
});
