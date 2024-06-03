import { DEFAULT_PROFILE_URL } from '../testHelper';
import { clearV1, authRegisterV3, channelAddownerV2, channelDetailsV3, channelJoinV3, channelsCreateV3, BAD_REQUEST, FORBIDDEN } from '../wrapper';

function createUsers() {
  const user1 = authRegisterV3('wowzer@gmail.com', '123456', 'Global', 'Owner');
  const user2 = authRegisterV3('wowzer1@gmail.com', '123456', 'first', 'one');
  const user3 = authRegisterV3('wowzer2@gmail.com', '123456', 'second', '2');
  user1.id = {
    uId: user1.authUserId,
    handleStr: 'globalowner',
    email: 'wowzer@gmail.com',
    nameFirst: 'Global',
    nameLast: 'Owner',
    profileImgUrl: DEFAULT_PROFILE_URL,
  };
  user2.id = {
    uId: user2.authUserId,
    handleStr: 'firstone',
    email: 'wowzer1@gmail.com',
    nameFirst: 'first',
    nameLast: 'one',
    profileImgUrl: DEFAULT_PROFILE_URL,
  };
  user3.id = {
    uId: user3.authUserId,
    handleStr: 'second2',
    email: 'wowzer2@gmail.com',
    nameFirst: 'second',
    nameLast: '2',
    profileImgUrl: DEFAULT_PROFILE_URL,
  };
  return {
    user1: user1,
    user2: user2,
    user3: user3,
  };
}

describe('Successful owner added', () => {
  beforeEach(() => {
    clearV1();
  });

  test('Owner successfully added by owner member', () => {
    const users = createUsers();
    const channel = channelsCreateV3(users.user2.token, 'Channel', true);
    channelJoinV3(users.user3.token, channel.channelId);
    expect(channelAddownerV2(users.user2.token, channel.channelId, users.user3.authUserId)).toStrictEqual({});
    expect(channelDetailsV3(users.user3.token, channel.channelId)).toStrictEqual(
      {
        name: 'Channel',
        isPublic: true,
        ownerMembers: expect.toIncludeSameMembers([
          users.user2.id,
          users.user3.id,
        ]),
        allMembers: expect.toIncludeSameMembers([
          users.user2.id,
          users.user3.id,
        ])
      }
    );
  });

  test('Owner successfully added by global owner NOT in owner members', () => {
    const users = createUsers();
    const channel = channelsCreateV3(users.user2.token, 'Channel', true);
    channelJoinV3(users.user1.token, channel.channelId);
    channelJoinV3(users.user3.token, channel.channelId);
    expect(channelAddownerV2(users.user1.token, channel.channelId, users.user3.authUserId)).toStrictEqual({});
    expect(channelDetailsV3(users.user3.token, channel.channelId)).toStrictEqual(
      {
        name: 'Channel',
        isPublic: true,
        ownerMembers: expect.toIncludeSameMembers([
          users.user2.id,
          users.user3.id,
        ]),
        allMembers: expect.toIncludeSameMembers([
          users.user1.id,
          users.user2.id,
          users.user3.id,
        ])
      }
    );
  });
});

describe('Unsuccessful owners added', () => {
  beforeEach(() => {
    clearV1();
  });
  test('Invalid uId - not part of channel', () => {
    const users = createUsers();
    const channel = channelsCreateV3(users.user2.token, 'Channel', true);
    channelJoinV3(users.user3.token, channel.channelId);
    expect(() => channelAddownerV2(users.user2.token, channel.channelId, users.user1.authUserId)).toThrow(Error(BAD_REQUEST));
    expect(channelDetailsV3(users.user3.token, channel.channelId)).toStrictEqual(
      {
        name: 'Channel',
        isPublic: true,
        ownerMembers:
          [
            users.user2.id,
          ],
        allMembers: expect.toIncludeSameMembers([
          users.user2.id,
          users.user3.id,
        ])
      }
    );
  });

  test('Invalid uId - already owner of channel', () => {
    const users = createUsers();
    const channel = channelsCreateV3(users.user2.token, 'Channel', true);
    channelJoinV3(users.user3.token, channel.channelId);
    expect(channelAddownerV2(users.user2.token, channel.channelId, users.user3.authUserId)).toStrictEqual({});
    expect(() => channelAddownerV2(users.user2.token, channel.channelId, users.user3.authUserId)).toThrow(Error(BAD_REQUEST));
  });

  test('Invalid permission - token does not have owner permission', () => {
    const users = createUsers();
    const channel = channelsCreateV3(users.user2.token, 'Channel', true);
    channelJoinV3(users.user3.token, channel.channelId);
    expect(() => channelAddownerV2(users.user3.token, channel.channelId, users.user3.authUserId)).toThrow(Error(FORBIDDEN));
    expect(channelDetailsV3(users.user3.token, channel.channelId)).toStrictEqual(
      {
        name: 'Channel',
        isPublic: true,
        ownerMembers:
          [
            users.user2.id,
          ],
        allMembers: expect.toIncludeSameMembers([
          users.user2.id,
          users.user3.id,
        ])
      }
    );
  });
  test('Invalid channelId - channel does not exist', () => {
    const users = createUsers();
    expect(() => channelAddownerV2(users.user3.token, 123, users.user3.authUserId)).toThrow(Error(BAD_REQUEST));
  });
  test('Invalid token - token does not exist', () => {
    const users = createUsers();
    const channel = channelsCreateV3(users.user2.token, 'Channel', true);
    channelJoinV3(users.user3.token, channel.channelId);
    expect(() => channelAddownerV2(users.user2.token + 'no', channel.channelId, users.user3.authUserId)).toThrow(Error(FORBIDDEN));
  });
  test('Invalid uId - uId does not exist', () => {
    const users = createUsers();
    const channel = channelsCreateV3(users.user2.token, 'Channel', true);
    expect(() => channelAddownerV2(users.user2.token, channel.channelId, 2222)).toThrow(Error(BAD_REQUEST));
  });
  test('Invalid authUserId - authUserId not in channel', () => {
    const users = createUsers();
    const channel = channelsCreateV3(users.user2.token, 'Channel', true);
    channelJoinV3(users.user3.token, channel.channelId);
    expect(() => channelAddownerV2(users.user1.token, channel.channelId, users.user3.authUserId)).toThrow(Error(FORBIDDEN));
  });
});
