import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
  name: String,
  actual: Boolean, //to keep in memory but dont show on the user desktop
  pending: { start: Number, end: Number },

  activityByYear: Array, //[{yearNumber:{total:143,month:[{monthNumber:{total:12,week:[{weekNumber:{total:3,day:[{dayNumber:{total:1, start:17,end:18}}]}}]}}]
});

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  token: String,
  email: String,
  hash: { type: String, select: false },
  salt: { type: String, select: false },
  Actitvities: [activitySchema],
});

export const UserModel = mongoose.model("User", UserSchema);
