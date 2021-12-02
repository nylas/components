<script lang="ts">
  import CloseIcon from "../assets/close.svg";
  import LoadingIcon from "../assets/loading.svg";
  import type { Attachment } from "@commons/types/Composer";
  import setShadowStyle from "@commons/methods/appendStyles";
  export let attachment: Attachment;
  export let remove: (attachment: Attachment) => void;

  const composer = document.querySelector("nylas-composer");
  if (composer) {
    setShadowStyle(composer, '@import "./styles/attachment.css"');
  }

  // Creates human-readable size
  const prettySize = (size: number): string => {
    const i = Math.floor(Math.log(size) / Math.log(1024));
    // @ts-ignore
    return `${(size / Math.pow(1024, i)).toFixed(2) * 1}
      ${["B", "kB", "MB", "GB", "TB"][i]}`;
  };
</script>

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
