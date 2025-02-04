type Day = {
  day: number;
  total: number;
  start: number;
  end: number;
};

type Week = {
  week: number;
  month: number;
  total: number;
  days: Day[];
};

type Year = {
  total: number;
  weeks: Week[];
};

type Activity = {
  name: string;
  actual: boolean;
  activityByYear: { [key: number]: Year }[];
};

// type User = {
//   _id: string;
//   account: { username: string; avatar: object };
//   token: string;
//   email: string;
//   hash: string;
//   salt: string;
//   Actitvities: Activity[];
// };

export { Week, Day, Year, Activity };
