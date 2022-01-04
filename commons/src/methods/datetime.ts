import type { Day } from "@commons/types/Availability";

/**
 * Eventually, perhaps a design-system-level guideline for date and time strings.
 *
 * Currently, Date logic: https://www.figma.com/file/oiCKNsHDfAo9KnH1Sbs8Xj/Email-%26-Mailbox-Component?node-id=128%3A51
 * No time logic standard yet
 */

export function showDateRange(days: Day[]): string {
  if (!Array.isArray(days) || days.length === 0) {
    return "";
  }

  const firstDay = days[0].timestamp;
  const lastDay = days[days.length - 1].timestamp;

  if (lastDay.getMonth() !== firstDay.getMonth()) {
    if (lastDay.getFullYear() !== firstDay.getFullYear()) {
      // Case 1: months and years differ: Dec 2021 - Jan 2022
      return `${getMonthString(firstDay, true)} - ${getMonthString(
        lastDay,
        true,
      )}`;
    }
    // Case 2: months differ, years the same: Oct - Nov 2021
    return `${getMonthString(firstDay)} - ${getMonthString(lastDay, true)}`;
  }
  // Case 3: months, and therefore years, are the same: Oct 2021
  return getMonthString(firstDay, true);
}

export function getCondensedTimeString(date: Date): string {
  // 1 am | 1:15 am
  const timeString = date.toLocaleTimeString([], { timeStyle: "short" });
  if (date.getMinutes() === 0) {
    return date
      .toLocaleTimeString([], {
        hour: "numeric",
        hour12: true,
      })
      .replaceAll(/\./g, "");
  }
  return timeString.replaceAll(/\./g, "");
}

export function getTimeString(date: Date): string {
  // 11:11 am, Noon
  const timeString = date.toLocaleTimeString([], { timeStyle: "short" });
  if (timeString === "12:00 p.m.") {
    return "Noon";
  }
  return timeString.replace(/\./g, "");
}

export function getMonthString(date: Date, withYear = false): string {
  return date
    .toLocaleDateString("default", {
      month: "short",
      year: withYear ? "numeric" : undefined,
    })
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

export function formatPreviewDate(date: Date): string {
  const today = new Date(new Date().setHours(0, 0, 0, 0));
  const yesterday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - 1,
    0,
    0,
    0,
    0,
  );
  const lastWeek = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - 6,
    0,
    0,
    0,
    0,
  );
  const thisYear = new Date(today.getFullYear(), 0, 1);

  if (date >= today) {
    return date.toLocaleTimeString("en-US", {
      hour12: true,
      hour: "numeric",
      minute: "2-digit",
    });
  } else if (date >= yesterday) {
    return "Yesterday";
  } else if (date >= lastWeek) {
    return weekdays[date.getDay()];
  } else if (date >= thisYear) {
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    });
  } else {
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }
}

export function formatExpandedDate(date: Date): string {
  return (
    date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "long",
      day: "numeric",
    }) +
    ", " +
    date.toLocaleTimeString("en-US", {
      hour12: true,
      hour: "numeric",
      minute: "2-digit",
    })
  );
}
