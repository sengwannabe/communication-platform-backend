import {
  clearV1, messageReactV1, messageUnreactV1,
  channelsCreateV3, channelInviteV3, channelMessagesV3, channelLeaveV2, messageSendV2,
  dmCreateV2, dmMessagesV2, dmLeaveV2, messageSenddmV2,
  BAD_REQUEST, FORBIDDEN,
} from '../wrapper';
import {
  generateThreeUsers,
  AuthUser, messagesData,
} from '../testHelper';

const VALID_REACT_ID = 1;
const INVALID_REACT_ID = 0;

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
  channelInviteV3(users[1].token, channel.channelId, users[2].authUserId);
  message = messageSendV2(users[1].token, channel.channelId, messagesData[0]);
  return channel.channelId;
}

function setupDM() {
  const dm = dmCreateV2(users[1].token, [users[2].authUserId]);
  message = messageSenddmV2(users[1].token, dm.dmId, messagesData[0]);
  return dm.dmId;
}

beforeEach(() => {
  clearV1();
  users = generateThreeUsers();
});

describe.each(tests)('Expected Cases - $source', ({ setupScript, checkScript }) => {
  test('Same user reacts and unreacts', () => {
    const chatId = setupScript();
    expect(messageReactV1(users[1].token, message.messageId, VALID_REACT_ID)).toStrictEqual({});
    expect(messageUnreactV1(users[1].token, message.messageId, VALID_REACT_ID)).toStrictEqual({});
    expect(checkScript(users[1].token, chatId, 0)).toStrictEqual({
      messages: [
        {
          messageId: message.messageId,
          uId: users[1].authUserId,
          message: messagesData[0],
          timeSent: expect.any(Number),
          reacts: [{
            reactId: 1,
            uIds: [],
            isThisUserReacted: false,
          }],
          isPinned: false,
        },
      ],
      start: 0,
      end: -1,
    });
  });

  test('Both users react: main user unreacts', () => {
    const chatId = setupScript();
    expect(messageReactV1(users[1].token, message.messageId, VALID_REACT_ID)).toStrictEqual({});
    expect(messageReactV1(users[2].token, message.messageId, VALID_REACT_ID)).toStrictEqual({});
    expect(messageUnreactV1(users[1].token, message.messageId, VALID_REACT_ID)).toStrictEqual({});
    expect(checkScript(users[1].token, chatId, 0)).toStrictEqual({
      messages: [
        {
          messageId: message.messageId,
          uId: users[1].authUserId,
          message: messagesData[0],
          timeSent: expect.any(Number),
          reacts: [{
            reactId: 1,
            uIds: [
              users[2].authUserId,
            ],
            isThisUserReacted: false,
          }],
          isPinned: false,
        },
      ],
      start: 0,
      end: -1,
    });
  });

  test('Both users react: other user unreacts', () => {
    const chatId = setupScript();
    expect(messageReactV1(users[1].token, message.messageId, VALID_REACT_ID)).toStrictEqual({});
    expect(messageReactV1(users[2].token, message.messageId, VALID_REACT_ID)).toStrictEqual({});
    expect(messageUnreactV1(users[2].token, message.messageId, VALID_REACT_ID)).toStrictEqual({});
    expect(checkScript(users[1].token, chatId, 0)).toStrictEqual({
      messages: [
        {
          messageId: message.messageId,
          uId: users[1].authUserId,
          message: messagesData[0],
          timeSent: expect.any(Number),
          reacts: [{
            reactId: 1,
            uIds: [
              users[1].authUserId,
            ],
            isThisUserReacted: true,
          }],
          isPinned: false,
        },
      ],
      start: 0,
      end: -1,
    });
  });
});

describe.each(tests)('Error Cases - $source', ({ setupScript, checkScript, leaveScript }) => {
  test('Invalid Token', () => {
    setupScript();
    expect(() => messageUnreactV1('', message.messageId, VALID_REACT_ID)).toThrow(Error(FORBIDDEN));
  });

  test('messageId does not refer to a valid message', () => {
    setupScript();
    expect(() => messageUnreactV1(users[1].token, message.messageId + 1, VALID_REACT_ID)).toThrow(Error(BAD_REQUEST));
  });

  test('messageId in a chat the user is not a part of', () => {
    const chatId = setupScript();
    expect(() => messageUnreactV1(users[0].token, message.messageId, VALID_REACT_ID)).toThrow(Error(BAD_REQUEST));
    expect(checkScript(users[1].token, chatId, 0)).toStrictEqual({
      messages: [
        {
          messageId: message.messageId,
          uId: users[1].authUserId,
          message: messagesData[0],
          timeSent: expect.any(Number),
          reacts: [{
            reactId: 1,
            uIds: [],
            isThisUserReacted: false,
          }],
          isPinned: false,
        },
      ],
      start: 0,
      end: -1,
    });
  });

  test('messageId in a chat the user has left', () => {
    const chatId = setupScript();
    messageReactV1(users[2].token, message.messageId, VALID_REACT_ID);
    leaveScript(users[2].token, chatId);
    expect(() => messageUnreactV1(users[2].token, message.messageId, VALID_REACT_ID)).toThrow(Error(BAD_REQUEST));
    expect(checkScript(users[1].token, chatId, 0)).toStrictEqual({
      messages: [
        {
          messageId: message.messageId,
          uId: users[1].authUserId,
          message: messagesData[0],
          timeSent: expect.any(Number),
          reacts: [{
            reactId: 1,
            uIds: [
              users[2].authUserId,
            ],
            isThisUserReacted: false,
          }],
          isPinned: false,
        },
      ],
      start: 0,
      end: -1,
    });
  });

  test('reactId is not a valid react ID', () => {
    const chatId = setupScript();
    expect(() => messageUnreactV1(users[1].token, message.messageId, INVALID_REACT_ID)).toThrow(Error(BAD_REQUEST));
    expect(checkScript(users[1].token, chatId, 0)).toStrictEqual({
      messages: [
        {
          messageId: message.messageId,
          uId: users[1].authUserId,
          message: messagesData[0],
          timeSent: expect.any(Number),
          reacts: [{
            reactId: 1,
            uIds: [],
            isThisUserReacted: false,
          }],
          isPinned: false,
        },
      ],
      start: 0,
      end: -1,
    });
  });

  test('message in a chat does not contain a react from the user', () => {
    const chatId = setupScript();
    expect(() => messageUnreactV1(users[1].token, message.messageId, VALID_REACT_ID)).toThrow(Error(BAD_REQUEST));
    expect(checkScript(users[1].token, chatId, 0)).toStrictEqual({
      messages: [
        {
          messageId: message.messageId,
          uId: users[1].authUserId,
          message: messagesData[0],
          timeSent: expect.any(Number),
          reacts: [{
            reactId: 1,
            uIds: [],
            isThisUserReacted: false,
          }],
          isPinned: false,
        },
      ],
      start: 0,
      end: -1,
    });
  });

  test('attempting to unreact twice from a message in a chat', () => {
    const chatId = setupScript();
    messageReactV1(users[1].token, message.messageId, VALID_REACT_ID);
    expect(() => messageUnreactV1(users[1].token, message.messageId, VALID_REACT_ID)).not.toThrow();
    expect(() => messageUnreactV1(users[1].token, message.messageId, VALID_REACT_ID)).toThrow(Error(BAD_REQUEST));
    expect(checkScript(users[1].token, chatId, 0)).toStrictEqual({
      messages: [
        {
          messageId: message.messageId,
          uId: users[1].authUserId,
          message: messagesData[0],
          timeSent: expect.any(Number),
          reacts: [{
            reactId: 1,
            uIds: [],
            isThisUserReacted: false,
          }],
          isPinned: false,
        },
      ],
      start: 0,
      end: -1,
    });
  });
});
