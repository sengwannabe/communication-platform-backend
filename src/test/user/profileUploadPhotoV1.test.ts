import { DEFAULT_PROFILE_URL } from '../testHelper';
import {
  clearV1, authRegisterV3,
  BAD_REQUEST, FORBIDDEN, profileUploadPhotoV1, userProfileV3
} from '../wrapper';

const BEAN = 'https://i.etsystatic.com/15536434/r/il/7a2479/2853992921/il_570xN.2853992921_fbdo.jpg';
const VALID_IMAGE_LINK = 'http://www.traveller.com.au/content/dam/images/h/1/p/q/1/k/image.related.articleLeadwide.620x349.h1pq27.png/1596176460724.jpg';
const INVALID_IMAGE_PNG = 'http://pngimg.com/uploads/pineapple/pineapple_PNG2756.png';
const INVALID_IMAGE_LINK = 'http://example.com/image.jpg';

describe('Error cases', () => {
  beforeEach(() => {
    clearV1();
  });

  test('invalid Url', () => {
    const user1 = authRegisterV3('generic@provider.com', 'ThisIsASimplePassword', 'GenFail', 'Eric');
    const url = INVALID_IMAGE_LINK;
    expect(() => profileUploadPhotoV1(url, 5, 8, 12, 14, user1.token)).toThrow(Error(BAD_REQUEST));
  });

  test('invalid Size xStart = xEnd', () => {
    const user1 = authRegisterV3('generic@provider.com', 'ThisIsASimplePassword', 'Gena', 'Eric');
    expect(() => profileUploadPhotoV1(VALID_IMAGE_LINK, 1, 6, 1, 14, user1.token)).toThrow(Error(BAD_REQUEST));
  });
  test('invalid Size yStart = yEnd', () => {
    const user1 = authRegisterV3('generic@provider.com', 'ThisIsASimplePassword', 'Gend', 'Eric');
    expect(() => profileUploadPhotoV1(VALID_IMAGE_LINK, 1, 7, 12, 7, user1.token)).toThrow(Error(BAD_REQUEST));
  });
  test('invalid Size xStart > bound', () => {
    const user1 = authRegisterV3('generic@provider.com', 'ThisIsASimplePassword', 'Genb', 'Eric');
    expect(() => profileUploadPhotoV1(VALID_IMAGE_LINK, 700, 7, 750, 7, user1.token)).toThrow(Error(BAD_REQUEST));
  });
  test('invalid Size xEnd > bound', () => {
    const user1 = authRegisterV3('generic@provider.com', 'ThisIsASimplePassword', 'Genb', 'Eric');
    expect(() => profileUploadPhotoV1(VALID_IMAGE_LINK, 0, 7, 750, 7, user1.token)).toThrow(Error(BAD_REQUEST));
  });
  test('invalid Size yStart > bound', () => {
    const user1 = authRegisterV3('generic@provider.com', 'ThisIsASimplePassword', 'Genc', 'Eric');
    expect(() => profileUploadPhotoV1(VALID_IMAGE_LINK, 1, 380, 12, 400, user1.token)).toThrow(Error(BAD_REQUEST));
  });
  test('invalid Size yEnd > bound', () => {
    const user1 = authRegisterV3('generic@provider.com', 'ThisIsASimplePassword', 'Genc', 'Eric');
    expect(() => profileUploadPhotoV1(VALID_IMAGE_LINK, 1, 0, 12, 400, user1.token)).toThrow(Error(BAD_REQUEST));
  });
  test('not JPG', () => {
    const user1 = authRegisterV3('generic@provider.com', 'ThisIsASimplePassword', 'Gene', 'Eric');
    expect(() => profileUploadPhotoV1(INVALID_IMAGE_PNG, 5, 8, 12, 14, user1.token)).toThrow(Error(BAD_REQUEST));
  });

  test('Token is invalid ', () => {
    const user = authRegisterV3('wowzer22@gmail.com', '123456', 'mar', 'Wonto');
    expect(() => profileUploadPhotoV1(VALID_IMAGE_LINK, 1, 6, 1, 14, user.token + 'fake')).toThrow(Error(FORBIDDEN));
  });
});

describe('Valid cases', () => {
  beforeEach(() => {
    clearV1();
  });

  test('valid Size', () => { // this is working website with the same image hayden used in the lec
    const user1 = authRegisterV3('generic@provider.com', 'ThisIsASimplePassword', 'Gen', 'Eric');
    expect(profileUploadPhotoV1(VALID_IMAGE_LINK, 45, 15, 100, 185, user1.token)).toEqual({});
    expect(userProfileV3(user1.token, user1.authUserId).profileImgUrl).not.toStrictEqual(DEFAULT_PROFILE_URL);
  });

  test('Changing image again', () => {
    const user1 = authRegisterV3('generic@provider.com', 'ThisIsASimplePassword', 'Gen', 'Eric');
    expect(profileUploadPhotoV1(VALID_IMAGE_LINK, 45, 15, 100, 185, user1.token)).toEqual({});
    expect(userProfileV3(user1.token, user1.authUserId).profileImgUrl).not.toStrictEqual(DEFAULT_PROFILE_URL);
    expect(profileUploadPhotoV1(BEAN, 100, 100, 470, 470, user1.token)).toEqual({});
  });
});
