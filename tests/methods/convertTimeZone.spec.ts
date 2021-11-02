import { DateTime } from "luxon";
import {
  formatTimeSlot,
  setTimeZoneOffset,
} from "../../commons/src/methods/convertDateTimeZone";

const date = new Date("2041-11-01T17:00:00.000Z");
const atlanticZone = "Atlantic/South_Georgia";

describe("Format a time slot", () => {
  it("should convert a JS Date object to simple time string", () => {
    const timeSlot = formatTimeSlot(date, atlanticZone);
    expect(timeSlot).toEqual("3:00 pm");
  });

  it("should return the same time slot when zone is an empty string", () => {
    const zonelessTimeSlot = formatTimeSlot(date, "");
    expect(zonelessTimeSlot).toEqual(date);
  });

  it("should return the same time slot with zone set to an invalid IANA zone", () => {
    const zonelessTimeSlot = formatTimeSlot(date, "America/San_Francisco");
    expect(zonelessTimeSlot).toEqual(date);
  });
});

describe("Timezone offset", () => {
  it("should return an GMT offset for a given time slot and timezone", () => {
    const timeSlot = setTimeZoneOffset(date, atlanticZone);
    expect(timeSlot).toEqual("GMT-2");
  });

  it("should return undefined when the timezone is an empty string", () => {
    const timeSlotEmptyStringZone = setTimeZoneOffset(date, "");
    expect(timeSlotEmptyStringZone).toEqual(undefined);
  });

  it("should return undefined when the given timezone is an invalid IANA zone", () => {
    const invalidTimeSlotZone = setTimeZoneOffset(
      date,
      "America/San_Francisco",
    );
    expect(invalidTimeSlotZone).toEqual(undefined);
  });

  it("should return system locale when no timezone is given", () => {
    const systemZone = DateTime.local().zoneName;
    const systemOffset = DateTime.local().offsetNameShort;
    const zonelessTimeSlot = setTimeZoneOffset(date);
    expect(zonelessTimeSlot).toEqual(systemOffset);
    expect(DateTime.local().zoneName).toEqual(systemZone);
  });
});
