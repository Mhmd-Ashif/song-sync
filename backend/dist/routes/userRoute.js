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
const express = require("express");
const router = express.Router();
const client_1 = require("@prisma/client");
const authToken_1 = require("../middlewares/authToken");
const prisma = new client_1.PrismaClient();
router.post("/check-user", authToken_1.checkToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("user checking....");
    try {
        const { name, email, uid } = req.body;
        const ifUserExist = yield prisma.user.findUnique({
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
        }
        else {
            yield prisma.user.create({
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
    }
    catch (error) {
        res.status(500).json({
            message: error.message,
            logged: false,
        });
    }
}));
// module.exports = router;
exports.default = router;
