import {
  attachments,
  addAttachments,
  removeAttachments,
} from "../../../components/composer/src/lib/store";
import { get } from "svelte/store";
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
    addAttachments(ATTACHMENT);
    expect(get(attachments).length).toBe(1);
    expect(get(attachments)[0]).toBe(ATTACHMENT);
  });
  it("If attachment is already in the list do not add it", () => {
    expect(get(attachments).length).toBe(0);
    addAttachments(ATTACHMENT);
    addAttachments(ATTACHMENT);
    expect(get(attachments).length).toBe(1);
  });
  it("Removes a specified attachemnt", () => {
    expect(get(attachments).length).toBe(0);
    addAttachments(ATTACHMENT);
    expect(get(attachments).length).toBe(1);
    removeAttachments(ATTACHMENT);
    expect(get(attachments).length).toBe(0);
  });
});
