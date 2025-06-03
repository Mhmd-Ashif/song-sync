import { json } from "stream/consumers";
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

export const leaveRoom = async (roomId: string, socketId: string) => {
  try {
    const key = `room:${roomId}`;
    const getUsers = await client.hGet(key, "users");
    if (getUsers) {
      const parseIt = JSON.parse(getUsers);

      const removeUser = parseIt.filter(
        (user: any) => user.socketId != socketId
      );
      await client.hSet(key, "users", JSON.stringify(removeUser));
      return true;
    } else {
      return false;
    }
  } catch (error: any) {
    console.log(error.message);
    return false;
  }
};

export const deleteRoom = async (roomId: string) => {
  try {
    await client.del(`room:${roomId}`);
    console.log("Room Deleted Successfully");
    return true;
  } catch (error: any) {
    console.log(error.message);
    return false;
  }
};
