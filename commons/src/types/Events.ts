import type { Participant } from "@commons/types/Nylas";
import type { EventStatus } from "@commons/enums/Events";

interface _Event {
  title?: string;
  description?: string;
  participants?: Participant[];
  owner: string;
  id: string;
  calendar_id: string;
  account_id: string;
  busy: boolean;
  status?: EventStatus;
  relativeStartTime: number;
  relativeRunTime: number;
  relativeOverlapOffset: number;
  relativeOverlapWidth: number;
  location?: string;
  locationString?: string;
  attendeeStatus?: "yes" | "no" | "noreply" | "maybe";
  isNewEvent?: boolean;
}

export interface Timespan {
  start_time: number;
  end_time: number;
  object: "timespan";
  start_moment?: number;
  end_moment?: number;
}

export interface Date {
  date: string;
  object: "date";
}

export interface TimespanEvent extends _Event {
  when: Timespan;
}

export interface DateEvent extends _Event {
  when: Date;
}

export type Event = TimespanEvent | DateEvent;

export interface StoredEvents {
  queryKey: string;
  data: Promise<Event[]>;
}

export interface EventQuery {
  calendarIDs: string[];
  starts_after: number;
  ends_before: number;
  access_token?: string;
  component_id?: string;
}

export interface Calendar {
  account_id: string;
  description: string;
  id: string;
  is_primary: null | boolean;
  location: null | string;
  name: string;
  object: string;
  read_only: boolean;
  timezone: null | string;
}

export interface StoredCalendars {
  queryKey: string;
  data: Calendar[];
}

export interface CalendarQuery {
  calendarIDs: string[];
  access_token?: string;
  component_id?: string;
}
