<svelte:options tag="nylas-composer-attachment" />

<script lang="ts">
  import CloseIcon from "../assets/close.svg";
  import LoadingIcon from "../assets/loading.svg";
  import type { Attachment } from "@commons/types/Composer";

  export let attachment: Attachment;
  export let remove: (attachment: Attachment) => void;

  // Creates human-readable size
  const prettySize = (size: number): string => {
    const i = Math.floor(Math.log(size) / Math.log(1024));
    // @ts-ignore
    return `${(size / Math.pow(1024, i)).toFixed(2) * 1}
      ${["B", "kB", "MB", "GB", "TB"][i]}`;
  };
</script>

<style lang="scss">
  .wrapper {
    padding: 0.3rem 0;
  }

  .file-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.8rem;
    color: var(--composer-text-color, black);
    font-weight: 700;
    background: var(--composer-background-muted-color, #f0f2ff);
    border-radius: var(--composer-border-radius, 6px);
  }

  .close-btn {
    background: none;
    border: none;
    cursor: pointer;
    margin-left: 10px;
    flex-shrink: 0;
  }
  .ellipsis {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .file-info {
    display: flex;
    color: var(--composer-text-color, black);
    align-items: center;
    max-width: 90%;
    &__error {
      color: var(--composer-danger-color, #ff5c5c);
      font-size: var(--composer-font-size-small, 12px);
      margin-right: 5px;
    }
    &__right {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      flex-shrink: 0;
      margin-left: 10px;
    }
  }

  .file-item__size {
    flex-shrink: 0;
    word-break: keep-all;
    color: var(composer-text-light-color, #6e6e7a);
    margin-left: 5px;
    font-size: var(--composer-font-size-small, 12px);
  }

  @keyframes rotate {
    to {
      transform: rotate(360deg);
    }
  }

  .LoadingIcon {
    fill: var(--composer-icons-color, #666774);
    width: 15px;
    height: 15px;
    animation: rotate 0.5s infinite linear;
  }
  .CloseIcon {
    fill: var(--composer-icons-color, #666774);
    width: 10px;
    height: 10px;
  }
</style>

{#if attachment}
  <div class="wrapper">
    <div class="file-item">
      <div class="file-info">
        <div class="ellipsis">{attachment.filename}</div>
        <span class="file-item__size">{prettySize(attachment.size)}</span>
      </div>
      <div class="file-info__right">
        {#if attachment.loading}
          <LoadingIcon class="LoadingIcon" />
        {/if}
        {#if attachment.error}<span class="file-info__error">Error</span>{/if}
        {#if !attachment.loading}
          <button class="close-btn" on:click={() => remove(attachment)}>
            <CloseIcon class="CloseIcon" />
          </button>
        {/if}
      </div>
    </div>
  </div>
{/if}
