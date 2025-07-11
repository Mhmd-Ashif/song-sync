"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = void 0;
const redis_1 = require("redis");
require("dotenv").config();
exports.client = (0, redis_1.createClient)({
    username: "default",
    password: process.env.PASSWORD,
    socket: {
        host: process.env.HOST,
        port: Number(process.env.PORT),
    },
});
