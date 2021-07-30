<svelte:options tag="nylas-mailbox" />

<script lang="ts">
  import { ManifestStore } from "@commons";
  import { get_current_component, onMount, tick } from "svelte/internal";
  import {
    buildInternalProps,
    getEventDispatcher,
    getPropertyValue,
  } from "@commons/methods/component";
  import { MailboxStore, Threads } from "@commons/store/threads";
  import "../../email/src/Email.svelte";
  import "./components/PaginationNav.svelte";
  import { AccountStore } from "@commons/store/accounts";
  import { fetchMessage } from "@commons/connections/messages";
  import LoadingIcon from "./assets/loading.svg";
  import LeftArrowLineIcon from "./assets/arrow-line.svg";

  let manifest: Partial<Nylas.EmailProperties> = {};

  const dispatchEvent = getEventDispatcher(get_current_component());
  $: dispatchEvent("manifestLoaded", manifest);

  export let id: string = "";
  export let access_token: string = "";
  export let all_threads: Nylas.Thread[];
  export let show_star: boolean;
  export let show_mailbox_toolbar: boolean = true;
  export let show_thread_checkbox: boolean = true;
  export let unread_status: "read" | "unread" | "default";
  export let header: string | null;
  export let actionsBar: string[];
  export let onSelectThread: (event: Event, t: Nylas.Thread) => void =
    onSelectOne;

  let queryParams: Nylas.ThreadsQuery;
  let openedEmailData: Nylas.Thread | null;

  // paginations vars
  let paginatedThreads: Nylas.Thread[] = [];
  let currentPage: number = 1;
  let lastPage: number = 1;
  export let items_per_page: number = 13;

  onMount(async () => {
    await tick(); // https://github.com/sveltejs/svelte/issues/2227
    queryParams = Object.fromEntries(
      new URLSearchParams(window.location.search),
    );

    manifest = ((await $ManifestStore[
      JSON.stringify({ component_id: id, access_token })
    ]) || {}) as Nylas.EmailProperties;

    you = await AccountStore.getAccount(query);

    if (all_threads) {
      threads = all_threads as Nylas.Thread[];
    } else {
      threads = (await MailboxStore.getThreads(query)) || [];
    }

    paginatedThreads = paginate(threads, currentPage, items_per_page);
    lastPage = Math.ceil(threads.length / items_per_page);
  });

  $: paginatedThreads = paginate(threads, currentPage, items_per_page);

  // The reference to $$props is lost each time it gets updated, so we have to rebuild the proxy each time
  // TODO - Find a way to improve this
  $: internalProps = buildInternalProps($$props, manifest);

  // Reactive statements to continuously set manifest, prop and default values
  $: {
    show_star = getPropertyValue(internalProps.show_star, show_star, false);
    unread_status = getPropertyValue(
      internalProps.unread_status,
      unread_status,
      "default",
    );
    items_per_page = getPropertyValue(
      parseInt(internalProps.items_per_page),
      items_per_page,
      13,
    );
    header = getPropertyValue(internalProps.header, header, null);
    actionsBar = getPropertyValue(internalProps.actionsBar, actionsBar, []);
  }

  // Reactive statement to continuously fetch all_threads
  $: if (all_threads) {
    threads = all_threads as Nylas.Thread[];
  }

  let main: Element;

  let query: Nylas.MailboxQuery;
  $: query = {
    component_id: id,
    access_token,
    query: queryParams,
  };

  let queryKey: string;
  $: queryKey = JSON.stringify(query);

  // Try getting events from 3 sources: first, directly passed in, then, from our store; finally, by way of a fetch
  let threads: Nylas.Thread[] = [];

  // let conversation: Nylas.Conversation | null = null;
  let status: "loading" | "loaded" | "error" = "loading";

  let you: Partial<Nylas.Account> = {};

  const readStatusOutputs = {
    unread: true,
    read: false,
    default: null,
  };

  //#region methods
  function fetchIndividualMessage(message: Nylas.Message) {
    // messageLoadStatus[msgIndex] = "loading";
    return fetchMessage(query, message.id).then((json) => {
      console.log("message back?", json);
      message.body = json.body;
      return message;
    });
  }

  //#endregion methods

  //#region actions
  async function messageClicked(event: CustomEvent) {
    // console.debug("message clicked from mailbox", event.detail);
    if (event.detail.message?.expanded) {
      let message = await fetchIndividualMessage(event.detail.message);
      threads = await MailboxStore.hydrateMessageInThread(message, query);
    }
  }

  async function threadClicked(event: CustomEvent) {
    // console.debug('thread clicked from mailbox', event.detail);
    if (event.detail.thread?.expanded) {
      openedEmailData = event.detail.thread;
      let message = await fetchIndividualMessage(
        event.detail.thread.messages[event.detail.thread.messages.length - 1],
      );
      threads = await MailboxStore.hydrateMessageInThread(message, query);
    }
    console.log(openedEmailData);
  }

  async function refreshClicked(event: CustomEvent) {
    dispatchEvent("refreshClicked", { event });
    if (!all_threads) {
      threads = (await MailboxStore.getThreads(query, true)) || [];
    }
  }
  let selectedThreads = new Set();
  $: areAllSelected = selectedThreads.size >= threads.length;

  function onSelectOne(event, thread: Nylas.Thread) {
    dispatchEvent("onSelectOneClicked", { event, thread });
    if (selectedThreads.has(thread)) {
      selectedThreads.delete(thread);
    } else {
      selectedThreads.add(thread);
    }
    return (selectedThreads = selectedThreads);
  }

  function onSelectAll(event) {
    dispatchEvent("onSelectAllClicked", { event });
    if (areAllSelected) {
      selectedThreads.clear();
    } else {
      threads.forEach((t) => selectedThreads.add(t));
    }
    return (selectedThreads = selectedThreads);
  }
  //#endregion actions

  // pagination
  function paginate(
    items: Nylas.Thread[],
    activePage: number,
    pageSize: number,
  ): Nylas.Thread[] {
    let start: number = (activePage - 1) * pageSize;
    let end: number = start + pageSize;
    return items.slice(start, end);
  }

  function changePage(event: CustomEvent) {
    currentPage = event.detail.newPage;
  }
</script>

<style lang="scss">
  @use 'sass:list';
  @import "../../theming/reset.scss";
  @import "../../theming/animation.scss";
  @import "../../theming/variables.scss";
  @import "../../../commons/src/components/checkbox.scss";

  $spacing-s: 0.5rem;
  $spacing-m: 1rem;
  main {
    height: 100%;
    width: 100%;
    position: relative;
    display: grid;
    font-family: -apple-system, BlinkMacSystemFont, sans-serif;

    $border-style: 1px solid var(--grey-lighter);
    @mixin barStyle {
      border: $border-style;
      display: flex;
      align-items: center;
      padding: 24px 16px;
      gap: 8px;
    }

    .email-container {
      padding-right: 0.5rem;
    }

    header {
      @include barStyle;
      border-radius: 4px 4px 0 0;
      font-weight: bold;
    }

    button {
      background: none;
      display: flex;
      cursor: pointer;
    }

    [role="toolbar"] {
      @include barStyle;
      padding: 8px 16px;
      border-top-width: 0;
    }

    // Toggle select-all checkbox and thread checkbox from CSS Var
    .thread-checkbox {
      input {
        @include checkbox;
      }
    }

    #mailboxlist li {
      display: grid;
      grid-template-columns: auto 1fr;
      align-items: center;
      justify-content: left;

      .checkbox-container.thread-checkbox {
        padding: 1rem 0 0 1rem;
        align-self: baseline;
      }

      &:hover {
        $hover-outline-width: 1px;
        border: $hover-outline-width solid var(--grey-warm);
        border-top-width: 0;
        cursor: pointer;
      }

      // #region define border styles
      --nylas-email-border: none;
      border: $border-style;
      border-top-width: 0;
      // #endregion define border styles

      // #region define background styles
      --nylas-email-background: transparent;
      background: var(--grey-lightest);
      &.unread {
        background: white;
      }
      // #endregion define background styles

      // #region define checked styles
      &.checked {
        border-left: 4px solid var(--blue);
        background: var(--blue-lighter);

        .checkbox-container.thread-checkbox {
          padding-left: 13px;
        }
      }
      // #endregion define checked styles
    }
  }

  .checkbox-container {
    padding: 4px;
  }

  .mailbox-loader {
    width: calc(100vw - 16px);
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-shadow: none;
  }

  @keyframes rotate {
    to {
      transform: rotate(360deg);
    }
  }

  @media #{$desktop} {
    main {
      #mailboxlist li {
        .checkbox-container.thread-checkbox {
          padding: 0 0 0 $spacing-m;
          align-self: center;
        }
      }
    }
  }
</style>

<main bind:this={main}>
  {#if openedEmailData}
    <header class="subject-title">
      <button
        on:click={() => {
          openedEmailData.expanded = false;
          openedEmailData = null;
        }}
      >
        <LeftArrowLineIcon />
      </button>
      <h1>{openedEmailData.subject}</h1>
    </header>
    <div class="email-container">
      <nylas-email
        is_clean_conversation_enabled={false}
        thread={openedEmailData}
        {you}
        {show_star}
        click_action="mailbox"
        unread={readStatusOutputs[unread_status]}
        on:threadClicked={threadClicked}
        on:messageClicked={messageClicked}
      />
    </div>
  {:else}
    {#if header}
      <header>
        <button on:click={refreshClicked}>
          <svg width="16" height="16" viewBox="0 0 16 16">
            <path
              d="M9.41757 0.780979L9.57471 0.00782773C12.9388 0.717887 15.4617 3.80648 15.4617 7.49954C15.4617 8.7935 15.1519 10.0136 14.6046 11.083L16 12.458L11.6994 13.7113L12.7846 9.28951L14.0208 10.5077C14.4473 9.60009 14.6869 8.5795 14.6869 7.49954C14.6869 4.17742 12.4188 1.41444 9.41757 0.780979ZM0 2.90469L4.24241 1.46013L3.3489 5.92625L2.06118 4.7644C1.71079 5.60175 1.51627 6.5265 1.51627 7.49954C1.51627 10.8217 3.7844 13.5847 6.78563 14.2182L6.62849 14.9913C3.26437 14.2812 0.741524 11.1926 0.741524 7.49954C0.741524 6.32506 0.996751 5.21133 1.45323 4.21587L0 2.90469Z"
            />
          </svg>
        </button>
        <h1>{header}</h1>
      </header>
    {/if}
    {#if show_mailbox_toolbar}
      <div role="toolbar" aria-label="Bulk actions" aria-controls="mailboxlist">
        {#if show_thread_checkbox}<div class="thread-checkbox">
            {#each [areAllSelected ? "Deselect all" : "Select all"] as selectAllTitle}
              <input
                title={selectAllTitle}
                aria-label={selectAllTitle}
                type="checkbox"
                checked={areAllSelected}
                on:click={(e) => onSelectAll(e)}
              />
            {/each}
          </div>{/if}
      </div>
    {/if}
    <ul id="mailboxlist">
      {#each paginatedThreads as thread}
        {#each [selectedThreads.has(thread) ? `Deselect thread ${thread.subject}` : `Select thread ${thread.subject}`] as selectTitle}
          <li
            class:unread={thread.unread}
            class:checked={selectedThreads.has(thread)}
          >
            {#if show_thread_checkbox}<div
                class="checkbox-container thread-checkbox"
              >
                <input
                  title={selectTitle}
                  aria-label={selectTitle}
                  type="checkbox"
                  checked={selectedThreads.has(thread)}
                  on:click={(e) => onSelectOne(e, thread)}
                />
              </div>{/if}
            <div class="email-container">
              <nylas-email
                is_clean_conversation_enabled={false}
                {thread}
                {you}
                {show_star}
                click_action="mailbox"
                unread={readStatusOutputs[unread_status]}
                on:threadClicked={threadClicked}
                on:messageClicked={messageClicked}
              />
            </div>
          </li>
        {/each}
      {:else}
        <div class="mailbox-loader">
          <LoadingIcon
            class="spinner"
            style="height:18px; animation: rotate 2s linear infinite; margin:10px;"
          />
          Loading component...
        </div>
      {/each}
      {#if threads.length > 0 && paginatedThreads}
        <pagination-nav
          current_page={currentPage}
          last_page={lastPage}
          visible={true}
          on:changePage={changePage}
        />
      {/if}
    </ul>
  {/if}
</main>
