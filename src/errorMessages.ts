/**
 * Function to return invalid email message
 *
 * @returns invalid email.
 */
const invalidEmailStr = (): string => {
  return 'invalid email.';
};

/**
 * Function to return that email is already in use
 *
 * @returns email already in use.
 */
const emailInUseStr = (): string => {
  return 'email already in use.';
};

/**
 * Function that returns invalid token message
 *
 * @returns invalid token.
 */
const invalidTokenStr = (): string => {
  return 'invalid token.';
};

/**
 * Function that returns invalid password message
 *
 * @returns invalid password.
 */
const invalidPasswordStr = (): string => {
  return 'invalid password.';
};

/**
 * Function that returns a message member is already a member of something
 *
 * @param name Relevant group, e.g. dm/channel etc.
 * @returns    already a member of the `name`.
 */
const alreadyMember = (name: string): string => {
  return `already a member of the ${name}.`;
};

/**
 * Function that returns a message member is not a member of something
 *
 * @param name Relevant group, e.g. dm/channel etc.
 * @returns    not a member of the `name`.
 */
const notMember = (name: string): string => {
  return `not a member of the ${name}.`;
};

/**
 * Function that returns invalid name message
 *
 * @param name Relevant name error
 * @returns    invalid `name` name.
 */
const invalidNameStr = (name: string): string => {
  return `invalid ${name} name.`;
};

/**
 * Function that returns invalid id message
 *
 * @param name Relevant id error i.e user id / channel id
 * @returns    invalid `name`id.
 */
const invalidIdStr = (name: string): string => {
  return `invalid ${name}id.`;
};

/**
 * Function that returns invalid length string if too short
 *
 * @param value  Relevant variable
 * @param length Minimum length allowed
 * @returns      `value` too short: minimum length `length`.
 */
const errTooShort = (value: string, length: string): string => {
  return `${value} too short: minimum length ${length}.`;
};

/**
 * Function that returns invalid length string if too long
 *
 * @param value  Relevant variable
 * @param length Maxmimum length allowed
 * @returns      `value` too long: maximum length `length`.
 */
const errTooLong = (value: string, length: string): string => {
  return `${value} too long: maximum length ${length}.`;
};

/**
 * Function that returns if a variable cannot be found
 *
 * @param value Relevant variable
 * @returns     `value` not found.
 */
const errNotFound = (value: string): string => {
  return `${value} not found.`;
};

/**
 * Function that returns if a user lacks permissions.
 *
 * @returns     user does not have permission.
 */
const errInsufficentPerms = (): string => {
  return 'user does not have permission.';
};

export {
  invalidEmailStr, invalidIdStr, invalidNameStr,
  invalidPasswordStr, invalidTokenStr, emailInUseStr,
  alreadyMember, notMember,
  errTooShort, errTooLong, errNotFound, errInsufficentPerms,
};
