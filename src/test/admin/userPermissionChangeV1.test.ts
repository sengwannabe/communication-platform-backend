import { DEFAULT_PROFILE_URL } from '../testHelper';
import {
  clearV1, authRegisterV3, BAD_REQUEST, FORBIDDEN, userRemoveV1, userPermissionChangeV1, usersAllV2
} from '../wrapper';

function createUsers() {
  const user1 = authRegisterV3('wowzer@gmail.com', '123456', 'Global', 'Owner');
  const user2 = authRegisterV3('wowzer1@gmail.com', '123456', 'first', 'one');
  const user3 = authRegisterV3('wowzer2@gmail.com', '123456', 'second', '2');
  user1.id = {
    uId: user1.authUserId,
    handleStr: 'globalowner',
    email: 'wowzer@gmail.com',
    nameFirst: 'Global',
    nameLast: 'Owner',
    profileImgUrl: DEFAULT_PROFILE_URL,
  };
  user2.id = {
    uId: user2.authUserId,
    handleStr: 'firstone',
    email: 'wowzer1@gmail.com',
    nameFirst: 'first',
    nameLast: 'one',
    profileImgUrl: DEFAULT_PROFILE_URL,
  };
  user3.id = {
    uId: user3.authUserId,
    handleStr: 'second2',
    email: 'wowzer2@gmail.com',
    nameFirst: 'second',
    nameLast: '2',
    profileImgUrl: DEFAULT_PROFILE_URL,
  };
  return {
    user1: user1,
    user2: user2,
    user3: user3,
  };
}

describe('Successful permission change', () => {
  beforeEach(() => {
    clearV1();
  });

  test('Making a member into a global owner', () => {
    const users = createUsers();
    expect(userPermissionChangeV1(users.user1.token, users.user3.authUserId, 1)).toStrictEqual({});
    expect(usersAllV2(users.user1.token)).toStrictEqual({
      users: expect.toIncludeSameMembers([
        users.user2.id,
        users.user1.id,
        users.user3.id,
      ])
    });
    userRemoveV1(users.user3.token, users.user1.authUserId);
    expect(usersAllV2(users.user2.token)).toStrictEqual({
      users: expect.toIncludeSameMembers([
        users.user2.id,
        users.user3.id,
      ])
    });
  });

  test('Making a global owner into a member', () => {
    const users = createUsers();
    expect(userPermissionChangeV1(users.user1.token, users.user3.authUserId, 1)).toStrictEqual({});
    expect(userPermissionChangeV1(users.user3.token, users.user1.authUserId, 2)).toStrictEqual({});
    expect(() => userRemoveV1(users.user1.token, users.user2.authUserId)).toThrow(Error(FORBIDDEN));
  });
});

describe('Unsuccessful permission change', () => {
  beforeEach(() => {
    clearV1();
  });
  test('Invalid token', () => {
    const users = createUsers();
    expect(() => userPermissionChangeV1(users.user1.token + 'no', users.user3.authUserId, 1)).toThrow(Error(FORBIDDEN));
  });

  test('Non global owner trying to change permissions', () => {
    const users = createUsers();
    expect(() => userPermissionChangeV1(users.user2.token, users.user3.authUserId, 1)).toThrow(Error(FORBIDDEN));
  });

  test('uId does not refer to a valid user', () => {
    const users = createUsers();
    expect(() => userPermissionChangeV1(users.user1.token, users.user2.authUserId + 1, 1)).toThrow(Error(BAD_REQUEST));
  });

  test('uId refers to the last global owner', () => {
    const users = createUsers();
    expect(() => userPermissionChangeV1(users.user1.token, users.user1.authUserId, 2)).toThrow(Error(BAD_REQUEST));
  });

  test('Invalid permission id', () => {
    const users = createUsers();
    expect(() => userPermissionChangeV1(users.user1.token, users.user2.authUserId, 3)).toThrow(Error(BAD_REQUEST));
  });

  test('Already global owner', () => {
    const users = createUsers();
    userPermissionChangeV1(users.user1.token, users.user2.authUserId, 1);
    expect(() => userPermissionChangeV1(users.user1.token, users.user2.authUserId, 1)).toThrow(Error(BAD_REQUEST));
  });

  test('Already a member', () => {
    const users = createUsers();
    expect(() => userPermissionChangeV1(users.user1.token, users.user2.authUserId, 2)).toThrow(Error(BAD_REQUEST));
  });
});
