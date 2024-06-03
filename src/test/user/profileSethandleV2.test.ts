import { DEFAULT_PROFILE_URL } from '../testHelper';
import { clearV1, authRegisterV3, userProfileV3, userProfileSetHandleV2, BAD_REQUEST, FORBIDDEN } from '../wrapper';

describe('Expected Cases: \n', () => {
  beforeEach(() => {
    clearV1();
  });

  test('Successfully changed handle string', () => {
    const user = authRegisterV3('wowzer22@gmail.com', '123456', 'mar', 'Wonto');
    expect(userProfileSetHandleV2(user.token, 'LokiIronMARs')).toStrictEqual({});
    expect(userProfileV3(user.token, user.authUserId)).toEqual({
      user: {
        uId: user.authUserId,
        email: 'wowzer22@gmail.com',
        nameFirst: 'mar',
        nameLast: 'Wonto',
        handleStr: 'LokiIronMARs',
        profileImgUrl: DEFAULT_PROFILE_URL,
      }
    });
  });
});

describe('Error Cases: \n', () => {
  beforeEach(() => {
    clearV1();
  });

  test('Length of handle string > 20', () => {
    const user = authRegisterV3('wowzer22@gmail.com', '123456', 'mar', 'Wonto');
    expect(() => userProfileSetHandleV2(user.token, 'a'.repeat(30))).toThrow(Error(BAD_REQUEST));
  });

  test('Length of handle string < 3', () => {
    const user = authRegisterV3('wowzer22@gmail.com', '123456', 'mar', 'Wonto');
    expect(() => userProfileSetHandleV2(user.token, 'as')).toThrow(Error(BAD_REQUEST));
  });

  test('Handlestring contains non alphanumric characters', () => {
    const user = authRegisterV3('wowzer22@gmail.com', '123456', 'mar', 'Wonto');
    expect(() => userProfileSetHandleV2(user.token, 'asds*(+_.99')).toThrow(Error(BAD_REQUEST));
  });

  test('Handlestring is already used by another user', () => {
    const user = authRegisterV3('wowzer22@gmail.com', '123456', 'mar', 'Wonto');
    user.handleString = 'marwonto';
    const user2 = authRegisterV3('lokiironman2@gmail.com', '123456', 'iron', 'man');
    expect(() => userProfileSetHandleV2(user2.token, user.handleString)).toThrow(Error(BAD_REQUEST));
  });

  test('Token is invalid ', () => {
    const user = authRegisterV3('wowzer22@gmail.com', '123456', 'mar', 'Wonto');
    expect(() => userProfileSetHandleV2(user.token + 'fake', 'whatsup')).toThrow(Error(FORBIDDEN));
  });
});
