import { clearV1, authRegisterV3, channelJoinV3, channelMessagesV3, channelsCreateV3, messageSendV2, BAD_REQUEST, FORBIDDEN } from '../wrapper';

describe('channelMessagesV3 Succesfully function tests', () => {
  beforeEach(() => {
    clearV1();
  });

  test('successfully getting channel messages when empty', () => {
    const authUserId = authRegisterV3('testing@testingmeail.com', 'C!1omplexPassword', 'Jack', 'Brenann');
    const channelId = channelsCreateV3(authUserId.token, 'test_channel', true);
    const start = 0;
    const channelMessages = channelMessagesV3(authUserId.token, channelId.channelId, start);
    expect(channelMessages).toStrictEqual(
      {
        messages: [],
        start: 0,
        end: -1,
      }
    );
  });

  test('successfully getting channel messages where start = 0', () => {
    const authUserId = authRegisterV3('testing@testingmeail.com', 'C!1omplexPassword', 'Jack', 'Brenann');
    const channelId = channelsCreateV3(authUserId.token, 'test_channel', true);
    const messageId = messageSendV2(authUserId.token, channelId.channelId, 'hi!');
    const start = 0;
    const channelMessages = channelMessagesV3(authUserId.token, channelId.channelId, start);
    expect(channelMessages).toStrictEqual(
      {
        messages: [
          {
            messageId: messageId.messageId,
            uId: authUserId.authUserId,
            message: 'hi!',
            timeSent: expect.any(Number),
            reacts: expect.anything(),
            isPinned: false,
          }
        ],
        start: 0,
        end: -1,
      }
    );
  });

  test('successfully getting channel messages where start = 0 and several messages', () => {
    const authUserId = authRegisterV3('testing@testingmeail.com', 'C!1omplexPassword', 'Jack', 'Brenann');
    const channelId = channelsCreateV3(authUserId.token, 'test_channel', true);
    const messageId = messageSendV2(authUserId.token, channelId.channelId, 'hi!');
    const messageId2 = messageSendV2(authUserId.token, channelId.channelId, 'hi1!');
    const messageId3 = messageSendV2(authUserId.token, channelId.channelId, 'hi2!');
    const messageId4 = messageSendV2(authUserId.token, channelId.channelId, 'hi3!');
    const start = 0;
    const channelMessages = channelMessagesV3(authUserId.token, channelId.channelId, start);
    expect(channelMessages).toStrictEqual(
      {
        messages: [
          {
            messageId: messageId4.messageId,
            uId: authUserId.authUserId,
            message: 'hi3!',
            timeSent: expect.any(Number),
            reacts: expect.anything(),
            isPinned: false,
          },
          {
            messageId: messageId3.messageId,
            uId: authUserId.authUserId,
            message: 'hi2!',
            timeSent: expect.any(Number),
            reacts: expect.anything(),
            isPinned: false,
          },
          {
            messageId: messageId2.messageId,
            uId: authUserId.authUserId,
            message: 'hi1!',
            timeSent: expect.any(Number),
            reacts: expect.anything(),
            isPinned: false,
          },
          {
            messageId: messageId.messageId,
            uId: authUserId.authUserId,
            message: 'hi!',
            timeSent: expect.any(Number),
            reacts: expect.anything(),
            isPinned: false,
          }
        ],
        start: 0,
        end: -1,
      }
    );
  });

  test('successfully getting channel messages where start = 1 and several messages + several users', () => {
    const authUserId = authRegisterV3('testing@testingmeail.com', 'C!1omplexPassword', 'Jack', 'Brenann');
    const channelId = channelsCreateV3(authUserId.token, 'test_channel', true);
    const messageId = messageSendV2(authUserId.token, channelId.channelId, 'hi!');
    const authUserId2 = authRegisterV3('testing2@testingmeail.com', 'C!1omp2lexPassword', 'Jaack', 'Bbrenann');
    channelJoinV3(authUserId2.token, channelId.channelId);
    const messageId2 = messageSendV2(authUserId2.token, channelId.channelId, 'hi1!');
    const authUserId3 = authRegisterV3('testinasdasdg@testingmeail.com', 'C!1omplexPassword', 'Jaaack', 'Breenann');
    channelJoinV3(authUserId3.token, channelId.channelId);
    const messageId3 = messageSendV2(authUserId3.token, channelId.channelId, 'hi2!');
    const authUserId4 = authRegisterV3('testiasdasdng@testingmeail.com', 'C!1omplexPassword', 'Jacasdk', 'Brenaasd');
    channelJoinV3(authUserId4.token, channelId.channelId);
    messageSendV2(authUserId4.token, channelId.channelId, 'hi3!');
    const start = 1;
    const channelMessages = channelMessagesV3(authUserId.token, channelId.channelId, start);
    expect(channelMessages).toStrictEqual(
      {
        messages: [
          {
            messageId: messageId3.messageId,
            uId: authUserId3.authUserId,
            message: 'hi2!',
            timeSent: expect.any(Number),
            reacts: expect.anything(),
            isPinned: false,
          },
          {
            messageId: messageId2.messageId,
            uId: authUserId2.authUserId,
            message: 'hi1!',
            timeSent: expect.any(Number),
            reacts: expect.anything(),
            isPinned: false,
          },
          {
            messageId: messageId.messageId,
            uId: authUserId.authUserId,
            message: 'hi!',
            timeSent: expect.any(Number),
            reacts: expect.anything(),
            isPinned: false,
          }
        ],
        start: 1,
        end: -1,
      }
    );
  });

  test('successfully getting channel messages where start = 0 and > 50 messages', () => {
    const authUserId = authRegisterV3('testing@testingmeail.com', 'C!1omplexPassword', 'Jack', 'Brenann');
    const channelId = channelsCreateV3(authUserId.token, 'test_channel', true);
    for (let i = 0; i < 65; i++) {
      messageSendV2(authUserId.token, channelId.channelId, 'hi!');
    }
    const start = 0;
    const channelMessages = channelMessagesV3(authUserId.token, channelId.channelId, start);
    expect(channelMessages).toStrictEqual(
      expect.objectContaining({
        messages: expect.anything(),
        start: 0,
        end: 50,
      })
    );
  });
});

describe('channelMessagesV3 Error Cases', () => {
  beforeEach(() => {
    clearV1();
  });

  test('Testing for invalid AuthUser id', () => {
    const user1 = authRegisterV3('testing@testingmeail.com', 'C!1omplexPassword', 'Jack', 'Brenann');
    const user1Channel = channelsCreateV3(user1.token, 'test_channel', true);
    const user2 = user1.authUserId + 1;
    expect(() => channelMessagesV3(user2, user1Channel.channelId, 0)).toThrowError(FORBIDDEN);
  });

  test('Testing for channelid that does not refer to a valid channel', () => {
    const invalidChannel = 17;
    const user1 = authRegisterV3('testing@testingmeail.com', 'C!1omplexPassword', 'Jack', 'Brenann');
    expect(() => channelMessagesV3(user1.token, invalidChannel, 0)).toThrowError(BAD_REQUEST);
  });

  test('Testing for valid channelid but user is not a valid member of the channel', () => {
    const user1 = authRegisterV3('testing@testingmeail.com', 'C!1omplexPassword', 'Jack', 'Brenann');
    const user1Channel = channelsCreateV3(user1.token, 'test_channel', true);
    const user2 = authRegisterV3('testingv2@email2.com', 'Com23plxPass', 'Myant', 'Koram');
    expect(() => channelMessagesV3(user2.token, user1Channel.channelId, 0)).toThrowError(FORBIDDEN);
  });

  test('Testing for when start is greater then the total number of messages in the channel', () => {
    const user1 = authRegisterV3('testing@testingmeail.com', 'C!1omplexPassword', 'Jack', 'Brenann');
    const user1Channel = channelsCreateV3(user1.token, 'test_channel', true);
    expect(() => channelMessagesV3(user1.token, user1Channel.channelId, 2)).toThrowError(BAD_REQUEST);
  });
});
