<svelte:options tag="nylas-email" />

<script lang="ts">
  import {
    EmailStore,
    ErrorStore,
    ManifestStore,
    fetchAccount,
    updateThread,
    fetchMessage,
    fetchEmail,
    ContactStore,
    fetchCleanConversations,
    fetchThread,
    silence,
    FilesStore,
  } from "@commons";
  import type { Contact, ContactSearchQuery } from "@commons/types/Contacts";
  import { get_current_component, onMount, tick } from "svelte/internal";
  import {
    buildInternalProps,
    downloadAttachedFile,
    getEventDispatcher,
  } from "@commons/methods/component";
  import DropdownSymbol from "./assets/chevron-down.svg";
  import TrashIcon from "./assets/trash-alt.svg";
  import MarkReadIcon from "./assets/envelope-open-text.svg";
  import MarkUnreadIcon from "./assets/envelope.svg";
  import AttachmentIcon from "./assets/attachment.svg";
  import LeftArrowLineIcon from "./assets/arrow-line.svg";
  import NoMessagesIcon from "./assets/no-messages.svg";
  import DraftIcon from "./assets/draft.svg";
  import type {
    EmailProperties,
    Participant,
    ConversationQuery,
    Conversation,
    Thread,
    Message,
    Account,
    Label,
    Folder,
    File,
    ThreadProperties,
  } from "@commons/types/Nylas";
  import "@commons/components/ContactImage/ContactImage.svelte";
  import "@commons/components/MessageBody.svelte";
  import "@commons/components/Tooltip.svelte";
  import { AccountOrganizationUnit } from "@commons/enums/Nylas";
  import { LabelStore } from "@commons/store/labels";
  import { FolderStore } from "@commons/store/folders";
  import * as DOMPurify from "dompurify";
  import LoadingIcon from "./assets/loading.svg";
  import { downloadFile } from "@commons/connections/files";
  import ReplyIcon from "./assets/reply.svg";
  import ReplyAllIcon from "./assets/reply-all.svg";
  import {
    DisallowedContentTypes,
    InlineImageTypes,
  } from "@commons/constants/attachment-content-types";
  import {
    formatExpandedDate,
    formatPreviewDate,
  } from "@commons/methods/datetime";
  import "./components/Thread.svelte";

  const dispatchEvent = getEventDispatcher(get_current_component());
  $: dispatchEvent("manifestLoaded", manifest);

  $: if (Object.keys($ErrorStore).length) {
    dispatchEvent("onError", $ErrorStore);
  }

  export let id: string = "";
  export let access_token: string = "";

  // export let messages: Message[] = [];
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
  export let thread_id: string;
  export let thread: Thread;
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

  let manifest: Partial<EmailProperties> = {};
  let _this = <EmailProperties>buildInternalProps({}, {}, defaultValueMap);

  let userEmail: string | undefined;
  const PARTICIPANTS_TO_TRUNCATE = 3;

  onMount(async () => {
    await tick();
    manifest = ((await $ManifestStore[
      JSON.stringify({ component_id: id, access_token })
    ]) || {}) as EmailProperties;

    _this = buildInternalProps(
      $$props,
      manifest,
      defaultValueMap,
    ) as EmailProperties;

    transformPropertyValues();

    // Fetch Account
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
  });

  let previousProps = $$props;
  $: (async () => {
    if (JSON.stringify(previousProps) !== JSON.stringify($$props)) {
      _this = buildInternalProps(
        $$props,
        manifest,
        defaultValueMap,
      ) as EmailProperties;

      await transformPropertyValues();
      previousProps = $$props;
    }
  })();

  async function transformPropertyValues() {
    _this.thread_id = !thread && !message_id && !message ? _this.thread_id : "";

    if (id && !_this.thread_id && !_this.thread && _this.message_id) {
      fetchOneMessage();
    }

    if (!activeThread || previousProps.thread_id !== _this.thread_id) {
      await getThread();
    }
  }

  let contacts: Record<string, Contact> = {};
  let activeThreadContact = {};

  $: activeThreadContact =
    activeThread && contacts
      ? contacts[
          activeThread.messages[activeThread.messages.length - 1]?.from[0].email
        ]
      : {};
  $: activeMessageContact =
    _this.message && contacts ? contacts[_this.message?.from[0].email] : {};

  let threadIdChanged = false;
  $: _this.thread_id, (threadIdChanged = true);

  $: (async () => {
    if (threadIdChanged || !contacts) {
      threadIdChanged = false;
      if (thread && thread.messages) {
        await getThreadContacts(thread);
      } else if (activeThread) {
        await getThreadContacts(activeThread);
      } else if (_this.message) {
        const participant = _this.message.from[0];
        contacts[participant.email] = await getContact(participant);
      }
    }
  })();

  async function getThreadContacts(thread: Thread) {
    const fromParticipants =
      thread.messages?.reduce<Record<string, Participant>>(
        (participants, message) => {
          const participant: Participant = message.from[0];
          participants[participant.email] = participant;
          return participants;
        },
        {},
      ) || {};
    const fromParticipantsArray =
      Array.from(Object.values(fromParticipants)) || [];

    for (const participant of fromParticipantsArray) {
      const participantEmail = participant.email;
      if (!contacts[participantEmail] && participantEmail) {
        contacts[participantEmail] = await getContact(participant);
      }
    }
  }

  let main: Element;
  let messageRefs: Element[] = [];
  let messageLoadStatus: string[] = []; // "loading" | "loaded"
  const MAX_DESKTOP_PARTICIPANTS = 2;
  const MAX_MOBILE_PARTICIPANTS = 1;

  // #region initialize label and folder vars (for trash)
  let labels: Label[] = [];
  $: trashLabelID =
    labels && labels.length
      ? labels.find((label) => label.name === "trash")?.id
      : null;

  let folders: Folder[] = [];
  $: trashFolderID =
    folders && folders.length
      ? folders.find((folder) => folder.name === "trash")?.id
      : null;
  // #endregion initialize label and folder vars (for trash)

  let participants: Participant[] = [];
  $: {
    participants = activeThread ? activeThread.participants : [];
  }
  let query: ConversationQuery;
  $: query = {
    access_token,
    component_id: id,
    thread_id: _this.thread_id,
  };

  let queryKey: string;
  $: queryKey = JSON.stringify(query);

  let activeThread: Conversation;
  let NylasThread: ThreadProperties;

  // #region thread intake and set
  let fetchingThreadPromise: Promise<Conversation>;
  async function getThread() {
    if (id && _this.thread_id && !fetchingThreadPromise) {
      fetchingThreadPromise = <Promise<Conversation>>fetchThread({
        component_id: id,
        thread_id: _this.thread_id,
        access_token,
      }).catch(silence);
      const thread = await fetchingThreadPromise;
      fetchingThreadPromise = <any>null;

      // get body for last message in open thread
      if (thread?.messages?.length > 0) {
        const lastMsgIndex = thread.messages.length - 1;
        thread.messages[lastMsgIndex].body = await fetchIndividualMessage(
          lastMsgIndex,
          thread.messages[lastMsgIndex].id,
        );
      }
      if (thread) {
        thread.expanded =
          activeThread?.expanded ?? _this.show_expanded_email_view_onload;
        activeThread = thread;
      }
    }
  }

  $: {
    if (_this.thread && _this.thread.id) {
      // Is it in the store already? (via <nylas-mailbox>, for example)
      const localThread = ($EmailStore[queryKey]?.find(
        (storedThread: Thread) =>
          storedThread && storedThread.id === thread?.id,
      ) ?? _this.thread) as Conversation;

      // This is for Email component demo purpose, where we want to show expanded threads by default on load.
      if (_this.show_expanded_email_view_onload) {
        localThread.expanded = _this.show_expanded_email_view_onload;

        // get body for last message in open thread
        const lastMsg = localThread.messages[localThread.messages.length - 1];
        lastMsg.body = lastMsg.body ?? lastMsg.snippet;
      }
      activeThread = localThread;
    }
  }

  $: {
    if (NylasThread) {
      console.log({ activeThread });
      Object.keys(_this).forEach((k) => (NylasThread[k] = _this[k]));
      NylasThread.thread = activeThread;
      // NylasThread
    }
  }
  // #endregion thread intake and set
  let emailManuallyPassed: boolean;
  $: emailManuallyPassed = !!_this.thread;

  //#region Clean Conversation
  // If a user sets message_body_type to "clean", expand their message to clean conversation.
  // This requires them to have access to the Nylas Neural API.

  const CONVERSATION_ENDPOINT_MAX_MESSAGES = 20;

  function cleanConversation() {
    if (activeThread) {
      fetchCleanConversations({
        access_token,
        component_id: id,
        message_id: activeThread.messages
          .slice(-CONVERSATION_ENDPOINT_MAX_MESSAGES)
          .map((message) => message.id),
      }).then((results) => {
        results.forEach((msg: Message) => {
          let existingMessage = activeThread.messages.find(
            (message) => message.id === msg.id,
          );
          if (existingMessage) {
            existingMessage.conversation = msg.conversation;
          }
        });
        activeThread.messages = activeThread.messages;
      });
    } else if (_this.message) {
      fetchCleanConversations({
        component_id: id,
        message_id: [_this.message.id],
      }).then((results) => {
        results.forEach((msg: Message) => {
          if (_this.message) {
            _this.message.conversation = msg.conversation;
          }
        });
        activeThread.messages = activeThread.messages;
      });
    }
  }

  $: if (_this.clean_conversation && (_this.thread_id || _this.message_id)) {
    cleanConversation();
  }
  //#endregion Clean Conversation

  // #region get contact for ContactImage
  let contact_query: ContactSearchQuery;
  $: contact_query = {
    component_id: id,
    access_token,
    query: "",
  };

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
  // #endregion get contact for ContactImage

  async function saveActiveThread() {
    // if thread and if component_id (security)
    if (activeThread && query.component_id && _this.thread_id) {
      await updateThread(query, activeThread).catch(silence);
    }
  }

  async function handleThread(event: MouseEvent | KeyboardEvent) {
    if (activeThread.messages.length <= 0) {
      return;
    }
    if (_this.click_action === "default" || _this.click_action === "mailbox") {
      //#region read/unread
      if (
        activeThread &&
        activeThread.unread &&
        _this.click_action !== "mailbox"
      ) {
        activeThread.unread = !activeThread.unread;
        await saveActiveThread();
      }
      //#endregion read/unread

      const lastMsgIndex = activeThread.messages.length - 1;
      activeThread.messages[lastMsgIndex].expanded =
        !activeThread.messages[lastMsgIndex].expanded;

      if (!emailManuallyPassed) {
        // fetch last message
        if (!activeThread.messages[lastMsgIndex].body) {
          activeThread.messages[lastMsgIndex].body =
            await fetchIndividualMessage(
              lastMsgIndex,
              activeThread.messages[lastMsgIndex].id,
            );
        }
      }

      //#region open thread + messages
      activeThread.expanded = !activeThread.expanded;
      // Upon expansion / lastMessage existing, scroll to it
      if (activeThread.expanded && _this.click_action === "default") {
        // Timeout here is to ensure the element is available before trying
        // to scroll it into view
        setTimeout(() => {
          messageRefs[lastMsgIndex].scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 50);
      }
      //#endregion open thread + messages
    }
    dispatchEvent("threadClicked", {
      event,
      thread: activeThread,
    });
    currentTooltipId = "";
  }

  async function toggleUnreadStatus(event: MouseEvent | KeyboardEvent) {
    if (activeThread) {
      activeThread = { ...activeThread, unread: !activeThread.unread };
      await saveActiveThread();
      dispatchEvent("toggleThreadUnreadStatus", {
        event,
        thread: activeThread,
      });
      return;
    }
  }

  async function deleteEmail(event: MouseEvent) {
    if (_this.click_action !== "mailbox") {
      if (trashLabelID) {
        const existingLabelIds = activeThread.labels?.map((i) => i.id) || [];
        activeThread.label_ids = [...existingLabelIds, trashLabelID];
      } else if (trashFolderID) {
        activeThread.folder_id = trashFolderID;
      }
      await saveActiveThread();
    }
    dispatchEvent("threadDeleted", {
      event,
      thread: activeThread,
    });
  }

  function handleThreadClick(event: MouseEvent) {
    if (
      (_this.message && (!_this.thread_id || !_this.thread)) ||
      (_this.click_action === "mailbox" && activeThread.expanded)
    ) {
      return;
    }
    event.preventDefault();
    handleThread(event);
  }

  function returnToMailbox(event: MouseEvent | KeyboardEvent) {
    dispatchEvent("returnToMailbox", {
      event,
      thread: activeThread,
    });
  }

  function handleThreadKeypress(event: KeyboardEvent) {
    if (
      (_this.message && (!_this.thread_id || !_this.thread)) ||
      (_this.click_action === "mailbox" && activeThread.expanded)
    ) {
      return;
    }
    event.preventDefault();
    if (event.code === "Enter") {
      handleThread(event);
    }
  }

  async function handleThreadStarClick(event: MouseEvent) {
    event.stopImmediatePropagation();
    //#region starred/unstarred
    if (activeThread) {
      activeThread = { ...activeThread, starred: !activeThread.starred };
      await saveActiveThread();
    }
    //#endregion starred/unstarred

    dispatchEvent("threadStarred", {
      event,
      thread: activeThread,
    });
  }

  async function handleReplyClick(
    event: MouseEvent,
    type: "reply" | "reply_all",
    msgIndex: number,
  ) {
    event.stopImmediatePropagation();

    const currentMessage = activeThread.messages[msgIndex];

    const me: Participant = {
      name: _this.you.name,
      email: _this.you.email_address,
    };

    const subject = currentMessage.subject?.toLowerCase().startsWith("re:")
      ? currentMessage.subject
      : `Re: ${currentMessage.subject}`;

    const from = [me];

    const participantsWithoutMe = activeThread.participants.filter(
      (e) => e.email != me.email,
    );

    let event_identitfier;
    let to;

    /**
     * In Gmail, reply options are available on each message in thread.
     * There are a couple cases that need to be handled when the use clicks 'reply'
     * and there are multiple participants in an email thread. In some cases, participants
     * are add to the thread after messages have already been exchanged with out them.
     *
     *
     * 1. When the message is from the user, AND the message is to multiple participants of the thread
     *    then the default action is to reply to all participants and the reply_all button is not shown.
     * 2. When the message is from the user, AND the message is to a single participant of the thread
     *    then reply to only that participant.
     * 3. When the message is NOT from the user, then reply to the sender of the message
     */

    switch (type) {
      case "reply":
        event_identitfier = "replyClicked";
        if (isFromMe(currentMessage)) {
          if (currentMessage.to.length > 1) {
            to = participantsWithoutMe;
          } else {
            to = currentMessage.to;
          }
        } else {
          to = currentMessage.from;
        }
        break;

      case "reply_all":
        event_identitfier = "replyAllClicked";
        to = participantsWithoutMe;
        break;
    }

    const value = {
      reply_to_message_id: currentMessage.id,
      from: from,
      to: to,
      reply_to: from,
      subject: subject,
    };

    dispatchEvent(event_identitfier, {
      event,
      message: activeThread.messages[msgIndex],
      thread: activeThread,
      value,
    });
  }

  function isFromMe(message: Message): boolean {
    if (!_this.you.email_address) {
      return false;
    }

    return message.from
      .map((f) => {
        return f.email.toLowerCase();
      })
      .includes(_this.you.email_address?.toLowerCase());
  }

  function canReplyAll(message: Message): boolean {
    return message?.to?.length > 1 && !isFromMe(message);
  }

  function handleEmailClick(event: MouseEvent, msgIndex: number) {
    event.stopImmediatePropagation();

    if (msgIndex === activeThread.messages.length - 1) {
      doNothing(event);
    } else {
      activeThread.messages[msgIndex].expanded =
        !activeThread.messages[msgIndex].expanded;
      dispatchEvent("messageClicked", {
        event,
        message: activeThread.messages[msgIndex],
        thread: activeThread,
      });
      // Don't fetch message when thread is being passed manually
      if (!_this.thread) {
        fetchIndividualMessage(
          msgIndex,
          activeThread.messages[msgIndex].id,
        ).then((res) => {
          activeThread.messages[msgIndex].body = res;
        });
      }
    }
  }

  function handleEmailKeypress(event: KeyboardEvent, msgIndex: number) {
    event.stopImmediatePropagation();
    if (event.code === "Enter") {
      if (msgIndex === activeThread.messages.length - 1) {
        doNothing(event);
      } else {
        activeThread.messages[msgIndex].expanded =
          !activeThread.messages[msgIndex].expanded;
      }
    }
  }

  function fetchIndividualMessage(
    msgIndex: number,
    messageID: string,
  ): Promise<string | null> {
    if (id) {
      messageLoadStatus[msgIndex] = "loading";
      return fetchMessage(query, messageID).then(async (json) => {
        messageLoadStatus[msgIndex] = "loaded";
        if (FilesStore.hasInlineFiles(json)) {
          const messageWithInlineFiles = await getMessageWithInlineFiles(json);
          return messageWithInlineFiles.body;
        }
        return json.body;
      });
    }
    return new Promise(() => null);
  }

  function doNothing(e: MouseEvent | KeyboardEvent) {
    e.stopImmediatePropagation();
  }

  // For cases when someone wants to show just a single email message, rather than the full thread.
  function fetchOneMessage() {
    fetchEmail({
      access_token,
      component_id: id,
      message_id: _this.message_id,
    }).then(async (json) => {
      _this.message = json;
      messageLoadStatus[0] = "loaded";
      if (FilesStore.hasInlineFiles(_this.message)) {
        const message = await getMessageWithInlineFiles(_this.message);
        _this.message = message;
      }
    });
  }

  let currentTooltipId: string = "";
  function setTooltip(event: any) {
    currentTooltipId = event.detail.tooltipID;
  }

  function showFirstFromParticipant(messages: Message[]) {
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

  let attachedFiles: Record<string, File[]> = {};

  $: activeThread ? initializeAttachedFiles() : "";

  function initializeAttachedFiles() {
    attachedFiles = activeThread.messages?.reduce(
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

  async function downloadSelectedFile(event: MouseEvent, file: File) {
    event.stopImmediatePropagation();
    if (id && ((activeThread && _this.thread_id) || _this.message_id)) {
      const downloadedFileData = await downloadFile({
        file_id: file.id,
        component_id: id,
        access_token,
      });
      downloadAttachedFile(downloadedFileData, file);
    }
    dispatchEvent("downloadClicked", {
      event,
      thread: activeThread,
      file,
    });
  }

  async function handleDownloadFromMessage(event: MouseEvent) {
    const file = (<any>event.detail).file;
    downloadSelectedFile(event, file);
  }

  function isThreadADraftEmail(currentThread: Thread): boolean {
    return (
      currentThread &&
      currentThread.labels?.find((label) => label.name === "drafts")
    );
  }
</script>

<style lang="scss">
  @use "sass:list";
  @import "../../theming/reset.scss";
  @import "../../theming/animation.scss";
  @import "../../theming/variables.scss";

  @import "./Email.scss";
</style>

<nylas-error {id} />

<main class="nylas-email" bind:this={main} tabindex="0">
  {#if _this.thread || _this.thread_id}
    {#await activeThread}
      Loading...
    {:then thread}
      {#if thread && activeThread}
        <nylas-thread bind:this={NylasThread} />
      {/if}
    {/await}
  {:else if _this.message}
    {#if Object.keys(_this.message).length > 0}
      <div class="email-row expanded singular">
        <header>{_this.message?.subject}</header>
        <div class="individual-message expanded">
          <div class="message-head">
            <div class="message-from-to">
              <div class="avatar-from">
                {#if _this.show_contact_avatar}
                  <div class="default-avatar">
                    <nylas-contact-image
                      {contact_query}
                      contact={activeMessageContact}
                    />
                  </div>
                {/if}
                <div class="message-from">
                  <span class="name"
                    >{userEmail && _this.message?.from[0].email === userEmail
                      ? "me"
                      : _this.message?.from[0]?.name ||
                        _this.message?.from[0]?.email}</span
                  >
                  <!-- tooltip component -->
                  <nylas-tooltip
                    on:toggleTooltip={setTooltip}
                    id={_this.message?.id}
                    current_tooltip_id={currentTooltipId}
                    icon={DropdownSymbol}
                    content={_this.message?.from[0].email}
                  />
                </div>
              </div>

              <div class="message-to">
                {#each _this.message?.to.slice(0, PARTICIPANTS_TO_TRUNCATE) as to, i}
                  <div>
                    <span>
                      {i === 0 ? "to " : ""}
                      {#if _this.you && to?.email === _this.you.email_address}
                        Me
                      {/if}
                      {#if to.email && to.name}
                        {to.name ?? _this.you.name} &lt;{to.email}&gt;
                      {:else if to.email && !to.name}
                        {to.email}
                      {/if}
                    </span>
                  </div>
                {/each}
                {#if _this.message.to?.length > PARTICIPANTS_TO_TRUNCATE}
                  <div>
                    <nylas-tooltip
                      on:toggleTooltip={setTooltip}
                      id={`show-more-participants-${_this.message.id}`}
                      current_tooltip_id={currentTooltipId}
                      icon={DropdownSymbol}
                      text={`And ${
                        _this.message.to?.length - PARTICIPANTS_TO_TRUNCATE
                      } more`}
                      content={`${_this.message.to
                        .map((to) => `${to.name} ${to.email}`)
                        .join(", ")}`}
                    />
                  </div>
                {/if}
              </div>
            </div>
            {#if _this.show_received_timestamp}
              <div class="message-date">
                <span>
                  {formatPreviewDate(new Date(_this.message.date * 1000))}
                </span>
              </div>
            {/if}
          </div>
          <div class="message-body">
            {#if _this.clean_conversation && _this.message.conversation}
              {@html DOMPurify.sanitize(_this.message?.conversation ?? "")}
            {:else if _this.message}
              <nylas-message-body
                message={_this.message}
                body={_this.message.body}
                on:downloadClicked={handleDownloadFromMessage}
              />
            {/if}
          </div>
        </div>
      </div>
    {/if}
  {/if}
</main>
