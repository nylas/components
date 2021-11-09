<svelte:options tag="nylas-composer" immutable />

<script lang="ts">
  import "./components/HTMLEditor.svelte";
  import "./components/AlertBar.svelte";
  import "./components/Attachment.svelte";
  import "./components/DatepickerModal.svelte";
  import "../../contacts-search/src/ContactsSearch.svelte";
  import LoadingIcon from "./assets/loading.svg";
  import {
    ManifestStore,
    sendMessage,
    fetchAccount,
    uploadFile as nylasUploadFile,
  } from "@commons";
  import {
    buildInternalProps,
    getEventDispatcher,
  } from "@commons/methods/component";
  import { onMount, tick, get_current_component } from "svelte/internal";
  import pkg from "../package.json";

  const dispatchEvent = getEventDispatcher(get_current_component());
  $: dispatchEvent("manifestLoaded", manifest);

  import {
    message,
    update,
    mergeMessage,
    attachments,
    addAttachments,
    removeAttachments,
    resetAfterSend,
    updateAttachment,
  } from "./lib/store";
  import { formatDate } from "./lib/format-date";

  import CloseIcon from "./assets/close.svg";
  import MinimizeIcon from "./assets/dash.svg";
  import AttachmentIcon from "./assets/attachment.svg";
  import ExpandIcon from "./assets/expand.svg";
  import type {
    Message,
    SendCallback,
    FetchContactsCallback,
    Tracking,
    Attribute,
    ReplaceFields,
    Attachment,
  } from "@commons/types/Composer";
  import type {
    ComposerProperties,
    Account,
    Participant,
  } from "@commons/types/Nylas";
  import type { FetchContactsCallback as ContactsSearchFetchContactsCallback } from "@commons/types/ContactsSearch";

  let fileSelector: HTMLInputElement;

  type ContactSearchCallback =
    | Participant[]
    | ContactsSearchFetchContactsCallback;

  export let id: string | void;
  export let access_token: string = "";
  export let value: Message | void;
  export let to: ContactSearchCallback = [];
  export let from: ContactSearchCallback = [];
  export let cc: ContactSearchCallback = [];
  export let bcc: ContactSearchCallback = [];
  export let send: SendCallback;
  export let change: FetchContactsCallback | null = null;
  export let beforeSend: (msg: Message) => Message | void;
  export let afterSendSuccess: Function | null = null;
  export let afterSendError: Function | null = null;
  export let template: string = "";
  export let tracking: Tracking | null = null;

  // Attributes
  export let minimized: Attribute;
  export let reset_after_send: Attribute;
  export let show_from: Attribute;
  export let show_to: Attribute;
  export let show_header: Attribute;
  export let show_subject: Attribute;
  export let show_close_button: Attribute;
  export let show_minimize_button: Attribute;
  export let show_cc: Attribute;
  export let show_bcc: Attribute;
  export let show_cc_button: Attribute;
  export let show_bcc_button: Attribute;
  export let show_attachment_button: Attribute;
  export let show_editor_toolbar: Attribute;
  export let theme: string | void;
  export let replace_fields: ReplaceFields[] | null = null;
  export let beforeFileUpload: Function | null = null;
  export let afterFileUploadSuccess: Function | null = null;
  export let afterFileUploadError: Function | null = null;
  export let uploadFile: Function | null = null;
  export let beforeFileRemove: Function | null = null;
  export let afterFileRemove: Function | null = null;

  const defaultValueMap = {
    show_to: true,
    show_from: true,
    minimized: false,
    reset_after_send: true,
    show_header: false,
    show_subject: false,
    show_close_button: true,
    show_minimize_button: true,
    show_cc: false,
    show_bcc: false,
    show_cc_button: true,
    show_bcc_button: true,
    show_attachment_button: true,
    show_editor_toolbar: true,
    theme: "theme-1",
  };

  // Callbacks
  export const open = (): void => {
    visible = true;
    dispatchEvent("composerOpened", {});
  };

  export const close = (): void => {
    visible = false;
    dispatchEvent("composerClosed", {});
  };

  let isLoading = false;
  let internalProps: ComposerProperties = <any>{};
  let manifest: Partial<ComposerProperties>;
  let showDatepicker = false;
  let themeLoaded = false;
  let visible = true;

  onMount(async () => {
    isLoading = true;
    await tick();

    manifest =
      (await $ManifestStore[
        JSON.stringify({ component_id: id, access_token })
      ]) || {};

    if (manifest && id) {
      const account: Account = await fetchAccount({
        component_id: id,
        access_token,
      });
      if (account) {
        // Set "from" field from account
        update("from", [{ name: account.name, email: account.email_address }]);
        show_from = false;
      }
    }
    updateInternalProps(
      buildInternalProps(
        $$props,
        manifest,
        defaultValueMap,
      ) as ComposerProperties,
    );
    if (tracking) {
      // Set tracking on message object
      update("tracking", tracking);
    }

    isLoading = false;
    themeLoaded = true;
  });

  $: {
    const rebuiltProps = buildInternalProps(
      $$props,
      manifest,
      defaultValueMap,
    ) as ComposerProperties;
    if (JSON.stringify(rebuiltProps) !== JSON.stringify(internalProps)) {
      updateInternalProps(rebuiltProps);
    }
  }

  $: if (value) {
    mergeMessage(value);
  }

  $: {
  }

  function updateInternalProps(updatedProps: ComposerProperties) {
    internalProps = updatedProps;

    show_to = internalProps.show_to;
    show_from = internalProps.show_from;
    minimized = internalProps.minimized;
    reset_after_send = internalProps.reset_after_send;
    show_header = internalProps.show_header;
    show_subject = internalProps.show_subject;
    show_close_button = internalProps.show_close_button;
    show_minimize_button = internalProps.show_minimize_button;
    show_cc = internalProps.show_cc;
    show_bcc = internalProps.show_bcc;
    show_cc_button = internalProps.show_cc_button;
    show_bcc_button = internalProps.show_bcc_button;
    show_attachment_button = internalProps.show_attachment_button;
    show_editor_toolbar = internalProps.show_editor_toolbar;
    theme = internalProps.theme;
  }

  const handleInputChange = (e: Event) => {
    if (!e.target) return;
    const target = e.target as HTMLTextAreaElement;
    update(target.name, target.value);
  };

  const handleBodyChange = (html: string) => update("body", html);

  const handleContactsChange = (field: string) => (data: Participant[]) =>
    update(field, data);
  const schedule = (data: Date) => {
    showDatepicker = false;
    update("send_at", data);
  };
  const removeSchedule = () => {
    update("send_at", null);
  };
  const datePickerClose = () => {
    showDatepicker = false;
  };

  const handleFilesChange = async () => {
    if (!fileSelector?.files) {
      return;
    }

    const file = fileSelector.files[0];

    try {
      addAttachments({
        filename: file.name,
        size: file.size,
        content_type: file.type,
        loading: true,
        error: false,
      });
      fileSelector.value = "";
      if (beforeFileUpload) beforeFileUpload(file);

      const result = uploadFile
        ? await uploadFile(file)
        : id && (await nylasUploadFile(id, file, access_token));

      updateAttachment(file.name, { loading: false, id: result.id });
      // Update the message object
      if (result.id)
        mergeMessage({ file_ids: [...$message.file_ids, result.id] });
      if (afterFileUploadSuccess) afterFileUploadSuccess(result);
    } catch (e) {
      updateAttachment(file.name, { loading: false, error: true });
      if (afterFileUploadError) afterFileUploadError(e);
    }
  };

  const handleRemoveFile = (attachment: Attachment) => {
    if (beforeFileRemove) beforeFileRemove(attachment);
    removeAttachments(attachment);
    if (attachment.id) {
      mergeMessage({
        file_ids: $message.file_ids.filter(
          (id: string) => id !== attachment.id,
        ),
      });
    }
    if (afterFileRemove) afterFileRemove(attachment);
  };

  const handleMinimize = () => {
    minimized = !minimized;
    dispatchEvent(minimized ? "composerMinimized" : "composerMaximized", {});
  };

  let sendPending = false;
  let sendError = false;
  let sendSuccess = false;

  const handleSend = async () => {
    sendPending = true;
    sendError = false;
    sendSuccess = false;

    let msg = $message;
    if (beforeSend) {
      // If beforeSend returns value, it will replace the message
      const upd = beforeSend($message);
      // @ts-ignore
      if (upd) msg = upd;
    }
    if (send) {
      // Callback
      send(msg)
        .then((res) => {
          if (afterSendSuccess) afterSendSuccess(res);
          sendPending = false;
          sendSuccess = true;
        })
        .catch((err) => {
          if (afterSendError) afterSendError(err);
          if (reset_after_send) resetAfterSend($message.from);
          sendPending = false;
          sendError = true;
        });
    } else if (id) {
      // Middleware
      sendMessage(id, msg, access_token)
        .then((res) => {
          if (afterSendSuccess) afterSendSuccess(res);
          if (reset_after_send) resetAfterSend($message.from);
          sendPending = false;
          sendSuccess = true;
        })
        .catch((err) => {
          if (afterSendError) afterSendError(err);
          sendPending = false;
          sendError = true;
        });
    }
  };

  // Listener for message changes
  // @ts-ignore
  $: if ($message && change) change($message);
  // @ts-ignore
  $: datepickerTimestamp = $message.send_at * 1000;

  $: isSendable =
    !sendPending &&
    (id || send) &&
    $message.from.length &&
    ($message.to.length || $message.cc.length || $message.bcc.length);

  let themeUrl: string;
  $: if (!!theme) {
    if (theme.startsWith(".") || theme.startsWith("http")) {
      // If custom url supplied
      themeUrl = theme;
    } else if (theme) {
      themeUrl = `../themes/${theme}.css`;
    }
  }

  let bccField: HTMLElement;
  let ccField: HTMLElement;
  // when (b)cc field is removed, return focus to its respective trigger button
  const setFocus = async (triggerElement: HTMLElement) => {
    await tick(); // wait for trigger element to reappear
    if (triggerElement) {
      triggerElement.setAttribute("tabindex", "-1");
      triggerElement.focus();
      triggerElement.removeAttribute("tabindex");
    }
  };
</script>

<style lang="scss">
  .nylas-composer {
    // setting vars that contact-search uses
    --outer-padding: var(--composer-outer-width, 15px);
    --font-size-small: var(--composer-font-size-small, 12px);
    --text-light: var(--composer-text-light-color, #6e6e7a);
    --border: var(--composer-border-color, #f7f7f7);
    --border-radius: var(--composer-border-radius, 6px);
    --primary: var(--composer-primary-color, #5c77ff);
    --primary-light: var(--composer-primary-light-color, #f0f2ff);
    --text-secondary: var(--composer-text-secondary-color, #2247ff);

    width: var(--width, 100%);
    min-width: 300px;
    height: var(--height, 100%);
    min-height: 300px;
    background: var(--composer-background-color, white);
    border-radius: var(--composer-border-radius, 6px);
    box-shadow: var(
      --composer-shadow,
      0 1px 10px rgba(0, 0, 0, 0.11),
      0 3px 36px rgba(0, 0, 0, 0.12)
    );
    font-family: var(--composer-font, sans-serif);
    font-size: var(--composer-font-size, 14px);
    position: relative;
    display: grid;
    grid-template-rows: auto 1fr auto;
    &.popup {
      position: fixed;
      bottom: 10px;
      right: 10px;
      z-index: var(--z-index, 1000);
    }
    &.minimized {
      min-height: 0;
    }
    &__loader {
      height: var(--composer-editor-max-height, 480px);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--composer-text-light-color, #6e6e7a);
      box-shadow: none;
    }
    &__spinner {
      margin-right: 10px;
      width: 18px;
      animation: rotate 2s linear infinite;
    }
    *:focus {
      outline: 5px auto var(--composer-primary-color, #5c77ff);
    }
  }
  @keyframes rotate {
    to {
      transform: rotate(360deg);
    }
  }
  main {
    background: var(--bg);
    overflow: auto;
  }
  input {
    font-family: var(--composer-font, sans-serif);
  }
  header {
    border-top-left-radius: var(--composer-border-radius, 6px);
    border-top-right-radius: var(--composer-border-radius, 6px);
    border-bottom: 1px solid var(--composer-border-color, #f7f7f7);
    color: var(--composer-text-color, black);
    padding: 15px var(--composer-outer-padding, 15px);
    display: flex;
    font-weight: 600;
    align-items: center;
    justify-content: space-between;
    background: var(
      --composer-header-background-color,
      var(--composer-background-color, white)
    );
    &.minimized {
      border-bottom-left-radius: var(--composer-border-radius, 6px);
      border-bottom-right-radius: var(--composer-border-radius, 6px);
    }
  }
  footer {
    padding: 15px var(--composer-outer-padding, 15px);
    border-top: 1px solid var(--composer-border-color, #f7f7f7);
    display: flex;
    align-items: center;
    justify-content: flex-end;
    background: var(--bg);
  }
  .send-btn {
    border: 0;
    background: var(--composer-primary-color, #5c77ff);
    color: white;
    cursor: pointer;
    padding: 10px 25px;
    font-weight: bold;
    border-radius: var(--composer-border-radius, 6px);
    font-family: var(--composer-font, sans-serif);
    transition: background-color 0.3s;
    // border-top-right-radius: 0;
    // border-bottom-right-radius: 0;

    &:disabled {
      opacity: 0.5;
    }
    &:hover {
      background: var(--composer-primary-dark-color, #294dff);
    }
    &.send-later {
      padding: 10px 10px;
      border-radius: var(--composer-border-radius, 6px);
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
      margin-left: -4px;
    }
  }

  .subject {
    display: block;
    font-size: var(--composer-font-size, 14px);
    border: none;
    border-bottom: 1px solid var(--composer-border-color, #f7f7f7);
    color: var(--composer-text-color, black);
    width: 100%;
    background: var(--bg);
    font-weight: 600;
    box-sizing: border-box;
    padding: 15px var(--composer-outer-padding, 15px);
    outline: 0;
    &::placeholer {
      font-weight: 500;
    }
  }

  .contacts-wrapper {
    position: relative;
    text-decoration: none;
    color: var(--composer-text-color, black);
  }
  .close-btn {
    background: none;
    border: none;
    outline: 0;
    cursor: pointer;
  }
  .composer-btn {
    background: none;
    border: none;
    outline: 0;
    width: 28px;
    height: 28px;
    border-radius: var(--composer-border-radius, 6px);
    cursor: pointer;
    &:hover {
      background: var(--composer-background-muted-color, #f0f2ff);
    }
  }

  .cc-btn {
    position: absolute;
    right: 10px;
  }

  .attachments-wrapper {
    display: flex;
    padding: 15px var(--composer-outer-padding, 15px);
    flex-direction: column;
  }
  .addons {
    font-size: var(--composer-font-size-small, 12px);
    letter-spacing: 1.2px;
    font-weight: 600;
    position: absolute;
    right: 10px;
    bottom: 16px;
    color: var(--composer-text-light-color, #6e6e7a);
    button {
      background: transparent;
      box-shadow: none;
      border: none;
      color: var(--composer-text-light-color, #6e6e7a);
      cursor: pointer;
      margin-right: 10px;
      padding: 5px;
    }
  }

  .cc-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;

    & > nylas-contacts-search {
      flex: 1;
    }
  }
  .attachments-caption {
    font-size: var(--composer-font-size-small, 12px);
    margin-bottom: 5px;
    color: var(--composer-text-light-color, #6e6e7a);
  }
  @media only screen and (max-width: 600px) {
    .nylas-composer {
      width: 100%;
    }
    .contacts-wrapper {
      position: initial;
    }
    .addons {
      position: initial;
      float: right;
      padding: 5px;
    }
  }

  [class$="Icon"] {
    fill: var(--composer-icons-color, #666774);
    width: 10px;
    height: 10px;
  }
  .ExpandIcon {
    transform: translateY(1px);
  }
  .MinimizeIcon {
    transform: translateY(4px);
  }
  .AttachmentIcon {
    margin-right: 15px;
  }
</style>

<nylas-error {id} />

{#if themeUrl}
  <link
    rel="stylesheet"
    href={themeUrl}
    on:load={() => (themeLoaded = true)}
    on:error={() => (themeLoaded = true)}
  />
{/if}
{#if visible && isLoading}
  <div class="nylas-composer nylas-composer__loader">
    <LoadingIcon class="nylas-composer__spinner" />
    <div>Loading</div>
  </div>
{/if}

{#if visible && themeLoaded && !isLoading}
  <div class="nylas-composer" class:minimized>
    {#if show_header}
      <header class={minimized ? "minimized" : undefined}>
        {$message.subject || "New Message"}
        <div>
          {#if show_minimize_button}
            {#if minimized}
              <button class="composer-btn" on:click={handleMinimize}>
                <ExpandIcon class="ExpandIcon" />
              </button>
            {:else}
              <button class="composer-btn" on:click={handleMinimize}>
                <MinimizeIcon class="MinimizeIcon" />
              </button>
            {/if}
          {/if}
          {#if show_close_button}
            <button class="composer-btn" on:click={close}>
              <CloseIcon class="CloseIcon" />
            </button>
          {/if}
        </div>
      </header>
    {/if}
    {#if !minimized}
      <main>
        <!-- Search -->
        <div class="contacts-wrapper">
          {#if show_from}
            <nylas-contacts-search
              placeholder="From:"
              single={true}
              change={handleContactsChange("from")}
              contacts={from}
              value={$message.from}
            />
          {/if}
          {#if show_to}
            <nylas-contacts-search
              placeholder="To:"
              change={handleContactsChange("to")}
              contacts={to}
              value={$message.to}
            />
          {/if}
          <div class="addons">
            <button
              type="button"
              bind:this={ccField}
              hidden={!show_cc && !!show_cc_button && !!show_to}
              on:click={() => (show_cc = true)}>CC</button
            >

            <button
              type="button"
              bind:this={bccField}
              hidden={!show_bcc && !!show_bcc_button && !!show_to}
              on:click={() => (show_bcc = true)}>BCC</button
            >
          </div>
        </div>
        {#if show_cc}
          <div class="cc-container">
            <nylas-contacts-search
              placeholder="CC:"
              contacts={cc}
              value={$message.cc}
              change={handleContactsChange("cc")}
            />
            <button
              type="button"
              class="composer-btn cc-btn"
              on:click={() => {
                setFocus(ccField);
                show_cc = false;
              }}
              aria-label="remove carbon copy field"
            >
              <CloseIcon class="CloseIcon" />
            </button>
          </div>
        {/if}
        {#if show_bcc}
          <div class="cc-container">
            <nylas-contacts-search
              placeholder="BCC:"
              contacts={bcc}
              value={$message.bcc}
              change={handleContactsChange("bcc")}
            />
            <button
              type="button"
              class="composer-btn cc-btn"
              on:click={() => {
                setFocus(bccField);
                show_bcc = false;
              }}
              aria-label="remove blind carbon copy field"
            >
              <CloseIcon class="CloseIcon" />
            </button>
          </div>
        {/if}

        <!-- Subject -->
        {#if show_subject}
          <input
            type="text"
            placeholder="Subject"
            class="subject"
            value={$message.subject}
            name="subject"
            on:input={handleInputChange}
          />
        {/if}

        <!-- HTML Editor -->
        <nylas-html-editor
          html={$message.body || template}
          onchange={handleBodyChange}
          {replace_fields}
          {show_editor_toolbar}
        />
        {#if $attachments.length}
          <div class="nylas-attachments">
            <div class="attachments-wrapper">
              <div class="attachments-caption">Attachments:</div>

              {#each $attachments as fileAttachment}
                <nylas-composer-attachment
                  attachment={fileAttachment}
                  remove={handleRemoveFile}
                />
              {/each}
            </div>
          </div>
        {/if}
      </main>
      <footer>
        {#if show_attachment_button && (id || uploadFile)}
          <button
            class="composer-btn file-upload"
            style="margin-right: 10px; width: 32px; height: 32px;"
            on:click={() => fileSelector.click()}
          >
            <AttachmentIcon class="AttachmentIcon" />
          </button>
        {/if}
        <div class="btn-group">
          <button class="send-btn" on:click={handleSend} disabled={!isSendable}>
            {#if sendPending}Sending{:else}Send{/if}
          </button>
          <!-- <button
            class="send-btn send-later"
            disabled={!isSendable}
            on:click={() => (showDatepicker = !showDatepicker)}
          >
            <SendLaterIcon
              style="fill: var(--bg); width: 10px; height: 10px; transform: scale(1.5) translateY(1px);"
            />
          </button> -->
        </div>

        <form action="" enctype="multipart/form-data">
          <input
            hidden
            type="file"
            name=""
            bind:this={fileSelector}
            id=""
            on:change={handleFilesChange}
          />
        </form>
      </footer>
      <!-- Date Picker Component -->
      {#if showDatepicker}
        <nylas-composer-datepicker-modal close={datePickerClose} {schedule} />
      {/if}
      <!-- Datepicker Alert (if message is scheduled) -->
      {#if $message.send_at && !sendError && !sendSuccess}
        <nylas-composer-alert-bar
          type="info"
          dismissible={true}
          ondismiss={removeSchedule}
        >
          Send scheduled for
          <span>{formatDate(new Date(datepickerTimestamp))}</span>
        </nylas-composer-alert-bar>
      {/if}
      <!-- Alerts -->
      {#if sendError}
        <nylas-composer-alert-bar type="danger" dismissible={true}>
          Error: Failed to send the message.
        </nylas-composer-alert-bar>
      {/if}
      {#if sendSuccess}
        <nylas-composer-alert-bar type="success" dismissible={true}>
          Message sent successfully!
        </nylas-composer-alert-bar>
      {/if}
    {/if}
  </div>
{/if}
