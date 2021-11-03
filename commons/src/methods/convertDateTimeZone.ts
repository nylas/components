import { DateTime } from "luxon";
import { getTimeString } from "@commons/methods/datetime";

/**
 *
 * @param slot Date
 * @param zone string
 * @returns string
 */
export function formatTimeSlot(slot: Date, zone: string): string {
  const unformattedTimeSlot = getTimeString(slot);
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
export function setTimeZoneOffset(
  slot: Date,
  zone: string | undefined = undefined,
): string {
  const dateTimeSlot = DateTime.fromJSDate(slot, { zone });
  if (
    !dateTimeSlot.isValid &&
    (dateTimeSlot.invalidReason === "unsupported zone" || !zone)
  ) {
    return "";
  }
  return dateTimeSlot.offsetNameShort;
}
