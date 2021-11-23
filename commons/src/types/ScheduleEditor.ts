import type { Manifest as NylasManifest } from "@commons/types/Nylas";
import type { NotificationMode } from "@commons/enums/Scheduler";
import type { AvailabilityRule } from "@commons/types/Availability";
import type { CustomField } from "./Scheduler";

export interface Manifest extends NylasManifest {
  show_hosts: "show" | "hide";
  start_hour: number;
  end_hour: number;
  start_date: Date;
  dates_to_show: number;
  show_ticks: boolean;
  allow_booking: boolean;
  max_bookable_slots: number;
  partial_bookable_ratio: number;
  show_as_week: boolean;
  show_weekends: boolean;
  attendees_to_show: number;
  notification_mode: NotificationMode;
  notification_message: string;
  notification_subject: string;
  view_as: "schedule" | "list";
  event_buffer: number;
  capacity: number | null;
  date_format: "full" | "weekday" | "date" | "none";
  open_hours: AvailabilityRule[];
  recurrence: "none" | "required" | "optional";
  recurrence_cadence: (
    | "none"
    | "daily"
    | "weekdays"
    | "weekly"
    | "biweekly"
    | "monthly"
  )[];
  overbooked_threshold: number;
  mandate_top_of_hour: boolean;
  show_preview: boolean;
  timezone: string;
  screen_bookings: boolean;
  max_book_ahead_days: number;
  min_book_ahead_days: number;
  custom_fields: CustomField[];
  events: any[]; // TODO
<<<<<<< HEAD
}

export interface EventDefinition {
  event_title: string;
  event_description: string;
  event_location: string;
  event_conferencing: string;
  slot_size: 15 | 30 | 60;
  email_ids: string[];
  host_rules: HostRules;
}

interface HostRules {
  method: "all" | "user_determined" | "random";
  host_count?: number;
=======
>>>>>>> 464f387 (Multiple events)
}
