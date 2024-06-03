import { BAD_REQUEST, FORBIDDEN, clearV1, dmCreateV2 } from '../wrapper';
import { createUser } from '../testHelper';

describe('Successful dmCreateV2 Tests', () => {
  beforeEach(() => {
    clearV1();
  });

  test('uId has no member', () => {
    const authUser = createUser();
    const uIds: number[] = [];
    expect(dmCreateV2(authUser.authUser1.token, uIds)).toEqual(
      {
        dmId: expect.any(Number)
      }
    );
  });

  test('uId has 1 member', () => {
    const authUser = createUser();
    const uIds: number[] = [];
    uIds.push(authUser.authUser2.authUserId);
    expect(dmCreateV2(authUser.authUser1.token, uIds)).toEqual(
      {
        dmId: expect.any(Number)
      }
    );
  });

  test('uId has multiple members', () => {
    const authUser = createUser();
    const uIds: number[] = [];
    uIds.push(authUser.authUser2.authUserId);
    uIds.push(authUser.authUser3.authUserId);
    uIds.push(authUser.authUser4.authUserId);
    expect(dmCreateV2(authUser.authUser1.token, uIds)).toEqual(
      {
        dmId: expect.any(Number)
      }
    );
  });
});

describe('Unsuccessful dmCreateV2 Tests', () => {
  beforeEach(() => {
    clearV1();
  });

  test('token is invalid', () => {
    const authUser = createUser();
    const uIds: number[] = [];
    uIds.push(authUser.authUser2.authUserId);
    expect(() => dmCreateV2(authUser.authUser1.token + 'nah', uIds)).toThrow(Error(FORBIDDEN));
  });

  test('uIds is invalid, not refer to any users', () => {
    const authUser = createUser();
    const uIds: number[] = [];
    uIds.push(authUser.authUser2.authUserId + 1845454);
    uIds.push(authUser.authUser3.authUserId);
    expect(() => dmCreateV2(authUser.authUser1.token, uIds)).toThrow(Error(BAD_REQUEST));
  });

  test('uIds is invalid, has duplicates', () => {
    const authUser = createUser();
    const uIds: number[] = [];
    uIds.push(authUser.authUser2.authUserId);
    uIds.push(authUser.authUser2.authUserId);
    uIds.push(authUser.authUser2.authUserId);
    expect(() => dmCreateV2(authUser.authUser1.token, uIds)).toThrow(Error(BAD_REQUEST));
  });
});
