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
      status: "true",
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
    return true;
  } catch (error) {
    console.error("Error adding user to room:", error);
    return false;
  }
};

export const checkRoom = async (roomId: string, ownerId: string) => {
  try {
    const roomKey = `room:${roomId}`;
    // get the data from the redis
    const roomData = await client.hGetAll(roomKey);
    console.log("got the result");
    console.log(roomData.status);
    if (roomData.status) {
      return { success: true, owner: roomData.ownerId };
    } else {
      return false;
    }
  } catch (error: any) {
    console.log(error.message);
    return false;
  }
};
