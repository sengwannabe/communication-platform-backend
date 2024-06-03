import {
  clearV1, authRegisterV3, userProfileV3,
  BAD_REQUEST, FORBIDDEN
} from '../wrapper';
import { AuthUser, DEFAULT_PROFILE_URL } from '../testHelper';

let user1: AuthUser;

beforeEach(() => {
  clearV1();
  user1 = authRegisterV3('generic@provider.com', 'ThisIsASimplePassword', 'Gen', 'Eric');
});

describe('Test Base Cases', () => {
  test('One User', () => {
    expect(userProfileV3(user1.token, user1.authUserId)).toStrictEqual({
      user:
      {
        uId: user1.authUserId,
        email: 'generic@provider.com',
        nameFirst: 'Gen',
        nameLast: 'Eric',
        handleStr: 'generic',
        profileImgUrl: DEFAULT_PROFILE_URL,
      }
    });
  });

  test('Multiple Users', () => {
    const user2 = authRegisterV3('johndoe@here.com', 'NoPeeking', 'John', 'Doe');
    expect(userProfileV3(user1.token, user2.authUserId)).toStrictEqual({
      user:
      {
        uId: user2.authUserId,
        email: 'johndoe@here.com',
        nameFirst: 'John',
        nameLast: 'Doe',
        handleStr: 'johndoe',
        profileImgUrl: DEFAULT_PROFILE_URL,
      }
    });
  });
});

describe('Error Cases', () => {
  test('Invalid AuthUser', () => {
    expect(() => userProfileV3(user1.token + 'no', user1.authUserId)).toThrow(Error(FORBIDDEN));
  });

  test('Invalid uId to search', () => {
    expect(() => userProfileV3(user1.token, user1.authUserId + 1)).toThrow(Error(BAD_REQUEST));
  });
});
