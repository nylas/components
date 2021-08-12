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
    fetchContactImage,
    fetchContactsByQuery,
    ContactStore,
  } from "@commons";
  import type { ContactSearchQuery } from "@commons/types/Contacts";
  import { get_current_component, onMount, tick } from "svelte/internal";
  import {
    buildInternalProps,
    getEventDispatcher,
    getPropertyValue,
  } from "@commons/methods/component";
  import DropdownSymbol from "./assets/chevron-down.svg";
  import type {
    EmailProperties,
    Participant,
    ConversationQuery,
    Conversation,
    Thread,
    Message,
    Account,
  } from "@commons/types/Nylas";
  import "@commons/components/ContactImage/ContactImage.svelte";
  import Tooltip from "@commons/components/Tooltip.svelte";

  let manifest: Partial<EmailProperties> = {};

  const dispatchEvent = getEventDispatcher(get_current_component());
  $: dispatchEvent("manifestLoaded", manifest);

  export let id: string = "";
  export let access_token: string = "";
  export let thread_id: string = "";
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
  export let is_starred: boolean;
  export let show_contact_avatar: boolean;

  onMount(async () => {
    await tick(); // https://github.com/sveltejs/svelte/issues/2227
    manifest = ((await $ManifestStore[
      JSON.stringify({ component_id: id, access_token })
    ]) || {}) as EmailProperties;
  });

  let contact;
  $: (async () => {
    if (!contact) {
      if (thread) {
        contact = await getContact(
          thread.messages[thread.messages.length - 1].from[
            thread.messages[thread.messages.length - 1].from.length - 1
          ],
        );
      } else if (activeThread) {
        contact = await getContact(
          activeThread.messages[activeThread.messages.length - 1].from[
            activeThread.messages[activeThread.messages.length - 1].from
              .length - 1
          ],
        );
      } else if (message) {
        contact = await getContact(message.from[message.from.length - 1]);
      }
    }
  })();

  let main: Element;
  let messageRefs: Element[] = [];
  let messageLoadStatus: string[] = []; // "loading" | "loaded"

  let internalProps: SvelteAllProps;
  $: {
    const rebuiltProps = buildInternalProps(
      $$props,
      manifest,
    ) as Partial<SvelteAllProps>;
    if (JSON.stringify(rebuiltProps) !== JSON.stringify(internalProps)) {
      internalProps = rebuiltProps;
    }
    internalProps = buildInternalProps(
      $$props,
      manifest,
    ) as Partial<SvelteAllProps>;
  }

  $: theme = getPropertyValue(internalProps.theme, theme, "theme-1");

  $: {
    show_received_timestamp = getPropertyValue(
      internalProps.show_received_timestamp,
      show_received_timestamp,
      true,
    );
    show_number_of_messages = getPropertyValue(
      internalProps.show_number_of_messages,
      show_number_of_messages,
      true,
    );
    show_star = getPropertyValue(internalProps.show_star, show_star, false);
    unread = getPropertyValue(internalProps.unread, unread, null);
    click_action = getPropertyValue(
      internalProps.click_action,
      click_action,
      "default",
    );
    is_starred = getPropertyValue(internalProps.is_starred, is_starred, false);
    show_contact_avatar = getPropertyValue(
      internalProps.show_contact_avatar,
      show_contact_avatar,
      true,
    );
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
    component_id: id,
    thread_id: thread_id,
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
      (storedThread) => storedThread.id === thread?.id,
    ) as Conversation;
    if (!foundThread) {
      // Thread does not exist in the store, assume it was passed in
      activeThread = thread as Conversation;
    } else {
      // It's already in the store! Great.
      activeThread = foundThread;
    }
  } else if (thread_id) {
    // We don't have a passed thread, but we do have a thread_id. Let's fetch it.
    MailboxStore.getThread(query).then(() => {
      let foundThread = $Threads.find(
        (storedThread) => storedThread.id === thread_id,
      ) as Conversation;
      if (foundThread) {
        activeThread = foundThread;
      }
    });
  }
  // #endregion thread intake and set
  let emailManuallyPassed: boolean;
  $: emailManuallyPassed = !!thread;

  $: if (id && !you.id) {
    fetchAccount({ component_id: query.component_id }).then(
      (account: Account) => {
        you = account;
      },
    );
  }

  // #region get contact for ContactImage
  let contact_query: ContactSearchQuery;
  $: contact_query = {
    component_id: id,
    access_token,
  };

  /*
    Fetches contact for ContactImage component
  */
  async function getContact(account) {
    contact_query["query"] = `?email=${account.email}`;
    if (id) {
      let contact = $ContactStore[JSON.stringify(contact_query)];
      if (!contact) {
        contact = await ContactStore.addContact(contact_query);
      }
      return contact[0] ? contact[0] : { name: account.name };
    } else {
      return { name: account.name };
    }
  }
  // #endregion get contact for ContactImage

  function saveActiveThread() {
    // if thread and if component_id (security)
    if (activeThread && query.component_id && thread_id) {
      updateThread(query, activeThread).then((thread) => {
        $MailboxStore[queryKey] = [thread];
      });
    }
  }

  function handleThread(e: MouseEvent | KeyboardEvent) {
    if (click_action === "default" || click_action === "mailbox") {
      //#region read/unread
      if (activeThread && activeThread.unread) {
        activeThread.unread = false;
        saveActiveThread();
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
  }

  function handleThreadClick(e: MouseEvent) {
    if (message && (!thread_id || !thread)) return;
    e.preventDefault();
    handleThread(e);
  }

  function handleThreadKeypress(e: KeyboardEvent) {
    if (message && (!thread_id || !thread)) return;
    e.preventDefault();
    if (e.code === "Enter") {
      handleThread(e);
    }
  }

  function handleThreadStarClick(e: MouseEvent) {
    e.stopImmediatePropagation();
    //#region starred/unstarred
    if (activeThread) {
      activeThread.starred = !activeThread.starred;
      saveActiveThread();
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
    fetchEmail({ component_id: id, message_id: message_id }).then((json) => {
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
    const today = new Date();
    const yesterday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - 1,
    );
    const lastWeek = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - 6,
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
</script>

<style lang="scss">
  @use 'sass:list';
  @import "../../theming/reset.scss";
  @import "../../theming/animation.scss";
  @import "../../theming/variables.scss";

  $border-style: 1px solid #ebebeb;
  $hover-outline-width: 2px;
  $collapsed-height: 56px;
  $mobile-collapsed-height: fit-content;
  $spacing-s: 0.5rem;
  $spacing-m: 1rem;
  $spacing-l: 1.5rem;

  main {
    height: 100%;
    width: 100%;
    position: relative;
    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    .email-row {
      background: var(--nylas-email-background, var(--grey-lightest));
      border: var(--nylas-email-border, #{$border-style});

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
        padding: $spacing-s;
        padding-bottom: 0;
      }
      &.condensed {
        height: $mobile-collapsed-height;
        padding: $spacing-s;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;

        .from-star {
          display: grid;
          grid-template-columns: 25px auto;
          column-gap: $spacing-s;
        }

        .mobile-subject-snippet {
          display: block;
          font-size: 14px;
          margin-top: $spacing-s;
          flex-basis: 100%;

          .subject {
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
            max-width: 80vw;
            display: block;
            word-break: keep-all;
          }

          .snippet {
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
            display: block;
            max-width: 80vw;
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
      }
      &.expanded {
        background: var(--white);
        padding: 0;
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
          padding: $spacing-s;

          &.condensed {
            div.snippet {
              text-overflow: ellipsis;
              overflow: hidden;
              white-space: nowrap;
              display: block;
              max-width: 90vw;
              color: var(--grey);
              margin-top: $spacing-m;
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

          div.message-head {
            display: flex;
            justify-content: space-between;
          }
          div.message-date {
            display: flex;
            color: gray;
            font-size: 12px;
          }

          div.message-from {
            display: flex;
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
              div.message-to {
                color: gray;
                max-width: 150px;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
              }
            }
            &:hover {
              cursor: default;
            }
          }
          &.condensed {
            gap: 1rem;
            box-shadow: inset 0 -1px 0 0 rgb(100 121 143 / 12%);
            &:hover,
            &:focus {
              box-shadow: inset 1px 0 0 #dadce0, inset -1px 0 0 #dadce0,
                0 1px 2px 0 rgb(60 64 67 / 30%),
                0 1px 3px 1px rgb(60 64 67 / 15%);
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
        border: var(
          --nylas-email-border,
          #{$hover-outline-width} solid var(--grey-warm)
        );
        cursor: pointer;
      }
      .from-message-count {
        align-items: center;
        display: grid;
        grid-template-columns: repeat(4, auto);
        grid-gap: $spacing-m;
        justify-content: flex-start;
        max-width: 300px;

        .from-participants {
          overflow: hidden;
          max-width: 180px;
          white-space: nowrap;
          text-overflow: ellipsis;
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
        header {
          padding: $spacing-m $spacing-l 0;
        }

        &.expanded.singular {
          .individual-message.expanded {
            padding-top: $spacing-s;
          }
        }
        &.condensed {
          padding: 0 $spacing-s;
          display: grid;
          column-gap: $spacing-m;
          height: $collapsed-height;
          grid-template-columns: 300px auto;
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
          div.individual-message {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: $spacing-m 0;

            div.message-head,
            div.message-body {
              width: 100%;
              box-sizing: border-box;
              padding: 0 $spacing-l;
            }

            &.condensed {
              div.snippet {
                width: 100%;
                box-sizing: border-box;
                padding: 0 $spacing-l;
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
                  margin: $spacing-s 0;
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
          grid-template-columns: auto 120px;
          gap: 1rem;
          .desktop-subject-snippet {
            display: block;

            .subject {
              margin-right: $spacing-s;
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
        {#if thread.expanded}
          <div
            class="email-row expanded {click_action === 'mailbox'
              ? 'expanded-mailbox-thread'
              : ''}"
          >
            {#if click_action !== "mailbox"}
              <header>{thread.subject}</header>
            {/if}
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
                  on:click={(e) => handleEmailClick(e, msgIndex)}
                  on:keypress={(e) => handleEmailKeypress(e, msgIndex)}
                >
                  {#if message.expanded || msgIndex === activeThread.messages.length - 1}
                    <div class="message-head">
                      <div class="message-from-to">
                        <div class="message-from">
                          <span class="name"
                            >{message.from[0].name ||
                              message.from[0].email}</span
                          >

                          <Tooltip {message} id={message.id.slice(0, 3)}>
                            <span slot="icon">
                              <DropdownSymbol
                                class="icon-container"
                                aria-hidden="true"
                              />
                            </span>
                          </Tooltip>
                        </div>
                        <div class="message-to">
                          {#each message.to as to, i}
                            <span>
                              {#if to.name || to.email || you.email_address}
                                to&colon;&nbsp;{to.email === you.email_address
                                  ? "me"
                                  : to.name || to.email}
                                {#if i !== message.to.length - 1}
                                  &nbsp;&comma;
                                {/if}
                              {/if}

                              <Tooltip {message} id={message.id.slice(0, 4)}>
                                <span slot="icon">
                                  <DropdownSymbol
                                    class="icon-container"
                                    aria-hidden="true"
                                  />
                                </span>
                              </Tooltip>
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
                      {#if message.body}
                        {@html message.body}
                      {:else}
                        {message.snippet}
                      {/if}
                    </div>
                  {:else}
                    <div class="message-head">
                      <div class="message-from">
                        <span class="name"
                          >{message.from[0].name || message.from[0].email}</span
                        >

                        <Tooltip {message} id={message.id.slice(0, 3)}>
                          <span slot="icon">
                            <DropdownSymbol
                              class="icon-container"
                              aria-hidden="true"
                            />
                          </span>
                        </Tooltip>
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
            class:unread={unread !== null ? unread : activeThread.unread}
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
                    <nylas-contact-image {contact_query} {contact} />
                  </div>
                {/if}
                <div class="from-participants">
                  {#if activeThread.messages.length >= 1 && activeThread.messages[activeThread.messages.length - 1].from.length}
                    <span class="from-sub-section"
                      >{activeThread.messages[activeThread.messages.length - 1]
                        .from[0].name ||
                        activeThread.messages[activeThread.messages.length - 1]
                          .from[0].email}</span
                    >
                  {/if}
                  {#if activeThread.messages.length > 1 && activeThread.messages[0].from.length && activeThread.messages[0].from[0].email !== activeThread.messages[activeThread.messages.length - 1].from[0].email}
                    ,
                    <span class="from-sub-section"
                      >{activeThread.messages[0].from[0].name ||
                        activeThread.messages[0].from[0].email}</span
                    >
                  {/if}
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
              {#if show_received_timestamp}
                <div class="date">
                  <span>
                    {formatPreviewDate(
                      new Date(thread.last_message_timestamp * 1000),
                    )}
                  </span>
                </div>
              {/if}
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
        {#if show_contact_avatar}
          <div class="default-avatar">
            <nylas-contact-image {contact_query} {contact} />
          </div>
        {/if}
        <header>{message.subject}</header>
        <div class="individual-message expanded">
          <div class="message-head">
            <div class="message-from-to">
              <div class="message-from">
                <span class="name"
                  >{message.from[0].name || message.from[0].email}</span
                >

                <Tooltip {message} id={message.id}>
                  <span slot="icon">
                    <DropdownSymbol class="icon-container" aria-hidden="true" />
                  </span>
                </Tooltip>
              </div>
              {#each message.to as to, i}
                <span>
                  {#if to.name || to.email || you.email_address}
                    to&colon;&nbsp;{to.email === you.email_address
                      ? "me"
                      : to.name || to.email}
                    {#if i !== message.to.length - 1}
                      &nbsp;&comma;
                    {/if}

                    <Tooltip {message} id={message.id.slice(0, 3)}>
                      <span slot="icon">
                        <DropdownSymbol
                          class="icon-container"
                          aria-hidden="true"
                        />
                      </span>
                    </Tooltip>
                  {/if}
                </span>
              {/each}
            </div>
            <div class="message-date">
              <span> {formatPreviewDate(new Date(message.date * 1000))}</span>
            </div>
          </div>
          <div class="message-body">
            {@html message.body}
          </div>
        </div>
      </div>
    {/if}
  {/if}
</main>
