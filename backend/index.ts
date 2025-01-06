import { addUserToRoom, checkRoom, createRoom } from "./functions/user";
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
      console.log("control reaches check-room");
      const ifExist: any = await checkRoom(roomId, ownerId);
      console.log(ifExist);
      console.log("async error i guess");
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
    console.log("created successfully");
    const roomId = uuidv4().slice(0, 6);
    const ownerId = uuidv4();
    console.log(roomId);
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
  // 2-creator will delete the room
  socket.on("leave-room", (roomId: string, callback: any) => {
    const room = rooms.find((room: any) => room.roomId == roomId);
    if (room) {
      room.users = room.users.filter((user: any) => user.socketId == socket.id);
      socket.leave(roomId);
      console.log(`User ${socket.id} left room: ${roomId}`);
      callback({ success: true });
      socket.to(roomId).emit("user_left", { userId: socket.id });
    } else {
      callback({
        success: false,
        message: "Room Doesn't exist or server error",
      });
    }
  });
  socket.on("disconnect-users", (ownerId: string) => {
    console.log(`User ${socket.id} disconnected`);

    rooms.forEach((room: any) => {
      room.users = room.users.filter(
        (user: any) => user.socketId !== socket.id
      );

      if (room.owner == ownerId) {
        console.log("room deleted");
        io.to(room.roomId).emit("room_deleted", {
          message: "The room owner has disconnected, and the room is deleted",
        });
        rooms.splice(rooms.indexOf(room), 1);
        console.log(
          `Room ${room.roomId} deleted because the owner disconnected.`
        );
      }
      socket.disconnect();
    });
  });
});

// app.get("/redis", async (req: any, res: any) => {
//   await client.set("ashif", "{name:'ashif',d.no:'2318',dept:'cse'}");
//   const value = await client.get("ashif");
//   console.log(value);
//   res.json("hi there aa");
// });

// async function ConnectToRedis() {
//   client.on("error", (err) => console.log("Redis Client Error", err));
//   await client.connect();
// }

// ConnectToRedis();
server.listen(PORT, async () => {
  client.on("error", (err) => console.log("Redis Client Error", err));
  await client.connect();
  console.log("redis connected successfully");
  console.log("App is Running in port" + PORT);
});
