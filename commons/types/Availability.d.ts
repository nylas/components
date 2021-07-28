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
  }
  interface SelectableSlot extends TimeSlot {
    availability: AvailabilityStatus.AVAILABLE | AvailabilityStatus.UNAVAILABLE | AvailabilityStatus.PARTIAL;
    selectionStatus: SelectionStatus.UNSELECTED | SelectionStatus.SELECTED;
  }

  enum AvailabilityStatus {
    AVAILABLE = "available",
    UNAVAILABLE = "unavailable",
    PARTIAL = "partial"
  }

  enum SelectionStatus {
    UNSELECTED = "unselected",
    SELECTED = "selected",
  }

  interface AvailabilityQuery {
    body: {
      emails: string[];
      start_time: number;
      end_time: number;
    };
    access_token?: string;
    component_id: string;
  }

  interface AvailabilityResponse {
    object: "free_busy";
    time_slots: TimeSlot[];
    email: string;
  }
}
