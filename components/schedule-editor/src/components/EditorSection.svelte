<svelte:options tag="nylas-schedule-editor-section" />

<script lang="ts">
  export let propname = "bar";
  export let section_title: string;
  export let expanded = false;
</script>

<style lang="scss">
  @import "../../../theming/reset.scss";
  @import "../../../theming/variables.scss";

  details {
    display: grid;
    background-color: white;
    box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.15);
    padding: 1rem;
    max-width: 640px;
    width: calc(100% - 2rem);

    summary {
      display: grid;
      grid-template-columns: auto 16px;
      gap: 0.5rem;
      cursor: pointer;

      .expand-icon {
        width: 16px;
        height: 16px;
        transform: scaleY(-1);
      }

      intro {
        background: #f0f;
      }
    }

    &[open] {
      summary {
        margin-bottom: 1rem;
        cursor: default;
        .expand-icon {
          transform: none;
        }
      }
    }
  }
</style>

<section class={section_title}>
  <details open={expanded}>
    <summary>
      <slot name="title" />
      <img src="./assets/expand.svg" class="expand-icon" alt="expand" />
      <slot name="intro" />
    </summary>
    <slot name="contents" />
    <slot name="footer" />
  </details>

  <p class="intro"><slot name="intro" /></p>
</section>
