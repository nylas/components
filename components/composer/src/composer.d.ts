declare namespace Composer {
  interface Message {
    [key: string]: unknown;
    component_id?: string;
    subject?: string;
    body?: string;
    from: Nylas.Participant[];
    to: Nylas.Participant[];
    cc: Nylas.Participant[];
    bcc: Nylas.Participant[];
    file_ids?: string[];
    send_at?: number | null;
  }

  interface UI {
    send_pending?: boolean;
    send_success?: boolean;
    theme_loaded?: boolean;
    send_error?: boolean;
    show_from?: boolean;
    show_datepicker?: boolean;
    show_cc?: boolean;
    show_bcc?: boolean;
    visible?: boolean;
    minimized?: boolean;
    initial_load?: boolean;
  }

  interface Attributes {
    theme?: string;
    show_from?: boolean;
    show_to?: boolean;
    show_header?: boolean;
    minimized?: boolean;
    show_subject?: boolean;
    show_close_button?: boolean;
    show_minimize_button?: boolean;
    show_cc_button?: boolean;
    show_bcc_button?: boolean;
    show_attachment_button?: boolean;
    show_editor_toolbar?: boolean;
  }

  interface ReplaceFields {
    from: string;
    to: string;
  }

  type Attribute = string | boolean | void;

  interface Tracking {
    links: boolean;
    opens: boolean;
    thread_replies: boolean;
    payload: string;
  }

  interface Attachment {
    filename: string;
    size: number;
    content_type: string;
    id?: string;
    account_id?: string;
    object?: string;
    loading?: boolean;
    error?: boolean;
  }

  interface AttachmentUpdate {
    filename?: string;
    size?: number;
    content_type?: string;
    id?: string;
    account_id?: string;
    object?: string;
    loading?: boolean;
    error?: boolean;
  }

  interface SendCallback {
    (data: Message): Promise<void>;
  }

  interface ChangeCallback {
    (data: Message): Promise<void>;
  }

  interface DatepickerCallback {
    (data: number): Promise<void>;
  }
  interface DatepickerCloseCallback {
    (): Promise<void>;
  }

  interface ToolbarItem {
    title: string;
    state?: () => boolean;
    result: () => void;
    active?: boolean;
    icon?: string;
  }

  interface FetchContactsCallback {
    (term: string): Promise<Nylas.Participant[]>;
  }
}

// Allow SVG Imports
declare module "*.svg" {
  const content: any;
  export default content;
}
