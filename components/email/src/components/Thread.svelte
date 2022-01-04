<svelte:options tag="nylas-thread" />

<script lang="ts">
  import { onMount, tick, get_current_component } from "svelte/internal";
  import type {
    Account,
    ConversationQuery,
    EmailProperties,
    Folder,
    Label,
    Message,
    Participant,
    Thread,
    File,
  } from "@commons/types/Nylas";
  import {
    DisallowedContentTypes,
    InlineImageTypes,
  } from "@commons/constants/attachment-content-types";
  import {
    MAX_DESKTOP_PARTICIPANTS,
    MAX_MOBILE_PARTICIPANTS,
    PARTICIPANTS_TO_TRUNCATE,
  } from "@commons/constants/email";
  import {
    formatPreviewDate,
    formatExpandedDate,
  } from "@commons/methods/datetime";
  import type { Contact, ContactSearchQuery } from "@commons/types/Contacts";
  import { downloadFile } from "@commons/connections/files";
  import { ContactStore, fetchAccount } from "@commons";
  import {
    buildInternalProps,
    downloadAttachedFile,
    getEventDispatcher,
  } from "@commons/methods/component";
  import { AccountOrganizationUnit } from "@commons/enums/Nylas";
  import { LabelStore } from "@commons/store/labels";
  import { FolderStore } from "@commons/store/folders";

  import TrashIcon from "../assets/trash-alt.svg";
  import MarkReadIcon from "../assets/envelope-open-text.svg";
  import MarkUnreadIcon from "../assets/envelope.svg";
  import AttachmentIcon from "../assets/attachment.svg";
  import LeftArrowLineIcon from "../assets/arrow-line.svg";
  import NoMessagesIcon from "../assets/no-messages.svg";
  import DraftIcon from "../assets/draft.svg";

  import "./Message.svelte";

  const dispatchEvent = getEventDispatcher(get_current_component());

  export let id: string = "";
  export let access_token: string = "";

  export let thread: Thread;
  export let thread_id: string;

  export let clean_conversation: boolean;
  export let click_action: "default" | "mailbox" | "custom" = "default";
  export let message_id: string;
  export let message: Message;
  export let show_contact_avatar: boolean;
  export let show_expanded_email_view_onload: boolean;
  export let show_number_of_messages: boolean;
  export let show_received_timestamp: boolean;
  export let show_star: boolean;
  export let show_thread_actions: boolean;
  export let theme: string;
  export let you: Partial<Account>;
  export let show_reply: boolean;
  export let show_reply_all: boolean;

  const defaultValueMap: Partial<EmailProperties> = {
    clean_conversation: false,
    click_action: "default",
    message_id: "",
    show_contact_avatar: true,
    show_expanded_email_view_onload: false,
    show_number_of_messages: true,
    show_received_timestamp: true,
    show_star: false,
    show_thread_actions: false,
    theme: "theme-1",
    thread_id: "",
    you: {},
    show_reply: false,
    show_reply_all: false,
  };

  let threadElement;
  let mounted: boolean = false;
  let _this = <EmailProperties>buildInternalProps({}, {}, defaultValueMap);

  let messageRefs: Record<string, Element> = {};
  let attachedFiles: Record<string, File[]> = {};
  let contact_query: ContactSearchQuery;
  let contacts: Record<string, Contact> = {};
  let activeThreadContact = {};
  let userEmail: string | undefined;
  let emailManuallyPassed: boolean;
  let query: ConversationQuery;
  let labels: Label[] = [];
  let folders: Folder[] = [];
  let currentTooltipId: string = "";

  onMount(async () => {
    await tick();

    _this = buildInternalProps($$props, {}, defaultValueMap) as EmailProperties;

    // console.log("thread props", $$props);
    // console.log("thread _this", _this);

    if (id && !_this.you?.id && !emailManuallyPassed) {
      _this.you = await fetchAccount({
        component_id: query.component_id,
        access_token,
      });
      userEmail = <string>_this.you?.email_address;
      // Initialize labels / folders
      const accountOrganizationUnitQuery = {
        component_id: id,
        access_token,
      };
      if (_this.you?.organization_unit === AccountOrganizationUnit.Label) {
        labels = await LabelStore.getLabels(accountOrganizationUnitQuery);
      } else if (
        _this.you?.organization_unit === AccountOrganizationUnit.Folder
      ) {
        folders = await FolderStore.getFolders(accountOrganizationUnitQuery);
      }
    }

    mounted = true;
  });

  function showFirstFromParticipant(
    messages: Message[],
    participants: Participant[],
  ) {
    return (
      messages &&
      participants &&
      messages.length > 0 &&
      messages[messages.length - 1]?.from.length
    );
  }

  function showSecondFromParticipant(
    messages: Message[],
    participants: Participant[],
  ) {
    return (
      messages &&
      participants &&
      messages.length > 1 &&
      participants.length >= 2 &&
      messages[0]?.from.length &&
      participants[0].email !== messages[messages.length - 1]?.from[0].email
    );
  }

  function initializeAttachedFiles() {
    if (!thread?.messages || thread.messages?.length == 0) {
      return;
    }

    attachedFiles = thread.messages?.reduce(
      (files: Record<string, File[]>, message) => {
        for (const [fileIndex, file] of message.files.entries()) {
          if (
            file.content_disposition === "attachment" &&
            !(
              file.content_id && InlineImageTypes.includes(file.content_type)
            ) && // treat all files with content_id as inline
            !DisallowedContentTypes.includes(file.content_type)
          ) {
            if (!files[message.id]) {
              files[message.id] = [];
            }
            files[message.id].push(message.files[fileIndex]);
          }
        }
        return files;
      },
      {},
    );
  }

  function isThreadADraftEmail(currentThread: Thread): boolean {
    if (
      currentThread &&
      currentThread.labels?.find((label) => label.name === "drafts")
    ) {
      return true;
    }

    return false;
  }

  /*
    Fetches contact for ContactImage component
  */
  async function getContact(account: any) {
    contact_query["query"] = `?email=${account.email}`;
    if (id) {
      let contact = $ContactStore[JSON.stringify(contact_query)];
      if (!contact) {
        contact = await ContactStore.addContact(contact_query);
      }
      return contact[0] ?? account;
    } else {
      return account;
    }
  }

  async function downloadSelectedFile(event: MouseEvent, file: File) {
    event.stopImmediatePropagation();
    if (id && ((thread && _this.thread_id) || _this.message_id)) {
      const downloadedFileData = await downloadFile({
        file_id: file.id,
        component_id: id,
        access_token,
      });
      downloadAttachedFile(downloadedFileData, file);
    }
    dispatchEvent("downloadClicked", {
      event,
      thread,
      file,
    });
  }

  function setTooltip(event: any) {
    currentTooltipId = event.detail.tooltipID;
  }

  $: query = {
    access_token,
    component_id: id,
    thread_id: _this.thread_id,
  };

  $: {
    console.log("reactin messageRefs");
    Object.keys(messageRefs).forEach((messageId) => {
      Object.keys(_this).forEach((property) => {
        console.log(messageId, property);
        messageRefs[messageId][property] = _this[property];
      });

      messageRefs[messageId].message = thread.messages?.find(
        (m) => m.id === messageId,
      );
    });
  }

  $: thread ? initializeAttachedFiles() : "";

  $: emailManuallyPassed = !!_this.thread;

  $: contact_query = {
    component_id: id,
    access_token,
    query: "",
  };

  $: activeThreadContact =
    thread && thread.messages && contacts
      ? contacts[thread.messages[thread.messages.length - 1]?.from[0].email]
      : {};

  $: trashLabelID =
    labels && labels.length
      ? labels.find((label) => label.name === "trash")?.id
      : null;

  $: trashFolderID =
    folders && folders.length
      ? folders.find((folder) => folder.name === "trash")?.id
      : null;

  // function fetchIndividualMessage(
  //   msgIndex: number,
  //   messageID: string,
  // ): Promise<string | null> {
  //   if (id) {
  //     messageLoadStatus[msgIndex] = "loading";
  //     return fetchMessage(query, messageID).then(async (json) => {
  //       messageLoadStatus[msgIndex] = "loaded";
  //       if (FilesStore.hasInlineFiles(json)) {
  //         const messageWithInlineFiles = await getMessageWithInlineFiles(json);
  //         return messageWithInlineFiles.body;
  //       }
  //       return json.body;
  //     });
  //   }
  //   return new Promise(() => null);
  // }

  async function handleThread(event: MouseEvent | KeyboardEvent) {
    if (!thread.messages || thread.messages.length <= 0) {
      return;
    }

    if (_this.click_action === "default" || _this.click_action === "mailbox") {
      console.log("a");
      //#region read/unread
      if (thread && thread.unread && _this.click_action !== "mailbox") {
        thread.unread = !thread.unread;
        console.log("b");
        // await saveActiveThread();
      }
      //#endregion read/unread

      const lastMsgIndex = thread.messages.length - 1;
      thread.messages[lastMsgIndex].expanded =
        !thread.messages[lastMsgIndex].expanded;

      if (!emailManuallyPassed) {
        console.log("c");
        // fetch last message
        if (!thread.messages[lastMsgIndex].body) {
          console.log("d");
          // thread.messages[lastMsgIndex].body = await fetchIndividualMessage(
          //   lastMsgIndex,
          //   thread.messages[lastMsgIndex].id,
          // );
        }
      }

      //#region open thread + messages
      thread.expanded = !thread.expanded;
      // Upon expansion / lastMessage existing, scroll to it
      if (thread.expanded && _this.click_action === "default") {
        console.log("e");
        // Timeout here is to ensure the element is available before trying
        // to scroll it into view
        setTimeout(() => {
          console.log("last message id", thread.messages[lastMsgIndex].id);
          messageRefs[thread.messages[lastMsgIndex].id].scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 50);
      }
      //#endregion open thread + messages
    }
    dispatchEvent("threadClicked", {
      event,
      thread: thread,
    });
    currentTooltipId = "";
  }

  function handleThreadClick(event: MouseEvent) {
    if (
      (_this.message && (!_this.thread_id || !_this.thread)) ||
      (_this.click_action === "mailbox" && thread.expanded)
    ) {
      return;
    }
    event.preventDefault();
    handleThread(event);
  }

  function handleThreadKeypress(event: KeyboardEvent) {
    if (
      (_this.message && (!_this.thread_id || !_this.thread)) ||
      (_this.click_action === "mailbox" && thread.expanded)
    ) {
      return;
    }
    event.preventDefault();
    if (event.code === "Enter") {
      handleThread(event);
    }
  }

  function handleEmailClick(
    e: MouseEvent & { currentTarget: EventTarget & HTMLDivElement },
    msgIndex: number,
  ): any {
    throw new Error("Function not implemented.");
  }

  function handleEmailKeypress(
    e: KeyboardEvent & { currentTarget: EventTarget & HTMLDivElement },
    msgIndex: number,
  ): any {
    throw new Error("Function not implemented.");
  }

  function handleReplyClick(
    e: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement },
    arg1: string,
    msgIndex: number,
  ): any {
    throw new Error("Function not implemented.");
  }

  function canReplyAll(message: Message) {
    throw new Error("Function not implemented.");
  }

  function returnToMailbox(event: MouseEvent | KeyboardEvent) {
    throw new Error("Function not implemented.");
  }

  function handleThreadStarClick() {
    throw new Error("Function not implemented.");
  }
  function deleteEmail(event: MouseEvent) {
    throw new Error("Function not implemented.");
  }
  function toggleUnreadStatus() {
    throw new Error("Function not implemented.");
  }
  function handleDownloadFromMessage() {
    throw new Error("Function not implemented.");
  }
</script>

<style lang="scss">
  @use "sass:list";
  @import "../../../theming/reset.scss";
  @import "../../../theming/animation.scss";
  @import "../../../theming/variables.scss";

  @import "../Email.scss";
</style>

{#if thread}
  <article
    class="nylas-thread"
    tabindex="0"
    bind:this={threadElement}
    on:click={handleThreadClick}
    on:keypress={handleThreadKeypress}
  >
    {#if thread.expanded}
      <div
        class="email-row expanded {_this.click_action === 'mailbox'
          ? 'expanded-mailbox-thread'
          : ''}"
      >
        <header
          class="subject-title"
          class:mailbox={_this.click_action === "mailbox"}
        >
          <div>
            {#if _this.click_action === "mailbox"}
              <button
                title={"Return to Mailbox"}
                aria-label={"Return to Mailbox"}
                on:click|stopPropagation={returnToMailbox}
              >
                <LeftArrowLineIcon />
              </button>
            {/if}
            <h1>{thread?.subject}</h1>
          </div>
          <div role="toolbar">
            {#if _this.show_star}
              <div class="starred">
                <button
                  class={thread.starred ? "starred" : ""}
                  title={thread.starred ? "Unstar thread" : "Star thread"}
                  aria-label={thread.starred ? "Unstar thread" : "Star thread"}
                  role="switch"
                  aria-checked={thread.starred}
                  on:click|stopPropagation={handleThreadStarClick}
                />
              </div>
            {/if}
            {#if _this.show_thread_actions}
              <div class="delete">
                <button
                  title="Delete thread / Move to trash"
                  aria-label="Delete thread (Move to trash)"
                  on:click|stopPropagation={(e) => deleteEmail(e)}
                >
                  <TrashIcon />
                </button>
              </div>
              <div class="read-status">
                <button
                  title={`Mark thread as ${thread.unread ? "" : "un"}read`}
                  aria-label={`Mark thread as ${thread.unread ? "" : "un"}read`}
                  on:click|stopPropagation={toggleUnreadStatus}
                >
                  {#if thread.unread}
                    <MarkReadIcon aria-hidden="true" />
                  {:else}
                    <MarkUnreadIcon aria-hidden="true" />
                  {/if}
                </button>
              </div>
            {/if}
          </div>
        </header>
        <section>
          {#if thread.messages && thread.messages.length}
            {#each thread.messages as message, msgIndex}
              <nylas-message
                class:last-message={msgIndex === thread.messages.length - 1}
                class={`individual-message ${
                  msgIndex === thread.messages.length - 1 || message.expanded
                    ? "expanded"
                    : "condensed"
                }`}
                bind:this={messageRefs[message.id]}
              />
            {/each}
          {:else}
            <span class="snippet">{thread.snippet}</span>
          {/if}
        </section>
      </div>
    {:else}
      <div
        class="email-row condensed"
        class:show_star={_this.show_star}
        class:unread={thread.unread}
        class:disable-click={thread &&
          thread.messages &&
          thread.messages.length <= 0}
      >
        {#if thread && thread.messages && thread.messages.length <= 0}
          {#await isThreadADraftEmail(thread) then isDraft}
            <div
              class={`no-message-avatar-container ${
                _this.show_star ? "show-star" : ""
              }`}
            >
              <div class="default-avatar" class:draft={isDraft}>
                {#if isDraft}
                  <DraftIcon />
                {:else}
                  <NoMessagesIcon />
                {/if}
              </div>
            </div>
            <div class="no-messages-warning-container" class:draft={isDraft}>
              {isDraft
                ? `This is a draft email.`
                : `Sorry, looks like this thread is currently unavailable. It may
          have been deleted in your provider inbox.`}
            </div>
          {/await}
        {:else if thread && thread.messages && thread.messages.length > 0}
          <div class="from{_this.show_star ? '-star' : ''}">
            {#if _this.show_star}
              <div class="starred">
                <button
                  id={`thread-star-${_this.thread_id}`}
                  class={thread.starred ? "starred" : ""}
                  value={_this.thread_id}
                  role="switch"
                  aria-checked={thread.starred}
                  on:click|preventDefault={handleThreadStarClick}
                  aria-label={`Star button for thread ${_this.thread_id}`}
                />
              </div>
            {/if}
            <div class="from-message-count">
              {#if _this.show_contact_avatar}
                <div class="default-avatar">
                  <nylas-contact-image
                    {contact_query}
                    contact={activeThreadContact}
                  />
                </div>
              {/if}
              <div class="from-participants">
                <div
                  class="participants-name"
                  class:condensed={showSecondFromParticipant(
                    thread.messages,
                    thread.participants,
                  )}
                >
                  {#if showFirstFromParticipant(thread.messages, thread.participants)}
                    <span class="from-sub-section">
                      {thread.messages[thread.messages.length - 1]?.from[0]
                        .name ||
                        thread.messages[thread.messages.length - 1]?.from[0]
                          .email}
                    </span>
                  {/if}
                  {#if showSecondFromParticipant(thread.messages, thread.participants)}
                    <span class="from-sub-section second"
                      >, {thread.participants[0].name ||
                        thread.participants[0].email}
                    </span>
                  {/if}
                </div>
                <div class="participants-count">
                  {#if showSecondFromParticipant(thread.messages, thread.participants)}
                    <!-- If it is mobile, we only show 1 participant (latest from message), hence -1 -->
                    {#if thread.participants.length >= 2}
                      <!-- svelte-ignore missing-declaration -->
                      <span class="show-on-mobile">
                        &nbsp;&plus;{thread.participants.length -
                          MAX_MOBILE_PARTICIPANTS}
                      </span>
                    {/if}
                    <!-- If it is desktop, we only show upto 2 participants (latest from message), hence -2. 
            Note that this might not be exactly correct if the name of the first participant is too long 
            and occupies entire width -->
                    {#if thread.participants.length > 2}
                      <span class="show-on-desktop">
                        &nbsp; &plus; {thread.participants.length -
                          MAX_DESKTOP_PARTICIPANTS}
                      </span>
                    {/if}
                  {/if}
                </div>
              </div>
              {#if _this.show_number_of_messages && thread?.messages?.length > 0}
                <span class="thread-message-count">
                  {thread.messages.length}
                </span>
              {/if}
            </div>
          </div>
          <div class="subject-snippet-date">
            <div class="snippet-attachment-container">
              <div class="desktop-subject-snippet">
                <span class="subject">{thread?.subject}</span>
                <span class="snippet">
                  {thread.snippet}
                </span>
              </div>
              {#if Object.keys(attachedFiles).length > 0}
                <div class="attachment desktop">
                  {#each Object.values(attachedFiles) as files}
                    {#each files as file}
                      <button
                        on:click={(event) => downloadSelectedFile(event, file)}
                      >
                        {file.filename || file.id}
                      </button>
                    {/each}
                  {/each}
                </div>
              {/if}
            </div>
            <div
              class:date={_this.show_received_timestamp}
              class:action-icons={_this.show_thread_actions}
            >
              {#if thread.has_attachments && Object.keys(attachedFiles).length > 0}
                <span><AttachmentIcon /></span>
              {/if}
              {#if _this.show_thread_actions}
                <div class="delete">
                  <button
                    title="Delete thread"
                    aria-label="Delete thread"
                    on:click|stopPropagation={deleteEmail}
                  >
                    <TrashIcon />
                  </button>
                </div>
                <div class="read-status">
                  <button
                    title={`Mark thread as ${thread.unread ? "" : "un"}read`}
                    aria-label={`Mark thread as ${
                      thread.unread ? "" : "un"
                    }read`}
                    on:click|stopPropagation={toggleUnreadStatus}
                  >
                    {#if thread.unread}
                      <MarkReadIcon aria-hidden="true" />
                    {:else}
                      <MarkUnreadIcon aria-hidden="true" />
                    {/if}
                  </button>
                </div>
              {:else if _this.show_received_timestamp}
                <span>
                  {formatPreviewDate(
                    new Date(thread.last_message_timestamp * 1000),
                  )}
                </span>
              {/if}
            </div>
          </div>

          <div class="mobile-subject-snippet">
            <span class="subject">{thread?.subject}</span>
            <span class="snippet">
              {thread.snippet}
            </span>
            {#if Object.keys(attachedFiles).length > 0}
              <div class="attachment mobile">
                {#each Object.values(attachedFiles) as files}
                  {#each files as file}
                    <button
                      on:click={(event) => downloadSelectedFile(event, file)}
                    >
                      {file.filename || file.id}
                    </button>
                  {/each}
                {/each}
              </div>
            {/if}
          </div>
        {/if}
      </div>
    {/if}
  </article>
{/if}
