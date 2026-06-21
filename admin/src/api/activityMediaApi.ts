import { ACTIVITY_API_BASE_URL } from "./activityApi";

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

export const uploadActivityThumbnail = async ({
  activityId,
  file,
  apiBaseUrl = ACTIVITY_API_BASE_URL,
}: {
  activityId: string;
  file: File;
  apiBaseUrl?: string;
}) => {
  const formData = new FormData();

  formData.append("mediaTarget", "thumbnail");
  formData.append("mediaType", "image");
  formData.append("file", file, file.name);

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
