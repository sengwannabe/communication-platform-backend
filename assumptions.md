Assumptions:

1. When a user is registered, it is assumed that they will be added to the end an array of objects containing: uId, handleStr, email, nameFirst, nameLast, password, and permissionId.

2. When a channel is created, it is assumed that it will be added to the end an array of objects containing: channelId, name, isPublic, ownerMembers, allMembers, and messages.

3. It is assumed that users and channels will either be deleted all at once or never deleted at all.

4. It assumed that UNSW Beans will not run out of assignable ids for both users and channels.

5. It is assumed that in the case where the first name and last name is all non-alphanumeric characters, the handle string will be empty and valid.

6. It is assumed that there is no particular order to channelsListV1 and channelsListAllV1.

Other Assumptions:
- It is assumed that two or more users won't try to do the same thing at the exact same time as the database will break due to a "race condition".
- Assumed that database is completely secure as passwords are stored as plaintext
- When all members of a DM has been removed, it is assumed that they would not access the DM anymore and an error is returned. 
- When an owner member leaves a channel, it is assumed that they will both leave ownerMembers and allMembers rather than just allMembers
