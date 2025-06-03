import { createClient } from "redis";

export const client = createClient({
  username: "default",
  password: "0J1mJwcXB4KBMRz6AhVuAZxy8uAPlhjE",
  socket: {
    host: "redis-17737.c266.us-east-1-3.ec2.redns.redis-cloud.com",
    port: 17737,
  },
});
