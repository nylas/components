import type {
  Manifest as AvailabilityManifest,
  TimeSlot,
} from "@commons/types/Availability";
import type { NotificationMode } from "@commons/enums/Scheduler";

export interface Manifest extends AvailabilityManifest {
  availability_id?: string;
  editor_id?: string;
  booking_label?: string;
  event_title?: string;
  event_description?: string;
  event_location?: string;
  event_conferencing?: string;
  slots_to_book?: TimeSlot[];
  notification_mode?: NotificationMode;
  notification_message?: string;
  notification_subject?: string;
  recurrence?: "none" | "required" | "optional";
  recurrence_cadence?: string[]; // "none" | "daily" | "weekdays" | "weekly" | "biweekly" | "monthly";
}
