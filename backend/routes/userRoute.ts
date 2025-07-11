const express = require("express");
const router = express.Router();
import { PrismaClient } from "@prisma/client";
import { checkToken } from "../middlewares/authToken";
const prisma = new PrismaClient();

interface Body {
  name: string;
  email: string;
  uid: string;
}

router.post("/check-user", checkToken, async (req: any, res: any) => {
  try {
    const { name, email, uid }: Body = req.body;
    const ifUserExist = await prisma.user.findUnique({
      where: {
        name,
        email,
        uid,
      },
    });
    if (ifUserExist) {
      res
        .status(200)
        .json({ message: "User Exist With Given Credentials", logged: true });
    } else {
      await prisma.user.create({
        data: {
          name,
          email,
          uid,
        },
      });
      res.status(200).json({
        message: "New User Created Successfully With Given Credentials",
        logged: true,
      });
    }
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
      logged: false,
    });
  }
});

// module.exports = router;
export default router;
