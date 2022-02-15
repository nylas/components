import type {
  BookableSlot,
  Manifest as AvailabilityManifest,
} from "@commons/types/Availability";
import type { NotificationMode } from "@commonsenums/Booking";
import type { EventDefinition } from "./ScheduleEditor";

export interface CustomField {
  description?: string;
  required: boolean;
  title: string;
  type: "text" | "checkbox" | "email";
  id?: string;
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
  slots_to_book: BookableSlot[];
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
  events: EventDefinition[];
  event_options: ConsecutiveEvent[][];
}

export interface ConsecutiveEvent {
  emails: string[];
  start_time: Date;
  end_time: Date;
  available_calendars: string[];
  event_description: string;
  event_title: string;
  slot_size: number;
}
