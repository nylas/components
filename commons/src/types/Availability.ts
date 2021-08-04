import type {
  SelectionStatus,
  AvailabilityStatus,
} from "@commons/enums/Availability";
import type { Manifest as NylasManifest } from "@commons/types/Nylas";
export interface Manifest extends NylasManifest {
  start_hour: number;
  end_hour: number;
  slot_size: 15 | 30 | 60;
  start_date: Date;
  dates_to_show: number;
  show_ticks: boolean;
  calendars: Calendar[];
}

export interface Calendar {
  emailAddress: string;
  availability: AvailabilityStatus.FREE | AvailabilityStatus.BUSY;
  timeslots: TimeSlot[];
}

export interface TimeSlot {
  start_time: Date;
  end_time: Date;
}

export interface SelectableSlot extends TimeSlot {
  selectionStatus: SelectionStatus;
  availability: AvailabilityStatus;
}

export interface AvailabilityQuery {
  body: {
    emails: string[];
    start_time: number;
    end_time: number;
  };
  access_token?: string;
  component_id: string;
}

export interface AvailabilityResponse {
  object: "free_busy";
  time_slots: {
    start_time: number;
    end_time: number;
  }[];
  email: string;
}

export interface EventQuery {
  participants?: EventParticipant[];
  title?: string;
  location?: string;
  access_token?: string;
  component_id?: string;
}

export interface EventParticipant {
  email_address: string;
}
