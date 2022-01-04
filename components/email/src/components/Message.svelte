<svelte:options tag="nylas-message" />

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

  import DropdownSymbol from "../assets/chevron-down.svg";
  import ReplyIcon from "../assets/reply.svg";
  import ReplyAllIcon from "../assets/reply-all.svg";
  import LoadingIcon from "../assets/loading.svg";

  const dispatchEvent = getEventDispatcher(get_current_component());

  export let id: string = "";
  export let access_token: string = "";

  export let message: Message;
  export let message_id: string;

  export let clean_conversation: boolean;
  export let click_action: "default" | "mailbox" | "custom" = "default";
  export let show_contact_avatar: boolean;
  export let show_expanded_email_view_onload: boolean;
  export let show_number_of_messages: boolean;
  export let show_received_timestamp: boolean;
  export let show_star: boolean;
  export let show_thread_actions: boolean;
  export let theme: string;
  export let thread_id: string;
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

  let messageElement: Element;
  let mounted: boolean = false;
  let _this = <EmailProperties>buildInternalProps({}, {}, defaultValueMap);

  let currentTooltipId: string = "";
  let query: ConversationQuery;
  let labels: Label[] = [];
  let folders: Folder[] = [];
  let contact_query: ContactSearchQuery;
  let contacts: Record<string, Contact> = {};
  let emailManuallyPassed: boolean;
  let userEmail: string | undefined;
  onMount(async () => {
    await tick();

    _this = buildInternalProps($$props, {}, defaultValueMap) as EmailProperties;

    // console.log("message props", $$props);
    // console.log("message _this", _this);

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

  function setTooltip(event: any) {
    currentTooltipId = event.detail.tooltipID;
  }

  function handleEmailClick(
    e: MouseEvent & { currentTarget: EventTarget & HTMLElement },
    id: string,
  ): any {
    throw new Error("Function not implemented.");
  }

  function handleEmailKeypress(
    e: KeyboardEvent & { currentTarget: EventTarget & HTMLElement },
    id: string,
  ): any {
    throw new Error("Function not implemented.");
  }

  $: query = {
    access_token,
    component_id: id,
    thread_id: _this.thread_id,
  };
</script>

<style lang="scss">
  @use "sass:list";
  @import "../../../theming/reset.scss";
  @import "../../../theming/animation.scss";
  @import "../../../theming/variables.scss";

  @import "../Email.scss";
</style>

{#if message}
  <article
    class="nylas-message"
    bind:this={messageElement}
    on:click|stopPropagation={(e) => handleEmailClick(e, message.id)}
    on:keypress={(e) => handleEmailKeypress(e, message.id)}
  >
    <header class="message-head">
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
              : message?.from[0].name || message?.from[0].email}</span
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
      <div class="message-date">
        <span>
          {formatExpandedDate(new Date(message.date * 1000))}
        </span>
      </div>
    </header>
    <section>
      <section />
    </section>
    <footer />
  </article>
{/if}
