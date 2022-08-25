import {
  addAttachments,
  removeAttachments,
  attachmentsInitialState,
} from "../../../components/composer/src/lib/store";
import { get, writable } from "svelte/store";

const attachments = writable(
  JSON.parse(JSON.stringify(attachmentsInitialState)),
);
describe("Attachments store", () => {
  const ATTACHMENT = {
    filename: "Test attachment",
    size: 1024,
    content_type: "application/json",
  };
  beforeEach(() => {
    attachments.set([]);
  });
  it("Adds a new attachment", () => {
    expect(get(attachments).length).toBe(0);
    addAttachments(attachments, ATTACHMENT);
    expect(get(attachments).length).toBe(1);
    expect(get(attachments)[0]).toBe(ATTACHMENT);
  });
  it("If attachment is already in the list do not add it", () => {
    expect(get(attachments).length).toBe(0);
    addAttachments(attachments, ATTACHMENT);
    addAttachments(attachments, ATTACHMENT);
    expect(get(attachments).length).toBe(1);
  });
  it("Removes a specified attachemnt", () => {
    expect(get(attachments).length).toBe(0);
    addAttachments(attachments, ATTACHMENT);
    expect(get(attachments).length).toBe(1);
    removeAttachments(attachments, ATTACHMENT);
    expect(get(attachments).length).toBe(0);
  });
});
