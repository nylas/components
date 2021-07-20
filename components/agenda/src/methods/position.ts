export interface EventPosition {
  overlaps: Events.TimespanEvent[];
  offset: number;
  leftNeighbour: Events.TimespanEvent | null;
  widthOverride?: number;
}

// Controls how granular the time slot "buckets" are in minutes.
// Decreasing this value will improve event overlap calculation, but will impact performance and memory.
const EVENT_OVERLAP_GRANULARITY = 10;

export function populatePositionMap(
  events: Events.TimespanEvent[],
  positionMap: Record<string, EventPosition>,
) {
  // Populate the position map with each event's overlaps
  events.forEach((event) => {
    positionMap[event.id] = {
      overlaps: events.filter((other: Events.TimespanEvent) => {
        return (
          event.id !== other.id &&
          other.when.start_time < event.when.end_time &&
          other.when.end_time > event.when.start_time
        );
      }),
      offset: 0,
      leftNeighbour: null,
    };
  });
}

export function updateEventPosition(
  event: Events.TimespanEvent,
  positionMap: Record<string, EventPosition>,
) {
  const overlappingEvents = positionMap[event.id].overlaps;

  // Events without overlaps can be placed without extra logic
  if (overlappingEvents.length === 0) {
    event.relativeOverlapWidth = 1;
    event.relativeOverlapOffset = 0;
    return;
  }

  // A left neighbour is an overlapping event that has already been positioned to the left of this event
  const leftNeighbour = positionMap[event.id].leftNeighbour;

  if (
    !!leftNeighbour &&
    overlappingEvents.filter(
      (overlappingEvent) =>
        event.when.end_time - event.when.start_time >=
        overlappingEvent.when.end_time - overlappingEvent.when.start_time,
    ).length === 0
  ) {
    // If the current event has a left neighbour and no overlapping event that is shorter than it, we assume
    // that this will be the right-most event. In this case, the event is sized to take up the remaining width.
    event.relativeOverlapWidth = 1 - leftNeighbour.relativeOverlapWidth;
  } else {
    event.relativeOverlapWidth = calculateEventWidth(event, overlappingEvents);
  }

  // Set the event's offset from the left margin
  event.relativeOverlapOffset = positionMap[event.id].offset;

  // Handles an edge case where an event straddles two events, creating a staircase layout
  // This workaround repositions the straddled event as far left as possible
  // TODO - Investigate improving overall algorithm to handle this scenario more cleanly
  event.relativeOverlapWidth = positionMap[event.id].widthOverride
    ? (positionMap[event.id].widthOverride as number)
    : event.relativeOverlapWidth;

  // Finally, increase the position offset of all overlapping events that will
  // be placed to the right of the current event.
  overlappingEvents.forEach((overlappingEvent) => {
    if (
      !leftNeighbour ||
      overlappingEvent.when.start_time < leftNeighbour.when.end_time
    ) {
      positionMap[overlappingEvent.id].offset += event.relativeOverlapWidth;
      positionMap[overlappingEvent.id].leftNeighbour = event;
    } else {
      // If an event has a left neighbour, and an overlapping event that begins after the left neighbour ends,
      // we identify it as an event that straddles two events, and could cause a staircase layout.
      positionMap[overlappingEvent.id].widthOverride =
        event.relativeOverlapOffset;
    }
  });
}

function calculateEventWidth(
  event: Events.TimespanEvent,
  overlappingEvents: Events.TimespanEvent[],
): number {
  const eventTimeMinutes = Math.ceil(
    (event.when.end_time - event.when.start_time) /
      (60 * EVENT_OVERLAP_GRANULARITY),
  );

  // Create an array of time slot "buckets" that will track the number of overlapping events in each time slot
  const overlapArr = new Array(eventTimeMinutes).fill(1);

  overlappingEvents.forEach((overlappingEvent) => {
    // Find which time slot "bucket" the overlapping event starts and ends in
    let startTime = 0;
    if (event.when.start_time <= overlappingEvent.when.start_time) {
      const localStartTime = Math.ceil(
        (overlappingEvent.when.start_time - event.when.start_time) /
          (60 * EVENT_OVERLAP_GRANULARITY),
      );

      startTime = Math.min(Math.max(0, localStartTime), overlapArr.length - 1);
    }

    let endTime = overlapArr.length - 1;
    if (event.when.end_time >= overlappingEvent.when.end_time) {
      const localEndTime = Math.ceil(
        Math.abs(overlappingEvent.when.end_time - event.when.end_time) /
          (60 * EVENT_OVERLAP_GRANULARITY),
      );

      endTime = Math.max(startTime, overlapArr.length - localEndTime - 1);
    }

    // Increment the values of the "buckets" contained in the overlapping event
    for (let i = startTime; i <= endTime; i++) {
      overlapArr[i]++;
    }
  });

  // The event width is determined by the maximum number of overlaps at a given time slot
  return 1 / Math.max(...overlapArr);
}
