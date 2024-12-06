import { createClient } from "redis";

export const client = createClient({
  password: "6cSvAme6KXh0CkpTg4KuqOVfuhXCS4H6",
  socket: {
    host: "redis-15015.c277.us-east-1-3.ec2.redns.redis-cloud.com",
    port: 15015,
  },
});
