import type {
  Manifest as AvailabilityManifest,
  TimeSlot,
} from "@commons/types/Availability";
import type { NotificationMode } from "@commons/enums/Scheduler";

export interface CustomField {
  id?: string;
  title: string;
  description?: string;
  type: "text" | "checkbox" | "email";
  required: boolean;
  placeholder?: string;
}

export interface Manifest extends AvailabilityManifest {
  availability_id: string;
  editor_id: string;
  booking_label: string;
  custom_fields: CustomField[];
  event_title: string;
  event_description: string;
  event_location: string;
  event_conferencing: string;
  slots_to_book: TimeSlot[];
  notification_mode: NotificationMode;
  notification_message: string;
  notification_subject: string;
  recurrence: "none" | "required" | "optional";
  recurrence_cadence: (
    | "none"
    | "daily"
    | "weekdays"
    | "weekly"
    | "biweekly"
    | "monthly"
  )[];
  recurrence_expiry: Date | string | null;
}
