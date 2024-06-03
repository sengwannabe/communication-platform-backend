import { DEFAULT_PROFILE_URL } from '../testHelper';
import { BAD_REQUEST, clearV1, authRegisterV3, userProfileV3 } from '../wrapper';

describe('Successful user registration', () => {
  beforeEach(() => {
    clearV1();
  });

  test('User successfully registered', () => {
    const user = authRegisterV3('foobar1@gmail.com', '123456', 'Foo', 'Bar');
    expect(user).toStrictEqual(
      {
        token: expect.any(String),
        authUserId: expect.any(Number),
      });
    expect(userProfileV3(user.token, user.authUserId)).toEqual({
      user: {
        uId: user.authUserId,
        email: 'foobar1@gmail.com',
        nameFirst: 'Foo',
        nameLast: 'Bar',
        handleStr: 'foobar',
        profileImgUrl: DEFAULT_PROFILE_URL,
      }
    });
  });
});

describe('Unsuccessful user registrations', () => {
  beforeEach(() => {
    clearV1();
  });
  test('Invalid email', () => {
    expect(() => authRegisterV3('wowzer@', '123456', 'dia', 'mond')).toThrow(Error(BAD_REQUEST));
  });
  test('First name too short', () => {
    expect(() => authRegisterV3('wowzer1@gmail.com', '123456', '', 'mop')).toThrow(Error(BAD_REQUEST));
  });

  test('First name too long', () => {
    expect(() => authRegisterV3('stevenpool123@gmail.com', 'coolpassword1', 'Long'.repeat(51), 'Gregory')).toThrow(Error(BAD_REQUEST));
  });

  test('Last name too short', () => {
    expect(() => authRegisterV3('stevenpool123@gmail.com', 'coolpassword1', 'Steve', '')).toThrow(Error(BAD_REQUEST));
  });

  test('Last name too long', () => {
    expect(() => authRegisterV3('wowzer2@gmail.com', '123456', 'Joe', 'm'.repeat(51))).toThrow(Error(BAD_REQUEST));
  });
  test('Invalid password', () => {
    expect(() => authRegisterV3('wowzer2@gmail.com', '12345', 'Joe', 'mmm')).toThrow(Error(BAD_REQUEST));
  });
  test('Email already taken', () => {
    authRegisterV3('stevwax@gmail.com', 'passwoe2', 'Steve', 'Wax');
    expect(() => authRegisterV3('stevwax@gmail.com', 'passwoe2', 'Steve', 'Wax')).toThrow(Error(BAD_REQUEST));
  });
});

describe('Handle Generation Cases', () => {
  beforeEach(() => {
    clearV1();
  });
  test('Handle already taken', () => {
    const person1 = authRegisterV3('limjon1@gmail.com', 'password10', 'Lim', 'Jon');
    authRegisterV3('limjon2@gmail.com', 'password11', 'Lim', 'Jon1');
    const person2 = authRegisterV3('limjon3@gmail.com', 'password11', 'Lim', 'Jon');
    expect(userProfileV3(person1.token, person2.authUserId)).toEqual({
      user: {
        uId: person2.authUserId,
        email: 'limjon3@gmail.com',
        nameFirst: 'Lim',
        nameLast: 'Jon',
        handleStr: 'limjon0',
        profileImgUrl: DEFAULT_PROFILE_URL,
      }
    });
  });
  test('Similar Handle: should not concat', () => {
    const person1 = authRegisterV3('limjon1@gmail.com', 'password10', 'Lim', 'Jon0');
    const person2 = authRegisterV3('limjon2@gmail.com', 'password11', 'Lim', 'Jon');
    expect(userProfileV3(person1.token, person2.authUserId)).toEqual({
      user: {
        uId: person2.authUserId,
        email: 'limjon2@gmail.com',
        nameFirst: 'Lim',
        nameLast: 'Jon',
        handleStr: 'limjon',
        profileImgUrl: DEFAULT_PROFILE_URL,
      }
    });
  });
  test('Concatenating a number to name over 20 characters', () => {
    const person1 = authRegisterV3('limjon1@gmail.com', 'password10', 'a'.repeat(10), 'z'.repeat(10));
    const person2 = authRegisterV3('limjon2@gmail.com', 'password11', 'a'.repeat(10), 'z'.repeat(10));
    expect(userProfileV3(person1.token, person2.authUserId)).toEqual({
      user: {
        uId: person2.authUserId,
        email: 'limjon2@gmail.com',
        nameFirst: 'a'.repeat(10),
        nameLast: 'z'.repeat(10),
        handleStr: 'a'.repeat(10) + 'z'.repeat(10) + '0',
        profileImgUrl: DEFAULT_PROFILE_URL,
      }
    });
  });
  test('Cutting off handle string at 20 characters', () => {
    const person1 = authRegisterV3('limjon1@gmail.com', 'password10', 'a'.repeat(14), 'z'.repeat(23));
    expect(userProfileV3(person1.token, person1.authUserId)).toEqual({
      user: {
        uId: person1.authUserId,
        email: 'limjon1@gmail.com',
        nameFirst: 'a'.repeat(14),
        nameLast: 'z'.repeat(23),
        handleStr: 'a'.repeat(14) + 'z'.repeat(6),
        profileImgUrl: DEFAULT_PROFILE_URL,
      }
    });
  });
});
