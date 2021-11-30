import type {
  SelectionStatus,
  AvailabilityStatus,
} from "@commons/enums/Availability";
import type {
  CommonQuery,
  Manifest as NylasManifest,
} from "@commons/types/Nylas";
export interface Manifest extends NylasManifest {
  allow_booking: boolean;
  allow_date_change: boolean;
  attendees_to_show: number;
  booking_user_email: string;
  booking_user_token: string;
  busy_color: string;
  calendars: Calendar[];
  capacity: number | null;
  closed_color: string;
  date_format: "full" | "weekday" | "date" | "none";
  dates_to_show: number;
  email_ids: string[];
  participants: string[];
  end_hour: number;
  event_buffer: number;
  free_color: string;
  mandate_top_of_hour: boolean;
  max_bookable_slots: number;
  max_book_ahead_days: number;
  min_book_ahead_days: number;
  open_hours: AvailabilityRule[];
  overbooked_threshold: number;
  partial_bookable_ratio: number;
  partial_color: string;
  required_participants: string[];
  selected_color: string;
  show_as_week: boolean;
  show_header: boolean;
  show_hosts: "show" | "hide";
  show_ticks: boolean;
  show_weekends: boolean;
  slot_size: 15 | 30 | 60;
  start_date: Date;
  start_hour: number;
  view_as: "schedule" | "list";
  timezone: string;
}

export interface AvailabilityRule {
  startWeekday?: number;
  startHour: number;
  startMinute: number;
  endWeekday?: number;
  endHour: number;
  endMinute: number;
  timeZone?: string;
}

export interface Calendar {
  availability: AvailabilityStatus.FREE | AvailabilityStatus.BUSY;
  timeslots: TimeSlot[];
  account: CalendarAccount;
}

export interface CalendarAccount {
  firstName: string;
  lastName: string;
  emailAddress: string;
  avatarUrl: string;
}

export interface TimeSlot {
  start_time: Date;
  end_time: Date;
  available_calendars: string[];
  calendar_id?: string;
  expirySelection: string;
  recurrence_cadence: string;
  recurrence_expiry: string;
}

export interface SelectableSlot extends TimeSlot {
  selectionStatus: SelectionStatus;
  availability: AvailabilityStatus;
  selectionPending?: boolean;
  hovering?: boolean;
  timezone?: string;
}

export interface AvailabilityQuery extends CommonQuery {
  body: {
    emails: string[];
    start_time: number;
    end_time: number;
    free_busy: any[];
    duration_minutes: number;
    interval_minutes: number;
  };
  forceReload?: boolean;
}

export interface FreeBusyResponse {
  object: "free_busy";
  time_slots: {
    start_time: number;
    end_time: number;
  }[];
  email: string;
}

export interface PreDatedTimeSlot
  extends Omit<TimeSlot, "start_time" | "end_time"> {
  start_time: number;
  end_time: number;
  start?: number;
  end?: number;
  emails: string[]; //present when round_robin property is set on request, which it always is in Availability
}

export interface AvailabilityResponse {
  object: "availability";
  order: string[]; //present when round_robin property is set on request, which it always is in Availability
  time_slots: PreDatedTimeSlot[];
}

export interface EventQuery extends CommonQuery {
  participants?: EventParticipant[];
  title?: string;
  location?: string;
}

export interface EventParticipant {
  email_address: string;
}

export interface Day {
  epochs: any[]; // TODO typing
  isBookable: boolean;
  slots: SelectableSlot[];
  timestamp: Date;
}
