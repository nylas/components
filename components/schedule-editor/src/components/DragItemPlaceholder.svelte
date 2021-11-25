<svelte:options tag="nylas-schedule-editor-drag-item-placeholder" immutable />

<script lang="ts">
  import DragIcon from "../assets/drag-icon.svg";

  export let left = 0;
  export let top = 0;
  export let height = 0;
  export let width = 0;
  export let visible: boolean;
</script>

<style lang="scss">
  @import "../styles/drag-item-placeholder.scss";
</style>

<div
  class="drag-preview"
  style="top: {top}px; left: {left}px; height: {height}px; width: {width}px; visibility: {visible
    ? 'visible'
    : 'hidden'}"
>
  <slot />
  <div class="drag-preview-cell">
    <button class="drag">
      <DragIcon />
    </button>
  </div>
</div>
