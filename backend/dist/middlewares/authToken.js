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
exports.checkToken = void 0;
require("dotenv").config();
const admin = require("firebase-admin");
const serviceAccount = JSON.parse(process.env.ADMIN_AUTH || "");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});
const checkToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { uid, idToken } = req.body;
    if (!idToken) {
        return res.status(401).send("Unauthorized: No token provided");
    }
    try {
        const decodedToken = yield admin.auth().verifyIdToken(idToken);
        if (decodedToken.uid == uid) {
            next();
        }
    }
    catch (error) {
        console.log(error);
        res.status(401).send("Unauthorized: Invalid or expired token");
    }
});
exports.checkToken = checkToken;
