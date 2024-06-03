```js
let data = {
  users: [
    {
      uId: number,
      handleStr: string,
      email: string,
      nameFirst: string,
      nameLast: string,
      password: string,
      permissionId: number,
    },
  ],
  channels: [
    {
      channelId: number,
      name: string,
      isPublic: boolean,
      ownerMembers: [
        uId: number,
      ],
      allMembers: [
        uId: number,
      ],
      messages: [
        {
          messageId: integer,
          uId: integer,
          message: string,
          timeSent: integer,
        },
      ],
    },
  ],
  dms: [
    {
      dmId: number,
      name: string,
      ownerId: number,
      allMembers: [
        uId: number,
      ],
      messages: [
        {
          messageId: integer,
          uId: integer,
          message: string,
          timeSent: integer,
        },
      ],
    },
  ],
};
```
