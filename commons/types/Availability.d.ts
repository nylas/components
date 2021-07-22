declare namespace Availability {
  interface Manifest extends Nylas.Manifest {
    start_hour: number;
    end_hour: number;
    slot_size: 15 | 30 | 60;
    start_date: Date;
    dates_to_show: number;
    available_times: TimeSlot[];
    show_ticks: boolean;
  }

  interface TimeSlot {
    start_time: Date;
    end_time: Date;
  }

  interface SelectableSlot extends TimeSlot {
    selectionStatus: "unselected" | "selected";
  }
}
