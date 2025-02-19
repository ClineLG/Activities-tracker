import { Day, Week, Year } from "../types/activityTypes";
import calculateMinutes from "../utils/calculateToMinutes";
import weekOfYear from "../utils/weekOfYear";
import { UserModel } from "../models/User";

type Total = { id: string; name: string; time: number } | undefined;

export const addTimeToActivity = async (
  id: string,
  activityId: string,
  activityName: string,
  timeSpent: number,
  date: Date,
  edit?: boolean
): Promise<void> => {
  const day = date.getDay() === 0 ? 7 : date.getDay();

  const week = weekOfYear(date);
  const year = date.getFullYear();

  const userConcerned = await UserModel.findById(id);

  if (userConcerned.ActivitiesByYear[year].total.length < 1) {
    userConcerned.ActivitiesByYear[year].total.push({
      id: activityId,
      name: activityName,
      time: timeSpent,
    });
  } else {
    // console.log(activityId);
    // console.log("TOTAL", userConcerned.ActivitiesByYear[year].total);
    // console.log("year", year);

    const totalByYear = userConcerned.ActivitiesByYear[year].total.find(
      (e: Total) => e.id === activityId
    );

    if (totalByYear) {
      totalByYear.time += Number(timeSpent);
    } else {
      userConcerned.ActivitiesByYear[year].total.push({
        id: activityId,
        name: activityName,
        time: timeSpent,
      });
    }
  }
  if (
    userConcerned.ActivitiesByYear[year].weeks.find(
      (e: Week) => e.week === week
    ).total.length < 1
  ) {
    userConcerned.ActivitiesByYear[year].weeks
      .find((e: Week) => e.week === week)
      .total.push({ id: activityId, name: activityName, time: timeSpent });
  } else {
    const totalByWeek = userConcerned.ActivitiesByYear[year].weeks
      .find((e: Week) => e.week === week)
      .total.find((e: Total) => e.id === activityId);

    if (totalByWeek) {
      totalByWeek.time += Number(timeSpent);
    } else {
      userConcerned.ActivitiesByYear[year].weeks
        .find((e: Week) => e.week === week)
        .total.push({ id: activityId, name: activityName, time: timeSpent });
    }
  }

  if (
    userConcerned.ActivitiesByYear[year].weeks
      .find((e: Week) => e.week === week)
      .days.find((e: Day) => e.day === day).total.length < 1
  ) {
    userConcerned.ActivitiesByYear[year].weeks
      .find((e: Week) => e.week === week)
      .days.find((e: Day) => e.day === day)
      .total.push({ id: activityId, name: activityName, time: timeSpent });
  } else {
    const totalByDay = userConcerned.ActivitiesByYear[year].weeks
      .find((e: Week) => e.week === week)
      .days.find((e: Day) => e.day === day)
      .total.find((e: Total) => e.id === activityId);

    if (totalByDay) {
      totalByDay.time += Number(timeSpent);
    } else {
      userConcerned.ActivitiesByYear[year].weeks
        .find((e: Week) => e.week === week)
        .days.find((e: Day) => e.day === day)
        .total.push({ id: activityId, name: activityName, time: timeSpent });
    }
  }

  if (!edit) {
    const newPending = userConcerned.ActitvitiesNameAndStatus.find(
      (e) => e._id.toString() === activityId
    );

    newPending.pending = undefined;
  }

  userConcerned.markModified("ActivitiesByYear");

  await userConcerned.save();
};

export const incrementTimeForMultipleDays = async (
  startDate: Date,
  id: string,
  activityId: string,
  activityName: string
) => {
  let firstDayDate = new Date(startDate);

  const endOfFirstDay = new Date(firstDayDate);
  endOfFirstDay.setHours(23, 59, 59, 999);

  const firstDayTime = calculateMinutes(endOfFirstDay.getTime(), startDate);

  if (firstDayTime > 0) {
    await addTimeToActivity(
      id,
      activityId,
      activityName,
      firstDayTime,
      firstDayDate
    );
  }

  const currentDate = new Date(startDate);
  currentDate.setDate(currentDate.getDate() + 1);

  const today = new Date();
  const todayMidnight = new Date(today);
  todayMidnight.setHours(0, 0, 0, 0);

  while (currentDate < todayMidnight) {
    await addTimeToActivity(id, activityId, activityName, 1440, currentDate);

    currentDate.setDate(currentDate.getDate() + 1);
  }

  const lastDayTime = calculateMinutes(
    today.getTime(),
    todayMidnight.getTime()
  );
  if (lastDayTime > 0) {
    await addTimeToActivity(id, activityId, activityName, lastDayTime, today);
  }
};
