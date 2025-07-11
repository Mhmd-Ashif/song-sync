"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
console.log("🟢 Environment Variables:", JSON.stringify(process.env, null, 2));
const song_1 = require("./functions/song");
const user_1 = require("./functions/user");
const redis_1 = require("./redis");
const express = require("express");
const cors = require("cors");
const http = require("http");
const { v4: uuidv4 } = require("uuid");
// const UserRouter = require("./routes/userRoute");
const userRoute_1 = __importDefault(require("./routes/userRoute"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;
const socketIo = require("socket.io");
// app.use(cors());
app.use(cors({
    origin: ["http://localhost:3000", "https://song-sync-eta.vercel.app"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());
app.options("*", cors());
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: ["http://localhost:3000", "https://song-sync-eta.vercel.app"],
        methods: ["GET", "POST"],
        credentials: true,
    },
    transports: ["websocket", "polling"], // Explicitly set transports
});
app.use("/api/user", userRoute_1.default);
app.get("/", (req, res) => {
    res.json("hi there");
});
app.get("/health", (req, res) => {
    res.json({
        status: "healthy",
        server: true,
        redis: redis_1.client.isOpen, // Example Redis check
    });
});
const roomStates = {};
io.on("connection", (socket) => {
    socket.on("check-room", (roomId, ownerId, callback) => __awaiter(void 0, void 0, void 0, function* () {
        const ifExist = yield (0, user_1.checkRoom)(roomId, ownerId);
        if (ifExist.success) {
            if (ifExist.owner == ownerId) {
                console.log("owner joins");
                callback({ success: true, message: "Owner can join the room." });
            }
            else {
                console.log("user joins");
                callback({ success: true, message: "User can join the room." });
            }
        }
        else {
            callback({ success: false, message: "Room does not exist." });
        }
    }));
    socket.on("create-room", (roomName, callback) => __awaiter(void 0, void 0, void 0, function* () {
        const roomId = uuidv4().slice(0, 6);
        const ownerId = uuidv4();
        const result = yield (0, user_1.createRoom)(roomId, roomName, ownerId);
        if (result) {
            try {
                console.log("room created successfully");
                socket.join(roomId);
                console.log(`room was created with id of ${roomId} with name of ${roomName}`);
                callback({ roomId, userType: "creator", ownerId });
            }
            catch (error) {
                console.log(error);
            }
        }
        else {
            console.log("room not created");
        }
    }));
    socket.on("add-song", (_a, callback_1) => __awaiter(void 0, [_a, callback_1], void 0, function* ({ roomId, ytData }, callback) {
        if (!roomId || !ytData) {
            console.error("Missing roomId or song:", { roomId, ytData });
            return;
        }
        const { val, songToStore } = yield (0, song_1.addSongtoQueue)(roomId, ytData);
        if (val) {
            callback({ success: true, msg: "Song Added into the list" });
            io.to(roomId).emit("update-induvidual", { song: Object.assign({}, songToStore) });
        }
        else {
            callback({ success: true, msg: "Song Already Exist" });
        }
    }));
    socket.on("broadcast-sync", ({ roomId, time, isPlaying, currentSong, }) => {
        roomStates[roomId] = { time, isPlaying, currentSong };
        socket.to(roomId).emit("receive-sync", { time, isPlaying });
    });
    socket.on("request-initial-sync", (roomId) => {
        const state = roomStates[roomId];
        if (state) {
            socket.emit("initial-sync", state);
        }
    });
    socket.on("play-next", (roomId) => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield (0, song_1.popSongAndUpdateNext)(roomId);
        if (!result)
            return;
        const { nowPlaying } = result;
        const rawSongs = yield redis_1.client.lRange(`room:${roomId}:songs`, 0, -1);
        const remainingSongs = rawSongs
            .map((s) => JSON.parse(s))
            .filter((s) => !s.playing);
        if (nowPlaying) {
            roomStates[roomId] = {
                time: 0,
                isPlaying: true,
                currentSong: nowPlaying,
            };
        }
        io.to(roomId).emit("queue-updated", {
            parsedSongs: remainingSongs,
            nowPlaying,
        });
        setTimeout(() => {
            io.to(roomId).emit("initial-sync", {
                time: 0,
                isPlaying: true,
                currentSong: nowPlaying,
            });
        }, 500);
    }));
    socket.on("join-room", (displayName, roomId, callback) => __awaiter(void 0, void 0, void 0, function* () {
        const { val, songs, nowPlaying } = yield (0, user_1.addUserToRoom)(roomId, displayName, socket.id);
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
        }
        else {
            callback({ success: false, message: "room doesn't exist" });
        }
    }));
    socket.on("leave-room", (roomId, callback) => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield (0, user_1.leaveRoom)(roomId, socket.id);
        callback({ success: true });
    }));
    socket.on("remove-all-users", (roomId, callback) => __awaiter(void 0, void 0, void 0, function* () {
        const room = io.sockets.adapter.rooms.get(roomId);
        if (room) {
            yield (0, user_1.deleteRoom)(roomId);
            for (const socketId of room) {
                const userSocket = io.sockets.sockets.get(socketId);
                if (userSocket) {
                    userSocket.emit("removed-from-room", { roomId });
                    userSocket.leave(roomId);
                }
            }
            callback({ success: true });
            console.log(`All users removed from room: ${roomId}`);
        }
        else {
            callback({ success: false });
            console.log(`Room ${roomId} does not exist or is empty.`);
        }
    }));
    socket.on("disconnect", (reason) => {
        console.log("reload happend so disconnect happend");
        console.log(`User disconnected. Socket ID: ${socket.id}, Reason: ${reason}`);
    });
    socket.on("error", (err) => {
        console.error(`Socket error: ${err.message}`);
    });
});
setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pong = yield redis_1.client.ping();
        console.log("Redis ping:", pong);
    }
    catch (err) {
        console.error("Ping failed", err.message);
    }
}), 8 * 60 * 1000);
server.listen(PORT, "0.0.0.0", () => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`🚀 Server started on port ${PORT}`);
    try {
        yield Promise.all([redis_1.client.connect(), prisma.$connect()]);
        console.log("✅ All dependencies connected");
    }
    catch (err) {
        console.error("❌ Dependency connection failed:", err);
    }
}));
// 4. Error handling
process.on("unhandledRejection", (err) => {
    console.error("Unhandled rejection:", err);
});
server.on("error", (err) => {
    console.error("Server error:", err);
    process.exit(1);
});
