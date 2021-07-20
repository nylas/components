<script>
  import "../Datepicker.svelte";
  export let value;
  export let min;
  export let max;
  export let timepicker;
  const options = {
    value,
    min,
    max,
    timepicker,
  };
</script>

<style>
  .datepicker-container {
    background: white;
    width: 30%;
  }
</style>

<div class="datepicker-container">
  <nylas-datepicker {...options} />
</div>
