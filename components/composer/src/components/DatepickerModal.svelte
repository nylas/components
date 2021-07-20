<svelte:options tag="nylas-composer-datepicker-modal" />

<script type="ts">
  import "../../../datepicker/src/Datepicker.svelte"; // TODO: for local development. This'll update your bundle on commons changes.
  import CloseIcon from "../assets/close.svg";

  let selectedDate: Date;
  export let schedule: Composer.DatepickerCallback;
  export let close: Composer.DatepickerCloseCallback;
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
    box-shadow: var(--shadow);
    border-radius: var(--border-radius);
  }

  /* The Close Button */
  .close {
    color: var(--text-light);
    float: right;
    padding-right: 10px;
    font-size: 28px;
    font-weight: bold;
  }

  .close:hover,
  .close:focus {
    color: var(--text);
    text-decoration: none;
    cursor: pointer;
  }

  .save-btn {
    border: 0;
    background: var(--primary);
    width: 100%;
    color: white;
    cursor: pointer;
    padding: 10px 25px;
    font-weight: bold;
    border-radius: 0 0 var(--border-radius) var(--border-radius);
    font-family: var(--font);
    &:disabled {
      opacity: 0.5;
    }
    &:hover {
      background: var(--primary-dark);
    }
  }

  .datepicker-modal {
    position: absolute;
    bottom: calc(var(--outer-padding) * 0.85);
    right: calc(var(--outer-padding) * 0.85);
    left: calc(var(--outer-padding) * 0.85);
  }
</style>

<!-- Modal content -->

<div class="datepicker-modal">
  <div class="modal-content">
    <span class="close" on:click={close}
      ><CloseIcon
        style="fill: var(--icons); width: 10px; height: 10px;"
      /></span
    >
    <nylas-datepicker {change} timepicker={true} min={new Date()} />
    <button class="save-btn" on:click={submit}> Schedule send </button>
  </div>
</div>
