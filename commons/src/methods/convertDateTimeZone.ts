import { DateTime } from "luxon";

/**
 * Create a DateTime from a JavaScript Date object. `zone` is the zone to place the DateTime into
 * if zone or slot is invalid or no zone is set, return slot, otherwise return unix timestamp
 *
 * @param slot Date
 * @returns unixTimestamp Number
 */
export function formatTimeSlot(slot: Date, zone: string): Date | string {
  try {
    const dateTimeSlot: DateTime = DateTime.fromJSDate(slot, { zone });
    if (
      !dateTimeSlot.isValid &&
      (dateTimeSlot.invalidReason === "unsupported zone" || !zone)
    ) {
      return slot;
    }
    return dateTimeSlot.toLocaleString(DateTime.TIME_SIMPLE, {
      locale: "en-US",
    });
  } catch (err) {
    return slot;
  }
}

export function getShortTimeZone(slot: Date, zone: string): string | undefined {
  const dateTimeSlot: DateTime = DateTime.fromJSDate(slot, { zone });

  if (
    !dateTimeSlot.isValid &&
    (dateTimeSlot.invalidReason === "unsupported zone" || !zone)
  ) {
    return;
  }

  return dateTimeSlot.zone.offsetName(dateTimeSlot.toMillis(), {
    format: "short",
  });
}
