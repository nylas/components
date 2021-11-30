<svelte:options tag="nylas-contact-list" />

<script lang="ts">
  import formatDistanceStrict from "date-fns/formatDistanceStrict";
  import { fetchContactImage, ContactStore, ManifestStore } from "@commons";
  import { get_current_component, onMount } from "svelte/internal";
  import { tick } from "svelte";
  import { debounce } from "@commons/methods/component";
  import {
    buildInternalProps,
    getEventDispatcher,
  } from "@commons/methods/component";
  import type {
    HydratedContact,
    Contact,
    ContactsQuery,
  } from "@commons/types/Contacts";
  import type { ContactListProperties } from "@commons/types/Nylas";
  import { sortingPredicates } from "../lib/sorting";

  export let id: string = "";
  export let access_token: string = "";

  export let click_action: "email" | "select";
  export let contacts_to_load: number;
  export let contacts: HydratedContact[];
  export let default_photo: string | null;
  export let show_filter: boolean;
  export let show_names: boolean;
  export let sort_by: "last_emailed" | "name";
  export let theme: string = "theme-1";

  const defaultValueMap: Partial<ContactListProperties> = {
    click_action: "email",
    contacts_to_load: 100,
    show_filter: false,
    show_names: true,
    sort_by: "name",
    theme: "theme-1",
  };

  let filterValue: string = "";
  const filterPredicates = {
    byEmail: (contact: Contact) =>
      contact.emails[0].email.includes(filterValue),
  };
  let selectedFilterType: keyof typeof filterPredicates = "byEmail";

  const dispatchEvent = getEventDispatcher(get_current_component());
  $: dispatchEvent("manifestLoaded", manifest);

  let _this = <ContactListProperties>(
    buildInternalProps({}, {}, defaultValueMap)
  );
  let manifest: Partial<ContactListProperties> = {};
  let main: Element;
  let clientHeight: number = 0;
  let clientWidth: number = 0;
  let offset = 0;
  let lastNumContactsLoaded = 0;
  let hydratedContacts: HydratedContact[] = [];
  let status: "loading" | "loaded" | "error" = "loading";

  onMount(async () => {
    await tick();
    clientHeight = main?.getBoundingClientRect().height || 0;
    clientWidth = main?.getBoundingClientRect().width || 0;

    manifest = ((await $ManifestStore[
      JSON.stringify({ component_id: id, access_token })
    ]) || {}) as ContactListProperties;

    _this = buildInternalProps(
      $$props,
      manifest,
      defaultValueMap,
    ) as ContactListProperties;

    if (_this.contacts) {
      hydratedContacts = _this.contacts as HydratedContact[];
      status = "loaded";
    } else {
      if ($ContactStore[queryKey]) {
        hydratedContacts = $ContactStore[queryKey];
        status = "loaded";
      } else if (query.component_id) {
        setContacts();
      }
    }
  });

  $: dispatchEvent("manifestLoaded", manifest);

  let previousProps = $$props;
  $: {
    if (JSON.stringify(previousProps) !== JSON.stringify($$props)) {
      _this = buildInternalProps(
        $$props,
        manifest,
        defaultValueMap,
      ) as ContactListProperties;
      previousProps = $$props;
    }
  }

  let themeUrl: string;
  $: if (
    !!_this.theme &&
    (_this.theme.startsWith(".") || _this.theme.startsWith("http"))
  ) {
    // If the theme is a file path or a URL
    themeUrl = _this.theme;
  }

  // sanitization to conform with Nylas API maximums
  $: {
    _this.contacts_to_load = Math.max(
      Math.min(_this.contacts_to_load, 1000),
      1,
    );
  }

  // #region setting contacts
  let query: ContactsQuery;
  $: query = {
    component_id: id,
    access_token,
  };

  let queryKey: string;
  $: queryKey = JSON.stringify(query);

  $: setHydratedContacts(), contacts, queryKey;
  async function setHydratedContacts() {
    status = "loading";
    if (contacts && Array.isArray(contacts)) {
      hydratedContacts = contacts as HydratedContact[];
      status = "loaded";
    } else {
      if ($ContactStore[queryKey]) {
        hydratedContacts = $ContactStore[queryKey];
        status = "loaded";
      } else if (query.component_id) {
        setContacts();
      } else {
        hydratedContacts = [];
        status = "loaded";
      }
    }
  }

  /*
    Fetches more contacts, changes status from "loading" to show "loading more contacts" overlay.
    When the fetchContacts call is successful, change status to loaded, hide "loading more contacts overlay" and updated hydratedContacts
  */
  function setContacts() {
    status = "loading";
    ContactStore.addContacts(query, offset, _this.contacts_to_load).then(
      (results?: Contact[]) => {
        if (results && results.length > 0) {
          hydratedContacts = $ContactStore[queryKey] ?? results;
          offset += _this.contacts_to_load;
        }
        status = "loaded";
      },
    );
  }
  // #endregion setting contacts

  /*
    Detects if the user has scrolled to the bottom of the contact list. Fetches 100 more contacts if user is within 10px of bottom of contact list element
  */
  function handleScroll() {
    const { scrollHeight, scrollTop } = main;
    if (Math.abs(scrollTop + clientHeight - scrollHeight) <= 50) {
      setContacts();
    }
  }

  // Debounce handleScroll event to limit # of contacts fetched and loaded
  const debounceScroll = debounce(handleScroll, 500);

  // Set time_ago on hydratedContacts
  $: {
    if (hydratedContacts.length) {
      hydratedContacts = hydratedContacts.map((contact: HydratedContact) => {
        if (contact.last_contacted_date) {
          contact.time_ago = `Emailed ${formatDistanceStrict(
            today,
            new Date(contact.last_contacted_date * 1000),
            { addSuffix: false },
          )} ago`;
        } else {
          contact.time_ago = `No recent activity`;
        }
        return contact;
      });
    }
  }

  let displayedContacts: HydratedContact[] = [];
  $: {
    // filter/sort
    filterValue;

    const sortedFiltered = hydratedContacts
      .filter(filterPredicates[selectedFilterType])
      .sort(sortingPredicates[_this.sort_by]);

    // noinspection UnnecessaryLocalVariableJS
    const deduplicatedContacts = Object.values(
      sortedFiltered.reduce<Record<string, HydratedContact>>(
        (mem, c) => Object.assign(mem, { [c.emails[0].email]: c }),
        {},
      ),
    );
    displayedContacts = deduplicatedContacts;
  }

  $: {
    if (
      $ContactStore[queryKey] &&
      _this.contacts_to_load !== lastNumContactsLoaded
    ) {
      lastNumContactsLoaded = _this.contacts_to_load;
      offset = 0;
      setContacts();
    }
  }

  const today = new Date();

  function contactClicked(
    event: MouseEvent | KeyboardEvent,
    contact: HydratedContact,
  ) {
    if (_this.click_action === "email") {
      window.location.href = `mailto:${contact.emails[0].email}`;
    }
    if (_this.click_action === "select") {
      contact.selected = !contact.selected;
      dispatchEvent("contactClicked", {
        event,
        contact,
        contacts: hydratedContacts,
      });
      hydratedContacts = [...hydratedContacts];
    }
  }
</script>

<style lang="scss">
  @import "../../theming/reset.scss";
  @import "../../theming/animation.scss";
  @import "../../theming/variables.scss";

  $imageSize: 48px;
  $imageBuffer: 8px;
  $checkboxSize: 16px;
  $checkboxBuffer: 8px;
  $themeColour: var(--linesAndIcons);

  main {
    height: 100%;
    width: 100%;
    overflow: auto;
    position: relative;
  }

  @import "./themes/theme-1";
  @import "./themes/theme-2";
  @import "./themes/theme-3";
  @import "./themes/theme-4";
  @import "./themes/theme-5";

  .loader {
    display: grid;
    justify-content: center;
    align-content: center;
    @include loader;
    height: 100%;
    width: 100%;
  }

  .empty-state {
    background-color: white;
    border: 2px dashed var(--linesAndIcons);
    padding: 3rem;
    text-align: center;
    p {
      margin: 1rem 0;
    }
  }

  .loading {
    overflow: auto;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1;
    background-color: #000c;
    color: white;
    position: fixed;
    opacity: 0.8;
    height: var(--height, 100%);
    width: var(--width, 100%);
  }

  .entry {
    display: flex;
    align-items: center;
    padding: 14px 8px;
    list-style-type: none;
    background-color: white;
    border-bottom: 1px solid var(--linesAndIcons);
    max-width: 100%;
    overflow: hidden;
  }

  .filter {
    input {
      margin-left: 10px;
      padding: 0.5rem;
    }
  }

  .contacts {
    display: grid;
    max-width: 100%;

    .contact {
      display: grid;
      transition: 0.2s;
      border-left: 0 solid var(--contactColor);
      grid-template-areas:
        "check image title title"
        "check image email recency";
      grid-template-columns: 0 ($imageSize + $imageBuffer) 1fr max-content;
      gap: 0.25rem;

      &.selectable {
        grid-template-columns: ($checkboxSize + $checkboxBuffer) (
            $imageSize + $imageBuffer
          ) 1fr max-content;
      }

      &.selected {
        border-left: 10px solid var(--contactColor);
      }

      &:hover,
      &:focus {
        cursor: pointer;
        background-color: var(--hoverColor);
        outline: none;
      }

      span {
        display: block;
        text-overflow: ellipsis;
        overflow: hidden;

        div.default {
          background: var(--contactColor);
          color: var(--contactTextColor);
          border-radius: 48px;
          height: 48px;
          width: 48px;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: large;
          text-transform: uppercase;
          font-family: sans-serif;
        }
      }
      .checkbox {
        grid-area: check;
        label {
          position: absolute;
          left: -10000px;
          top: auto;
          width: 1px;
          height: 1px;
          overflow: hidden;
        }
        input {
          border-radius: 4px;
          width: $checkboxSize;
          height: $checkboxSize;
          border: 0;
          cursor: pointer;
          background-color: var(--linesAndIcons);

          -webkit-appearance: none;
          -moz-appearance: none;
          -o-appearance: none;
          appearance: none;

          &:checked {
            background-color: var(--contactColor);

            &::before {
              content: " ";
              background-image: url('data:image/svg+xml;utf8,<svg width="14" height="10" viewBox="0 0 14 10" xmlns="http://www.w3.org/2000/svg"><path d="M5.29249 9.2925C4.90249 9.6825 4.27249 9.6825 3.88249 9.2925L0.292486 5.7025C0.105233 5.51567 0 5.26202 0 4.9975C0 4.73298 0.105233 4.47933 0.292486 4.2925C0.682486 3.9025 1.31249 3.9025 1.70249 4.2925L4.58249 7.1725L11.4625 0.2925C11.8525 -0.0975 12.4825 -0.0975 12.8725 0.2925C13.2625 0.6825 13.2625 1.3125 12.8725 1.7025L5.29249 9.2925Z" fill="white"/></svg>');
              height: 10px;
              width: 14px;
              display: block;
              text-align: center;
              margin-left: 1.5px;
              margin-top: 3px;
            }
          }
        }
      }

      .image {
        grid-area: image;

        img {
          border-radius: $imageSize;
          height: $imageSize;
          width: $imageSize;
        }
      }

      .title {
        grid-area: title;
        font-weight: bold;
      }

      .email {
        grid-area: email;
        white-space: nowrap;
      }

      .recency {
        grid-area: recency;
        font-size: small;
        &.no-last-contact-data {
          display: none;
        }
      }
    }
  }
  @media #{$desktop} {
    .contacts .contact {
      grid-template-areas:
        "check image title recency"
        "check image email recency";
      .recency {
        &.no-last-contact-data {
          display: block;
        }
      }
    }
  }
</style>

<nylas-error {id} />

{#if themeUrl}
  <link rel="stylesheet" href={themeUrl} />
{/if}

<main
  bind:this={main}
  on:scroll={_this.contacts ? () => {} : debounceScroll}
  bind:clientHeight
  bind:clientWidth
  class={!!themeUrl ? "custom" : _this.theme}
>
  {#if status === "loading" && hydratedContacts.length <= 0}
    <div class="loader" />
  {:else if hydratedContacts.length === 0}
    <div class="empty-state">
      <p>
        Enter contacts using the
        <code>contacts</code>
        prop or sync a Nylas account in the Dashboard.
      </p>
      <p>
        See our <a
          href="https://docs.nylas.com/docs/contact-list-component"
          target="_blank">Docs</a
        >
        for more details.
      </p>
    </div>
  {/if}
  {#await displayedContacts then results}
    {#if status === "loading" && results.length >= _this.contacts_to_load}
      <span
        class="loading"
        style="--height: {clientHeight}px; --width: {clientWidth}px"
      >
        Loading More Contacts
      </span>
    {/if}

    {#if _this.show_filter && status !== "loading"}
      <label class="entry filter">
        Filter by email: <input
          id="show-filter-input"
          type="text"
          bind:value={filterValue}
        />
      </label>
    {/if}

    <ul class="contacts">
      {#each results as contact, i}
        <li
          tabindex="0"
          on:click={(ev) => contactClicked(ev, contact)}
          on:keyup={(ev) => {
            if (ev.key === "Enter") {
              contactClicked(ev, contact);
            }
          }}
          class="entry contact"
          data-cy={i}
          data-last-contacted-date={contact.last_contacted_date || -1}
          class:selectable={_this.click_action === "select"}
          class:selected={contact.selected}
        >
          <span class="checkbox">
            {#if _this.click_action === "select"}
              <input
                type="checkbox"
                bind:checked={contact.selected}
                id="contact-{i}-checkbox"
              />
              <label for="contact-{i}-checkbox"
                >{contact.selected ? "Deselect" : "Select"}
                {contact.given_name}
                {contact.surname}</label
              >
            {/if}
          </span>
          <span class="image">
            {#if contact.picture}
              {#if contact.picture !== "Loading"}
                <img
                  alt={contact.emails[0].email}
                  src="data:image/jpg;base64,{contact.picture}"
                />
              {/if}
            {:else if contact.picture_url}
              {#await fetchContactImage(query, contact.id).then((image) => (contact.picture = image))}
                {(contact.picture = "Loading")}
              {/await}
            {:else if contact.default_picture}
              <img
                src={contact.default_picture}
                alt={contact.emails[0].email}
                data-cy="default_set_by_user"
              />
            {:else if _this.default_photo}
              {(contact.default_picture = _this.default_photo)}
            {:else}
              <div class="default">
                {contact.given_name && contact.surname
                  ? contact.given_name.charAt(0) + contact.surname.charAt(0)
                  : contact.emails[0].email.charAt(0)}
              </div>
            {/if}
          </span>
          <span class="title">
            {#if _this.show_names}
              {#if contact.given_name}{contact.given_name}{/if}
              {#if contact.surname}{contact.surname}{/if}
              {#if !contact.given_name && !contact.surname}
                {contact.emails[0].email}
              {/if}
            {:else}{contact.emails[0].email}{/if}
          </span>
          {#if _this.show_names}
            <span class="email">
              {contact.emails[0].email}
              {#if contact.emails.length > 1}
                and
                {contact.emails.length - 1}
                others
              {/if}
            </span>
          {/if}
          {#if contact.time_ago}
            <span
              class="recency"
              class:no-last-contact-data={!contact.last_contacted_date}
              >{contact.time_ago}</span
            >
          {/if}
        </li>
      {/each}
    </ul>
  {/await}
</main>
