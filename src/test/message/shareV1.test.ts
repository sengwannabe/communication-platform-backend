import { clearV1, authRegisterV3, channelsCreateV3, dmCreateV2, messageSendV2, messageSenddmV2, messageShareV1, channelMessagesV3, dmMessagesV2, BAD_REQUEST, FORBIDDEN } from '../wrapper';

let authUser1: { token: string; authUserId: number; }, channel1: { channelId: number; }, dm1: { dmId: number; }, channelMessage1: { messageId: number }, dmMessage1: { messageId: number };

describe('Succesful messageShare cases', () => {
  beforeEach(() => {
    clearV1();
    authUser1 = authRegisterV3('myemail@gmail.com', 'password', 'my', 'email');
    channel1 = channelsCreateV3(authUser1.token, 'mychannel', true);
    dm1 = dmCreateV2(authUser1.token, []);
    channelMessage1 = messageSendV2(authUser1.token, channel1.channelId, 'Hello');
    dmMessage1 = messageSenddmV2(authUser1.token, dm1.dmId, 'Goodbye');
  });

  test('Successful share to a channel, no additonal message', () => {
    const sharedMessage1 = messageShareV1(authUser1.token, dmMessage1.messageId, '', channel1.channelId, -1);
    expect(sharedMessage1).toStrictEqual(
      {
        sharedMessageId: expect.any(Number)
      }
    );
    const channel1Messages = channelMessagesV3(authUser1.token, channel1.channelId, 0);
    expect(channel1Messages).toStrictEqual(
      {
        messages: [
          {
            messageId: sharedMessage1.sharedMessageId,
            uId: authUser1.authUserId,
            message: '\n---\nGoodbye\n---',
            timeSent: expect.any(Number),
            reacts: [{
              reactId: 1,
              uIds: [],
              isThisUserReacted: false,
            }],
            isPinned: false,
          },
          {
            messageId: channelMessage1.messageId,
            uId: authUser1.authUserId,
            message: 'Hello',
            timeSent: expect.any(Number),
            reacts: [{
              reactId: 1,
              uIds: [],
              isThisUserReacted: false,
            }],
            isPinned: false,
          }
        ],
        start: 0,
        end: -1,
      }
    );
  });

  test('Successful share to a channel, additonal message, max 1000 character limit', () => {
    const a = 'a';
    const str = a.repeat(1000);
    const sharedMessage1 = messageShareV1(authUser1.token, dmMessage1.messageId, str, channel1.channelId, -1);
    expect(sharedMessage1).toStrictEqual(
      {
        sharedMessageId: expect.any(Number)
      }
    );
    const channel1Messages = channelMessagesV3(authUser1.token, channel1.channelId, 0);
    expect(channel1Messages).toStrictEqual(
      {
        messages: [
          {
            messageId: sharedMessage1.sharedMessageId,
            uId: authUser1.authUserId,
            message: `${str}\n---\nGoodbye\n---`,
            timeSent: expect.any(Number),
            reacts: [{
              reactId: 1,
              uIds: [],
              isThisUserReacted: false,
            }],
            isPinned: false,
          },
          {
            messageId: channelMessage1.messageId,
            uId: authUser1.authUserId,
            message: 'Hello',
            timeSent: expect.any(Number),
            reacts: [{
              reactId: 1,
              uIds: [],
              isThisUserReacted: false,
            }],
            isPinned: false,
          }
        ],
        start: 0,
        end: -1,
      }
    );
  });

  test('Successful share to a dm, no additonal message', () => {
    const sharedMessage1 = messageShareV1(authUser1.token, channelMessage1.messageId, '', -1, dm1.dmId);
    expect(sharedMessage1).toStrictEqual(
      {
        sharedMessageId: expect.any(Number)
      }
    );
    const dm1Messages = dmMessagesV2(authUser1.token, dm1.dmId, 0);
    expect(dm1Messages).toStrictEqual(
      {
        messages: [
          {
            messageId: sharedMessage1.sharedMessageId,
            uId: authUser1.authUserId,
            message: '\n---\nHello\n---',
            timeSent: expect.any(Number),
            reacts: [{
              reactId: 1,
              uIds: [],
              isThisUserReacted: false,
            }],
            isPinned: false,
          },
          {
            messageId: dmMessage1.messageId,
            uId: authUser1.authUserId,
            message: 'Goodbye',
            timeSent: expect.any(Number),
            reacts: [{
              reactId: 1,
              uIds: [],
              isThisUserReacted: false,
            }],
            isPinned: false,
          }
        ],
        start: 0,
        end: -1,
      }
    );
  });

  test('Successful share to a dm, and additonal message, max 1000 character limit', () => {
    const a = 'a';
    const str = a.repeat(1000);
    const sharedMessage1 = messageShareV1(authUser1.token, channelMessage1.messageId, str, -1, dm1.dmId);
    expect(sharedMessage1).toStrictEqual(
      {
        sharedMessageId: expect.any(Number)
      }
    );
    const dm1Messages = dmMessagesV2(authUser1.token, dm1.dmId, 0);
    expect(dm1Messages).toStrictEqual(
      {
        messages: [
          {
            messageId: sharedMessage1.sharedMessageId,
            uId: authUser1.authUserId,
            message: `${str}\n---\nHello\n---`,
            timeSent: expect.any(Number),
            reacts: [{
              reactId: 1,
              uIds: [],
              isThisUserReacted: false,
            }],
            isPinned: false,
          },
          {
            messageId: dmMessage1.messageId,
            uId: authUser1.authUserId,
            message: 'Goodbye',
            timeSent: expect.any(Number),
            reacts: [{
              reactId: 1,
              uIds: [],
              isThisUserReacted: false,
            }],
            isPinned: false,
          }
        ],
        start: 0,
        end: -1,
      }
    );
  });

  test('Successful share of a share', () => {
    const sharedMessage1 = messageShareV1(authUser1.token, dmMessage1.messageId, 'a', -1, dm1.dmId);
    const sharedMessage2 = messageShareV1(authUser1.token, sharedMessage1.sharedMessageId, 'b', channel1.channelId, -1);
    expect(sharedMessage2).toStrictEqual(
      {
        sharedMessageId: expect.any(Number)
      }
    );
    const channel1Messages = channelMessagesV3(authUser1.token, channel1.channelId, 0);
    expect(channel1Messages).toStrictEqual(
      {
        messages: [
          {
            messageId: sharedMessage2.sharedMessageId,
            uId: authUser1.authUserId,
            message: 'b\n---\na\n---\nGoodbye\n---\n---',
            timeSent: expect.any(Number),
            reacts: [{
              reactId: 1,
              uIds: [],
              isThisUserReacted: false,
            }],
            isPinned: false,
          },
          {
            messageId: channelMessage1.messageId,
            uId: authUser1.authUserId,
            message: 'Hello',
            timeSent: expect.any(Number),
            reacts: [{
              reactId: 1,
              uIds: [],
              isThisUserReacted: false,
            }],
            isPinned: false,
          }
        ],
        start: 0,
        end: -1,
      }
    );
  });
});

describe('Error 400 messageShareV1 cases', () => {
  beforeEach(() => {
    clearV1();
    authUser1 = authRegisterV3('myemail@gmail.com', 'password', 'my', 'email');
    channel1 = channelsCreateV3(authUser1.token, 'mychannel', true);
    dm1 = dmCreateV2(authUser1.token, []);
    channelMessage1 = messageSendV2(authUser1.token, channel1.channelId, 'Hello');
  });

  test('Both channelId and dmId are invalid', () => {
    expect(() => messageShareV1(authUser1.token, channelMessage1.messageId, '', channel1.channelId + 1000, -2)).toThrow(Error(BAD_REQUEST));
    expect(() => messageShareV1(authUser1.token, channelMessage1.messageId, '', -2, dm1.dmId + 1000)).toThrow(Error(BAD_REQUEST));
  });

  test('Neither channelId nor dmId are -1', () => {
    expect(() => messageShareV1(authUser1.token, channelMessage1.messageId, '', channel1.channelId, dm1.dmId)).toThrow(Error(BAD_REQUEST));
  });

  test('ogMessageId does not refer to a valid message within the channel/DM the user is in', () => {
    expect(() => messageShareV1(authUser1.token, channelMessage1.messageId + 1000, '', channel1.channelId, -1)).toThrow(Error(BAD_REQUEST));
  });

  test('Length of optional message > 1000', () => {
    const error = 'error ';
    const errorMessage = error.repeat(1000);
    expect(() => messageShareV1(authUser1.token, channelMessage1.messageId, errorMessage, channel1.channelId, -1)).toThrow(Error(BAD_REQUEST));
  });
});

describe('Error 403 messageShareV1 cases', () => {
  beforeEach(() => {
    clearV1();
    authUser1 = authRegisterV3('myemail@gmail.com', 'password', 'my', 'email');
    channel1 = channelsCreateV3(authUser1.token, 'mychannel', true);
    dm1 = dmCreateV2(authUser1.token, []);
    channelMessage1 = messageSendV2(authUser1.token, channel1.channelId, 'Hello');
  });

  test('Both channelId and dmId valid but authUser has not joined it', () => {
    const authUser2 = authRegisterV3('mycode@gmail.com', 'passcode', 'myer', 'store');
    expect(() => messageShareV1(authUser2.token, channelMessage1.messageId, '', channel1.channelId, -1)).toThrow(Error(FORBIDDEN));
    expect(() => messageShareV1(authUser2.token, channelMessage1.messageId, '', -1, dm1.dmId)).toThrow(Error(FORBIDDEN));
  });

  test('Invalid authUser', () => {
    expect(() => messageShareV1(authUser1.token + 'wR0n6', channelMessage1.messageId, '', -1, dm1.dmId)).toThrow(Error(FORBIDDEN));
  });
});
