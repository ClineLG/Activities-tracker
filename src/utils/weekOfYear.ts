const weekOfYear = (date: Date) => {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  // console.log(startOfYear);
  startOfYear.setHours(0, 0, 0, 0);
  const dayOfWeek = startOfYear.getDay();

  // const diffToFirstThursday = dayOfWeek <= 4 ? 4 - dayOfWeek : 11 - dayOfWeek;

  const diffToFirstMonday = dayOfWeek === 0 ? 1 : (1 - dayOfWeek + 7) % 7;

  // const firstThursday = new Date(startOfYear);
  //firstThursday.setDate(startOfYear.getDate() + diffToFirstThursday);

  const firstMonday = new Date(startOfYear);
  firstMonday.setDate(startOfYear.getDate() + diffToFirstMonday);

  const diffInMs = date.getTime() - firstMonday.getTime();

  const weekNumber = Math.floor(diffInMs / (7 * 24 * 60 * 60 * 1000)) + 1;

  return weekNumber;
};

export default weekOfYear;
