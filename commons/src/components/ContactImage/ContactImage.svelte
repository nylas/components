<svelte:options tag="nylas-contact-image" />

<script>
  import { beforeUpdate } from "svelte/internal";
  import { fetchContactImage } from "@commons";

  export let contact;
  export let contact_query;
  export let height = "32px";
  export let width = "32px";

  let image;

  beforeUpdate(async () => {
    if (contact && contact.picture_url) {
      image = await fetchContactImage(contact_query, contact.id);
    }
  });
</script>

{#if image}
  <img
    alt=""
    style="height: {height}; width: {width}; border-radius: 50%;"
    src="data:image/jpg;base64,{image}"
  />
{:else if contact}
  <p style="margin: 0;">
    {contact.given_name && contact.surname
      ? contact.given_name.charAt(0) + contact.surname.charAt(0)
      : contact.name
      ? contact.name.charAt(0)
      : "?"}
  </p>
{/if}
