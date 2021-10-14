import { AvailabilityStatus } from "@commons/enums/Availability";
import type { SelectableSlot } from "@commons/types/Availability";

export const isUnavailable = (slot: SelectableSlot): boolean => {
  return (
    slot.availability === AvailabilityStatus.CLOSED ||
    slot.availability === AvailabilityStatus.BUSY
  );
};

export const isAvailable = (slot: SelectableSlot): boolean => {
  return (
    slot.availability !== AvailabilityStatus.BUSY &&
    slot.availability !== AvailabilityStatus.CLOSED
  );
};
