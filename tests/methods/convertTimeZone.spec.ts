import { formatTimeSlot } from "../../commons/src/methods/convertDateTimeZone";
import { DateTime } from "luxon";

const date = new Date("2041-11-01T17:00:00.000Z");
const atlanticZone = "Atlantic/South_Georgia";
const eastern = "America/Toronto";

describe("A time slot timezone conversion", () => {
  it("should convert a JS Date object to unix timestamp", () => {
    const unixTimeSlot = formatTimeSlot(date, atlanticZone);
    expect(unixTimeSlot).toEqual(2266938000);
  });

  it("should convert the unix timestamp to the expected Eastern Time string", () => {
    const easternDateTime = DateTime.fromSeconds(2266938000)
      .setZone(eastern)
      .toJSDate();
    expect(easternDateTime.toString()).toEqual(
      "Fri Nov 01 2041 13:00:00 GMT-0400 (Eastern Daylight Time)",
    );
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
