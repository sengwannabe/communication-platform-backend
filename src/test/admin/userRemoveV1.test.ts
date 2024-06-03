import { DEFAULT_PROFILE_URL } from '../testHelper';
import {
  clearV1, authRegisterV3, channelDetailsV3, channelJoinV3, userProfileV3, usersAllV2,
  channelMessagesV3, messageSendV2, channelsCreateV3, BAD_REQUEST, FORBIDDEN, userRemoveV1,
  dmCreateV2, dmDetailsV2, dmMessagesV2, messageSenddmV2, authLoginV2, channelAddownerV2
} from '../wrapper';

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

describe('Successfully removed a user', () => {
  beforeEach(() => {
    clearV1();
  });

  test('User removed: basic case', () => {
    const users = createUsers();
    expect(usersAllV2(users.user1.token)).toStrictEqual({
      users: expect.toIncludeSameMembers([
        users.user2.id,
        users.user1.id,
        users.user3.id
      ])
    });
    expect(userRemoveV1(users.user1.token, users.user3.authUserId)).toStrictEqual({});
    expect(() => authLoginV2('wowzer2@gmail.com', '123456')).toThrow(Error(BAD_REQUEST));
    expect(() => userProfileV3(users.user3.token, users.user2.authUserId)).toThrow(Error(FORBIDDEN));
    expect(userProfileV3(users.user1.token, users.user3.authUserId)).toEqual({
      user: {
        uId: users.user3.authUserId,
        email: '',
        nameFirst: 'Removed',
        nameLast: 'user',
        handleStr: '',
        profileImgUrl: DEFAULT_PROFILE_URL,
      }
    });
    expect(usersAllV2(users.user1.token)).toStrictEqual({
      users: expect.toIncludeSameMembers([
        users.user2.id,
        users.user1.id,
      ])
    });
  });

  test('Removed user message still in channel but they are not', () => {
    const users = createUsers();
    const channel = channelsCreateV3(users.user2.token, 'Channel', true);
    channelsCreateV3(users.user1.token, 'Channel', true);
    channelJoinV3(users.user3.token, channel.channelId);
    channelJoinV3(users.user1.token, channel.channelId);
    channelAddownerV2(users.user2.token, channel.channelId, users.user3.authUserId);
    expect(channelDetailsV3(users.user3.token, channel.channelId)).toStrictEqual(
      {
        name: 'Channel',
        isPublic: true,
        ownerMembers:
          [
            users.user2.id,
            users.user3.id,
          ],
        allMembers: expect.toIncludeSameMembers([
          users.user2.id,
          users.user1.id,
          users.user3.id,
        ])
      }
    );
    const message1 = messageSendV2(users.user2.token, channel.channelId, 'I will kick you from Beans');
    const message2 = messageSendV2(users.user3.token, channel.channelId, 'I have bean expecting this');
    expect(userRemoveV1(users.user1.token, users.user3.authUserId)).toStrictEqual({});
    expect(channelDetailsV3(users.user2.token, channel.channelId)).toStrictEqual(
      {
        name: 'Channel',
        isPublic: true,
        ownerMembers:
          [
            users.user2.id,
          ],
        allMembers: expect.toIncludeSameMembers([
          users.user2.id,
          users.user1.id,
        ])
      }
    );
    const start = 0;
    expect(channelMessagesV3(users.user1.token, channel.channelId, start)).toStrictEqual(
      {
        messages: [
          {
            messageId: message2.messageId,
            uId: users.user3.authUserId,
            message: 'Removed user',
            timeSent: expect.any(Number),
            reacts: expect.anything(),
            isPinned: false,
          },
          {
            messageId: message1.messageId,
            uId: users.user2.authUserId,
            message: 'I will kick you from Beans',
            timeSent: expect.any(Number),
            reacts: expect.anything(),
            isPinned: false,
          },

        ],
        start: 0,
        end: -1,
      }
    );
  });

  test('Removed user message still in dm but they are not', () => {
    const users = createUsers();
    const dm = dmCreateV2(users.user1.token, [users.user2.authUserId]);
    dmCreateV2(users.user1.token, [users.user3.authUserId]);
    expect(dmDetailsV2(users.user1.token, dm.dmId)).toStrictEqual({
      name: 'firstone, globalowner',
      members: expect.toIncludeSameMembers([
        users.user2.id,
        users.user1.id,
      ])
    });
    const message1 = messageSenddmV2(users.user1.token, dm.dmId, 'You will be removed from Beans');
    const message2 = messageSenddmV2(users.user2.token, dm.dmId, 'I have bean on my best behaviour!');
    expect(userRemoveV1(users.user1.token, users.user2.authUserId)).toStrictEqual({});
    expect(dmDetailsV2(users.user1.token, dm.dmId)).toStrictEqual({
      name: 'firstone, globalowner',
      members: expect.toIncludeSameMembers([
        users.user1.id,
      ])
    });
    expect(dmMessagesV2(users.user1.token, dm.dmId, 0)).toStrictEqual(
      {
        messages: [
          {
            messageId: message2.messageId,
            uId: users.user2.authUserId,
            message: 'Removed user',
            timeSent: expect.any(Number),
            reacts: expect.anything(),
            isPinned: false,
          },
          {
            messageId: message1.messageId,
            uId: users.user1.authUserId,
            message: 'You will be removed from Beans',
            timeSent: expect.any(Number),
            reacts: expect.anything(),
            isPinned: false,
          },
        ],
        start: 0,
        end: -1
      }
    );
  });

  test('Removed user email and handlestr is reused', () => {
    const users = createUsers();
    expect(userRemoveV1(users.user1.token, users.user2.authUserId)).toStrictEqual({});
    const newUser = authRegisterV3('wowzer1@gmail.com', '123456', 'first', 'one');
    expect(userProfileV3(users.user1.token, users.user2.authUserId)).toEqual({
      user: {
        uId: users.user2.authUserId,
        email: '',
        nameFirst: 'Removed',
        nameLast: 'user',
        handleStr: '',
        profileImgUrl: DEFAULT_PROFILE_URL,
      }
    });
    expect(userProfileV3(users.user1.token, newUser.authUserId)).toEqual({
      user: {
        uId: newUser.authUserId,
        email: 'wowzer1@gmail.com',
        nameFirst: 'first',
        nameLast: 'one',
        handleStr: 'firstone',
        profileImgUrl: DEFAULT_PROFILE_URL,
      }
    });
  });
});

describe('Unsuccessful user removed', () => {
  beforeEach(() => {
    clearV1();
  });
  test('Invalid token', () => {
    const users = createUsers();
    expect(() => userRemoveV1(users.user1.token + 'no', users.user3.authUserId)).toThrow(Error(FORBIDDEN));
  });

  test('Not a global owner', () => {
    const users = createUsers();
    expect(() => userRemoveV1(users.user2.token, users.user3.authUserId)).toThrow(Error(FORBIDDEN));
  });

  test('uId does not refer to a valid user', () => {
    const users = createUsers();
    expect(() => userRemoveV1(users.user1.token, users.user2.authUserId + 1)).toThrow(Error(BAD_REQUEST));
  });

  test('uId refers to the last global owner', () => {
    const users = createUsers();
    expect(() => userRemoveV1(users.user1.token, users.user1.authUserId)).toThrow(Error(BAD_REQUEST));
  });
});
