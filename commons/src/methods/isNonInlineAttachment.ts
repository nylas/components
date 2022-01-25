import type { Message, File } from "@commons/types/Nylas";
import {
  DisallowedContentTypes,
  InlineImageTypes,
} from "@commons/constants/attachment-content-types";

export const isNonInlineAttachment = (message: Message, file: File): boolean =>
  file.content_disposition === "attachment" &&
  !(
    file.content_id &&
    message.cids?.includes(file.content_id) &&
    InlineImageTypes.includes(file.content_type) &&
    !DisallowedContentTypes.includes(file.content_type)
  );
