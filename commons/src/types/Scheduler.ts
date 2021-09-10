import type {
  Manifest as AvailabilityManifest,
  TimeSlot,
} from "@commons/types/Availability";

export interface Manifest extends AvailabilityManifest {
  availability_id?: string;
  editor_id?: string;
  booking_label?: string;
  event_title?: string;
  event_description?: string;
  slots_to_book?: TimeSlot[];
}
