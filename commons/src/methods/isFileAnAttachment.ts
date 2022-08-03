import type { File } from "@commons/types/Nylas";
import { DisallowedContentTypes } from "@commons/constants/attachment-content-types";

export const isFileAnAttachment = (file: File): boolean =>
  file.content_disposition === "attachment" &&
  !!file.filename &&
  !DisallowedContentTypes.includes(file.content_type);
