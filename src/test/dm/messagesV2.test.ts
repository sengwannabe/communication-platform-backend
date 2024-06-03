import { clearV1, authRegisterV3, dmCreateV2, dmMessagesV2, messageSenddmV2, BAD_REQUEST, FORBIDDEN } from '../wrapper';

let authUser1: { token: string; authUserId: number; }, dm1: { dmId: number; };

describe('Successful dmMessagesV2 tests', () => {
  beforeEach(() => {
    clearV1();
    authUser1 = authRegisterV3('myemail@gmail.com', 'password', 'my', 'email');
    dm1 = dmCreateV2(authUser1.token, []);
  });

  test('Inputted valid token, dmId and start value, no messages', () => {
    expect(dmMessagesV2(authUser1.token, dm1.dmId, 0)).toStrictEqual(
      {
        messages: [],
        start: 0,
        end: -1
      }
    );
  });

  test('Inputted valid token, dmId and start value, more than 1 message and start is index 0', () => {
    const message1 = messageSenddmV2(authUser1.token, dm1.dmId, 'Hello');
    const message2 = messageSenddmV2(authUser1.token, dm1.dmId, 'You there?');
    const message3 = messageSenddmV2(authUser1.token, dm1.dmId, 'Goodbye');
    expect(dmMessagesV2(authUser1.token, dm1.dmId, 0)).toStrictEqual(
      {
        messages: [
          {
            messageId: message3.messageId,
            uId: authUser1.authUserId,
            message: 'Goodbye',
            timeSent: expect.any(Number),
            reacts: expect.anything(),
            isPinned: false,
          },
          {
            messageId: message2.messageId,
            uId: authUser1.authUserId,
            message: 'You there?',
            timeSent: expect.any(Number),
            reacts: expect.anything(),
            isPinned: false,
          },
          {
            messageId: message1.messageId,
            uId: authUser1.authUserId,
            message: 'Hello',
            timeSent: expect.any(Number),
            reacts: expect.anything(),
            isPinned: false,
          }
        ],
        start: 0,
        end: -1
      }
    );
  });

  test('Inputted valid token, dmId and start value, more than 1 message and start is not index of 0', () => {
    const message1 = messageSenddmV2(authUser1.token, dm1.dmId, 'Hello');
    const message2 = messageSenddmV2(authUser1.token, dm1.dmId, 'You there?');
    messageSenddmV2(authUser1.token, dm1.dmId, 'Goodbye');
    messageSenddmV2(authUser1.token, dm1.dmId, 'Still here?');
    expect(dmMessagesV2(authUser1.token, dm1.dmId, 2)).toStrictEqual(
      {
        messages: [
          {
            messageId: message2.messageId,
            uId: authUser1.authUserId,
            message: 'You there?',
            timeSent: expect.any(Number),
            reacts: expect.anything(),
            isPinned: false,
          },
          {
            messageId: message1.messageId,
            uId: authUser1.authUserId,
            message: 'Hello',
            timeSent: expect.any(Number),
            reacts: expect.anything(),
            isPinned: false,
          }
        ],
        start: 2,
        end: -1
      }
    );
  });

  test('Inputted valid token, dmId and start value, more than 50 message and end should not be 0', () => {
    for (let i = 0; i < 55; i++) {
      messageSenddmV2(authUser1.token, dm1.dmId, `${i}`);
    }
    const dmMessages = dmMessagesV2(authUser1.token, dm1.dmId, 0);
    expect(dmMessages.start).toBe(0);
    expect(dmMessages.end).toBe(50);
    for (let i = 0; i < 50; i++) {
      expect(dmMessages.messages[i]).toStrictEqual(
        {
          messageId: expect.any(Number),
          uId: authUser1.authUserId,
          message: `${54 - i}`,
          timeSent: expect.any(Number),
          reacts: expect.anything(),
          isPinned: false,
        }
      );
    }
  });
});

describe('Error dmMessagesV2 tests', () => {
  beforeEach(() => {
    clearV1();
    authUser1 = authRegisterV3('myemail@gmail.com', 'password', 'my', 'email');
    dm1 = dmCreateV2(authUser1.token, []);
  });

  test('invalid dmId inputted', () => {
    expect(() => dmMessagesV2(authUser1.token, dm1.dmId + 100, 0)).toThrow(Error(BAD_REQUEST));
  });

  test('start value is greater than the total number of messages in the dm', () => {
    expect(() => dmMessagesV2(authUser1.token, dm1.dmId, 1000000)).toThrow(Error(BAD_REQUEST));
  });

  test('dmId is valid but authUser is not a member of the dm', () => {
    const authUser2 = authRegisterV3('mycode@gmail.com', 'passcode', 'myer', 'store');
    expect(() => dmMessagesV2(authUser2.token, dm1.dmId, 0)).toThrow(Error(FORBIDDEN));
  });

  test('authUser token is invalid', () => {
    expect(() => dmMessagesV2(authUser1.token + 'wR0n6', dm1.dmId, 0)).toThrow(Error(FORBIDDEN));
  });
});
