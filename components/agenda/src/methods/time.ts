import type { Event } from "@commons/types/Events";

function getDynamicStartTime(event: Event): number {
  if (!("start_time" in event.when && "end_time" in event.when)) {
    return 0;
  }

  const start =
    new Date(event.when.start_time * 1000).getTime() -
    new Date(
      new Date(event.when.start_time * 1000).setHours(0, 0, 0, 0),
    ).getTime();
  return start / 60000; // in minutes
}

function getDynamicEndTime(event: Event): number {
  if (!("start_time" in event.when && "end_time" in event.when)) {
    return 0;
  }

  let start =
    new Date(event.when.start_time * 1000).getTime() -
    new Date(
      new Date(event.when.start_time * 1000).setHours(0, 0, 0, 0),
    ).getTime();

  start = start / 60000; // in minutes
  let runTime =
    new Date(event.when.end_time * 1000).getTime() -
    new Date(event.when.start_time * 1000).getTime();

  runTime = runTime / 60000; // in minutes

  return start + runTime;
}

export { getDynamicEndTime, getDynamicStartTime };
