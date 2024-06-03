import { FORBIDDEN, clearV1, dmCreateV2, dmListV2 } from '../wrapper';
import { createUser } from '../testHelper';

describe('Sucessful dmListV2 Tests', () => {
  beforeEach(() => {
    clearV1();
  });

  test('User is not a member of any dms', () => {
    const authUser = createUser();
    const uIds = [];
    uIds.push(authUser.authUser2.authUserId);
    dmCreateV2(authUser.authUser1.token, uIds);
    expect(dmListV2(authUser.authUser3.token)).toEqual({ dms: [] });
  });

  test('User is member of 1 dm', () => {
    const authUser = createUser();
    const uIds = [];
    uIds.push(authUser.authUser2.authUserId);
    uIds.push(authUser.authUser3.authUserId);
    const dm1 = dmCreateV2(authUser.authUser1.token, uIds);
    expect(dmListV2(authUser.authUser2.token)).toEqual({
      dms: [
        {
          dmId: dm1.dmId,
          name: 'bking, cgregory, dkong',
        }
      ]
    }
    );
  });

  test('User are member of multiple dm', () => {
    const authUser = createUser();
    const uIds = [];
    uIds.push(authUser.authUser2.authUserId);
    uIds.push(authUser.authUser3.authUserId);
    uIds.push(authUser.authUser4.authUserId);
    const dm1 = dmCreateV2(authUser.authUser1.token, uIds);
    uIds.pop();
    const dm2 = dmCreateV2(authUser.authUser4.token, uIds);
    uIds.pop();
    const dm3 = dmCreateV2(authUser.authUser3.token, uIds);
    expect(dmListV2(authUser.authUser2.token)).toEqual({
      dms: [
        {
          dmId: dm1.dmId,
          name: 'akeng, bking, cgregory, dkong',
        },
        {
          dmId: dm2.dmId,
          name: 'akeng, bking, dkong',
        },
        {
          dmId: dm3.dmId,
          name: 'bking, dkong',
        }
      ]
    }
    );
  });
});

describe('Unsuccessful dmListV2 Tests', () => {
  beforeEach(() => {
    clearV1();
  });
  test('token is invalid', () => {
    const authUser = createUser();
    const uIds = [];
    uIds.push(authUser.authUser2.authUserId);
    dmCreateV2(authUser.authUser1.token, uIds);
    expect(() => dmListV2(authUser.authUser1.token + 100)).toThrow(Error(FORBIDDEN));
  });
});
