import { createEvent, fetchEvents, fetchCalendars } from "./connections/events";
import {
  fetchContacts,
  fetchContactsByQuery,
  fetchContactImage,
  fetchContactThreads,
} from "./connections/contacts";
import { fetchThreads, fetchThread, updateThread } from "./connections/threads";
import { fetchManifest } from "./connections/manifest";
import {
  sendMessage,
  uploadFile,
  fetchMessages,
  fetchMessage,
  fetchEmail,
} from "./connections/messages";
import { fetchAccount } from "./connections/accounts";
import {
  fetchCleanConversations,
  sendCleanConversationFeedback,
} from "./connections/neural";

import { CalendarStore } from "./store/calendars";
import { ContactStore } from "./store/contacts";
import { ConversationStore } from "./store/conversations";
import { EventStore } from "./store/events";
import { MailboxStore, Threads } from "./store/threads";
import { MessageStore } from "./store/messages";
import { ManifestStore } from "./store/manifest";
import {
  debounce,
  getEventDispatcher,
  parseBoolean,
} from "./methods/component";
import { ErrorStore } from "./store/error";

export const store = {
  CalendarStore,
  ContactStore,
  ConversationStore,
  EventStore,
  ErrorStore,
  ManifestStore,
  MailboxStore,
  Threads,
  MessageStore,
};

export const connections = {
  createEvent,
  fetchEvents,
  fetchCalendars,
  fetchContactsByQuery,
  fetchContacts,
  fetchContactImage,
  fetchThreads,
  updateThread,
  fetchContactThreads,
  fetchThread,
  fetchManifest,
  fetchMessages,
  fetchMessage,
  fetchEmail,
  sendMessage,
  fetchAccount,
  uploadFile,
  fetchCleanConversations,
  sendCleanConversationFeedback,
};

export const methods = {
  getEventDispatcher,
  debounce,
  parseBoolean,
};
