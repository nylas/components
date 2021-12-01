import type {
  AccountOrganizationUnit,
  AccountSyncState,
  MailboxActions,
} from "@commons/enums/Nylas";
import type { Contact, HydratedContact } from "@commons/types/Contacts";
import type { Event } from "@commons/types/Events";
import type { ReplaceFields } from "./Composer";

export interface CommonQuery {
  component_id: string;
  access_token?: string;
}

export interface ConversationQuery extends CommonQuery {
  thread_id: string;
}

export interface MailboxQuery extends CommonQuery {
  query: ThreadsQuery;
  keywordToSearch?: string;
}

export type AccountQuery = CommonQuery;

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

export interface SearchResultThreadsQuery extends CommonQuery {
  keyword_to_search: string;
}

export interface MessagesQuery extends CommonQuery {
  received_before?: number;
  received_after?: number;
}

export interface FileQuery extends CommonQuery {
  file_id: string;
}

export interface CleanConversationQuery extends CommonQuery {
  message_id: string[]; // Note: singular name but expects array
}

export interface CleanConversationFeedbackQuery extends CommonQuery {
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

export interface SingularEmail extends CommonQuery {
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
  account_id?: string;
  content_type: string;
  filename: string;
  object: "file";
  size: number;
  content_disposition: string;
}

export interface MiddlewareResponse<T = unknown> {
  component: {
    theming: Manifest;
  };
  response: T;
}

export interface NError {
  name?: string;
  message?: Error;
}

export interface Manifest {
  error?: NError;
}

export interface AgendaProperties extends Manifest {
  allow_date_change: boolean;
  allowed_dates: Date[] | string;
  allow_event_creation: boolean;
  auto_time_box: boolean;
  calendar_id: string;
  calendar_ids: string;
  color_by: "event" | "calendar";
  condensed_view: boolean;
  eagerly_fetch_events: boolean;
  events: Event[];
  end_minute: number;
  event_snap_interval: number;
  header_type: "full" | "day" | "none";
  hide_all_day_events: boolean;
  hide_current_time: boolean;
  prevent_zoom: boolean;
  selected_date: Date;
  show_as_busy: boolean;
  show_no_events_message: boolean;
  start_minute: number;
  theme: "theme-1" | "theme-2" | "theme-3" | "theme-4" | "theme-5";
  hide_ticks: boolean;
  timezone_agnostic_all_day_events: boolean;
}

export interface EmailProperties extends Manifest {
  clean_conversation: boolean;
  click_action: "default" | "mailbox" | "custom";
  message_id: string;
  message: Message;
  show_contact_avatar: boolean;
  show_expanded_email_view_onload: boolean;
  show_number_of_messages: boolean;
  show_received_timestamp: boolean;
  show_star: boolean;
  show_thread_actions: boolean;
  theme: "theme-1" | "theme-2" | "theme-3" | "theme-4" | "theme-5";
  thread_id: string;
  thread: Thread;
  you: Partial<Account>;
}

export interface MailboxProperties extends Manifest {
  actions_bar: MailboxActions[];
  all_threads: Thread[];
  header: string;
  items_per_page: number;
  keyword_to_search: string;
  query_string: string;
  show_star: boolean;
  show_thread_checkbox: boolean;
  theme: "theme-1" | "theme-2" | "theme-3" | "theme-4" | "theme-5";
}

export interface ComposerProperties extends Manifest {
  minimized: boolean;
  mode: "inline" | "popup";
  replace_fields: ReplaceFields[];
  reset_after_send: boolean;
  show_attachment_button: boolean;
  show_bcc_button: boolean;
  show_bcc: boolean;
  show_cc_button: boolean;
  show_cc: boolean;
  show_close_button: boolean;
  show_editor_toolbar: boolean;
  show_from: boolean;
  show_header: boolean;
  show_minimize_button: boolean;
  show_subject: boolean;
  show_to: boolean;
  theme: "string";
  visible: boolean;
}

export interface ContactListProperties extends Manifest {
  click_action: "email" | "select";
  contacts: Contact[];
  contacts_to_load: number;
  default_photo: string | null;
  show_filter: boolean;
  show_names: boolean;
  sort_by: "last_emailed" | "name";
  theme: "theme-1" | "theme-2" | "theme-3" | "theme-4" | "theme-5";
  threads_to_load: number;
}

export interface ConversationProperties extends Manifest {
  messages: Message[];
  show_avatars: boolean | string;
  show_reply: boolean | string;
  theme: "theme-1" | "theme-2" | "theme-3" | "theme-4";
  thread_id: string;
  you: Partial<Account>;
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
  selected?: boolean;
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
