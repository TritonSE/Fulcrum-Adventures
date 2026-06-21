import { getYouTubeThumbnailUrl } from "./youtube";

/**
 * Prefer an uploaded image thumbnail; otherwise derive from YouTube when videoUrl is set.
 */
export function resolveThumbnailUrl(
  thumbnailUrl: string | undefined | null,
  videoUrl: string | undefined | null,
): string | undefined {
  const thumb = thumbnailUrl?.trim();
  if (thumb) return thumb;

  const video = videoUrl?.trim();
  if (!video) return undefined;

  return getYouTubeThumbnailUrl(video) ?? undefined;
}
