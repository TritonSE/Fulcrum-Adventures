export const ACTIVITY_MEDIA_FORM_FIELD = "file";
export const MEDIA_TARGET_FORM_FIELD = "mediaTarget";
export const MEDIA_TYPE_FORM_FIELD = "mediaType";
export const THUMBNAIL_IMAGE_FORM_FIELD = ACTIVITY_MEDIA_FORM_FIELD;
export const ACTIVITY_VIDEO_FORM_FIELD = ACTIVITY_MEDIA_FORM_FIELD;

export const MAX_IMAGE_UPLOAD_BYTES = 10 * 1024 * 1024;
export const MAX_VIDEO_UPLOAD_BYTES = 100 * 1024 * 1024;

export const SUPPORTED_IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "heic", "heif", "webp"];
export const SUPPORTED_VIDEO_EXTENSIONS = ["mp4", "mov", "m4v"];
export const SUPPORTED_IMAGE_FORMAT_LABEL = "JPG, JPEG, PNG, HEIC, HEIF, WEBP";
export const SUPPORTED_MEDIA_FORMAT_LABEL = "JPG, JPEG, PNG, HEIC, HEIF, WEBP, MP4, MOV, M4V";

export const SUPPORTED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/heif",
  "image/webp",
];

export const SUPPORTED_VIDEO_MIME_TYPES = ["video/mp4", "video/quicktime", "video/x-m4v"];

export const formatMegabytes = (bytes: number) => `${Math.round(bytes / (1024 * 1024))} MB`;
