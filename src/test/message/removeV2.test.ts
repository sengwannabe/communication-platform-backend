import {
  clearV1, authRegisterV3, messageRemoveV2,
  channelInviteV3, channelMessagesV3, channelsCreateV3, messageSendV2,
  dmCreateV2, dmMessagesV2, messageSenddmV2,
  BAD_REQUEST, FORBIDDEN
} from '../wrapper';
import {
  generateThreeUsers,
  AuthUser, messagesData,
} from '../testHelper';

let users: AuthUser[];

function setupChannel(): number {
  const channel = channelsCreateV3(users[1].token, 'Channel 0', true);
  channelInviteV3(users[1].token, channel.channelId, users[0].authUserId);
  channelInviteV3(users[1].token, channel.channelId, users[2].authUserId);
  return channel.channelId;
}

function setupDM(): number {
  const dm = dmCreateV2(users[1].token, [users[0].authUserId, users[2].authUserId]);
  return dm.dmId;
}

const tests = [
  {
    source: 'Channel',
    setupScript: setupChannel,
    sendScript: messageSendV2,
    checkScript: channelMessagesV3,
  },
  {
    source: 'DM',
    setupScript: setupDM,
    sendScript: messageSenddmV2,
    checkScript: dmMessagesV2,
  },
];

beforeEach(() => {
  clearV1();
  users = generateThreeUsers();
});

describe.each(tests)('Expected Cases - $source', ({ setupScript, sendScript, checkScript }) => {
  test('Single deleted message in $source', () => {
    const chatId = setupScript();
    const message = sendScript(users[1].token, chatId, messagesData[0]);
    expect(messageRemoveV2(users[1].token, message.messageId)).toStrictEqual({});
    expect(checkScript(users[1].token, chatId, 0)).toStrictEqual({
      messages: [],
      start: 0,
      end: -1,
    });
  });

  test('Multiple messages, first message deleted in $source', () => {
    const chatId = setupScript();
    const message1 = sendScript(users[1].token, chatId, messagesData[0]);
    const message2 = sendScript(users[1].token, chatId, messagesData[1]);
    expect(messageRemoveV2(users[1].token, message1.messageId)).toStrictEqual({});
    expect(checkScript(users[1].token, chatId, 0)).toStrictEqual({
      messages: [
        {
          messageId: message2.messageId,
          uId: users[1].authUserId,
          message: messagesData[1],
          timeSent: expect.any(Number),
          reacts: expect.anything(),
          isPinned: false,
        },
      ],
      start: 0,
      end: -1,
    });
  });

  test('Multiple messages, last message deleted in $source', () => {
    const chatId = setupScript();
    const message1 = sendScript(users[1].token, chatId, messagesData[0]);
    const message2 = sendScript(users[1].token, chatId, messagesData[1]);
    expect(messageRemoveV2(users[1].token, message2.messageId)).toStrictEqual({});
    expect(checkScript(users[1].token, chatId, 0)).toStrictEqual({
      messages: [
        {
          messageId: message1.messageId,
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

  test('Multiple messages, middle message deleted in $source', () => {
    const chatId = setupScript();
    const message1 = sendScript(users[0].token, chatId, messagesData[0]);
    const message2 = sendScript(users[1].token, chatId, messagesData[1]);
    const message3 = sendScript(users[2].token, chatId, messagesData[2]);
    expect(messageRemoveV2(users[1].token, message2.messageId)).toStrictEqual({});
    expect(checkScript(users[1].token, chatId, 0)).toStrictEqual({
      messages: [
        {
          messageId: message3.messageId,
          uId: users[2].authUserId,
          message: messagesData[2],
          timeSent: expect.any(Number),
          reacts: expect.anything(),
          isPinned: false,
        },
        {
          messageId: message1.messageId,
          uId: users[0].authUserId,
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

describe.each(tests)('Owner Cases - $source', ({ setupScript, sendScript, checkScript }) => {
  test('User is owner of $source', () => {
    const chatId = setupScript();
    const message = sendScript(users[2].token, chatId, messagesData[0]);
    expect(messageRemoveV2(users[1].token, message.messageId)).toStrictEqual({});
    expect(checkScript(users[2].token, chatId, 0)).toStrictEqual({
      messages: [],
      start: 0,
      end: -1,
    });
  });

  test('User is global owner in $source', () => {
    const chatId = setupScript();
    const message = sendScript(users[1].token, chatId, messagesData[0]);
    expect(messageRemoveV2(users[0].token, message.messageId)).toStrictEqual({});
    expect(checkScript(users[0].token, chatId, 0)).toStrictEqual({
      messages: [],
      start: 0,
      end: -1,
    });
  });
});

describe.each(tests)('Error Cases - $source', ({ setupScript, sendScript, checkScript }) => {
  test('messageId does not refer to a valid message within a $source that the authorised user has joined', () => {
    const chatId = setupScript();
    expect(() => messageRemoveV2(users[1].token, 0)).toThrow(Error(BAD_REQUEST));
    expect(checkScript(users[1].token, chatId, 0)).toStrictEqual({
      messages: [],
      start: 0,
      end: -1,
    });
  });

  test('user is not a member of the $source', () => {
    const chatId = setupScript();
    const message = sendScript(users[1].token, chatId, messagesData[0]);
    const nonMember = authRegisterV3('another@person.com', 'Passssss', 'Another', 'Eric');
    expect(() => messageRemoveV2(nonMember.token, message.messageId)).toThrow(Error(BAD_REQUEST));
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

  test('authUser is not the sender and does not have owner permissions in the $source', () => {
    const chatId = setupScript();
    const message = sendScript(users[1].token, chatId, messagesData[0]);
    expect(() => messageRemoveV2(users[2].token, message.messageId)).toThrow(Error(FORBIDDEN));
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

  test('Invalid Token in $source', () => {
    const chatId = setupScript();
    const message = sendScript(users[1].token, chatId, messagesData[0]);
    expect(() => messageRemoveV2('', message.messageId)).toThrow(Error(FORBIDDEN));
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
