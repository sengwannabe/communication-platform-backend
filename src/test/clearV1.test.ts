import request from 'sync-request';
import { SERVER_URL } from './wrapper';

describe('Expected Cases', () => {
  test('Test successful clear', () => {
    const OK = 200;
    const res = request(
      'DELETE',
      SERVER_URL + '/clear/v1',
      {
        qs: {}
      }
    );
    expect(res.statusCode).toBe(OK);
  });
});
