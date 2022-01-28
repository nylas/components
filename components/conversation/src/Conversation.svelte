<svelte:options tag="nylas-conversation" />

<script lang="ts">
  import {
    ContactStore,
    ConversationStore,
    ErrorStore,
    fetchAccount,
    fetchCleanConversations,
    ManifestStore,
    sendMessage,
  } from "@commons";
  import "@commons/components/NError.svelte";
  import "@commons/components/ContactImage/ContactImage.svelte";
  import "@commons/components/ErrorMessage.svelte";
  import {
    buildInternalProps,
    getEventDispatcher,
  } from "@commons/methods/component";
  import { getDate } from "@commons/methods/datetime";
  import type { ContactSearchQuery } from "@commons/types/Contacts";
  import type {
    Account,
    Conversation,
    ConversationProperties,
    ConversationQuery,
    Message,
    Participant,
  } from "@commons/types/Nylas";
  import * as DOMPurify from "dompurify";
  import { afterUpdate } from "svelte";
  import { get_current_component, onMount } from "svelte/internal";
  import SendIcon from "./assets/send.svg";
  import ToggleIcon from "./assets/toggle.svg";

  export let id: string = "";
  export let access_token: string = "";

  export let messages: Message[] = [];
  export let show_avatars: boolean | string;
  export let show_reply: boolean | string;
  export let theme: string;
  export let thread_id: string;
  export let you: Partial<Account>;

  const defaultValueMap: Partial<ConversationProperties> = {
    show_avatars: false,
    show_reply: false,
    theme: "theme-1",
    thread_id: "",
    you: {},
  };

  let _this = <ConversationProperties>(
    buildInternalProps({}, {}, defaultValueMap)
  );
  let manifest: Partial<ConversationProperties> = {};

  const dispatchEvent = getEventDispatcher(get_current_component());
  $: dispatchEvent("manifestLoaded", manifest);

  $: if (Object.keys($ErrorStore).length) {
    dispatchEvent("onError", $ErrorStore);
  }

  let conversationManuallyPassed: boolean;
  $: conversationManuallyPassed = !!_this.messages && _this.messages.length > 0;

  onMount(async () => {
    manifest = ((await $ManifestStore[
      JSON.stringify({ component_id: id, access_token })
    ]) || {}) as ConversationProperties;

    _this = buildInternalProps(
      $$props,
      manifest,
      defaultValueMap,
    ) as ConversationProperties;

    // Fetch Account
    if (id && !_this.you?.id && !conversationManuallyPassed) {
      _this.you = await fetchAccount({
        component_id: query.component_id,
        access_token,
      });
    }
  });

  $: hasError = Object.keys($ErrorStore).length ? true : false;

  $: conversationMessages = conversationManuallyPassed
    ? _this.messages
    : conversation?.messages || [];

  let participants: Participant[] = [];
  $: participants = conversation?.participants || [];

  let main: Element;

  let previousProps = $$props;
  $: {
    if (JSON.stringify(previousProps) !== JSON.stringify($$props)) {
      _this = buildInternalProps(
        $$props,
        manifest,
        defaultValueMap,
      ) as ConversationProperties;
      previousProps = $$props;
    }
  }

  let query: ConversationQuery;

  $: query = {
    access_token,
    component_id: id,
    thread_id: _this.thread_id,
  };

  let queryKey: string;
  $: queryKey = JSON.stringify(query);

  let conversation: Conversation | null = null;
  let status: "loading" | "loaded" | "error" = "loading";

  $: {
    if (id && _this.thread_id) {
      setConversation();
    } else if (conversationManuallyPassed) {
      status = "loaded";
    }
  }

  $: {
    if (
      !conversationManuallyPassed &&
      conversationMessages.length &&
      !conversationMessages.filter((m) => m.conversation).length
    ) {
      cleanConversation();
    }
  }

  //#region Contacts
  let contacts: any = null;
  let contact_query: ContactSearchQuery;
  $: contact_query = {
    component_id: id,
    access_token,
    query: "",
  };

  $: (async () => {
    if (!contacts && conversation) {
      await getContacts(conversation);
    }
  })();

  async function getContacts(conversation: Conversation) {
    const fromParticipants =
      conversation.messages?.reduce<Record<string, Participant>>(
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

      if (participantEmail && !contacts[participantEmail]) {
        contacts[participantEmail] = await getContact(participant);
      }
    }
  }

  // #region get contact for ContactImage
  async function getContact(participant: Participant) {
    contact_query["query"] = `?email=${participant.email}`;

    if (id) {
      let contact = $ContactStore[JSON.stringify(contact_query)];
      if (!contact) {
        contact = await ContactStore.addContact(contact_query);
      }
      return contact[0] ?? participant;
    } else {
      return participant;
    }
  }
  // #endregion get contact for ContactImage

  //#endregion Contacts

  async function setConversation() {
    if (query.component_id && query.thread_id) {
      status = "loading";
      conversation = await ConversationStore.getConversation(query);
      status = "loaded";
    }
  }

  //#region Reply
  interface Reply {
    to: Participant[];
    from: Participant[];
    cc: Participant[];
  }

  let reply: Reply = {
    to: [],
    from: [],
    cc: [],
  };

  let replyBody = "";
  let lastMessage: Message;
  let lastMessageInitialised = false;
  $: if (conversationMessages) {
    lastMessage = conversationMessages[conversationMessages.length - 1];
    lastMessageInitialised = true;
  }

  // If you sent the last message, initilize your TO to the reply's TO.
  // If someone else sent the last message, initialize your TO to the reply's FROM.
  $: if (lastMessage && lastMessageInitialised) {
    lastMessageInitialised = false;
    if (_this.you?.email_address) {
      if (lastMessage.from[0].email === _this.you?.email_address) {
        reply.to = lastMessage.to;
        reply.cc =
          lastMessage.cc.filter(
            (recipient) => recipient.email !== _this.you?.email_address,
          ) || [];
      } else {
        reply.to = lastMessage.from;
        reply.cc = [...lastMessage.cc, ...lastMessage.to].filter(
          (recipient) => recipient.email !== _this.you?.email_address,
        );
      }
    }
  }

  $: if (_this.you?.email_address) {
    reply.from = [{ name: _this.you?.name, email: _this.you?.email_address }];
  }

  let replyStatus: string = "";

  //#endregion Reply

  const CONVERSATION_ENDPOINT_MAX_MESSAGES = 20;

  //#region Clean Conversation
  function cleanConversation() {
    fetchCleanConversations({
      access_token,
      component_id: id,
      message_id: conversationMessages
        .slice(-CONVERSATION_ENDPOINT_MAX_MESSAGES)
        .map((message) => message.id),
    }).then((results) => {
      results.forEach((msg: Message) => {
        let existingMessage = conversationMessages.find(
          (message) => message.id === msg.id,
        );
        if (existingMessage) {
          existingMessage.conversation = msg.conversation;
          existingMessage.body = msg.body;
        }
      });
      conversationMessages = conversationMessages;
    });
    return true;
  }

  function _sendMessage(event: Event) {
    event.preventDefault();
    dispatchEvent("sendMessageClicked", {
      event,
      message: { ...reply, body: replyBody },
    });
    if (!conversation && conversationManuallyPassed) {
      replyBody = "";
      return;
    }
    if (replyStatus !== "sending") {
      replyStatus = "sending";
      if (!conversation) {
        return;
      }
      sendMessage(
        id,
        {
          from: reply.from,
          to: reply.to,
          body: `${replyBody} <br /><br /> --Sent with Nylas`,
          subject: conversation.subject,
          cc: reply.cc,
          reply_to_message_id: lastMessage.id,
          bcc: [],
        },
        access_token,
      ).then((res) => {
        const conversationQuery = { queryKey: queryKey, data: res };
        ConversationStore.addMessageToThread(conversationQuery);
        replyStatus = "";
        replyBody = "";
      });
    }
  }

  //#endregion Clean Conversation
  const scrollToBottom = () => {
    let scrollHeight;
    if (main) {
      scrollHeight = main.scrollHeight;
      main.scrollTo({ top: scrollHeight, left: 0, behavior: "smooth" });
    }
  };

  afterUpdate(scrollToBottom);

  // #region mobile header view
  let headerExpanded = false;
  // #endregion mobile header view
</script>

<style lang="scss">
  @use 'sass:list';
  @import "../../theming/reset.scss";
  @import "../../theming/animation.scss";
  @import "../../theming/variables.scss";
  @import "../../theming/themes.scss";

  $tabletBreakpoint: 768px;
  $desktopBreakpoint: 1140px;
  $contactWidth: 32px;
  $avatar-size: 32px;
  $headerHorizontalSpacing: 32px;
  $avatar-horizontal-space: 1rem;

  main {
    height: 100%;
    max-height: 100vh;
    width: 100%;
    overflow: auto;
    position: relative;
    font-family: sans-serif;
    background-color: var(--conversation-background, var(--grey-light));
  }
  .loading {
    @include progress-bar(
      top,
      calc(var(--fs-14) + 30px),
      left,
      0,
      var(--blue),
      var(--blue-lighter)
    );
    &.status {
      border-top: calc(var(--fs-14) + 30px) solid #fff;
      border-bottom: 50px solid #fff;
      height: calc(100vh - (var(--fs-14) + 80px));
      overflow: hidden;
    }
  }
  header {
    display: flex;
    background: var(--conversation-header-background, var(--white));
    min-height: var(--fs-14);
    padding: 15px $headerHorizontalSpacing;
    gap: $headerHorizontalSpacing;
    color: var(--conversation-header-color, var(--black));
    font-size: var(--fs-14);
    position: sticky;
    width: calc(100% - 64px);
    top: 0;
    z-index: 1;
    &.loading {
      @include progress-bar(
        bottom,
        0,
        left,
        0,
        var(--blue),
        var(--blue-lighter)
      );
    }
    &.error {
      @include progress-bar(bottom, 0, left, 0, var(--red), var(--red));
      &::before,
      &::after {
        animation: none;
        width: 100%;
      }
    }
    &.mobile {
      @media (min-width: $tabletBreakpoint) {
        display: none;
      }
      width: calc(100% - (#{$headerHorizontalSpacing} * 2));
      button {
        position: absolute;
        right: $headerHorizontalSpacing;
        top: 16px;
        background: none;
        display: flex;
      }
      &.expanded {
        display: grid;
        gap: 12px;
        button {
          rotate: 180deg;
        }
      }
    }
    &.tablet {
      display: none;
      @media (min-width: $tabletBreakpoint) {
        display: flex;
      }
    }
  }
  .messages {
    display: grid;
    gap: 1rem;
    padding: 1rem;
    padding: 61px 0 49px 0;
    .message {
      max-width: min(
        400px,
        calc(100% - #{$avatar-size} - #{$avatar-horizontal-space})
      );
      @media (min-width: $tabletBreakpoint) {
        width: max-content;
        max-width: 600px;
      }
      @media (min-width: $desktopBreakpoint) {
        max-width: 752px;
      }
      display: grid;
      column-gap: $avatar-horizontal-space;
      row-gap: 0.25rem;
      grid-template-columns: $contactWidth 1fr;
      grid-template-rows: auto auto;
      transition: 0.5s;
      &:last-child {
        padding-bottom: 2rem;
      }
      .body {
        border-radius: 8px;
        background-color: var(
          --conversation-peer-message-background,
          var(--white)
        );
        color: var(--conversation-peer-message-color, var(--black));
        max-height: 50vh;
        overflow: auto;
        position: relative;
      }
      .contact {
        display: flex;
        flex-direction: column;
        align-items: center;
        grid-template-rows: auto 1fr;
        gap: 0.5rem;
        .avatar {
          border-radius: 20px;
          width: $avatar-size;
          height: $avatar-size;
          text-align: center;
          color: white;
          font-size: 1rem;
          font-weight: bold;
          background-color: blue;
          overflow: hidden;
          display: grid;
          align-items: center;
          justify-items: center;
          img {
            width: 100%;
            height: 100%;
          }
          span {
            // perfectly center text
            padding-top: 4px;
          }
        }
        .email {
          font-size: 0.8rem;
          color: #555;
          width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
      .time {
        grid-column: 2/3;
        font-size: var(--fs-12);
        color: var(--grey-dark);
      }
      p {
        padding: 1rem;
        font-weight: 300;
        line-height: 1.3em;
        font-size: 0.9em;
        border-radius: 8px;
        white-space: pre-line; // maintains newlines from conversation
        &.after {
          padding-top: 0;
          margin-top: -1rem;
          color: var(--grey-dark);
        }
      }
      &.you {
        justify-self: end;
        grid-template-columns: 1fr $contactWidth;
        .contact {
          grid-row: 1/2;
          grid-column: 2/3;
        }
        .body {
          order: 1;
          grid-column: 1 / 1;
          color: var(--conversation-your-message-color, var(--white));
          background-color: var(
            --conversation-your-message-background,
            var(--blue)
          );
          p.after {
            color: var(--grey);
          }
        }
        .time {
          order: 1;
          grid-column: 1 / 1;
        }
      }
    }
    &.dont-show-avatars {
      .message {
        column-gap: 0;
        grid-template-columns: 0 1fr;
        width: clamp(200px, calc(100% - 4rem), 700px);
        .contact {
          overflow: hidden;
        }
        &.you {
          grid-template-columns: 1fr 0;
        }
      }
    }
  }

  .reply-box {
    position: sticky;
    width: 100%;
    bottom: 0;
    z-index: 1;
    form {
      position: relative;
      display: flex;
      align-items: center;
      button[type="submit"] {
        position: absolute;
        right: 1rem;
        border-radius: 4px;
        background-color: var(--blue);
        height: 28px;
        width: 28px;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        &:disabled {
          cursor: not-allowed;
          background-color: gray;
        }
      }
      input {
        border-top: 1px solid #ebebeb;
        height: 25px;
        padding: 12px 1rem;
        width: 100%;
        font-size: var(--fs-16);
        color: var(--conversation-reply-color, var(--grey-black));
        background-color: var(--conversation-reply-background, var(--white));
        &::placeholder {
          color: var(--conversation-reply-color, var(--grey));
        }
      }
    }
  }
</style>

<nylas-error {id} />
<main bind:this={main}>
  {#if hasError}
    <nylas-message-error error_message={$ErrorStore[id].message} />
  {/if}
  {#await conversation}
    <div class="loading status" />
  {:then _}
    <header
      class="mobile"
      class:loading={!!(status === "loading")}
      class:error={hasError}
      class:expanded={headerExpanded}
    >
      {#if reply.to.length}
        <span>to: {reply.to[0].email}</span>
      {/if}
      {#if reply.to.length > 1 || reply.cc.length}
        <button
          on:click={() => (headerExpanded = !headerExpanded)}
          aria-label="Toggle showing additional emails in this thread"
        >
          <ToggleIcon aria-hidden="true" />
        </button>
      {/if}
      {#if headerExpanded}
        <!-- Show rest of the emails -->
        {#each reply.to.slice(1) as contact}
          <span>to: {contact.email}</span>
        {/each}
        {#each reply.cc as contact}
          <span>cc: {contact.email}</span>
        {/each}
      {/if}
    </header>
    <header
      class="tablet"
      class:error={hasError}
      class:loading={!!(status === "loading")}
    >
      {#if reply.to.length}
        <span>to: {reply.to.map((p) => p.email).join(", ")} </span>
      {/if}
      {#if reply.cc.length}
        <span>cc: {reply.cc.map((p) => p.email).join(", ")} </span>
      {/if}
    </header>
    <div
      class="messages {_this.theme}"
      class:dont-show-avatars={!_this.show_avatars}
    >
      {#each conversationMessages as message, i}
        {#await message.from[0] then from}
          {#await from.email === _this.you.email_address then isYou}
            {#await participants.findIndex((p) => p.email === from.email && p.name === from.name) then participantIndex}
              <article
                class="message member-{participantIndex + 1}"
                class:you={isYou}
              >
                <div class="contact">
                  {#await contacts[from.email] then contact}
                    <div class="avatar">
                      <nylas-contact-image
                        {contact_query}
                        {contact}
                        height="32px"
                        width="32px"
                      />
                    </div>
                  {/await}
                </div>
                <div class="body">
                  {#if message.conversation}
                    <p>{message.conversation}</p>
                    <!-- else if it's there but blank -->
                  {:else if message.hasOwnProperty("conversation") && !message.conversation}
                    <p>
                      {@html DOMPurify.sanitize(message.body)}
                    </p>
                  {:else if message.snippet.includes(" On ")}
                    <p>{message.snippet.split("On ")[0]}</p>
                    <p class="after">On {message.snippet.split("On ")[1]}</p>
                  {:else}
                    <p>{message.snippet}</p>
                  {/if}
                </div>
                <div class="time">
                  {getDate(new Date(message.date * 1000))}
                </div>
              </article>
            {/await}
          {/await}
        {/await}
      {/each}
    </div>
    {#if _this.show_reply}
      <div class="reply-box">
        <form on:submit={_sendMessage}>
          <label for="send-response" class="sr-only">
            Type and send a response
          </label>
          <input
            id="send-response"
            type="text"
            placeholder="Type a Response"
            bind:value={replyBody}
          />
          <button
            type="submit"
            disabled={!reply.to.length}
            aria-label={`Send${replyStatus ? "ing" : ""} email`}
          >
            {#if replyStatus === "sending"}...{:else}
              <SendIcon aria-hidden="true" />
            {/if}
          </button>
        </form>
      </div>
    {/if}
  {:catch error}
    <nylas-message-error error_message={error.message} />
  {/await}
</main>
