import { DateTime, Settings } from "luxon";
import {
  formatTimeSlot,
  setTimeZoneOffset,
} from "../../commons/src/methods/convertDateTimeZone";

const date = new Date("2041-11-01T17:00:00.000Z");
const simpleTimeString = "1:00 pm";
const atlanticZone = "Atlantic/South_Georgia";

Settings.defaultLocale = "en-CA";

describe("Format a time slot", () => {
  beforeEach(() => {
    Settings.defaultZone = "America/Toronto";
  });
  afterEach(() => {
    Settings.defaultZone = "system";
  });
  it("should convert a JS Date object to simple time string", () => {
    const timeSlot = formatTimeSlot(date, atlanticZone);
    expect(timeSlot).toEqual("3:00 pm");
  });

  it("should return a time string when the timezone is an empty string", () => {
    const zonelessTimeSlot = formatTimeSlot(date, "");
    expect(zonelessTimeSlot).toEqual(simpleTimeString);
  });

  it("should return return a time string when the timezone is an invalid IANA zone", () => {
    const zonelessTimeSlot = formatTimeSlot(date, "America/San_Francisco");
    expect(zonelessTimeSlot).toEqual(simpleTimeString);
  });
});

describe("Timezone offset", () => {
  it("should return an GMT offset for a given time slot and timezone", () => {
    const timeSlot = setTimeZoneOffset(date, atlanticZone);
    expect(timeSlot).toEqual("GMT-2");
  });

  it("should return undefined when the timezone is an empty string", () => {
    const timeSlotEmptyStringZone = setTimeZoneOffset(date, "");
    expect(timeSlotEmptyStringZone).toEqual("");
  });

  it("should return undefined when the given timezone is an invalid IANA zone", () => {
    const invalidTimeSlotZone = setTimeZoneOffset(
      date,
      "America/San_Francisco",
    );
    expect(invalidTimeSlotZone).toEqual("");
  });

  it("should return system locale when no timezone is given", () => {
    const systemZone = DateTime.local().zoneName;
    const systemOffset = DateTime.local().offsetNameShort;
    const zonelessTimeSlot = setTimeZoneOffset(date);
    expect(zonelessTimeSlot).toEqual(systemOffset);
    expect(DateTime.local().zoneName).toEqual(systemZone);
  });
});
