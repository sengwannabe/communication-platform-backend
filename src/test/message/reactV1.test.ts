import {
  clearV1, messageReactV1,
  channelsCreateV3, channelInviteV3, channelMessagesV3, messageSendV2,
  dmCreateV2, dmMessagesV2, messageSenddmV2,
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
  },
  {
    source: 'DM',
    setupScript: setupDM,
    checkScript: dmMessagesV2,
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
  test('same user reacts', () => {
    const chatId = setupScript();
    expect(messageReactV1(users[1].token, message.messageId, VALID_REACT_ID)).toStrictEqual({});
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

  test('other user reacts', () => {
    const chatId = setupScript();
    expect(messageReactV1(users[2].token, message.messageId, VALID_REACT_ID)).toStrictEqual({});
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

  test('both users react', () => {
    const chatId = setupScript();
    expect(messageReactV1(users[1].token, message.messageId, VALID_REACT_ID)).toStrictEqual({});
    expect(messageReactV1(users[2].token, message.messageId, VALID_REACT_ID)).toStrictEqual({});
    expect(checkScript(users[1].token, chatId, 0)).toStrictEqual({
      messages: [
        {
          messageId: message.messageId,
          uId: users[1].authUserId,
          message: messagesData[0],
          timeSent: expect.any(Number),
          reacts: [{
            reactId: 1,
            uIds: expect.toIncludeSameMembers([
              users[1].authUserId,
              users[2].authUserId,
            ]),
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

describe.each(tests)('Error Cases - $source', ({ setupScript, checkScript }) => {
  test('Invalid Token', () => {
    setupScript();
    expect(() => messageReactV1('', message.messageId, VALID_REACT_ID)).toThrow(Error(FORBIDDEN));
  });

  test('messageId does not refer to a valid message', () => {
    setupScript();
    expect(() => messageReactV1(users[1].token, message.messageId + 1, VALID_REACT_ID)).toThrow(Error(BAD_REQUEST));
  });

  test('messageId in a chat the user is not a part of', () => {
    const chatId = setupScript();
    expect(() => messageReactV1(users[0].token, message.messageId, VALID_REACT_ID)).toThrow(Error(BAD_REQUEST));
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

  test('reactId is not a valid react ID', () => {
    const chatId = setupScript();
    expect(() => messageReactV1(users[1].token, message.messageId, INVALID_REACT_ID)).toThrow(Error(BAD_REQUEST));
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

  test('message in a chat already contains a react from the user', () => {
    const chatId = setupScript();
    expect(() => messageReactV1(users[1].token, message.messageId, VALID_REACT_ID)).not.toThrow();
    expect(() => messageReactV1(users[1].token, message.messageId, VALID_REACT_ID)).toThrow(Error(BAD_REQUEST));
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
