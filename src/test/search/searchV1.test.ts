import { clearV1, authRegisterV3, channelsCreateV3, dmCreateV2, messageSendV2, messageSenddmV2, searchV1, BAD_REQUEST, FORBIDDEN } from '../wrapper';

let authUser1: { token: string; authUserId: number; }, channel1: { channelId: number; }, dm1: { dmId: number; }, channelMessage1: { messageId: number }, dmMessage1: { messageId: number };

describe('Successful searchV1 cases', () => {
  beforeEach(() => {
    clearV1();
    authUser1 = authRegisterV3('myemail@gmail.com', 'password', 'my', 'email');
    channel1 = channelsCreateV3(authUser1.token, 'mychannel', true);
    dm1 = dmCreateV2(authUser1.token, []);
    channelMessage1 = messageSendV2(authUser1.token, channel1.channelId, 'Hello, ciao');
    dmMessage1 = messageSenddmV2(authUser1.token, dm1.dmId, 'Goodbye and ciao');
  });

  test('Valid parameters and array of relevant messages returned, one character', () => {
    const messages = searchV1(authUser1.token, 'i');
    expect(messages).toStrictEqual(
      {
        messages: expect.toIncludeSameMembers(
          [
            {
              messageId: dmMessage1.messageId,
              uId: authUser1.authUserId,
              message: 'Goodbye and ciao',
              timeSent: expect.any(Number),
              reacts: expect.anything(),
              isPinned: false,
            },
            {
              messageId: channelMessage1.messageId,
              uId: authUser1.authUserId,
              message: 'Hello, ciao',
              timeSent: expect.any(Number),
              reacts: expect.anything(),
              isPinned: false,
            }
          ]
        )
      }
    );
  });

  test('Valid parameters and array of relevant messages returned, 999 character', () => {
    const a = 'a';
    const str = a.repeat(999);
    const channelMessage2 = messageSendV2(authUser1.token, channel1.channelId, str);
    const messages = searchV1(authUser1.token, str);
    expect(messages).toStrictEqual(
      {
        messages: expect.toIncludeSameMembers(
          [
            {
              messageId: channelMessage2.messageId,
              uId: authUser1.authUserId,
              message: str,
              timeSent: expect.any(Number),
              reacts: expect.anything(),
              isPinned: false,
            }
          ]
        )
      }
    );
  });

  test('Valid parameters and array of relevant messages returned, case-insensitive', () => {
    const messages = searchV1(authUser1.token, 'aNd CiAo');
    expect(messages).toStrictEqual(
      {
        messages: expect.toIncludeSameMembers(
          [
            {
              messageId: dmMessage1.messageId,
              uId: authUser1.authUserId,
              message: 'Goodbye and ciao',
              timeSent: expect.any(Number),
              reacts: expect.anything(),
              isPinned: false,
            }
          ]
        )
      }
    );
  });

  test('Valid parameters and array of relevant messages returned, messages do not include queryStr', () => {
    const messages = searchV1(authUser1.token, 'COMP1531');
    expect(messages).toStrictEqual(
      {
        messages: expect.toIncludeSameMembers(
          []
        )
      }
    );
  });

  test('Valid parameters and array of relevant messages returned, authUser is not in the channel of the contained queryStr', () => {
    const authUser2 = authRegisterV3('mycode@gmail.com', 'passcode', 'myer', 'store');
    const dm2 = dmCreateV2(authUser2.token, []);
    messageSenddmV2(authUser2.token, dm2.dmId, 'COMP1531');
    const messages = searchV1(authUser1.token, 'COMP1531');
    expect(messages).toStrictEqual(
      {
        messages: expect.toIncludeSameMembers(
          []
        )
      }
    );
  });
});

describe('Error searchV1 cases', () => {
  beforeEach(() => {
    clearV1();
    authUser1 = authRegisterV3('myemail@gmail.com', 'password', 'my', 'email');
  });

  test('queryString is < 1, 400 error', () => {
    expect(() => searchV1(authUser1.token, '')).toThrow(Error(BAD_REQUEST));
  });

  test('queryString is > 1000 characters, 400 error', () => {
    const error = 'error ';
    const errorMessage = error.repeat(1005);
    expect(() => searchV1(authUser1.token, errorMessage)).toThrow(Error(BAD_REQUEST));
  });

  test('Invalid authUser, 403 error', () => {
    expect(() => searchV1(authUser1.token + 'wR0n6', 'ciao')).toThrow(Error(FORBIDDEN));
  });
});
