import { Day, Week, Year } from "../types/activityTypes";
import calculateMinutes from "../utils/calculateToMinutes";
import weekOfYear from "../utils/weekOfYear";
import { UserModel } from "../models/User";

type total = { name: String; time: Number; id: String } | undefined;

export const addTimeToActivity = async (
  id: string,
  activityId: string,
  activityName: string,
  timeSpent: number,
  date: Date
): Promise<void> => {
  const day = date.getDay();
  const week = weekOfYear(date);
  const year = date.getFullYear();

  const userConcerned = await UserModel.findById(id);

  if (userConcerned.ActivitiesByYear[year].total.length < 1) {
    userConcerned.ActivitiesByYear[year].total.push({
      id: activityId,
      name: activityName,
      time: timeSpent,
    });
  }
  const totalByYear = userConcerned.ActivitiesByYear[year].total.find(
    (e: total) => e.id === activityId
  );
  if (totalByYear) {
    totalByYear.time += timeSpent;
  } else {
    userConcerned.ActivitiesByYear[year].total.push({
      id: activityId,
      name: activityName,
      time: timeSpent,
    });
  }

  if (
    userConcerned.ActivitiesByYear[year].weeks.find(
      (e: Week) => e.week === week
    ).total.length < 1
  ) {
    userConcerned.ActivitiesByYear[year].weeks
      .find((e: Week) => e.week === week)
      .total.push({ id: activityId, name: activityName, time: timeSpent });
  }

  const totalByWeek = userConcerned.ActivitiesByYear[year].weeks
    .find((e: Week) => e.week === week)
    .total.find((e: total) => e.id === activityId);
  console.log("yolo", totalByWeek);
  if (totalByWeek) {
    totalByWeek.time += timeSpent;
  } else {
    userConcerned.ActivitiesByYear[year].weeks
      .find((e: Week) => e.week === week)
      .total.push({ id: activityId, name: activityName, time: timeSpent });
  }

  console.log(
    "DAY",
    day,
    userConcerned.ActivitiesByYear[year].weeks
      .find((e: Week) => e.week === week)
      .days.find((e: Day) => e.day === day)
  );
  if (
    userConcerned.ActivitiesByYear[year].weeks
      .find((e: Week) => e.week === week)
      .days.find((e: Day) => e.day === day).total.length < 1
  ) {
    userConcerned.ActivitiesByYear[year].weeks
      .find((e: Week) => e.week === week)
      .days.find((e: Day) => e.day === day)
      .total.push({ id: activityId, name: activityName, time: timeSpent });
  }
  const totalByDay = userConcerned.ActivitiesByYear[year].weeks
    .find((e: Week) => e.week === week)
    .days.find((e: Day) => e.day === day)
    .total.find((e: total) => e.id === activityId);

  if (totalByDay) {
    totalByDay.time += timeSpent;
  } else {
    userConcerned.ActivitiesByYear[year].weeks
      .find((e: Week) => e.week === week)
      .days.find((e: Day) => e.day === day)
      .total.push({ id: activityId, name: activityName, time: timeSpent });
  }

  const newPending = userConcerned.pending.filter((e) => e.id !== activityId);

  userConcerned.pending = newPending;

  userConcerned.markModified("ActivitiesByYear");

  await userConcerned.save();
};

export const incrementTimeForMultipleDays = (
  startDate: Date,
  endDate: Date,
  id: string,
  activityId: string,
  activityName: string,
  totalTimeSpent: Number
) => {
  let firstDayDate = new Date(startDate);

  const endOfFirstDay = new Date(firstDayDate);
  endOfFirstDay.setHours(23, 59, 59, 999);

  const firstDayTime = calculateMinutes(endOfFirstDay.getTime(), startDate);

  if (firstDayTime > 0) {
    addTimeToActivity(
      id,
      activityId,
      activityName,
      firstDayTime,
      new Date(startDate)
    );
  }

  const currentDate = new Date(startDate);
  currentDate.setDate(currentDate.getDate() + 1);

  while (currentDate < endDate) {
    addTimeToActivity(id, activityId, activityName, 1440, currentDate);

    currentDate.setDate(currentDate.getDate() + 1);
  }

  const lastDayTime = calculateMinutes(
    endDate,
    new Date(endDate.setHours(0, 0, 0, 0)).getTime()
  );

  if (lastDayTime > 0) {
    addTimeToActivity(id, activityId, activityName, lastDayTime, endDate);
  }
};
