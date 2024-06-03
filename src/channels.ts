import { getData, setData, ChannelDetails, Message, Standup } from './dataStore';
import { findSessionV2, findUser, isMember, IdCreate, BAD_REQUEST } from './helper';
import { invalidNameStr } from './errorMessages';
import HTTPError from 'http-errors';
import { userStatsJoinedChannel, usersStatsChannelsExist } from './users';

/**
 *
 * @param token      Unique session for user
 * @param name       The name of the channel
 * @param isPublic   Whether the channel is public or not
 * @returns          An object containing the channelId
 */
export function channelsCreateV3(token: string, name: string, isPublic: boolean): { channelId: number } {
  const dataStore = getData();
  const session = findSessionV2(token);
  // name has invalid length
  if (name.length > 20 || name.length < 1) {
    throw HTTPError(BAD_REQUEST, invalidNameStr('Channel'));
  }
  const id = IdCreate();
  const ownerMemberIds = [session.authUserId];
  const allMemberIds = [session.authUserId];
  const messages: Message[] = [];
  const standup: Standup = {
    isActive: false,
    timeFinish: null,
    message: undefined,
  };
  dataStore.channels.push({
    channelId: id,
    name: name,
    isPublic: isPublic,
    ownerMembers: ownerMemberIds,
    allMembers: allMemberIds,
    messages: messages,
    standup: standup,
  });
  userStatsJoinedChannel(token);
  usersStatsChannelsExist(token);
  setData(dataStore);
  return {
    channelId: id,
  };
}

/**
 * Provides an array of all channels, including private channels (and their associated details)
 *
 * @param token      Unique session for user
 * @returns          Details of all channels
 */
export function channelsListAllV3(token : string) : { channels: ChannelDetails[] } {
  const dataStore = getData();
  findSessionV2(token);
  const channelArray: ChannelDetails[] = [];
  for (const channel of dataStore.channels) {
    channelArray.push({
      channelId: channel.channelId,
      name: channel.name,
    });
  }
  return {
    channels: channelArray,
  };
}

/**
 * Provides an array of all channels (and their associated details)
 * that the authorised user is part of.
 *
 * @param token      Unique session for user
 * @returns          List of channel objects that consists of the channelId and name
 *
 */
export function channelsListV3(token: string): { channels: ChannelDetails[] } {
  const session = findSessionV2(token);
  const dataStore = getData();
  const memberChannels: ChannelDetails[] = [];
  console.log('session1: ', session);
  const user = findUser(dataStore, session.authUserId);
  for (const channel of dataStore.channels) {
    if (isMember(channel, user)) {
      memberChannels.push({
        channelId: channel.channelId,
        name: channel.name,
      });
    }
  }
  return {
    channels: memberChannels,
  };
}
