import {
  clearV1, notificationsGetV1,
  channelsCreateV3, channelInviteV3, channelJoinV3, channelLeaveV2,
  dmCreateV2, dmLeaveV2,
  messageSendV2, messageSenddmV2, messageReactV1, messageUnreactV1, messageEditV2,
  FORBIDDEN,
} from '../wrapper';
import {
  generateThreeUsers,
  AuthUser, usersData,
} from '../testHelper';

const VALID_REACT_ID = 1;

let users: AuthUser[];

function setupChannel(): { channelId: number, dmId: number, chatName: string } {
  const chatName = 'Channel 0';
  const channel = channelsCreateV3(users[1].token, chatName, true);
  channelInviteV3(users[1].token, channel.channelId, users[0].authUserId);
  channelInviteV3(users[1].token, channel.channelId, users[2].authUserId);
  return { channelId: channel.channelId, dmId: -1, chatName: chatName };
}

function setupDM(): { channelId: number, dmId: number, chatName: string } {
  const dm = dmCreateV2(users[1].token, [users[0].authUserId, users[2].authUserId]);
  const chatName = 'generic, globalowner, localowner';
  return { channelId: -1, dmId: dm.dmId, chatName: chatName };
}

function addedToChatObj(channelId: number, dmId: number, chatName: string, adder: string) {
  return {
    channelId: channelId,
    dmId: dmId,
    notificationMessage: adder + ' added you to ' + chatName,
  };
}

function taggedInChatObj(channelId: number, dmId: number, chatName: string, tagger: string, message: string) {
  return {
    channelId: channelId,
    dmId: dmId,
    notificationMessage: tagger + ' tagged you in ' + chatName + ': ' + message.slice(0, 20),
  };
}

function reactedInChatObj(channelId: number, dmId: number, chatName: string, reacter: string) {
  return {
    channelId: channelId,
    dmId: dmId,
    notificationMessage: reacter + ' reacted to your message in ' + chatName,
  };
}

const tests = [
  {
    source: 'Channel',
    setupScript: setupChannel,
    sendScript: messageSendV2,
    leaveScript: channelLeaveV2,
  },
  {
    source: 'DM',
    setupScript: setupDM,
    sendScript: messageSenddmV2,
    leaveScript: dmLeaveV2,
  },
];

beforeEach(() => {
  clearV1();
  users = generateThreeUsers();
});

describe.each(tests)('Expected Cases - $source', ({ setupScript, sendScript }) => {
  describe('Invited to chat cases', () => {
    test('Invited to a chat', () => {
      const { channelId, dmId, chatName } = setupScript();
      expect(notificationsGetV1(users[0].token)).toStrictEqual({
        notifications: [
          addedToChatObj(channelId, dmId, chatName, usersData[1].handleStr),
        ]
      });
    });

    test('Creator not notified', () => {
      setupScript();
      expect(notificationsGetV1(users[1].token)).toStrictEqual({
        notifications: [],
      });
    });
  });

  describe('Message Tag Cases', () => {
    test('Tagged in a chat', () => {
      const { channelId, dmId, chatName } = setupScript();
      const chatId = channelId !== -1 ? channelId : dmId;
      const message = 'Hello @' + usersData[0].handleStr;
      sendScript(users[2].token, chatId, message);
      expect(notificationsGetV1(users[0].token)).toStrictEqual({
        notifications: [
          taggedInChatObj(channelId, dmId, chatName, usersData[2].handleStr, message),
          addedToChatObj(channelId, dmId, chatName, usersData[1].handleStr),
        ]
      });
    });

    test('Long message tag', () => {
      const { channelId, dmId, chatName } = setupScript();
      const chatId = channelId !== -1 ? channelId : dmId;
      const message = 'Insert a very long and unneccessary ranbling argument you would probably see on your average Twitter canceller feed, yeah I went there, cry about it @' + usersData[0].handleStr;
      sendScript(users[2].token, chatId, message);
      expect(notificationsGetV1(users[0].token)).toStrictEqual({
        notifications: [
          taggedInChatObj(channelId, dmId, chatName, usersData[2].handleStr, message),
          addedToChatObj(channelId, dmId, chatName, usersData[1].handleStr),
        ]
      });
    });

    test('Spamming tag in a chat', () => {
      const { channelId, dmId, chatName } = setupScript();
      const chatId = channelId !== -1 ? channelId : dmId;
      const message = 'Hey @' + usersData[0].handleStr + ' listen @' + usersData[0].handleStr;
      sendScript(users[2].token, chatId, message);
      expect(notificationsGetV1(users[0].token)).toStrictEqual({
        notifications: [
          taggedInChatObj(channelId, dmId, chatName, usersData[2].handleStr, message),
          addedToChatObj(channelId, dmId, chatName, usersData[1].handleStr),
        ]
      });
    });

    test('Not quite a tag in a chat', () => {
      const { channelId, dmId, chatName } = setupScript();
      const chatId = channelId !== -1 ? channelId : dmId;
      const message = 'Hello @' + usersData[0].handleStr + '2';
      sendScript(users[2].token, chatId, message);
      expect(notificationsGetV1(users[0].token)).toStrictEqual({
        notifications: [
          addedToChatObj(channelId, dmId, chatName, usersData[1].handleStr),
        ]
      });
    });

    test('Tagging yourself in a chat', () => {
      const { channelId, dmId, chatName } = setupScript();
      const chatId = channelId !== -1 ? channelId : dmId;
      const message = 'Tag @' + usersData[0].handleStr;
      sendScript(users[0].token, chatId, message);
      expect(notificationsGetV1(users[0].token)).toStrictEqual({
        notifications: [
          taggedInChatObj(channelId, dmId, chatName, usersData[0].handleStr, message),
          addedToChatObj(channelId, dmId, chatName, usersData[1].handleStr),
        ]
      });
    });

    test('Multiple people tagged', () => {
      const { channelId, dmId, chatName } = setupScript();
      const chatId = channelId !== -1 ? channelId : dmId;
      const message = 'You have been multitagged @' + usersData[2].handleStr + ' @' + usersData[0].handleStr;
      sendScript(users[1].token, chatId, message);
      expect(notificationsGetV1(users[0].token)).toStrictEqual({
        notifications: [
          taggedInChatObj(channelId, dmId, chatName, usersData[1].handleStr, message),
          addedToChatObj(channelId, dmId, chatName, usersData[1].handleStr),
        ]
      });
      expect(notificationsGetV1(users[2].token)).toStrictEqual({
        notifications: [
          taggedInChatObj(channelId, dmId, chatName, usersData[1].handleStr, message),
          addedToChatObj(channelId, dmId, chatName, usersData[1].handleStr),
        ]
      });
    });

    test('Tags are ended by non-alphanumerics', () => {
      const { channelId, dmId, chatName } = setupScript();
      const chatId = channelId !== -1 ? channelId : dmId;
      const message = 'You have been multitagged @' + usersData[2].handleStr + '@' + usersData[0].handleStr + '!';
      sendScript(users[1].token, chatId, message);
      expect(notificationsGetV1(users[0].token)).toStrictEqual({
        notifications: [
          taggedInChatObj(channelId, dmId, chatName, usersData[1].handleStr, message),
          addedToChatObj(channelId, dmId, chatName, usersData[1].handleStr),
        ]
      });
      expect(notificationsGetV1(users[2].token)).toStrictEqual({
        notifications: [
          taggedInChatObj(channelId, dmId, chatName, usersData[1].handleStr, message),
          addedToChatObj(channelId, dmId, chatName, usersData[1].handleStr),
        ]
      });
    });
  });

  describe('Message Edit Cases', () => {
    test('Message editted to tag', () => {
      const { channelId, dmId, chatName } = setupScript();
      const chatId = channelId !== -1 ? channelId : dmId;
      const message1 = 'Hello';
      const messageObj = sendScript(users[2].token, chatId, message1);
      const message2 = 'Hello @' + usersData[0].handleStr;
      messageEditV2(users[2].token, messageObj.messageId, message2);
      expect(notificationsGetV1(users[0].token)).toStrictEqual({
        notifications: [
          taggedInChatObj(channelId, dmId, chatName, usersData[2].handleStr, message2),
          addedToChatObj(channelId, dmId, chatName, usersData[1].handleStr),
        ]
      });
    });

    test('Message editted to untag', () => {
      const { channelId, dmId, chatName } = setupScript();
      const chatId = channelId !== -1 ? channelId : dmId;
      const message1 = 'Hello @' + usersData[0].handleStr;
      const messageObj = sendScript(users[2].token, chatId, message1);
      const message2 = 'Hello';
      messageEditV2(users[2].token, messageObj.messageId, message2);
      expect(notificationsGetV1(users[0].token)).toStrictEqual({
        notifications: [
          taggedInChatObj(channelId, dmId, chatName, usersData[2].handleStr, message1),
          addedToChatObj(channelId, dmId, chatName, usersData[1].handleStr),
        ]
      });
    });

    test('Message editted and still tagged', () => {
      const { channelId, dmId, chatName } = setupScript();
      const chatId = channelId !== -1 ? channelId : dmId;
      const message1 = 'Hello @' + usersData[0].handleStr;
      const messageObj = sendScript(users[2].token, chatId, message1);
      const message2 = 'Goodbye @' + usersData[0].handleStr;
      messageEditV2(users[2].token, messageObj.messageId, message2);
      expect(notificationsGetV1(users[0].token)).toStrictEqual({
        notifications: [
          taggedInChatObj(channelId, dmId, chatName, usersData[2].handleStr, message2),
          taggedInChatObj(channelId, dmId, chatName, usersData[2].handleStr, message1),
          addedToChatObj(channelId, dmId, chatName, usersData[1].handleStr),
        ]
      });
    });

    test('Message editted to tag another', () => {
      const { channelId, dmId, chatName } = setupScript();
      const chatId = channelId !== -1 ? channelId : dmId;
      const message1 = 'Hello @' + usersData[0].handleStr;
      const messageObj = sendScript(users[2].token, chatId, message1);
      const message2 = 'Oops I meant hello @' + usersData[1].handleStr;
      messageEditV2(users[2].token, messageObj.messageId, message2);
      expect(notificationsGetV1(users[0].token)).toStrictEqual({
        notifications: [
          taggedInChatObj(channelId, dmId, chatName, usersData[2].handleStr, message1),
          addedToChatObj(channelId, dmId, chatName, usersData[1].handleStr),
        ]
      });
      expect(notificationsGetV1(users[1].token)).toStrictEqual({
        notifications: [
          taggedInChatObj(channelId, dmId, chatName, usersData[2].handleStr, message2),
        ]
      });
    });
  });

  describe('Reaction Cases', () => {
    test('Reacted in a chat', () => {
      const { channelId, dmId, chatName } = setupScript();
      const chatId = channelId !== -1 ? channelId : dmId;
      const messageObj = sendScript(users[0].token, chatId, 'Hello @' + usersData[1].handleStr);
      messageReactV1(users[2].token, messageObj.messageId, VALID_REACT_ID);
      expect(notificationsGetV1(users[0].token)).toStrictEqual({
        notifications: [
          reactedInChatObj(channelId, dmId, chatName, usersData[2].handleStr),
          addedToChatObj(channelId, dmId, chatName, usersData[1].handleStr),
        ]
      });
    });

    test('Unreacted in a chat', () => {
      const { channelId, dmId, chatName } = setupScript();
      const chatId = channelId !== -1 ? channelId : dmId;
      const messageObj = sendScript(users[0].token, chatId, 'Hello!');
      messageReactV1(users[2].token, messageObj.messageId, VALID_REACT_ID);
      messageUnreactV1(users[2].token, messageObj.messageId, VALID_REACT_ID);
      expect(notificationsGetV1(users[0].token)).toStrictEqual({
        notifications: [
          reactedInChatObj(channelId, dmId, chatName, usersData[2].handleStr),
          addedToChatObj(channelId, dmId, chatName, usersData[1].handleStr),
        ]
      });
    });

    test('Self reacted in a chat', () => {
      const { channelId, dmId, chatName } = setupScript();
      const chatId = channelId !== -1 ? channelId : dmId;
      const messageObj = sendScript(users[0].token, chatId, 'Hello!');
      messageReactV1(users[0].token, messageObj.messageId, VALID_REACT_ID);
      expect(notificationsGetV1(users[0].token)).toStrictEqual({
        notifications: [
          reactedInChatObj(channelId, dmId, chatName, usersData[0].handleStr),
          addedToChatObj(channelId, dmId, chatName, usersData[1].handleStr),
        ]
      });
    });

    test('Multiple reacts in a chat', () => {
      const { channelId, dmId, chatName } = setupScript();
      const chatId = channelId !== -1 ? channelId : dmId;
      const messageObj = sendScript(users[0].token, chatId, 'Hello!');
      messageReactV1(users[2].token, messageObj.messageId, VALID_REACT_ID);
      messageReactV1(users[1].token, messageObj.messageId, VALID_REACT_ID);
      expect(notificationsGetV1(users[0].token)).toStrictEqual({
        notifications: [
          reactedInChatObj(channelId, dmId, chatName, usersData[1].handleStr),
          reactedInChatObj(channelId, dmId, chatName, usersData[2].handleStr),
          addedToChatObj(channelId, dmId, chatName, usersData[1].handleStr),
        ]
      });
    });
  });
});

describe.each(tests)('Leaving Cases - $source', ({ setupScript, sendScript, leaveScript }) => {
  test('Tags do not work if someone has left', () => {
    const { channelId, dmId, chatName } = setupScript();
    const chatId = channelId !== -1 ? channelId : dmId;

    const message1 = 'Goodbye @' + usersData[2].handleStr;
    sendScript(users[0].token, chatId, message1);
    leaveScript(users[2].token, chatId);

    const message2 = 'Oh no, where did @' + usersData[2].handleStr + ' go?';
    sendScript(users[0].token, chatId, message2);

    expect(notificationsGetV1(users[2].token)).toStrictEqual({
      notifications: [
        taggedInChatObj(channelId, dmId, chatName, usersData[0].handleStr, message1),
        addedToChatObj(channelId, dmId, chatName, usersData[1].handleStr),
      ]
    });
  });

  test('Reacts do not work if someone has left', () => {
    const { channelId, dmId, chatName } = setupScript();
    const chatId = channelId !== -1 ? channelId : dmId;

    const messageObj = sendScript(users[2].token, chatId, 'Going to leave now');
    messageReactV1(users[0].token, messageObj.messageId, VALID_REACT_ID);
    leaveScript(users[2].token, chatId);

    messageReactV1(users[1].token, messageObj.messageId, VALID_REACT_ID);

    expect(notificationsGetV1(users[2].token)).toStrictEqual({
      notifications: [
        reactedInChatObj(channelId, dmId, chatName, usersData[0].handleStr),
        addedToChatObj(channelId, dmId, chatName, usersData[1].handleStr),
      ]
    });
  });
});

describe('Rejoining cases - Channel', () => {
  test('Leave chat and be reinvited to chat', () => {
    const { channelId, dmId, chatName } = setupChannel();
    channelLeaveV2(users[2].token, channelId);
    channelInviteV3(users[0].token, channelId, users[2].authUserId);
    expect(notificationsGetV1(users[2].token)).toStrictEqual({
      notifications: [
        addedToChatObj(channelId, dmId, chatName, usersData[0].handleStr),
        addedToChatObj(channelId, dmId, chatName, usersData[1].handleStr),
      ]
    });
  });

  test('Leave chat and rejoin', () => {
    const { channelId, dmId, chatName } = setupChannel();
    channelLeaveV2(users[2].token, channelId);
    channelJoinV3(users[2].token, channelId);
    expect(notificationsGetV1(users[2].token)).toStrictEqual({
      notifications: [
        addedToChatObj(channelId, dmId, chatName, usersData[1].handleStr),
      ]
    });
  });

  test('Tags and reacts work on rejoin', () => {
    const { channelId, dmId, chatName } = setupChannel();
    const message1Obj = messageSendV2(users[2].token, channelId, 'Going to leave now');
    channelLeaveV2(users[2].token, channelId);

    messageReactV1(users[0].token, message1Obj.messageId, VALID_REACT_ID);
    const message1 = 'Can someone get @' + usersData[2].handleStr + ' back here?';
    const message2Obj = messageSendV2(users[1].token, channelId, message1);

    channelJoinV3(users[2].token, channelId);
    messageReactV1(users[1].token, message1Obj.messageId, VALID_REACT_ID);
    const message2 = 'Welcome back @' + usersData[2].handleStr;
    messageEditV2(users[0].token, message2Obj.messageId, message2);

    expect(notificationsGetV1(users[2].token)).toStrictEqual({
      notifications: [
        taggedInChatObj(channelId, dmId, chatName, usersData[0].handleStr, message2),
        reactedInChatObj(channelId, dmId, chatName, usersData[1].handleStr),
        addedToChatObj(channelId, dmId, chatName, usersData[1].handleStr),
      ]
    });
  });
});

describe('Limit Tests', () => {
  test('Empty notifications', () => {
    expect(notificationsGetV1(users[1].token)).toStrictEqual({ notifications: [] });
  });

  test('Capped notifications', () => {
    const { channelId, dmId, chatName } = setupChannel();
    for (let i = 0; i < 25; i++) {
      channelLeaveV2(users[2].token, channelId);
      channelInviteV3(users[1].token, channelId, users[2].authUserId);
    }
    const notifications = Array(20).fill(addedToChatObj(channelId, dmId, chatName, usersData[1].handleStr));
    expect(notificationsGetV1(users[2].token)).toStrictEqual({ notifications: notifications });
  });

  test('New notifications push out older ones', () => {
    const { channelId, dmId, chatName } = setupChannel();
    const message1 = 'I am leaving and nobody can stop me. @' + usersData[2].handleStr;
    messageSendV2(users[2].token, channelId, message1);
    for (let i = 0; i < 25; i++) {
      channelLeaveV2(users[2].token, channelId);
      channelInviteV3(users[1].token, channelId, users[2].authUserId);
    }
    const message2 = 'Can you stop leaving @' + usersData[2].handleStr + '?';
    messageSendV2(users[1].token, channelId, message2);
    const notifications = Array(19).fill(addedToChatObj(channelId, dmId, chatName, usersData[1].handleStr));
    notifications.unshift(taggedInChatObj(channelId, dmId, chatName, usersData[1].handleStr, message2));
    expect(notificationsGetV1(users[2].token)).toStrictEqual({ notifications: notifications });
  });
});

describe('Error Cases', () => {
  test('Invalid token', () => {
    expect(() => notificationsGetV1('')).toThrow(Error(FORBIDDEN));
  });
});
