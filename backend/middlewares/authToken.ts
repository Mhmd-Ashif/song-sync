require("dotenv").config();
const admin = require("firebase-admin");
// const serviceAccount = require("./song-sync-40dba-firebase-adminsdk-mg1gr-8d7c570ca3.json");
const serviceAccount = JSON.parse(process.env.ADMIN_AUTH || "");
// const serviceAccount = env("DATABASE_URL")

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const checkToken = async (req: any, res: any, next: any) => {
  const { uid, idToken } = req.body;
  if (!idToken) {
    return res.status(401).send("Unauthorized: No token provided");
  }
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    if (decodedToken.uid == uid) {
      next();
    }
  } catch (error) {
    console.log(error);
    res.status(401).send("Unauthorized: Invalid or expired token");
  }
};
