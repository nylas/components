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
    padding: var(--composer-outer-padding, 15px);
    text-align: center;
    font-size: var(--composer-font-size-small, 12px);
    border-bottom-left-radius: var(--composer-border-color, #f7f7f7-radius);
    border-bottom-right-radius: var(--composer-border-radius, 6px);
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
      background: var(
        --composer-success-light-color,
        var(--composer-primary-color, #5c77ff)
      );
      color: var(
        --composer-success-color,
        var(--composer-background-color, white)
      );
      .alert-bar__close {
        color: var(
          --composer-success-color,
          var(--composer-background-color, white)
        );
      }
    }
    &.danger {
      background: var(--composer-danger-light-color, #ffe3e3);
      color: var(--composer-danger-color, #ff5c5c);
      .alert-bar__close {
        color: var(--composer-danger-color, #ff5c5c);
      }
    }
    &.info {
      background: var(
        --composer-info-light-color,
        var(--composer-primary-light-color, #f0f2ff)
      );
      color: var(--composer-info-color, var(--composer-primary-color, #5c77ff));
      .alert-bar__close {
        color: var(
          --composer-info-color,
          var(--composer-primary-color, #5c77ff)
        );
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
