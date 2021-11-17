<svelte:options tag="nylas-mailbox" />

<script lang="ts">
  import { fetchAccount, ManifestStore } from "@commons";
  import { fetchMessage } from "@commons/connections/messages";
  import {
    AccountOrganizationUnit,
    MailboxActions,
  } from "@commons/enums/Nylas";
  import {
    buildInternalProps,
    getEventDispatcher,
  } from "@commons/methods/component";
  import { FolderStore } from "@commons/store/folders";
  import { LabelStore } from "@commons/store/labels";
  import { MailboxStore } from "@commons/store/mailbox";
  import type {
    Account,
    Folder,
    Label,
    MailboxProperties,
    MailboxQuery,
    Message,
    Thread,
  } from "@commons/types/Nylas";
  import { get_current_component, onMount, tick } from "svelte/internal";
  import "../../email/src/Email.svelte";
  import MarkReadIcon from "./assets/envelope-open-text.svg";
  import MarkUnreadIcon from "./assets/envelope.svg";
  import LoadingIcon from "./assets/loading.svg";
  import TrashIcon from "./assets/trash-alt.svg";
  import "./components/PaginationNav.svelte";

  const dispatchEvent = getEventDispatcher(get_current_component());
  $: dispatchEvent("manifestLoaded", manifest);

  export let id: string = "";
  export let access_token: string = "";

  export let actions_bar: MailboxActions[];
  export let all_threads: Thread[];
  export let header: string;
  export let items_per_page: number;
  export let keyword_to_search: string;
  export let onSelectThread: (event: MouseEvent, t: Thread) => void =
    onSelectOne;
  // query_string format => "in=trash from=phil.r@nylas.com"
  export let query_string: string; // Allowed query parameter list https://developer.nylas.com/docs/api/#get/threads
  export let show_star: boolean;
  export let show_thread_checkbox: boolean;
  export let unread_status: "read" | "unread" | "default";

  const defaultValueMap: Partial<MailboxProperties> = {
    actions_bar: [],
    items_per_page: 13,
    show_star: false,
    show_thread_checkbox: true,
    unread_status: "default",
  };

  let manifest: Partial<MailboxProperties> = {};
  let _this = <MailboxProperties>buildInternalProps({}, {}, defaultValueMap);

  let openedEmailData: Thread | null;
  let hasComponentLoaded = false;

  // paginations vars
  let paginatedThreads: Thread[] = [];
  let currentPage: number = 1;
  let lastPage: number = 1;

  onMount(async () => {
    await tick();

    manifest = ((await $ManifestStore[
      JSON.stringify({ component_id: id, access_token })
    ]) || {}) as MailboxProperties;

    _this = buildInternalProps(
      $$props,
      manifest,
      defaultValueMap,
    ) as MailboxProperties;

    // Fetch Account
    if (id && !you.id && !_this.all_threads) {
      you = await fetchAccount({
        component_id: query.component_id,
        access_token,
      });
    }

    const accountOrganizationUnitQuery = {
      component_id: id,
      access_token,
    };
    // Initialize labels / folders
    if (you?.organization_unit === AccountOrganizationUnit.Label) {
      labels = await LabelStore.getLabels(accountOrganizationUnitQuery);
    } else if (you?.organization_unit === AccountOrganizationUnit.Folder) {
      folders = await FolderStore.getFolders(accountOrganizationUnitQuery);
    }

    if (_this.all_threads) {
      threads = _this.all_threads as Thread[];
    } else if (_this.keyword_to_search) {
      threads = await MailboxStore.getThreadsWithSearchKeyword({
        ...accountOrganizationUnitQuery,
        keyword_to_search: _this.keyword_to_search,
      });
    } else {
      threads = (await MailboxStore.getThreads(query)) || [];
    }

    inboxThreads = threads; // TODO: filter out threads in trash folder
    starredThreads = new Set(inboxThreads.filter((thread) => thread.starred));
    if (_this.unread_status === "unread") {
      unreadThreads = new Set(inboxThreads);
    } else if (_this.unread_status === "default") {
      unreadThreads = new Set(inboxThreads.filter((thread) => thread.unread));
    }
    paginatedThreads = paginate(
      inboxThreads,
      currentPage,
      _this.items_per_page,
    );
    lastPage = Math.ceil(inboxThreads?.length / _this.items_per_page);
    hasComponentLoaded = true;
  });

  let previousProps = $$props;
  $: {
    if (JSON.stringify(previousProps) !== JSON.stringify($$props)) {
      _this = buildInternalProps(
        $$props,
        manifest,
        defaultValueMap,
      ) as MailboxProperties;
      previousProps = $$props;
    }
  }

  let inboxThreads: Thread[]; // threads currently in the inbox
  $: if (threads) {
    inboxThreads = threads;
  }
  $: {
    if (!inboxThreads) {
      inboxThreads = threads;
    } // TODO: filter out threads in trash folder
    lastPage = Math.ceil(inboxThreads?.length / _this.items_per_page);
    if (currentPage > lastPage && lastPage !== 0) {
      currentPage = lastPage;
    }
  }

  $: paginatedThreads = paginate(
    inboxThreads,
    currentPage,
    _this.items_per_page,
  );

  // Reactive statement to continuously fetch all_threads
  $: if (_this.all_threads) {
    threads = _this.all_threads as Thread[];
    inboxThreads = threads; // TODO: filter out those in trash folder
  }

  let main: Element;

  let query: MailboxQuery;
  $: query = {
    component_id: id,
    access_token,
    query: Object.fromEntries(
      new URLSearchParams(_this.query_string?.replaceAll(" ", "&")),
    ),
  };

  let queryKey: string;
  $: queryKey = JSON.stringify(query);

  // Try getting events from 3 sources: first, directly passed in, then, from our store; finally, by way of a fetch
  let threads: Thread[] = [];

  let labels: Label[] = [];
  $: trashLabelID = labels.length
    ? labels.find((label) => label.name === "trash")?.id
    : null;

  let folders: Folder[] = [];
  $: trashFolderID = folders.length
    ? folders.find((folder) => folder.name === "trash")?.id
    : null;

  let you: Partial<Account> = {};

  //#region methods
  function fetchIndividualMessage(message: Message) {
    // messageLoadStatus[msgIndex] = "loading";
    return fetchMessage(query, message.id).then((json) => {
      message.body = json.body;
      return message;
    });
  }

  //#endregion methods

  //#region actions
  let selectedThreads = new Set<Thread>();
  $: areAllSelected = selectedThreads.size >= inboxThreads?.length;
  let starredThreads = new Set<Thread>();
  $: areAllSelectedStarred = checkIfSelectionBelongsToSet(
    selectedThreads,
    starredThreads,
  );
  let unreadThreads = new Set<Thread>();
  $: areAllSelectedUnread = checkIfSelectionBelongsToSet(
    selectedThreads,
    unreadThreads,
  );

  async function messageClicked(event: CustomEvent) {
    // console.debug("message clicked from mailbox", event.detail);
    if (event.detail.message?.expanded) {
      let message = await fetchIndividualMessage(event.detail.message);
      threads = await MailboxStore.hydrateMessageInThread(message, query);
    }
  }

  async function updateThreadStatus(updatedThread: any) {
    if (id && updatedThread && updatedThread.id) {
      const threadQuery = {
        access_token,
        component_id: id,
        thread_id: updatedThread.id,
      };
      await MailboxStore.updateThread(threadQuery, queryKey, updatedThread);
    }
  }

  function toggleThreadUnreadStatus(event: CustomEvent) {
    if (selectedThreads.has(event.detail.thread)) {
      dispatchEvent("onChangeSelectedReadStatus", { event, selectedThreads });
    }
    event.detail.thread.unread = !event.detail.thread.unread;
    updateThreadStatus(event.detail.thread);
    if (event.detail.thread.unread) {
      unreadThreads.add(event.detail.thread);
    } else {
      unreadThreads.delete(event.detail.thread);
    }
    return (unreadThreads = unreadThreads);
  }

  async function threadClicked(event: CustomEvent) {
    console.debug("thread clicked from mailbox", event.detail);
    dispatchEvent("threadClicked", { event, thread: event.detail.thread });
    openedEmailData = event.detail.thread;
    if (!_this.all_threads && event.detail.thread?.expanded) {
      if (event.detail.thread.unread) {
        event.detail.thread.unread = false;
        await updateThreadStatus(event.detail.thread);
      }
      let message = await fetchIndividualMessage(
        event.detail.thread.messages[event.detail.thread.messages.length - 1],
      );
      threads = await MailboxStore.hydrateMessageInThread(message, query);
    }
  }
  let refreshingMailbox = false;
  async function refreshClicked(event: MouseEvent) {
    refreshingMailbox = true;
    dispatchEvent("refreshClicked", { event });
    if (!_this.all_threads) {
      if (_this.keyword_to_search) {
        threads = await MailboxStore.getThreadsWithSearchKeyword({
          component_id: query.component_id,
          access_token: query.access_token,
          keyword_to_search: _this.keyword_to_search,
        });
      } else {
        threads = (await MailboxStore.getThreads(query, true)) || [];
      }
    }
    refreshingMailbox = false;
  }

  function onSelectOne(event: MouseEvent, thread: Thread) {
    dispatchEvent("onSelectOneClicked", { event, thread });
    if (selectedThreads.has(thread)) {
      selectedThreads.delete(thread);
    } else {
      selectedThreads.add(thread);
    }
    return (selectedThreads = selectedThreads);
  }

  function onSelectAll(event: MouseEvent) {
    dispatchEvent("onSelectAllClicked", { event, selectedThreads });
    if (areAllSelected) {
      selectedThreads.clear();
    } else {
      threads.forEach((t) => selectedThreads.add(t));
    }
    return (selectedThreads = selectedThreads);
  }

  async function threadStarred(event: CustomEvent) {
    dispatchEvent("onStarSelected", {
      event,
      selectedThreads: event.detail.thread,
    });
    if (starredThreads.has(event.detail.thread)) {
      starredThreads.delete(event.detail.thread);
      event.detail.thread.starred = false;
    } else {
      starredThreads.add(event.detail.thread);
      event.detail.thread.starred = true;
    }
    await updateThreadStatus(event.detail.thread);
    return (starredThreads = starredThreads);
  }

  function onStarSelected(event: MouseEvent) {
    dispatchEvent("onStarSelected", { event, selectedThreads });
    if (areAllSelectedStarred) {
      selectedThreads.forEach(async (t) => {
        starredThreads.delete(t);
        t.starred = false;
        await updateThreadStatus(t);
      });
    } else {
      selectedThreads.forEach(async (t) => {
        starredThreads.add(t);
        t.starred = true;
        await updateThreadStatus(t);
      });
    }
    return (starredThreads = starredThreads);
  }

  function checkIfSelectionBelongsToSet(
    selection: Set<Thread>,
    superset: Set<Thread>,
  ): boolean {
    if (
      selection.size > superset.size ||
      selection.size === 0 ||
      superset.size === 0
    ) {
      return false;
    }
    for (let setThread of selection) {
      if (!superset.has(setThread)) {
        return false;
      }
    }
    return true;
  }

  function onChangeSelectedReadStatus(event: MouseEvent) {
    dispatchEvent("onChangeSelectedReadStatus", { event, selectedThreads });
    if (areAllSelectedUnread) {
      selectedThreads.forEach(async (t) => {
        unreadThreads.delete(t);
        t.unread = false;
        await updateThreadStatus(t);
      });
    } else {
      selectedThreads.forEach(async (t) => {
        unreadThreads.add(t);
        t.unread = true;
        await updateThreadStatus(t);
      });
    }
    return (unreadThreads = unreadThreads), (selectedThreads = selectedThreads);
  }

  function returnToMailbox() {
    if (openedEmailData) {
      openedEmailData.unread = false;
      openedEmailData.expanded = false;

      if (unreadThreads.has(openedEmailData)) {
        unreadThreads.delete(openedEmailData);
      }
      openedEmailData = null;
    }
    return (unreadThreads = unreadThreads);
  }

  async function deleteThread(thread: Thread) {
    if (trashLabelID) {
      const existingLabelIds = thread.labels?.map((i) => i.id) || [];
      thread.label_ids = [...existingLabelIds, trashLabelID];
    } else if (trashFolderID) {
      thread.folder_id = trashFolderID;
    }
    await updateThreadStatus(thread);
  }

  async function onDeleteSelected(event: MouseEvent) {
    dispatchEvent("onDeleteSelected", {
      event,
      selectedThreads,
      thread: openedEmailData,
    });
    if (trashLabelID || trashFolderID) {
      if (openedEmailData) {
        threads = inboxThreads.filter((thread) => thread !== openedEmailData);
        starredThreads.delete(openedEmailData);
        unreadThreads.delete(openedEmailData);
        selectedThreads.delete(openedEmailData);
        await deleteThread(openedEmailData);
        openedEmailData = null;
      } else {
        selectedThreads.forEach(async (thread) => {
          starredThreads.delete(thread);
          unreadThreads.delete(thread);
          await deleteThread(thread);
        });
        threads = inboxThreads.filter((thread) => !selectedThreads.has(thread));
        selectedThreads.clear();
      }
    }

    return (
      (inboxThreads = inboxThreads),
      (selectedThreads = selectedThreads),
      (threads = threads)
    );
  }
  //#endregion actions

  //#region pagination
  function paginate(
    items: Thread[],
    activePage: number,
    pageSize: number,
  ): Thread[] {
    let start: number = (activePage - 1) * pageSize;
    let end: number = start + pageSize;
    return items.slice(start, end);
  }

  function changePage(event: CustomEvent) {
    currentPage = event.detail.newPage;
  }
  //#endregion pagination
</script>

<style lang="scss">
  @use "sass:list";
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
    grid-auto-rows: max-content;
    font-family: -apple-system, BlinkMacSystemFont, sans-serif;

    $outline-style: 1px solid var(--grey-lighter);
    @mixin barStyle {
      outline: $outline-style;
      display: flex;
      align-items: center;
      padding: 24px 16px;
      gap: 8px;
    }

    header {
      @include barStyle;
      border-radius: 4px 4px 0 0;
      font-weight: bold;
      button {
        svg {
          &.refreshing {
            animation: rotate 1s linear infinite;
          }
        }
      }
    }

    button {
      background: none;
      display: flex;
      cursor: pointer;
    }

    [role="toolbar"] {
      @include barStyle;
      padding: $spacing-s $spacing-m;
      gap: $spacing-m;
    }

    // Toggle select-all checkbox and thread checkbox from CSS Var
    .thread-checkbox {
      input {
        @include checkbox;
      }
    }

    div.starred {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      button {
        background-color: transparent;
        cursor: pointer;
        &:before {
          content: "\2605";
          display: inline-block;
          font-size: 1em;
          color: #ccc;
          -webkit-user-select: none;
          -moz-user-select: none;
          user-select: none;
        }

        &.starred:before {
          color: #ffc107;
        }
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
        outline: $hover-outline-width solid var(--grey-warm);
        cursor: pointer;
      }

      // #region define border styles
      --nylas-email-border: none;
      outline: $outline-style;
      // #endregion define border styles

      // #region define background styles
      --nylas-email-background: transparent;
      &:not(.unread) {
        background: var(--grey-lightest);
      }
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

  ul.refreshing {
    filter: blur(0.2rem);
  }

  .checkbox-container {
    padding: 4px;
  }

  .mailbox-loader,
  .mailbox-empty {
    width: calc(100% - 16px);
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-shadow: none;
  }

  .mailbox-loader {
    position: absolute;
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

      div.starred {
        button {
          &:hover:before {
            color: #ffc107;
          }
        }
      }
    }
  }
</style>

<main bind:this={main}>
  {#if hasComponentLoaded}
    {#if openedEmailData}
      <div class="email-container">
        <nylas-email
          clean_conversation={false}
          thread={openedEmailData}
          {you}
          show_star={_this.show_star}
          click_action="mailbox"
          unread={unreadThreads.has(openedEmailData) ||
            (openedEmailData.unread && _this.unread_status === "default")}
          on:threadClicked={threadClicked}
          on:messageClicked={messageClicked}
          on:threadStarred={threadStarred}
          on:returnToMailbox={returnToMailbox}
          on:toggleThreadUnreadStatus={toggleThreadUnreadStatus}
          on:threadDeleted={onDeleteSelected}
          is_starred={starredThreads.has(openedEmailData)}
        />
      </div>
    {:else}
      {#if _this.header}
        <header>
          <button on:click={refreshClicked}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              class:refreshing={refreshingMailbox}
            >
              <path
                d="M9.41757 0.780979L9.57471 0.00782773C12.9388 0.717887 15.4617 3.80648 15.4617 7.49954C15.4617 8.7935 15.1519 10.0136 14.6046 11.083L16 12.458L11.6994 13.7113L12.7846 9.28951L14.0208 10.5077C14.4473 9.60009 14.6869 8.5795 14.6869 7.49954C14.6869 4.17742 12.4188 1.41444 9.41757 0.780979ZM0 2.90469L4.24241 1.46013L3.3489 5.92625L2.06118 4.7644C1.71079 5.60175 1.51627 6.5265 1.51627 7.49954C1.51627 10.8217 3.7844 13.5847 6.78563 14.2182L6.62849 14.9913C3.26437 14.2812 0.741524 11.1926 0.741524 7.49954C0.741524 6.32506 0.996751 5.21133 1.45323 4.21587L0 2.90469Z"
              />
            </svg>
          </button>
          <h1>{header}</h1>
        </header>
      {/if}
      {#if _this.actions_bar.length}
        <div
          role="toolbar"
          aria-label="Bulk actions"
          aria-controls="mailboxlist"
        >
          {#if _this.show_thread_checkbox && _this.actions_bar.includes(MailboxActions.SELECTALL)}<div
              class="thread-checkbox"
            >
              {#each [areAllSelected ? "Deselect all" : "Select all"] as selectAllTitle}
                <input
                  title={selectAllTitle}
                  aria-label={selectAllTitle}
                  type="checkbox"
                  checked={areAllSelected}
                  on:click={(e) => onSelectAll(e)}
                />
              {/each}
            </div>
          {/if}
          {#if selectedThreads.size}
            {#if _this.actions_bar.includes(MailboxActions.DELETE)}
              <div class="delete">
                <button
                  title="Delete selected email(s)"
                  aria-label="Delete selected email(s)"
                  on:click={(e) => onDeleteSelected(e)}><TrashIcon /></button
                >
              </div>
            {/if}
            {#if _this.show_star && _this.actions_bar.includes(MailboxActions.STAR)}
              <div class="starred">
                {#each [areAllSelectedStarred ? "Unstar selected email(s)" : "Star selected email(s)"] as starAllTitle}
                  <button
                    class={areAllSelectedStarred ? "starred" : ""}
                    title={starAllTitle}
                    aria-label={starAllTitle}
                    role="switch"
                    aria-checked={areAllSelectedStarred}
                    on:click={(e) => onStarSelected(e)}
                  />
                {/each}
              </div>{/if}
            {#if _this.actions_bar.includes(MailboxActions.UNREAD)}
              <div class="read-status">
                {#if areAllSelectedUnread}
                  <button
                    data-cy="mark-read"
                    title="Mark selected email(s) as read"
                    aria-label="Mark selected email(s) as read"
                    on:click={(e) => onChangeSelectedReadStatus(e)}
                  >
                    <MarkReadIcon />
                  </button>
                {:else}
                  <button
                    data-cy="mark-unread"
                    title="Mark selected email(s) as unread"
                    aria-label="Mark selected email(s) as unread"
                    on:click={(e) => onChangeSelectedReadStatus(e)}
                  >
                    <MarkUnreadIcon />
                  </button>
                {/if}
              </div>
            {/if}{/if}
        </div>
      {/if}
      <ul id="mailboxlist" class:refreshing={refreshingMailbox}>
        {#each paginatedThreads as thread}
          {#each [selectedThreads.has(thread) ? `Deselect thread ${thread.subject}` : `Select thread ${thread.subject}`] as selectTitle}
            <li
              class:unread={unreadThreads.has(thread) ||
                (thread.unread && _this.unread_status === "default")}
              class:checked={selectedThreads.has(thread)}
            >
              {#if _this.show_thread_checkbox}<div
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
                  clean_conversation={false}
                  {thread}
                  {you}
                  show_star={_this.show_star}
                  click_action="mailbox"
                  unread={unreadThreads.has(thread) ||
                    (thread.unread && _this.unread_status === "default")}
                  on:threadClicked={threadClicked}
                  on:messageClicked={messageClicked}
                  on:threadStarred={threadStarred}
                  on:returnToMailbox={returnToMailbox}
                  on:toggleThreadUnreadStatus={toggleThreadUnreadStatus}
                  on:threadDeleted={onDeleteSelected}
                  is_starred={starredThreads.has(thread)}
                  show_thread_actions={selectedThreads.has(thread)}
                />
              </div>
            </li>
          {/each}
        {:else}
          <div class="mailbox-empty">
            {#if _this.header}
              {header}
            {:else}
              Your Mailbox
            {/if} is empty!
          </div>
        {/each}
        {#if threads && threads.length > 0 && paginatedThreads}
          <pagination-nav
            current_page={currentPage}
            last_page={lastPage}
            visible={true}
            on:changePage={changePage}
          />
        {/if}
      </ul>
    {/if}
  {:else}
    <div class="mailbox-loader">
      <LoadingIcon
        class="spinner"
        style="height:18px; animation: rotate 2s linear infinite; margin:10px;"
      />
      Loading...
    </div>
  {/if}
</main>
