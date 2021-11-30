<script>
  import { ContactAvatarStore } from "@commons";
  import { beforeUpdate } from "svelte/internal";

  export let contact;
  export let contact_query;
  export let height = "32px";
  export let width = "32px";
  $: image = null;

  beforeUpdate(async () => {
    if (contact && contact.picture_url) {
      image = await ContactAvatarStore.getContactAvatar(
        contact_query,
        contact.id,
      );
    } else {
      image = null;
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
      : contact.email
      ? contact.email.charAt(0)
      : "?"}
  </p>
{/if}
