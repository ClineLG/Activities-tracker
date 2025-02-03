import { time } from "console";
import mongoose from "mongoose";
import { boolean } from "webidl-conversions";

const activitySchema = new mongoose.Schema({
  name: String,
  Actual: Boolean, //to keep in memory but dont show on the user desktop
  timeDay: { start: Number, end: Number, total: Number },
  timeWeek: Number,
  timeMonth: Number,
  timeYear: Number,
});

const UserSchema = new mongoose.Schema({
  account: { username: { type: String, required: true }, avatar: Object },
  token: String,
  email: String,
  hash: { type: String, select: false },
  salt: { type: String, select: false },
  Actitvities: [activitySchema],
});

export const UserModel = mongoose.model("User", UserSchema);
