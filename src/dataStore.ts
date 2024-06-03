import fs from 'fs';

// Interfaces

export interface Reacts {
  reactId: number,
  uIds: number[],
}

export interface ReactsDetails {
  reactId: number,
  uIds: number[],
  isThisUserReacted: boolean,
}

export interface Standup {
  isActive: boolean,
  timeFinish: number,
  message: string[],
}

export interface StandupDetail {
  isActive: boolean,
  timeFinish: number,
}
/**
 * Message interface.
 */
export interface Message {
  messageId: number,
  uId: number,
  message: string,
  timeSent: number,
  reacts: Reacts[],
  isPinned: boolean,
}

export interface MessageDetails {
  messageId: number,
  uId: number,
  message: string,
  timeSent: number,
  reacts: ReactsDetails[],
  isPinned: boolean,
}

export interface UserStats {
  channelsJoined: {numChannelsJoined: number, timeStamp: number}[],
  dmsJoined: {numDmsJoined: number, timeStamp: number}[],
  messagesSent: {numMessagesSent: number, timeStamp: number}[],
  involvementRate: number
}

export interface Notification {
  channelId: number,
  dmId: number,
  notificationMessage: string,
}

export interface User {
  uId: number,
  handleStr: string,
  email: string,
  nameFirst: string,
  nameLast: string,
  password: string,
  permissionId: number,
  stats: UserStats,
  profileImgUrl: string,
  notifications: Notification[],
}

export interface UserDetails {
  uId: number,
  handleStr: string,
  email: string,
  nameFirst: string,
  nameLast: string,
  profileImgUrl: string,
}

export interface Channel {
  channelId: number,
  name: string,
  isPublic: boolean,
  ownerMembers: number[],
  allMembers: number[],
  messages: Message[],
  standup: Standup,
}

export interface ChannelDetails {
  channelId: number,
  name: string,
}

export interface DM {
  dmId: number,
  name: string,
  ownerId: number,
  allMembers: number[],
  messages: Message[],
}

export interface DMDetails {
  dmId: number,
  name: string,
}

export interface Session {
  token: string,
  authUserId: number,
}

export interface PasswordRequests {
  uId: number,
  code: string,
}

export interface WorkplaceStats {
  channelsExist: {numChannelsExist: number, timeStamp: number}[],
  dmsExist: {numDmsExist: number, timeStamp: number}[],
  messagesExist: {numMessagesExist: number, timeStamp: number}[],
  utilizationRate: number

}

export interface DataStore {
  users: User[],
  channels: Channel[],
  dms: DM[],
  sessions: Session[],
  passwordrequests: PasswordRequests[],
  stats: {
    channelsExist: [{numChannelsExist: number, timeStamp: number}],
    dmsExist: [{numDmsExist: number, timeStamp: number}],
    messagesExist: [{numMessagesExist: number, timeStamp: number}],
    utilizationRate: number
  } // WorkplaceStats;
}

function defaultData(): DataStore {
  return {
    users: [],
    channels: [],
    dms: [],
    sessions: [],
    stats: {
      channelsExist: [{
        numChannelsExist: 0,
        timeStamp: 0
      }],
      dmsExist: [{
        numDmsExist: 0,
        timeStamp: 0
      }],
      messagesExist: [{
        numMessagesExist: 0,
        timeStamp: 0
      }],
      utilizationRate: 0,
    },
    passwordrequests: [],
  };
}

function readFromFile(): DataStore {
  if (!fs.existsSync('dataStore.json')) {
    saveToFile(defaultData());
  }
  const dataJson = fs.readFileSync('dataStore.json');
  return JSON.parse(dataJson.toString());
}

function saveToFile(data: DataStore) {
  const dataJson = JSON.stringify(data);
  fs.writeFileSync('dataStore.json', dataJson);
}

let data = readFromFile();

// Use get() to access the data
function getData(): DataStore {
  return data;
}

// Use set(newData) to pass in the entire data object, with modifications made
function setData(newData: DataStore) {
  data = newData;
  saveToFile(data);
}

export { getData, setData, defaultData };

let temp: ReturnType<typeof setTimeout>[] = [];

export function getTemp() : ReturnType<typeof setTimeout>[] {
  return temp;
}

export function setTemp(newTemp: ReturnType<typeof setTimeout>[]) {
  temp = newTemp;
}
