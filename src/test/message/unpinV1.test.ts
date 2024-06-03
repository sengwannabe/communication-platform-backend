import {
  clearV1, messagePinV1, messageUnpinV1,
  channelsCreateV3, channelInviteV3, channelMessagesV3, channelLeaveV2, messageSendV2,
  dmCreateV2, dmMessagesV2, dmLeaveV2, messageSenddmV2,
  BAD_REQUEST, FORBIDDEN,
} from '../wrapper';
import {
  generateThreeUsers,
  AuthUser, messagesData,
} from '../testHelper';

let users: AuthUser[];
let message: { messageId: number };

const tests = [
  {
    source: 'Channel',
    setupScript: setupChannel,
    checkScript: channelMessagesV3,
    leaveScript: channelLeaveV2,
  },
  {
    source: 'DM',
    setupScript: setupDM,
    checkScript: dmMessagesV2,
    leaveScript: dmLeaveV2,
  },
];

function setupChannel() {
  const channel = channelsCreateV3(users[1].token, 'Channel 0', true);
  channelInviteV3(users[1].token, channel.channelId, users[0].authUserId);
  channelInviteV3(users[1].token, channel.channelId, users[2].authUserId);
  message = messageSendV2(users[1].token, channel.channelId, messagesData[0]);
  return channel.channelId;
}

function setupDM() {
  const dm = dmCreateV2(users[1].token, [users[0].authUserId, users[2].authUserId]);
  message = messageSenddmV2(users[1].token, dm.dmId, messagesData[0]);
  return dm.dmId;
}

beforeEach(() => {
  clearV1();
  users = generateThreeUsers();
});

describe.each(tests)('Expected Cases', ({ setupScript, checkScript }) => {
  test('Local owner unpins', () => {
    const chatId = setupScript();
    messagePinV1(users[1].token, message.messageId);
    expect(messageUnpinV1(users[1].token, message.messageId)).toStrictEqual({});
    expect(checkScript(users[1].token, chatId, 0)).toStrictEqual({
      messages: [
        {
          messageId: message.messageId,
          uId: users[1].authUserId,
          message: messagesData[0],
          timeSent: expect.any(Number),
          reacts: expect.anything(),
          isPinned: false,
        },
      ],
      start: 0,
      end: -1,
    });
  });

  test('Global owner unpins', () => {
    const chatId = setupScript();
    messagePinV1(users[1].token, message.messageId);
    expect(messageUnpinV1(users[0].token, message.messageId)).toStrictEqual({});
    expect(checkScript(users[1].token, chatId, 0)).toStrictEqual({
      messages: [
        {
          messageId: message.messageId,
          uId: users[1].authUserId,
          message: messagesData[0],
          timeSent: expect.any(Number),
          reacts: expect.anything(),
          isPinned: false,
        },
      ],
      start: 0,
      end: -1,
    });
  });
});

describe.each(tests)('Error Cases', ({ setupScript, checkScript, leaveScript }) => {
  test('invalid token', () => {
    const chatId = setupScript();
    messagePinV1(users[1].token, message.messageId);
    expect(() => messageUnpinV1('', message.messageId)).toThrow(Error(FORBIDDEN));
    expect(checkScript(users[1].token, chatId, 0)).toStrictEqual({
      messages: [
        {
          messageId: message.messageId,
          uId: users[1].authUserId,
          message: messagesData[0],
          timeSent: expect.any(Number),
          reacts: expect.anything(),
          isPinned: true,
        },
      ],
      start: 0,
      end: -1,
    });
  });

  test('messageId does not refer to a valid message', () => {
    setupScript();
    expect(() => messageUnpinV1(users[1].token, message.messageId + 1)).toThrow(Error(BAD_REQUEST));
  });

  test('messageId in a chat the user is not a part of', () => {
    const chatId = setupScript();
    leaveScript(users[0].token, chatId);
    messagePinV1(users[1].token, message.messageId);
    expect(() => messageUnpinV1(users[0].token, message.messageId)).toThrow(Error(BAD_REQUEST));
    expect(checkScript(users[1].token, chatId, 0)).toStrictEqual({
      messages: [
        {
          messageId: message.messageId,
          uId: users[1].authUserId,
          message: messagesData[0],
          timeSent: expect.any(Number),
          reacts: expect.anything(),
          isPinned: true,
        },
      ],
      start: 0,
      end: -1,
    });
  });

  test('message in a chat does not contain a pin from the user', () => {
    const chatId = setupScript();
    expect(() => messageUnpinV1(users[1].token, message.messageId)).toThrow(Error(BAD_REQUEST));
    expect(checkScript(users[1].token, chatId, 0)).toStrictEqual({
      messages: [
        {
          messageId: message.messageId,
          uId: users[1].authUserId,
          message: messagesData[0],
          timeSent: expect.any(Number),
          reacts: expect.anything(),
          isPinned: false,
        },
      ],
      start: 0,
      end: -1,
    });
  });

  test('Attempting to double unpin a message', () => {
    const chatId = setupScript();
    messagePinV1(users[1].token, message.messageId);
    expect(() => messageUnpinV1(users[1].token, message.messageId)).not.toThrow();
    expect(() => messageUnpinV1(users[1].token, message.messageId)).toThrow(Error(BAD_REQUEST));
    expect(checkScript(users[1].token, chatId, 0)).toStrictEqual({
      messages: [
        {
          messageId: message.messageId,
          uId: users[1].authUserId,
          message: messagesData[0],
          timeSent: expect.any(Number),
          reacts: expect.anything(),
          isPinned: false,
        },
      ],
      start: 0,
      end: -1,
    });
  });

  test('messageId in a chat the user does not have permissions in', () => {
    const chatId = setupScript();
    messagePinV1(users[1].token, message.messageId);
    expect(() => messageUnpinV1(users[2].token, message.messageId)).toThrow(Error(FORBIDDEN));
    expect(checkScript(users[1].token, chatId, 0)).toStrictEqual({
      messages: [
        {
          messageId: message.messageId,
          uId: users[1].authUserId,
          message: messagesData[0],
          timeSent: expect.any(Number),
          reacts: expect.anything(),
          isPinned: true,
        },
      ],
      start: 0,
      end: -1,
    });
  });
});
