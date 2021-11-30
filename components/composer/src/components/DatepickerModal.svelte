<script type="ts">
  import Datepicker from "../../../datepicker/src/Datepicker.svelte"; // TODO: for local development. This'll update your bundle on commons changes.
  import CloseIcon from "../assets/close.svg";
  import type {
    DatepickerCallback,
    DatepickerCloseCallback,
  } from "@commons/types/Composer";

  let selectedDate: Date;
  export let schedule: DatepickerCallback;
  export let close: DatepickerCloseCallback;
  const change = (date: Date) => {
    selectedDate = date;
  };

  const submit = () => {
    schedule(Math.trunc(selectedDate.getTime() / 1000));
  };
</script>

<style type="scss">
  // .modal {

  //   overflow: auto; /* Enable scroll if needed */
  //   background-color: rgb(0, 0, 0); /* Fallback color */
  //   background-color: rgba(0, 0, 0, 0.4); /* Black w/ opacity */
  // }

  /* Modal Content/Box */
  .modal-content {
    display: block; /* Hidden by default */
    box-shadow: var(
      --composer-shadow,
      0 1px 10px rgba(0, 0, 0, 0.11),
      0 3px 36px rgba(0, 0, 0, 0.12)
    );
    border-radius: var(--composer-border-radius, 6px);
  }

  /* The Close Button */
  .close {
    color: var(--composer-text-light-color, #6e6e7a);
    float: right;
    padding-right: 10px;
    font-size: 28px;
    font-weight: bold;
  }

  .close:hover,
  .close:focus {
    color: var(--composer-text-color, black);
    text-decoration: none;
    cursor: pointer;
  }

  .save-btn {
    border: 0;
    background: var(--composer-primary-color, #5c77ff);
    width: 100%;
    color: white;
    cursor: pointer;
    padding: 10px 25px;
    font-weight: bold;
    border-radius: 0 0 var(--composer-border-radius, 6px)
      var(--composer-border-radius, 6px);
    font-family: var(--composer-font, sans-serif);
    &:disabled {
      opacity: 0.5;
    }
    &:hover {
      background: var(--composer-primary-dark-color, #294dff);
    }
  }

  .datepicker-modal {
    position: absolute;
    bottom: calc(var(--composer-outer-padding, 15px) * 0.85);
    right: calc(var(--composer-outer-padding, 15px) * 0.85);
    left: calc(var(--composer-outer-padding, 15px) * 0.85);
  }

  .CloseIcon {
    fill: var(--composer-icons-color, #666774);
    width: 10px;
    height: 10px;
  }
</style>

<!-- Modal content -->

<div class="datepicker-modal">
  <div class="modal-content">
    <span class="close" on:click={close}>
      <CloseIcon class="CloseIcon" />
    </span>
    <Datepicker {change} timepicker={true} min={new Date()} />
    <button class="save-btn" on:click={submit}> Schedule send </button>
  </div>
</div>
