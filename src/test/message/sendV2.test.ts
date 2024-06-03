import {
  clearV1, authRegisterV3, messageSendV2, messageSenddmV2,
  channelsCreateV3, dmCreateV2,
  BAD_REQUEST, FORBIDDEN
} from '../wrapper';
import {
  lorem1000char, lorem1001char,
  AuthUser
} from '../testHelper';

/**
 * NOTE!
 * This file tests both message/send/v2 and message/senddm/v2,
 * as both functions have near identical logic.
 */

/**
 * Number of messages to generate when checking for uniqueness.
 * Larger numbers exponentially increase how long it takes for these tests to be completed.
 */
const SIZE = 10;

let user1: AuthUser;

function setupChannel() {
  const channel = channelsCreateV3(user1.token, 'Channel 0', true);
  return channel.channelId;
}

function setupDM() {
  const dm = dmCreateV2(user1.token, []);
  return dm.dmId;
}

const tests = [
  {
    source: 'Channel',
    setupScript: setupChannel,
    sendScript: messageSendV2,
  },
  {
    source: 'DM',
    setupScript: setupDM,
    sendScript: messageSenddmV2,
  },
];

beforeEach(() => {
  clearV1();
  user1 = authRegisterV3('global@owner.com', 'PassPass', 'Global', 'Owner');
});

describe.each(tests)('Expected Cases - $source', ({ setupScript, sendScript }) => {
  test('One $source, One Message', () => {
    const chatId = setupScript();
    expect(sendScript(user1.token, chatId, 'Sample message')).toStrictEqual({ messageId: expect.any(Number) });
  });

  test('$source, 1 character long message', () => {
    const chatId = setupScript();
    expect(sendScript(user1.token, chatId, '1')).toStrictEqual({ messageId: expect.any(Number) });
  });

  test('$source, 1000 character long message', () => {
    const chatId = setupScript();
    expect(sendScript(user1.token, chatId, lorem1000char())).toStrictEqual({ messageId: expect.any(Number) });
  });
});

describe.each(tests)('Unique Id Tests - $source', ({ setupScript, sendScript }) => {
  test('One $source', () => {
    const chatId = setupScript();
    const messageIds = [];
    for (let i = 0; i < SIZE; i++) {
      messageIds.push(sendScript(user1.token, chatId, 'Comment'));
    }
    const messageSet = new Set(messageIds);
    expect(messageSet.size).toStrictEqual(messageIds.length);
  });

  test('Multiple $source', () => {
    const chatId1 = setupScript();
    const chatId2 = setupScript();
    const messageIds = [];
    for (let i = 0; i < SIZE; i++) {
      messageIds.push(sendScript(user1.token, chatId1, 'Comment'));
      messageIds.push(sendScript(user1.token, chatId2, 'Comment'));
    }
    const messageSet = new Set(messageIds);
    expect(messageSet.size).toStrictEqual(messageIds.length);
  });
});

describe.each(tests)('Error Cases', ({ setupScript, sendScript }) => {
  test('Invalid token, sending in $source', () => {
    const chatId = setupScript();
    expect(() => sendScript(user1.token + 'no', chatId, 'Bad token')).toThrow(Error(FORBIDDEN));
  });

  test('Invalid $source', () => {
    const chatId = setupScript();
    expect(() => sendScript(user1.token, chatId + 1, 'Bad chat')).toThrow(Error(BAD_REQUEST));
  });

  test('Message too short, sending in $source', () => {
    const chatId = setupScript();
    expect(() => sendScript(user1.token, chatId, '')).toThrow(Error(BAD_REQUEST));
  });

  test('Message too long, sending in $source', () => {
    const chatId = setupScript();
    expect(() => sendScript(user1.token, chatId, lorem1001char())).toThrow(Error(BAD_REQUEST));
  });

  test('authUser is not a member of the $source', () => {
    const chatId = setupScript();
    const user2 = authRegisterV3('someone@else.com', 'ThisIsAlsoSimple', 'Ay', 'Nuther');
    expect(() => sendScript(user2.token, chatId, 'I am not a member')).toThrow(Error(FORBIDDEN));
  });
});
