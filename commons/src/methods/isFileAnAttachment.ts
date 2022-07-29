import type { Message, File } from "@commons/types/Nylas";
import {
  DisallowedContentTypes,
  InlineImageTypes,
} from "@commons/constants/attachment-content-types";

export const isFileAnAttachment = (message: Message, file: File): boolean =>
  file.content_disposition === "attachment" &&
  !!file.filename &&
  !DisallowedContentTypes.includes(file.content_type);
