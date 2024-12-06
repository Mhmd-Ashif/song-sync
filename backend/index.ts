import { client } from "./redis";
const express = require("express");
const cors = require("cors");
const UserRouter = require("./routes/userRoute.ts");
const app = express();
const PORT = 3000;

// default
app.use(cors());
app.use(express.json());
// user router to check they exist or not
app.use("/api/user", UserRouter);

app.get("/", (req: any, res: any) => {
  res.json("hi there");
});

app.get("/redis", async (req: any, res: any) => {
  await client.set("ashif", "{name:'ashif',d.no:'2318',dept:'cse'}");
  const value = await client.get("ashif");
  console.log(value);
  res.json("hi there aa");
});

async function ConnectToRedis() {
  client.on("error", (err) => console.log("Redis Client Error", err));

  await client.connect();
}

ConnectToRedis();
app.listen(PORT, () => console.log("App is Running in port" + PORT));
