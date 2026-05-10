import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

export type VideoFrameSource = {
  uri: string;
  name: string;
  type: string;
  sizeBytes: number;
  width: number;
  height: number;
  durationMs: number;
};

export type SelectedVideoFrame = {
  uri: string;
  width: number;
  height: number;
  timeMs: number;
};

type VideoFramePickerModalProps = {
  video: VideoFrameSource | null;
  visible: boolean;
  onCancel: () => void;
  onSelectFrame: (frame: SelectedVideoFrame) => void;
};

type VideoElementWithFrameCallback = HTMLVideoElement & {
  requestVideoFrameCallback?: (callback: () => void) => number;
};

const THUMBNAIL_GENERATION_DELAY_MS = 220;
const WEB_SEEK_FALLBACK_DELAY_MS = 1200;
const WEB_FRAME_SETTLE_DELAY_MS = 80;
const WEB_FRAME_CAPTURE_QUALITY = 0.88;
const TIMELINE_STEP_MS = 33;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const formatTimestamp = (timeMs: number) => {
  const totalSeconds = Math.floor(timeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const getFrameName = (videoName: string, timeMs: number) => {
  const baseName = videoName.replace(/\.[^/.]+$/, "") || "video-thumbnail";
  return `${baseName}-frame-${Math.round(timeMs)}.jpg`;
};

export const getVideoFrameImageName = getFrameName;

const waitForDecodedWebFrameAsync = async (video: HTMLVideoElement) =>
  new Promise<void>((resolve) => {
    const videoWithFrameCallback = video as VideoElementWithFrameCallback;
    let hasResolved = false;

    const finish = () => {
      if (hasResolved) return;

      hasResolved = true;
      clearTimeout(timeoutId);
      resolve();
    };

    const timeoutId = setTimeout(finish, WEB_FRAME_SETTLE_DELAY_MS);

    if (videoWithFrameCallback.requestVideoFrameCallback) {
      videoWithFrameCallback.requestVideoFrameCallback(finish);
    }
  });

const waitForWebVideoMetadataAsync = async (video: HTMLVideoElement) =>
  new Promise<void>((resolve, reject) => {
    if (video.readyState >= 1 && Number.isFinite(video.duration)) {
      resolve();
      return;
    }

    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error("Timed out while reading video metadata."));
    }, WEB_SEEK_FALLBACK_DELAY_MS);

    const cleanup = () => {
      clearTimeout(timeoutId);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("error", handleError);
    };

    const handleLoadedMetadata = () => {
      cleanup();
      resolve();
    };

    const handleError = () => {
      cleanup();
      reject(new Error("Unable to load the selected video preview."));
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata, { once: true });
    video.addEventListener("error", handleError, { once: true });
  });

const getWebTargetSeconds = (video: HTMLVideoElement, timeMs: number) => {
  const durationSeconds = Number.isFinite(video.duration) ? video.duration : 0;

  return clamp(timeMs / 1000, 0, Math.max(durationSeconds - 0.001, 0));
};

const seekWebVideoElementAsync = async (video: HTMLVideoElement, timeMs: number) => {
  await waitForWebVideoMetadataAsync(video);

  const targetSeconds = getWebTargetSeconds(video, timeMs);

  await new Promise<void>((resolve) => {
    let hasSettled = false;

    const timeoutId = setTimeout(complete, WEB_SEEK_FALLBACK_DELAY_MS);

    function cleanup() {
      clearTimeout(timeoutId);
      video.removeEventListener("loadeddata", complete);
      video.removeEventListener("seeked", complete);
    }

    function complete() {
      if (hasSettled) return;

      hasSettled = true;
      cleanup();
      void waitForDecodedWebFrameAsync(video).then(resolve);
    }

    if (video.readyState >= 2 && Math.abs(video.currentTime - targetSeconds) < 0.04) {
      complete();
      return;
    }

    video.addEventListener("loadeddata", complete, { once: true });
    video.addEventListener("seeked", complete, { once: true });

    try {
      video.currentTime = targetSeconds;
    } catch {
      complete();
    }
  });
};

const captureWebVideoElementFrameAsync = async (
  video: HTMLVideoElement,
  timeMs: number,
): Promise<SelectedVideoFrame> => {
  await seekWebVideoElementAsync(video, timeMs);

  const canvas = document.createElement("canvas");
  const width = video.videoWidth || 1;
  const height = video.videoHeight || 1;
  const context = canvas.getContext("2d");

  canvas.width = width;
  canvas.height = height;

  if (!context) {
    throw new Error("Unable to create a canvas context for video frame capture.");
  }

  try {
    context.drawImage(video, 0, 0, width, height);

    return {
      uri: canvas.toDataURL("image/jpeg", WEB_FRAME_CAPTURE_QUALITY),
      width,
      height,
      timeMs,
    };
  } catch {
    throw new Error("Unable to capture the selected video frame.");
  }
};

const getNativeVideoFrameAsync = async (
  videoUri: string,
  timeMs: number,
): Promise<SelectedVideoFrame> => {
  const VideoThumbnails = await import("expo-video-thumbnails");
  const frame = await VideoThumbnails.getThumbnailAsync(videoUri, {
    quality: WEB_FRAME_CAPTURE_QUALITY,
    time: timeMs,
  });

  return {
    ...frame,
    timeMs,
  };
};

const WebVideoFramePickerModal: React.FC<VideoFramePickerModalProps> = ({
  video,
  visible,
  onCancel,
  onSelectFrame,
}) => {
  const { width } = useWindowDimensions();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const selectedTimeRef = useRef(0);
  const previewWidth = Math.min(width - 48, 520);
  const previewHeight = previewWidth / (4 / 3);
  const [loadedDurationMs, setLoadedDurationMs] = useState<number | null>(null);
  const durationMs = Math.max(loadedDurationMs ?? video?.durationMs ?? 0, 1);
  const [selectedTimeMs, setSelectedTimeMs] = useState(0);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const setSelectedTime = useCallback(
    (nextTimeMs: number) => {
      const normalizedTimeMs = clamp(Math.round(nextTimeMs), 0, durationMs);

      selectedTimeRef.current = normalizedTimeMs;
      setSelectedTimeMs(normalizedTimeMs);
    },
    [durationMs],
  );

  const seekPreviewToTime = (timeMs: number) => {
    const videoElement = videoRef.current;

    if (!videoElement || !Number.isFinite(videoElement.duration)) return;

    try {
      videoElement.pause();
      videoElement.currentTime = getWebTargetSeconds(videoElement, timeMs);
    } catch {
      setPreviewError("Unable to seek through this video preview.");
    }
  };

  const handleRangeInput = (event: React.FormEvent<HTMLInputElement>) => {
    const nextTimeMs = Number(event.currentTarget.value);

    if (!Number.isFinite(nextTimeMs)) return;

    setSelectedTime(nextTimeMs);
    seekPreviewToTime(nextTimeMs);
  };

  const syncSelectedTimeFromVideo = () => {
    const videoElement = videoRef.current;

    if (!videoElement) return;

    setSelectedTime(videoElement.currentTime * 1000);
  };

  const handleLoadedMetadata = () => {
    const videoElement = videoRef.current;
    const nextDurationMs =
      videoElement && Number.isFinite(videoElement.duration)
        ? Math.round(videoElement.duration * 1000)
        : null;

    setLoadedDurationMs(nextDurationMs);
    setIsVideoReady(true);
    setPreviewError(null);
    setSelectedTime(0);
    seekPreviewToTime(0);
  };

  const handleUseSelectedFrame = async () => {
    const videoElement = videoRef.current;

    if (!videoElement || !isVideoReady || isCapturing) return;

    setIsCapturing(true);
    setPreviewError(null);

    try {
      videoElement.pause();
      const frame = await captureWebVideoElementFrameAsync(
        videoElement,
        selectedTimeRef.current,
      );

      onSelectFrame(frame);
    } catch (error) {
      setPreviewError(error instanceof Error ? error.message : "Unable to capture frame.");
    } finally {
      setIsCapturing(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      selectedTimeRef.current = 0;
      setSelectedTimeMs(0);
      setLoadedDurationMs(null);
      setIsVideoReady(false);
      setIsCapturing(false);
      setPreviewError(null);
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [visible, video?.uri]);

  if (!video) return null;

  const webVideoElement = React.createElement("video", {
    controls: true,
    controlsList: "nodownload noplaybackrate",
    muted: true,
    onError: () => {
      setIsVideoReady(false);
      setPreviewError("Unable to load the selected video preview.");
    },
    onLoadedData: () => {
      setIsVideoReady(true);
      setPreviewError(null);
    },
    onLoadedMetadata: handleLoadedMetadata,
    onSeeked: syncSelectedTimeFromVideo,
    onSeeking: syncSelectedTimeFromVideo,
    onTimeUpdate: syncSelectedTimeFromVideo,
    playsInline: true,
    preload: "auto",
    ref: videoRef,
    src: video.uri,
    style: {
      backgroundColor: "#000000",
      height: "100%",
      objectFit: "contain",
      width: "100%",
    },
  });

  const webRangeInput = React.createElement("input", {
    "aria-label": "Select video thumbnail frame time",
    disabled: !isVideoReady || isCapturing,
    max: durationMs,
    min: 0,
    onChange: handleRangeInput,
    onInput: handleRangeInput,
    onPointerDown: () => {
      videoRef.current?.pause();
    },
    step: TIMELINE_STEP_MS,
    style: {
      accentColor: "#153A7A",
      cursor: isVideoReady && !isCapturing ? "pointer" : "not-allowed",
      height: 34,
      width: "100%",
    },
    type: "range",
    value: selectedTimeMs,
  });

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.webModalCard}>
          <Text style={styles.title}>Select Video Thumbnail Frame</Text>
          <Text style={styles.description}>
            Drag through the video timeline, then use the selected frame for cropping.
          </Text>

          <View
            style={[
              styles.previewFrame,
              {
                width: previewWidth,
                height: previewHeight,
              },
            ]}
          >
            {webVideoElement}
            {!isVideoReady && !previewError && (
              <Text style={styles.previewPlaceholder}>Loading video preview...</Text>
            )}
            {previewError && <Text style={styles.previewError}>{previewError}</Text>}
            {isCapturing && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator color="#FFFFFF" />
              </View>
            )}
          </View>

          <View style={styles.timelineMeta}>
            <Text style={styles.timelineText}>{formatTimestamp(selectedTimeMs)}</Text>
            <Text style={styles.timelineText}>{formatTimestamp(durationMs)}</Text>
          </View>

          <View style={styles.webTimelineTrack}>{webRangeInput}</View>

          <View style={styles.actionRow}>
            <Pressable style={styles.secondaryButton} onPress={onCancel} disabled={isCapturing}>
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.primaryButton, (!isVideoReady || isCapturing) && styles.buttonDisabled]}
              onPress={() => {
                void handleUseSelectedFrame();
              }}
              disabled={!isVideoReady || isCapturing}
            >
              <Text style={styles.primaryButtonText}>Use This Frame</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const NativeVideoFramePickerModal: React.FC<VideoFramePickerModalProps> = ({
  video,
  visible,
  onCancel,
  onSelectFrame,
}) => {
  const { width } = useWindowDimensions();
  const previewWidth = Math.min(width - 48, 420);
  const previewHeight = previewWidth / (4 / 3);
  const [selectedTimeMs, setSelectedTimeMs] = useState(0);
  const [selectedFrame, setSelectedFrame] = useState<SelectedVideoFrame | null>(null);
  const [trackWidth, setTrackWidth] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const durationMs = video?.durationMs ?? 0;
  const safeDurationMs = Math.max(durationMs, 1);
  const progress = clamp(selectedTimeMs / safeDurationMs, 0, 1);

  const updateSelectedTimeFromTrackPosition = (positionX: number) => {
    const nextX = clamp(positionX, 0, trackWidth);

    setSelectedTimeMs(Math.round((nextX / trackWidth) * safeDurationMs));
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSelectedTimeMs(0);
      setSelectedFrame(null);
      setIsGenerating(false);
      setGenerationError(null);
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [visible, video?.uri]);

  useEffect(() => {
    if (!visible || !video) return;

    let isCanceled = false;

    const timeoutId = setTimeout(() => {
      setIsGenerating(true);
      setGenerationError(null);

      void getNativeVideoFrameAsync(video.uri, selectedTimeMs)
        .then((frame) => {
          if (isCanceled) return;

          setSelectedFrame(frame);
        })
        .catch((error: unknown) => {
          if (isCanceled) return;

          setSelectedFrame(null);
          setGenerationError(error instanceof Error ? error.message : "Unable to extract a frame.");
        })
        .finally(() => {
          if (!isCanceled) setIsGenerating(false);
        });
    }, THUMBNAIL_GENERATION_DELAY_MS);

    return () => {
      isCanceled = true;
      clearTimeout(timeoutId);
    };
  }, [selectedTimeMs, video, visible]);

  if (!video) return null;

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          <Text style={styles.title}>Select Video Thumbnail Frame</Text>
          <Text style={styles.description}>
            Drag through the video timeline, then use the selected frame for cropping.
          </Text>

          <View
            style={[
              styles.previewFrame,
              {
                width: previewWidth,
                height: previewHeight,
              },
            ]}
          >
            {selectedFrame ? (
              <Image source={{ uri: selectedFrame.uri }} style={styles.previewImage} />
            ) : generationError ? (
              <Text style={styles.previewError}>{generationError}</Text>
            ) : (
              <Text style={styles.previewPlaceholder}>Generating frame...</Text>
            )}

            {isGenerating && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator color="#FFFFFF" />
              </View>
            )}
          </View>

          <View style={styles.timelineMeta}>
            <Text style={styles.timelineText}>{formatTimestamp(selectedTimeMs)}</Text>
            <Text style={styles.timelineText}>{formatTimestamp(durationMs)}</Text>
          </View>

          <View
            style={styles.timelineTrack}
            onLayout={(event) => setTrackWidth(Math.max(event.nativeEvent.layout.width, 1))}
            onMoveShouldSetResponder={() => true}
            onResponderGrant={(event) => {
              updateSelectedTimeFromTrackPosition(event.nativeEvent.locationX);
            }}
            onResponderMove={(event) => {
              updateSelectedTimeFromTrackPosition(event.nativeEvent.locationX);
            }}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.timelineRail} />
            <View style={[styles.timelineProgress, { width: `${progress * 100}%` }]} />
            <View style={[styles.timelineThumb, { left: `${progress * 100}%` }]} />
          </View>

          <View style={styles.actionRow}>
            <Pressable style={styles.secondaryButton} onPress={onCancel} disabled={isGenerating}>
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.primaryButton, (!selectedFrame || isGenerating) && styles.buttonDisabled]}
              onPress={() => {
                if (selectedFrame) onSelectFrame(selectedFrame);
              }}
              disabled={!selectedFrame || isGenerating}
            >
              <Text style={styles.primaryButtonText}>Use This Frame</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export const VideoFramePickerModal: React.FC<VideoFramePickerModalProps> = (props) => {
  if (Platform.OS === "web") {
    return <WebVideoFramePickerModal {...props} />;
  }

  return <NativeVideoFramePickerModal {...props} />;
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 520,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    padding: 24,
    alignItems: "center",
  },
  webModalCard: {
    width: "100%",
    maxWidth: 620,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    padding: 24,
    alignItems: "center",
  },
  title: {
    color: "#153A7A",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  description: {
    color: "#5B6B8B",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  previewFrame: {
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#D7DDE8",
    alignItems: "center",
    justifyContent: "center",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  previewPlaceholder: {
    color: "#5B6B8B",
    fontSize: 14,
  },
  previewError: {
    color: "#E55C4D",
    fontSize: 14,
    paddingHorizontal: 16,
    textAlign: "center",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  timelineMeta: {
    width: "100%",
    maxWidth: 520,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
    marginBottom: 8,
  },
  timelineText: {
    color: "#5B6B8B",
    fontSize: 13,
    fontWeight: "600",
  },
  webTimelineTrack: {
    width: "100%",
    maxWidth: 520,
  },
  timelineTrack: {
    width: "100%",
    maxWidth: 420,
    height: 34,
    justifyContent: "center",
  },
  timelineRail: {
    position: "absolute",
    left: 0,
    right: 0,
    borderRadius: 999,
    backgroundColor: "#D7DDE8",
    height: 6,
    top: 14,
  },
  timelineProgress: {
    position: "absolute",
    left: 0,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#153A7A",
    top: 14,
  },
  timelineThumb: {
    position: "absolute",
    width: 22,
    height: 22,
    marginLeft: -11,
    borderRadius: 999,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    backgroundColor: "#153A7A",
    top: 6,
  },
  actionRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 24,
  },
  secondaryButton: {
    minHeight: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#153A7A",
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  secondaryButtonText: {
    color: "#153A7A",
    fontSize: 14,
    fontWeight: "600",
  },
  primaryButton: {
    minHeight: 42,
    minWidth: 132,
    borderRadius: 8,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#153A7A",
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
