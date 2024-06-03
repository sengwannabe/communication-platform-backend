import { DEFAULT_PROFILE_URL } from '../testHelper';
import { BAD_REQUEST, clearV1, authRegisterV3, authLoginV2, userProfileV3 } from '../wrapper';

describe('Successful user login', () => {
  beforeEach(() => {
    clearV1();
  });
  test('User successfully logged in and uses their new token', () => {
    const registered = authRegisterV3('wowzer22@gmail.com', '123456', 'dia', 'mond');
    const user = authLoginV2('wowzer22@gmail.com', '123456');
    expect(user).toStrictEqual(
      {
        token: expect.any(String),
        authUserId: expect.any(Number),
      });
    expect(registered.authUserId).toStrictEqual(user.authUserId);
    expect(registered.token).not.toEqual(user.token);
    expect(userProfileV3(user.token, user.authUserId)).toEqual({
      user: {
        uId: user.authUserId,
        email: 'wowzer22@gmail.com',
        nameFirst: 'dia',
        nameLast: 'mond',
        handleStr: 'diamond',
        profileImgUrl: DEFAULT_PROFILE_URL,
      }
    });
  });
});

describe('Unsuccessful user login', () => {
  beforeEach(() => {
    clearV1();
  });
  test('Invalid email', () => {
    expect(() => authLoginV2('zerwow@gmail.com', '123456')).toThrow(Error(BAD_REQUEST));
  });
  test('Invalid password', () => {
    authRegisterV3('wowzer123@gmail.com', '123456', 'dia', 'mond');
    expect(() => authLoginV2('wowzer123@gmail.com', '1234567')).toThrow(Error(BAD_REQUEST));
  });
});
