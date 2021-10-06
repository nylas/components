import type { Manifest as NylasManifest } from "@commons/types/Nylas";
import type { NotificationMode } from "@commons/enums/Scheduler";

export interface Manifest extends NylasManifest {
  event_title?: string;
  event_description?: string;
  show_hosts?: "show" | "hide";
  event_location?: string;
  event_conferencing?: string;
  start_hour?: number;
  end_hour?: number;
  slot_size?: 15 | 30 | 60;
  start_date?: Date;
  dates_to_show?: number;
  show_ticks?: boolean;
  email_ids?: string[];
  allow_booking?: boolean;
  max_bookable_slots?: number;
  partial_bookable_ratio?: number;
  show_as_week?: boolean;
  show_weekends?: boolean;
  attendees_to_show?: number;
  notification_mode?: NotificationMode;
  notification_message?: string;
  notification_subject?: string;
  view_as?: "schedule" | "list";
  event_buffer: number;
  recurrence: "none" | "mandated" | "optional";
  recurrence_cadence: string[]; // "none" | "daily" | "weekly" | "biweekly" | "monthly";
}
