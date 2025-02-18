import { ObjectId } from "mongoose";

type Day = {
  day: number;
  total: [{ name: string; time: number; id: string }];
};

type Week = {
  week: number;
  month: number;
  total: [{ name: string; time: number; id: string }];
  days: Day[];
};

type Year = {
  total: [{ name: string; time: number; id: string }];
  weeks: Week[];
};

type activitySchema = {
  name: string;
  actual: boolean;
};

type User = {
  username: { type: String; required: true };
  token: String;
  email: String;
  hash: { type: String };
  salt: { type: String };
  ActitvitiesNameAndStatus: [activitySchema];
  ActivitiesByYear: { [key: string]: Year };

  pending: {
    year: Number;
    week: Number;
    day: Number;
    time: Number;
  }[];
};
type ActivityType = {
  _id: ObjectId;
  name: string;
  actual: boolean;
  pending?: { year: number; week: number; day: number; time: number };
};
type ActivityTrack = {
  id: string;
  name: string;
  time: number;
};
export { Week, Day, Year, activitySchema, User, ActivityTrack, ActivityType };
