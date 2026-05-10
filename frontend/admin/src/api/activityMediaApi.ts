import {
  ACTIVITY_MEDIA_FORM_FIELD,
  MEDIA_TARGET_FORM_FIELD,
  MEDIA_TYPE_FORM_FIELD,
} from "../create_edit_page_components/mediaUploadConfig";

import type {
  ThumbnailImageFile,
  ThumbnailVideoFile,
} from "../create_edit_page_components/OverviewSection";

export const DEFAULT_ACTIVITY_API_BASE_URL = "http://localhost:4000";

export type ActivityMediaTarget = "thumbnail" | "additional";
export type ActivityMediaType = "image" | "video";

export type UploadableActivityMedia = {
  uri: string;
  name: string;
  type: string;
};

type UploadActivityMediaParams = {
  activityId: string;
  media: UploadableActivityMedia;
  mediaTarget: ActivityMediaTarget;
  mediaType?: ActivityMediaType;
  apiBaseUrl?: string;
};

type UploadActivityMediaSelectionParams = {
  activityId: string;
  thumbnailImage: ThumbnailImageFile | null;
  thumbnailVideo: ThumbnailVideoFile | null;
  apiBaseUrl?: string;
};

type UploadActivityMediaResult = {
  thumbnail?: unknown;
  video?: unknown;
};

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const toWebFile = async (media: UploadableActivityMedia) => {
  const response = await fetch(media.uri);

  if (!response.ok) {
    throw new Error(`Unable to read media before upload: ${response.status}`);
  }

  const blob = await response.blob();
  const type = media.type || blob.type || "application/octet-stream";

  return new File([blob], media.name, { type });
};

const toFormDataFilePart = async (media: UploadableActivityMedia) => {
  if (typeof document !== "undefined") {
    return toWebFile(media);
  }

  return {
    uri: media.uri,
    name: media.name,
    type: media.type,
  } as unknown as Blob;
};

export const uploadActivityMedia = async ({
  activityId,
  media,
  mediaTarget,
  mediaType,
  apiBaseUrl = DEFAULT_ACTIVITY_API_BASE_URL,
}: UploadActivityMediaParams) => {
  const formData = new FormData();
  const filePart = await toFormDataFilePart(media);

  formData.append(MEDIA_TARGET_FORM_FIELD, mediaTarget);
  if (mediaType) formData.append(MEDIA_TYPE_FORM_FIELD, mediaType);
  formData.append(ACTIVITY_MEDIA_FORM_FIELD, filePart, media.name);

  const response = await fetch(
    `${trimTrailingSlash(apiBaseUrl)}/api/activities/${activityId}/media`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Media upload failed with status ${response.status}`);
  }

  return response.json() as Promise<unknown>;
};

export const uploadActivityMediaSelection = async ({
  activityId,
  thumbnailImage,
  thumbnailVideo,
  apiBaseUrl,
}: UploadActivityMediaSelectionParams): Promise<UploadActivityMediaResult> => {
  const result: UploadActivityMediaResult = {};

  if (thumbnailImage) {
    result.thumbnail = await uploadActivityMedia({
      activityId,
      media: thumbnailImage,
      mediaTarget: "thumbnail",
      mediaType: "image",
      apiBaseUrl,
    });
  }

  if (thumbnailVideo) {
    result.video = await uploadActivityMedia({
      activityId,
      media: thumbnailVideo,
      mediaTarget: "additional",
      mediaType: "video",
      apiBaseUrl,
    });
  }

  return result;
};
