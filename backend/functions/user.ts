import { client } from "../redis";

// chumma - testing purpose
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const createRoom = async (
  roomId: any,
  roomName: string,
  ownerId: any
) => {
  try {
    await client.hSet(`room:${roomId}`, {
      roomId: roomId,
      roomName: roomName,
      ownerId: ownerId,
      users: JSON.stringify([]),
    });
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const addUserToRoom = async (
  roomId: any,
  displayName: string,
  socketId: any
) => {
  try {
    const roomKey = `room:${roomId}`;
    const allUsers = await client.hGet(roomKey, "users");
    let users: any[] = [];
    if (allUsers) {
       users = JSON.parse(allUsers);
    }
    users.push({ displayName, socketId });
    await client.hSet(roomKey, "users", JSON.stringify(users));
    console.log(`User ${displayName} added to room ${roomId}.`);
    return true
  } catch (error) {
    console.error("Error adding user to room:", error);
    return false
  }
};
