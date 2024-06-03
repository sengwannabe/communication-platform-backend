import { DEFAULT_PROFILE_URL } from '../testHelper';
import { clearV1, authRegisterV3, dmCreateV2, dmDetailsV2, dmLeaveV2, BAD_REQUEST, FORBIDDEN } from '../wrapper';

let authUser1: { token: string; authUserId: number; }, dm1: { dmId: number; };

describe('Successful dmLeaveV2 tests', () => {
  beforeEach(() => {
    clearV1();
    authUser1 = authRegisterV3('myemail@gmail.com', 'password', 'my', 'email');
  });

  test('Valid token and dmId inputted, empty uIds list and creator leaves, leaving empty DM and cannot be accessed', () => {
    const dm1 = dmCreateV2(authUser1.token, []);
    expect(dmLeaveV2(authUser1.token, dm1.dmId)).toStrictEqual({});
    expect(() => dmDetailsV2(authUser1.token, dm1.dmId)).toThrow(Error(FORBIDDEN));
  });

  test('Valid token and dmId inputted, not empty uIds list and a member leaves', () => {
    const authUser2 = authRegisterV3('mycode@gmail.com', 'passcode', 'myer', 'store');
    const authUser3 = authRegisterV3('hello@gmail.com', 'passname', 'big', 'dubeeyou');
    const dm1 = dmCreateV2(authUser1.token, [authUser2.authUserId, authUser3.authUserId]);
    expect(dmLeaveV2(authUser2.token, dm1.dmId)).toStrictEqual({});
    const dmDetail = dmDetailsV2(authUser1.token, dm1.dmId);
    expect(dmDetail).toStrictEqual(
      {
        name: 'bigdubeeyou, myemail, myerstore',
        members: expect.toIncludeSameMembers(
          [
            {
              uId: authUser1.authUserId,
              email: 'myemail@gmail.com',
              nameFirst: 'my',
              nameLast: 'email',
              handleStr: 'myemail',
              profileImgUrl: DEFAULT_PROFILE_URL,
            },
            {
              uId: authUser3.authUserId,
              email: 'hello@gmail.com',
              nameFirst: 'big',
              nameLast: 'dubeeyou',
              handleStr: 'bigdubeeyou',
              profileImgUrl: DEFAULT_PROFILE_URL,
            }
          ]
        )
      }
    );
  });
});

describe('Error dmLeaveV2 tests', () => {
  beforeEach(() => {
    clearV1();
    authUser1 = authRegisterV3('myemail@gmail.com', 'password', 'my', 'email');
    dm1 = dmCreateV2(authUser1.token, []);
  });

  test('invalid dmId inputted', () => {
    expect(() => dmLeaveV2(authUser1.token, dm1.dmId + 100)).toThrow(Error(BAD_REQUEST));
  });

  test('authUser token is invalid', () => {
    expect(() => dmLeaveV2(authUser1.token + 'wR0n6', dm1.dmId)).toThrow(Error(FORBIDDEN));
  });

  test('dmId is valid but authUser is not a member of the dm', () => {
    const authUser2 = authRegisterV3('mycode@gmail.com', 'passcode', 'myer', 'store');
    expect(() => dmLeaveV2(authUser2.token, dm1.dmId)).toThrow(Error(FORBIDDEN));
  });
});
