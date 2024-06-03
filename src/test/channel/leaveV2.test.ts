import { DEFAULT_PROFILE_URL } from '../testHelper';
import { clearV1, authRegisterV3, channelDetailsV3, channelJoinV3, channelLeaveV2, channelMessagesV3, messageSendV2, channelsCreateV3, channelsListAllV3, BAD_REQUEST, FORBIDDEN } from '../wrapper';

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

describe('Successful channel leave', () => {
  beforeEach(() => {
    clearV1();
  });

  test('User leaves channel with multiple members', () => {
    const users = createUsers();
    const channel = channelsCreateV3(users.user2.token, 'Channel', true);
    channelJoinV3(users.user3.token, channel.channelId);
    channelJoinV3(users.user1.token, channel.channelId);
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
          users.user1.id,
        ])
      }
    );
    expect(channelLeaveV2(users.user3.token, channel.channelId)).toStrictEqual({});
    expect(channelDetailsV3(users.user2.token, channel.channelId)).toStrictEqual(
      {
        name: 'Channel',
        isPublic: true,
        ownerMembers:
          [
            users.user2.id,
          ],
        allMembers: expect.toIncludeSameMembers(
          [
            users.user2.id,
            users.user1.id,
          ])
      }
    );
    expect(() => channelDetailsV3(users.user3.token, channel.channelId)).toThrow(Error(FORBIDDEN));
  });

  test('User leaves channel and was the only member', () => {
    const users = createUsers();
    const channel = channelsCreateV3(users.user2.token, 'Channel', true);
    expect(channelLeaveV2(users.user2.token, channel.channelId)).toStrictEqual({});
    expect(() => channelDetailsV3(users.user2.token, channel.channelId)).toThrow(Error(FORBIDDEN));
    expect(channelsListAllV3(users.user1.token)).toEqual({
      channels: [
        {
          channelId: channel.channelId,
          name: 'Channel',
        },
      ]
    });
  });

  test('User leaves channel and their messages remain', () => {
    const users = createUsers();
    const channel = channelsCreateV3(users.user2.token, 'Channel', true);
    channelJoinV3(users.user3.token, channel.channelId);
    channelJoinV3(users.user1.token, channel.channelId);
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
          users.user1.id,
          users.user3.id,
        ])
      }
    );
    const message1 = messageSendV2(users.user2.token, channel.channelId, 'Please leave no2');
    const message2 = messageSendV2(users.user3.token, channel.channelId, 'Bye people!');
    expect(channelLeaveV2(users.user3.token, channel.channelId)).toStrictEqual({});
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
            message: 'Bye people!',
            timeSent: expect.any(Number),
            reacts: expect.anything(),
            isPinned: false,
          },
          {
            messageId: message1.messageId,
            uId: users.user2.authUserId,
            message: 'Please leave no2',
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
});

describe('Unsuccessful channel leave', () => {
  beforeEach(() => {
    clearV1();
  });
  test('Invalid token', () => {
    const users = createUsers();
    const channel = channelsCreateV3(users.user2.token, 'Channel', true);
    expect(() => channelLeaveV2(users.user2.token + 'no', channel.channelId)).toThrow(Error(FORBIDDEN));
  });

  test('Invalid channelId', () => {
    const users = createUsers();
    const channel = channelsCreateV3(users.user2.token, 'Channel', true);
    expect(() => channelLeaveV2(users.user2.token, channel.channelId + 22)).toThrow(Error(BAD_REQUEST));
  });

  test('Not a member of the channel', () => {
    const users = createUsers();
    const channel = channelsCreateV3(users.user2.token, 'Channel', true);
    expect(() => channelLeaveV2(users.user1.token, channel.channelId)).toThrow(Error(FORBIDDEN));
  });
});
