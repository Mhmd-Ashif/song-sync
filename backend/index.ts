import { addSongtoQueue, popSongAndUpdateNext } from "./functions/song";
import {
  addUserToRoom,
  checkRoom,
  createRoom,
  deleteRoom,
  leaveRoom,
} from "./functions/user";

import { client } from "./redis";
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const { v4: uuidv4 } = require("uuid");
const UserRouter = require("./routes/userRoute.ts");
const app = express();
const PORT = 3000;
const socketIo = require("socket.io");

app.use(cors());
app.use(express.json());
const server = http.createServer(app);

const io = socketIo(server);

// we want to create a redis queue with an room thingyy
let rooms: any = [];

app.use("/api/user", UserRouter);

app.get("/", (req: any, res: any) => {
  res.json("hi there");
});

// socket codeingz

io.on("connection", (socket: any) => {
  socket.on(
    "check-room",
    async (roomId: string, ownerId: string, callback: any) => {
      const ifExist: any = await checkRoom(roomId, ownerId);

      if (ifExist.success) {
        if (ifExist.owner == ownerId) {
          console.log("owner joins");
          callback({ success: true, message: "Owner can join the room." });
        } else {
          console.log("user joins");
          callback({ success: true, message: "User can join the room." });
        }
      } else {
        callback({ success: false, message: "Room does not exist." });
      }
    }
  );

  socket.on("create-room", async (roomName: string, callback: any) => {
    const roomId = uuidv4().slice(0, 6);
    const ownerId = uuidv4();

    const result = await createRoom(roomId, roomName, ownerId);
    if (result) {
      try {
        console.log("room created successfully");
        socket.join(roomId);
        console.log(
          `room was created with id of ${roomId} with name of ${roomName}`
        );
        callback({ roomId, userType: "creator", ownerId });
      } catch (error) {
        console.log(error);
      }
    } else {
      console.log("room not created");
    }
  });

  // songs socket routes fr
  socket.on("add-song", async ({ roomId, ytData }: any, callback: any) => {
    if (!roomId || !ytData) {
      console.error("Missing roomId or song:", { roomId, ytData });
      return;
    }

    const { val, songToStore }: any = await addSongtoQueue(roomId, ytData);
    if (val) {
      callback({ success: true, msg: "Song Added into the list" });

      io.to(roomId).emit("update-induvidual", { song: { ...songToStore } });
    } else {
      callback({ success: true, msg: "Song Already Exist" });
    }
  });

  socket.on("play-next", async (roomId: string) => {
    const result = await popSongAndUpdateNext(roomId);

    if (!result) return;

    const { nowPlaying } = result;

    // Get updated songs list (excluding nowPlaying)
    const rawSongs = await client.lRange(`room:${roomId}:songs`, 0, -1);
    const remainingSongs = rawSongs
      .map((s) => JSON.parse(s))
      .filter((s) => !s.playing);

    // Broadcast to everyone in the room
    io.to(roomId).emit("queue-updated", {
      parsedSongs: remainingSongs,
      nowPlaying,
    });
  });

  

  // joining a room
  socket.on(
    "join-room",
    async (displayName: string, roomId: string, callback: any) => {
      // same do it in the redis add user to room
      // bug found first check the room exist -> then do socket.join(roomId)
      const { val, songs, nowPlaying }: any = await addUserToRoom(
        roomId,
        displayName,
        socket.id
      );
      if (val) {
        socket.join(roomId);

        console.log(`${displayName} join with the room id of ${roomId}`);
        callback({
          success: true,
          roomId,
          userType: "audience",
          message: "Successfully Joined into the Room",
        });

        io.to(roomId).emit("queue-updated", {
          parsedSongs: songs,
          nowPlaying: nowPlaying,
        });
      } else {
        callback({ success: false, message: "room doesn't exist" });
      }
    }
  );

  // disconnect from a room
  // 1-audience will leave the room
  // 2-creator will delete the room and remove all the users

  socket.on("leave-room", async (roomId: string, callback: any) => {
    const result = await leaveRoom(roomId, socket.id);
    callback({ success: true });
  });

  socket.on("remove-all-users", async (roomId: string, callback: any) => {
    const room = io.sockets.adapter.rooms.get(roomId);

    if (room) {
      await deleteRoom(roomId);
      for (const socketId of room) {
        const userSocket = io.sockets.sockets.get(socketId);
        if (userSocket) {
          // the backend will emit to front end so that all users which are connect to that
          // room will get notified
          userSocket.emit("removed-from-room", { roomId });
          // technically i need to delete the room
          userSocket.leave(roomId);
        }
      }
      callback({ success: true });
      console.log(`All users removed from room: ${roomId}`);
    } else {
      callback({ success: false });
      console.log(`Room ${roomId} does not exist or is empty.`);
    }
  });

  socket.on("disconnect", (reason: any) => {
    // manual remove thaan pola
    // enter all room and remove the socketid from the users - tffffff - not optimal
    console.log("reload happend so disconnect happend");
    console.log(
      `User disconnected. Socket ID: ${socket.id}, Reason: ${reason}`
    );
  });
});

// redis is becoming inactive after 15dys so hitting every 8 mins
// setInterval(async () => {
//   try {
//     const pong = await client.ping();
//     console.log("Redis ping:", pong);
//   } catch (err: any) {
//     console.error("Ping failed", err.message);
//   }
// }, 8 * 60 * 1000);

server.listen(PORT, async () => {
  client.on("error", (err) => console.log("Redis Client Error", err));
  await client.connect();
  console.log("redis connected successfully");
  console.log("App is Running in port" + PORT);
});
