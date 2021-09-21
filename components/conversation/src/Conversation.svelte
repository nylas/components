<svelte:options tag="nylas-conversation" />

<script lang="ts">
  import {
    ConversationStore,
    ManifestStore,
    fetchContactImage,
    sendMessage,
    fetchContactsByQuery,
    fetchAccount,
    fetchCleanConversations,
  } from "@commons";
  import { afterUpdate } from "svelte";
  import { get_current_component, onMount } from "svelte/internal";
  import {
    buildInternalProps,
    getEventDispatcher,
    getPropertyValue,
  } from "@commons/methods/component";
  import type {
    Participant,
    ConversationProperties,
    ConversationQuery,
    Message,
    Conversation,
    Account,
  } from "@commons/types/Nylas";
  import "../../contacts-search/src/ContactsSearch.svelte";

  export let id: string = "";
  export let access_token: string = "";
  export let thread_id: string = "";
  export let messages: Message[] = [];
  export let theme: string;
  export let show_avatars: boolean | string;
  export let show_reply: boolean | string;

  let manifest: Partial<ConversationProperties> = {};

  const dispatchEvent = getEventDispatcher(get_current_component());
  $: dispatchEvent("manifestLoaded", manifest);

  onMount(async () => {
    manifest = ((await $ManifestStore[
      JSON.stringify({ component_id: id, access_token })
    ]) || {}) as ConversationProperties;
  });

  $: messages = conversation?.messages || [];

  let participants: Participant[] = [];
  $: participants = conversation?.participants || [];

  let main: Element;

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

  $: {
    theme = getPropertyValue(internalProps.theme, theme, "theme-1");
    show_avatars = getPropertyValue(
      internalProps.show_avatars,
      show_avatars,
      false,
    );
    show_reply = getPropertyValue(internalProps.show_reply, show_reply, false);
  }

  $: hideAvatars = show_avatars === false || show_avatars === "false"; // can be boolean or string, for developer experience reasons. Awkward for us, better for them.

  let query: ConversationQuery;

  $: query = {
    component_id: id,
    thread_id: thread_id,
  };

  let queryKey: string;
  $: queryKey = JSON.stringify(query);

  let conversation: Conversation | null = null;
  let status: "loading" | "loaded" | "error" = "loading";

  $: {
    if (id && thread_id) {
      setConversation();
    }
  }

  $: {
    if (messages.length && !messages.filter((m) => m.conversation).length) {
      cleanConversation();
    }
  }

  //#region Contacts
  $: {
    if (participants.length) {
      setContacts(participants);
    }
  }

  function setContacts(participants: Participant[]) {
    participants
      .filter((participant) => participant.contact === undefined) // only the ones that aren't yet hydrated
      .forEach((participant) => {
        fetchContactsByQuery({
          component_id: id,
          // contact_id: participant.id
          query: `?email=${participant.email}`,
          access_token,
        }).then((contacts) => {
          if (contacts.length) {
            participant.contact = contacts[0];
          } else {
            participant.contact = null;
          }
        });
      });
  }

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

  const handleContactsChange =
    (field: "to" | "from" | "cc") => (data: Participant[]) => {
      reply[field] = data;
    };

  let lastMessage: Message;
  let lastMessageInitialised = false;
  $: if (messages) {
    lastMessage = messages[messages.length - 1];
    lastMessageInitialised = true;
  }

  // If you sent the last message, initilize your TO to the reply's TO.
  // If someone else sent the last message, initialize your TO to the reply's FROM.
  $: if (lastMessage && lastMessageInitialised) {
    lastMessageInitialised = false;
    if (lastMessage.from[0].email === you.email_address) {
      reply.to = lastMessage.to;
      reply.cc = lastMessage?.cc || [];
    } else {
      reply.to = lastMessage.from;
      reply.cc = [...lastMessage.cc, ...lastMessage.to];
    }
    reply.cc = reply.cc.filter(
      (recipient) => recipient.email !== you.email_address,
    );
  }

  $: if (you.email_address) {
    reply.from = [{ name: you.name, email: you.email_address }];
  }

  let replyStatus: string = "";

  //#endregion Reply

  let you: Partial<Account> = { name: "" };
  $: if (id && !you.id)
    fetchAccount({ component_id: query.component_id }).then(
      (account: Account) => {
        you = account;
      },
    );

  const CONVERSATION_ENDPOINT_MAX_MESSAGES = 20;

  //#region Clean Conversation
  function cleanConversation() {
    fetchCleanConversations({
      component_id: id,
      message_id: messages
        .slice(-CONVERSATION_ENDPOINT_MAX_MESSAGES)
        .map((message) => message.id),
    }).then((results) => {
      results.forEach((msg: Message) => {
        let existingMessage = messages.find((message) => message.id === msg.id);
        if (existingMessage) {
          existingMessage.conversation = msg.conversation;
          existingMessage.body = msg.body;
        }
      });
      messages = messages;
    });
    return true;
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
</script>

<style lang="scss">
  @use 'sass:list';
  @import "../../theming/reset.scss";
  @import "../../theming/animation.scss";
  @import "../../theming/variables.scss";
  @import "../../theming/themes.scss";

  $contactWidth: 32px;
  main {
    height: 100%;
    width: 100%;
    overflow: auto;
    position: relative;
    background-color: #eee;
  }
  $avatar-size: 32px;
  $min-horizontal-space-between-participants: 4rem;

  header {
    display: flex;
    background: white;
    padding: 15px 32px;
    gap: 32px;
  }

  .messages {
    display: grid;
    gap: 1rem;
    padding: 1rem;
    .message {
      width: clamp(
        200px,
        calc(
          100% - #{$avatar-size} - #{$min-horizontal-space-between-participants}
        ),
        700px
      );
      display: grid;
      column-gap: 1rem;
      row-gap: 0.25rem;
      grid-template-columns: $contactWidth 1fr;
      transition: 0.5s;
      &:last-child {
        padding-bottom: 2rem;
      }

      header {
        grid-column: -1 / 2;
        display: grid;
        grid-template-columns: 1fr 1fr;
        font-size: 0.8rem;
        opacity: 0.75;
        overflow: hidden;
        .date {
          text-align: right;
        }
        &.hidden {
          display: none;
        }
      }
      .body {
        border-radius: 4px;
        background-color: white;
        border-bottom: 10px solid;
        box-shadow: 1px 1px 30px rgba(0, 0, 0, 0.05);
        border-color: inherit;
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
          border-radius: 16px;
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
        }
        .email {
          font-size: 0.8rem;
          color: #555;
          width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }

      p {
        padding: 1rem;
        color: black;
        font-weight: 300;
        line-height: 1.3em;
        font-size: 0.9em;
        border-radius: 8px;
        white-space: pre-line; // maintains newlines from conversation
        &.snippet {
          color: rgba(0, 0, 0, 0.5);
          &:before {
            content: "Expanding your message; please wait...";
            color: rgba(0, 0, 0, 1);
          }
        }
      }
      &.you {
        justify-self: end;
        grid-template-columns: 1fr $contactWidth;

        header {
          grid-column: 1 / 1;
        }

        .contact {
          order: 2;
        }
        .body {
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

    .reply {
      background: #ddd;
      padding: 1rem;
      margin: 1rem -1rem -1rem;
      form {
        button[type="submit"] {
          &:disabled {
            cursor: not-allowed;
            background: gray;
          }
        }
      }
      span.to {
        --background: gray;
      }
      span.to,
      span.cc {
        display: inline-block;
        padding: 0 1rem 0 0;

        & > span {
          display: inline-block;
          margin-right: 0.5rem;
        }
      }

      .response {
        width: 100%;
        display: grid;
        grid-template-columns: 1fr 100px;
        gap: 1rem;
        margin-top: 0.5rem;
        input {
          padding: 0.5rem;
        }
        button {
          background-color: black;
          font-weight: 500;
          color: white;
        }
      }
    }
  }
</style>

<nylas-error {id} />
<main bind:this={main}>
  {#await conversation}
    Loading Component...
  {:then _}
    <header>
      {#if reply.to.length > 0}
        <span>to: {reply.to.map((p) => p.email).join(", ")} </span>
      {/if}
      {#if reply.cc.length > 0}
        <span>cc: {reply.cc.map((p) => p.email).join(", ")} </span>
      {/if}
    </header>
    {#if status === "loading"}Loading Messages...{/if}
    <div class="messages {theme}" class:dont-show-avatars={hideAvatars}>
      {#each messages as message, i}
        {#await message.from[0] then from}
          {#await messages[i - 1] ? messages[i - 1].from[0] : { name: "", email: "" } then previousFrom}
            {#await participants.findIndex((p) => p.email === from.email && p.name === from.name) then participantIndex}
              {#await from.email === you.email_address then isYou}
                <article
                  class="message member-{participantIndex + 1}"
                  class:you={isYou}
                >
                  <header
                    class:hidden={previousFrom.email === from.email &&
                      previousFrom.name === from.name}
                  >
                    <span class="email">
                      <!-- A lot of services, like dropbox or github, use same-email, different-name to differentiate who posted a message to a shared thread -->
                      {#if participants.filter((p) => p.email === from.email).length > 1}
                        {from.name}
                      {:else}{from.email}{/if}
                    </span>
                    <span class="date">
                      <!-- If today: show time. Else: show date. -->
                      {#if new Date().toDateString() === new Date(message.date * 1000).toDateString()}
                        {new Date(message.date * 1000).toLocaleTimeString()}
                      {:else}
                        {new Date(message.date * 1000).toLocaleDateString()}
                      {/if}
                    </span>
                  </header>
                  <div class="contact">
                    {#await (participants[participantIndex] || {}).contact then contact}
                      <div class="avatar">
                        {#if contact}
                          {#if contact.picture && contact.picture !== "loading"}
                            <img
                              alt={contact.emails[0].email}
                              src="data:image/jpg;base64,{contact.picture}"
                            />
                          {:else if contact.picture_url}
                            {#if !hideAvatars}
                              {(contact.picture = "loading")}
                              {fetchContactImage(query, contact.id).then(
                                (image) => {
                                  contact.picture = image;
                                },
                              )}
                            {/if}
                          {:else if contact.given_name && contact.surname}
                            {contact.given_name[0] + contact.surname[0]}
                          {:else}{contact.emails[0].email.slice(0, 2)}{/if}
                        {:else if from.email === you.name}
                          {you.name.slice(0, 2)}
                        {:else if from.name}
                          {from.name.slice(0, 2)}
                        {:else if from.email}{from.email.slice(0, 2)}{/if}
                      </div>
                    {/await}
                  </div>
                  <div class="body">
                    {#if message.conversation}
                      <p>{message.conversation}</p>
                      <!-- else if it's there but blank -->
                    {:else if message.hasOwnProperty("conversation") && !message.conversation}
                      <p>
                        {@html message.body}
                      </p>
                    {:else}
                      <p class="snippet">{message.snippet}</p>
                    {/if}
                  </div>
                </article>
              {/await}
            {/await}
          {/await}
        {/await}
      {/each}
      {#if show_reply}
        <div class="reply">
          <form
            on:submit={(e) => {
              if (replyStatus !== "sending") {
                e.preventDefault();
                replyStatus = "sending";
                if (!conversation) {
                  return;
                }
                sendMessage(id, {
                  from: reply.from,
                  to: reply.to,
                  body: `${replyBody} <br /><br /> --Sent with Nylas`,
                  subject: conversation.subject,
                  cc: reply.cc,
                  reply_to_message_id: lastMessage.id,
                  bcc: [],
                }).then((res) => {
                  const conversationQuery = { queryKey: queryKey, data: res };
                  ConversationStore.addMessageToThread(conversationQuery);
                  replyStatus = "";
                  replyBody = "";
                });
              }
            }}
          >
            <span class="to">
              <nylas-contacts-search
                placeholder="to:"
                change={handleContactsChange("to")}
                contacts={reply.to}
                value={reply.to}
                show_dropdown={false}
              />
            </span>
            <span class="cc">
              <nylas-contacts-search
                placeholder="cc:"
                change={handleContactsChange("cc")}
                contacts={reply.cc}
                value={reply.cc}
                show_dropdown={false}
              />
            </span>
            <label class="response">
              <input
                type="text"
                placeholder="Type a Response"
                bind:value={replyBody}
              />
              <button type="submit" disabled={!reply.to.length}>
                {#if replyStatus === "sending"}Sending...{:else}Send{/if}
              </button>
            </label>
          </form>
        </div>
      {/if}
    </div>
  {/await}
</main>
