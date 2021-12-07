<svelte:options tag="nylas-contacts-search" immutable={true} />

<script lang="ts">
  import { debounce, isValidEmail } from "../lib/utils";
  import { tick } from "svelte";
  import type { Participant } from "@commons/types/Nylas";
  import type {
    FetchContactsCallback,
    ChangeCallback,
    BlurOptions,
  } from "@commons/types/ContactsSearch";
  export let contacts: Participant[] | FetchContactsCallback;

  export let value: Participant[] = [];
  export let placeholder: string = "To";
  export let single: boolean = false;
  export let change: ChangeCallback | void;
  export let show_dropdown: boolean = true;

  let selectedContacts: Participant[] = [];
  let term: string = ""; // TODO: rename to "term"
  let currentContactIndex = 0;
  let loading = false;
  let searchField: HTMLInputElement;
  let contactsList: Participant[] = [];
  let isOpen = false;

  // Initial state setup
  const initialSetup = () => {
    if (Array.isArray(contacts)) {
      contactsList = contacts;
    }
    if (Array.isArray(value)) {
      selectedContacts = value;
    }
  };

  const nylasContacts = () => {
    return [];
  };
  const getContactsSetup = (term: string) => {
    loading = true;
    contactsList = [];
    getContacts(term);
  };
  const getContacts = debounce(async (term: string) => {
    loading = true;
    // @ts-ignore
    const getContactsFunc =
      typeof contacts === "function" ? contacts : nylasContacts;
    try {
      contactsList = await getContactsFunc(term);

      loading = false;
    } catch (error) {
      // TODO: add error handling
      loading = false;
    }
  }, 350);

  const removeContact = (email: string) => {
    selectedContacts = selectedContacts.filter((c) => c.email !== email);
    focusSearch();
  };
  const selectContact = (contact: Participant) => {
    if (single && selectedContacts.length === 1) {
      selectedContacts = [contact];
      isOpen = false;
      return;
    }
    if (!isSelected(contact.email)) {
      selectedContacts = [...selectedContacts, contact];
    }
    focusSearch();
  };

  const focusSearch = () => {
    if (searchField && (!single || !selectedContacts.length)) {
      searchField.focus();
      isOpen = true;
    }
  };

  $: if (searchField) {
    searchField.setAttribute("tabindex", "-1");
    searchField.focus();
    searchField.removeAttribute("tabindex");
  }

  const blurSearch = (options: BlurOptions) => {
    setTimeout(() => {
      if (options.addContact && !filteredContacts.length && term) {
        handleSubmit();
      }
      isOpen = false;
      term = "";
      if (searchField) {
        searchField.blur();
      }
      // @ts-ignore
    }, options.blurIn | 500);
  };
  const handleKeydown = (event: KeyboardEvent) => {
    // Backspace
    focusSearch();

    if (event.key === "Backspace" && selectedContacts.length && !term) {
      selectedContacts = selectedContacts.slice(0, selectedContacts.length - 1);
    }
    if (event.key === "Tab") {
      handleSubmit();
    }
    // DownArrow
    if (event.key === "ArrowDown" && contactsList.length) {
      if (currentContactIndex <= contactsList.length) {
        currentContactIndex += 1;
      }
    }
    // UpArrow
    if (event.key === "ArrowUp" && contactsList.length) {
      if (currentContactIndex != 0) {
        currentContactIndex -= 1;
      }
    }
    if (event.key === "Escape" && contactsList.length) {
      blurSearch({});
    }
  };
  const setActiveContact = (index: number) => {
    currentContactIndex = index;
  };
  const handleSubmit = () => {
    if (single && selectedContacts.length === 1) {
      return;
    }
    if (filteredContacts.length) {
      if (!isSelected(filteredContacts[currentContactIndex].email)) {
        selectedContacts = [
          ...selectedContacts,
          filteredContacts[currentContactIndex],
        ];
        currentContactIndex = 0;
        blurSearch({ blurIn: 0 });
      }
    }
    if (!isSelected(term) && term) {
      if (isValidEmail(term)) {
        selectedContacts = [...selectedContacts, { email: term }];
        currentContactIndex = 0;
        blurSearch({ blurIn: 0 });
      }
    }
  };
  const isSelected = (email: string) => {
    return selectedContacts.map((c) => c.email).includes(email);
  };

  $: if (selectedContacts && change) {
    tick().then(() => {
      // @ts-ignore
      change(selectedContacts);
    });
  }
  $: if (contacts || value) initialSetup();
  $: if (isOpen && typeof contacts === "function") getContactsSetup(term);
  $: filteredContacts = contactsList.filter((item) => {
    const trm: string = term ? term.toLowerCase() : "";
    const name: string = item.name ? item.name.toLowerCase() : "";
    const email: string = item.email ? item.email.toLowerCase() : "";
    const includesName = name.includes(trm);
    const includesEmail = email.includes(trm);
    const matched = includesName || includesEmail;
    return matched && !isSelected(item.email);
  });
  $: if (filteredContacts) {
    currentContactIndex = 0;
  }
</script>

<style lang="scss">
  :root {
    font-family: sans-serif;
  }
  .contacts-container {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    padding: 0.4rem var(--outer-padding);
    border-bottom: 1px solid var(--border);
    *:focus {
      outline: 5px auto var(--primary);
    }
  }
  .contacts-container > div {
    padding-bottom: 0.1rem;
    padding-right: 0.1rem;
  }
  .contact-item {
    display: inline-flex;
    background: var(--primary-light);
    color: var(--primary);
    align-items: center;
    border-radius: calc(var(--border-radius) / 2);
    padding: 0.2rem 0.8rem;
    margin-right: 0.25rem;
    margin-top: 2px;
    margin-bottom: 2px;
  }
  .contact-item > button {
    color: var(--text-secondary);
    border: none;
    background: none;
    padding: 2px 4px;
    font-weight: bold;
    font-size: 13px;
    cursor: pointer;
  }
  .contact-item__name {
    color: var(--text-secondary);
    font-size: 12px;
    padding-right: 0.75rem;
  }
  .dropdown {
    width: 100%;
    position: relative;
    display: inline-block;
  }

  .dropdown-content {
    display: block;
    position: absolute;
    max-height: 350px;
    background: var(--background);
    left: calc(var(--outer-padding) / 2);
    right: calc(var(--outer-padding) / 2);
    overflow-y: auto;
    color: var(--text);
    box-shadow: var(--shadow);
    z-index: 1;
    border-radius: calc(var(--border-radius) / 2);
  }

  .dropdown-item {
    cursor: pointer;
    padding: var(--outer-padding);
    font-size: var(--font-size-small);
    background: var(--primary-light);

    &.active {
      background-color: var(--primary);
      color: white;
      .dropdown-item__email {
        color: var(--bg) !important;
      }
    }
    &.selected {
      opacity: 0.3;
    }
    &__name {
      font-weight: bold;
      display: inline-flex;
    }
    &__email {
      color: var(--text-light);
      display: inline-flex;
      margin-left: 0.25rem;
    }
  }
  .search-field {
    border: none;
    color: var(--text);
    background: var(--bg);
    min-width: 100%;
    &:focus {
      width: 100px;
    }
  }
  .search-form {
    display: flex;
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
    align-items: center;
    min-width: 320px;
  }

  .contacts-results {
    display: flex;
    align-items: center;
  }

  .contacts-placeholder {
    font-size: var(--font-size-small);
    margin-right: 10px;
    min-width: 30px;
    display: flex;
    color: var(--text-light);
  }
</style>

<div class="dropdown">
  <div class="contacts-container" on:click={focusSearch}>
    <div class="contacts-results">
      <div class="contacts-placeholder">{placeholder}</div>
      <div class="contacts-results-inner">
        {#each selectedContacts as contact (contact.email)}
          <div class="contact-item">
            <span class="contact-item__name">
              {#if contact.name}
                <strong>{contact.name}</strong>
                {`<${contact.email}>`}
              {:else}{contact.email}{/if}
            </span>
            <button
              type="button"
              name="term"
              on:click={() => removeContact(contact.email)}>&times;</button
            >
          </div>
        {/each}
      </div>
    </div>

    {#if (single && !selectedContacts.length) || !single}
      <form on:submit|preventDefault={handleSubmit} class="search-form">
        <input
          type="text"
          name="email"
          autocomplete="off"
          class="search-field"
          bind:this={searchField}
          on:keydown={handleKeydown}
          on:blur={() => blurSearch({ addContact: true })}
          bind:value={term}
        />
      </form>
    {/if}
  </div>
  {#if isOpen && show_dropdown}
    <div class="dropdown-content">
      {#if loading && !filteredContacts.length}
        <p class="dropdown-item">Loading...</p>
      {/if}
      {#if !loading && filteredContacts.length}
        {#each filteredContacts as contact, i}
          <div
            class="dropdown-item"
            class:active={currentContactIndex === i}
            class:selected={isSelected(contact.email)}
            on:mousedown={() => selectContact(contact)}
            on:mouseenter={() => setActiveContact(i)}
          >
            {#if contact.name}
              <div class="dropdown-item__name">{contact.name}</div>
              <div class="dropdown-item__email">{contact.email}</div>
            {:else}
              <div class="dropdown-item__name">{contact.email}</div>
            {/if}
          </div>
        {/each}
      {/if}
    </div>
  {/if}
</div>
