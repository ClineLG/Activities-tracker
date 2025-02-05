import { UserModel } from "../models/User";
import express, { Request, Response } from "express";
import uid2 from "uid2";
import SHA256 from "crypto-js/sha256";

import encBase64 from "crypto-js/enc-base64";

const router = express.Router();

router.post("/signup", async (req: Request, res: Response) => {
  try {
    console.log("Req.body", req.body);

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
      account: {
        username: username,
        avatar: {},
      },
      token: token,

      hash: hash,
      salt: salt,
    });
    await newUser.save();

    res.status(201).json(newUser.token);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
