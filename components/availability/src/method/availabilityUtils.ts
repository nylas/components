import {
  SelectionStatus,
  AvailabilityStatus,
} from "@commons/enums/Availability";
import { timeDay, timeHour, timeMinute } from "d3-time";
import { scaleTime } from "d3-scale";
import type { TimeInterval } from "d3-time";
import type { Manifest, TimeSlot } from "@commons/types/Availability";
import { arrayContainsArray } from "@commons/methods/component";
import type { ConsecutiveEvent } from "@commonstypes/Scheduler";

// map over the ticks() of the time scale between your start day and end day
// populate them with as many slots as your start_hour, end_hour, and slot_size dictate
export const generateDaySlots = (
  timestamp: Date,
  allCalendars: any[],
  calendarID: string,
  requiredParticipants: string[],
  consecutiveOptions: ConsecutiveEvent[][],
  consecutiveParticipants: string[],
  internalProps: Manifest,
): any[] => {
  const dayStart = timeHour(
    new Date(new Date(timestamp).setHours(internalProps.start_hour)),
  );
  const dayEnd = timeHour(
    new Date(new Date(timestamp).setHours(internalProps.end_hour)),
  );
  return scaleTime()
    .domain([dayStart, dayEnd])
    .ticks(timeMinute.every(internalProps.slot_size) as TimeInterval)
    .slice(0, -1) // dont show the 25th hour
    .map((time: Date) => {
      const endTime = timeMinute.offset(time, internalProps.slot_size);
      const freeCalendars: string[] = [];
      let availability = AvailabilityStatus.FREE; // default
      if (allCalendars.length) {
        const currentSlot: TimeSlot = {
          start_time: time,
          end_time: endTime,
          available_calendars: [],
          expirySelection: "",
          recurrence_cadence: "",
          recurrence_expiry: "",
          fallsWithinAllowedTimeRange: false,
        };
        for (const calendar of allCalendars) {
          // Adjust calendar.timeslots for buffers
          const timeslots =
            calendar.availability === AvailabilityStatus.BUSY
              ? calendar.timeslots.map((slot: TimeSlot) => ({
                  start_time: timeMinute.offset(
                    slot.start_time,
                    -internalProps.event_buffer,
                  ),
                  end_time: timeMinute.offset(
                    slot.end_time,
                    internalProps.event_buffer,
                  ),
                }))
              : calendar.timeslots.map((slot: TimeSlot) => ({
                  // Don't apply start-buffer to the first timeslot, nor end-buffer to the last timeslot.
                  // Works across multiple days; you won't get a random buffer at 11:50 / 00:10
                  start_time: timeMinute.offset(
                    slot.start_time,
                    slot === calendar.timeslots[0]
                      ? 0
                      : internalProps.event_buffer,
                  ),
                  end_time: timeMinute.offset(
                    slot.end_time,
                    slot === calendar.timeslots[calendar.timeslots.length - 1]
                      ? 0
                      : -internalProps.event_buffer,
                  ),
                }));

          let concurrentSlotEventsForUser = 0;
          if (calendar.availability === AvailabilityStatus.BUSY) {
            // For Busy calendars, a timeslot is considered available if its calendar has no overlapping events
            concurrentSlotEventsForUser = overlap(timeslots, currentSlot);
          } else if (calendar.availability === AvailabilityStatus.FREE) {
            // For Free calendars, a timeslot is considered available if its calendar has a time that fully envelops it.
            concurrentSlotEventsForUser = timeslots.some(
              (blob: TimeSlot) =>
                currentSlot.start_time >= blob.start_time &&
                currentSlot.end_time <= blob.end_time,
            )
              ? 1
              : 0;
            // slot availability is when a given timeslot has all of its minutes represented in calendar.free timeslots
          }
          if (calendar.availability === AvailabilityStatus.BUSY) {
            if (
              internalProps.capacity &&
              internalProps.capacity >= 1 &&
              concurrentSlotEventsForUser < internalProps.capacity
            ) {
              freeCalendars.push(calendar?.account?.emailAddress || "");
            } else if (!concurrentSlotEventsForUser) {
              freeCalendars.push(calendar?.account?.emailAddress || "");
            }
          } else if (
            calendar.availability === AvailabilityStatus.FREE ||
            !calendar.availability
          ) {
            // if a calendar is passed in without availability, assume the timeslots are available.
            if (concurrentSlotEventsForUser) {
              freeCalendars.push(calendar?.account?.emailAddress || "");
            }
          }
        }

        if (freeCalendars.length) {
          if (freeCalendars.length === allCalendars.length) {
            availability = AvailabilityStatus.FREE;
          } else {
            availability = AvailabilityStatus.PARTIAL;
          }
        } else {
          availability = AvailabilityStatus.BUSY;
        }
      }

      // If availability is partial (not 100% of calendars), and that ratio is less than partial_bookable_ratio,
      // mark the slot as busy
      if (
        availability === AvailabilityStatus.PARTIAL &&
        freeCalendars.length <
          allCalendars.length * internalProps.partial_bookable_ratio
      ) {
        availability = AvailabilityStatus.BUSY;
      }

      // Allows users to book over busy slots if partial_bookable_ratio is 0
      if (
        availability === AvailabilityStatus.BUSY &&
        internalProps.partial_bookable_ratio === 0
      ) {
        availability = AvailabilityStatus.PARTIAL;
      }

      // If availability is partial, but a required participant is unavailble, the slot becomes Busy
      if (
        availability === AvailabilityStatus.PARTIAL &&
        internalProps.required_participants.length
      ) {
        //Check if every participants is included in the available calendar
        if (!arrayContainsArray(requiredParticipants, freeCalendars)) {
          availability = AvailabilityStatus.BUSY;
        }
      }

      // If mandate_top_of_hour, change any status to "busy" if it's not at :00
      if (internalProps.mandate_top_of_hour && time.getMinutes() !== 0) {
        availability = AvailabilityStatus.BUSY;
        freeCalendars.length = 0;
      }

      // if the "open_hours" property has rules, adhere to them above any other event-based free/busy statuses
      // (Mark the slot busy if it falls outside the open_hours)
      if (internalProps.open_hours.length) {
        if (availability !== AvailabilityStatus.BUSY) {
          let dayRelevantRules = [];
          dayRelevantRules = internalProps.open_hours.filter(
            (rule) =>
              !Object.prototype.hasOwnProperty.call(rule, "startWeekday") ||
              rule.startWeekday === time.getDay() ||
              rule.endWeekday === time.getDay(),
          );
          const slotExistsInOpenHours = dayRelevantRules.some((rule) => {
            const ruleStartAppliedDate = Object.prototype.hasOwnProperty.call(
              rule,
              "startWeekday",
            )
              ? timeDay.offset(
                  time,
                  (rule.startWeekday as number) - time.getDay(),
                )
              : new Date(time);
            ruleStartAppliedDate.setHours(rule.startHour);
            ruleStartAppliedDate.setMinutes(rule.startMinute);

            const ruleEndAppliedDate = Object.prototype.hasOwnProperty.call(
              rule,
              "startWeekday",
            )
              ? timeDay.offset(
                  time,
                  (rule.endWeekday as number) - time.getDay(),
                )
              : new Date(time);
            ruleEndAppliedDate.setHours(rule.endHour);
            ruleEndAppliedDate.setMinutes(rule.endMinute);

            return (
              time >= ruleStartAppliedDate && endTime <= ruleEndAppliedDate
            );
          });
          if (!slotExistsInOpenHours) {
            availability = AvailabilityStatus.CLOSED;
            freeCalendars.length = 0;
          }
        }
      }

      // Handle the Consecutive Events model, where a slot if busy if it falls within a consecutive timeslot.
      // None of the other above rules should apply, except (maybe!) Buffer and Open Hours.
      if (internalProps.events?.length > 1 && consecutiveOptions.length) {
        const existsWithinConsecutiveBlock = consecutiveOptions.some(
          (event) => {
            return (
              time >= event[0].start_time &&
              endTime <= event[event.length - 1].end_time
            );
          },
        );
        if (existsWithinConsecutiveBlock) {
          availability = AvailabilityStatus.FREE;
          freeCalendars.length = consecutiveParticipants.length;
        } else {
          availability = AvailabilityStatus.BUSY;
          freeCalendars.length = 0;
        }
      }

      const today = new Date(new Date().setHours(0, 0, 0, 0)).getTime();
      const dayOffset =
        (new Date(timestamp).getTime() - today) / (1000 * 60 * 60 * 24);

      const timeOffset =
        (new Date(time).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24);

      return {
        selectionStatus: SelectionStatus.UNSELECTED,
        calendar_id: calendarID,
        availability: availability,
        available_calendars: freeCalendars,
        start_time: time,
        end_time: endTime,
        fallsWithinAllowedTimeRange:
          timeOffset >= 0 &&
          dayOffset >= internalProps.min_book_ahead_days &&
          dayOffset <= internalProps.max_book_ahead_days,
      };
    });
};

// https://derickbailey.com/2015/09/07/check-for-date-range-overlap-with-javascript-arrays-sorting-and-reducing/
export function overlap(events: TimeSlot[], slot: TimeSlot): number {
  return events.reduce((result, current) => {
    const overlap =
      slot.start_time < current.end_time && current.start_time < slot.end_time;

    if (overlap) {
      // store the amount of overlap
      result++;
    }
    return result;
  }, 0);
}
