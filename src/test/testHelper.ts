import { UserDetails } from '../dataStore';
import { authRegisterV3 } from './wrapper';

export interface AuthUser { token: string, authUserId: number }

const IMG_SERVER = 'averyuninterestingwebsite.alwaysdata.net/';
export const DEFAULT_PROFILE_URL = IMG_SERVER + 'static/profile.jpg';

export const usersData: UserDetails[] = [
  {
    uId: 1,
    handleStr: 'globalowner',
    email: 'global@owner.com',
    nameFirst: 'Global',
    nameLast: 'Owner',
    profileImgUrl: DEFAULT_PROFILE_URL,
  },
  {
    uId: 2,
    handleStr: 'localowner',
    email: 'local@owner.com',
    nameFirst: 'Local',
    nameLast: 'Owner',
    profileImgUrl: DEFAULT_PROFILE_URL,
  },
  {
    uId: 3,
    handleStr: 'generic',
    email: 'generic@user.com',
    nameFirst: 'Gen',
    nameLast: 'Eric',
    profileImgUrl: DEFAULT_PROFILE_URL,
  },
];

export const messagesData: string[] = [
  'Sample message',
  'Another sample message',
  'Third sample message',
];

/**
 * Factory function to return a 1000 character long lorem ipsum.
 */
export function lorem1000char() {
  return 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce vel arcu eu erat bibendum euismod. Fusce in urna vitae est condimentum convallis. Aenean sagittis in dolor vel hendrerit. Nunc tristique ullamcorper augue. Nunc euismod placerat eros a viverra. Pellentesque pharetra augue non felis pellentesque molestie. In hac habitasse platea dictumst. Nulla facilisis augue sit amet mollis fringilla. Cras dapibus, risus non fringilla luctus, augue quam scelerisque mi, eu mollis odio urna quis lorem. Vivamus tincidunt pretium tellus, non hendrerit diam ultricies a. Mauris urna nunc, faucibus dignissim lacinia eu, convallis porta orci. Proin tempus convallis porttitor. Nunc porttitor varius nisi, volutpat maximus massa sagittis a. Morbi eget sapien risus. Maecenas tempor malesuada massa, ut vehicula ipsum finibus vel. Ut viverra lectus erat, eu suscipit elit aliquam eget. Donec tristique varius luctus. Donec cursus eu dolor ut rhoncus. Morbi rhoncus lorem viverra lacus molestie, et gravida.';
}

/**
 * Factory function to return a 1001 character long lorem ipsum.
 */
export function lorem1001char() {
  return 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin egestas eleifend nunc, a condimentum sem viverra eget. Pellentesque maximus pellentesque dolor id accumsan. Sed in nisl condimentum, viverra magna at, tincidunt lectus. Nam malesuada semper ante id laoreet. Interdum et malesuada fames ac ante ipsum primis in faucibus. Integer sed lorem venenatis, porttitor augue ut, scelerisque est. Etiam est arcu, ornare ut urna eu, dictum condimentum urna. Etiam faucibus ipsum eget ligula varius, vel viverra arcu eleifend. Nam id risus mattis, malesuada purus vitae, commodo augue. Donec imperdiet euismod posuere. Phasellus nec justo vitae lectus molestie cursus quis eu metus. Duis in orci nec urna ornare pretium ut ac felis. Curabitur quis sem quam. Quisque lobortis nisi eu augue lobortis, a tincidunt nulla posuere. Maecenas vitae tellus in mauris porttitor viverra ut vitae dolor. Integer pulvinar dui non dolor tincidunt pulvinar. Integer eget sem efficitur, placerat justo sed, auctor dui.';
}

/**
 * Factory function to help generate three users.
 *
 * @returns An object containing three users
 */
export function generateThreeUsers(): AuthUser[] {
  const usersList = [];
  for (const user of usersData) {
    usersList.push(authRegisterV3(user.email, 'ABadPass', user.nameFirst, user.nameLast));
  }
  return usersList;
}

/**
 * Create 4 new users
 * @returns object of 4 new users
 */
export function createUser() {
  const authUser1 = authRegisterV3('stevenpool123@gmail.com', 'coolpassword1', 'C', 'Gregory');
  const authUser2 = authRegisterV3('stevoKing2@gmail.com', 'coolpassword2', 'B', 'King');
  const authUser3 = authRegisterV3('stevoKing3@gmail.com', 'coolpassword3', 'D', 'Kong');
  const authUser4 = authRegisterV3('stevoKing4@gmail.com', 'coolpassword4', 'A', 'Keng');
  return {
    authUser1: authUser1,
    authUser2: authUser2,
    authUser3: authUser3,
    authUser4: authUser4
  };
}
