import { UserModel } from "../models/User";
import express, { Request, Response } from "express";
import uid2 from "uid2";
import SHA256 from "crypto-js/sha256";
import isAuthenticated from "../../middleware/isAuthenticated";
import { MailerSend, Sender, Recipient, EmailParams } from "mailersend";
import encBase64 from "crypto-js/enc-base64";

const router = express.Router();

router.post("/signup", async (req: Request, res: Response) => {
  try {
    const { username, password, email } = req.body;

    if (!email || !password || !username) {
      return res.status(404).json({ error: "Parameters missing" });
    }

    const isEmailExist = await UserModel.findOne({ email: email });
    if (isEmailExist) {
      return res.status(404).json({ error: "email allready used" });
    }

    const salt = uid2(16);
    const hash = SHA256(password + salt).toString(encBase64);
    const token = uid2(32);
    const newUser = new UserModel({
      email: email,

      username: username,

      token: token,

      hash: hash,
      salt: salt,
    });
    await newUser.save();

    res.status(201).json(token);
  } catch (error) {
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

    const userDetails = await UserModel.findOne({ email: email });

    if (!userDetails) {
      return res.status(404).json({ error: "Email address unknown" });
    }

    const saltUser = userDetails.salt;
    const tokenUser = userDetails.token;
    const hashUser = userDetails.hash;

    const tryHashUser = SHA256(password + saltUser).toString(encBase64);

    if (tryHashUser !== hashUser) {
      return res.status(404).json({ error: "Wrong password" });
    }

    res.status(201).json(tokenUser);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
});

//route Auth0 to add Clerk?

router.put("/update", isAuthenticated, async (req, res) => {
  try {
    const { password, username, email } = req.body;
    const user = await UserModel.findById(req.body.user);

    if (password) {
      const newhash = SHA256(password + user.salt).toString(encBase64);
      user.hash = newhash;
    }
    if (username) {
      user.username = username;
    }
    if (email) {
      const isEmailExist = await UserModel.findOne({ email: email });
      if (isEmailExist) {
        return res.status(401).json({ message: "email already used" });
      } else {
        user.email = email;
      }
    }
    await user.save();

    res.status(201).json(user.token);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.delete("/deleteUser", isAuthenticated, async (req, res) => {
  try {
    const userToDelete = await UserModel.findByIdAndDelete(req.body.user);
    res.status(201).json({ message: "profile deleted" });
  } catch (error) {
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
    const user = await UserModel.findOne({ email: email });
    console.log("old", user, user.hash);

    const salt = user.salt;
    const newHash = SHA256(password + salt).toString(encBase64);
    user.hash = newHash;
    await user.save();
    console.log("new", user, user.hash);

    return res.status(200).json(user.token);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur interne du serveur." });
  }
});

const mailersend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY,
});

const sentFrom = new Sender(process.env.MAILERSEND_ADDRESS, "Activity-Tracker");

router.post("/send-email", async (req, res) => {
  try {
    const { email } = req.body;

    const userToSendEmail = await UserModel.findOne({ email: email });

    if (!userToSendEmail) {
      return res.status(401).json({ message: "unknown email" });
    }
    const userName = userToSendEmail.username;

    const secretCode = uid2(6);

    const recipients = [new Recipient(email, userName)];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setReplyTo(sentFrom)
      .setSubject(`Renouvellement de mot de passe  -TimeTrackR-`)
      .setHtml(
        `Bonjour ${userName},<br />   Pour réinitialiser votre mot de passe,<br /> veuillez entrer le code écrit ci-dessous, sur la page de renouvellement de mot de passe de Activity-Tracker  :<br />` +
          "<strong>" +
          secretCode +
          "</strong>" +
          "<br />  <br /> A bientôt ! <br />  <br /> La Team TimeTrackR"
      )
      .setText(
        "Bonjour" +
          userName +
          ", pour réinitialiser votre mot de passe, veuillez entrer le code secret écrit ci-dessous, sur la page de renouvellement de mot de passe de TimeTrackR  :" +
          secretCode +
          "A bientôt ! La Team TimeTrackR"
      );

    const result = await mailersend.email.send(emailParams);

    res.status(200).json({
      state: "success",
      secretCode: secretCode,
      email: userToSendEmail.email,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

// router.get("/details", isAuthenticated, async (req, res) => {
//   try {
//     const user = await UserModel.findById(req.body.user).select(
//       "token username _id"
//     );
//     console.log("DETAILS", user);
//     res.status(200).json(user);
//   } catch (error) {
//     console.log(error);
//     res.status(500).json(error);
//   }
// });

module.exports = router;
