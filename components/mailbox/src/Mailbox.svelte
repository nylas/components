<svelte:options tag="nylas-mailbox" />

<script lang="ts">
  import { ErrorStore, fetchAccount, ManifestStore } from "@commons";
  import { fetchMessage } from "@commons/connections/messages";
  import {
    AccountOrganizationUnit,
    MailboxActions,
  } from "@commons/enums/Nylas";
  import {
    buildInternalProps,
    downloadAttachedFile,
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
    File,
  } from "@commons/types/Nylas";
  import { downloadFile } from "@commons/connections/files";
  import { get_current_component, onMount, tick } from "svelte/internal";
  import "../../email/src/Email.svelte";
  import MarkReadIcon from "./assets/envelope-open-text.svg";
  import MarkUnreadIcon from "./assets/envelope.svg";
  import LoadingIcon from "./assets/loading.svg";
  import TrashIcon from "./assets/trash-alt.svg";
  import "./components/PaginationNav.svelte";
  import { FilesStore } from "@commons/store/files";

  const dispatchEvent = getEventDispatcher(get_current_component());
  $: dispatchEvent("manifestLoaded", manifest);

  $: if (Object.keys($ErrorStore).length) {
    dispatchEvent("onError", $ErrorStore);
  }

  export let id: string = "";
  export let access_token: string = "";

  export let actions_bar: MailboxActions[];
  export let all_threads: Thread[];
  export let header: string = "Mailbox";
  export let items_per_page: number;
  export let keyword_to_search: string;
  export let onSelectThread: (
    event: MouseEvent,
    t: Thread,
  ) => void = onSelectOne;
  // query_string format => "in=trash from=phil.r@nylas.com"
  export let query_string: string; // Allowed query parameter list https://developer.nylas.com/docs/api/#get/threads
  export let show_star: boolean;
  export let show_thread_checkbox: boolean;
  export let show_reply: boolean;
  export let show_reply_all: boolean;

  const defaultValueMap: Partial<MailboxProperties> = {
    actions_bar: [],
    items_per_page: 13,
    query_string: "in=inbox",
    show_star: false,
    show_thread_checkbox: true,
    show_reply: false,
    show_reply_all: false,
  };

  let manifest: Partial<MailboxProperties> = {};
  let _this = <MailboxProperties>buildInternalProps({}, {}, defaultValueMap);

  let currentlySelectedThread: Thread | null;
  let hasComponentLoaded = false;
  let displayedThreadsPromise: Promise<Thread[]>;

  // paginations vars
  let currentPage: number = 0;
  let numPages: number = 1;
  let numThreads: number = 0;

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

    await updateDisplayedThreads();

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

  $: (async () => {
    if (!_this.all_threads && _this.items_per_page && hasComponentLoaded) {
      await updateDisplayedThreads(true);
    }
  })();

  $: if (Array.isArray(_this.all_threads)) {
    numThreads = _this.all_threads.length;
    numPages = Math.ceil(numThreads / _this.items_per_page);

    const pageStart = currentPage * _this.items_per_page;
    threads = _this.all_threads.slice(
      pageStart,
      pageStart + _this.items_per_page,
    );
  }

  let query: MailboxQuery;
  $: {
    query = {
      component_id: id,
      access_token,
      query: Object.fromEntries(
        new URLSearchParams(_this.query_string?.replaceAll(" ", "&")),
      ),
    };
    if (_this.keyword_to_search) {
      query.keywordToSearch = _this.keyword_to_search;
    }
  }

  let queryKey: string;
  $: queryKey = JSON.stringify(query);

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
    return fetchMessage(query, message.id).then((json) => {
      message.body = json.body;
      return message;
    });
  }

  async function updateDisplayedThreads(forceRefresh = false) {
    if (displayedThreadsPromise) {
      await displayedThreadsPromise;
    }

    if (!_this.all_threads && id) {
      if (_this.keyword_to_search) {
        displayedThreadsPromise = MailboxStore.getThreadsWithSearchKeyword(
          query,
          forceRefresh,
        );
        threads = (await displayedThreadsPromise) ?? [];
      } else {
        displayedThreadsPromise = MailboxStore.getThreads(
          query,
          currentPage,
          _this.items_per_page,
          forceRefresh,
        );
        threads = (await displayedThreadsPromise) ?? [];
        numThreads = await MailboxStore.getNumberOfItems(query);
        numPages = Math.ceil(numThreads / _this.items_per_page);
      }
    }
  }

  //#endregion methods

  //#region actions
  let areAllSelected = false;
  $: areAllSelected = threads.some((thread) => thread.selected);

  let areAllSelectedStarred = false;
  $: areAllSelectedStarred = threads
    .filter((thread) => thread.selected)
    .some((thread) => thread.starred);

  let areAllSelectedRead = false;
  $: areAllSelectedRead = threads
    .filter((thread) => thread.selected)
    .some((thread) => !thread.unread);

  async function messageClicked(event: CustomEvent) {
    let message = event.detail.message;

    if (message && currentlySelectedThread) {
      message = await fetchIndividualMessage(message);
      threads = MailboxStore.hydrateMessageInThread(
        message,
        query,
        currentPage,
      );
      if (FilesStore.hasInlineFiles(message)) {
        message = await getMessageWithInlineFiles(message);
        threads = MailboxStore.hydrateMessageInThread(
          message,
          query,
          currentPage,
        );
      }
    }
  }

  async function updateThreadStatus(updatedThread: any) {
    if (id && updatedThread && updatedThread.id) {
      await MailboxStore.updateThread(
        {
          access_token,
          component_id: id,
          thread_id: updatedThread.id,
        },
        queryKey,
        updatedThread,
        currentPage,
        _this.items_per_page,
      );
    }
  }

  async function threadClicked(event: CustomEvent) {
    const thread = event.detail.thread;

    dispatchEvent("threadClicked", { event, thread });
    currentlySelectedThread = thread;
    if (!_this.all_threads && thread?.expanded) {
      if (thread.unread) {
        thread.unread = false;
        await updateThreadStatus(thread);
      }
      let message = await fetchIndividualMessage(
        thread.messages[thread.messages.length - 1],
      );
      threads = MailboxStore.hydrateMessageInThread(
        message,
        query,
        currentPage,
      );
      if (FilesStore.hasInlineFiles(message)) {
        message = await getMessageWithInlineFiles(message);
        threads = MailboxStore.hydrateMessageInThread(
          message,
          query,
          currentPage,
        );
      }
    }
  }

  async function getMessageWithInlineFiles(message: Message): Promise<Message> {
    const fetchedFiles = await FilesStore.getFilesForMessage(message, {
      component_id: id,
      access_token,
    });
    for (const file of Object.values(fetchedFiles)) {
      if (message.body) {
        message.body = message.body?.replaceAll(
          `src="cid:${file.content_id}"`,
          `src="data:${file.content_type};base64,${file.data}"`,
        );
      }
    }
    return message;
  }

  let loading = false;
  async function refreshClicked(event: MouseEvent) {
    loading = true;
    dispatchEvent("refreshClicked", { event });
    await updateDisplayedThreads(true);
    loading = false;
  }

  function onSelectOne(event: MouseEvent, thread: Thread) {
    if (Array.isArray(_this.all_threads)) {
      thread.selected = !thread.selected;
      threads = [...threads];
    } else {
      threads = MailboxStore.updateThreadSelection(
        JSON.stringify(query),
        currentPage,
        thread.id,
      );
    }
    dispatchEvent("onSelectOneClicked", { event, thread });
  }

  function onSelectAll(event: MouseEvent) {
    if (Array.isArray(_this.all_threads)) {
      threads = threads.map((thread) => {
        return { ...thread, selected: !areAllSelected };
      });
    } else {
      threads = MailboxStore.updateThreadSelection(
        JSON.stringify(query),
        currentPage,
      );
    }
    dispatchEvent("onSelectAllClicked", {
      event,
      selectedThreads: threads.filter((thread) => thread.selected),
    });
  }

  async function threadStarred(event: CustomEvent) {
    const thread = event.detail.thread;
    if (!Array.isArray(_this.all_threads)) {
      await updateThreadStatus(thread);
      threads = $MailboxStore[queryKey][currentPage].threads;
    }

    dispatchEvent("onStarSelected", {
      event,
      starredThreads: [thread],
    });
  }

  async function onStarSelected(event: MouseEvent) {
    if (Array.isArray(_this.all_threads)) {
      threads = threads.map((thread) => {
        return { ...thread, starred: !areAllSelectedStarred };
      });
    } else {
      const starThreadsPromises = [];
      for (const thread of threads.filter((thread) => thread.selected)) {
        thread.starred = !areAllSelectedStarred;
        starThreadsPromises.push(updateThreadStatus(thread));
      }
      await Promise.all(starThreadsPromises);
      threads = $MailboxStore[queryKey][currentPage].threads;
    }

    dispatchEvent("onStarSelected", {
      event,
      selectedThreads: threads.filter((threads) => threads.selected),
    });
  }

  async function toggleThreadUnreadStatus(event: CustomEvent) {
    if (Array.isArray(_this.all_threads)) {
      threads = [...threads];
    } else {
      await updateThreadStatus(event.detail.thread);
      threads = $MailboxStore[queryKey][currentPage].threads;
    }
  }

  async function onChangeSelectedReadStatus(event: MouseEvent) {
    if (Array.isArray(_this.all_threads)) {
      threads = threads.map((thread) => {
        if (thread.selected) {
          thread.unread = areAllSelectedRead;
        }
        return { ...thread };
      });
    } else {
      const readStatusPromises = [];
      for (const thread of threads.filter((thread) => thread.selected)) {
        thread.unread = areAllSelectedRead;
        readStatusPromises.push(updateThreadStatus(thread));
      }
      await Promise.all(readStatusPromises);
      threads = $MailboxStore[queryKey][currentPage].threads;
    }
    dispatchEvent("onChangeSelectedReadStatus", {
      event,
      selectedThreads: threads.filter((threads) => threads.selected),
    });
  }

  async function deleteThread(event: CustomEvent) {
    const thread = event.detail.thread;

    if (Array.isArray(_this.all_threads)) {
      threads = threads.filter(
        (currentThread) => currentThread.id !== thread.id,
      );
    } else {
      if (trashLabelID) {
        const existingLabelIds =
          thread.labels?.map((label: any) => label.id) || [];
        thread.label_ids = [...existingLabelIds, trashLabelID];
      } else if (trashFolderID) {
        thread.folder_id = trashFolderID;
      }
      await updateThreadStatus(thread);
      await updateDisplayedThreads(true);
    }
    returnToMailbox();
  }

  async function downloadSelectedFile(event: CustomEvent) {
    const file = event.detail.file;
    const downloadedFileData = await downloadFile({
      file_id: file.id,
      component_id: id,
      access_token,
    });
    downloadAttachedFile(downloadedFileData, file);
  }

  async function onDeleteSelected(event: MouseEvent) {
    if (Array.isArray(_this.all_threads)) {
      const selectedThreads = threads.filter((thread) => thread.selected);
      threads = threads.filter((thread) => !selectedThreads.includes(thread));
    } else if (trashLabelID || trashFolderID) {
      const deleteThreadsPromise = [];
      for (const thread of threads.filter((thread) => thread.selected)) {
        deleteThreadsPromise.push(deleteThread(<any>{ detail: { thread } }));
      }
      await Promise.all(deleteThreadsPromise);
    }
    dispatchEvent("onDeleteSelected", {
      event,
      deletedThreads: currentlySelectedThread
        ? [currentlySelectedThread]
        : threads,
    });
  }

  function returnToMailbox() {
    if (currentlySelectedThread) {
      currentlySelectedThread.expanded = false;
      currentlySelectedThread = null;
    }
  }
  //#endregion actions

  //#region pagination
  async function changePage(event: CustomEvent) {
    loading = true;
    currentPage = event.detail.newPage;
    await updateDisplayedThreads();
    loading = false;
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
    font-family: var(
      --mailbox-font-family,
      -apple-system,
      BlinkMacSystemFont,
      sans-serif
    );

    $outline-style: 1px solid var(--mailbox-border-color, var(--grey-lighter));
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

      .thread-checkbox {
        display: flex;
      }

      button {
        &[disabled] svg {
          fill: var(--grey);
        }
        svg {
          fill: var(--grey-dark);
        }
      }
    }

    // Toggle select-all checkbox and thread checkbox from CSS Var
    .thread-checkbox {
      input {
        @include checkbox;
        &:disabled {
          cursor: not-allowed;
        }
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
          color: var(--mailbox-starred-disabled-color, var(--grey));
          -webkit-user-select: none;
          -moz-user-select: none;
          user-select: none;
        }

        &:not([disabled]):before,
        svg {
          color: var(--mailbox-starred-unselected-color, #8d94a5);
        }

        &:not([disabled]).starred:before {
          color: var(--mailbox-starred-enabled-color, #ffc107);
        }
      }
    }

    #mailboxlist li {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 0.5rem;
      align-items: center;
      justify-content: left;

      .checkbox-container.thread-checkbox {
        padding: 1rem 0 0 1rem;
        align-self: baseline;
      }

      &:hover {
        $hover-outline-width: 1px;
        outline: $hover-outline-width solid
          var(--mailbox-grey-warm-color, var(--grey-warm));
        cursor: pointer;
      }

      // #region define border styles
      --nylas-email-border: none;
      outline: $outline-style;
      // #endregion define border styles

      // #region define background styles
      --nylas-email-background: transparent;
      --nylas-email-border-left-width: 0px;
      --nylas-email-unread-background: transparent;

      &:not(.unread) {
        background: var(--mailbox-read-color, var(--grey-lightest));
      }
      &.unread {
        background: var(--mailbox-unread-color, var(--nylas-email-background));
      }
      &.no-messages {
        background: var(--grey-lighter);
        .thread-checkbox {
          input {
            background: var(--grey-dark-warm);
          }
        }
      }
      // #endregion define background styles

      // #region define checked styles
      &.checked {
        border-left: 4px solid var(--mailbox-checked-border-color, var(--blue));
        background: var(--mailbox-checked-bg-color, var(--blue-lighter));

        .checkbox-container.thread-checkbox {
          padding-left: 13px;
        }
      }
      // #endregion define checked styles
    }
  }

  ul.refreshing {
    position: relative;
    @include progress-bar(top, 0, left, 0, var(--blue), var(--blue-lighter));
    &:before {
      z-index: 1;
    }
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
          padding: 0.6rem 0.5rem 0 $spacing-m;
          display: flex;
          min-height: 2rem;
          align-items: center;
        }
      }

      div.starred {
        button {
          &:hover:before {
            color: var(--mailbox-starred-enabled-color, #ffc107);
          }
        }
      }
    }
  }
</style>

<main>
  {#if hasComponentLoaded}
    {#if currentlySelectedThread}
      <div class="email-container">
        <nylas-email
          clean_conversation={false}
          thread={currentlySelectedThread}
          {you}
          show_star={_this.show_star}
          click_action="mailbox"
          show_reply={_this.show_reply}
          show_reply_all={_this.show_reply_all}
          on:messageClicked={messageClicked}
          on:threadStarred={threadStarred}
          on:returnToMailbox={returnToMailbox}
          on:toggleThreadUnreadStatus={toggleThreadUnreadStatus}
          on:threadDeleted={deleteThread}
          on:downloadClicked={downloadSelectedFile}
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
              class:refreshing={loading}
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
          {#if _this.show_thread_checkbox && _this.actions_bar.includes(MailboxActions.SELECTALL)}
            <div class="thread-checkbox">
              {#each [areAllSelected ? "Deselect all" : "Select all"] as selectAllTitle}
                <input
                  title={selectAllTitle}
                  aria-label={selectAllTitle}
                  type="checkbox"
                  checked={areAllSelected}
                  on:click={onSelectAll}
                />
              {/each}
            </div>
          {/if}
          {#if _this.actions_bar.includes(MailboxActions.DELETE)}
            <div class="delete">
              <button
                title="Delete selected email(s)"
                disabled={!threads.filter((thread) => thread.selected).length}
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
                  disabled={!threads.filter((thread) => thread.selected).length}
                  aria-checked={areAllSelectedStarred}
                  on:click={(e) => onStarSelected(e)}
                />
              {/each}
            </div>
          {/if}
          {#if _this.actions_bar.includes(MailboxActions.UNREAD)}
            <div class="read-status">
              {#if !areAllSelectedRead}
                <button
                  data-cy="mark-read"
                  title="Mark selected email(s) as read"
                  disabled={!threads.filter((thread) => thread.selected).length}
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
          {/if}
        </div>
      {/if}
      <ul id="mailboxlist" class:refreshing={loading}>
        {#each threads as thread}
          {#each [thread.selected ? `Deselect thread ${thread.subject}` : `Select thread ${thread.subject}`] as selectTitle}
            <li
              class:unread={thread.unread}
              class:checked={thread.selected}
              class:no-messages={thread &&
                thread?.messages &&
                thread?.messages?.length <= 0}
            >
              {#if _this.show_thread_checkbox}
                <div class="checkbox-container thread-checkbox">
                  <input
                    title={selectTitle}
                    aria-label={selectTitle}
                    type="checkbox"
                    checked={thread.selected}
                    disabled={thread &&
                      thread?.messages &&
                      thread?.messages?.length <= 0}
                    on:click={(e) => onSelectOne(e, thread)}
                  />
                </div>
              {/if}
              <div class="email-container">
                {#key thread.id}
                  <nylas-email
                    clean_conversation={false}
                    {thread}
                    {you}
                    show_star={_this.show_star}
                    click_action="mailbox"
                    show_reply={_this.show_reply}
                    show_reply_all={_this.show_reply_all}
                    on:threadClicked={threadClicked}
                    on:messageClicked={messageClicked}
                    on:threadStarred={threadStarred}
                    on:returnToMailbox={returnToMailbox}
                    on:toggleThreadUnreadStatus={toggleThreadUnreadStatus}
                    on:threadDeleted={deleteThread}
                    on:downloadClicked={downloadSelectedFile}
                    show_thread_actions={thread.selected}
                  />
                {/key}
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
        {#if !_this.keyword_to_search && threads && threads.length > 0}
          <pagination-nav
            current_page={currentPage}
            items_per_page={_this.items_per_page}
            num_pages={numPages}
            num_items={numThreads}
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
