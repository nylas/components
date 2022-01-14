import { AvailabilityStatus } from "@commons/enums/Availability";
import type { SelectableSlot } from "@commons/types/Availability";

export function isAvailable(slot: SelectableSlot): boolean {
  return (
    slot.availability !== AvailabilityStatus.BUSY &&
    slot.availability !== AvailabilityStatus.CLOSED
  );
}
