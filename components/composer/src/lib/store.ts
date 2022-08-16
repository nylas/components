import type { Writable } from "svelte/store";
import type { Attachment, AttachmentUpdate } from "@commons/types/Composer";
import type { Participant } from "@commons/types/Nylas";

export const messageInitialState = {
  from: <Participant[]>[],
  to: <Participant[]>[],
  cc: <Participant[]>[],
  bcc: <Participant[]>[],
  body: "",
  subject: "New Message",
  send_at: <Date>null,
  file_ids: <string[]>[],
};
export const attachmentsInitialState: Attachment[] = [];

export const addAttachments = (
  attachments: Writable<Attachment[]>,
  update: Attachment,
): void => {
  return attachments.update((s: Attachment[]) => {
    if (!s.map((a: Attachment) => a.filename).includes(update.filename)) {
      return [...s, update];
    }
    return s;
  });
};
export const updateAttachments = (
  attachments: Writable<Attachment[]>,
  update: Attachment,
): void => {
  return attachments.update((s) => [...s, update]);
};

export const updateAttachment = (
  attachments: Writable<Attachment[]>,
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

export const removeAttachments = (
  attachments: Writable<Attachment[]>,
  item: Attachment,
): void => {
  return attachments.update((s: Attachment[]) => [
    ...s.filter((a) => a.filename !== item.filename),
  ]);
};

export const resetAttachments = (attachments: Writable<Attachment[]>): void => {
  attachments.set(JSON.parse(JSON.stringify(attachmentsInitialState)));
};
