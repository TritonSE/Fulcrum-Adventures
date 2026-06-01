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
import ClockIconUrl from "../assets/clock.svg";
import DeleteSectionButtonUrl from "../assets/DeleteSectionButton.svg";
import PhoneFrameImageUrl from "../assets/378_rectangle_extracted.png";
import GraduationCapIconUrl from "../assets/graduation-cap.svg";
import PageIconUrl from "../assets/PageIcon.svg";
import PeopleIconUrl from "../assets/people.svg";
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

type EditorMode = "create" | "edit";
type TabKind = "prep" | "play" | "debrief" | "custom";

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
  videoThumbnailError: string | null;
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
  sections?: Record<string, { title?: string; content?: string }>;
};

type ActivityEditorPageProps = {
  mode: EditorMode;
};

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
  videoThumbnailError: null,
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
    setup: activity.setup === "Required" ? "Props" : "No Props",
    objective: activity.objective ?? "",
    selTags: activity.selTags ?? [],
    videoUrl: activity.videoUrl ?? "",
    videoThumbnailUrl: null,
    videoThumbnailStatus: "idle",
    videoThumbnailError: null,
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

  return {
    title: form.title.trim(),
    overview: form.overview.trim(),
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
    duration: form.duration,
    energyLevel: form.energyLevel,
    environment: form.anyEnvironment ? ["Any Environment"] : form.environments,
    setup: form.setup === "Props" ? "Required" : "None",
    objective: form.objective.trim(),
    facilitateSections: buildFacilitateSections(tabs),
    materials: tabs.find((tab) => tab.kind === "prep")?.noMaterialsNeeded
      ? []
      : (tabs.find((tab) => tab.kind === "prep")?.materials ?? []),
    selTags: form.selTags,
    status,
    videoUrl: form.videoUrl.trim() || undefined,
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
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(null);
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
    if (nextFile) clearErrorKeys("thumbnail");
  };

  const handleVideoUrlChange = (value: string) => {
    const trimmedValue = value.trim();
    setForm((current) => ({
      ...current,
      videoUrl: value,
      videoThumbnailUrl: null,
      videoThumbnailStatus: "idle",
      videoThumbnailError: null,
    }));

    if (!trimmedValue) {
      clearErrorKeys("thumbnail");
    }
  };

  const handleExtractThumbnail = () => {
    const trimmedVideoUrl = form.videoUrl.trim();

    if (!trimmedVideoUrl) {
      setForm((current) => ({
        ...current,
        videoUrl: "",
        videoThumbnailUrl: null,
        videoThumbnailStatus: "idle",
        videoThumbnailError: null,
      }));
      return;
    }

    const videoId = getYoutubeVideoId(trimmedVideoUrl);

    if (!videoId) {
      setForm((current) => ({
        ...current,
        videoThumbnailUrl: null,
        videoThumbnailStatus: "idle",
        videoThumbnailError: null,
      }));
      return;
    }

    setForm((current) => ({
      ...current,
      videoUrl: trimmedVideoUrl,
      videoThumbnailUrl: getYoutubeThumbnailUrl(videoId),
      videoThumbnailStatus: "checking",
      videoThumbnailError: null,
    }));
  };

  const handleThumbnailImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const image = event.currentTarget;
    if (image.naturalWidth <= 120 && image.naturalHeight <= 90) {
      setForm((current) => ({
        ...current,
        videoThumbnailUrl: null,
        videoThumbnailStatus: "idle",
        videoThumbnailError: null,
      }));
      return;
    }

    setForm((current) => ({
      ...current,
      videoThumbnailStatus: "ready",
      videoThumbnailError: null,
    }));
    clearErrorKeys("thumbnail");
  };

  const handleThumbnailImageError = () => {
    setForm((current) => ({
      ...current,
      videoThumbnailUrl: null,
      videoThumbnailStatus: "idle",
      videoThumbnailError: null,
    }));
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

  const handleCreateTab = () => {
    setTabs((current) => {
      const nextTab = createDefaultTab(`Tab ${current.length + 1}`, "custom");
      setActiveTabId(nextTab.id);
      return [...current, nextTab];
    });
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

  const validate = () => {
    const nextErrors: FormErrors = {};
    const prepTab = tabs.find((tab) => tab.kind === "prep");
    const playTab = tabs.find((tab) => tab.kind === "play");
    const debriefTab = tabs.find((tab) => tab.kind === "debrief");
    const sectionErrors: Record<string, { title?: string; content?: string }> = {};

    if (!thumbnailPreviewUrl && !form.videoThumbnailUrl) {
      nextErrors.thumbnail = "Please upload either an image or a video frame";
    }
    if (!form.title.trim()) nextErrors.title = "Please enter an activity title";
    if (!form.overview.trim()) nextErrors.overview = "Please enter an activity overview";
    if (form.categories.length === 0) nextErrors.categories = "Please select at least one category";
    if (!form.duration) nextErrors.duration = "Please select a duration";
    if (!form.energyLevel) nextErrors.energyLevel = "Please select an energy level";
    if (!form.setup) nextErrors.setup = "Please select whether the activity needs props";
    if (!form.objective.trim()) nextErrors.objective = "Please enter an activity objective";
    if (form.selTags.length === 0) nextErrors.selTags = "Please enter at least one SEL tag";
    if (!form.anyEnvironment && form.environments.length === 0) {
      nextErrors.environment = "Please select an environment or Any Environment";
    }
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

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = async (targetStatus: ActivityStatus) => {
    if (isSubmitting) return;
    if (targetStatus === "Published" && !validate()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload = buildPayload(form, tabs, targetStatus, thumbnailPreviewUrl);

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
        if (createdId) {
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
    if (!validate()) return;
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
              <label className="activity-field-label" htmlFor="thumbnail-upload">
                Thumbnail
              </label>
              <div className="activity-thumbnail-panel">
                <label
                  className={`activity-upload-card ${errors.thumbnail ? "activity-upload-card-error" : ""}`}
                  htmlFor="thumbnail-upload"
                >
                  {thumbnailPreviewUrl ? (
                    <img
                      src={thumbnailPreviewUrl}
                      alt="Selected thumbnail preview"
                      className="activity-upload-preview"
                    />
                  ) : (
                    <span className="activity-upload-plus">+</span>
                  )}
                  <span className="activity-upload-title">Upload cover image</span>
                  <span className="activity-upload-copy">
                    Upload an image to use as the activity cover.
                  </span>
                  <span className="activity-upload-button">Choose Image</span>
                  <span className="activity-upload-meta">
                    {thumbnailFile ? `Image selected: ${thumbnailFile.name}` : "No image selected"}
                  </span>
                  <span className="activity-upload-meta">
                    Supported formats: JPG, JPEG, PNG, GIF, WEBP
                  </span>
                  <span className="activity-upload-meta">Max size: 10 MB</span>
                </label>
                <input
                  id="thumbnail-upload"
                  className="activity-sr-only"
                  type="file"
                  accept=".jpg,.jpeg,.png,.gif,.webp,image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleThumbnailFileChange}
                />
                {errors.thumbnail ? <FieldError message={errors.thumbnail} /> : null}
              </div>
            </div>

            <div className="activity-field-group">
              <label className="activity-field-label" htmlFor="video-url">
                YouTube Video URL
              </label>
              <div className="activity-inline-inputs">
                <input
                  id="video-url"
                  className="activity-text-input"
                  value={form.videoUrl}
                  onChange={(event) => handleVideoUrlChange(event.target.value)}
                  placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                />
                <button
                  type="button"
                  className="activity-primary-button"
                  onClick={handleExtractThumbnail}
                >
                  {form.videoThumbnailStatus === "ready" ? "Refresh Thumbnail" : "Extract Thumbnail"}
                </button>
              </div>
              {form.videoThumbnailError ? <FieldError message={form.videoThumbnailError} /> : null}
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
            </div>

            <div className="activity-field-group">
              <label className="activity-field-label" htmlFor="title">
                Activity Title
              </label>
              <input
                id="title"
                className={`activity-text-input ${errors.title ? "activity-input-error" : ""}`}
                value={form.title}
                maxLength={40}
                onChange={(event) => setField("title", event.target.value)}
                placeholder="Enter activity title"
              />
              <p className="activity-support-text">{form.title.length}/40 characters</p>
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
              <input
                id="objective"
                className={`activity-text-input ${errors.objective ? "activity-input-error" : ""}`}
                value={form.objective}
                maxLength={150}
                onChange={(event) => setField("objective", event.target.value)}
                placeholder="Enter activity objective"
              />
              <p className="activity-support-text">{form.objective.length}/150 characters</p>
              {errors.objective ? <FieldError message={errors.objective} /> : null}
            </div>

            <div className="activity-facilitate-header">
              <p className="activity-field-label">Facilitate</p>
              <button type="button" className="activity-secondary-button" onClick={handleCreateTab}>
                <span className="activity-button-icon-text">
                  <img src={AddIconUrl} alt="" aria-hidden="true" />
                  <span>Create New Tab</span>
                </span>
              </button>
            </div>

            <div className="activity-tab-container">
              {tabs.map((tab) => {
                const isActive = tab.id === activeTabId;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    className={`activity-tab ${isActive ? "activity-tab-active" : ""}`}
                    onClick={() => setActiveTabId(tab.id)}
                  >
                    {tab.name}
                  </button>
                );
              })}
            </div>

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
                        <img src={DeleteSectionButtonUrl} alt="" aria-hidden="true" />
                      </button>
                    </div>

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
        thumbnailPreviewUrl={thumbnailPreviewUrl}
        objective={form.objective}
        tabs={tabs}
        selTags={form.selTags}
      />
    </div>
  );
}
