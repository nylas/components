<svelte:options tag="nylas-email" />

<script lang="ts">
  import {
    MailboxStore,
    Threads,
    ManifestStore,
    fetchAccount,
    updateThread,
    fetchMessage,
    fetchEmail,
    ContactStore,
    fetchCleanConversations,
  } from "@commons";
  import type { ContactSearchQuery } from "@commons/types/Contacts";
  import { get_current_component, onMount, tick } from "svelte/internal";
  import {
    buildInternalProps,
    getEventDispatcher,
  } from "@commons/methods/component";
  import DropdownSymbol from "./assets/chevron-down.svg";
  import TrashIcon from "./assets/trash-alt.svg";
  import MarkReadIcon from "./assets/envelope-open-text.svg";
  import MarkUnreadIcon from "./assets/envelope.svg";
  import LeftArrowLineIcon from "./assets/arrow-line.svg";
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
  } from "@commons/types/Nylas";
  import "@commons/components/ContactImage/ContactImage.svelte";
  import "@commons/components/MessageBody.svelte";
  import "@commons/components/Tooltip.svelte";
  import { AccountOrganizationUnit } from "@commons/enums/Nylas";
  import { LabelStore } from "@commons/store/labels";
  import { FolderStore } from "@commons/store/folders";

  let manifest: Partial<EmailProperties> = {};

  const dispatchEvent = getEventDispatcher(get_current_component());
  $: dispatchEvent("manifestLoaded", manifest);

  export let id: string = "";
  export let access_token: string = "";
  export let thread_id: string;
  // export let messages: Message[] = [];
  export let message_id: string = "";
  export let theme: string;
  export let show_received_timestamp: boolean;
  export let show_number_of_messages: boolean;
  export let thread: Thread | null;
  export let message: Message | null;
  export let click_action: "default" | "mailbox" | "custom" = "default";
  export let show_star: boolean;
  export let unread: boolean | null = null;
  export let you: Partial<Account> = {};
  export let show_contact_avatar: boolean;
  export let clean_conversation: boolean;
  export let show_expanded_email_view_onload: boolean;
  export let show_thread_actions: boolean;

  const defaultValueMap = {
    theme: "theme-1",
    show_received_timestamp: true,
    show_number_of_messages: true,
    show_star: false,
    click_action: "default",
    thread_id: "",
    show_contact_avatar: true,
    show_expanded_email_view_onload: false,
    clean_conversation: false,
  };

  let userEmail: string | undefined;
  onMount(async () => {
    await tick();
    manifest = ((await $ManifestStore[
      JSON.stringify({ component_id: id, access_token })
    ]) || {}) as EmailProperties;

    updateInternalProps(
      buildInternalProps($$props, manifest, defaultValueMap) as EmailProperties,
    );

    // Fetch Account
    if (id && !you.id && !emailManuallyPassed) {
      you = await fetchAccount({
        component_id: query.component_id,
        access_token,
      });
      userEmail = <string>you.email_address;
      // Initialize labels / folders
      const accountOrganizationUnitQuery = {
        component_id: id,
        access_token,
      };
      if (you?.organization_unit === AccountOrganizationUnit.Label) {
        labels = await LabelStore.getLabels(accountOrganizationUnitQuery);
      } else if (you?.organization_unit === AccountOrganizationUnit.Folder) {
        folders = await FolderStore.getFolders(accountOrganizationUnitQuery);
      }
    }
  });
  let contacts: any = null;
  $: activeThreadContact =
    activeThread && contacts
      ? contacts[
          activeThread.messages[activeThread.messages.length - 1].from[0].email
        ]
      : null;
  $: activeMessageContact =
    message && contacts ? contacts[message.from[0].email] : null;

  let threadIdChanged = false;
  $: thread_id, (threadIdChanged = true);

  $: (async () => {
    if (threadIdChanged || !contacts) {
      threadIdChanged = false;
      if (thread && thread.messages) {
        await getThreadContacts(thread);
      } else if (activeThread) {
        await getThreadContacts(activeThread);
      } else if (message) {
        const participant = message.from[0];
        if (!contacts) {
          contacts = {};
        }
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
      if (!contacts) {
        contacts = {};
      }
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
      ? labels.find((folder) => folder.name === "trash")?.id
      : null;
  // #endregion initialize label and folder vars (for trash)

  let internalProps: EmailProperties = <any>{};
  $: {
    const rebuiltProps = buildInternalProps(
      $$props,
      manifest,
      defaultValueMap,
    ) as EmailProperties;
    if (JSON.stringify(rebuiltProps) !== JSON.stringify(internalProps)) {
      updateInternalProps(rebuiltProps);
    }
  }

  function updateInternalProps(updatedProps: EmailProperties) {
    internalProps = updatedProps;

    theme = internalProps.theme;
    show_received_timestamp = internalProps.show_received_timestamp;
    show_number_of_messages = internalProps.show_number_of_messages;
    show_star = internalProps.show_star;
    unread = internalProps.unread;
    click_action = internalProps.click_action;

    // Assign thread_id to threadID stored in the manifest only when passing a thread_id
    const internalPropThreadID =
      !thread && !message_id && !message ? internalProps.thread_id : "";
    thread_id = internalPropThreadID;
    show_contact_avatar = internalProps.show_contact_avatar;
    show_expanded_email_view_onload =
      internalProps.show_expanded_email_view_onload;
    clean_conversation = internalProps.clean_conversation;

    if (activeThread && click_action === "mailbox") {
      // enables bulk starring action in mailbox to immediately reflect visually
      activeThread = activeThread;
    }
  }

  let participants: Participant[] = [];
  $: {
    participants = activeThread ? activeThread.participants : [];
  }
  let query: ConversationQuery;
  $: query = {
    access_token,
    component_id: id,
    thread_id,
  };

  let queryKey: string;
  $: queryKey = JSON.stringify(query);

  let activeThread: Conversation;

  $: if (!thread_id && !thread && id && message_id) {
    fetchOneMessage();
  }

  // #region thread intake and set
  // The trick is to always ensure that activeThread is in the store; that way if we need to do fetches to update its messages, it too will be updated for free.
  // TODO: this feels like it could be a "$: activeThread =" reactive prop declaration instead of a conditional block. -Phil
  $: if (thread && thread.id) {
    // Thread is being passed in directly. We won't need to do an initial fetch.
    // Is it in the store already? (via <nylas-mailbox>, for example)
    let foundThread = $Threads.find(
      (storedThread) => storedThread && storedThread.id === thread?.id,
    ) as Conversation;
    if (!foundThread) {
      // Thread does not exist in the store, assume it was passed in
      activeThread = thread as Conversation;
    } else {
      // It's already in the store! Great.
      activeThread = foundThread;
    }
    // This is for Email component demo purpose, where we want to show expanded threads by default on load.
    if (show_expanded_email_view_onload) {
      activeThread.expanded = show_expanded_email_view_onload;
    }
  } else if (thread_id) {
    // We don't have a passed thread, but we do have a thread_id. Let's fetch it.
    MailboxStore.getThread(query).then(() => {
      let foundThread = $Threads.find(
        (storedThread) => storedThread.id === thread_id,
      ) as Conversation;
      if (foundThread) {
        activeThread = foundThread;
        if (show_expanded_email_view_onload) {
          activeThread.expanded = show_expanded_email_view_onload;
        }
      }
    });
  }

  // #endregion thread intake and set
  let emailManuallyPassed: boolean;
  $: emailManuallyPassed = !!thread;

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
    } else if (message) {
      fetchCleanConversations({
        component_id: id,
        message_id: [message.id],
      }).then((results) => {
        results.forEach((msg: Message) => {
          if (message) {
            message.conversation = msg.conversation;
          }
        });
        activeThread.messages = activeThread.messages;
      });
    }
  }

  $: if (
    clean_conversation &&
    ((activeThread && !activeThread.messages.some((m) => m.conversation)) ||
      (message && !message.conversation))
  )
    cleanConversation();
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
    if (activeThread && query.component_id && thread_id) {
      await updateThread(query, activeThread).then((thread) => {
        $MailboxStore[queryKey] = [thread];
      });
    }
  }

  async function handleThread(e: MouseEvent | KeyboardEvent) {
    if (click_action === "default" || click_action === "mailbox") {
      //#region read/unread
      if (activeThread && activeThread.unread && click_action !== "mailbox") {
        activeThread.unread = !activeThread.unread;
        unread = activeThread.unread;
        await saveActiveThread();
      }
      //#endregion read/unread

      const lastMsgIndex = activeThread.messages.length - 1;
      activeThread.messages[lastMsgIndex].expanded =
        !activeThread.messages[lastMsgIndex].expanded;

      if (!emailManuallyPassed) {
        // fetch last message
        if (!activeThread.messages[lastMsgIndex].body) {
          fetchIndividualMessage(lastMsgIndex);
        }
      }

      //#region open thread + messages

      activeThread.expanded = !activeThread.expanded;
      // Upon expansion / lastMessage existing, scroll to it
      if (activeThread.expanded && click_action === "default") {
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
      event: e,
      thread: activeThread,
    });
    current_tooltip_id = "";
  }

  async function toggleUnreadStatus(e: MouseEvent | KeyboardEvent) {
    if (activeThread) {
      dispatchEvent("toggleThreadUnreadStatus", {
        event: e,
        thread: activeThread,
      });
      if (click_action !== "mailbox") {
        activeThread.unread = !activeThread.unread;
        unread = activeThread.unread;
        await saveActiveThread();
        return;
      }
      return;
    }
    unread = !unread;
  }

  async function deleteEmail(e: MouseEvent) {
    dispatchEvent("threadDeleted", {
      event: e,
      thread: activeThread,
    });
    if (click_action !== "mailbox") {
      if (trashLabelID) {
        const existingLabelIds = activeThread.labels?.map((i) => i.id) || [];
        activeThread.label_ids = [...existingLabelIds, trashLabelID];
      } else if (trashFolderID) {
        activeThread.folder_id = trashFolderID;
      }
      await saveActiveThread();
    }
  }

  function handleThreadClick(e: MouseEvent) {
    if (message && (!thread_id || !thread)) return;
    else if (click_action === "mailbox" && activeThread.expanded) return;
    e.preventDefault();
    handleThread(e);
  }

  function returnToMailbox(e: MouseEvent | KeyboardEvent) {
    dispatchEvent("returnToMailbox", {
      event: e,
      thread: activeThread,
    });
  }

  function handleThreadKeypress(e: KeyboardEvent) {
    if (message && (!thread_id || !thread)) return;
    else if (click_action === "mailbox" && activeThread.expanded) return;
    e.preventDefault();
    if (e.code === "Enter") {
      handleThread(e);
    }
  }

  async function handleThreadStarClick(e: MouseEvent) {
    e.stopImmediatePropagation();
    //#region starred/unstarred
    if (activeThread) {
      activeThread.starred = !activeThread.starred;
      await saveActiveThread();
    }
    //#endregion starred/unstarred

    dispatchEvent("threadStarred", {
      event: e,
      thread: activeThread,
    });
  }

  function handleEmailClick(e: MouseEvent, msgIndex: number) {
    e.stopImmediatePropagation();

    if (msgIndex === activeThread.messages.length - 1) {
      doNothing(e);
    } else {
      activeThread.messages[msgIndex].expanded =
        !activeThread.messages[msgIndex].expanded;
      dispatchEvent("messageClicked", {
        event: e,
        message: activeThread.messages[msgIndex],
        thread: activeThread,
      });
      if (!emailManuallyPassed && !activeThread.messages[msgIndex].body) {
        fetchIndividualMessage(msgIndex);
      }
    }
  }

  function handleEmailKeypress(e: KeyboardEvent, msgIndex: number) {
    e.stopImmediatePropagation();
    if (e.code === "Enter") {
      if (msgIndex === activeThread.messages.length - 1) {
        doNothing(e);
      } else {
        activeThread.messages[msgIndex].expanded =
          !activeThread.messages[msgIndex].expanded;
      }
    }
  }

  function fetchIndividualMessage(msgIndex: number) {
    const messageID = activeThread.messages[msgIndex].id;

    messageLoadStatus[msgIndex] = "loading";
    fetchMessage(query, messageID).then((json) => {
      activeThread.messages[msgIndex].body = json.body;
      messageLoadStatus[msgIndex] = "loaded";
    });
  }

  function doNothing(e: MouseEvent | KeyboardEvent) {
    e.stopImmediatePropagation();
  }

  // For cases when someone wants to show just a single email message, rather than the full thread.
  function fetchOneMessage() {
    fetchEmail({ access_token, component_id: id, message_id }).then((json) => {
      message = json;
      messageLoadStatus[0] = "loaded";
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

  let current_tooltip_id: string = "";
  function setTooltip(e: any) {
    current_tooltip_id = e.detail.tooltipID;
  }

  function showFirstFromParticipant(messages: Message[]) {
    return (
      messages &&
      participants &&
      messages.length > 0 &&
      messages[messages.length - 1].from.length
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
      messages[0].from.length &&
      participants[0].email !== messages[messages.length - 1].from[0].email
    );
  }
</script>

<style lang="scss">
  @use "sass:list";
  @import "../../theming/reset.scss";
  @import "../../theming/animation.scss";
  @import "../../theming/variables.scss";

  $border-style: 1px solid #ebebeb;
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
      border: var(--nylas-email-border, #{$border-style});

      nylas-tooltip {
        position: relative;
      }
      .default-avatar {
        background: #002db4;
        border-radius: 50%;
        color: #fff;
        font-family: sans-serif;
        font-size: 1rem;
        font-weight: bold;
        height: 32px;
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
        display: grid;
        align-items: center;
        grid-template-columns: fit-content(350px) 1fr;
        .from-star {
          display: grid;
          grid-template-columns: 25px auto;
          column-gap: $spacing-xs;
        }

        .mobile-subject-snippet {
          display: block;
          font-size: 14px;
          margin-top: $spacing-xs;
          flex-basis: 100%;
          .subject {
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
            max-width: 90vw;
            display: block;
            word-break: keep-all;
          }

          .snippet {
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
            display: block;
            max-width: 90vw;
            color: var(--grey);
            margin-top: 4px;
          }
        }

        .thread-message-count {
          color: var(--grey-light);
          font-size: 12px;
          align-self: center;
        }
        &.unread {
          background: var(--nylas-email-background, white);

          .from-message-count,
          .date,
          .subject {
            font-weight: 600;
            color: var(--black);

            .thread-message-count {
              color: var(--blue);
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
      &.expanded {
        background: var(--white);
        padding: 0;
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
        }

        [role="toolbar"] {
          @include barStyle;
          padding: $spacing-s $spacing-m;
          gap: $spacing-m;
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
          width: 100%;
          box-sizing: border-box;
          padding: $spacing-xs;

          &.condensed {
            div.snippet {
              text-overflow: ellipsis;
              overflow: hidden;
              white-space: nowrap;
              display: block;
              max-width: 90vw;
              color: var(--grey);
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
            align-items: center;
          }
          div.message-date {
            display: flex;
            color: gray;
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
                color: gray;
                max-width: 150px;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
                margin-left: calc(32px + 0.7rem);
                span {
                  display: flex;
                  align-items: center;
                  gap: 0.5rem;
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
              color: var(--grey);
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
          max-width: 220px;
          display: grid;
          grid-template-columns: 1fr fit-content(60px);
          .participants-name {
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
      .subject-snippet-date {
        .desktop-subject-snippet {
          display: none;
        }
        div {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          span.snippet {
            color: var(--grey);
          }
          &.date {
            display: flex;
            justify-content: flex-end;
            width: 100%;
            font-size: 14px;
            color: var(--grey);
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
                background: #fff;
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
          padding: 0 $spacing-xs;
          display: grid;
          column-gap: $spacing-m;
          height: $collapsed-height;
          grid-template-columns: fit-content(350px) 1fr;
          justify-content: initial;
          div.starred {
            button {
              &:hover:before {
                color: #ffc107;
              }
            }
          }

          .mobile-subject-snippet {
            display: none;
          }
        }

        &.expanded {
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          width: 100%;
          header {
            padding: $spacing-m $spacing-xl;
          }
          div.individual-message {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: $spacing-m 0;

            div.message-head,
            div.message-body {
              width: 100%;
              box-sizing: border-box;
              padding: 0 $spacing-xl;
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
                    max-width: unset;
                    overflow: inherit;
                  }
                }
              }
            }
          }
        }

        .subject-snippet-date {
          display: grid;
          grid-template-columns: 1fr fit-content(120px);
          gap: 1rem;
          .desktop-subject-snippet {
            display: block;

            .subject {
              margin-right: $spacing-xs;
            }
          }

          .date {
            text-align: right;
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
  {#if thread || thread_id}
    {#await activeThread}
      Loading Component...
    {:then thread}
      {#if thread && activeThread}
        {#if activeThread.expanded}
          <div
            class="email-row expanded {click_action === 'mailbox'
              ? 'expanded-mailbox-thread'
              : ''}"
          >
            <header
              class="subject-title"
              class:mailbox={click_action === "mailbox"}
            >
              <div>
                {#if click_action === "mailbox"}
                  <button
                    title={"Return to Mailbox"}
                    aria-label={"Return to Mailbox"}
                    on:click|stopPropagation={returnToMailbox}
                  >
                    <LeftArrowLineIcon />
                  </button>
                {/if}
                <h1>{thread.subject}</h1>
              </div>
              <div role="toolbar">
                <div class="delete">
                  <button
                    title="Delete thread / Move to trash"
                    aria-label="Delete thread (Move to trash)"
                    on:click|stopPropagation={(e) => deleteEmail(e)}
                  >
                    <TrashIcon />
                  </button>
                </div>
                {#if show_star}
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
                  </div>{/if}
                <div class="read-status">
                  <button
                    title={`Mark thread as ${
                      unread ||
                      (activeThread.unread && click_action !== "mailbox")
                        ? ""
                        : "un"
                    }read`}
                    aria-label={`Mark thread as ${
                      unread ||
                      (activeThread.unread && click_action !== "mailbox")
                        ? ""
                        : "un"
                    }read`}
                    on:click|stopPropagation={toggleUnreadStatus}
                  >
                    {#if unread || (activeThread.unread && click_action !== "mailbox")}
                      <MarkReadIcon aria-hidden="true" />
                    {:else}
                      <MarkUnreadIcon aria-hidden="true" />
                    {/if}</button
                  >
                </div>
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
                  on:click|stopPropagation={(e) =>
                    handleEmailClick(e, msgIndex)}
                  on:keypress={(e) => handleEmailKeypress(e, msgIndex)}
                >
                  {#if message.expanded || msgIndex === activeThread.messages.length - 1}
                    <div class="message-head">
                      <div class="message-from-to">
                        <div class="avatar-from">
                          {#if show_contact_avatar}
                            <div class="default-avatar">
                              <nylas-contact-image
                                {contact_query}
                                contact={contacts[message.from[0].email]}
                              />
                            </div>
                          {/if}
                          <div class="message-from">
                            <span class="name"
                              >{userEmail && message.from[0].email === userEmail
                                ? "me"
                                : message.from[0].name ||
                                  message.from[0].email}</span
                            >
                            <!-- tooltip component -->
                            <nylas-tooltip
                              on:toggleTooltip={setTooltip}
                              id={message.id.slice(0, 3)}
                              {current_tooltip_id}
                              icon={DropdownSymbol}
                              content={message.from[0].email}
                            />
                          </div>
                        </div>
                        <div class="message-to">
                          {#each message.to as to, i}
                            <span>
                              {#if to.name || to.email}
                                to&colon;&nbsp;{userEmail &&
                                to.email === userEmail
                                  ? "me"
                                  : to.name || to.email}
                                {#if i !== message.to.length - 1}
                                  &nbsp;&comma;
                                {/if}
                                <!-- tooltip component -->
                                <nylas-tooltip
                                  on:toggleTooltip={setTooltip}
                                  id={message.id.slice(0, 4)}
                                  {current_tooltip_id}
                                  icon={DropdownSymbol}
                                  content={to.email}
                                />
                              {/if}
                            </span>
                          {/each}
                        </div>
                      </div>
                      <div class="message-date">
                        <span>
                          {formatExpandedDate(
                            new Date(message.date * 1000),
                          )}</span
                        >
                      </div>
                    </div>
                    <div class="message-body">
                      {#if clean_conversation && message.conversation}
                        {@html message.conversation}
                      {:else if message.body}
                        <nylas-message-body {message} />
                      {:else}
                        {message.snippet}
                      {/if}
                    </div>
                  {:else}
                    <div class="message-head">
                      <div class="avatar-from">
                        {#if show_contact_avatar}
                          <div class="default-avatar">
                            <nylas-contact-image
                              {contact_query}
                              contact={contacts[message.from[0].email]}
                            />
                          </div>
                        {/if}
                        <div class="message-from">
                          <span class="name"
                            >{userEmail && message.from[0].email === userEmail
                              ? "me"
                              : message.from[0].name ||
                                message.from[0].email}</span
                          >
                          <!-- tooltip component -->
                          <nylas-tooltip
                            on:toggleTooltip={setTooltip}
                            id={message.id.slice(0, 3)}
                            {current_tooltip_id}
                            icon={DropdownSymbol}
                            content={message.from[0].email}
                          />
                        </div>
                      </div>
                      <div class="message-date">
                        <span>
                          {formatExpandedDate(
                            new Date(message.date * 1000),
                          )}</span
                        >
                      </div>
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
            class:show_star
            class:unread={unread ||
              (activeThread.unread && click_action !== "mailbox")}
          >
            <div class="from{show_star ? '-star' : ''}">
              {#if show_star}
                <div class="starred">
                  <button
                    id={`thread-star-${thread_id}`}
                    class={activeThread.starred ? "starred" : ""}
                    value={thread_id}
                    role="switch"
                    aria-checked={activeThread.starred}
                    on:click|preventDefault={handleThreadStarClick}
                    aria-label={`Star button for thread ${thread_id}`}
                  />
                </div>
              {/if}
              <div class="from-message-count">
                {#if show_contact_avatar}
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
                      activeThread.messages,
                      activeThread.participants,
                    )}
                  >
                    {#if showFirstFromParticipant(activeThread.messages)}
                      <span class="from-sub-section"
                        >{activeThread.messages[
                          activeThread.messages.length - 1
                        ].from[0].name ||
                          activeThread.messages[
                            activeThread.messages.length - 1
                          ].from[0].email}</span
                      >
                    {/if}
                    {#if showSecondFromParticipant(activeThread.messages, activeThread.participants)}
                      <span class="from-sub-section second"
                        >, {activeThread.participants[0].name ||
                          activeThread.participants[0].email}</span
                      >
                    {/if}
                  </div>
                  <div class="participants-count">
                    {#if showSecondFromParticipant(activeThread.messages, activeThread.participants)}
                      <!-- If it is mobile, we only show 1 participant (latest from message), hence -1 -->
                      {#if activeThread.participants.length >= 2}
                        <span class="show-on-mobile"
                          >&nbsp;&plus;{activeThread.participants.length -
                            MAX_MOBILE_PARTICIPANTS}</span
                        >
                      {/if}
                      <!-- If it is desktop, we only show upto 2 participants (latest from message), hence -2. 
                    Note that this might not be exactly correct if the name of the first participant is too long 
                    and occupies entire width -->
                      {#if activeThread.participants.length > 2}
                        <span class="show-on-desktop"
                          >&nbsp; &plus; {activeThread.participants.length -
                            MAX_DESKTOP_PARTICIPANTS}</span
                        >
                      {/if}
                    {/if}
                  </div>
                </div>
                {#if activeThread.messages.length > 1 && show_number_of_messages}
                  <span class="thread-message-count"
                    >{activeThread.messages.length}</span
                  >
                {/if}
              </div>
            </div>
            <div class="subject-snippet-date">
              <div class="desktop-subject-snippet">
                <span class="subject">{thread.subject}</span><span
                  class="snippet"
                >
                  {thread.snippet}</span
                >
              </div>
              <div
                class:date={show_received_timestamp}
                class:action-icons={show_thread_actions}
              >
                {#if show_thread_actions}
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
                        unread ||
                        (activeThread.unread && click_action !== "mailbox")
                          ? ""
                          : "un"
                      }read`}
                      aria-label={`Mark thread as ${
                        unread ||
                        (activeThread.unread && click_action !== "mailbox")
                          ? ""
                          : "un"
                      }read`}
                      on:click|stopPropagation={toggleUnreadStatus}
                    >
                      {#if unread || (activeThread.unread && click_action !== "mailbox")}
                        <MarkReadIcon aria-hidden="true" />
                      {:else}
                        <MarkUnreadIcon aria-hidden="true" />
                      {/if}</button
                    >
                  </div>
                {:else if show_received_timestamp}
                  <span>
                    {formatPreviewDate(
                      new Date(thread.last_message_timestamp * 1000),
                    )}
                  </span>
                {/if}
              </div>
            </div>

            <div class="mobile-subject-snippet">
              <span class="subject">{thread.subject}</span><span
                class="snippet"
              >
                {thread.snippet}</span
              >
            </div>
          </div>
        {/if}
      {/if}
    {/await}
  {:else if message}
    {#if Object.keys(message).length > 0}
      <div class="email-row expanded singular">
        <header>{message.subject}</header>
        <div class="individual-message expanded">
          <div class="message-head">
            <div class="message-from-to">
              <div class="avatar-from">
                {#if show_contact_avatar}
                  <div class="default-avatar">
                    <nylas-contact-image
                      {contact_query}
                      contact={activeMessageContact}
                    />
                  </div>
                {/if}
                <div class="message-from">
                  <span class="name"
                    >{userEmail && message.from[0].email === userEmail
                      ? "me"
                      : message.from[0].name || message.from[0].email}</span
                  >
                  <!-- tooltip component -->
                  <nylas-tooltip
                    on:toggleTooltip={setTooltip}
                    id={message.id}
                    {current_tooltip_id}
                    icon={DropdownSymbol}
                    content={message.from[0].email}
                  />
                </div>
              </div>

              <div class="message-to">
                {#each message.to as to, i}
                  <span>
                    {#if to.name || to.email}
                      to&colon;&nbsp;{userEmail && to.email === userEmail
                        ? "me"
                        : to.name || to.email}
                      {#if i !== message.to.length - 1}
                        &nbsp;&comma;
                      {/if}
                      <!-- tooltip component -->
                      <nylas-tooltip
                        on:toggleTooltip={setTooltip}
                        id={message.id.slice(0, 3)}
                        {current_tooltip_id}
                        icon={DropdownSymbol}
                        content={to.email}
                      />
                    {/if}
                  </span>
                {/each}
              </div>
            </div>
            <div class="message-date">
              <span> {formatPreviewDate(new Date(message.date * 1000))}</span>
            </div>
          </div>
          <div class="message-body">
            {#if clean_conversation && message.conversation}
              {@html message.conversation}
            {:else if message.body}
              <nylas-message-body {message} />
            {/if}
          </div>
        </div>
      </div>
    {/if}
  {/if}
</main>
