<script lang="ts">
  import { defaultActions } from "../lib/html-editor";
  import type { ReplaceFields, ToolbarItem } from "@commons/types/Composer";
  import setShadowStyle from "@commons/methods/appendStyles";
  export let onchange = (_html: string) => Promise.resolve({});
  export let html = "";
  export let show_editor_toolbar = true;
  export let replace_fields: ReplaceFields[] | null = null;

  const composer = document.querySelector("nylas-composer");
  if (composer) {
    setShadowStyle(composer, '@import "./styles/htmleditor.css"');
  }

  let container: HTMLElement;
  let toolbar: ToolbarItem[] = defaultActions;

  $: if (html) {
    const selection = window.getSelection();
    if (typeof replace_fields === "string") {
      replace_fields = JSON.parse(replace_fields);
    }
    if (Array.isArray(replace_fields)) {
      for (const field of replace_fields) {
        html = html.replaceAll(field.from, field.to);
        const currentFocusedNode = selection.focusNode;
        const currentCaretPosition = selection.focusOffset;
        if (currentFocusedNode) {
          if (currentFocusedNode.textContent.includes(field.from)) {
            const matchCount =
              currentFocusedNode.textContent.split(field.from).length - 1;
            const replaceNode = document.createTextNode(
              currentFocusedNode.textContent.replaceAll(field.from, field.to),
            );
            currentFocusedNode.replaceWith(replaceNode);
            if (
              selection.focusNode &&
              selection.focusNode.nodeType === Node.TEXT_NODE
            ) {
              if (matchCount > 1) {
                setCaretPosition(
                  replaceNode,
                  currentCaretPosition +
                    (field.to.length - field.from.length) +
                    (matchCount - 1),
                );
              } else {
                setCaretPosition(
                  replaceNode,
                  currentCaretPosition + field.to.length - field.from.length,
                );
              }
            }
          }
        }
      }
    }
    if (onchange) onchange(html);
  }
  /**
   * Sets the caret position at a given offset for a specific
   * node.
   *
   * @param node Node
   * @param offset Number
   */
  function setCaretPosition(node: Node, offset: number) {
    const range = document.createRange();
    const selection = window.getSelection();
    range.selectNode(node);
    range.setStart(node, offset);
    range.collapse(true);
    range.detach();
    selection?.removeAllRanges();
    selection?.addRange(range);
  }

  const handleAction = (item: ToolbarItem) => () => {
    if (item.result) item.result();
    updateToolbarUI();
  };

  // This function updates the toolbar UI state when you select text (eg. select bold text)
  function updateToolbarUI() {
    toolbar = toolbar.map((item: ToolbarItem) => {
      if (item.state) {
        item.active = item.state();
      }
      return item;
    });
  }
</script>

<!-- Toolbar -->
<div class="html-editor">
  {#if show_editor_toolbar}
    <div class="toolbar">
      {#each toolbar as item}
        <button
          on:click={handleAction(item)}
          class={item.state && item.state() ? "active" : ""}
        >
          {#if item.icon}
            <svelte:component
              this={item.icon}
              class="icon"
              style="fill: var(--composer-icons-color, #666774) !important; width: 12px; height: 12px;"
            />
          {:else}{item.title.charAt(0)}{/if}
        </button>
      {/each}
    </div>
  {/if}

  {#if false}
    <!-- The following if statement exists to prevent svelte from stripping styling associated
      with the HTML tags within this if statement. This is required to add styling to the 
      HTML added in the WYSIWYG editor.

      This hack was implemented because svelte does not parse the :global() selector in
      custom elements.

      Note: While the CSS gets added in the final bundle, none of the HTML is generated.
  -->
    <!-- svelte-ignore a11y-invalid-attribute -->
    <!-- svelte-ignore a11y-missing-attribute -->
    <!-- svelte-ignore a11y-missing-content -->
    <a />
  {/if}

  <div
    contenteditable="true"
    class="html-editor"
    on:keyup={updateToolbarUI}
    on:mouseup={updateToolbarUI}
    bind:this={container}
    bind:innerHTML={html}
  />
</div>
