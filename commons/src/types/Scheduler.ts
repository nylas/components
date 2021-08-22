import type { Manifest as AvailabilityManifest } from "@commons/types/Availability";

export interface Manifest extends AvailabilityManifest {
  availability_id?: string;
}
