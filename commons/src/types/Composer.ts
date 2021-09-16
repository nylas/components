import type { Participant } from "@commons/types/Nylas";

export interface Message {
  [key: string]: unknown;
  component_id?: string;
  subject?: string;
  body?: string;
  from?: Participant[];
  to: Participant[];
  cc?: Participant[];
  bcc?: Participant[];
  file_ids?: string[];
  send_at?: number | null;
}

export interface UI {
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

export interface Attributes {
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

export interface ReplaceFields {
  from: string;
  to: string;
}

export type Attribute = string | boolean | void;

export interface Tracking {
  links: boolean;
  opens: boolean;
  thread_replies: boolean;
  payload: string;
}

export interface Attachment {
  filename: string;
  size: number;
  content_type: string;
  id?: string;
  account_id?: string;
  object?: string;
  loading?: boolean;
  error?: boolean;
}

export interface AttachmentUpdate {
  filename?: string;
  size?: number;
  content_type?: string;
  id?: string;
  account_id?: string;
  object?: string;
  loading?: boolean;
  error?: boolean;
}

export interface SendCallback {
  (data: Message): Promise<void>;
}

export interface ChangeCallback {
  (data: Message): Promise<void>;
}

export interface DatepickerCallback {
  (data: number): Promise<void>;
}

export interface DatepickerCloseCallback {
  (): Promise<void>;
}

export interface ToolbarItem {
  title: string;
  state?: () => boolean;
  result: () => void;
  active?: boolean;
  icon?: string;
}

export interface FetchContactsCallback {
  (term: string): Promise<Participant[]>;
}
