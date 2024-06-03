import { DEFAULT_PROFILE_URL } from '../testHelper';
import { clearV1, authRegisterV3, userProfileV3, userProfileSetnameV2, BAD_REQUEST, FORBIDDEN } from '../wrapper';

describe('Expected Cases: \n', () => {
  beforeEach(() => {
    clearV1();
  });

  test('Successfully changed nameFist and nameLast', () => {
    const user = authRegisterV3('wowzer22@gmail.com', '123456', 'mar', 'Wonto');
    expect(userProfileSetnameV2(user.token, 'marcus', 'Late')).toStrictEqual({});
    expect(userProfileV3(user.token, user.authUserId)).toEqual({
      user: {
        uId: user.authUserId,
        email: 'wowzer22@gmail.com',
        nameFirst: 'marcus',
        nameLast: 'Late',
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
    expect(() => userProfileSetnameV2(user.token + 'fake', 'marcus', 'late')).toThrow(Error(FORBIDDEN));
  });

  test('Length of nameFirst > 50', () => {
    const user = authRegisterV3('wowzer22@gmail.com', '123456', 'mar', 'Wonto');
    expect(() => userProfileSetnameV2(user.token, 'marcus'.repeat(70), 'late')).toThrow(Error(BAD_REQUEST));
  });

  test('Length of nameFirst < 1', () => {
    const user = authRegisterV3('wowzer22@gmail.com', '123456', 'mar', 'Wonto');
    expect(() => userProfileSetnameV2(user.token, '', 'late')).toThrow(Error(BAD_REQUEST));
  });

  test('Length of nameLast > 50', () => {
    const user = authRegisterV3('wowzer22@gmail.com', '123456', 'mar', 'Wonto');
    expect(() => userProfileSetnameV2(user.token, 'late', 'marcus'.repeat(70))).toThrow(Error(BAD_REQUEST));
  });

  test('Length of nameLast < 1', () => {
    const user = authRegisterV3('wowzer22@gmail.com', '123456', 'mar', 'Wonto');
    expect(() => userProfileSetnameV2(user.token, 'late', '')).toThrow(Error(BAD_REQUEST));
  });
});
