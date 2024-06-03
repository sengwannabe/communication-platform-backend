import { DEFAULT_PROFILE_URL } from '../testHelper';
import { FORBIDDEN, clearV1, authRegisterV3, authLoginV2, authLogoutV2, userProfileV3, authPasswordResetRequestV1 } from '../wrapper';

describe('Successful request', () => {
  beforeEach(() => {
    clearV1();
  });
  test('User requested for password reset and logged out of all sessions', () => {
    const userRegister = authRegisterV3('22t3comp1531acc@gmail.com', '123456', 'dia', 'mond');
    const userLogin = authLoginV2('22t3comp1531acc@gmail.com', '123456');
    expect(userProfileV3(userLogin.token, userLogin.authUserId)).toEqual({
      user: {
        uId: userRegister.authUserId,
        email: '22t3comp1531acc@gmail.com',
        nameFirst: 'dia',
        nameLast: 'mond',
        handleStr: 'diamond',
        profileImgUrl: DEFAULT_PROFILE_URL,
      }
    });
    expect(authPasswordResetRequestV1('22t3comp1531acc@gmail.com')).toStrictEqual({});
    expect(() => authLogoutV2(userRegister.token)).toThrow(Error(FORBIDDEN));
    expect(() => userProfileV3(userLogin.token, userLogin.authUserId)).toThrow(Error(FORBIDDEN));
  });
});

describe('Unsuccessful request, no errors thrown', () => {
  beforeEach(() => {
    clearV1();
  });
  test('Email does not exist but no error thrown', () => {
    expect(authPasswordResetRequestV1('coolemail@gmail.com')).toStrictEqual({});
  });
});
