import { clearV1, authRegisterV3, channelsCreateV3, messageSendLaterV1, BAD_REQUEST, FORBIDDEN, channelMessagesV3, messageEditV2 } from '../wrapper';

let authUser1: { token: string; authUserId: number; }, channel1: { channelId: number; };

const sleep = (delayTime: number) => new Promise(callback => setTimeout(callback, delayTime));

describe('Successful messageSendLaterV1 cases', () => {
  beforeEach(() => {
    clearV1();
    authUser1 = authRegisterV3('myemail@gmail.com', 'password', 'my', 'email');
    channel1 = channelsCreateV3(authUser1.token, 'mychannel', true);
  });

  test('Valid inputs, message is sent, 1 character, not present in channelMessages and cannot messageEdit, but can after', async () => {
    const laterMessage = messageSendLaterV1(authUser1.token, channel1.channelId, 'a', Date.now() + 500);
    expect(laterMessage).toStrictEqual(
      {
        messageId: laterMessage.messageId
      }
    );
    expect(() => messageEditV2(authUser1.token, laterMessage.messageId, 'b')).toThrow(Error(BAD_REQUEST));
    expect(channelMessagesV3(authUser1.token, channel1.channelId, 0)).toStrictEqual(
      {
        messages: [],
        start: 0,
        end: -1
      }
    );
    await sleep(500);
    expect(messageEditV2(authUser1.token, laterMessage.messageId, 'b')).toStrictEqual({});
    expect(channelMessagesV3(authUser1.token, channel1.channelId, 0)).toStrictEqual(
      {
        messages: [
          {
            messageId: laterMessage.messageId,
            uId: authUser1.authUserId,
            message: 'b',
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

  test('Valid inputs, message is sent, 1000 character, not present in channelMessages and cannot messageEdit, but can after', async () => {
    const a = 'a';
    const str = a.repeat(1000);
    const laterMessage = messageSendLaterV1(authUser1.token, channel1.channelId, 'a', Date.now() + 500);
    expect(laterMessage).toStrictEqual(
      {
        messageId: laterMessage.messageId
      }
    );
    expect(() => messageEditV2(authUser1.token, laterMessage.messageId, str)).toThrow(Error(BAD_REQUEST));
    expect(channelMessagesV3(authUser1.token, channel1.channelId, 0)).toStrictEqual(
      {
        messages: [],
        start: 0,
        end: -1
      }
    );
    await sleep(500);
    expect(messageEditV2(authUser1.token, laterMessage.messageId, str)).toStrictEqual({});
    expect(channelMessagesV3(authUser1.token, channel1.channelId, 0)).toStrictEqual(
      {
        messages: [
          {
            messageId: laterMessage.messageId,
            uId: authUser1.authUserId,
            message: str,
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
});

describe('Error 400 messageSendLaterV1 cases', () => {
  beforeEach(() => {
    clearV1();
    authUser1 = authRegisterV3('myemail@gmail.com', 'password', 'my', 'email');
    channel1 = channelsCreateV3(authUser1.token, 'mychannel', true);
  });

  test('channelId is invalid', () => {
    expect(() => messageSendLaterV1(authUser1.token, channel1.channelId + 1000, 'hello', Date.now() + 500)).toThrow(Error(BAD_REQUEST));
  });

  test('Message length is < 1', () => {
    expect(() => messageSendLaterV1(authUser1.token, channel1.channelId, '', Date.now() + 500)).toThrow(Error(BAD_REQUEST));
  });

  test('Message length is > 1000', () => {
    const error = 'error ';
    const errorMessage = error.repeat(1005);
    expect(() => messageSendLaterV1(authUser1.token, channel1.channelId, errorMessage, Date.now() + 500)).toThrow(Error(BAD_REQUEST));
  });

  test('timeSent is in the past', () => {
    expect(() => messageSendLaterV1(authUser1.token, channel1.channelId, 'hello', Date.now() - 1000)).toThrow(Error(BAD_REQUEST));
  });
});

describe('Error 403 messageSendLaterV1 cases', () => {
  beforeEach(() => {
    clearV1();
    authUser1 = authRegisterV3('myemail@gmail.com', 'password', 'my', 'email');
    channel1 = channelsCreateV3(authUser1.token, 'mychannel', true);
  });

  test('Invalid authUser token', () => {
    expect(() => messageSendLaterV1(authUser1.token + 'wR0n6', channel1.channelId, 'hello', Date.now() + 500)).toThrow(Error(FORBIDDEN));
  });

  test('authUser is not part of the channel', () => {
    const authUser2 = authRegisterV3('mycode@gmail.com', 'passcode', 'myer', 'store');
    expect(() => messageSendLaterV1(authUser2.token, channel1.channelId, 'hello', Date.now() + 500)).toThrow(Error(FORBIDDEN));
  });
});
