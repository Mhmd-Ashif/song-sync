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
exports.addSongtoQueue = addSongtoQueue;
exports.popSongAndUpdateNext = popSongAndUpdateNext;
const redis_1 = require("../redis");
function addSongtoQueue(roomId, song) {
    return __awaiter(this, void 0, void 0, function* () {
        const songKey = `room:${roomId}:songs`;
        const currentSongs = yield redis_1.client.lRange(songKey, 0, -1);
        const isDuplicate = currentSongs.some((s) => {
            const parserVid = JSON.parse(s);
            return parserVid.videoId == song.videoId;
        });
        if (!isDuplicate) {
            const isFirst = currentSongs.length === 0;
            const songToStore = Object.assign(Object.assign({}, song), { playing: isFirst ? true : false });
            yield redis_1.client.rPush(`room:${roomId}:songs`, JSON.stringify(songToStore));
            return { val: true, songToStore };
        }
        else {
            return { val: false };
        }
    });
}
function popSongAndUpdateNext(roomId) {
    return __awaiter(this, void 0, void 0, function* () {
        const songKey = `room:${roomId}:songs`;
        const poppedSongRaw = yield redis_1.client.lPop(songKey);
        if (!poppedSongRaw)
            return null;
        const nextSongRaw = yield redis_1.client.lIndex(songKey, 0);
        if (nextSongRaw) {
            const parsed = JSON.parse(nextSongRaw);
            const updated = Object.assign(Object.assign({}, parsed), { playing: true });
            yield redis_1.client.lSet(songKey, 0, JSON.stringify(updated));
            return { popped: JSON.parse(poppedSongRaw), nowPlaying: updated };
        }
        return { popped: JSON.parse(poppedSongRaw), nowPlaying: null };
    });
}
