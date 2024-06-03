import { clearV1, authRegisterV3, userStatsV1, dmCreateV2, messageSenddmV2, channelsCreateV3, channelJoinV3, messageSendV2, channelLeaveV2, FORBIDDEN } from '../wrapper';
describe('Successful user stats', () => {
  beforeEach(() => {
    clearV1();
  });
  test('User stats initial', () => {
    const user = authRegisterV3('wowzer22@gmail.com', '123456', 'dia', 'mond');
    expect(userStatsV1(user.token)).toStrictEqual({
      channelsJoined: [{
        numChannelsJoined: 0,
        timeStamp: expect.any(Number)
      }],
      dmsJoined: [{
        numDmsJoined: 0,
        timeStamp: expect.any(Number)
      }],
      messagesSent: [{
        numMessagesSent: 0,
        timeStamp: expect.any(Number)
      }],
      involvementRate: 0
    });
  });
  test('User stats after basic join and messages sent and removed', () => {
    const user = authRegisterV3('wowzer22@gmail.com', '123456', 'dia', 'mond');
    const user2 = authRegisterV3('wowzer221@gmail.com', '1234567', 'diab', 'mondb');
    const channel1 = channelsCreateV3(user.token, 'Firstchannel', true);
    const channel2 = channelsCreateV3(user2.token, 'secondchannel', true);
    channelsCreateV3(user2.token, 'secondchannel', true);
    channelJoinV3(user.token, channel2.channelId);
    messageSendV2(user.token, channel1.channelId, 'Sample message');
    messageSendV2(user.token, channel2.channelId, 'whats up dude'); // changed from channelid1 to channelid2
    const dmId: number[] = [];
    dmId.push(user2.authUserId);
    const dm = dmCreateV2(user.token, dmId);
    messageSenddmV2(user.token, dm.dmId, 'whatsup my g');
    const involvementRate = (5 / 6);
    expect(userStatsV1(user.token)).toStrictEqual({
      channelsJoined:
            [
              {
                numChannelsJoined: 0,
                timeStamp: expect.any(Number)
              },
              {
                numChannelsJoined: 1,
                timeStamp: expect.any(Number)
              },
              {
                numChannelsJoined: 2,
                timeStamp: expect.any(Number)
              }
            ],
      dmsJoined:
            [
              {
                numDmsJoined: 0,
                timeStamp: expect.any(Number)
              },
              {
                numDmsJoined: 1,
                timeStamp: expect.any(Number)
              }
            ],
      messagesSent: [
        {
          numMessagesSent: 0,
          timeStamp: expect.any(Number)
        },
        {
          numMessagesSent: 1,
          timeStamp: expect.any(Number)
        },
        {
          numMessagesSent: 2,
          timeStamp: expect.any(Number)
        }
      ],
      involvementRate: involvementRate
    });
  });

  test('User stats after leaving channels', () => {
    const user = authRegisterV3('wowzer22@gmail.com', '123456', 'dia', 'mond');
    const user2 = authRegisterV3('wowzer221@gmail.com', '1234567', 'diab', 'mondb');
    const channel1 = channelsCreateV3(user.token, 'Firstchannel', true);
    const channel2 = channelsCreateV3(user2.token, 'secondchannel', true);
    channelsCreateV3(user2.token, 'Sasddchannels', true);
    channelJoinV3(user.token, channel2.channelId);
    messageSendV2(user.token, channel1.channelId, 'Sample message');
    messageSendV2(user.token, channel1.channelId, 'whats up dude'); // changed from channelid1 to channelid2
    const dmId: number[] = [];
    dmId.push(user2.authUserId);
    const dm = dmCreateV2(user.token, dmId);
    messageSenddmV2(user.token, dm.dmId, 'whatsup my g');
    channelLeaveV2(user.token, channel2.channelId);
    const involvementRate = (4 / 6);
    expect(userStatsV1(user.token)).toStrictEqual({
      channelsJoined:
            [
              {
                numChannelsJoined: 0,
                timeStamp: expect.any(Number)
              },
              {
                numChannelsJoined: 1,
                timeStamp: expect.any(Number)
              },
              {
                numChannelsJoined: 2,
                timeStamp: expect.any(Number)
              },
              {
                numChannelsJoined: 1,
                timeStamp: expect.any(Number)
              }
            ],
      dmsJoined:
            [
              {
                numDmsJoined: 0,
                timeStamp: expect.any(Number)
              },
              {
                numDmsJoined: 1,
                timeStamp: expect.any(Number)
              }
            ],
      messagesSent: [
        {
          numMessagesSent: 0,
          timeStamp: expect.any(Number)
        },
        {
          numMessagesSent: 1,
          timeStamp: expect.any(Number)
        },
        {
          numMessagesSent: 2,
          timeStamp: expect.any(Number)
        }
      ],
      involvementRate: involvementRate
    });
  });
});

describe('Error Case', () => {
  beforeEach(() => {
    clearV1();
  });
  test('Token is invalid ', () => {
    const user = authRegisterV3('wowzer22@gmail.com', '123456', 'mar', 'Wonto');
    expect(() => userStatsV1(user.token + 'fake')).toThrow(Error(FORBIDDEN));
  });
});
