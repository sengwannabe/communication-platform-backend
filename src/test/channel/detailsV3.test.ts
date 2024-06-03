import { DEFAULT_PROFILE_URL } from '../testHelper';
import { clearV1, authRegisterV3, channelDetailsV3, channelsCreateV3, BAD_REQUEST, FORBIDDEN } from '../wrapper';

let authUser1: { token: string; authUserId: number; }, channel1: { channelId: number; }, channelDetails: any;

describe('Successful channelDetailsV3 tests', () => {
  beforeEach(() => {
    clearV1();
    authUser1 = authRegisterV3('myemail@gmail.com', 'password', 'my', 'email');
    channel1 = channelsCreateV3(authUser1.token, 'mychannel', true);
    channelDetails = channelDetailsV3(authUser1.token, channel1.channelId);
  });

  test('Valid authUser token and channelId inputted', () => {
    expect(channelDetails).toStrictEqual(
      {
        name: 'mychannel',
        isPublic: true,
        ownerMembers: expect.toIncludeSameMembers(
          [
            {
              uId: authUser1.authUserId,
              handleStr: 'myemail',
              email: 'myemail@gmail.com',
              nameFirst: 'my',
              nameLast: 'email',
              profileImgUrl: DEFAULT_PROFILE_URL,
            }
          ]
        ),
        allMembers: expect.toIncludeSameMembers(
          [
            {
              uId: authUser1.authUserId,
              handleStr: 'myemail',
              email: 'myemail@gmail.com',
              nameFirst: 'my',
              nameLast: 'email',
              profileImgUrl: DEFAULT_PROFILE_URL,
            }
          ]
        )
      }
    );
  });
});

describe('Error channelDetailsV3 tests', () => {
  beforeEach(() => {
    clearV1();
    authUser1 = authRegisterV3('myemail@gmail.com', 'password', 'my', 'email');
    channel1 = channelsCreateV3(authUser1.token, 'mychannel', true);
  });

  test('invalid token inputted', () => {
    expect(() => channelDetailsV3(authUser1.token + 'wR0n6', channel1.channelId)).toThrow(Error(FORBIDDEN));
  });

  test('Invalid channelId does not refer to a channel', () => {
    expect(() => channelDetailsV3(authUser1.token, channel1.channelId + 10)).toThrow(Error(BAD_REQUEST));
  });

  test('ChannelId is valid but authUser is not a member of the channel', () => {
    const authUser2 = authRegisterV3('mycode@gmail.com', 'passcode', 'myer', 'store');
    expect(() => channelDetailsV3(authUser2.token, channel1.channelId)).toThrow(Error(FORBIDDEN));
  });
});
