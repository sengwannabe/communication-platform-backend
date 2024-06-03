import { DEFAULT_PROFILE_URL } from '../testHelper';
import { clearV1, authRegisterV3, channelDetailsV3, channelJoinV3, channelsCreateV3, BAD_REQUEST, FORBIDDEN } from '../wrapper';

let authUser1: { token: string; authUserId: number; }, authUser2: { token: string; authUserId: number; }, channel1: { channelId: number; };

describe('Successful channelJoinV3 tests', () => {
  beforeEach(() => {
    clearV1();
    authUser1 = authRegisterV3('myemail@gmail.com', 'password', 'my', 'email');
    authUser2 = authRegisterV3('mycode@gmail.com', 'passcode', 'myer', 'store');
  });

  test('Correct authUser token and channelId inputted', () => {
    const channel1 = channelsCreateV3(authUser1.token, 'mychannel', true);
    expect(channelJoinV3(authUser2.token, channel1.channelId)).toStrictEqual({});
    expect(channelDetailsV3(authUser1.token, channel1.channelId)).toStrictEqual(
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
            },
            {
              uId: authUser2.authUserId,
              handleStr: 'myerstore',
              email: 'mycode@gmail.com',
              nameFirst: 'myer',
              nameLast: 'store',
              profileImgUrl: DEFAULT_PROFILE_URL,
            }
          ]
        )
      }
    );
  });

  test('Global owners can join a private channel', () => {
    const channel2 = channelsCreateV3(authUser2.token, 'mychannel', false);
    expect(channelJoinV3(authUser1.token, channel2.channelId)).toStrictEqual({});
    expect(channelDetailsV3(authUser2.token, channel2.channelId)).toStrictEqual(
      {
        name: 'mychannel',
        isPublic: false,
        ownerMembers: expect.toIncludeSameMembers(
          [
            {
              uId: authUser2.authUserId,
              handleStr: 'myerstore',
              email: 'mycode@gmail.com',
              nameFirst: 'myer',
              nameLast: 'store',
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
            },
            {
              uId: authUser2.authUserId,
              handleStr: 'myerstore',
              email: 'mycode@gmail.com',
              nameFirst: 'myer',
              nameLast: 'store',
              profileImgUrl: DEFAULT_PROFILE_URL,
            }
          ]
        )
      }
    );
  });
});

describe('Error channelJoinV3 tests', () => {
  beforeEach(() => {
    clearV1();
    authUser1 = authRegisterV3('myemail@gmail.com', 'password', 'my', 'email');
    channel1 = channelsCreateV3(authUser1.token, 'mychannel', true);
  });

  test('invalid token inputted', () => {
    expect(() => channelJoinV3(authUser1.token + 'wR0n6', channel1.channelId)).toThrow(Error(FORBIDDEN));
  });

  test('Invalid channelId does not refer to a channel', () => {
    expect(() => channelJoinV3(authUser1.token, channel1.channelId + 10)).toThrow(Error(BAD_REQUEST));
  });

  test('ChannelId is valid but authUser is already a member of the channel', () => {
    expect(() => channelJoinV3(authUser1.token, channel1.channelId)).toThrow(Error(BAD_REQUEST));
  });

  test('ChannelId is private and authUser is not a member of the channel or a global owner', () => {
    const authUser2 = authRegisterV3('mycode@gmail.com', 'passcode', 'myer', 'store');
    const authUser3 = authRegisterV3('notglobalowner@gmail.com', 'passwordpasscode', 'not', 'global');
    const channel2 = channelsCreateV3(authUser2.token, 'myhouse', false);
    expect(() => channelJoinV3(authUser3.token, channel2.channelId)).toThrow(Error(FORBIDDEN));
  });
});
