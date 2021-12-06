import type { Participant } from "@commons/types/Nylas";
import type { EventStatus } from "@commons/enums/Events";

interface _Event {
  account_id: string;
  busy: boolean;
  calendar_id: string;
  id: string;
  owner: string;
  recurrence: EventRecurrence;
  relativeOverlapOffset: number;
  relativeOverlapWidth: number;
  relativeRunTime: number;
  relativeStartTime: number;
  attendeeStatus?: "yes" | "no" | "noreply" | "maybe";
  conferencing?: EventConferencing;
  description?: string;
  isNewEvent?: boolean;
  location?: string;
  locationString?: string;
  metadata?: Record<string, any>;
  participants?: Participant[];
  status?: EventStatus;
  title?: string;
}

export interface EventRecurrence {
  rrule: string[];
  timezone: string;
}

export interface EventConferencing {
  provider?: "WebEx" | "Zoom Meeting" | "GoToMeeting" | "Google Meet";
  details: {
    url: string;
  };
}
export interface Timespan {
  start_time: number;
  end_time: number;
  object?: "timespan";
  start_moment?: number;
  end_moment?: number;
}

export interface Date {
  date: string;
  object?: "date";
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
