import { DEFAULT_PROFILE_URL } from '../testHelper';
import { FORBIDDEN, clearV1, authRegisterV3, authLoginV2, authLogoutV2, userProfileV3 } from '../wrapper';

describe('Successful logout', () => {
  beforeEach(() => {
    clearV1();
  });
  test('User successfully logged out', () => {
    const user = authRegisterV3('wowzer@gmail.com', '123456', 'dia', 'mond');
    expect(authLogoutV2(user.token)).toStrictEqual({});
    expect(() => userProfileV3(user.token, user.authUserId)).toThrow(Error(FORBIDDEN));
  });
  test('User successfully logged out then logged in', () => {
    let user = authRegisterV3('wowzer@gmail.com', '123456', 'dia', 'mond');
    expect(authLogoutV2(user.token)).toStrictEqual({});
    expect(() => userProfileV3(user.token, user.authUserId)).toThrow(Error(FORBIDDEN));
    user = authLoginV2('wowzer@gmail.com', '123456');
    expect(userProfileV3(user.token, user.authUserId)).toEqual({
      user: {
        uId: user.authUserId,
        email: 'wowzer@gmail.com',
        nameFirst: 'dia',
        nameLast: 'mond',
        handleStr: 'diamond',
        profileImgUrl: DEFAULT_PROFILE_URL,
      }
    });
  });
  test('Multiple tokens used and logged out', () => {
    const user1 = authRegisterV3('wowzer@gmail.com', '123456', 'dia', 'mond');
    const user2 = authLoginV2('wowzer@gmail.com', '123456');
    const user3 = authLoginV2('wowzer@gmail.com', '123456');
    expect(userProfileV3(user1.token, user3.authUserId)).toEqual({
      user: {
        uId: user3.authUserId,
        email: 'wowzer@gmail.com',
        nameFirst: 'dia',
        nameLast: 'mond',
        handleStr: 'diamond',
        profileImgUrl: DEFAULT_PROFILE_URL,
      }
    });
    expect(authLogoutV2(user1.token)).toStrictEqual({});
    expect(authLogoutV2(user3.token)).toStrictEqual({});
    expect(() => userProfileV3(user1.token, user1.authUserId)).toThrow(Error(FORBIDDEN));
    expect(() => userProfileV3(user3.token, user3.authUserId)).toThrow(Error(FORBIDDEN));
    expect(userProfileV3(user2.token, user2.authUserId)).toEqual({
      user: {
        uId: user2.authUserId,
        email: 'wowzer@gmail.com',
        nameFirst: 'dia',
        nameLast: 'mond',
        handleStr: 'diamond',
        profileImgUrl: DEFAULT_PROFILE_URL,
      }
    });
  });
});

describe('Unsuccessful user logout', () => {
  test('Invalid token', () => {
    expect(() => authLogoutV2('badToken')).toThrow(Error(FORBIDDEN));
  });
});
