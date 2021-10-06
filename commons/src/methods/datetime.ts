export function getTimeString(date: Date): string {
  // 11:11am
  return date
    .toLocaleTimeString([], { timeStyle: "short" })
    .replaceAll(/\./g, "");
}

export function getYearString(date: Date): string {
  // Jul 5th 2020
  const suffixMapper = (num: number): string => {
    if ([31, 21, 1].includes(num)) return "st ";
    if ([22, 2].includes(num)) return "nd ";
    if ([23, 3].includes(num)) return "rd ";
    return "th ";
  };
  return date
    .toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
    .replaceAll(/, /g, suffixMapper(date.getDate()))
    .replaceAll(/[.]/g, "");
}

export function getDateString(date: Date): string {
  // Sep 22
  return date
    .toLocaleDateString(undefined, { month: "short", day: "numeric" })
    .replaceAll(/[.]/g, "");
}

// Date logic: https://www.figma.com/file/oiCKNsHDfAo9KnH1Sbs8Xj/Email-%26-Mailbox-Component?node-id=128%3A51
export function getDate(date: Date): string {
  const today = new Date();
  if (today.toDateString() === date.toDateString()) {
    return getTimeString(date);
  }

  const diff_years = today.getFullYear() - date.getFullYear();
  if (diff_years !== 0) {
    return getYearString(date);
  }

  const yesterday = new Date(today.getDate() - 1);
  if (yesterday.toDateString() === date.toDateString()) {
    return "Yesterday";
  }

  return getDateString(date);
}

export const weekdays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
