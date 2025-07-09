import { createClient } from "redis";
require("dotenv").config();

export const client = createClient({
  username: "default",
  password: process.env.PASSWORD,
  socket: {
    host: process.env.HOST,
    port: Number(process.env.PORT),
  },
});
