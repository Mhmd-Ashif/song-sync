import {
  addUserToRoom,
  checkRoom,
  createRoom,
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

// we want to create a redis queue with an room thing
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
      console.log("room created successfully");
      socket.join(roomId);
      console.log(
        `room was created with id of ${roomId} with name of ${roomName}`
      );
      callback({ roomId, userType: "creator", ownerId });
    } else {
      console.log("room not created");
    }
  });

  // joining a room
  socket.on(
    "join-room",
    async (displayName: string, roomId: string, callback: any) => {
      // same do it in the redis add user to room

      // bug found first check the room exist -> then do socket.join(roomId)
      const result = await addUserToRoom(roomId, displayName, socket.id);
      if (result) {
        socket.join(roomId);

        console.log(`${displayName} join with the room id of ${roomId}`);
        callback({
          success: true,
          roomId,
          userType: "audience",
          message: "Successfully Joined into the Room",
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
      for (const socketId of room) {
        const userSocket = io.sockets.sockets.get(socketId);
        if (userSocket) {
          userSocket.emit("removed-from-room", { roomId });
          await leaveRoom(roomId, userSocket.id); 
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
    // enter all room and remove the socketid from the users - tffffff
    console.log(
      `User disconnected. Socket ID: ${socket.id}, Reason: ${reason}`
    );
    
  });
  
});

server.listen(PORT, async () => {
  client.on("error", (err) => console.log("Redis Client Error", err));
  await client.connect();
  console.log("redis connected successfully");
  console.log("App is Running in port" + PORT);
});
