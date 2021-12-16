import { mockAgendaCalendar } from "./MockCalendars";
import type { AgendaProperties } from "@commons/types/Nylas";

export const mockAgendaManifest: Partial<AgendaProperties> = {
  allow_date_change: true,
  auto_time_box: false,
  calendar_ids: mockAgendaCalendar[0].id,
  color_by: "event",
  condensed_view: false,
  eagerly_fetch_events: false,
  header_type: "full",
  hide_current_time: false,
  prevent_zoom: false,
  show_as_busy: false,
  show_no_events_message: false,
  theme: "theme-1",
};
