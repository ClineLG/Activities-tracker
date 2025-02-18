"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = require("../models/User");
const express_1 = __importDefault(require("express"));
const uid2_1 = __importDefault(require("uid2"));
const sha256_1 = __importDefault(require("crypto-js/sha256"));
const isAuthenticated_1 = __importDefault(require("../../middleware/isAuthenticated"));
const mailersend_1 = require("mailersend");
const enc_base64_1 = __importDefault(require("crypto-js/enc-base64"));
const createYearData_1 = __importDefault(require("../utils/createYearData"));
const router = express_1.default.Router();
router.post("/signup", async (req, res) => {
    try {
        const { username, password, email } = req.body;
        if (!email || !password || !username) {
            return res.status(404).json({ error: "Parameters missing" });
        }
        const isEmailExist = await User_1.UserModel.findOne({ email: email });
        if (isEmailExist) {
            return res.status(404).json({ error: "email allready used" });
        }
        const year = new Date().getFullYear();
        const salt = (0, uid2_1.default)(16);
        const hash = (0, sha256_1.default)(password + salt).toString(enc_base64_1.default);
        const token = (0, uid2_1.default)(32);
        const newUser = new User_1.UserModel({
            email: email,
            username: username,
            token: token,
            ActivitiesByYear: {},
            hash: hash,
            salt: salt,
        });
        newUser.ActivitiesByYear[year] = (0, createYearData_1.default)();
        await newUser.save();
        res.status(201).json(token);
    }
    catch (error) {
        console.log(error.message);
        res.status(500).json({ error: error.message });
    }
});
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!password && !email) {
            return res.status(404).json({ error: "details needed" });
        }
        const userDetails = await User_1.UserModel.findOne({ email: email });
        if (!userDetails) {
            return res.status(404).json({ error: "Email address unknown" });
        }
        const saltUser = userDetails.salt;
        const tokenUser = userDetails.token;
        const hashUser = userDetails.hash;
        const tryHashUser = (0, sha256_1.default)(password + saltUser).toString(enc_base64_1.default);
        if (tryHashUser !== hashUser) {
            return res.status(404).json({ error: "Wrong password" });
        }
        res.status(201).json(tokenUser);
    }
    catch (error) {
        console.log(error.message);
        res.status(500).json({ error: error.message });
    }
});
//route Auth0 to add Clerk?
router.put("/update", isAuthenticated_1.default, async (req, res) => {
    try {
        const { password, username, email } = req.body;
        const user = await User_1.UserModel.findById(req.body.user);
        if (password) {
            const newhash = (0, sha256_1.default)(password + user.salt).toString(enc_base64_1.default);
            user.hash = newhash;
        }
        if (username) {
            user.username = username;
        }
        if (email) {
            const isEmailExist = await User_1.UserModel.findOne({ email: email });
            if (isEmailExist) {
                return res.status(401).json({ message: "email already used" });
            }
            else {
                user.email = email;
            }
        }
        await user.save();
        res.status(201).json(user.token);
    }
    catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
});
router.delete("/delete", isAuthenticated_1.default, async (req, res) => {
    try {
        const userToDelete = await User_1.UserModel.findByIdAndDelete(req.body.user);
        res.status(201).json({ message: "profile deleted" });
    }
    catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
});
router.put("/reset-password", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "details needed." });
        }
        const user = await User_1.UserModel.findOne({ email: email });
        console.log("old", user, user.hash);
        const salt = user.salt;
        const newHash = (0, sha256_1.default)(password + salt).toString(enc_base64_1.default);
        user.hash = newHash;
        await user.save();
        console.log("new", user, user.hash);
        return res.status(200).json(user.token);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erreur interne du serveur." });
    }
});
const mailersend = new mailersend_1.MailerSend({
    apiKey: process.env.MAILERSEND_API_KEY,
});
const sentFrom = new mailersend_1.Sender(process.env.MAILERSEND_ADDRESS, "Activity-Tracker");
router.post("/send-email", async (req, res) => {
    try {
        const { email } = req.body;
        const userToSendEmail = await User_1.UserModel.findOne({ email: email });
        if (!userToSendEmail) {
            return res.status(401).json({ message: "unknown email" });
        }
        const userName = userToSendEmail.username;
        const secretCode = (0, uid2_1.default)(6);
        const recipients = [new mailersend_1.Recipient(email, userName)];
        const emailParams = new mailersend_1.EmailParams()
            .setFrom(sentFrom)
            .setTo(recipients)
            .setReplyTo(sentFrom)
            .setSubject(`Renouvellement de mot de passe  -TimeTrackR-`)
            .setHtml(`Bonjour ${userName},<br />   Pour réinitialiser votre mot de passe,<br /> veuillez entrer le code écrit ci-dessous, sur la page de renouvellement de mot de passe de Activity-Tracker  :<br />` +
            "<strong>" +
            secretCode +
            "</strong>" +
            "<br />  <br /> A bientôt ! <br />  <br /> La Team TimeTrackR")
            .setText("Bonjour" +
            userName +
            ", pour réinitialiser votre mot de passe, veuillez entrer le code secret écrit ci-dessous, sur la page de renouvellement de mot de passe de TimeTrackR  :" +
            secretCode +
            "A bientôt ! La Team TimeTrackR");
        const result = await mailersend.email.send(emailParams);
        res.status(200).json({
            state: "success",
            secretCode: secretCode,
            email: userToSendEmail.email,
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
});
router.get("/details", isAuthenticated_1.default, async (req, res) => {
    try {
        const user = await User_1.UserModel.findById(req.body.user).select("username email");
        console.log("DETAILS", user);
        res.status(200).json(user);
    }
    catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
});
module.exports = router;
//# sourceMappingURL=user.js.map