import { writable } from "svelte/store";

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

const attachmentsInitialState: Composer.Attachment[] = [];
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

export const addAttachments = (update: Composer.Attachment): void => {
  return attachments.update((s: Composer.Attachment[]) => {
    if (
      !s.map((a: Composer.Attachment) => a.filename).includes(update.filename)
    ) {
      return [...s, update];
    }
    return s;
  });
};
export const updateAttachments = (update: Composer.Attachment): void => {
  return attachments.update((s) => [...s, update]);
};

export const updateAttachment = (
  filename: string,
  update: Composer.AttachmentUpdate,
): void => {
  return attachments.update((s: Composer.Attachment[]) =>
    s.map((attachment) => {
      return attachment.filename === filename
        ? { ...attachment, ...update }
        : attachment;
    }),
  );
};

export const removeAttachments = (item: Composer.Attachment): void => {
  return attachments.update((s: Composer.Attachment[]) => [
    ...s.filter((a) => a.filename !== item.filename),
  ]);
};

export const resetAfterSend = (from: string[]): void => {
  message.set(JSON.parse(JSON.stringify({ ...messageInitialState, from })));
  attachments.set(JSON.parse(JSON.stringify(attachmentsInitialState)));
};
