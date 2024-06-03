import { DEFAULT_PROFILE_URL } from '../testHelper';
import { clearV1, authRegisterV3, userProfileV3, userProfileSetemailV2, FORBIDDEN, BAD_REQUEST } from '../wrapper';

describe('Expected Cases: \n', () => {
  beforeEach(() => {
    clearV1();
  });

  test('Successfully changed email', () => {
    const user = authRegisterV3('wowzer22@gmail.com', '123456', 'mar', 'Wonto');
    expect(userProfileSetemailV2(user.token, 'yololo@gmail.com')).toStrictEqual({});
    expect(userProfileV3(user.token, user.authUserId)).toEqual({
      user: {
        uId: user.authUserId,
        email: 'yololo@gmail.com',
        nameFirst: 'mar',
        nameLast: 'Wonto',
        handleStr: 'marwonto',
        profileImgUrl: DEFAULT_PROFILE_URL,
      }
    });
  });
});

describe('Error Cases: \n', () => {
  beforeEach(() => {
    clearV1();
  });

  test('Token is invalid ', () => {
    const user = authRegisterV3('wowzer22@gmail.com', '123456', 'mar', 'Wonto');
    expect(() => userProfileSetemailV2(user.token + 'fake', 'marcus@ate.com.au')).toThrow(Error(FORBIDDEN));
  });

  test('email address is already being used', () => {
    const user = authRegisterV3('marcus@ate.com.au', '123456', 'mar', 'Wonto');
    const user2 = authRegisterV3('wowzer22@gmail.com', '123OLasS6', 'Iron', 'Man');
    user2.email = 'wowzer22@gmail.com';
    expect(() => userProfileSetemailV2(user.token, user2.email)).toThrow(Error(BAD_REQUEST));
  });

  test('email address entered is invalid', () => {
    const user = authRegisterV3('marcus@ate.com.au', '123456', 'mar', 'Wonto');
    expect(() => userProfileSetemailV2(user.token, 'm')).toThrow(Error(BAD_REQUEST));
  });
});
