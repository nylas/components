declare namespace Availability {
  interface Manifest extends Nylas.Manifest {
    start_hour: number;
    end_hour: number;
    slot_size: 15 | 30 | 60;
    start_date: Date;
    dates_to_show: number;
    show_ticks: boolean;
    calendars: Calendar[];
  }

  interface Calendar {
    email_address: string;
    availability: "free" | "busy";
    timeslots: TimeSlot[];
  }
  interface TimeSlot {
    start_time: Date;
    end_time: Date;
    object: "time_slot";
    status: AvailabilityStatus.FREE | AvailabilityStatus.BUSY;
  }
  interface SelectableSlot extends TimeSlot {
    availability: "available" | "unavailable" | "partial";
    selectionStatus: SelectionStatus.UNSELECTED | SelectionStatus.SELECTED;
  }

  enum AvailabilityStatus {
    FREE = "free",
    BUSY = "busy",
  }

  enum SelectionStatus {
    UNSELECTED = "unselected",
    SELECTED = "selected",
  }

  interface AvailabilityQuery {
    body: {
      emails: string[];
      free_busy: FreeBusy[] | [];
      open_hours: OpenHours[] | [];
      duration_minutes: number;
      start_time: number;
      end_time: number;
      interval_minutes: number;
    };
    access_token?: string;
    component_id: string;
  }

  interface FreeBusy {
    email: string;
    object: "free_busy";
    time_slots: TimeSlot[];
  }

  interface OpenHours {
    emails: string[];
    days: ["0" | "1" | "2" | "3" | "4", "5", "6"];
    timezone: string;
    start: string; // The minimum start time is 0:00 and the maximum start time is 23:49
    end: string; // End time in a 24 hour time clock. Leading 0’s are left off
    object_type: "open_hours";
  }

  interface AvailabilityResponse {
    object: "availability";
    time_slots: {
      end: number;
      object: "time_slot";
      start: number;
      status: AvailabilityStatus.FREE;
    }[];
    order: any;
  }
}
