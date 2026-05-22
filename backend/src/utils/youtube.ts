/**
 * Parse YouTube URLs and build thumbnail image URLs.
 */

export function getYouTubeVideoId(url: string): string | null {
  if (!url?.trim()) return null;

  try {
    const parsed = new URL(url.trim());
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = parsed.pathname.slice(1).split("/")[0];
      return id.length === 11 ? id : null;
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      const v = parsed.searchParams.get("v");
      if (v && v.length === 11) return v;

      const embedMatch = /^\/embed\/([^/?]+)/.exec(parsed.pathname);
      if (embedMatch && embedMatch[1].length === 11) return embedMatch[1];
    }
  } catch {
    // Fall through to regex for non-URL strings
  }

  const match = /(?:youtu\.be\/|v\/|embed\/|watch\?v=|&v=)([^#&?]{11})/.exec(url);
  return match?.[1] ?? null;
}

export function getYouTubeThumbnailUrl(videoUrl: string): string | null {
  const id = getYouTubeVideoId(videoUrl);
  if (!id) return null;
  return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
}
