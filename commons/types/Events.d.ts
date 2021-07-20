declare namespace Events {
  interface _Event {
    title?: string;
    description?: string;
    participants?: Nylas.Participant[];
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

  enum EventStatus {
    Cancelled = "cancelled",
    Confirmed = "confirmed",
  }

  interface Timespan {
    start_time: number;
    end_time: number;
    object: "timespan";
    start_moment?: number;
    end_moment?: number;
  }

  interface Date {
    date: string;
    object: "date";
  }

  interface TimespanEvent extends _Event {
    when: Timespan;
  }

  interface DateEvent extends _Event {
    when: Date;
  }

  type Event = TimespanEvent | DateEvent;

  interface StoredEvents {
    queryKey: string;
    data: Promise<Events.Event[]>;
  }

  interface EventQuery {
    calendarIDs: string[];
    starts_after: number;
    ends_before: number;
    access_token?: string;
    component_id?: string;
  }

  interface Calendar {
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

  interface StoredCalendars {
    queryKey: string;
    data: Calendar[];
  }

  interface CalendarQuery {
    calendarIDs: string[];
    access_token?: string;
    component_id?: string;
  }
}
