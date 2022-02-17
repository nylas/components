<svelte:options tag="nylas-composer" immutable />

<script lang="ts">
  import "./components/HTMLEditor.svelte";
  import "./components/AlertBar.svelte";
  import "./components/Attachment.svelte";
  import "./components/DatepickerModal.svelte";
  import "./components/ContactsSearch.svelte";
  import LoadingIcon from "./assets/loading.svg";
  import { isFileAnAttachment } from "@commons/methods/isFileAnAttachment";

  import {
    ErrorStore,
    ManifestStore,
    sendMessage,
    fetchAccount,
    uploadFile as nylasUploadFile,
    saveDraft,
    updateDraft,
  } from "@commons";
  import {
    buildInternalProps,
    getEventDispatcher,
  } from "@commons/methods/component";
  import { silence } from "@commons/methods/api";
  import { onMount, tick, get_current_component } from "svelte/internal";
  import pkg from "../package.json";

  const dispatchEvent = getEventDispatcher(get_current_component());
  $: dispatchEvent("manifestLoaded", manifest);

  $: if (Object.keys($ErrorStore).length) {
    dispatchEvent("onError", $ErrorStore);
  }

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
  import DraftIcon from "./assets/drafts.svg";
  import ExpandIcon from "./assets/expand.svg";
  import type {
    SendCallback,
    FetchContactsCallback,
    Tracking,
    Attribute,
    ReplaceFields,
    Attachment,
  } from "@commons/types/Composer";
  import type {
    Message,
    ComposerProperties,
    Account,
    Participant,
  } from "@commons/types/Nylas";
  import type { FetchContactsCallback as ContactsSearchFetchContactsCallback } from "@commons/types/ContactsSearch";

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
  export let save: SendCallback;
  export let change: FetchContactsCallback | null = null;
  export let beforeSend: (msg: Message) => Message | void;
  export let afterSendSuccess: Function | null = null;
  export let afterSendError: Function | null = null;
  export let afterSaveSuccess: Function | null = null;
  export let afterSaveError: Function | null = null;
  export let template: string = "";
  export let tracking: Tracking | null = null;

  // Attributes
  export let minimized: Attribute;
  export let reset_after_send: Attribute;
  export let reset_after_close: Attribute;
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
  export let max_file_size: number;
  export let show_max_file_size: Attribute;
  export let show_save_as_draft: Attribute;
  export let show_editor_toolbar: Attribute;
  export let theme: string | void;
  export let replace_fields: ReplaceFields[] | null = null;
  export let beforeFileUpload: Function | null = null;
  export let afterFileUploadSuccess: Function | null = null;
  export let afterFileUploadError: Function | null = null;
  export let uploadFile: Function | null = null;
  export let beforeFileRemove: Function | null = null;
  export let afterFileRemove: Function | null = null;
  export let focus_body_onload: boolean;

  const defaultValueMap: Partial<ComposerProperties> = {
    show_to: true,
    show_from: true,
    minimized: false,
    reset_after_send: true,
    show_header: false,
    show_subject: false,
    show_close_button: true,
    show_minimize_button: true,
    show_cc: true,
    show_bcc: true,
    show_cc_button: true,
    show_bcc_button: true,
    show_attachment_button: true,
    max_file_size: 0,
    show_max_file_size: true,
    show_save_as_draft: true,
    show_editor_toolbar: true,
    theme: "auto",
    focus_body_onload: false,
  };

  // Callbacks
  export const open = (): void => {
    visible = true;
    if (_this.reset_after_send) {
      sendSuccess = false;
    }
    dispatchEvent("composerOpened", {});
  };

  export const close = (): void => {
    visible = false;
    if (_this.reset_after_send || _this.reset_after_close) {
      sendSuccess = false;
    }
    if (_this.reset_after_close) {
      resetAfterSend($message.from);
    }
    attachments.update(() => []);
    dispatchEvent("composerClosed", {});
  };

  let isLoading = false;
  let _this = <ComposerProperties>buildInternalProps({}, {}, defaultValueMap);
  let manifest: Partial<ComposerProperties>;
  let showDatepicker = false;
  let themeLoaded = false;
  let visible = true;
  let subject = _this.value?.subject ?? $message.subject;
  $: subject = $message.subject;

  onMount(async () => {
    isLoading = true;
    await tick();

    manifest =
      (await $ManifestStore[
        JSON.stringify({ component_id: id, access_token })
      ]) || {};

    if (manifest && id) {
      const account: Account | void = await fetchAccount({
        component_id: id,
        access_token,
      }).catch(silence);

      if (account) {
        // Set "from" field from account
        update("from", [{ name: account.name, email: account.email_address }]);
      }
    }

    _this = buildInternalProps(
      $$props,
      manifest,
      defaultValueMap,
    ) as ComposerProperties;

    if (tracking) {
      // Set tracking on message object
      update("tracking", tracking);
    }

    isLoading = false;
    themeLoaded = true;
  });

  let previousProps = $$props;
  $: {
    if (JSON.stringify(previousProps) !== JSON.stringify($$props)) {
      _this = buildInternalProps(
        $$props,
        manifest,
        defaultValueMap,
      ) as ComposerProperties;
      previousProps = $$props;
    }
  }

  $: if (value) {
    mergeMessage(value);
    if (value.files?.length > 0) {
      for (const [fileIndex, file] of value.files.entries()) {
        if (isFileAnAttachment(value, file)) {
          addAttachments({
            account_id: value.account_id,
            id: value.id,
            filename: file.filename,
            size: file.size,
            content_type: file.content_type,
          });
        }
      }
    }
  }

  let maxFileSize: number;
  $: {
    if (!uploadFile) {
      //Using Nylas file upload api, default 4MB max size.
      maxFileSize =
        _this.max_file_size &&
        _this.max_file_size < 4 &&
        _this.max_file_size > 0
          ? _this.max_file_size
          : 4;
    } else {
      //Using custom uploadFile function
      maxFileSize = _this.max_file_size;
    }
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

  async function handleFilesChange(fileChangedEvent: Event) {
    const fileSelector = fileChangedEvent.target as HTMLInputElement;
    if (!fileSelector?.files) return;

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

      if (maxFileSize > 0 && file.size >= maxFileSize * 1000000) {
        throw `Maximum file size is ${maxFileSize}MB. Please upload a different file.`;
      }

      const result = uploadFile
        ? await uploadFile(file)
        : id && (await nylasUploadFile(id, file, access_token));

      updateAttachment(file.name, { loading: false, id: result.id });
      // Update the message object
      if (result.id)
        mergeMessage({ file_ids: [...$message.file_ids, result.id] });
      if (afterFileUploadSuccess) afterFileUploadSuccess(result);
    } catch (e) {
      updateAttachment(file.name, {
        loading: false,
        error: true,
        errorMessage: typeof e === "string" ? e : undefined,
      });
      if (afterFileUploadError) afterFileUploadError(e);
    }
  }

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

  const handleMinimize = (isMinimized: boolean) => {
    _this.minimized = isMinimized;
    previousProps = _this;

    dispatchEvent(
      _this.minimized ? "composerMinimized" : "composerMaximized",
      {},
    );
  };

  let isPending = false;
  let sendError = false;
  let sendSuccess = false;

  const handleSend = async () => {
    isPending = true;
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
          isPending = false;
          sendSuccess = true;
        })
        .catch((err) => {
          if (afterSendError) afterSendError(err);
          if (_this.reset_after_send) resetAfterSend($message.from);
          isPending = false;
          sendError = true;
        });
    } else if (id) {
      // Middleware
      sendMessage(id, msg, access_token)
        .then((res) => {
          if (afterSendSuccess) afterSendSuccess(res);
          if (_this.reset_after_send) resetAfterSend($message.from);
          isPending = false;
          sendSuccess = true;
          dispatchEvent("messageSent", {
            message: res,
          });
        })
        .catch((err) => {
          if (afterSendError) afterSendError(err);
          isPending = false;
          sendError = true;
        });
    }
  };

  let saveError = false;
  let saveSuccess = false;
  //Save Email Message as Draft
  const handleSaveDraft = async () => {
    isPending = true;
    saveError = false;
    saveSuccess = false;

    let msg = $message;
    try {
      if (save) {
        //Calling custom save callback
        const res = await save(msg);
        if (afterSaveSuccess) afterSaveSuccess(res);
        isPending = false;
        saveSuccess = true;
      } else if (id) {
        // Middleware
        if (msg.id && msg.version != null) {
          //Update draft
          const res = await updateDraft(id, msg, access_token);
          if (res.id) mergeMessage({ ...res });
          if (afterSaveSuccess) afterSaveSuccess(res);
          isPending = false;
          saveSuccess = true;
          dispatchEvent("draftUpdated", {
            message: res,
          });
        } else {
          //Save new draft
          const res = await saveDraft(id, msg, access_token);
          if (res.id) mergeMessage({ ...res });
          if (afterSaveSuccess) afterSaveSuccess(res);
          isPending = false;
          saveSuccess = true;
          dispatchEvent("draftSaved", {
            message: res,
          });
        }
      }
    } catch (err) {
      if (afterSaveError) afterSaveError(err);
      isPending = false;
      saveError = true;
    }
  };

  // Listener for message changes
  // @ts-ignore
  $: if ($message && change) change($message);
  // @ts-ignore
  $: datepickerTimestamp = $message.send_at * 1000;

  $: isSendable =
    !isPending &&
    (id || send) &&
    $message.from.length &&
    ($message.to.length || $message.cc.length || $message.bcc.length);

  let themeUrl: string;
  $: if (!!_this.theme) {
    if (_this.theme.startsWith(".") || _this.theme.startsWith("http")) {
      // If custom url supplied
      themeUrl = _this.theme;
    } else if (_this.theme) {
      themeUrl = `https://unpkg.com/@nylas/components-composer@${pkg.version}/themes/${_this.theme}.css`;
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

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && e.metaKey) {
      if (isSendable) {
        handleSend();
      }
    }
  };
</script>

<style lang="scss">
  @import "../../theming/reset.scss";

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
      height: auto;
      min-height: 0;
    }
    &__loader {
      min-height: var(--composer-editor-max-height, 480px);
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
    justify-content: flex-start;
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
    .contacts-container {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      padding: 0.4rem var(--outer-padding);
      border-bottom: 1px solid var(--border);
    }
    .contact-from {
      display: flex;
      align-items: center;
      padding-bottom: 0.1rem;
      padding-right: 0.1rem;
    }
    .contact-item {
      display: inline-flex;
      background: var(--primary-light);
      color: var(--primary);
      align-items: center;
      border-radius: calc(var(--border-radius) / 2);
      padding: 0.2rem 0.8rem;
      margin-right: 0.25rem;
      margin-top: 2px;
      margin-bottom: 2px;
    }
    .contact-item__name {
      color: var(--text-secondary);
      font-size: 12px;
      padding-right: 0.75rem;
    }
    .contacts-placeholder {
      font-size: var(--font-size-small);
      margin-right: 10px;
      min-width: 30px;
      display: flex;
      color: var(--text-light);
    }
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
  .composer-btn.file-upload,
  .composer-btn.save-draft {
    margin-left: 6px;
    width: 32px;
    height: 32px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .file-size {
    margin-left: 6px;
    color: var(--composer-icons-color, #666774);
    height: 32px;
    width: auto;
    display: flex;
    justify-content: center;
    align-items: center;
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
  [class$="FooterIcon"] {
    width: 16px;
    height: 16px;
  }
  .ExpandIcon {
    transform: translateY(1px);
  }
  .MinimizeIcon {
    transform: translateY(4px);
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
  <div
    class="nylas-composer"
    data-cy="nylas-composer"
    class:minimized={_this.minimized}
  >
    {#if _this.show_header}
      <header class={_this.minimized ? "minimized" : undefined}>
        <span>{subject}</span>
        <div>
          {#if _this.show_minimize_button}
            {#if _this.minimized}
              <button
                class="composer-btn"
                on:click={() => handleMinimize(false)}
              >
                <span class="sr-only">Expand Composer</span>
                <ExpandIcon class="ExpandIcon" />
              </button>
            {:else}
              <button
                class="composer-btn"
                on:click={() => handleMinimize(true)}
              >
                <span class="sr-only">Collapse Composer</span>
                <MinimizeIcon class="MinimizeIcon" />
              </button>
            {/if}
          {/if}
          {#if _this.show_close_button}
            <button class="composer-btn" on:click={close}>
              <span class="sr-only">Close Composer</span>
              <CloseIcon class="CloseIcon" />
            </button>
          {/if}
        </div>
      </header>
    {/if}
    {#if !_this.minimized}
      <main>
        <!-- Search -->
        <div class="contacts-wrapper">
          {#if _this.show_from}
            <div class="contacts-container">
              <div class="contact-from">
                <div class="contacts-placeholder">From:</div>
                <div class="contacts-results-inner">
                  <div class="contact-item" data-cy="from-field">
                    <span class="contact-item__name">
                      {#if $message.from.length > 0}
                        {#if $message.from[0].name}
                          <strong>{$message.from[0].name}</strong>
                          {`<${$message.from[0].email}>`}
                        {:else}
                          {$message.from[0].email}
                        {/if}
                      {/if}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          {/if}
          {#if _this.show_to}
            <nylas-contacts-search
              data-cy="to-field"
              placeholder="To:"
              change={handleContactsChange("to")}
              contacts={to}
              value={$message.to}
            />
          {/if}
          <div class="addons">
            <button
              data-cy="toggle-cc-field-btn"
              type="button"
              bind:this={ccField}
              hidden={_this.show_cc && !_this.show_cc_button && !!_this.show_to}
              on:click={() => {
                _this.show_cc = true;
                previousProps = _this;
              }}>CC</button
            >

            <button
              data-cy="toggle-bcc-field-btn"
              type="button"
              bind:this={bccField}
              hidden={_this.show_bcc &&
                !_this.show_bcc_button &&
                !!_this.show_to}
              on:click={() => {
                _this.show_bcc = true;
                previousProps = _this;
              }}>BCC</button
            >
          </div>
        </div>
        {#if _this.show_cc}
          <div class="cc-container">
            <nylas-contacts-search
              data-cy="cc-field"
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
                _this.show_cc = false;
                previousProps = _this;
              }}
              aria-label="remove carbon copy field"
            >
              <CloseIcon class="CloseIcon" />
            </button>
          </div>
        {/if}
        {#if _this.show_bcc}
          <div class="cc-container">
            <nylas-contacts-search
              data-cy="bcc-field"
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
                _this.show_bcc = false;
                previousProps = _this;
              }}
              aria-label="remove blind carbon copy field"
            >
              <CloseIcon class="CloseIcon" />
            </button>
          </div>
        {/if}

        <!-- Subject -->
        {#if _this.show_subject}
          <label>
            <span class="sr-only">Email subject</span>
            <input
              type="text"
              placeholder="Subject"
              class="subject"
              value={subject}
              name="subject"
              on:input={handleInputChange}
            />
          </label>
        {/if}

        <!-- HTML Editor -->
        <nylas-html-editor
          data-cy="html-editor"
          html={$message.body || template}
          onchange={handleBodyChange}
          focus_body_onload={_this.focus_body_onload}
          replace_fields={_this.replace_fields}
          show_editor_toolbar={_this.show_editor_toolbar}
          on:keydown={handleKeyDown}
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
        <div class="btn-group">
          <button class="send-btn" on:click={handleSend} disabled={!isSendable}>
            {#if isPending}Sending{:else}Send{/if}
          </button>
        </div>
        {#if _this.show_save_as_draft}
          <button
            for="save-draft"
            class="composer-btn save-draft"
            title="Save Email As Draft"
            on:click={handleSaveDraft}
          >
            <DraftIcon class="FooterIcon" />
            <span class="sr-only">Save Draft</span>
          </button>
        {/if}
        {#if _this.show_attachment_button && (id || uploadFile)}
          <label
            for="file-upload"
            class="composer-btn file-upload"
            title="Attach Files (up to {maxFileSize}MB)"
            tabindex="0"
          >
            <AttachmentIcon class="FooterIcon" />
            <span class="sr-only">Attach Files</span>
          </label>
          {#if _this.show_max_file_size}
            <div class="file-size">
              <span>Max file size: {maxFileSize}MB</span>
            </div>
          {/if}
        {/if}

        <form action="" enctype="multipart/form-data">
          <input
            hidden
            type="file"
            id="file-upload"
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
      {#if saveError}
        <nylas-composer-alert-bar type="danger" dismissible={true}>
          Error: Failed to save the draft.
        </nylas-composer-alert-bar>
      {/if}
      {#if saveSuccess}
        <nylas-composer-alert-bar type="success" dismissible={true}>
          Message draft saved successfully!
        </nylas-composer-alert-bar>
      {/if}
    {/if}
  </div>
{/if}
