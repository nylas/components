declare namespace Availability {
  interface Manifest extends Nylas.Manifest {
    start_hour: number;
    end_hour: number;
    slot_size: 15 | 30 | 60;
    start_date: Date;
    dates_to_show: number;
  }
}
