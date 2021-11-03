import { DateTime } from "luxon";

/**
 *
 * @param slot Date
 * @param zone string
 * @returns Date | string
 */
export function formatTimeSlot(slot: Date, zone: string): Date | string {
  try {
    const dateTimeSlot = DateTime.fromJSDate(slot, { zone });

    if (
      !dateTimeSlot.isValid &&
      (dateTimeSlot.invalidReason === "unsupported zone" || !zone)
    ) {
      return slot;
    }
    return dateTimeSlot.toLocaleString(DateTime.TIME_SIMPLE).replace(/\./g, "");
  } catch (err) {
    return slot;
  }
}

/**
 *
 * @param slot Date
 * @param zone string
 * @returns string | undefined
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
