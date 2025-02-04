const weekOfYear = (date: Date) => {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  console.log(startOfYear);
  startOfYear.setDate(startOfYear.getDate() + (startOfYear.getDay() % 7));
  return Math.round((date.getTime() - startOfYear.getTime()) / 604_800_000);
};

export default weekOfYear;
