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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRoom = exports.leaveRoom = exports.checkRoom = exports.addUserToRoom = exports.createRoom = void 0;
const redis_1 = require("../redis");
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const createRoom = (roomId, roomName, ownerId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield redis_1.client.hSet(`room:${roomId}`, {
            roomId: roomId,
            roomName: roomName,
            ownerId: ownerId,
            users: JSON.stringify([]),
            status: "true",
        });
        return true;
    }
    catch (error) {
        console.log(error);
        return false;
    }
});
exports.createRoom = createRoom;
const addUserToRoom = (roomId, displayName, socketId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const roomKey = `room:${roomId}`;
        const allUsers = yield redis_1.client.hGet(roomKey, "users");
        let users = [];
        if (allUsers) {
            users = JSON.parse(allUsers);
        }
        users.push({ displayName, socketId });
        yield redis_1.client.hSet(roomKey, "users", JSON.stringify(users));
        const rawSongs = yield redis_1.client.lRange(`room:${roomId}:songs`, 0, -1);
        const parsedSongs = rawSongs.map((s) => JSON.parse(s));
        const nowPlaying = parsedSongs.find((s) => s.playing === true);
        const songs = parsedSongs
            .filter((s) => !s.playing)
            .map((song) => (Object.assign(Object.assign({}, song), { duration: `${song.min}:${song.sec}` })));
        return { val: true, songs, nowPlaying };
    }
    catch (error) {
        console.error("Error adding user to room:", error);
        return { val: false };
    }
});
exports.addUserToRoom = addUserToRoom;
const checkRoom = (roomId, ownerId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const roomKey = `room:${roomId}`;
        const roomData = yield redis_1.client.hGetAll(roomKey);
        if (roomData.status) {
            return { success: true, owner: roomData.ownerId };
        }
        else {
            return false;
        }
    }
    catch (error) {
        console.log(error.message);
        return false;
    }
});
exports.checkRoom = checkRoom;
const leaveRoom = (roomId, socketId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const key = `room:${roomId}`;
        const getUsers = yield redis_1.client.hGet(key, "users");
        if (getUsers) {
            const parseIt = JSON.parse(getUsers);
            const removeUser = parseIt.filter((user) => user.socketId != socketId);
            yield redis_1.client.hSet(key, "users", JSON.stringify(removeUser));
            return true;
        }
        else {
            return false;
        }
    }
    catch (error) {
        console.log(error.message);
        return false;
    }
});
exports.leaveRoom = leaveRoom;
const deleteRoom = (roomId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield redis_1.client.del(`room:${roomId}`);
        console.log("Room Deleted Successfully");
        return true;
    }
    catch (error) {
        console.log(error.message);
        return false;
    }
});
exports.deleteRoom = deleteRoom;
