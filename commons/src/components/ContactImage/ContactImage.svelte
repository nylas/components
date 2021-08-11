<svelte:options tag="nylas-contact-image" />

<script>
  import { beforeUpdate } from "svelte/internal";
  import { fetchContactImage } from "@commons";
  export let contact;
  export let contactQuery;
  export let height = "32px";
  export let width = "32px";

  let image;

  beforeUpdate(async () => {
    if (contact?.picture_url) {
      image = await fetchContactImage(contactQuery, contact?.id);
    }
  });
</script>

{#if image}
  <img
    alt=""
    style="height: {height}; width: {width}; border-radius: 50%;"
    src="data:image/jpg;base64,{image}"
  />
{:else}
  <p>
    {contact?.given_name && contact?.surname
      ? contact?.given_name.charAt(0) + contact?.surname.charAt(0)
      : contact?.name
      ? contact?.name.charAt(0)
      : "?"}
  </p>
{/if}
