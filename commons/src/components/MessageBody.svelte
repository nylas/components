<svelte:options tag="nylas-message-body" />

<!-- This component is being used to render Message body in Email component. 
  This is to ensure the styles in the html message body are encapsulated and 
  does not affect the global component enclosing it -->
<script>
  import { isFileAnAttachment } from "@commons/methods/isFileAnAttachment";
  import * as DOMPurify from "dompurify";
  import { getEventDispatcher } from "@commons/methods/component";
  import { get_current_component, onMount } from "svelte/internal";
  import {
    DisallowedContentTypes,
    InlineImageTypes,
  } from "@commons/constants/attachment-content-types";

  export let message;
  export let body;

  const dispatchEvent = getEventDispatcher(get_current_component());

  async function downloadSelectedFile(event, file) {
    event.stopImmediatePropagation();
    dispatchEvent("downloadClicked", {
      event,
      message,
      file,
    });
  }

  let attachedFiles = [];

  onMount(() => {
    if (message && message.files.length > 0) {
      for (const [fileIndex, file] of message.files.entries()) {
        if (isFileAnAttachment(file)) {
          attachedFiles = [...attachedFiles, message.files[fileIndex]];
        }
      }
    }
  });
</script>

<style lang="scss">
  div {
    width: inherit;

    div.attachment {
      margin: 1rem 0 0 0;
      display: flex;
      gap: 0.5rem;

      button {
        height: fit-content;
        width: max-content;
        padding: 0.3rem 1rem;
        border: 1px solid var(--grey);
        border-radius: 30px;
        background: white;
        cursor: pointer;
        &:hover {
          background: var(--grey-light);
        }
      }
    }
  }
</style>

<div>
  {#if message}
    {#if typeof body !== null}
      {@html DOMPurify.sanitize(body)}
    {/if}
    <div class="attachment">
      {#if attachedFiles && Array.isArray(attachedFiles) && attachedFiles.length > 0}
        {#each attachedFiles as file}
          <button
            on:click|stopPropagation={(e) => downloadSelectedFile(e, file)}>
            {file.filename || file.id}
          </button>
        {/each}
      {/if}
    </div>
  {/if}
</div>
