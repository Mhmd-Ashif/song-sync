const express = require("express");
const app = express();
const PORT = 3000;

app.get("/", (req: any, res: any) => {
  res.json("hi there");
});

app.get("/aa", (req: any, res: any) => {
  res.json("hi there aa");
});

app.listen(PORT, () => console.log("App is Running in port" + PORT));
