import type { Manifest as NylasManifest } from "@commons/types/Nylas";

export interface Manifest extends NylasManifest {
  event_title?: string;
  event_description?: string;
  show_hosts?: "show" | "hide";
}
