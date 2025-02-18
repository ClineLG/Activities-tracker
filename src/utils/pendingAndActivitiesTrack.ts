import { ObjectId } from "mongoose";
import calculateMinutes from "./calculateToMinutes";
import { ActivityTrack, ActivityType } from "types/activityTypes";

const pendingAndActivitiesTrack = (
  activityArr: ActivityTrack[],
  ActitvitiesNameAndStatus: ActivityType[]
) => {
  const pending = ActitvitiesNameAndStatus.filter(
    (activity: ActivityType) => activity.pending
  ).map((activity: ActivityType) => {
    return {
      id: activity._id.toString(),
      name: activity.name,
      time: calculateMinutes(Date.now(), activity.pending.time),
    };
  });

  const allAndPending = [...activityArr, ...pending];

  const grouped = allAndPending.reduce(
    (acc: { [key: string]: ActivityTrack }, activity) => {
      if (acc[activity.id]) {
        acc[activity.id].time += activity.time;
      } else {
        acc[activity.id] = { ...activity };
      }
      return acc;
    },
    {}
  );

  const result = [];

  for (const key in grouped) {
    result.push(grouped[key]);
  }

  return result;
};
export default pendingAndActivitiesTrack;
