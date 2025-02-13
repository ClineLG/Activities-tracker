const calculateMinutes = (end: number | Date, start: number | Date) =>
  Math.round((Number(end) - Number(start)) / 60000);

export default calculateMinutes;

//64637106;
