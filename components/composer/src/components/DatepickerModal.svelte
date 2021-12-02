<script type="ts">
  import "../../../datepicker/src/datepicker.svelte"; // TODO: for local development. This'll update your bundle on commons changes.
  import setShadowStyle from "@commons/methods/appendStyles";
  import CloseIcon from "../assets/close.svg";
  import type {
    DatepickerCallback,
    DatepickerCloseCallback,
  } from "@commons/types/Composer";

  let selectedDate: Date;
  export let schedule: DatepickerCallback;
  export let close: DatepickerCloseCallback;

  const composer = document.querySelector("nylas-composer");
  if (composer) {
    setShadowStyle(composer, '@import "./styles/datepicker.css"');
  }
  const change = (date: Date) => {
    selectedDate = date;
  };

  const submit = () => {
    schedule(Math.trunc(selectedDate.getTime() / 1000));
  };
</script>

<!-- Modal content -->

<div class="datepicker-modal">
  <div class="modal-content">
    <span class="close" on:click={close}>
      <CloseIcon class="CloseIcon" />
    </span>
    <nylas-datepicker {change} timepicker={true} min={new Date()} />
    <button class="save-btn" on:click={submit}> Schedule send </button>
  </div>
</div>
