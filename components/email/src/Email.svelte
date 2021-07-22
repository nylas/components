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
    ErrorStore,
  } from "@commons";
  import { get_current_component, onMount, tick } from "svelte/internal";
  import {
    buildInternalProps,
    getEventDispatcher,
    getPropertyValue,
  } from "@commons/methods/component";

  let manifest: Partial<Nylas.EmailProperties> = {};

  const dispatchEvent = getEventDispatcher(get_current_component());
  $: dispatchEvent("manifestLoaded", manifest);

  export let id: string = "";
  export let access_token: string = "";
  export let thread_id: string = "";
  // export let messages: Nylas.Message[] = [];
  export let message_id: string = "";
  export let theme: string;
  export let show_received_timestamp: boolean;
  export let show_number_of_messages: boolean;
  export let thread: Nylas.Thread | null;
  export let message: Nylas.Message | null;
  export let click_action: "default" | "custom" = "default";
  export let show_star: boolean;
  export let unread: boolean | null = null;
  export let you: Partial<Nylas.Account> = {};

  onMount(async () => {
    await tick(); // https://github.com/sveltejs/svelte/issues/2227
    manifest = ((await $ManifestStore[
      JSON.stringify({ component_id: id, access_token })
    ]) || {}) as Nylas.EmailProperties;
  });

  let main: Element;
  let messageRefs: Element[] = [];
  let messageLoadStatus: string[] = []; // "loading" | "loaded"

  // The reference to $$props is lost each time it gets updated, so we have to rebuild the proxy each time
  // TODO - Find a way to improve this
  let internalProps;
  $: internalProps = buildInternalProps($$props, manifest);

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
  }

  let participants: Nylas.Participant[] = [];
  $: participants = activeThread ? activeThread.participants : [];

  let query: Nylas.ConversationQuery;
  $: query = {
    component_id: id,
    thread_id: thread_id,
  };

  let queryKey: string;
  $: queryKey = JSON.stringify(query);

  let activeThread: Nylas.Conversation;

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
    ) as Nylas.Conversation;
    if (!foundThread) {
      // Thread does not exist in the store, assume it was passed in
      activeThread = thread as Nylas.Conversation;
    } else {
      // It's already in the store! Great.
      activeThread = foundThread;
    }
  } else if (thread_id) {
    // We don't have a passed thread, but we do have a thread_id. Let's fetch it.
    MailboxStore.getThread(query).then(() => {
      let foundThread = $Threads.find(
        (storedThread) => storedThread.id === thread_id,
      ) as Nylas.Conversation;
      if (foundThread) {
        activeThread = foundThread;
      }
    });
  }
  // #endregion thread intake and set
  let emailManuallyPassed;
  $: emailManuallyPassed = !!thread;

  $: if (id && !you.id) {
    fetchAccount({ component_id: query.component_id }).then(
      (account: Nylas.Account) => {
        you = account;
      },
    );
  }

  function saveActiveThread() {
    // if thread and if component_id (security)
    if (activeThread && query.component_id && thread_id) {
      updateThread(query, activeThread).then((thread) => {
        $MailboxStore[queryKey] = [thread];
      });
    }
  }

  function handleThread(e: MouseEvent | KeyboardEvent) {
    if (click_action === "default") {
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
      if (activeThread.expanded) {
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
</script>

<style lang="scss">
  @use 'sass:list';
  @import "../../theming/reset.scss";
  @import "../../theming/animation.scss";
  @import "../../theming/variables.scss";

  $border-style: 1px solid var(--grey-lighter);
  $hover-outline-width: 2px;
  $collapsed-height: 56px;
  $spacing-s: 0.5rem;
  $spacing-m: 1rem;

  main {
    height: 100%;
    width: 100%;
    overflow: auto;
    position: relative;
    .email-row {
      display: grid;
      grid-column-gap: $spacing-m;
      padding: $spacing-s;
      background: var(--nylas-email-background, var(--grey-lightest));
      border: var(--nylas-email-border, #{$border-style});
      header {
        font-size: 1.2rem;
        font-weight: 700;
      }
      &.condensed {
        height: $collapsed-height;
        padding: 0 $spacing-m;
        grid-template-columns: 200px auto;
        align-items: center;
        &.show_star {
          grid-template-columns: 25px 200px auto;
        }
        &.unread {
          background: var(--nylas-email-background, white);
          .from-participants,
          .date {
            font-weight: bold;
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
              font-size: 1.5em;
              color: #ccc;
              -webkit-user-select: none;
              -moz-user-select: none;
              user-select: none;
            }

            &.starred:before {
              color: #ffc107;
            }

            &:hover:before {
              color: #ffc107;
            }
          }
        }
      }
      &.expanded {
        overflow-y: scroll;
        background: rgba(211, 211, 211, 0.302);
        div.individual-message {
          display: grid;
          padding: 1rem 0;
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
          &.expanded {
            div.message-head {
              display: flex;
              justify-content: space-between;
              align-items: center;
              div.message-from-to {
                margin: 0.5rem 0;
                div.message-from {
                  display: flex;
                  span {
                    &.name {
                      font-weight: 600;
                      margin-right: 0.5rem;
                    }
                    &.email {
                      color: gray;
                    }
                  }
                }
                div.message-to {
                  display: flex;
                  color: gray;
                }
              }
              div.message-date {
                display: flex;
                color: gray;
              }
            }
            &:hover {
              cursor: default;
            }
          }
          &.condensed {
            grid-template-columns: 100px auto;
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
      .from-participants {
        display: grid;
        grid-template-columns: auto auto auto;
        justify-content: flex-start;
        .from-sub-section {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
      .subject-snippet-date {
        display: grid;
        grid-template-columns: 1fr 70px;
        gap: 1rem;
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
            width: min-content;
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
          <div class="email-row expanded">
            <header>{thread.subject}</header>
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
                          <span class="name">{message.from[0].name}</span>
                          <span class="email"
                            >&lt;{message.from[0].email}&gt;</span
                          >
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
                            </span>
                          {/each}
                        </div>
                      </div>
                      <div class="message-date">
                        <span
                          >{new Date(
                            message.date * 1000,
                          ).toLocaleDateString()}</span
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
                    <span>{message.from[0].name || message.from[0].email}</span>
                    <span class="snippet">
                      <span
                        class={messageLoadStatus[msgIndex] === "loading"
                          ? "loading"
                          : "initial"}>Expanding your message...</span
                      >{message.snippet}</span
                    >
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
            <div class="from-participants">
              {#if activeThread.messages.length >= 1 && activeThread.messages[0].from.length}
                <span class="from-sub-section"
                  >{activeThread.messages[0].from[0].name ||
                    activeThread.messages[0].from[0].email}</span
                >
              {/if}
              {#if activeThread.messages.length > 1 && activeThread.messages[activeThread.messages.length - 1].from.length}
                <span class="from-sub-section">
                  {", " +
                    activeThread.messages[activeThread.messages.length - 1]
                      .from[0].name ||
                    activeThread.messages[activeThread.messages.length - 1]
                      .from[0].email}</span
                >
                {#if show_number_of_messages}
                  <span>{", " + activeThread.messages.length}</span>
                {/if}
              {/if}
            </div>
            <div class="subject-snippet-date">
              <div>
                <span class="subject">{thread.subject}</span><span
                  class="snippet"
                >
                  &#45; {thread.snippet}</span
                >
              </div>
              {#if show_received_timestamp}
                <div class="date">
                  <span>
                    {new Date(
                      thread.last_message_timestamp * 1000,
                    ).toLocaleDateString()}
                  </span>
                </div>
              {/if}
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
              <div class="message-from">
                <span class="name">{message.from[0].name}</span>
                <span class="email">&lt;{message.from[0].email}&gt;</span>
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
                  </span>
                {/each}
              </div>
            </div>
            <div class="message-date">
              <span>{new Date(message.date * 1000).toLocaleDateString()}</span>
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
