export enum AvailabilityStatus {
  FREE = "free",
  BUSY = "busy",
  PARTIAL = "partial",
}

export enum SelectionStatus {
  UNSELECTED = "unselected",
  SELECTED = "selected",
}

export interface Manifest extends Nylas.Manifest {
  start_hour: number;
  end_hour: number;
  slot_size: 15 | 30 | 60;
  start_date: Date;
  dates_to_show: number;
  show_ticks: boolean;
  calendars: Calendar[];
  email_ids: string[];
  allow_booking: boolean;
  max_bookable_slots: number;
  partial_bookable_ratio: number;
}

export interface Calendar {
  emailAddress: string;
  availability: AvailabilityStatus.FREE | AvailabilityStatus.BUSY;
  timeslots: TimeSlot[];
}

export interface TimeSlot {
  start_time: Date;
  end_time: Date;
  available_calendars: string[];
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
