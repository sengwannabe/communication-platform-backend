import {
  clearV1, authRegisterV3, channelInviteV3,
  channelsCreateV3, channelDetailsV3,
  BAD_REQUEST, FORBIDDEN,
} from '../wrapper';
import {
  generateThreeUsers,
  usersData, AuthUser,
} from '../testHelper';

let users: AuthUser[] = [];
let channel: { channelId: number };

beforeEach(() => {
  clearV1();
  users = generateThreeUsers();
  channel = channelsCreateV3(users[1].token, 'Channel 0', true);
});

describe('Expected Cases', () => {
  test('One Channel, One Member', () => {
    expect(channelInviteV3(users[1].token, channel.channelId, users[2].authUserId)).toStrictEqual({});
    expect(channelDetailsV3(users[1].token, channel.channelId)).toStrictEqual({
      name: 'Channel 0',
      isPublic: true,
      ownerMembers: [
        {
          uId: users[1].authUserId,
          handleStr: usersData[1].handleStr,
          email: usersData[1].email,
          nameFirst: usersData[1].nameFirst,
          nameLast: usersData[1].nameLast,
          profileImgUrl: usersData[1].profileImgUrl,
        },
      ],
      allMembers: expect.toIncludeSameMembers([
        {
          uId: users[1].authUserId,
          handleStr: usersData[1].handleStr,
          email: usersData[1].email,
          nameFirst: usersData[1].nameFirst,
          nameLast: usersData[1].nameLast,
          profileImgUrl: usersData[1].profileImgUrl,
        },
        {
          uId: users[2].authUserId,
          handleStr: usersData[2].handleStr,
          email: usersData[2].email,
          nameFirst: usersData[2].nameFirst,
          nameLast: usersData[2].nameLast,
          profileImgUrl: usersData[2].profileImgUrl,
        },
      ]),
    });
  });

  test('Multiple Channels, One Member', () => {
    channelsCreateV3(users[0].token, 'Channel 1', true);
    expect(channelInviteV3(users[1].token, channel.channelId, users[0].authUserId)).toStrictEqual({});
    const details = channelDetailsV3(users[1].token, channel.channelId);
    expect(details).toStrictEqual({
      name: 'Channel 0',
      isPublic: true,
      ownerMembers: [
        {
          uId: users[1].authUserId,
          handleStr: usersData[1].handleStr,
          email: usersData[1].email,
          nameFirst: usersData[1].nameFirst,
          nameLast: usersData[1].nameLast,
          profileImgUrl: usersData[1].profileImgUrl,
        },
      ],
      allMembers: expect.toIncludeSameMembers([
        {
          uId: users[0].authUserId,
          handleStr: usersData[0].handleStr,
          email: usersData[0].email,
          nameFirst: usersData[0].nameFirst,
          nameLast: usersData[0].nameLast,
          profileImgUrl: usersData[0].profileImgUrl,
        },
        {
          uId: users[1].authUserId,
          handleStr: usersData[1].handleStr,
          email: usersData[1].email,
          nameFirst: usersData[1].nameFirst,
          nameLast: usersData[1].nameLast,
          profileImgUrl: usersData[1].profileImgUrl,
        },
      ]),
    });
  });

  test('One Channel, Multiple Members', () => {
    expect(channelInviteV3(users[1].token, channel.channelId, users[2].authUserId)).toStrictEqual({});
    expect(channelInviteV3(users[2].token, channel.channelId, users[0].authUserId)).toStrictEqual({});
    expect(channelDetailsV3(users[1].token, channel.channelId)).toStrictEqual({
      name: 'Channel 0',
      isPublic: true,
      ownerMembers: [
        {
          uId: users[1].authUserId,
          handleStr: usersData[1].handleStr,
          email: usersData[1].email,
          nameFirst: usersData[1].nameFirst,
          nameLast: usersData[1].nameLast,
          profileImgUrl: usersData[1].profileImgUrl,
        },
      ],
      allMembers: expect.toIncludeSameMembers([
        {
          uId: users[0].authUserId,
          handleStr: usersData[0].handleStr,
          email: usersData[0].email,
          nameFirst: usersData[0].nameFirst,
          nameLast: usersData[0].nameLast,
          profileImgUrl: usersData[0].profileImgUrl,
        },
        {
          uId: users[1].authUserId,
          handleStr: usersData[1].handleStr,
          email: usersData[1].email,
          nameFirst: usersData[1].nameFirst,
          nameLast: usersData[1].nameLast,
          profileImgUrl: usersData[1].profileImgUrl,
        },
        {
          uId: users[2].authUserId,
          handleStr: usersData[2].handleStr,
          email: usersData[2].email,
          nameFirst: usersData[2].nameFirst,
          nameLast: usersData[2].nameLast,
          profileImgUrl: usersData[2].profileImgUrl,
        },
      ]),
    });
  });
});

describe('Error Cases', () => {
  test('Invalid channelId', () => {
    expect(() => channelInviteV3(users[1].token, channel.channelId + 1, users[2].authUserId)).toThrow(BAD_REQUEST);
  });

  test('Invalid uId', () => {
    clearV1();
    const authUser = authRegisterV3('generic@provider.com', 'ThisIsASimplePassword', 'Gen', 'Eric');
    const channel = channelsCreateV3(authUser.token, 'Channel 0', true);
    expect(() => channelInviteV3(authUser.token, channel.channelId, authUser.authUserId + 1)).toThrow(BAD_REQUEST);
  });

  test('uId is already a member', () => {
    expect(() => channelInviteV3(users[1].token, channel.channelId, users[1].authUserId)).toThrow(BAD_REQUEST);
  });

  test('authUserId is not a member', () => {
    expect(() => channelInviteV3(users[2].token, channel.channelId, users[0].authUserId)).toThrow(FORBIDDEN);
  });

  test('invalid authUserId', () => {
    const invalidToken = '';
    expect(() => channelInviteV3(invalidToken, channel.channelId, users[2].authUserId)).toThrow(FORBIDDEN);
  });
});
