import { clearV1, authRegisterV3, dmCreateV2, dmMessagesV2, messageSendLaterDmV1, BAD_REQUEST, FORBIDDEN, dmRemoveV2, messageReactV1 } from '../wrapper';

let authUser1: { token: string; authUserId: number; }, dm1: { dmId: number; };

const sleep = (delayTime: number) => new Promise(callback => setTimeout(callback, delayTime));

describe('Successful messageSendLaterDmV1 cases', () => {
  beforeEach(() => {
    clearV1();
    authUser1 = authRegisterV3('myemail@gmail.com', 'password', 'my', 'email');
    dm1 = dmCreateV2(authUser1.token, []);
  });

  test('Valid inputs, message is sent, 1 character, not present in dmMessages and cannot messageReact, but can after', async () => {
    const laterMessage = messageSendLaterDmV1(authUser1.token, dm1.dmId, 'a', Date.now() + 500);
    expect(laterMessage).toStrictEqual(
      {
        messageId: laterMessage.messageId
      }
    );
    expect(() => messageReactV1(authUser1.token, laterMessage.messageId, 1)).toThrow(Error(BAD_REQUEST));
    expect(dmMessagesV2(authUser1.token, dm1.dmId, 0)).toStrictEqual(
      {
        messages: [],
        start: 0,
        end: -1
      }
    );
    await sleep(500);
    expect(messageReactV1(authUser1.token, laterMessage.messageId, 1)).toStrictEqual({});
    expect(dmMessagesV2(authUser1.token, dm1.dmId, 0)).toStrictEqual(
      {
        messages: [
          {
            messageId: laterMessage.messageId,
            uId: authUser1.authUserId,
            message: 'a',
            timeSent: expect.any(Number),
            reacts: [{
              reactId: 1,
              uIds: [authUser1.authUserId],
              isThisUserReacted: true,
            }],

            isPinned: false,
          },
        ],
        start: 0,
        end: -1
      }
    );
  });

  test('Valid inputs, message is sent, 1000 character, cannot dmMessages in the time period, but can after', async () => {
    const a = 'a';
    const str = a.repeat(1000);
    const laterMessage = messageSendLaterDmV1(authUser1.token, dm1.dmId, str, Date.now() + 500);
    expect(laterMessage).toStrictEqual(
      {
        messageId: laterMessage.messageId
      }
    );
    expect(() => messageReactV1(authUser1.token, laterMessage.messageId, 1)).toThrow(Error(BAD_REQUEST));
    expect(dmMessagesV2(authUser1.token, dm1.dmId, 0)).toStrictEqual(
      {
        messages: [],
        start: 0,
        end: -1
      }
    );
    await sleep(500);
    expect(messageReactV1(authUser1.token, laterMessage.messageId, 1)).toStrictEqual({});
    expect(dmMessagesV2(authUser1.token, dm1.dmId, 0)).toStrictEqual(
      {
        messages: [
          {
            messageId: laterMessage.messageId,
            uId: authUser1.authUserId,
            message: str,
            timeSent: expect.any(Number),
            reacts: [{
              reactId: 1,
              uIds: [authUser1.authUserId],
              isThisUserReacted: true,
            }],
            isPinned: false,
          }
        ],
        start: 0,
        end: -1
      }
    );
  });

  test('Valid inputs, message is sent, dmRemove during time period, message is not sent', async () => {
    const laterMessage = messageSendLaterDmV1(authUser1.token, dm1.dmId, 'hello', Date.now() + 500);
    expect(laterMessage).toStrictEqual(
      {
        messageId: laterMessage.messageId
      }
    );
    expect(dmMessagesV2(authUser1.token, dm1.dmId, 0)).toStrictEqual(
      {
        messages: [],
        start: 0,
        end: -1
      }
    );
    dmRemoveV2(authUser1.token, dm1.dmId);
    await sleep(500);
    expect(() => dmMessagesV2(authUser1.token, dm1.dmId, 0)).toThrow(Error(BAD_REQUEST));
  });
});

describe('Error 400 messageSendLaterDmV1 cases', () => {
  beforeEach(() => {
    clearV1();
    authUser1 = authRegisterV3('myemail@gmail.com', 'password', 'my', 'email');
    dm1 = dmCreateV2(authUser1.token, []);
  });

  test('dmId is invalid', () => {
    expect(() => messageSendLaterDmV1(authUser1.token, dm1.dmId + 1000, 'hello', Date.now() + 500)).toThrow(Error(BAD_REQUEST));
  });

  test('Message length is < 1', () => {
    expect(() => messageSendLaterDmV1(authUser1.token, dm1.dmId, '', Date.now() + 500)).toThrow(Error(BAD_REQUEST));
  });

  test('Message length is > 1000', () => {
    const error = 'error ';
    const errorMessage = error.repeat(1000);
    expect(() => messageSendLaterDmV1(authUser1.token, dm1.dmId, errorMessage, Date.now() + 500)).toThrow(Error(BAD_REQUEST));
  });

  test('timeSent is in the past', () => {
    expect(() => messageSendLaterDmV1(authUser1.token, dm1.dmId, 'hello', Date.now() - 500)).toThrow(Error(BAD_REQUEST));
  });
});

describe('Error 403 messageSendLaterV1 cases', () => {
  beforeEach(() => {
    clearV1();
    authUser1 = authRegisterV3('myemail@gmail.com', 'password', 'my', 'email');
    dm1 = dmCreateV2(authUser1.token, []);
  });

  test('dmId is valid but authUser not a member', () => {
    const authUser2 = authRegisterV3('mycode@gmail.com', 'passcode', 'myer', 'store');
    expect(() => messageSendLaterDmV1(authUser2.token, dm1.dmId, 'hello', Date.now() + 500)).toThrow(Error(FORBIDDEN));
  });

  test('Invalid token', () => {
    expect(() => messageSendLaterDmV1(authUser1.token + 'wR0n6', dm1.dmId, 'hello', Date.now() + 500)).toThrow(Error(FORBIDDEN));
  });
});
