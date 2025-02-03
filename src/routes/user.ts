import { UserModel } from "../models/User";
import isAuthenticated from "../../middleware/isAuthenticated";
import express from "express";
import { Request, Response } from "express";

import uid2 from "uid2";

import SHA256 from "crypto-js/sha256";

import encBase64 from "crypto-js/enc-base64";

const router = express.Router();

router.post("/signup", async (req: Request, res: Response) => {
  try {
    console.log(req.body);

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

router.post("/newActivity", isAuthenticated, async (req, res) => {
  try {
    const { name, user } = req.body;
    const userConcerned = await UserModel.findById(user._id).select(
      "-hash,-salt"
    );
    userConcerned.Actitvities.push({ name: name });
    await userConcerned.save();
    res.status(201).json(userConcerned);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.post("/startActivity", isAuthenticated, async (req, res) => {
  try {
    const { name, user } = req.body;
    const userConcerned = await UserModel.findById(user._id);
    userConcerned.Actitvities.filter((e) => (e.name = name))[0].timeDay.start =
      Date.now();
    await userConcerned.save();
    res.status(200).json(userConcerned);
  } catch (error) {
    res.status(500).json(error);
  }
});
router.post("/endActivity", isAuthenticated, async (req, res) => {
  try {
    const { name, user } = req.body;
    const userConcerned = await UserModel.findById(user._id);

    const activity = userConcerned.Actitvities.filter(
      (e) => (e.name = name)
    )[0];
    activity.timeDay.end = Date.now();

    activity.timeDay.total = Math.round(
      (activity.timeDay.end - activity.timeDay.start) / 60000
    );
    activity.timeWeek
      ? (activity.timeWeek += activity.timeDay.total)
      : (activity.timeWeek = activity.timeDay.total),
      activity.timeMonth
        ? (activity.timeMonth += activity.timeDay.total)
        : (activity.timeMonth = activity.timeDay.total),
      activity.timeYear
        ? (activity.timeYear += activity.timeDay.total)
        : (activity.timeYear = activity.timeDay.total),
      await userConcerned.save();
    res.status(200).json(userConcerned);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;

//arrange week month year !!!
