import type { HydratedContact } from "@commons/types/Contacts";
import type {
  AccountOrganizationUnit,
  AccountSyncState,
} from "@commons/enums/Nylas";
export interface CommonQuery {
  component_id: string;
  access_token?: string;
}

export interface ConversationQuery extends CommonQuery {
  thread_id: string;
}

export interface MailboxQuery extends CommonQuery {
  query: ThreadsQuery;
}

export interface AccountQuery {
  component_id: string;
  access_token?: string;
}

export interface ThreadsQuery {
  limit?: number;
  offset?: number;
  view?: "ids" | "count" | "expanded";
  subject?: string;
  any_email?: string;
  to?: string;
  from?: string;
  cc?: string;
  bcc?: string;
  in?: string;
  unread?: boolean;
  starred?: boolean;
  filename?: string;
  last_message_before?: number;
  last_message_after?: number;
  started_before?: number;
  started_after?: number;
  not_in?: string;
}

export interface MessagesQuery extends CommonQuery {
  received_before?: number;
  received_after?: number;
}

export interface CleanConversationQuery {
  component_id: string;
  message_id: string[]; // Note: singular name but expects array
}

export interface CleanConversationFeedbackQuery {
  component_id: string;
  message_id: string;
}

export interface StoredThreads {
  queryKey: string;
  data: Thread[];
}

export interface StoredMessages {
  queryKey: string;
  data: Message[];
}

export interface StoredMessage {
  queryKey: string;
  data: Message;
}

export interface SingularEmail {
  component_id: string;
  message_id: string;
}

export interface StoredConversation {
  queryKey: string;
  data: Conversation;
}

export interface Participant {
  comment?: string;
  email: string;
  name?: string;
  status?: "yes" | "no" | "noreply" | "maybe";
  contact?: HydratedContact | null;
}

export interface WebPage {
  type: string | null;
  url: string;
}

export interface Message {
  subject?: null | string;
  body: null | string;
  id: string;
  snippet: string;
  from: Participant[];
  to: Participant[];
  cc: Participant[];
  bcc: Participant[];
  conversation?: string;
  model_version?: string;
  date: number;
  expanded?: boolean;
  thread_id?: string;
}

export interface RadialMessage extends Message {
  received_moment: number;
  offset: number;
}

export interface File {
  id: string;
  account_id: string;
  content_type: string;
  filename: string;
  object: "file";
  size: number;
}

export interface MiddlewareResponse<T = unknown> {
  component: {
    theming: Manifest;
  };
  response: T;
}

export interface NError extends Error {
  name: import("../components/NErrorMapping").NErrorType[number];
}

export interface Manifest {
  error?: NError;
}

export interface AgendaProperties extends Manifest {
  allow_date_change: boolean;
  allow_event_creation: boolean;
  auto_time_box: boolean;
  calendar_ids: string;
  color_by: "event" | "calendar";
  condensed_view: boolean;
  eagerly_fetch_events: boolean;
  event_snap_interval: number;
  header_type: "full" | "day" | "none";
  hide_all_day_events: boolean;
  hide_current_time: boolean;
  prevent_zoom: boolean;
  show_as_busy: boolean;
  show_no_events_message: boolean;
  theme: "theme-1" | "theme-2" | "theme-3" | "theme-4" | "theme-5";
  hide_ticks: boolean;
}

export interface EmailProperties extends Manifest {
  show_number_of_messages: boolean;
  show_received_timestamp: boolean;
  is_clean_conversation_enabled: boolean;
  thread_id: string;
  theme: "theme-1" | "theme-2" | "theme-3" | "theme-4" | "theme-5";
  show_contact_avatar: boolean;
  clean_conversation: boolean;
}

export interface ComposerProperties extends Manifest {
  show_header?: boolean;
  theme?: "light" | "dark";
  mode?: "inline" | "popup";
  show_from?: boolean;
  show_to?: boolean;
  show_cc?: boolean;
  show_bcc?: boolean;
  visible?: boolean;
  minimized?: boolean;
  reset_after_send: boolean;
  show_subject?: boolean;
  show_close_button?: boolean;
  show_minimize_button?: boolean;
  show_cc_button?: boolean;
  show_bcc_button?: boolean;
  show_attachment_button?: boolean;
  show_editor_toolbar?: boolean;
  css_url?: string;
}

export interface ContactListProperties extends Manifest {
  click_action: "email" | "select";
  theme: "theme-1" | "theme-2" | "theme-3" | "theme-4" | "theme-5";
  sort_by: "last_emailed" | "name";
  threads_to_load: number;
  contacts_to_load: number;
  show_names: boolean;
}

export interface ConversationProperties extends Manifest {
  theme: "theme-1" | "theme-2" | "theme-3" | "theme-4";
  show_avatars: boolean | string;
  show_reply: boolean | string;
}

export interface DayProperties extends Manifest {
  theme: "gmail" | "theme-1" | "theme-2" | "theme-3" | "ellsworth-kelly";
  day: number;
  calendar_ids?: string;
}
export interface Thread {
  account_id: string;
  draft_ids: string[];
  first_message_timestamp: number;
  has_attachments: boolean;
  id: string;
  labels?: Label[];
  last_message_received_timestamp: number;
  last_message_sent_timestamp: number;
  last_message_timestamp: number;
  message_ids?: string[];
  messages?: Message[];
  object: string;
  participants: Participant[];
  snippet: string;
  starred: boolean;
  subject: string;
  unread: boolean;
  version: number;
  expanded?: boolean;
  folders?: Folder[]; //to be changed to Folder[];
  folder_id?: string;
  label_ids?: string[];
}
export interface Conversation extends Thread {
  messages: Message[];
}

export interface Account {
  account_id: string;
  id: string;
  email_address: string;
  name?: string;
  linked_at: number;
  object: "account";
  organization_unit: AccountOrganizationUnit;
  provider: string;
  sync_state: AccountSyncState;
}

export interface ComponentProperty<T> {
  label: string;
  title: string;
  options: T[];
  value: T;
  conditions?: { label: string; value: any }[];
  description?: string;
  type?: string;
  validation_message?: any;
}

export interface Label {
  account_id: string;
  display_name: string;
  id: string;
  name: string;
  object: "label";
}

export interface StoredLabels {
  queryKey: string;
  data: Label[];
}

export interface Folder {
  account_id: string;
  display_name: string;
  id: string;
  name: string;
  object: "folder";
}

export interface StoredFolders {
  queryKey: string;
  data: Folder[];
}
