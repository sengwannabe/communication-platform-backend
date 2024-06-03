import { FORBIDDEN, clearV1, dmCreateV2, dmRemoveV2, BAD_REQUEST, dmLeaveV2, dmListV2 } from '../wrapper';
import { createUser } from '../testHelper';

describe('Successfull dmRemoveV2 Tests', () => {
  beforeEach(() => {
    clearV1();
  });

  test('User is not a member of any dms', () => {
    const authUser = createUser();
    const uIds = [];
    uIds.push(authUser.authUser2.authUserId);
    const dm1 = dmCreateV2(authUser.authUser1.token, uIds);
    dmRemoveV2(authUser.authUser1.token, dm1.dmId);
    expect(dmListV2(authUser.authUser1.token)).toEqual({ dms: [] });
  });

  test('User is member of 1 dm', () => {
    const authUser = createUser();
    const uIds = [];
    uIds.push(authUser.authUser2.authUserId);
    uIds.push(authUser.authUser3.authUserId);
    const dm1 = dmCreateV2(authUser.authUser1.token, uIds);
    dmRemoveV2(authUser.authUser1.token, dm1.dmId);
    expect(dmListV2(authUser.authUser1.token)).toEqual({ dms: [] });
  });

  test('User are member of multiple dm', () => {
    const authUser = createUser();
    const uIds = [];
    uIds.push(authUser.authUser2.authUserId);
    uIds.push(authUser.authUser3.authUserId);
    uIds.push(authUser.authUser4.authUserId);
    const dm1 = dmCreateV2(authUser.authUser1.token, uIds);
    uIds.pop();
    uIds.push(authUser.authUser1.authUserId);
    const dm2 = dmCreateV2(authUser.authUser4.token, uIds);
    uIds.pop();
    uIds.pop();
    const dm3 = dmCreateV2(authUser.authUser1.token, uIds);
    dmRemoveV2(authUser.authUser1.token, dm1.dmId);
    expect(dmListV2(authUser.authUser1.token)).toEqual({
      dms: [
        {
          dmId: dm2.dmId,
          name: 'akeng, bking, cgregory, dkong',
        },
        {
          dmId: dm3.dmId,
          name: 'bking, cgregory',
        }
      ]
    });
  });
});

describe('Unsuccessful dmRemoveV2 Tests', () => {
  beforeEach(() => {
    clearV1();
  });

  test('dmId is invalid - dmId does not refer to a valid dm', () => {
    const authUser = createUser();
    const uIds = [];
    uIds.push(authUser.authUser2.authUserId);
    uIds.push(authUser.authUser3.authUserId);
    uIds.push(authUser.authUser4.authUserId);
    const dm1 = dmCreateV2(authUser.authUser1.token, uIds);
    uIds.pop();
    dmCreateV2(authUser.authUser4.token, uIds);
    uIds.pop();
    dmCreateV2(authUser.authUser3.token, uIds);
    expect(() => dmRemoveV2(authUser.authUser1.token, dm1.dmId + 100)).toThrow(Error(BAD_REQUEST));
  });

  test('dmId is valid and the authorised user is not the original DM creator', () => {
    const authUser = createUser();
    const uIds = [];
    uIds.push(authUser.authUser2.authUserId);
    uIds.push(authUser.authUser3.authUserId);
    uIds.push(authUser.authUser4.authUserId);
    dmCreateV2(authUser.authUser1.token, uIds);
    uIds.pop();
    dmCreateV2(authUser.authUser4.token, uIds);
    uIds.pop();
    const dm3 = dmCreateV2(authUser.authUser3.token, uIds);
    expect(() => dmRemoveV2(authUser.authUser1.token, dm3.dmId)).toThrow(Error(FORBIDDEN));
  });

  test('dmId is valid and the authorised user is no longer in the DM', () => {
    const authUser = createUser();
    const uIds = [];
    uIds.push(authUser.authUser2.authUserId);
    uIds.push(authUser.authUser3.authUserId);
    uIds.push(authUser.authUser4.authUserId);
    const dm1 = dmCreateV2(authUser.authUser1.token, uIds);
    dmLeaveV2(authUser.authUser1.token, dm1.dmId);
    expect(() => dmRemoveV2(authUser.authUser1.token, dm1.dmId)).toThrow(Error(FORBIDDEN));
  });

  test('token is invalid', () => {
    const authUser = createUser();
    const uIds = [];
    uIds.push(authUser.authUser2.authUserId);
    const dm1 = dmCreateV2(authUser.authUser1.token, uIds);
    expect(() => dmRemoveV2(authUser.authUser1.token + 100, dm1.dmId)).toThrow(Error(FORBIDDEN));
  });
});
