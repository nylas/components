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
  import { buildParticipants, includesMyEmail } from "./methods/participants";
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
  } from "@commons/types/Nylas";
  import "@commons/components/ContactImage/ContactImage.svelte";
  import "@commons/components/MessageBody.svelte";
  import "@commons/components/Tooltip.svelte";
  import { AccountOrganizationUnit, MessageType } from "@commons/enums/Nylas";
  import { LabelStore } from "@commons/store/labels";
  import { FolderStore } from "@commons/store/folders";
  import * as DOMPurify from "dompurify";
  import LoadingIcon from "./assets/loading.svg";
  import { downloadFile } from "@commons/connections/files";
  import ReplyIcon from "./assets/reply.svg";
  import ReplyAllIcon from "./assets/reply-all.svg";
  import ForwardIcon from "./assets/forward.svg";
  import {
    DisallowedContentTypes,
    InlineImageTypes,
  } from "@commons/constants/attachment-content-types";

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
  export let show_forward: boolean;

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
    const messageType = getMessageType(activeThread);

    if (activeThread[messageType].length <= 0) {
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

      if (!emailManuallyPassed && messageType !== MessageType.DRAFTS) {
        const { messages } = activeThread;
        const lastMsgIndex = messages.length - 1;
        messages[lastMsgIndex].expanded = !messages[lastMsgIndex].expanded;

        // fetch last message
        if (!messages[lastMsgIndex].body) {
          messages[lastMsgIndex].body = await fetchIndividualMessage(
            lastMsgIndex,
            messages[lastMsgIndex].id,
          );
        }
      }

      //#region open thread + messages
      if (messageType !== MessageType.DRAFTS) {
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
      }
      //#endregion open thread + messages
    }

    dispatchEvent("threadClicked", {
      event,
      thread: activeThread,
      messageType,
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
    message: Message,
    type: "reply" | "reply_all",
  ) {
    event.stopImmediatePropagation();

    const me: Participant = {
      name: _this.you.name,
      email: _this.you.email_address,
    };

    const subject = message.subject?.toLowerCase().startsWith("re:")
      ? message.subject
      : `Re: ${message.subject}`;

    const from = [me];
    const { to, cc } = buildParticipants({
      myEmail: me.email,
      message: message,
      type,
    });

    let event_identifier;

    switch (type) {
      case "reply":
        event_identifier = "replyClicked";
        break;

      case "reply_all":
        event_identifier = "replyAllClicked";
        break;
    }

    const value = {
      reply_to_message_id: message.id,
      from,
      to,
      reply_to: from,
      cc,
      bcc: message.bcc,
      subject: subject,
    };

    dispatchEvent(event_identifier, {
      event,
      message: message,
      thread: activeThread,
      value,
    });
  }

  async function handleForwardClick(event: CustomEvent, message: Message) {
    const subject = `Fwd: ${message.subject}`;
    const value = {
      reply_to_message_id: message.id,
      subject: subject,
      body: message.body,
    };
    dispatchEvent("forwardClicked", {
      event,
      message,
      thread: activeThread,
      value,
    });
  }

  function canReplyAll(message: Message): boolean {
    return (
      message?.to?.length + message?.cc?.length > 1 &&
      !includesMyEmail(_this.you.email_address, message, "from")
    );
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

  const weekdays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  function formatPreviewDate(date: Date): string {
    const today = new Date(new Date().setHours(0, 0, 0, 0));
    const yesterday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - 1,
      0,
      0,
      0,
      0,
    );
    const lastWeek = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - 6,
      0,
      0,
      0,
      0,
    );
    const thisYear = new Date(today.getFullYear(), 0, 1);

    if (date >= today) {
      return date.toLocaleTimeString("en-US", {
        hour12: true,
        hour: "numeric",
        minute: "2-digit",
      });
    } else if (date >= yesterday) {
      return "Yesterday";
    } else if (date >= lastWeek) {
      return weekdays[date.getDay()];
    } else if (date >= thisYear) {
      return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
      });
    } else {
      return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }
  }

  function formatExpandedDate(date: Date): string {
    return (
      date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "long",
        day: "numeric",
      }) +
      ", " +
      date.toLocaleTimeString("en-US", {
        hour12: true,
        hour: "numeric",
        minute: "2-digit",
      })
    );
  }

  let currentTooltipId: string = "";
  function setTooltip(event: any) {
    currentTooltipId = event.detail.tooltipID;
  }

  function showFromParticipants(
    messages: Message[],
    participants: Participant[],
  ) {
    let fromParticipants = messages[messages.length - 1]?.from;
    const hasFirstFromParticipant =
      messages &&
      participants &&
      messages.length > 0 &&
      fromParticipants.length;
    const hasMoreParticipants = showSecondFromParticipant(
      messages,
      participants,
    );
    let fromString = "";
    if (hasFirstFromParticipant) {
      fromString += fromParticipants[0].name || fromParticipants[0].email;
      if (hasMoreParticipants) {
        fromString += ", " + (participants[0].name || participants[0].email);
      }
    }
    return fromString;
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
      currentThread.labels?.some((label) => label.name === MessageType.DRAFTS)
    );
  }

  let messagesContainerNode: HTMLElement | null = null;
  let latestMessageNode: HTMLElement | null = null;
  let scrolledToLatest = false;

  function storeMessagesContainer(node: HTMLElement) {
    messagesContainerNode = node;
  }

  function storeLatestMessageNode(
    node: HTMLElement,
    { msgIndex }: { msgIndex: number },
  ) {
    if (activeThread.messages.length - 1 === msgIndex) {
      latestMessageNode = node;
    }
  }

  $: if (messagesContainerNode && latestMessageNode && !scrolledToLatest) {
    // scroll if latest message is not already at the top
    if (latestMessageNode.offsetTop > 0) {
      messagesContainerNode.scrollTo({
        behavior: "smooth",
        top: latestMessageNode.offsetTop,
      });
      scrolledToLatest = true;
    }
  }

  function getMessageType(currentThread: Thread): string {
    return currentThread[MessageType.DRAFTS].length &&
      !currentThread[MessageType.MESSAGES].length
      ? MessageType.DRAFTS
      : MessageType.MESSAGES;
  }
</script>

<style lang="scss">
  @use "sass:list";
  @import "../../theming/reset.scss";
  @import "../../theming/animation.scss";
  @import "../../theming/variables.scss";
  @import "./styles/email.scss";

  $hover-outline-width: 2px;
  $collapsed-height: 56px;
  $mobile-collapsed-height: fit-content;
  $spacing-xs: 0.5rem;
  $spacing-s: 0.7rem;
  $spacing-m: 1rem;
  $spacing-l: 1.5rem;
  $spacing-xl: 2.5rem;

  main {
    height: 100%;
    width: 100%;
    position: relative;
    display: grid;
    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    .email-row {
      background: var(--nylas-email-background, var(--grey-lightest));
      border: var(--email-border-style, 1px solid var(--grey-lighter));

      nylas-tooltip {
        position: relative;
      }
      .default-avatar {
        background: var(--nylas-default-avatar-background, var(--blue));
        border-radius: 50%;
        color: var(--nylas-default-avatar-color, var(--white));
        font-family: sans-serif;
        font-size: 1rem;
        font-weight: bold;
        height: 31px;
        line-height: 35px;
        text-align: center;
        text-transform: uppercase;
        width: 32px;
      }
      header {
        font-size: 1.2rem;
        font-weight: 700;
        padding: $spacing-xs;
        padding-bottom: 0;
      }
      &.condensed {
        height: $mobile-collapsed-height;
        padding: $spacing-xs;
        flex-wrap: wrap;
        overflow: hidden;
        @include condensed-grid;
        &.disable-click {
          cursor: not-allowed;
          display: grid;
          align-items: flex-start;
          background: var(--grey-lighter);
        }
        .no-message-avatar-container {
          display: grid;
          &.show-star {
            margin-left: calc(
              25px + 0.5rem
            ); //to account for space occupied by star
          }
          .default-avatar {
            background: var(--red);
            display: flex;
            justify-content: center;
            align-items: center;

            &.draft {
              background: var(--blue);
            }
          }
        }
        .no-messages-warning-container {
          display: grid;
          color: var(--red);
          align-self: center;
          &.draft {
            color: var(--blue);
          }
        }
        .from-star {
          display: grid;
          grid-template-columns: 25px auto;
          column-gap: $spacing-xs;
        }
        .thread-message-count {
          color: var(--nylas-email-thread-message-count-color, var(--black));
          font-size: 12px;
          text-align: left;
        }
        .date {
          text-align: right;
        }
        &.unread {
          background: var(--nylas-email-unread-background, white);

          .from-message-count,
          .date,
          .subject {
            font-weight: 600;
            color: var(--nylas-email-subject-color, var(--black));

            .thread-message-count {
              color: var(
                --nylas-email-unread-thread-message-count-color,
                var(--blue)
              );
            }
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
            font-size: 1.1em;
            color: var(--nylas-email-unstarred-star-button-color, #8d94a5);
            -webkit-user-select: none;
            -moz-user-select: none;
            user-select: none;
          }

          &.starred:before {
            color: var(--nylas-email-star-button-color, #ffc107);
          }
          &:hover:before {
            color: var(--nylas-email-star-button-hover-color, #ffc107);
          }
        }
      }
      &.expanded {
        background: var(--nylas-email-body-background, var(--white));
        padding: 0;
        $outline-style: 1px solid var(--grey-lighter);
        @mixin barStyle {
          outline: $outline-style;
          display: flex;
          align-items: center;
          padding: 24px 16px;
          gap: 8px;
        }

        .email-loader {
          height: 3rem;
          display: flex;
          align-items: center;
          justify-content: center;

          .spinner {
            height: 18px;
            animation: rotate 2s linear infinite;
            margin-right: 10px;
          }
        }
        @keyframes rotate {
          to {
            transform: rotate(360deg);
          }
        }

        header {
          @include barStyle;
          border-radius: 4px 4px 0 0;
          font-weight: bold;
        }

        [role="toolbar"] {
          @include barStyle;
          padding: $spacing-s $spacing-m;
          gap: $spacing-m;
        }

        .message-head [role="toolbar"] {
          outline: none;
        }

        .message-head [role="toolbar"] button {
          background: none;
          outline: none;
          cursor: pointer;
        }

        .subject-title {
          justify-content: space-between;
          &.mailbox {
            cursor: default;
          }
          & > div {
            display: flex;
            align-items: center;
            gap: $spacing-m;

            button {
              background: none;
              display: flex;
              cursor: pointer;
            }
          }
          [role="toolbar"] {
            outline: none;
            button {
              * {
                width: 1em;
                height: 1em;
              }
            }
          }
        }

        .icon-container,
        .icon-container > * {
          pointer-events: none;
        }
        &.expanded-mailbox-thread {
          .message-from {
            .name {
              font-weight: 600;
            }
          }
        }
        div.individual-message {
          box-sizing: border-box;
          padding: $spacing-xs;

          div.message-body {
            overflow: auto;
            display: inline-flex;
            flex-direction: column;
            width: 100%;
            div.attachment {
              overflow-x: auto;
              button {
                margin: $spacing-xs;
                height: fit-content;
                padding: 0.3rem 1rem;
                border: 1px solid var(--grey);
                border-radius: 30px;
                background: white;
                cursor: pointer;
                &:hover {
                  background: var(--grey-light);
                }
              }
            }
          }

          &.condensed {
            div.snippet {
              text-overflow: ellipsis;
              overflow: hidden;
              display: block;
              max-width: inherit;
              color: var(--nylas-email-snippet-color, var(--grey-dark));
              margin-top: $spacing-xs;
            }
            div.message-head {
              .avatar-from {
                display: flex;
                align-items: center;
                gap: $spacing-s;
              }
            }
          }
          &:not(:last-of-type) {
            border-bottom: 1px solid #eee;
          }
          &:not(.last-message) {
            &.expanded {
              div.message-head:hover {
                cursor: n-resize;
              }
            }
          }
          &.last-message {
            .message-head:hover,
            .message-body:hover {
              cursor: default;
            }
          }

          div.message-head {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            gap: $spacing-xs;
          }
          div.message-date {
            display: flex;
            color: var(--nylas-email-message-date-color, var(--grey));
            font-size: 12px;
          }

          div.message-from {
            display: flex;
            align-items: center;
            span {
              &.name {
                font-weight: 600;
                margin-right: 0.5rem;
              }
            }
          }
        }
        &.expanded {
          div.message-head {
            div.message-from-to {
              margin: 0.5rem 0;
              .avatar-from {
                display: flex;
                align-items: center;
                gap: $spacing-s;
              }
              div.message-to {
                color: var(--nylas-email-message-to-color, var(--grey));
                max-width: 150px;
                margin-left: calc(32px + 0.7rem);
                div {
                  display: grid;
                  grid-template-columns: 1fr 16px;

                  span {
                    text-overflow: ellipsis;
                    overflow: hidden;
                  }
                }
              }
            }
          }
          &.condensed {
            gap: 1rem;
            &:hover,
            &:focus {
              cursor: s-resize;
              outline: none;
            }
            span.snippet {
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              color: var(--nylas-email-snippet-color, var(--grey-dark));
              span.initial {
                display: none;
              }
              span.loading {
                display: inline-block;
              }
            }
          }
        }
      }
      &:hover {
        cursor: pointer;
      }
      .from-message-count {
        align-items: center;
        display: grid;
        grid-template-columns: repeat(3, auto);
        grid-gap: $spacing-m;
        justify-content: flex-start;
        max-width: 350px;

        .from-participants {
          display: grid;
          grid-template-columns: 1fr fit-content(60px);
          .participants-name {
            overflow: hidden;
            white-space: nowrap;
            position: relative;
            text-overflow: ellipsis;
            .from-sub-section.second {
              display: none;
            }
          }
          .participants-count {
            .show-on-mobile {
              display: inline-block;
            }
            .show-on-desktop {
              display: none;
            }
          }
        }
      }
      .subject-snippet-attachment {
        padding: $spacing-xs;
        padding-top: 0.4rem;
        overflow: hidden;
        .subject-snippet {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          color: var(--nylas-email-snippet-color, var(--grey-dark));

          .subject {
            color: var(--nylas-email-subject-color, var(--black));
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .snippet {
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }
        }

        .attachment {
          margin-top: $spacing-xs;
          gap: 1rem;
          display: flex;
          overflow-x: auto;

          button {
            padding: 0.3rem 1rem;
            border: 1px solid var(--grey);
            border-radius: 30px;
            background: white;
            cursor: pointer;
            &:hover {
              background: var(--grey-light);
            }
          }
        }
        div {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: var(--nylas-email-snippet-color, var(--grey-dark));
          span.subject {
            color: var(--nylas-email-subject-color, var(--black));
          }
          &.date {
            display: flex;
            justify-content: flex-end;
            gap: $spacing-xs;
            width: 100%;
            font-size: 14px;
            color: var(--nylas-email-message-date-color, var(--grey));
          }
          &.action-icons {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            width: 100%;
            gap: 1rem;
            & > :last-child {
              padding-right: 1rem;
            }
            button {
              background: none;
              cursor: pointer;
              display: flex;

              * {
                width: 1em;
                height: 1em;
              }
            }
          }
        }
      }
      &.expanded.singular {
        &:hover {
          box-shadow: none;
          cursor: default;
        }
        div.individual-message:not(.last-message).expanded {
          .message-head:hover,
          .message-body:hover {
            cursor: default;
          }
        }
      }
    }
  }

  @media #{$desktop} {
    main {
      .email-row {
        .from-message-count {
          max-width: 350px;
          .from-participants {
            .participants-name {
              overflow: hidden;
              white-space: nowrap;
              position: relative;
              .from-sub-section.second {
                display: inline-block;
              }
              &.condensed::after {
                content: ".";
                position: absolute;
                bottom: 0;
                right: 0;
                background: var(
                  --nylas-email-body-background,
                  var(--grey-lightest)
                );
              }
              &.condensed.unread::after {
                background: var(--nylas-email-body-background, var(--white));
              }
            }
            .participants-count {
              .show-on-mobile {
                display: none;
              }
              .show-on-desktop {
                display: inline-block;
              }
            }
          }
        }

        &.expanded.singular {
          .individual-message.expanded {
            padding-top: $spacing-xs;
          }
        }
        &.condensed {
          padding: $spacing-xs 0;
          justify-content: initial;

          div.starred {
            button {
              &:hover:before {
                color: var(--nylas-email-star-button-hover-color, #ffc107);
              }
            }
          }

          .date {
            text-align: right;
            padding-right: $spacing-xs;
            display: flex;
            justify-content: flex-end;
            gap: $spacing-xs;
            font-size: 14px;
            color: var(--nylas-email-message-date-color, var(--grey));
          }

          .thread-message-count {
            text-align: center;
          }
        }

        &.expanded {
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          width: 100%;
          overflow-x: hidden;
          header {
            padding: $spacing-m $spacing-xl;
          }
          div.individual-message {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: $spacing-m 0;
            width: inherit;
            div.message-head,
            div.message-body {
              width: 100%;
              box-sizing: border-box;
              padding: 0 $spacing-xl;
            }
            div.message-body {
              display: flex;
              flex-direction: column;
            }

            &.condensed {
              div.snippet {
                width: 100%;
                box-sizing: border-box;
                padding: 0 $spacing-xl;
                white-space: pre-wrap;
                max-width: 95vw;
                align-self: flex-start;
              }
            }

            div.message-date {
              font-size: 14px;
              align-self: center;
            }
            &.expanded {
              div.message-head {
                div.message-from-to {
                  margin: $spacing-xs 0;
                  div.message-to {
                    max-width: inherit;
                    overflow: inherit;
                    div {
                      display: grid;
                      grid-template-columns: 1fr 16px;
                      align-items: center;

                      span {
                        text-overflow: ellipsis;
                        overflow: hidden;
                      }
                    }
                  }
                }
              }
            }
          }
        }

        .subject-snippet-attachment {
          .subject-snippet {
            display: grid;
            grid-template-columns: auto auto;
            gap: 1rem;
          }
        }
      }
    }
  }
</style>

<nylas-error {id} />
<main
  bind:this={main}
  on:click={handleThreadClick}
  tabindex="0"
  on:keypress={handleThreadKeypress}
>
  {#if _this.thread || _this.thread_id}
    {#await activeThread}
      Loading...
    {:then thread}
      {#if thread && activeThread}
        {#if activeThread.expanded}
          <div
            use:storeMessagesContainer
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
                      aria-label={thread.starred
                        ? "Unstar thread"
                        : "Star thread"}
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
                      title={`Mark thread as ${
                        activeThread.unread ? "" : "un"
                      }read`}
                      aria-label={`Mark thread as ${
                        activeThread.unread ? "" : "un"
                      }read`}
                      on:click|stopPropagation={toggleUnreadStatus}
                    >
                      {#if activeThread.unread}
                        <MarkReadIcon aria-hidden="true" />
                      {:else}
                        <MarkUnreadIcon aria-hidden="true" />
                      {/if}
                    </button>
                  </div>
                {/if}
              </div>
            </header>
            {#if activeThread.messages.length}
              {#each activeThread.messages as message, msgIndex}
                <div
                  class:last-message={msgIndex ===
                    activeThread.messages.length - 1}
                  class={`individual-message ${
                    msgIndex === activeThread.messages.length - 1 ||
                    message.expanded
                      ? "expanded"
                      : "condensed"
                  }`}
                  bind:this={messageRefs[msgIndex]}
                  use:storeLatestMessageNode={{ msgIndex }}
                  on:click|stopPropagation={(e) =>
                    handleEmailClick(e, msgIndex)}
                  on:keypress={(e) => handleEmailKeypress(e, msgIndex)}
                >
                  {#if message.expanded || msgIndex === activeThread.messages.length - 1}
                    <div class="message-head">
                      <div class="message-from-to">
                        <div class="avatar-from">
                          {#if _this.show_contact_avatar}
                            <div class="default-avatar">
                              <nylas-contact-image
                                {contact_query}
                                contact={contacts[message?.from[0].email]}
                              />
                            </div>
                          {/if}
                          <div class="message-from">
                            <span class="name">
                              {userEmail && message?.from[0].email === userEmail
                                ? "me"
                                : message?.from[0].name ||
                                  message?.from[0].email}
                            </span>
                            <!-- tooltip component -->
                            <nylas-tooltip
                              on:toggleTooltip={setTooltip}
                              id={message?.id.slice(0, 3)}
                              current_tooltip_id={currentTooltipId}
                              icon={DropdownSymbol}
                              content={message?.from[0].email}
                            />
                          </div>
                        </div>
                        <div class="message-to">
                          {#each message?.to.slice(0, PARTICIPANTS_TO_TRUNCATE) as to, i}
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
                          {#if message.to?.length > PARTICIPANTS_TO_TRUNCATE}
                            <div>
                              <nylas-tooltip
                                on:toggleTooltip={setTooltip}
                                id={`show-more-participants-${message.id}`}
                                current_tooltip_id={currentTooltipId}
                                icon={DropdownSymbol}
                                text={`And ${
                                  message.to?.length - PARTICIPANTS_TO_TRUNCATE
                                } more`}
                                content={`${message.to
                                  .map((to) => `${to.name} ${to.email}`)
                                  .join(", ")}`}
                              />
                            </div>
                          {/if}
                        </div>
                      </div>
                      <div class="">
                        {#if _this.show_received_timestamp}
                          <div class="message-date">
                            <span>
                              {formatExpandedDate(
                                new Date(message.date * 1000),
                              )}
                            </span>
                          </div>
                        {/if}
                        <div aria-label="Email Actions" role="toolbar">
                          {#if _this.show_reply}
                            <div class="reply">
                              <button
                                title={"Reply"}
                                aria-label={"Reply"}
                                on:click|stopPropagation={(e) =>
                                  handleReplyClick(e, message, "reply")}
                              >
                                <ReplyIcon aria-hidden="true" />
                              </button>
                            </div>
                          {/if}
                          {#if _this.show_reply_all && canReplyAll(message)}
                            <div class="reply-all">
                              <button
                                title={"Reply all"}
                                aria-label={"Reply all"}
                                on:click|stopPropagation={(e) =>
                                  handleReplyClick(e, message, "reply_all")}
                              >
                                <ReplyAllIcon aria-hidden="true" />
                              </button>
                            </div>
                          {/if}
                          {#if _this.show_forward}
                            <div class="forward">
                              <button
                                title="Forward"
                                aria-label="Forward"
                                on:click|stopPropagation={(e) =>
                                  handleForwardClick(e, message)}
                              >
                                <ForwardIcon aria-hidden="true" />
                              </button>
                            </div>
                          {/if}
                        </div>
                      </div>
                    </div>
                    <div class="message-body">
                      {#if _this.clean_conversation && message.conversation}
                        {@html DOMPurify.sanitize(message.conversation)}
                      {:else if message && message.body != null}
                        <nylas-message-body
                          {message}
                          body={message.body}
                          on:downloadClicked={handleDownloadFromMessage}
                        />
                        <!-- If a thread is being passed manually and there is no body, 
                          we will keep loading, so the below is our fallback -->
                      {:else if !!_this.thread && !_this.thread_id && click_action != "mailbox"}
                        {message.body ?? message.snippet}
                        {#await attachedFiles[message.id] then files}
                          {#if files && Array.isArray(files) && files.length > 0}
                            <div class="attachment">
                              {#each files as file}
                                <button
                                  on:click|stopPropagation={(e) =>
                                    dispatchEvent("fileClicked", {
                                      event: e,
                                      file: file,
                                    })}
                                >
                                  {file.filename || file.id}
                                </button>
                              {/each}
                            </div>
                          {/if}
                        {/await}
                      {:else}
                        <div class="email-loader">
                          <LoadingIcon class="spinner" />
                          Loading...
                        </div>
                      {/if}
                    </div>
                  {:else}
                    <div class="message-head">
                      <div class="avatar-from">
                        {#if _this.show_contact_avatar}
                          <div class="default-avatar">
                            <nylas-contact-image
                              {contact_query}
                              contact={contacts[message?.from[0].email]}
                            />
                          </div>
                        {/if}
                        <div class="message-from">
                          <span class="name"
                            >{userEmail && message?.from[0].email === userEmail
                              ? "me"
                              : message?.from[0].name ||
                                message?.from[0].email}</span
                          >
                          <!-- tooltip component -->
                          <nylas-tooltip
                            on:toggleTooltip={setTooltip}
                            id={message?.id.slice(0, 3)}
                            current_tooltip_id={currentTooltipId}
                            icon={DropdownSymbol}
                            content={message?.from[0].email}
                          />
                        </div>
                      </div>
                      <section>
                        {#if _this.show_received_timestamp}
                          <div class="message-date">
                            <span>
                              {formatExpandedDate(
                                new Date(message.date * 1000),
                              )}
                            </span>
                          </div>
                        {/if}
                      </section>
                    </div>
                    <div class="snippet">
                      {message.snippet}
                    </div>
                  {/if}
                </div>
              {/each}
            {:else}
              <span class="snippet">{thread.snippet}</span>
            {/if}
          </div>
        {:else}
          <div
            class="email-row condensed"
            class:show_star={_this.show_star}
            class:unread={activeThread.unread}
            class:disable-click={activeThread &&
              activeThread.messages.length <= 0 &&
              !activeThread.drafts.length}
          >
            {#await isThreadADraftEmail(activeThread) then isDraft}
              <div class="from{_this.show_star ? '-star' : ''}">
                {#if _this.show_star}
                  <div class="starred">
                    <button
                      id={`thread-star-${_this.thread_id}`}
                      class={activeThread.starred ? "starred" : ""}
                      value={_this.thread_id}
                      role="switch"
                      aria-checked={activeThread.starred}
                      on:click|preventDefault={handleThreadStarClick}
                      aria-label={`Star button for thread ${_this.thread_id}`}
                    />
                  </div>
                {/if}
                <div class="from-message-count">
                  {#if _this.show_contact_avatar}
                    <div class="default-avatar" class:draft={isDraft}>
                      {#if isDraft}
                        <DraftIcon />
                      {:else}
                        <nylas-contact-image
                          {contact_query}
                          contact={activeThreadContact}
                        />
                      {/if}
                    </div>
                  {/if}
                  <div class="from-participants">
                    <div
                      class="participants-name"
                      class:condensed={showSecondFromParticipant(
                        activeThread.messages,
                        activeThread.participants,
                      )}
                    >
                      <span class="from-sub-section">
                        {showFromParticipants(
                          activeThread.messages,
                          activeThread.participants,
                        )}
                      </span>
                    </div>
                    <div class="participants-count">
                      {#if showSecondFromParticipant(activeThread.messages, activeThread.participants)}
                        <!-- If it is mobile, we only show 1 participant (latest from message), hence -1 -->
                        {#if activeThread.participants.length >= 2}
                          <span class="show-on-mobile">
                            &plus;{activeThread.participants.length -
                              MAX_MOBILE_PARTICIPANTS}
                          </span>
                        {/if}
                        <!-- If it is desktop, we only show upto 2 participants (latest from message), hence -2. 
                        Note that this might not be exactly correct if the name of the first participant is too long 
                        and occupies entire width -->
                        {#if activeThread.participants.length > 2}
                          <span class="show-on-desktop">
                            &nbsp; &plus; {activeThread.participants.length -
                              MAX_DESKTOP_PARTICIPANTS}
                          </span>
                        {/if}
                      {/if}
                    </div>
                  </div>
                </div>
              </div>
              {#if _this.show_number_of_messages}
                <span class="thread-message-count">
                  {activeThread.messages.length
                    ? activeThread.messages.length
                    : ""}
                </span>
              {/if}
              <div class="subject-snippet-attachment">
                <div class="subject-snippet">
                  {#if thread?.subject}<span class="subject"
                      >{thread?.subject}</span
                    >{/if}
                  <span class="snippet"
                    >{(isDraft && activeThread?.drafts.length) ||
                    activeThread?.messages.length
                      ? thread.snippet.replace(/\u200C /g, "")
                      : `Sorry, looks like this thread is currently unavailable. It may
                    have been deleted in your provider inbox.`}</span
                  >
                </div>
                {#if Object.keys(attachedFiles).length > 0}
                  <div class="attachment">
                    {#each Object.values(attachedFiles) as files}
                      {#each files as file}
                        <button
                          on:click={(event) =>
                            downloadSelectedFile(event, file)}
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
                {#if activeThread.has_attachments && Object.keys(attachedFiles).length > 0}
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
                      title={`Mark thread as ${
                        activeThread.unread ? "" : "un"
                      }read`}
                      aria-label={`Mark thread as ${
                        activeThread.unread ? "" : "un"
                      }read`}
                      on:click|stopPropagation={toggleUnreadStatus}
                    >
                      {#if activeThread.unread}
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
            {/await}
          </div>
        {/if}
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
            <section class="">
              {#if _this.show_received_timestamp}
                <div class="message-date">
                  <span>
                    {formatExpandedDate(new Date(_this.message.date * 1000))}
                  </span>
                </div>
              {/if}
              <div aria-label="Email Actions" role="toolbar">
                {#if _this.show_reply}
                  <div class="reply">
                    <button
                      title={"Reply"}
                      aria-label={"Reply"}
                      on:click|stopPropagation={(e) =>
                        handleReplyClick(e, _this.message, "reply")}
                    >
                      <ReplyIcon aria-hidden="true" />
                    </button>
                  </div>
                {/if}
                {#if _this.show_reply_all && canReplyAll(_this.message)}
                  <div class="reply-all">
                    <button
                      title={"Reply all"}
                      aria-label={"Reply all"}
                      on:click|stopPropagation={(e) =>
                        handleReplyClick(e, _this.message, "reply_all")}
                    >
                      <ReplyAllIcon aria-hidden="true" />
                    </button>
                  </div>
                {/if}
              </div>
            </section>
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
