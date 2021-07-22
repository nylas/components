declare namespace Availability {
  enum AvailabilityStatus {
    Free = "free",
    Busy = "busy",
    Partial = "partial",
  }

  interface Manifest extends Nylas.Manifest {
    start_hour: number;
    end_hour: number;
    slot_size: 15 | 30 | 60;
    start_date: Date;
    dates_to_show: number;
    show_ticks: boolean;
    calendars: Calendar[];
    allow_booking: boolean;
  }

  interface Calendar {
    emailAddress: string;
    availability: AvailabilityStatus.Free | AvailabilityStatus.Busy;
    timeslots: TimeSlot[];
  }
  interface TimeSlot {
    start_time: Date;
    end_time: Date;
  }
  interface SelectableSlot extends TimeSlot {
    selectionStatus: "unselected" | "selected";
    availability: AvailabilityStatus;
  }
}
