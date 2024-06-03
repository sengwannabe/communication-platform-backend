import { clearV1, authRegisterV3, usersStatsV1, dmCreateV2, messageSenddmV2, channelsCreateV3, channelJoinV3, messageSendV2, messageRemoveV2, FORBIDDEN } from '../wrapper';
describe('Successful users stats', () => {
  beforeEach(() => {
    clearV1();
  });

  test('Initial stats', () => {
    const user = authRegisterV3('wowzer22@gmail.com', '123456', 'dia', 'mond');
    expect(usersStatsV1(user.token)).toStrictEqual({
      channelsExist: [{
        numChannelsExist: 0,
        timeStamp: expect.any(Number)
      }],
      dmsExist: [{
        numDmsExist: 0,
        timeStamp: expect.any(Number)
      }],
      messagesExist: [{
        numMessagesExist: 0,
        timeStamp: expect.any(Number)
      }],
      utilizationRate: 0
    });
  });
  test('Users stats basic', () => {
    const user = authRegisterV3('wowzer22@gmail.com', '123456', 'dia', 'mond');
    const user2 = authRegisterV3('wowzer221@gmail.com', '1234567', 'diab', 'mondb');
    const user3 = authRegisterV3('wowzer222@gmail.com', '1234568', 'diac', 'mondc');
    const channel1 = channelsCreateV3(user.token, 'Firstchannel', true);
    channelJoinV3(user2.token, channel1.channelId);
    messageSendV2(user.token, channel1.channelId, 'Sample message');
    messageSendV2(user2.token, channel1.channelId, 'whats up dude');
    const dm = dmCreateV2(user3.token, []);
    messageSenddmV2(user3.token, dm.dmId, 'whatsup my g');
    expect(usersStatsV1(user.token)).toStrictEqual({
      channelsExist:
            [
              {
                numChannelsExist: 0,
                timeStamp: expect.any(Number)
              },
              {
                numChannelsExist: 1,
                timeStamp: expect.any(Number)
              },
            ],
      dmsExist:
            [
              {
                numDmsExist: 0,
                timeStamp: expect.any(Number)
              },
              {
                numDmsExist: 1,
                timeStamp: expect.any(Number)
              },
            ],
      messagesExist:
            [
              {
                numMessagesExist: 0,
                timeStamp: expect.any(Number)
              },
              {
                numMessagesExist: 1,
                timeStamp: expect.any(Number)
              },
              {
                numMessagesExist: 2,
                timeStamp: expect.any(Number)
              },
              {
                numMessagesExist: 3,
                timeStamp: expect.any(Number)
              },
            ],
      utilizationRate: 1
    });
  });

  test('Users stats with removal', () => {
    const user = authRegisterV3('wowzer22@gmail.com', '123456', 'dia', 'mond');
    const user2 = authRegisterV3('wowzer221@gmail.com', '1234567', 'diab', 'mondb');
    const user3 = authRegisterV3('wowzer222@gmail.com', '1234568', 'diac', 'mondc');
    const channel1 = channelsCreateV3(user.token, 'Firstchannel', true);
    channelJoinV3(user2.token, channel1.channelId);
    const mid1 = messageSendV2(user2.token, channel1.channelId, 'whats up dude');
    messageSendV2(user.token, channel1.channelId, 'Sample message');
    const dm = dmCreateV2(user3.token, []);
    const dmid = messageSenddmV2(user3.token, dm.dmId, 'whatsup my g');
    messageRemoveV2(user.token, mid1.messageId);
    messageRemoveV2(user3.token, dmid.messageId);
    expect(usersStatsV1(user.token)).toStrictEqual({
      channelsExist:
            [
              {
                numChannelsExist: 0,
                timeStamp: expect.any(Number)
              },
              {
                numChannelsExist: 1,
                timeStamp: expect.any(Number)
              },
            ],
      dmsExist:
            [
              {
                numDmsExist: 0,
                timeStamp: expect.any(Number)
              },
              {
                numDmsExist: 1,
                timeStamp: expect.any(Number)
              },
            ],
      messagesExist:
            [
              {
                numMessagesExist: 0,
                timeStamp: expect.any(Number)
              },
              {
                numMessagesExist: 1,
                timeStamp: expect.any(Number)
              },
              {
                numMessagesExist: 2,
                timeStamp: expect.any(Number)
              },
              {
                numMessagesExist: 3,
                timeStamp: expect.any(Number)
              },
              {
                numMessagesExist: 2,
                timeStamp: expect.any(Number)
              },
              {
                numMessagesExist: 1,
                timeStamp: expect.any(Number)
              },
            ],
      utilizationRate: 1
    });
  });
  describe('Error Case', () => {
    beforeEach(() => {
      clearV1();
    });
    test('Token is invalid ', () => {
      const user = authRegisterV3('wowzer22@gmail.com', '123456', 'mar', 'Wonto');
      expect(() => usersStatsV1(user.token + 'fake')).toThrow(Error(FORBIDDEN));
    });
  });
});
