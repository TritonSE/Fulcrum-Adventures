import { useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  createActivity,
  getActivityById,
  getActivityId,
  updateActivity,
  updateActivityStatus,
  type ActivityDetail,
  type ActivityStatus,
  type CreateActivityPayload,
} from "../api/activityApi";
import { uploadActivityThumbnail } from "../api/activityMediaApi";
import AddIconUrl from "../assets/AddIcon.svg";
import ActionIconUrl from "../assets/Action.svg";
import BlankEnergyStarIconUrl from "../assets/blankenergystar.svg";
import BookmarkIconUrl from "../assets/BookMarkIcon.svg";
import ButtonIconUrl from "../assets/Button.svg";
import ChangeVideoIconUrl from "../assets/ChangeVideo.svg";
import ClockIconUrl from "../assets/clock.svg";
import CloseIconUrl from "../assets/CloseIcon.svg";
import CropImageIconUrl from "../assets/CropImage.svg";
import DeleteImageIconUrl from "../assets/DeleteImage.svg";
import DeleteSectionButtonUrl from "../assets/DeleteSectionButton.svg";
import PhoneFrameImageUrl from "../assets/378_rectangle_extracted.png";
import GraduationCapIconUrl from "../assets/graduation-cap.svg";
import PageIconUrl from "../assets/PageIcon.svg";
import PeopleIconUrl from "../assets/people.svg";
import UploadTabIconUrl from "../assets/upload.svg";
import UploadImageIconUrl from "../assets/UploadImage.svg";
import VideoTabIconUrl from "../assets/video.svg";
import VectorIconUrl from "../assets/Vector.svg";
import YellowEnergyStarIconUrl from "../assets/yellowenergystar.svg";
import { NavBar } from "../components/NavBar";
import "./ActivityEditorPage.css";

const CATEGORY_OPTIONS = [
  "Opener",
  "Icebreaker",
  "Active",
  "Connection",
  "Debrief",
  "Team Challenge",
] as const;
const DURATION_OPTIONS = ["5-15 min", "15-30 min", "30+ min"] as const;
const ENERGY_OPTIONS = ["Low", "Medium", "High"] as const;
const ENVIRONMENT_OPTIONS = ["Blacktop", "Field", "Classroom", "Gym/MPR"] as const;
const GRADE_OPTIONS = ["K", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
const YOUTUBE_VIDEO_ID_PATTERN = /^[\w-]{11}$/;
const MAX_SECTION_TITLE_LENGTH = 30;
const MAX_SECTIONS = 6;
const MAX_TABS = 6;
const MAX_TAB_NAME_LENGTH = 20;
const THUMBNAIL_CROP_ASPECT_RATIO = 16 / 9;
const MIN_CROP_WIDTH_RATIO = 0.22;

type EditorMode = "create" | "edit";
type TabKind = "prep" | "play" | "debrief" | "custom";
type CoverTabKind = "image" | "youtube";

type ActivitySection = {
  id: string;
  title: string;
  content: string;
};

type ActivityTab = {
  id: string;
  name: string;
  kind: TabKind;
  sections: ActivitySection[];
  guidedItems: string[];
  materials: string[];
  noMaterialsNeeded: boolean;
};

type FormState = {
  title: string;
  overview: string;
  categories: string[];
  gradeMin: string;
  gradeMax: string;
  groupSizeMin: string;
  groupSizeMax: string;
  anyGroupSize: boolean;
  duration: string;
  energyLevel: string;
  environments: string[];
  anyEnvironment: boolean;
  setup: "Props" | "No Props" | "";
  objective: string;
  selTags: string[];
  videoUrl: string;
  videoThumbnailUrl: string | null;
  videoThumbnailStatus: "idle" | "checking" | "ready" | "error";
};

type FormErrors = {
  thumbnail?: string;
  title?: string;
  overview?: string;
  categories?: string;
  grade?: string;
  groupSize?: string;
  duration?: string;
  energyLevel?: string;
  environment?: string;
  setup?: string;
  objective?: string;
  setupInstructions?: string;
  materials?: string;
  playGuidedItems?: (string | null)[];
  debriefGuidedItems?: (string | null)[];
  selTags?: string;
  customTabs?: Record<string, string>;
  sections?: Record<string, { title?: string; content?: string }>;
};

type ActivityEditorPageProps = {
  mode: EditorMode;
};

type CropRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type CropHandle = "move" | "nw" | "ne" | "sw" | "se";

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function createCenteredCropRect(containerWidth: number, containerHeight: number): CropRect {
  const maxWidth = containerWidth * 0.68;
  const maxHeight = containerHeight * 0.68;

  let width = maxWidth;
  let height = width / THUMBNAIL_CROP_ASPECT_RATIO;

  if (height > maxHeight) {
    height = maxHeight;
    width = height * THUMBNAIL_CROP_ASPECT_RATIO;
  }

  return {
    x: (containerWidth - width) / 2,
    y: (containerHeight - height) / 2,
    width,
    height,
  };
}

function constrainCropRect(rect: CropRect, containerWidth: number, containerHeight: number): CropRect {
  const maxWidth = Math.min(containerWidth, containerHeight * THUMBNAIL_CROP_ASPECT_RATIO);
  const minWidth = Math.min(containerWidth * MIN_CROP_WIDTH_RATIO, maxWidth);
  const width = clamp(rect.width, minWidth, maxWidth);
  const height = width / THUMBNAIL_CROP_ASPECT_RATIO;

  return {
    x: clamp(rect.x, 0, Math.max(containerWidth - width, 0)),
    y: clamp(rect.y, 0, Math.max(containerHeight - height, 0)),
    width,
    height,
  };
}

async function cropImageToFile({
  image,
  cropRect,
  renderedWidth,
  renderedHeight,
  fileName,
}: {
  image: HTMLImageElement;
  cropRect: CropRect;
  renderedWidth: number;
  renderedHeight: number;
  fileName: string;
}) {
  const scaleX = image.naturalWidth / renderedWidth;
  const scaleY = image.naturalHeight / renderedHeight;
  const canvas = document.createElement("canvas");
  const outputWidth = Math.max(Math.round(cropRect.width * scaleX), 1);
  const outputHeight = Math.max(Math.round(cropRect.height * scaleY), 1);

  canvas.width = outputWidth;
  canvas.height = outputHeight;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Unable to prepare cropped image.");
  }

  context.drawImage(
    image,
    cropRect.x * scaleX,
    cropRect.y * scaleY,
    cropRect.width * scaleX,
    cropRect.height * scaleY,
    0,
    0,
    outputWidth,
    outputHeight,
  );

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((nextBlob) => {
      if (nextBlob) {
        resolve(nextBlob);
        return;
      }
      reject(new Error("Unable to save cropped image."));
    }, "image/jpeg", 0.92);
  });

  const normalizedFileName = fileName.replace(/\.[^.]+$/, "") || "activity-thumbnail";
  return new File([blob], `${normalizedFileName}-cropped.jpg`, { type: "image/jpeg" });
}

function CollapsibleSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section className="activity-section-card">
      <button
        type="button"
        className="activity-section-toggle"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
      >
        <span>{title}</span>
        <span className={`activity-section-arrow ${isOpen ? "activity-section-arrow-open" : ""}`}>
          ▼
        </span>
      </button>
      {isOpen ? <div className="activity-section-body">{children}</div> : null}
    </section>
  );
}

function ChoiceChip({
  active,
  disabled = false,
  className = "",
  onClick,
  children,
}: {
  active: boolean;
  disabled?: boolean;
  className?: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className={`activity-chip ${active ? "activity-chip-active" : ""} ${className}`.trim()}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function FieldError({ message }: { message: string }) {
  return (
    <div className="activity-error-row">
      <img src={VectorIconUrl} alt="" aria-hidden="true" className="activity-error-icon" />
      <p className="activity-error-text">{message}</p>
    </div>
  );
}

function GradeSlider({
  minValue,
  maxValue,
  onChange,
  hasError = false,
}: {
  minValue: string;
  maxValue: string;
  onChange: (minValue: string, maxValue: string) => void;
  hasError?: boolean;
}) {
  const railRef = useRef<HTMLDivElement | null>(null);
  const [railWidth, setRailWidth] = useState(0);
  const stepCount = GRADE_OPTIONS.length - 1;
  const minIndex = Math.max(GRADE_OPTIONS.indexOf(minValue), 0);
  const maxIndex = Math.max(GRADE_OPTIONS.indexOf(maxValue), 0);
  const handleSize = 22;
  const usableWidth = Math.max(railWidth - handleSize, 1);

  useEffect(() => {
    const measure = () => {
      setRailWidth(railRef.current?.offsetWidth ?? 0);
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const getCenterXForIndex = (index: number) => {
    if (stepCount === 0) return handleSize / 2;
    return handleSize / 2 + (index / stepCount) * usableWidth;
  };

  const getIndexFromClientX = (clientX: number) => {
    if (!railRef.current) return 0;
    const rect = railRef.current.getBoundingClientRect();
    const relativeX = Math.min(
      Math.max(clientX - rect.left, handleSize / 2),
      Math.max(rect.width - handleSize / 2, handleSize / 2),
    );
    const ratio = (relativeX - handleSize / 2) / Math.max(rect.width - handleSize, 1);
    return Math.min(Math.max(Math.round(ratio * stepCount), 0), stepCount);
  };

  const beginDrag = (
    handleType: "min" | "max",
    event: ReactMouseEvent<HTMLButtonElement> | ReactTouchEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();

    const getPoint = (moveEvent: MouseEvent | TouchEvent) =>
      "touches" in moveEvent ? moveEvent.touches[0]?.clientX ?? 0 : moveEvent.clientX;

    const updateValue = (clientX: number) => {
      const draggedIndex = getIndexFromClientX(clientX);
      if (handleType === "min") {
        const nextMinIndex = Math.min(draggedIndex, maxIndex);
        onChange(GRADE_OPTIONS[nextMinIndex] ?? "K", GRADE_OPTIONS[maxIndex] ?? "K");
        return;
      }

      const nextMaxIndex = Math.max(draggedIndex, minIndex);
      onChange(GRADE_OPTIONS[minIndex] ?? "K", GRADE_OPTIONS[nextMaxIndex] ?? "K");
    };

    const handleMouseMove = (moveEvent: MouseEvent) => updateValue(getPoint(moveEvent));
    const handleTouchMove = (moveEvent: TouchEvent) => updateValue(getPoint(moveEvent));
    const stopDragging = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopDragging);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", stopDragging);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", stopDragging);
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", stopDragging);
  };

  const minCenterX = getCenterXForIndex(minIndex);
  const maxCenterX = getCenterXForIndex(maxIndex);

  return (
    <div className="activity-field-group">
      <p className="activity-field-label">Grade</p>
      <p className="activity-grade-value">
        {minValue} - {maxValue}
      </p>
      <div ref={railRef} className="activity-grade-rail-container">
        <div className={`activity-grade-rail ${hasError ? "activity-grade-rail-error" : ""}`} />
        <div
          className={`activity-grade-selected-rail ${hasError ? "activity-grade-selected-rail-error" : ""}`}
          style={{
            left: `${minCenterX}px`,
            width: `${Math.max(maxCenterX - minCenterX, 0)}px`,
          }}
        />
        <button
          type="button"
          className={`activity-grade-handle ${hasError ? "activity-grade-handle-error" : ""}`}
          style={{ left: `${minCenterX - handleSize / 2}px` }}
          onMouseDown={(event) => beginDrag("min", event)}
          onTouchStart={(event) => beginDrag("min", event)}
          aria-label="Minimum grade"
        />
        <button
          type="button"
          className={`activity-grade-handle ${hasError ? "activity-grade-handle-error" : ""}`}
          style={{ left: `${maxCenterX - handleSize / 2}px` }}
          onMouseDown={(event) => beginDrag("max", event)}
          onTouchStart={(event) => beginDrag("max", event)}
          aria-label="Maximum grade"
        />
      </div>
      <div className="activity-grade-tick-label-row">
        {GRADE_OPTIONS.map((grade) => (
          <span key={grade} className="activity-grade-tick-label">
            {grade}
          </span>
        ))}
      </div>
    </div>
  );
}

function ThumbnailCropModal({
  visible,
  imageSrc,
  fileName,
  onClose,
  onSave,
}: {
  visible: boolean;
  imageSrc: string | null;
  fileName: string;
  onClose: () => void;
  onSave: (file: File, previewUrl: string) => void;
}) {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [cropRect, setCropRect] = useState<CropRect | null>(null);
  const [initialCropRect, setInitialCropRect] = useState<CropRect | null>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [cropError, setCropError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDiscardConfirmVisible, setIsDiscardConfirmVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      document.body.classList.add("activity-modal-open");
      return;
    }

    document.body.classList.remove("activity-modal-open");
  }, [visible]);

  useEffect(() => () => document.body.classList.remove("activity-modal-open"), []);

  useEffect(() => {
    if (!visible) {
      setCropRect(null);
      setInitialCropRect(null);
      setImageSize({ width: 0, height: 0 });
      setCropError(null);
      setIsSaving(false);
      setIsDiscardConfirmVisible(false);
    }
  }, [visible]);

  const handleImageLoad = () => {
    const image = imageRef.current;
    if (!image) return;

    const width = image.clientWidth;
    const height = image.clientHeight;
    const nextCropRect = createCenteredCropRect(width, height);

    setImageSize({ width, height });
    setCropRect(nextCropRect);
    setInitialCropRect(nextCropRect);
    setCropError(null);
  };

  const beginDrag = (handle: CropHandle, event: ReactMouseEvent<HTMLButtonElement | HTMLDivElement>) => {
    if (!cropRect || imageSize.width <= 0 || imageSize.height <= 0) return;

    event.preventDefault();
    const startRect = cropRect;
    const startClientX = event.clientX;
    const startClientY = event.clientY;
    const minWidth = Math.min(imageSize.width * MIN_CROP_WIDTH_RATIO, imageSize.width);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startClientX;
      const deltaY = moveEvent.clientY - startClientY;

      setCropRect(() => {
        if (handle === "move") {
          return constrainCropRect(
            {
              ...startRect,
              x: startRect.x + deltaX,
              y: startRect.y + deltaY,
            },
            imageSize.width,
            imageSize.height,
          );
        }

        const right = startRect.x + startRect.width;
        const bottom = startRect.y + startRect.height;
        const widthFromX = handle === "nw" || handle === "sw" ? right - (startRect.x + deltaX) : startRect.width + deltaX;
        const widthFromY =
          handle === "nw" || handle === "ne"
            ? (bottom - (startRect.y + deltaY)) * THUMBNAIL_CROP_ASPECT_RATIO
            : (startRect.height + deltaY) * THUMBNAIL_CROP_ASPECT_RATIO;

        let nextWidth = clamp(
          Math.min(
            widthFromX,
            widthFromY,
            handle === "nw" || handle === "sw" ? right : imageSize.width - startRect.x,
            (handle === "nw" || handle === "ne" ? bottom : imageSize.height - startRect.y) *
              THUMBNAIL_CROP_ASPECT_RATIO,
          ),
          minWidth,
          Math.min(imageSize.width, imageSize.height * THUMBNAIL_CROP_ASPECT_RATIO),
        );

        const nextHeight = nextWidth / THUMBNAIL_CROP_ASPECT_RATIO;
        let nextX = startRect.x;
        let nextY = startRect.y;

        if (handle === "nw" || handle === "sw") {
          nextX = right - nextWidth;
        }
        if (handle === "nw" || handle === "ne") {
          nextY = bottom - nextHeight;
        }

        return constrainCropRect(
          {
            x: nextX,
            y: nextY,
            width: nextWidth,
            height: nextHeight,
          },
          imageSize.width,
          imageSize.height,
        );
      });
    };

    const stopDragging = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopDragging);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", stopDragging);
  };

  const handleReset = () => {
    if (initialCropRect) {
      setCropRect(initialCropRect);
      setCropError(null);
    }
  };

  const handleSave = async () => {
    if (!imageRef.current || !cropRect || imageSize.width <= 0 || imageSize.height <= 0) return;

    try {
      setIsSaving(true);
      setCropError(null);
      const file = await cropImageToFile({
        image: imageRef.current,
        cropRect,
        renderedWidth: imageSize.width,
        renderedHeight: imageSize.height,
        fileName,
      });
      const previewUrl = URL.createObjectURL(file);
      onSave(file, previewUrl);
    } catch (error) {
      setCropError(error instanceof Error ? error.message : "Unable to crop image.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRequestClose = () => {
    setIsDiscardConfirmVisible(true);
  };

  const handleKeepEditing = () => {
    setIsDiscardConfirmVisible(false);
  };

  const handleDiscardChanges = () => {
    setIsDiscardConfirmVisible(false);
    onClose();
  };

  if (!visible || !imageSrc) return null;

  return (
    <div className="activity-preview-backdrop" role="dialog" aria-modal="true">
      <div className="activity-crop-shell">
        <div className="activity-crop-stage">
          <div className="activity-crop-image-wrap">
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Crop thumbnail"
              className="activity-crop-image"
              crossOrigin="anonymous"
              onLoad={handleImageLoad}
            />

            {cropRect ? (
              <div
                className="activity-crop-selection"
                style={{
                  left: `${cropRect.x}px`,
                  top: `${cropRect.y}px`,
                  width: `${cropRect.width}px`,
                  height: `${cropRect.height}px`,
                }}
              >
                <button
                  type="button"
                  className="activity-crop-selection-hitbox"
                  onMouseDown={(event) => beginDrag("move", event)}
                  aria-label="Move crop area"
                />
                <span className="activity-crop-grid-line activity-crop-grid-line-v1" />
                <span className="activity-crop-grid-line activity-crop-grid-line-v2" />
                <span className="activity-crop-grid-line activity-crop-grid-line-h1" />
                <span className="activity-crop-grid-line activity-crop-grid-line-h2" />

                {(["nw", "ne", "sw", "se"] as const).map((handle) => (
                  <button
                    key={handle}
                    type="button"
                    className={`activity-crop-handle activity-crop-handle-${handle}`}
                    onMouseDown={(event) => beginDrag(handle, event)}
                    aria-label={`Resize crop ${handle}`}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <p className="activity-crop-instructions">Drag rectangle or adjust corners to crop</p>
        {cropError ? <FieldError message={cropError} /> : null}

        <div className="activity-crop-actions">
          <button type="button" className="activity-secondary-button" onClick={handleReset}>
            Reset Changes
          </button>
          <button type="button" className="activity-secondary-button" onClick={handleRequestClose}>
            Cancel
          </button>
          <button type="button" className="activity-primary-button" disabled={isSaving} onClick={() => void handleSave()}>
            Save Changes
          </button>
        </div>
      </div>

      {isDiscardConfirmVisible ? (
        <div className="activity-discard-backdrop" role="dialog" aria-modal="true">
          <div className="activity-discard-shell">
            <h2 className="activity-discard-title">Discard edits?</h2>
            <p className="activity-discard-copy">You will lose all changes made to the image.</p>

            <div className="activity-discard-actions">
              <button type="button" className="activity-secondary-button" onClick={handleKeepEditing}>
                Keep Editing
              </button>
              <button type="button" className="activity-discard-button" onClick={handleDiscardChanges}>
                Discard Changes
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function PublishPreviewModal({
  visible,
  onClose,
  onSaveDraft,
  onPublish,
  publishLabel,
  form,
  thumbnailPreviewUrl,
  objective,
  tabs,
  selTags,
}: {
  visible: boolean;
  onClose: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
  publishLabel: string;
  form: FormState;
  thumbnailPreviewUrl: string | null;
  objective: string;
  tabs: ActivityTab[];
  selTags: string[];
}) {
  const [activeFacilitateTab, setActiveFacilitateTab] = useState<"prep" | "play" | "debrief">("prep");
  const previewTabs = useMemo(
    () =>
      tabs.map((tab) => ({
        ...tab,
        sections: tab.sections.map((section, index) => ({
          title: section.title.trim() || (index === 0 ? "Section" : `Section ${index + 1}`),
          content: section.content.trim(),
        })),
      })),
    [tabs],
  );

  useEffect(() => {
    if (visible) {
      document.body.classList.add("activity-modal-open");
      return;
    }

    document.body.classList.remove("activity-modal-open");
  }, [visible]);

  useEffect(() => () => document.body.classList.remove("activity-modal-open"), []);

  if (!visible) return null;

  const energyLevelFilledStars =
    form.energyLevel === "High" ? 3 : form.energyLevel === "Medium" ? 2 : form.energyLevel === "Low" ? 1 : 0;
  const activePreviewTab =
    previewTabs.find((tab) => tab.kind === activeFacilitateTab) ?? previewTabs[0] ?? null;
  const gradeRangeLabel = `${form.gradeMin}-${form.gradeMax}`;
  const groupSizeLabel = form.anyGroupSize
    ? "Any size"
    : form.groupSizeMin && form.groupSizeMax
      ? `${form.groupSizeMin}-${form.groupSizeMax}`
      : "No group size set";
  const environmentLabel = form.anyEnvironment
    ? "Any Environment"
    : form.environments.length > 0
      ? form.environments.join(", ")
      : "No environment selected";

  return (
    <div className="activity-preview-backdrop" role="dialog" aria-modal="true">
      <div className="activity-preview-shell">
        <h2 className="activity-preview-title">Preview</h2>
        <p className="activity-preview-subtitle">Scroll on the phone screen to view full page</p>

        <div className="activity-preview-phone-wrapper">
          <div className="activity-preview-phone-screen">
            <div className="activity-preview-hero-card">
              {thumbnailPreviewUrl || form.videoThumbnailUrl ? (
                <img
                  src={thumbnailPreviewUrl ?? form.videoThumbnailUrl ?? ""}
                  alt="Activity preview"
                  className="activity-preview-hero-image"
                />
              ) : (
                <div className="activity-preview-hero-placeholder" />
              )}

              {form.videoThumbnailUrl ? (
                <div className="activity-preview-hero-overlay">
                  <div className="activity-preview-tutorial-pill">
                    <img src={ActionIconUrl} alt="" aria-hidden="true" />
                    <span>Tutorial</span>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="activity-preview-content-card">
              <div className="activity-preview-top-row">
                <div className="activity-preview-category-row">
                  {form.categories.slice(0, 1).map((category) => (
                    <span key={category} className="activity-preview-category-chip">
                      {category}
                    </span>
                  ))}
                </div>

                <div className="activity-preview-action-row">
                  <span className="activity-preview-action-button">
                    <img src={PageIconUrl} alt="" aria-hidden="true" />
                  </span>
                  <span className="activity-preview-action-button">
                    <img src={BookmarkIconUrl} alt="" aria-hidden="true" />
                  </span>
                </div>
              </div>

              <h3 className="activity-preview-activity-title">{form.title || "Untitled activity"}</h3>

              <div className="activity-preview-metric-row">
                <span className="activity-preview-metric-item">
                  <img src={GraduationCapIconUrl} alt="" aria-hidden="true" />
                  <span>{gradeRangeLabel}</span>
                </span>
                <span className="activity-preview-dot">•</span>
                <span className="activity-preview-metric-item">
                  <img src={PeopleIconUrl} alt="" aria-hidden="true" />
                  <span>{groupSizeLabel}</span>
                </span>
                <span className="activity-preview-dot">•</span>
                <span className="activity-preview-metric-item">
                  <img src={ClockIconUrl} alt="" aria-hidden="true" />
                  <span>{form.duration || "No duration set"}</span>
                </span>
              </div>

              <p className="activity-preview-description-text">
                {form.overview || "No overview provided yet."}
              </p>

              <div className="activity-preview-tag-row">
                <div className="activity-preview-energy-stars-row">
                  {[0, 1, 2].map((index) => (
                    <img
                      key={`energy-star-${index}`}
                      src={index < energyLevelFilledStars ? YellowEnergyStarIconUrl : BlankEnergyStarIconUrl}
                      alt=""
                      aria-hidden="true"
                    />
                  ))}
                </div>

                <span className="activity-preview-chip">{environmentLabel}</span>
                <span className="activity-preview-chip">{form.setup === "Props" ? "Props" : "No Props"}</span>
              </div>

              <div className="activity-preview-body-section">
                <h4 className="activity-preview-body-section-title">Objective</h4>
                <p className="activity-preview-body-section-text">
                  {objective || "No objective added yet."}
                </p>
              </div>

              <div className="activity-preview-body-section activity-preview-body-section-no-border">
                <h4 className="activity-preview-body-section-title">Facilitate</h4>

                <div className="activity-preview-facilitate-tab-bar">
                  {(["prep", "play", "debrief"] as const).map((tabKind, index) => (
                    <div className="activity-preview-facilitate-tab-wrap" key={tabKind}>
                      <button
                        type="button"
                        className={`activity-preview-facilitate-tab ${
                          activeFacilitateTab === tabKind ? "activity-preview-facilitate-tab-active" : ""
                        }`}
                        onClick={() => setActiveFacilitateTab(tabKind)}
                      >
                        {tabKind === "prep" ? "Prep" : tabKind === "play" ? "Play" : "Debrief"}
                      </button>
                      {index < 2 ? <span className="activity-preview-facilitate-tab-divider" /> : null}
                    </div>
                  ))}
                </div>

                {activePreviewTab ? (
                  <div className="activity-preview-tab-card">
                    {activePreviewTab.kind === "play" || activePreviewTab.kind === "debrief" ? (
                      <div className="activity-preview-list-group">
                        {activePreviewTab.guidedItems.map((item, index) => (
                          <div key={`${activePreviewTab.id}-guided-${index}`} className="activity-preview-list-item">
                            <h5 className="activity-preview-list-item-label">
                              {activePreviewTab.kind === "play" ? `Step ${index + 1}` : `Q${index + 1}`}
                            </h5>
                            <p className="activity-preview-list-item-text">
                              {item.trim() || "No content added yet."}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="activity-preview-list-group">
                        {activePreviewTab.sections.map((section, index) => (
                          <div key={`${activePreviewTab.id}-section-${index}`} className="activity-preview-section-block">
                            <h5 className="activity-preview-section-block-title">{section.title}</h5>
                            <p className="activity-preview-section-block-text">
                              {section.content || "No content added yet."}
                            </p>
                          </div>
                        ))}

                        {activePreviewTab.kind === "prep" ? (
                          <div className="activity-preview-material-block">
                            <h5 className="activity-preview-section-block-title">Materials</h5>
                            {activePreviewTab.noMaterialsNeeded ? (
                              <p className="activity-preview-section-block-text">No materials needed.</p>
                            ) : activePreviewTab.materials.length > 0 ? (
                              activePreviewTab.materials.map((material) => (
                                <div key={`${activePreviewTab.id}-${material}`} className="activity-preview-material-item-row">
                                  <div className="activity-preview-material-checkbox" />
                                  <span className="activity-preview-section-block-text">{material}</span>
                                </div>
                              ))
                            ) : (
                              <p className="activity-preview-section-block-text">No materials added yet.</p>
                            )}
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>

              <div className="activity-preview-body-section activity-preview-body-section-no-border">
                <h4 className="activity-preview-body-section-title">SEL Opportunities</h4>
                <div className="activity-preview-sel-tag-wrap">
                  {selTags.length > 0 ? (
                    selTags.map((tag) => (
                      <span key={tag} className="activity-preview-sel-tag-chip">
                        {tag}
                      </span>
                    ))
                  ) : (
                    <p className="activity-preview-body-section-text">No SEL tags selected.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <img src={PhoneFrameImageUrl} alt="" aria-hidden="true" className="activity-preview-phone-frame-image" />
        </div>

        <div className="activity-preview-actions-row">
          <button type="button" className="activity-secondary-button" onClick={onClose}>
            Keep Editing
          </button>
          <button type="button" className="activity-secondary-button" onClick={onSaveDraft}>
            Save as Draft
          </button>
          <button type="button" className="activity-primary-button" onClick={onPublish}>
            {publishLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

const createId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const createSection = (title = "") => ({
  id: createId(),
  title,
  content: "",
});

const getDefaultSectionByKind = (kind: TabKind, sectionNumber: number): ActivitySection => {
  if (kind === "prep") return createSection(sectionNumber === 1 ? "Set-Up" : "");
  if (kind === "play") return createSection(sectionNumber === 1 ? "How to Play" : "");
  if (kind === "debrief") return createSection(sectionNumber === 1 ? "Reflection Questions" : "");
  return createSection(sectionNumber === 1 ? "Section" : "");
};

const createDefaultTab = (name: string, kind: TabKind): ActivityTab => ({
  id: createId(),
  name,
  kind,
  sections: [getDefaultSectionByKind(kind, 1)],
  guidedItems: kind === "play" ? ["", ""] : kind === "debrief" ? [""] : [],
  materials: [],
  noMaterialsNeeded: false,
});

const createDefaultTabs = (): ActivityTab[] => [
  createDefaultTab("Prep", "prep"),
  createDefaultTab("Play", "play"),
  createDefaultTab("Debrief", "debrief"),
];

const createDefaultFormState = (): FormState => ({
  title: "",
  overview: "",
  categories: [],
  gradeMin: "K",
  gradeMax: "6",
  groupSizeMin: "",
  groupSizeMax: "",
  anyGroupSize: false,
  duration: "",
  energyLevel: "",
  environments: [],
  anyEnvironment: false,
  setup: "",
  objective: "",
  selTags: [],
  videoUrl: "",
  videoThumbnailUrl: null,
  videoThumbnailStatus: "idle",
});

const toGradeLabel = (value: number) => (value === 0 ? "K" : String(value));
const toGradeNumber = (value: string) => (value === "K" ? 0 : Number(value));

const parseBlocks = (content: string) =>
  content
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);

const getYoutubeVideoId = (value: string) => {
  const trimmedValue = value.trim();
  if (!trimmedValue) return null;

  try {
    const url = new URL(trimmedValue);
    const hostname = url.hostname.replace(/^www\./, "");

    if (hostname === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id && YOUTUBE_VIDEO_ID_PATTERN.test(id) ? id : null;
    }

    if (
      hostname !== "youtube.com" &&
      hostname !== "m.youtube.com" &&
      hostname !== "youtube-nocookie.com"
    ) {
      return null;
    }

    const watchId = url.searchParams.get("v");
    if (watchId && YOUTUBE_VIDEO_ID_PATTERN.test(watchId)) return watchId;

    const [pathKind, pathId] = url.pathname.split("/").filter(Boolean);
    if (
      ["embed", "shorts", "live"].includes(pathKind) &&
      pathId &&
      YOUTUBE_VIDEO_ID_PATTERN.test(pathId)
    ) {
      return pathId;
    }
  } catch {
    return null;
  }

  return null;
};

const getYoutubeThumbnailUrl = (videoId: string) => `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
const getYoutubeEmbedUrl = (videoId: string) => `https://www.youtube.com/embed/${videoId}`;

const buildFacilitateSections = (tabs: ActivityTab[]) =>
  tabs
    .map((tab) => {
      const sectionLines = tab.sections
        .map((section) => {
          const content = section.content.trim();
          if (!content) return null;

          const title = section.title.trim() || tab.name;
          return `${title}\n${content}`;
        })
        .filter((line): line is string => Boolean(line));

      const guidedLines = tab.guidedItems
        .map((item, index) => {
          const content = item.trim();
          if (!content) return null;
          if (tab.kind === "play") return `Step ${index + 1}: ${content}`;
          if (tab.kind === "debrief") return `Q${index + 1}: ${content}`;
          return content;
        })
        .filter((line): line is string => Boolean(line));

      return {
        tabName: tab.name,
        content: [...sectionLines, ...guidedLines].join("\n\n"),
      };
    })
    .filter((section) => section.content.length > 0);

const parseActivityTabs = (activity: ActivityDetail): ActivityTab[] => {
  const defaults = createDefaultTabs();
  const byName = new Map(
    (activity.facilitateSections ?? []).map((section) => [section.tabName.toLowerCase(), section]),
  );
  const prepMaterials = activity.materials ?? [];

  const builtIns = defaults.map((tab) => {
    const source = byName.get(tab.name.toLowerCase());

    if (!source) {
      return tab.kind === "prep"
        ? { ...tab, materials: prepMaterials, noMaterialsNeeded: prepMaterials.length === 0 }
        : tab;
    }

    const nextTab: ActivityTab = {
      ...tab,
      sections: [],
      guidedItems: [],
      materials: tab.kind === "prep" ? prepMaterials : [],
      noMaterialsNeeded: tab.kind === "prep" ? prepMaterials.length === 0 : false,
    };

    parseBlocks(source.content).forEach((block) => {
      const playMatch = tab.kind === "play" ? block.match(/^Step\s+\d+:\s*(.*)$/is) : null;
      const debriefMatch = tab.kind === "debrief" ? block.match(/^Q\d+:\s*(.*)$/is) : null;
      const guidedText = playMatch?.[1]?.trim() ?? debriefMatch?.[1]?.trim() ?? "";

      if (guidedText) {
        nextTab.guidedItems.push(guidedText);
        return;
      }

      const [firstLine, ...rest] = block.split("\n");
      nextTab.sections.push({
        id: createId(),
        title: firstLine?.trim() || tab.sections[0]?.title || tab.name,
        content: rest.join("\n").trim(),
      });
    });

    if (nextTab.sections.length === 0) nextTab.sections = tab.sections;
    if (tab.kind === "play" && nextTab.guidedItems.length < 2) {
      nextTab.guidedItems = [
        ...nextTab.guidedItems,
        ...Array.from({ length: 2 - nextTab.guidedItems.length }, () => ""),
      ];
    }
    if (tab.kind === "debrief" && nextTab.guidedItems.length < 1) {
      nextTab.guidedItems = [nextTab.guidedItems[0] ?? ""];
    }

    return nextTab;
  });

  const customTabs = (activity.facilitateSections ?? [])
    .filter((section) => !["prep", "play", "debrief"].includes(section.tabName.toLowerCase()))
    .map((section, index) => ({
      id: createId(),
      name: section.tabName || `Tab ${index + 4}`,
      kind: "custom" as const,
      sections: parseBlocks(section.content).map((block, blockIndex) => {
        const [firstLine, ...rest] = block.split("\n");
        return {
          id: createId(),
          title: firstLine?.trim() || `Section ${blockIndex + 1}`,
          content: rest.join("\n").trim(),
        };
      }),
      guidedItems: [],
      materials: [],
      noMaterialsNeeded: false,
    }));

  return [...builtIns, ...customTabs];
};

const createFormStateFromActivity = (activity: ActivityDetail): FormState => {
  const environments = (activity.environment ?? []).filter((item) => item !== "Any Environment");
  const existingVideoThumbnail = activity.videoUrl && activity.thumbnailUrl
    ? activity.thumbnailUrl
    : null;

  return {
    title: activity.title ?? "",
    overview: activity.overview ?? "",
    categories: activity.category ?? [],
    gradeMin: toGradeLabel(activity.gradeRange?.min ?? 0),
    gradeMax: toGradeLabel(activity.gradeRange?.max ?? 6),
    groupSizeMin: activity.groupSize?.anySize ? "" : String(activity.groupSize?.min ?? ""),
    groupSizeMax: activity.groupSize?.anySize ? "" : String(activity.groupSize?.max ?? ""),
    anyGroupSize: Boolean(activity.groupSize?.anySize),
    duration: activity.duration ?? "",
    energyLevel: activity.energyLevel ?? "",
    environments,
    anyEnvironment: (activity.environment ?? []).includes("Any Environment"),
    setup: activity.setup === "Required" ? "Props" : activity.status === "Draft" ? "" : "No Props",
    objective: activity.objective ?? "",
    selTags: activity.selTags ?? [],
    videoUrl: activity.videoUrl ?? "",
    videoThumbnailUrl: existingVideoThumbnail,
    videoThumbnailStatus: existingVideoThumbnail ? "ready" : "idle",
  };
};

const buildPayload = (
  form: FormState,
  tabs: ActivityTab[],
  status: ActivityStatus,
  thumbnailPreviewUrl: string | null,
): CreateActivityPayload => {
  const normalizedThumbnailUrl =
    thumbnailPreviewUrl && !thumbnailPreviewUrl.startsWith("blob:")
      ? thumbnailPreviewUrl
      : (form.videoThumbnailUrl ?? undefined);

  const trimmedTitle = form.title.trim();
  const trimmedOverview = form.overview.trim();
  const trimmedObjective = form.objective.trim();
  const trimmedVideoUrl = form.videoUrl.trim();
  const normalizedDuration = form.duration || undefined;
  const normalizedEnergyLevel = form.energyLevel || undefined;
  const normalizedSetup = form.setup ? (form.setup === "Props" ? "Required" : "None") : undefined;

  return {
    title: trimmedTitle || undefined,
    overview: trimmedOverview || undefined,
    thumbnailUrl: normalizedThumbnailUrl || undefined,
    category: form.categories,
    gradeRange: {
      min: toGradeNumber(form.gradeMin),
      max: toGradeNumber(form.gradeMax),
    },
    groupSize: {
      min: form.anyGroupSize ? 0 : Number(form.groupSizeMin),
      max: form.anyGroupSize ? 0 : Number(form.groupSizeMax),
      anySize: form.anyGroupSize,
    },
    duration: normalizedDuration,
    energyLevel: normalizedEnergyLevel,
    environment: form.anyEnvironment ? ["Any Environment"] : form.environments,
    setup: normalizedSetup,
    objective: trimmedObjective || undefined,
    facilitateSections: buildFacilitateSections(tabs),
    materials: tabs.find((tab) => tab.kind === "prep")?.noMaterialsNeeded
      ? []
      : (tabs.find((tab) => tab.kind === "prep")?.materials ?? []),
    selTags: form.selTags,
    status,
    videoUrl: trimmedVideoUrl || undefined,
  };
};

export function ActivityEditorPage({ mode }: ActivityEditorPageProps) {
  const navigate = useNavigate();
  const { activityId } = useParams();
  const pageTitle = mode === "edit" ? "Edit Activity" : "Create New Activity";
  const publishLabel = mode === "edit" ? "Publish Changes" : "Publish Activity";

  const [form, setForm] = useState<FormState>(() => createDefaultFormState());
  const [tabs, setTabs] = useState<ActivityTab[]>(() => createDefaultTabs());
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [isCreatingTab, setIsCreatingTab] = useState(false);
  const [pendingTabName, setPendingTabName] = useState("");
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [activeCoverTab, setActiveCoverTab] = useState<CoverTabKind>("image");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(null);
  const [isThumbnailConfirmed, setIsThumbnailConfirmed] = useState(false);
  const [isCropModalVisible, setIsCropModalVisible] = useState(false);
  const [videoDraftUrl, setVideoDraftUrl] = useState("");
  const [videoInputError, setVideoInputError] = useState<string | null>(null);
  const [replaceVideoDraftUrl, setReplaceVideoDraftUrl] = useState("");
  const [replaceVideoError, setReplaceVideoError] = useState<string | null>(null);
  const [pendingVideoUrl, setPendingVideoUrl] = useState<string | null>(null);
  const [pendingVideoSource, setPendingVideoSource] = useState<"initial" | "replace" | null>(null);
  const [isReplaceVideoModalVisible, setIsReplaceVideoModalVisible] = useState(false);
  const thumbnailInputRef = useRef<HTMLInputElement | null>(null);
  const [materialInput, setMaterialInput] = useState("");
  const [selTagInput, setSelTagInput] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(mode === "edit");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeTabId && tabs[0]) setActiveTabId(tabs[0].id);
  }, [activeTabId, tabs]);

  useEffect(() => {
    if (mode !== "edit" || !activityId) return;

    let isMounted = true;
    setIsLoading(true);
    setLoadError(null);

    void getActivityById(activityId)
      .then((activity) => {
        if (!isMounted) return;
        setForm(createFormStateFromActivity(activity));
        setTabs(parseActivityTabs(activity));
        setThumbnailPreviewUrl(activity.thumbnailUrl ?? null);
        setIsThumbnailConfirmed(Boolean(activity.thumbnailUrl));
        setVideoDraftUrl(activity.videoUrl ?? "");
        setReplaceVideoDraftUrl("");
        setVideoInputError(null);
        setReplaceVideoError(null);
        setPendingVideoUrl(null);
        setPendingVideoSource(null);
        setActiveCoverTab(activity.videoUrl || activity.videoThumbnailUrl ? "youtube" : "image");
      })
      .catch((error: unknown) => {
        if (!isMounted) return;
        setLoadError(error instanceof Error ? error.message : "Unable to load activity.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activityId, mode]);

  useEffect(() => {
    return () => {
      if (thumbnailPreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(thumbnailPreviewUrl);
      }
    };
  }, [thumbnailPreviewUrl]);

  const activeTab = useMemo(
    () => tabs.find((tab) => tab.id === activeTabId) ?? tabs[0] ?? null,
    [activeTabId, tabs],
  );
  const currentVideoId = useMemo(() => getYoutubeVideoId(form.videoUrl.trim()), [form.videoUrl]);

  const clearErrorKeys = (...keys: (keyof FormErrors)[]) => {
    setErrors((current) => {
      if (keys.every((key) => !(key in current))) return current;

      const next = { ...current };
      keys.forEach((key) => {
        delete next[key];
      });
      return next;
    });
  };

  const scrollToFirstError = () => {
    window.requestAnimationFrame(() => {
      const firstError = document.querySelector(
        ".activity-upload-card-error, .activity-input-error, .activity-error-row",
      ) as HTMLElement | null;

      firstError?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };

  const setField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [field]: value }));

    if (field === "title") clearErrorKeys("title");
    if (field === "overview") clearErrorKeys("overview");
    if (field === "groupSizeMin" || field === "groupSizeMax") clearErrorKeys("groupSize");
    if (field === "duration") clearErrorKeys("duration");
    if (field === "energyLevel") clearErrorKeys("energyLevel");
    if (field === "setup") clearErrorKeys("setup");
    if (field === "objective") clearErrorKeys("objective");
  };

  const updateActiveTab = (updater: (tab: ActivityTab) => ActivityTab) => {
    if (!activeTab) return;
    setTabs((current) => current.map((tab) => (tab.id === activeTab.id ? updater(tab) : tab)));
  };

  const handleCancel = () => {
    if (mode === "edit") {
      navigate(-1);
      return;
    }

    navigate("/dashboard");
  };

  const handleThumbnailFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null;

    if (thumbnailPreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(thumbnailPreviewUrl);
    }

    setThumbnailFile(nextFile);
    setThumbnailPreviewUrl(nextFile ? URL.createObjectURL(nextFile) : null);
    setIsThumbnailConfirmed(false);
    if (nextFile) setActiveCoverTab("image");
  };

  const handleConfirmThumbnail = () => {
    if (!thumbnailPreviewUrl) return;

    setIsThumbnailConfirmed(true);
    clearErrorKeys("thumbnail");
  };

  const handleUploadAction = () => {
    if (isThumbnailConfirmed) {
      thumbnailInputRef.current?.click();
      return;
    }

    handleConfirmThumbnail();
  };

  const handleOpenCropModal = () => {
    if (!thumbnailPreviewUrl) return;
    setIsCropModalVisible(true);
  };

  const handleSaveCroppedThumbnail = (file: File, previewUrl: string) => {
    if (thumbnailPreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(thumbnailPreviewUrl);
    }

    setThumbnailFile(file);
    setThumbnailPreviewUrl(previewUrl);
    setIsThumbnailConfirmed(false);
    setIsCropModalVisible(false);
    clearErrorKeys("thumbnail");
  };

  const handleRemoveThumbnail = () => {
    if (thumbnailPreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(thumbnailPreviewUrl);
    }

    setThumbnailFile(null);
    setThumbnailPreviewUrl(null);
    setIsThumbnailConfirmed(false);
    setIsCropModalVisible(false);
    clearErrorKeys("thumbnail");

    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = "";
    }
  };

  const handleVideoUrlChange = (value: string) => {
    setActiveCoverTab("youtube");
    setVideoDraftUrl(value);
    setVideoInputError(null);
  };

  const handleReplaceVideoUrlChange = (value: string) => {
    setReplaceVideoDraftUrl(value);
    setReplaceVideoError(null);
  };

  const handleVideoAttemptError = (source: "initial" | "replace") => {
    if (source === "replace") {
      setReplaceVideoError("Invalid link");
      return;
    }

    setVideoInputError("Invalid link");
  };

  const handleExtractThumbnail = (source: "initial" | "replace") => {
    const draftUrl = source === "replace" ? replaceVideoDraftUrl : videoDraftUrl;
    const trimmedVideoUrl = draftUrl.trim();
    setActiveCoverTab("youtube");

    if (!trimmedVideoUrl) {
      if (source === "replace") {
        setReplaceVideoDraftUrl("");
        setReplaceVideoError("Invalid link");
      } else {
        setVideoDraftUrl("");
        setVideoInputError("Invalid link");
        setForm((current) => ({
          ...current,
          videoUrl: "",
          videoThumbnailUrl: null,
          videoThumbnailStatus: "idle",
        }));
      }
      setPendingVideoUrl(null);
      setPendingVideoSource(null);
      return;
    }

    const videoId = getYoutubeVideoId(trimmedVideoUrl);

    if (!videoId) {
      handleVideoAttemptError(source);
      setPendingVideoUrl(null);
      setPendingVideoSource(null);
      return;
    }

    setVideoInputError(null);
    setReplaceVideoError(null);
    setPendingVideoUrl(trimmedVideoUrl);
    setPendingVideoSource(source);
    setForm((current) => ({
      ...current,
      videoThumbnailUrl: getYoutubeThumbnailUrl(videoId),
      videoThumbnailStatus: "checking",
    }));
  };

  const handleThumbnailImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const image = event.currentTarget;
    if (image.naturalWidth <= 120 && image.naturalHeight <= 90) {
      setForm((current) => ({
        ...current,
        videoThumbnailUrl: null,
        videoThumbnailStatus: "error",
      }));
      if (pendingVideoSource) {
        handleVideoAttemptError(pendingVideoSource);
      }
      setPendingVideoUrl(null);
      setPendingVideoSource(null);
      return;
    }

    setForm((current) => ({
      ...current,
      videoUrl: pendingVideoUrl ?? current.videoUrl,
      videoThumbnailStatus: "ready",
    }));
    if (pendingVideoUrl) {
      setVideoDraftUrl(pendingVideoUrl);
    }
    if (pendingVideoSource === "replace") {
      setReplaceVideoDraftUrl("");
      setIsReplaceVideoModalVisible(false);
    }
    setPendingVideoUrl(null);
    setPendingVideoSource(null);
    clearErrorKeys("thumbnail");
  };

  const handleThumbnailImageError = () => {
    setForm((current) => ({
      ...current,
      videoThumbnailUrl: null,
      videoThumbnailStatus: "error",
    }));
    if (pendingVideoSource) {
      handleVideoAttemptError(pendingVideoSource);
    }
    setPendingVideoUrl(null);
    setPendingVideoSource(null);
  };

  const handleOpenReplaceVideoModal = () => {
    setReplaceVideoDraftUrl("");
    setReplaceVideoError(null);
    setIsReplaceVideoModalVisible(true);
  };

  const handleCloseReplaceVideoModal = () => {
    setReplaceVideoDraftUrl("");
    setReplaceVideoError(null);
    if (pendingVideoSource === "replace") {
      setPendingVideoUrl(null);
      setPendingVideoSource(null);
      setForm((current) => {
        const committedVideoId = getYoutubeVideoId(current.videoUrl.trim());

        return {
          ...current,
          videoThumbnailUrl: committedVideoId ? getYoutubeThumbnailUrl(committedVideoId) : null,
          videoThumbnailStatus: committedVideoId ? "ready" : "idle",
        };
      });
    }
    setIsReplaceVideoModalVisible(false);
  };

  const handleRemoveVideo = () => {
    setVideoDraftUrl("");
    setVideoInputError(null);
    setReplaceVideoDraftUrl("");
    setReplaceVideoError(null);
    setPendingVideoUrl(null);
    setPendingVideoSource(null);
    setIsReplaceVideoModalVisible(false);
    setForm((current) => ({
      ...current,
      videoUrl: "",
      videoThumbnailUrl: null,
      videoThumbnailStatus: "idle",
    }));
    clearErrorKeys("thumbnail");
  };

  const toggleCategory = (category: string) => {
    setForm((current) => {
      const isSelected = current.categories.includes(category);
      if (isSelected) {
        return { ...current, categories: current.categories.filter((item) => item !== category) };
      }
      if (current.categories.length >= 3) return current;
      return { ...current, categories: [...current.categories, category] };
    });
    clearErrorKeys("categories");
  };

  const toggleEnvironment = (environment: string) => {
    setForm((current) => {
      const isSelected = current.environments.includes(environment);
      return {
        ...current,
        environments: isSelected
          ? current.environments.filter((item) => item !== environment)
          : [...current.environments, environment],
      };
    });
    clearErrorKeys("environment");
  };

  const handleGradeRangeChange = (minValue: string, maxValue: string) => {
    setForm((current) => ({ ...current, gradeMin: minValue, gradeMax: maxValue }));
    clearErrorKeys("grade");
  };

  const clearCustomTabError = (tabId: string) => {
    setErrors((current) => {
      if (!current.customTabs?.[tabId]) return current;

      const nextCustomTabs = { ...current.customTabs };
      delete nextCustomTabs[tabId];

      return {
        ...current,
        customTabs: Object.keys(nextCustomTabs).length > 0 ? nextCustomTabs : undefined,
      };
    });
  };

  const clearPendingCustomTabError = () => {
    setErrors((current) => {
      if (!current.customTabs?.pending) return current;

      const nextCustomTabs = { ...current.customTabs };
      delete nextCustomTabs.pending;

      return {
        ...current,
        customTabs: Object.keys(nextCustomTabs).length > 0 ? nextCustomTabs : undefined,
      };
    });
  };

  const handleStartCreateTab = () => {
    if (tabs.length >= MAX_TABS) return;
    setIsCreatingTab(true);
    setPendingTabName("");
    clearPendingCustomTabError();
  };

  const handleCancelCreateTab = () => {
    setIsCreatingTab(false);
    setPendingTabName("");
    clearPendingCustomTabError();
  };

  const handleConfirmCreateTab = () => {
    const trimmedName = pendingTabName.trim();

    if (!trimmedName) {
      setErrors((current) => ({
        ...current,
        customTabs: {
          ...(current.customTabs ?? {}),
          pending: "Please enter a tab name",
        },
      }));
      return;
    }

    const hasDuplicate = tabs.some((tab) => tab.name.trim().toLowerCase() === trimmedName.toLowerCase());

    if (hasDuplicate) {
      setErrors((current) => ({
        ...current,
        customTabs: {
          ...(current.customTabs ?? {}),
          pending: "Tab names must be unique",
        },
      }));
      return;
    }

    const nextTab = createDefaultTab(trimmedName, "custom");
    setTabs((current) => [...current, nextTab]);
    setActiveTabId(nextTab.id);
    setEditingTabId(nextTab.id);
    setIsCreatingTab(false);
    setPendingTabName("");
    clearPendingCustomTabError();
  };

  const handleCustomTabNameChange = (tabId: string, value: string) => {
    setTabs((current) =>
      current.map((tab) => (tab.id === tabId ? { ...tab, name: value } : tab)),
    );

    clearCustomTabError(tabId);
  };

  const handleStartEditTab = (tabId: string) => {
    const targetTab = tabs.find((tab) => tab.id === tabId);
    if (!targetTab || targetTab.kind !== "custom") return;

    setActiveTabId(tabId);
    setEditingTabId(tabId);
  };

  const handleFinishEditTab = (tabId: string) => {
    const targetTab = tabs.find((tab) => tab.id === tabId);
    if (!targetTab || targetTab.kind !== "custom") return;

    const trimmedName = targetTab.name.trim();

    if (!trimmedName) {
      setErrors((current) => ({
        ...current,
        customTabs: {
          ...(current.customTabs ?? {}),
          [tabId]: "Please enter a tab name",
        },
      }));
      return;
    }

    const hasDuplicate = tabs.some(
      (tab) => tab.id !== tabId && tab.name.trim().toLowerCase() === trimmedName.toLowerCase(),
    );

    if (hasDuplicate) {
      setErrors((current) => ({
        ...current,
        customTabs: {
          ...(current.customTabs ?? {}),
          [tabId]: "Tab names must be unique",
        },
      }));
      return;
    }

    setTabs((current) =>
      current.map((tab) => (tab.id === tabId ? { ...tab, name: trimmedName } : tab)),
    );
    clearCustomTabError(tabId);
    setEditingTabId((current) => (current === tabId ? null : current));
  };

  const handleDeleteCustomTab = (tabId: string) => {
    setTabs((current) => {
      const tabIndex = current.findIndex((tab) => tab.id === tabId);
      if (tabIndex < 0 || current[tabIndex]?.kind !== "custom") return current;

      const nextTabs = current.filter((tab) => tab.id !== tabId);
      const nextActiveTab = nextTabs[tabIndex] ?? nextTabs[tabIndex - 1] ?? nextTabs[0] ?? null;
      setActiveTabId(nextActiveTab?.id ?? null);
      return nextTabs;
    });

    setEditingTabId((current) => (current === tabId ? null : current));

    clearCustomTabError(tabId);
  };

  const handleAddSection = () => {
    if (!activeTab || activeTab.sections.length >= MAX_SECTIONS) return;

    updateActiveTab((tab) => ({
      ...tab,
      sections: [...tab.sections, getDefaultSectionByKind(tab.kind, tab.sections.length + 1)],
    }));
  };

  const handleUpdateSection = (
    sectionId: string,
    updater: (section: ActivitySection) => ActivitySection,
  ) => {
    updateActiveTab((tab) => ({
      ...tab,
      sections: tab.sections.map((section) =>
        section.id === sectionId ? updater(section) : section,
      ),
    }));
  };

  const handleDeleteSection = (sectionId: string) => {
    updateActiveTab((tab) => {
      if (tab.sections.length <= 1) return tab;

      return {
        ...tab,
        sections: tab.sections.filter((section) => section.id !== sectionId),
      };
    });
  };

  const handleUpdateGuidedItem = (index: number, value: string) => {
    updateActiveTab((tab) => ({
      ...tab,
      guidedItems: tab.guidedItems.map((item, itemIndex) => (itemIndex === index ? value : item)),
    }));
  };

  const handleAddGuidedItem = () => {
    updateActiveTab((tab) => ({
      ...tab,
      guidedItems: [...tab.guidedItems, ""],
    }));
  };

  const handleRemoveGuidedItem = (index: number) => {
    updateActiveTab((tab) => {
      const minimumItems = tab.kind === "play" ? 2 : tab.kind === "debrief" ? 1 : 0;
      if (tab.guidedItems.length <= minimumItems || index < minimumItems) return tab;

      return {
        ...tab,
        guidedItems: tab.guidedItems.filter((_, itemIndex) => itemIndex !== index),
      };
    });
  };

  const handleAddMaterial = () => {
    const nextMaterial = materialInput.trim();
    if (!nextMaterial || !activeTab) return;

    updateActiveTab((tab) => {
      if (tab.materials.some((item) => item.toLowerCase() === nextMaterial.toLowerCase())) {
        return tab;
      }

      return {
        ...tab,
        materials: [...tab.materials, nextMaterial],
        noMaterialsNeeded: false,
      };
    });

    setMaterialInput("");
  };

  const handleRemoveMaterial = (material: string) => {
    updateActiveTab((tab) => ({
      ...tab,
      materials: tab.materials.filter((item) => item !== material),
    }));
  };

  const handleToggleNoMaterialsNeeded = () => {
    if (activeTab && !activeTab.noMaterialsNeeded) {
      setMaterialInput("");
    }

    updateActiveTab((tab) => ({
      ...tab,
      noMaterialsNeeded: !tab.noMaterialsNeeded,
    }));
  };

  const handleAddSelTag = () => {
    const nextTag = selTagInput.trim();
    if (!nextTag) return;
    if (form.selTags.some((item) => item.toLowerCase() === nextTag.toLowerCase())) return;

    setForm((current) => ({
      ...current,
      selTags: [...current.selTags, nextTag],
    }));
    setSelTagInput("");
  };

  const handleRemoveSelTag = (tag: string) => {
    setForm((current) => ({
      ...current,
      selTags: current.selTags.filter((item) => item !== tag),
    }));
  };

  const validate = (targetStatus: ActivityStatus = "Published") => {
    const nextErrors: FormErrors = {};
    const prepTab = tabs.find((tab) => tab.kind === "prep");
    const playTab = tabs.find((tab) => tab.kind === "play");
    const debriefTab = tabs.find((tab) => tab.kind === "debrief");
    const customTabErrors: Record<string, string> = {};
    const sectionErrors: Record<string, { title?: string; content?: string }> = {};
    const tabNameCounts = new Map<string, number>();

    tabs.forEach((tab) => {
      const normalizedName = tab.name.trim().toLowerCase();
      if (!normalizedName) return;
      tabNameCounts.set(normalizedName, (tabNameCounts.get(normalizedName) ?? 0) + 1);
    });

    if (!form.title.trim()) nextErrors.title = "Please enter an activity title";
    if (!form.overview.trim()) nextErrors.overview = "Please enter an activity overview";
    if (form.categories.length === 0) nextErrors.categories = "Please select at least one category";
    if (!form.duration) nextErrors.duration = "Please select a duration";
    if (!form.energyLevel) nextErrors.energyLevel = "Please select an energy level";
    if (toGradeNumber(form.gradeMax) < toGradeNumber(form.gradeMin)) {
      nextErrors.grade = "Please select a valid grade range";
    }
    if (!form.anyGroupSize) {
      const min = Number.parseInt(form.groupSizeMin, 10);
      const max = Number.parseInt(form.groupSizeMax, 10);
      if (!Number.isFinite(min) || !Number.isFinite(max)) {
        nextErrors.groupSize = "Please enter a minimum and maximum group size, or select Any Size";
      } else if (min < 1 || max < min) {
        nextErrors.groupSize = "Please enter a valid group size range";
      }
    }

    if (targetStatus === "Draft") {
      setErrors({});
      return true;
    }

    if ((!isThumbnailConfirmed || !thumbnailPreviewUrl) && !form.videoThumbnailUrl) {
      nextErrors.thumbnail = "Please upload either an image or a video frame";
    }
    if (!form.setup) nextErrors.setup = "Please select whether the activity needs props";
    if (!form.objective.trim()) nextErrors.objective = "Please enter an activity objective";
    if (form.selTags.length === 0) nextErrors.selTags = "Please enter at least one SEL tag";
    if (!form.anyEnvironment && form.environments.length === 0) {
      nextErrors.environment = "Please select an environment or Any Environment";
    }

    tabs.forEach((tab) => {
      if (tab.kind !== "custom") return;

      const trimmedName = tab.name.trim();
      if (!trimmedName) {
        customTabErrors[tab.id] = "Please enter a tab name";
        return;
      }

      if ((tabNameCounts.get(trimmedName.toLowerCase()) ?? 0) > 1) {
        customTabErrors[tab.id] = "Tab names must be unique";
      }
    });

    if (prepTab) {
      const setupSection = prepTab.sections[0];
      if (!setupSection?.content.trim()) {
        nextErrors.setupInstructions = "Please enter set-up instructions";
      }
      if (!prepTab.noMaterialsNeeded && prepTab.materials.length === 0) {
        nextErrors.materials = "Please enter items or select no materials";
      }
    }

    if (playTab) {
      const playGuidedItems = playTab.guidedItems.map((item) =>
        !item.trim() ? "Please enter how to play instructions" : null,
      );
      if (playGuidedItems.some((item) => item !== null)) {
        nextErrors.playGuidedItems = playGuidedItems;
      }
    }

    if (debriefTab) {
      const debriefGuidedItems = debriefTab.guidedItems.map((item) =>
        !item.trim() ? "Please enter a reflection question" : null,
      );
      if (debriefGuidedItems.some((item) => item !== null)) {
        nextErrors.debriefGuidedItems = debriefGuidedItems;
      }
    }

    tabs.forEach((tab) => {
      tab.sections.forEach((section, index) => {
        if (index === 0) return;

        const entry: { title?: string; content?: string } = {};
        if (!section.title.trim()) entry.title = "Please enter a section title";
        if (!section.content.trim()) entry.content = "Please enter section contents";
        if (entry.title || entry.content) sectionErrors[section.id] = entry;
      });
    });

    if (Object.keys(sectionErrors).length > 0) nextErrors.sections = sectionErrors;
    if (Object.keys(customTabErrors).length > 0) nextErrors.customTabs = customTabErrors;

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      scrollToFirstError();
      return false;
    }

    return true;
  };

  const submit = async (targetStatus: ActivityStatus) => {
    if (isSubmitting) return;
    if (!validate(targetStatus)) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload = buildPayload(
        form,
        tabs,
        targetStatus,
        isThumbnailConfirmed ? thumbnailPreviewUrl : null,
      );

      if (mode === "create") {
        const created = await createActivity(payload);
        const createdId = getActivityId(created);

        if (!createdId && (targetStatus === "Published" || thumbnailFile)) {
          throw new Error("Activity was created, but the response did not include an activity id.");
        }

        if (createdId && thumbnailFile) {
          await uploadActivityThumbnail({ activityId: createdId, file: thumbnailFile });
        }

        if (createdId && targetStatus === "Published") {
          await updateActivityStatus(createdId, "Published");
        }

        setIsPreviewVisible(false);
        if (targetStatus === "Draft") {
          navigate("/dashboard", {
            replace: true,
            state: { draftSaved: true },
          });
        } else if (createdId) {
          navigate(`/activities/${createdId}/edit`, { replace: true });
        }
        return;
      }

      if (!activityId) return;

      await updateActivity(activityId, payload);

      if (thumbnailFile) {
        await uploadActivityThumbnail({ activityId, file: thumbnailFile });
      }

      if (targetStatus === "Published") {
        await updateActivityStatus(activityId, "Published");
      }

      setIsPreviewVisible(false);
      if (targetStatus === "Draft") {
        navigate("/dashboard", {
          replace: true,
          state: { draftSaved: true },
        });
      }
    } catch (error) {
      setIsPreviewVisible(false);
      setSubmitError(
        error instanceof Error ? error.message : "Unable to save activity.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const openPreview = () => {
    if (!validate("Published")) return;
    setIsPreviewVisible(true);
  };

  if (isLoading) {
    return (
      <div className="activity-editor-app">
        <NavBar />
        <div className="activity-editor-state">
          <h1>Loading activity...</h1>
        </div>
      </div>
    );
  }

  if (loadError || (mode === "edit" && !activityId)) {
    return (
      <div className="activity-editor-app">
        <NavBar />
        <div className="activity-editor-state">
          <h1>Unable to load activity</h1>
          <p>{loadError ?? "Missing activity id."}</p>
          <button type="button" className="activity-secondary-button" onClick={handleCancel}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const defaultSection = activeTab?.sections[0] ?? null;
  const additionalSections = activeTab?.sections.slice(1) ?? [];
  const isPrepTab = activeTab?.kind === "prep";
  const isPlayTab = activeTab?.kind === "play";
  const isDebriefTab = activeTab?.kind === "debrief";
  const minimumGuidedItems = activeTab?.kind === "play" ? 2 : activeTab?.kind === "debrief" ? 1 : 0;

  return (
    <div className="activity-editor-app">
      <NavBar />
      <main className="activity-page">
        <header className="activity-editor-header">
          <h1>{pageTitle}</h1>
          <div className="activity-editor-actions">
            <button
              type="button"
              className="activity-secondary-button"
              disabled={isSubmitting}
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              type="button"
              className="activity-secondary-button"
              disabled={isSubmitting}
              onClick={() => void submit("Draft")}
            >
              Save as Draft
            </button>
            <button
              type="button"
              className="activity-primary-button"
              disabled={isSubmitting}
              onClick={openPreview}
            >
              {publishLabel}
            </button>
          </div>
        </header>

        {submitError ? (
          <div className="activity-submit-error">
            <FieldError message={submitError} />
          </div>
        ) : null}

        <CollapsibleSection title="Overview" defaultOpen>
          <div className="activity-field-stack">
            <div className="activity-field-group">
              <label className="activity-field-label">Cover Image/Video</label>
              <div className="activity-cover-panel">
                <div className="activity-cover-tabs" role="tablist" aria-label="Cover media type">
                  <button
                    type="button"
                    className={`activity-cover-tab ${activeCoverTab === "image" ? "activity-cover-tab-active" : ""}`}
                    aria-selected={activeCoverTab === "image"}
                    role="tab"
                    onClick={() => setActiveCoverTab("image")}
                  >
                    <span className="activity-cover-tab-content">
                      <img
                        src={UploadTabIconUrl}
                        alt=""
                        aria-hidden="true"
                        className="activity-cover-tab-icon"
                      />
                      <span>Image upload</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    className={`activity-cover-tab ${activeCoverTab === "youtube" ? "activity-cover-tab-active" : ""}`}
                    aria-selected={activeCoverTab === "youtube"}
                    role="tab"
                    onClick={() => setActiveCoverTab("youtube")}
                  >
                    <span className="activity-cover-tab-content">
                      <img
                        src={VideoTabIconUrl}
                        alt=""
                        aria-hidden="true"
                        className="activity-cover-tab-icon"
                      />
                      <span>Youtube video</span>
                    </span>
                  </button>
                </div>

                <div className="activity-cover-body">
                  {activeCoverTab === "image" ? (
                    <div className="activity-thumbnail-panel">
                      {thumbnailPreviewUrl ? (
                        <div
                          className={`activity-upload-preview-shell ${
                            errors.thumbnail ? "activity-upload-card-error" : ""
                          }`}
                        >
                          <img
                            src={thumbnailPreviewUrl}
                            alt="Selected thumbnail preview"
                            className="activity-upload-preview-large"
                          />

                          <div className="activity-upload-preview-actions" aria-label="Image actions">
                            <button
                              type="button"
                              className="activity-upload-action-button"
                              onClick={handleOpenCropModal}
                              aria-label="Crop image"
                              title="Crop image"
                            >
                              <img src={CropImageIconUrl} alt="" aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              className={`activity-upload-action-button ${
                                isThumbnailConfirmed ? "activity-upload-action-button-active" : ""
                              }`}
                              onClick={handleUploadAction}
                              aria-label={isThumbnailConfirmed ? "Replace image" : "Confirm image"}
                              aria-pressed={!isThumbnailConfirmed}
                              title={isThumbnailConfirmed ? "Upload a new image" : "Confirm image"}
                            >
                              <img src={UploadImageIconUrl} alt="" aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              className="activity-upload-action-button"
                              onClick={handleRemoveThumbnail}
                              aria-label="Remove image"
                            >
                              <img src={DeleteImageIconUrl} alt="" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label
                          className={`activity-upload-card ${errors.thumbnail ? "activity-upload-card-error" : ""}`}
                          htmlFor="thumbnail-upload"
                        >
                          <span className="activity-upload-plus">+</span>
                          <span className="activity-upload-title">Upload cover image</span>
                          <span className="activity-upload-copy">
                            Upload an image to use as the activity cover.
                          </span>
                          <span className="activity-upload-button">Choose Image</span>
                          <span className="activity-upload-meta">No image selected</span>
                          <span className="activity-upload-meta">
                            Supported formats: JPG, JPEG, PNG, GIF, WEBP
                          </span>
                          <span className="activity-upload-meta">Max size: 10 MB</span>
                        </label>
                      )}
                      <input
                        id="thumbnail-upload"
                        ref={thumbnailInputRef}
                        className="activity-sr-only"
                        type="file"
                        accept=".jpg,.jpeg,.png,.gif,.webp,image/jpeg,image/png,image/gif,image/webp"
                        onChange={handleThumbnailFileChange}
                      />
                      {errors.thumbnail ? <FieldError message={errors.thumbnail} /> : null}
                    </div>
                  ) : (
                    <div className="activity-youtube-panel">
                      {currentVideoId && form.videoThumbnailUrl ? (
                        <div className="activity-upload-preview-shell">
                          <div className="activity-youtube-embed-shell">
                            <iframe
                              src={getYoutubeEmbedUrl(currentVideoId)}
                              title="Selected YouTube video"
                              className="activity-youtube-embed"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              allowFullScreen
                            />
                          </div>

                          <div
                            className="activity-upload-preview-actions activity-video-preview-actions"
                            aria-label="Video actions"
                          >
                            <button
                              type="button"
                              className="activity-upload-action-button"
                              onClick={handleRemoveVideo}
                              aria-label="Remove video"
                            >
                              <img src={DeleteImageIconUrl} alt="" aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              className="activity-upload-action-button"
                              onClick={handleOpenReplaceVideoModal}
                              aria-label="Change YouTube video"
                            >
                              <img src={ChangeVideoIconUrl} alt="" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="activity-youtube-copy-block">
                            <h3>Import video from Youtube</h3>
                          </div>

                          <div className="activity-inline-inputs">
                            <input
                              id="video-url"
                              className={`activity-text-input ${
                                videoInputError ? "activity-input-error" : ""
                              }`}
                              value={videoDraftUrl}
                              onChange={(event) => handleVideoUrlChange(event.target.value)}
                              placeholder="Paste Youtube link here..."
                            />
                            <button
                              type="button"
                              className="activity-primary-button"
                              onClick={() => handleExtractThumbnail("initial")}
                            >
                              Use video
                            </button>
                          </div>

                          {videoInputError ? (
                            <div className="activity-youtube-url-error">
                              <FieldError message="Invalid link" />
                            </div>
                          ) : null}

                          <p className="activity-support-text">We’ll auto-fetch the thumbnail from YouTube.</p>

                          {form.videoThumbnailUrl ? (
                            <div className="activity-youtube-preview">
                              <img
                                src={form.videoThumbnailUrl}
                                alt="Extracted YouTube thumbnail"
                                onLoad={handleThumbnailImageLoad}
                                onError={handleThumbnailImageError}
                              />
                              <span>
                                {form.videoThumbnailStatus === "checking"
                                  ? "Checking thumbnail..."
                                  : "Extracted thumbnail"}
                              </span>
                            </div>
                          ) : null}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="activity-field-group">
              <label className="activity-field-label" htmlFor="title">
                Activity Title
              </label>
              <div className="activity-support-block">
                <input
                  id="title"
                  className={`activity-text-input ${errors.title ? "activity-input-error" : ""}`}
                  value={form.title}
                  maxLength={40}
                  onChange={(event) => setField("title", event.target.value)}
                  placeholder="Enter activity title"
                />
                <p className="activity-support-text">{form.title.length}/40 characters</p>
              </div>
              {errors.title ? <FieldError message={errors.title} /> : null}
            </div>

            <div className="activity-field-group">
              <label className="activity-field-label" htmlFor="overview">
                Overview
              </label>
              <textarea
                id="overview"
                className={`activity-text-area ${errors.overview ? "activity-input-error" : ""}`}
                value={form.overview}
                onChange={(event) => setField("overview", event.target.value)}
                placeholder="Write a short overview for the activity"
                rows={5}
              />
              {errors.overview ? <FieldError message={errors.overview} /> : null}
            </div>

            <div className="activity-field-group">
              <p className="activity-field-label">
                Category <span className="activity-field-label-light">(Select up to three)</span>
              </p>
              <div className="activity-chip-grid">
                {CATEGORY_OPTIONS.map((category) => (
                  <ChoiceChip
                    key={category}
                    active={form.categories.includes(category)}
                    disabled={!form.categories.includes(category) && form.categories.length >= 3}
                    className={`activity-category-chip ${errors.categories ? "activity-chip-error" : ""}`}
                    onClick={() => toggleCategory(category)}
                  >
                    {category}
                  </ChoiceChip>
                ))}
              </div>
              {errors.categories ? <FieldError message={errors.categories} /> : null}
            </div>

            <GradeSlider
              minValue={form.gradeMin}
              maxValue={form.gradeMax}
              hasError={Boolean(errors.grade)}
              onChange={handleGradeRangeChange}
            />
            {errors.grade ? <FieldError message={errors.grade} /> : null}

            <div className="activity-field-group">
              <p className="activity-field-label">Group Size</p>
              <div className="activity-group-size-row">
                <input
                  className={`activity-group-size-input ${
                    form.anyGroupSize ? "activity-input-disabled" : ""
                  } ${errors.groupSize ? "activity-input-error" : ""}`}
                  inputMode="numeric"
                  value={form.groupSizeMin}
                  disabled={form.anyGroupSize}
                  onChange={(event) => setField("groupSizeMin", event.target.value)}
                  placeholder="Min"
                />
                <span className="activity-range-separator">to</span>
                <input
                  className={`activity-group-size-input ${
                    form.anyGroupSize ? "activity-input-disabled" : ""
                  } ${errors.groupSize ? "activity-input-error" : ""}`}
                  inputMode="numeric"
                  value={form.groupSizeMax}
                  disabled={form.anyGroupSize}
                  onChange={(event) => setField("groupSizeMax", event.target.value)}
                  placeholder="Max"
                />
              </div>
              <label className="activity-checkbox-row activity-checkbox-row-spaced">
                <input
                  type="checkbox"
                  checked={form.anyGroupSize}
                  onChange={(event) => {
                    const checked = event.target.checked;
                    setForm((current) => ({
                      ...current,
                      anyGroupSize: checked,
                      groupSizeMin: checked ? "" : current.groupSizeMin,
                      groupSizeMax: checked ? "" : current.groupSizeMax,
                    }));
                    clearErrorKeys("groupSize");
                  }}
                />
                <span>Any Size</span>
              </label>
              {errors.groupSize ? <FieldError message={errors.groupSize} /> : null}
            </div>

            <div className="activity-field-group">
              <p className="activity-field-label">Duration</p>
              <div className="activity-chip-grid">
                {DURATION_OPTIONS.map((option) => (
                  <ChoiceChip
                    key={option}
                    active={form.duration === option}
                    className={`activity-chip-pill ${errors.duration ? "activity-chip-error" : ""}`}
                    onClick={() => setField("duration", option)}
                  >
                    {option}
                  </ChoiceChip>
                ))}
              </div>
              {errors.duration ? <FieldError message={errors.duration} /> : null}
            </div>

            <div className="activity-field-group">
              <p className="activity-field-label">Energy Level</p>
              <div className="activity-chip-grid">
                {ENERGY_OPTIONS.map((option) => (
                  <ChoiceChip
                    key={option}
                    active={form.energyLevel === option}
                    className={`activity-chip-pill ${errors.energyLevel ? "activity-chip-error" : ""}`}
                    onClick={() => setField("energyLevel", option)}
                  >
                    <span className="activity-energy-chip-content">
                      {Array.from({
                        length: option === "Low" ? 1 : option === "Medium" ? 2 : 3,
                      }).map((_, index) => (
                        <img
                          key={`${option}-star-${index}`}
                          src={YellowEnergyStarIconUrl}
                          alt=""
                          aria-hidden="true"
                          className="activity-energy-star-icon"
                        />
                      ))}
                      <span>{option}</span>
                    </span>
                  </ChoiceChip>
                ))}
              </div>
              {errors.energyLevel ? <FieldError message={errors.energyLevel} /> : null}
            </div>

            <div className="activity-overview-bottom-row">
              <div className="activity-overview-environment-column">
                <div className="activity-field-group">
                  <p className="activity-field-label">Environment</p>
                  <div className="activity-chip-grid">
                    {ENVIRONMENT_OPTIONS.map((option) => (
                      <ChoiceChip
                        key={option}
                        active={form.environments.includes(option)}
                        disabled={form.anyEnvironment}
                        className={`activity-chip-pill ${errors.environment ? "activity-chip-error" : ""}`}
                        onClick={() => toggleEnvironment(option)}
                      >
                        {option}
                      </ChoiceChip>
                    ))}
                  </div>
                  <label className="activity-checkbox-row activity-checkbox-row-spaced">
                    <input
                      type="checkbox"
                      checked={form.anyEnvironment}
                      onChange={(event) => {
                        const checked = event.target.checked;
                        setForm((current) => ({
                          ...current,
                          anyEnvironment: checked,
                          environments: checked ? [] : current.environments,
                        }));
                        clearErrorKeys("environment");
                      }}
                    />
                    <span>Any Environment</span>
                  </label>
                  {errors.environment ? <FieldError message={errors.environment} /> : null}
                </div>
              </div>

              <div className="activity-overview-setup-column">
                <div className="activity-field-group">
                  <p className="activity-field-label">Set Up</p>
                  <div className="activity-chip-grid">
                    {["Props", "No Props"].map((option) => (
                      <ChoiceChip
                        key={option}
                        active={form.setup === option}
                        className={`activity-chip-pill ${errors.setup ? "activity-chip-error" : ""}`}
                        onClick={() => setField("setup", option as FormState["setup"])}
                      >
                        {option}
                      </ChoiceChip>
                    ))}
                  </div>
                  {errors.setup ? <FieldError message={errors.setup} /> : null}
                </div>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Activity Content" defaultOpen>
          <div className="activity-field-stack">
            <div className="activity-field-group">
              <label className="activity-field-label" htmlFor="objective">
                Objective
              </label>
              <div className="activity-support-block">
                <input
                  id="objective"
                  className={`activity-text-input ${errors.objective ? "activity-input-error" : ""}`}
                  value={form.objective}
                  maxLength={150}
                  onChange={(event) => setField("objective", event.target.value)}
                  placeholder="Enter activity objective"
                />
                <p className="activity-support-text">{form.objective.length}/150 characters</p>
              </div>
              {errors.objective ? <FieldError message={errors.objective} /> : null}
            </div>

            <div className="activity-facilitate-header">
              <p className="activity-field-label">Facilitate</p>
              <button
                type="button"
                className="activity-secondary-button activity-create-tab-button"
                onClick={handleStartCreateTab}
                disabled={tabs.length >= MAX_TABS}
              >
                <span className="activity-button-icon-text">
                  <img src={AddIconUrl} alt="" aria-hidden="true" />
                  <span>Create New Tab</span>
                </span>
              </button>
            </div>

            {isCreatingTab ? (
              <div className="activity-create-tab-row">
                <div className="activity-create-tab-form">
                  <div className="activity-support-block">
                    <input
                      className={`activity-text-input ${errors.customTabs?.pending ? "activity-input-error" : ""}`}
                      value={pendingTabName}
                      autoFocus
                      maxLength={MAX_TAB_NAME_LENGTH}
                      onChange={(event) => {
                        setPendingTabName(event.target.value);
                        clearPendingCustomTabError();
                      }}
                      placeholder="Enter tab name.."
                    />
                    <p className="activity-support-text">
                      {pendingTabName.length}/{MAX_TAB_NAME_LENGTH} characters
                    </p>
                  </div>
                  {errors.customTabs?.pending ? <FieldError message={errors.customTabs.pending} /> : null}
                </div>
                <div className="activity-create-tab-actions">
                  <button
                    type="button"
                    className="activity-secondary-button activity-create-tab-confirm"
                    onClick={handleConfirmCreateTab}
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    className="activity-inline-text-button"
                    onClick={handleCancelCreateTab}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : null}

            <div className="activity-tab-container">
              {tabs.map((tab) => {
                const isActive = tab.id === activeTabId;
                const isEditing = editingTabId === tab.id;
                const isCustomTab = tab.kind === "custom";

                return (
                  <div
                    key={tab.id}
                    className={`activity-tab ${isActive ? "activity-tab-active" : ""} ${
                      isCustomTab ? "activity-tab-custom" : ""
                    } ${isEditing ? "activity-tab-editing" : ""
                    }`}
                  >
                    {isEditing ? (
                      <input
                        className={`activity-tab-name-input ${
                          errors.customTabs?.[tab.id] ? "activity-input-error" : ""
                        }`}
                        value={tab.name}
                        maxLength={MAX_TAB_NAME_LENGTH}
                        autoFocus
                        onChange={(event) => handleCustomTabNameChange(tab.id, event.target.value)}
                        onBlur={() => handleFinishEditTab(tab.id)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            handleFinishEditTab(tab.id);
                          }
                        }}
                        placeholder="Enter tab name.."
                      />
                    ) : (
                      <button
                        type="button"
                        className="activity-tab-label"
                        onClick={() => {
                          setActiveTabId(tab.id);
                          if (isCustomTab && isActive) handleStartEditTab(tab.id);
                        }}
                      >
                        {tab.name.trim()}
                      </button>
                    )}

                    {isCustomTab ? (
                      <button
                        type="button"
                        className="activity-tab-close"
                        aria-label={`Delete ${tab.name.trim() || "custom tab"}`}
                        onClick={() => handleDeleteCustomTab(tab.id)}
                      >
                        <img src={CloseIconUrl} />
                      </button>
                    ) : null}
                  </div>
                );
              })}
            </div>
            {activeTab?.kind === "custom" && errors.customTabs?.[activeTab.id] ? (
              <FieldError message={errors.customTabs[activeTab.id]} />
            ) : null}

            {activeTab ? (
              <div className="activity-details-container">
                {defaultSection && isPrepTab ? (
                  <div className="activity-field-group">
                    <p className="activity-field-label">{defaultSection.title || "Set-Up"}</p>
                    <textarea
                      className={`activity-text-area activity-text-area-compact ${
                        errors.setupInstructions ? "activity-input-error" : ""
                      }`}
                      value={defaultSection.content}
                      onChange={(event) =>
                        handleUpdateSection(defaultSection.id, (section) => ({
                          ...section,
                          content: event.target.value,
                        }))
                      }
                      placeholder="Describe how to set up the space.."
                      rows={3}
                    />
                    {errors.setupInstructions ? (
                      <FieldError message={errors.setupInstructions} />
                    ) : null}
                  </div>
                ) : null}

                {defaultSection && (isPlayTab || isDebriefTab) ? (
                  <div className="activity-field-group">
                    <p className="activity-field-label">{defaultSection.title}</p>

                    {activeTab.guidedItems.map((item, index) => {
                      const isRemovable = index >= minimumGuidedItems;
                      const itemError = isPlayTab
                        ? errors.playGuidedItems?.[index]
                        : errors.debriefGuidedItems?.[index];

                      return (
                        <div key={`${defaultSection.id}-${index}`} className="activity-guided-item-group">
                          <p className="activity-guided-item-label">
                            {isPlayTab ? `Step ${index + 1}` : `Q${index + 1}`}
                          </p>
                          <div className="activity-guided-item-row">
                            <input
                              className={`activity-text-input ${itemError ? "activity-input-error" : ""}`}
                              value={item}
                              onChange={(event) => handleUpdateGuidedItem(index, event.target.value)}
                              placeholder={
                                isPlayTab
                                  ? "Enter instructions here.."
                                  : "Enter reflection or prompt here.."
                              }
                            />
                            {isRemovable ? (
                              <button
                                type="button"
                                className="activity-icon-button"
                                onClick={() => handleRemoveGuidedItem(index)}
                              >
                                <img src={ButtonIconUrl} alt="" aria-hidden="true" />
                              </button>
                            ) : (
                              <span className="activity-icon-spacer" />
                            )}
                          </div>
                          {itemError ? <FieldError message={itemError} /> : null}
                        </div>
                      );
                    })}

                    <div className="activity-guided-action-wrap">
                      <button
                        type="button"
                        className="activity-secondary-button"
                        onClick={handleAddGuidedItem}
                      >
                        <span className="activity-button-icon-text">
                          <img src={AddIconUrl} alt="" aria-hidden="true" />
                          <span>{isPlayTab ? "Add Step" : "Add Question"}</span>
                        </span>
                      </button>
                    </div>
                  </div>
                ) : null}

                {isPrepTab ? (
                  <div className="activity-field-group">
                    <p className="activity-field-label">Materials</p>

                    {activeTab.materials.length > 0 ? (
                      <div className="activity-tag-list">
                        {activeTab.materials.map((material) => (
                          <div key={material} className="activity-tag-row">
                            <div className="activity-tag-value-box">
                              <span>{material}</span>
                            </div>
                            <button
                              type="button"
                              className="activity-icon-button"
                              onClick={() => handleRemoveMaterial(material)}
                            >
                              <img src={ButtonIconUrl} alt="" aria-hidden="true" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : null}

                    <div className="activity-material-input-row">
                      <input
                        className={`activity-text-input ${errors.materials ? "activity-input-error" : ""} ${
                          activeTab.noMaterialsNeeded ? "activity-input-disabled" : ""
                        }`}
                        value={materialInput}
                        onChange={(event) => setMaterialInput(event.target.value)}
                        placeholder="Add new material item..."
                        disabled={activeTab.noMaterialsNeeded}
                        onKeyDown={(event) => {
                          if (event.key !== "Enter") return;
                          event.preventDefault();
                          handleAddMaterial();
                        }}
                      />
                      <button
                        type="button"
                        className="activity-icon-button activity-icon-button-outline"
                        onClick={handleAddMaterial}
                        disabled={activeTab.noMaterialsNeeded}
                      >
                        <img src={AddIconUrl} alt="" aria-hidden="true" />
                      </button>
                    </div>

                    <label className="activity-checkbox-row">
                      <input
                        type="checkbox"
                        checked={activeTab.noMaterialsNeeded}
                        onChange={handleToggleNoMaterialsNeeded}
                      />
                      <span>No materials needed</span>
                    </label>

                    {errors.materials ? <FieldError message={errors.materials} /> : null}
                  </div>
                ) : null}

                <button
                  type="button"
                  className="activity-add-section-button"
                  disabled={activeTab.sections.length >= MAX_SECTIONS}
                  onClick={handleAddSection}
                >
                  <span className="activity-button-icon-text">
                    <img src={AddIconUrl} alt="" aria-hidden="true" />
                    <span>Add Section</span>
                  </span>
                </button>

                {additionalSections.map((section) => (
                  <div key={section.id} className="activity-section-editor-card">
                    <div className="activity-section-editor-header">
                      <button
                        type="button"
                        className="activity-delete-section-button"
                        onClick={() => handleDeleteSection(section.id)}
                      >
                        <img src={DeleteSectionButtonUrl} alt="" aria-hidden="true"/>
                      </button>
                    </div>

                    <div className="activity-support-block">
                      <input
                        className={`activity-section-title-input ${
                          errors.sections?.[section.id]?.title ? "activity-input-error" : ""
                        }`}
                        value={section.title}
                        onChange={(event) =>
                          handleUpdateSection(section.id, (existingSection) => ({
                            ...existingSection,
                            title: event.target.value,
                          }))
                        }
                        placeholder="Section Title"
                        maxLength={MAX_SECTION_TITLE_LENGTH}
                      />

                      <p className="activity-support-text">
                        {section.title.length}/{MAX_SECTION_TITLE_LENGTH} characters
                      </p>
                    </div>
                    {errors.sections?.[section.id]?.title ? (
                      <FieldError message={errors.sections[section.id].title ?? ""} />
                    ) : null}

                    <textarea
                      className={`activity-text-area ${
                        errors.sections?.[section.id]?.content ? "activity-input-error" : ""
                      }`}
                      value={section.content}
                      onChange={(event) =>
                        handleUpdateSection(section.id, (existingSection) => ({
                          ...existingSection,
                          content: event.target.value,
                        }))
                      }
                      placeholder="Enter section contents.."
                      rows={7}
                    />
                    {errors.sections?.[section.id]?.content ? (
                      <FieldError message={errors.sections[section.id].content ?? ""} />
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="SEL Opportunity" defaultOpen>
          <div className="activity-field-group">
            <p className="activity-field-label">Social and Emotional Learning Tags</p>

            {form.selTags.length > 0 ? (
              <div className="activity-tag-list">
                {form.selTags.map((tag) => (
                  <div key={tag} className="activity-tag-row">
                    <div className="activity-tag-value-box">
                      <span>{tag}</span>
                    </div>
                    <button
                      type="button"
                      className="activity-icon-button"
                      onClick={() => handleRemoveSelTag(tag)}
                    >
                      <img src={ButtonIconUrl} alt="" aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="activity-support-block">
              <div className="activity-material-input-row">
                <input
                  className={`activity-text-input ${errors.selTags ? "activity-input-error" : ""}`}
                  value={selTagInput}
                  onChange={(event) => setSelTagInput(event.target.value)}
                  placeholder="Add SEL Tag.."
                  maxLength={30}
                  onKeyDown={(event) => {
                    if (event.key !== "Enter") return;
                    event.preventDefault();
                    handleAddSelTag();
                  }}
                />
                <button
                  type="button"
                  className="activity-icon-button activity-icon-button-outline"
                  onClick={handleAddSelTag}
                >
                  <img src={AddIconUrl} alt="" aria-hidden="true" />
                </button>
              </div>

              <p className="activity-support-text">{selTagInput.length}/30 characters</p>
            </div>
            {errors.selTags ? <FieldError message={errors.selTags} /> : null}
          </div>
        </CollapsibleSection>

        <footer className="activity-editor-footer">
          <button
            type="button"
            className="activity-secondary-button"
            disabled={isSubmitting}
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="activity-secondary-button"
            disabled={isSubmitting}
            onClick={() => void submit("Draft")}
          >
            Save as Draft
          </button>
          <button
            type="button"
            className="activity-primary-button"
            disabled={isSubmitting}
            onClick={openPreview}
          >
            {publishLabel}
          </button>
        </footer>
      </main>

      <ThumbnailCropModal
        visible={isCropModalVisible}
        imageSrc={thumbnailPreviewUrl}
        fileName={thumbnailFile?.name ?? "activity-thumbnail"}
        onClose={() => setIsCropModalVisible(false)}
        onSave={handleSaveCroppedThumbnail}
      />

      {isReplaceVideoModalVisible ? (
        <div className="activity-preview-backdrop" role="dialog" aria-modal="true">
          <div className="activity-replace-video-shell">
            <button
              type="button"
              className="activity-replace-video-close"
              onClick={handleCloseReplaceVideoModal}
              aria-label="Close replace video dialog"
            >
              <img src={CloseIconUrl} alt="" aria-hidden="true" />
            </button>

            <h2 className="activity-replace-video-title">Replace video</h2>

            
            <div className="activity-replace-video-form">
              <input
                className={`activity-text-input activity-replace-video-input ${
                  replaceVideoError ? "activity-input-error" : ""
                }`}
                value={replaceVideoDraftUrl}
                onChange={(event) => handleReplaceVideoUrlChange(event.target.value)}
                placeholder="Paste Youtube link here..."
              />
              <button
                type="button"
                className="activity-primary-button activity-replace-video-submit"
                onClick={() => handleExtractThumbnail("replace")}
              >
                Use video
              </button>
            </div>

            {replaceVideoError ? (
              <div className="activity-replace-video-error">
                <FieldError message="Invalid link" />
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <PublishPreviewModal
        visible={isPreviewVisible}
        onClose={() => setIsPreviewVisible(false)}
        onSaveDraft={() => {
          void submit("Draft");
        }}
        onPublish={() => {
          void submit("Published");
        }}
        publishLabel={publishLabel}
        form={form}
        thumbnailPreviewUrl={isThumbnailConfirmed ? thumbnailPreviewUrl : null}
        objective={form.objective}
        tabs={tabs}
        selTags={form.selTags}
      />
    </div>
  );
}
