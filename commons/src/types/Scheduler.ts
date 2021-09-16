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
  slots_to_book?: TimeSlot[];
  notification_mode?: NotificationMode;
  notification_message?: string;
  notification_subject?: string;
}
