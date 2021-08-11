<svelte:options tag="nylas-contact-image" />

<script>
  import { onMount } from "svelte/internal";
  import { fetchContactImage } from "@commons";
  export let contact;
  export let height = "32px";
  export let width = "32px";

  let image;

  onMount(async (contact) => {
    if (contact?.picture_url) {
      return (image = await fetchContactImage(contactQuery, contact.id));
    } else {
      return contact;
    }
  });
</script>

{#if image}
  <img
    alt=""
    style="height: {height}; width: {width}"
    src="data:image/jpg;base64,{image}"
  />
{:else}
  {contact?.given_name && contact?.surname
    ? contact?.given_name.charAt(0) + contact?.surname.charAt(0)
    : contact?.name
    ? contact?.name.charAt(0)
    : "?"}
{/if}
