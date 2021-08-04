import { writable } from "svelte/store";
import type { Attachment, AttachmentUpdate } from "@commons/types/Composer";

const messageInitialState = {
  from: [],
  to: [],
  cc: [],
  bcc: [],
  body: "",
  subject: "",
  send_at: null,
  file_ids: [],
};
export const message = writable(
  JSON.parse(JSON.stringify(messageInitialState)),
);

const attachmentsInitialState: Attachment[] = [];
export const attachments = writable(
  JSON.parse(JSON.stringify(attachmentsInitialState)),
);

export const subscribe = (val: unknown): unknown =>
  message.subscribe((x) => {
    val = x;
    return val;
  });

export const update = (key: string, value: unknown): void => {
  return message.update((s) => ({ ...s, [key]: value }));
};

export const mergeMessage = (update: Record<string, unknown>): void => {
  return message.update((s) => ({ ...s, ...update }));
};

export const addAttachments = (update: Attachment): void => {
  return attachments.update((s: Attachment[]) => {
    if (!s.map((a: Attachment) => a.filename).includes(update.filename)) {
      return [...s, update];
    }
    return s;
  });
};
export const updateAttachments = (update: Attachment): void => {
  return attachments.update((s) => [...s, update]);
};

export const updateAttachment = (
  filename: string,
  update: AttachmentUpdate,
): void => {
  return attachments.update((s: Attachment[]) =>
    s.map((attachment) => {
      return attachment.filename === filename
        ? { ...attachment, ...update }
        : attachment;
    }),
  );
};

export const removeAttachments = (item: Attachment): void => {
  return attachments.update((s: Attachment[]) => [
    ...s.filter((a) => a.filename !== item.filename),
  ]);
};

export const resetAfterSend = (from: string[]): void => {
  message.set(JSON.parse(JSON.stringify({ ...messageInitialState, from })));
  attachments.set(JSON.parse(JSON.stringify(attachmentsInitialState)));
};
