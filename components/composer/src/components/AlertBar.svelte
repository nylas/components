<svelte:options tag="nylas-composer-alert-bar" />

<script>
  export let type = "primary";
  export let dismissible = true;
  export let visible = true;
  export let ondismiss = null;

  const close = () => {
    if (ondismiss) ondismiss();
    visible = false;
  };
</script>

<style lang="scss">
  .alert-bar {
    padding: var(--outer-padding);
    text-align: center;
    font-size: var(--font-size-small);
    border-bottom-left-radius: var(--border-radius);
    border-bottom-right-radius: var(--border-radius);
    &__container {
      display: flex;
      align-items: center;
      justify-content: between;
    }
    &__text {
      flex-grow: 1;
    }
    &__close {
      outline: 0;
      border: 0;
      background: none;
      font-size: 18px;
      opacity: 0.8;
      cursor: pointer;
      &:hover {
        opacity: 1;
      }
    }
    *:focus {
      outline: 5px auto Highlight;
      outline: 5px auto -webkit-focus-ring-color;
    }
    // Modifiers
    &.success {
      background: var(--success-light);
      color: var(--success);
      .alert-bar__close {
        color: var(--success);
      }
    }
    &.danger {
      background: var(--danger-light);
      color: var(--danger);
      .alert-bar__close {
        color: var(--danger);
      }
    }
    &.info {
      background: var(--info-light);
      color: var(--info);
      .alert-bar__close {
        color: var(--info);
      }
    }
  }
</style>

{#if visible}
  <div
    class="alert-bar"
    class:success={type === "success"}
    class:warning={type === "warning"}
    class:danger={type === "danger"}
    class:primary={type === "primary"}
    class:info={type === "info"}
  >
    <div class="alert-bar__container">
      <div class="alert-bar__text">
        <slot />
      </div>
      {#if dismissible}
        <button class="alert-bar__close" on:click={close}>&times;</button>
      {/if}
    </div>
  </div>
{/if}
