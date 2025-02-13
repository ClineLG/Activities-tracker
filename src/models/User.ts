import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
  name: String,
  actual: Boolean,
});

const UserSchema = new mongoose.Schema({
  username: String,
  token: String,
  email: String,
  hash: { type: String },
  salt: { type: String },
  ActitvitiesNameAndStatus: [activitySchema],
  ActivitiesByYear: Object,
  pending: [
    // { activityId: String, year: Number, week: Number, day: Number, time: Number },
  ],
});

export const UserModel = mongoose.model("User", UserSchema);
