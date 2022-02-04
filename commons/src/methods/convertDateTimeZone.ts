import { DateTime, IANAZone } from "luxon";

export function isValidTimezone(zone: string) {
  return IANAZone.isValidZone(zone);
}

/**
 *
 * @param slot Date
 * @param zone string
 * @returns string
 */
export function formatTimeSlot(slot: Date, zone: string): string {
  const unformattedTimeSlot = DateTime.fromJSDate(slot)
    .toLocaleString(DateTime.TIME_SIMPLE)
    .replace(/\./g, "");
  try {
    const dateTimeSlot = DateTime.fromJSDate(slot, { zone });
    if (
      !dateTimeSlot.isValid &&
      (dateTimeSlot.invalidReason === "unsupported zone" || !zone)
    ) {
      return unformattedTimeSlot;
    }
    return dateTimeSlot.toLocaleString(DateTime.TIME_SIMPLE).replace(/\./g, "");
  } catch (err) {
    return unformattedTimeSlot;
  }
}

/**
 *
 * @param slot Date
 * @param zone string
 * @returns string
 */
export function setTimeZoneOffset(slot: Date, zone?: string): string {
  const dateTimeSlot = DateTime.fromJSDate(slot, { zone });
  if (
    (zone && !isValidTimezone(zone)) ||
    (!dateTimeSlot.isValid &&
      (dateTimeSlot.invalidReason === "unsupported zone" || !zone))
  ) {
    return "";
  }
  return dateTimeSlot.offsetNameShort;
}

/**
 *
 *
 * @param zone string
 * @returns number (in milliseconds)
 */
export function getSpecifiedTimeZoneOffset(zone?: string): number {
  if (!zone || !isValidTimezone(zone)) {
    return 0;
  }
  const dt = DateTime.now();
  const dtz = DateTime.now().setZone(zone, { keepLocalTime: true });
  return dt.diff(dtz).milliseconds;
}

/**
 *
 * @param date Date
 * @param zone string
 * @returns number (in milliseconds)
 */
export function getTimeInTimezone(date: Date, zone?: string): number {
  const timeValue = date.getTime();
  return timeValue + getSpecifiedTimeZoneOffset(zone);
}
