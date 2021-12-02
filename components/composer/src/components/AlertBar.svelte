<script>
  import setShadowStyle from "@commons/methods/appendStyles";

  const composer = document.querySelector("nylas-composer");
  if (composer) {
    setShadowStyle(composer, '@import "./styles/alertbar.css"');
  }

  export let type = "primary";
  export let dismissible = true;
  export let visible = true;
  export let ondismiss = null;

  const close = () => {
    if (ondismiss) ondismiss();
    visible = false;
  };
</script>

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
