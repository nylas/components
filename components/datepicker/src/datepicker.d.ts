declare namespace Datepicker {
  interface Dates {
    day: number;
    date: Date;
    activeMonth: boolean;
    isDisabled?: boolean;
    isSelected?: boolean;
  }

  interface Time {
    text: string;
    value: number;
    disabled: boolean;
  }

  interface ChangeCallback {
    (data: Date): Promise<void>;
  }
}
