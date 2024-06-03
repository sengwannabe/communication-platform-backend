import { DEFAULT_PROFILE_URL } from '../testHelper';
import { clearV1, authRegisterV3, usersAllV2 } from '../wrapper';

describe('Successful Cases: \n', () => {
  beforeEach(() => {
    clearV1();
  });

  test('Successfully obtain all details ', () => {
    const user = authRegisterV3('wowzer221@gmail.com', '1123456', 'mara', 'Wontoa');
    const user2 = authRegisterV3('wowzer222@gmail.com', '1223456', 'marb', 'Wontob');
    const user3 = authRegisterV3('wowzer223@gmail.com', '1233456', 'marc', 'Wontoc');
    const user4 = authRegisterV3('wowzer224@gmail.com', '1234456', 'mard', 'Wontod');
    const user5 = authRegisterV3('wowzer225@gmail.com', '1234556', 'mare', 'Wontoe');
    expect(usersAllV2(user.token)).toStrictEqual({
      users: [
        {
          uId: user.authUserId,
          email: 'wowzer221@gmail.com',
          nameFirst: 'mara',
          nameLast: 'Wontoa',
          handleStr: 'marawontoa',
          profileImgUrl: DEFAULT_PROFILE_URL,
        },
        {
          uId: user2.authUserId,
          email: 'wowzer222@gmail.com',
          nameFirst: 'marb',
          nameLast: 'Wontob',
          handleStr: 'marbwontob',
          profileImgUrl: DEFAULT_PROFILE_URL,
        },
        {
          uId: user3.authUserId,
          email: 'wowzer223@gmail.com',
          nameFirst: 'marc',
          nameLast: 'Wontoc',
          handleStr: 'marcwontoc',
          profileImgUrl: DEFAULT_PROFILE_URL,
        },
        {
          uId: user4.authUserId,
          email: 'wowzer224@gmail.com',
          nameFirst: 'mard',
          nameLast: 'Wontod',
          handleStr: 'mardwontod',
          profileImgUrl: DEFAULT_PROFILE_URL,
        },
        {
          uId: user5.authUserId,
          email: 'wowzer225@gmail.com',
          nameFirst: 'mare',
          nameLast: 'Wontoe',
          handleStr: 'marewontoe',
          profileImgUrl: DEFAULT_PROFILE_URL,
        }
      ]
    });
  });
  test('Testing one user in database ', () => {
    const user = authRegisterV3('wowzer221@gmail.com', '1123456', 'mara', 'Wontoa');
    expect(usersAllV2(user.token)).toStrictEqual({
      users: [
        {
          uId: user.authUserId,
          email: 'wowzer221@gmail.com',
          nameFirst: 'mara',
          nameLast: 'Wontoa',
          handleStr: 'marawontoa',
          profileImgUrl: DEFAULT_PROFILE_URL,
        }
      ]
    });
  });
});
