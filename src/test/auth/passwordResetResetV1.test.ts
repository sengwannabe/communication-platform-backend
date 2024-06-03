import { BAD_REQUEST, authPasswordResetResetV1, clearV1 } from '../wrapper';

// Cannot test a successful case as jest cannot access the emails that the code was sent to.
// Instead, tested on the frontend

describe('Unsuccessful password reset', () => {
  beforeEach(() => {
    clearV1();
  });
  test('Reset code not valid', () => {
    expect(() => authPasswordResetResetV1('badcode', '123456')).toThrow(Error(BAD_REQUEST));
  });
  // Cannot test for invalid password as the error for the reset code will come first.
  // Instead, tested on the frontend
});
