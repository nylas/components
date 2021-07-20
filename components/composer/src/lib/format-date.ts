export const formatDate = (date: Date): string => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return `${
    months[date.getMonth()]
  } ${date.getDate()}, ${date.getHours()}:${date.getMinutes()} ${
    date.getHours() >= 12 ? "PM" : "AM"
  }`;
};
