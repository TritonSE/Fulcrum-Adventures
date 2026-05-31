import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Image,
  type ImageSourcePropType,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import PhoneFrameImage from "../../../../assets/378_rectangle_extracted.png";
import ActionIcon from "../../../../assets/icons/Action.svg";
import BlankEnergyStarIcon from "../../../../assets/icons/blankenergystar.svg";
import BookmarkIcon from "../../../../assets/icons/BookMarkIcon.svg";
import ClockIcon from "../../../../assets/icons/clock.svg";
import GraduationCapIcon from "../../../../assets/icons/graduation-cap.svg";
import PageIcon from "../../../../assets/icons/PageIcon.svg";
import PeopleIcon from "../../../../assets/icons/people.svg";
import YellowEnergyStarIcon from "../../../../assets/icons/yellowenergystar.svg";

import type { ActivityTab } from "../ActivityContent";
import type { OverviewFormState } from "../OverviewSection";

type PublishPreviewModalProps = {
  visible: boolean;
  onClose: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
  publishLabel?: string;
  overview: OverviewFormState;
  objective: string;
  tabs: ActivityTab[];
  selTags: string[];
};

type TabPreview = {
  id: string;
  kind: ActivityTab["kind"];
  sections: Array<{ title: string; content: string }>;
  guidedItems: string[];
  materials: string[];
  noMaterialsNeeded: boolean;
};

const getGradeRangeLabel = (overview: OverviewFormState) => {
  const minValue = overview.gradeMin === "K" ? "K" : overview.gradeMin;
  return `${minValue}-${overview.gradeMax}`;
};

const getGroupSizeLabel = (overview: OverviewFormState) =>
  overview.anyGroupSize
    ? "Any size"
    : overview.groupSizeMin && overview.groupSizeMax
      ? `${overview.groupSizeMin}-${overview.groupSizeMax}`
      : "No group size set";

const getEnvironmentLabel = (overview: OverviewFormState) =>
  overview.anyEnvironment
    ? "Any Environment"
    : overview.environments.length > 0
      ? overview.environments.join(", ")
      : "No environment selected";

const getDurationLabel = (overview: OverviewFormState) => overview.duration ?? "No duration set";

const getEnergyLevelFilledStars = (overview: OverviewFormState) => {
  switch (overview.energyLevel) {
    case "High":
      return 3;
    case "Medium":
      return 2;
    case "Low":
      return 1;
    default:
      return 0;
  }
};

const toTabPreview = (tab: ActivityTab): TabPreview => ({
  id: tab.id,
  kind: tab.kind,
  sections: tab.sections.map((section, index) => ({
    title: section.title.trim() || (index === 0 ? "Section" : `Section ${index + 1}`),
    content: section.content.trim(),
  })),
  guidedItems: tab.guidedItems,
  materials: tab.materials,
  noMaterialsNeeded: tab.noMaterialsNeeded,
});

const PreviewMetric: React.FC<{
  value: string;
  Icon: React.ComponentType<{ width?: number; height?: number }>;
}> = ({ value, Icon }) => (
  <View style={styles.metricItem}>
    <Icon width={16} height={16} />
    <Text style={styles.metricValue}>{value}</Text>
  </View>
);

const PreviewChip: React.FC<{ label: string }> = ({ label }) => (
  <View style={styles.chip}>
    <Text style={styles.chipText}>{label}</Text>
  </View>
);

const PreviewSectionBlock: React.FC<{ title: string; content: string }> = ({ title, content }) => (
  <View style={styles.sectionBlock}>
    <Text style={styles.sectionBlockTitle}>{title}</Text>
    <Text style={styles.sectionBlockText}>{content || "No content added yet."}</Text>
  </View>
);

const PreviewMaterialItem: React.FC<{ label: string }> = ({ label }) => (
  <View style={styles.materialItemRow}>
    <View style={styles.materialCheckbox} />
    <Text style={styles.materialItemText}>{label}</Text>
  </View>
);

const FACILITATE_TABS: Array<Exclude<ActivityTab["kind"], "custom">> = ["prep", "play", "debrief"];

export const PublishPreviewModal: React.FC<PublishPreviewModalProps> = ({
  visible,
  onClose,
  onSaveDraft,
  onPublish,
  publishLabel = "Publish Activity",
  overview,
  objective,
  tabs,
  selTags,
}) => {
  const { width } = useWindowDimensions();
  const shellWidth = Math.min(Math.max(width - 8, 0), 1000);
  const frameWidth = Math.min(500, width * 0.22);
  const frameHeight = frameWidth * (550 / 300);
  const scale = frameWidth / 300;
  const screenInset = 5 * scale;
  const [activeFacilitateTab, setActiveFacilitateTab] =
    useState<Exclude<ActivityTab["kind"], "custom">>("prep");
  const [isTutorialPlaying, setIsTutorialPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const previewTabs = useMemo(() => tabs.map(toTabPreview), [tabs]);
  const energyLevelFilledStars = getEnergyLevelFilledStars(overview);
  const hasVideoTutorial =
    overview.thumbnailMediaKind === "video" && !!overview.thumbnailVideo?.uri;
  const effectiveIsTutorialPlaying = isTutorialPlaying && visible && hasVideoTutorial;

  useEffect(() => {
    if (Platform.OS !== "web") return;

    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (effectiveIsTutorialPlaying) {
      void videoElement.play().catch(() => {
        setIsTutorialPlaying(false);
      });
      return;
    }

    videoElement.pause();
    videoElement.currentTime = 0;
  }, [effectiveIsTutorialPlaying]);

  const activePreviewTab =
    previewTabs.find((tab) => tab.kind === activeFacilitateTab) ?? previewTabs[0] ?? null;

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
      onShow={() => {
        setActiveFacilitateTab("prep");
        setIsTutorialPlaying(false);
      }}
    >
      <View style={styles.backdrop}>
        <ScrollView contentContainerStyle={styles.pageContent} showsVerticalScrollIndicator={false}>
          <View style={[styles.previewShell, { width: shellWidth }]}>
            <Text style={styles.previewTitle}>Preview</Text>
            <Text style={styles.previewSubtitle}>Scroll on the phone screen to view full page</Text>

            <View style={[styles.phoneWrapper, { width: frameWidth, height: frameHeight }]}>
              <View
                style={[
                  styles.phoneScreen,
                  {
                    top: screenInset,
                    bottom: screenInset,
                    left: screenInset,
                    right: screenInset,
                  },
                ]}
              >
                <ScrollView
                  nestedScrollEnabled
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.phoneScrollContent}
                >
                  <View style={styles.heroCard}>
                    {hasVideoTutorial && Platform.OS === "web" && overview.thumbnailVideo?.uri ? (
                      <video
                        ref={videoRef}
                        src={overview.thumbnailVideo.uri}
                        poster={overview.thumbnailImage?.uri ?? undefined}
                        playsInline
                        muted
                        controls={false}
                        loop={false}
                        preload="metadata"
                        onEnded={() => setIsTutorialPlaying(false)}
                        style={styles.webVideo}
                      />
                    ) : overview.thumbnailImage?.uri ? (
                      <Image
                        source={{ uri: overview.thumbnailImage.uri }}
                        style={styles.heroImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.heroPlaceholder} />
                    )}

                    {hasVideoTutorial ? (
                      <View style={styles.heroOverlay}>
                        <TouchableOpacity
                          style={styles.tutorialPill}
                          activeOpacity={0.9}
                          onPress={() => setIsTutorialPlaying((prev) => !prev)}
                        >
                          <ActionIcon width={12.57} height={12.57} />
                          <Text style={styles.tutorialPillText}>
                            {effectiveIsTutorialPlaying ? "Pause Tutorial" : "Tutorial"}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ) : null}
                  </View>

                  <View style={styles.contentCard}>
                    <View style={styles.topContentRow}>
                      <View style={styles.categoryRow}>
                        {overview.categories.slice(0, 1).map((category) => (
                          <View key={category} style={styles.categoryChip}>
                            <Text style={styles.categoryChipText}>{category}</Text>
                          </View>
                        ))}
                      </View>

                      <View style={styles.previewActionRow}>
                        <View style={styles.previewActionButton}>
                          <PageIcon width={15} height={15} />
                        </View>
                        <View style={styles.previewActionButton}>
                          <BookmarkIcon width={12} height={12} />
                        </View>
                      </View>
                    </View>

                    <Text style={styles.activityTitle}>
                      {overview.title || "Untitled activity"}
                    </Text>

                    <View style={styles.metricRow}>
                      <PreviewMetric
                        value={getGradeRangeLabel(overview)}
                        Icon={GraduationCapIcon}
                      />
                      <Text style={styles.metricDot}>•</Text>
                      <PreviewMetric value={getGroupSizeLabel(overview)} Icon={PeopleIcon} />
                      <Text style={styles.metricDot}>•</Text>
                      <PreviewMetric value={getDurationLabel(overview)} Icon={ClockIcon} />
                    </View>

                    <Text style={styles.descriptionText} numberOfLines={4}>
                      {overview.overview || "No overview provided yet."}
                    </Text>

                    <View style={styles.tagRow}>
                      <View style={styles.energyStarsRow}>
                        {[0, 1, 2].map((index) => {
                          const StarIcon =
                            index < energyLevelFilledStars
                              ? YellowEnergyStarIcon
                              : BlankEnergyStarIcon;

                          return <StarIcon key={`energy-star-${index}`} width={16} height={16} />;
                        })}
                      </View>

                      <PreviewChip label={getEnvironmentLabel(overview)} />
                      <PreviewChip label={overview.setup === "Props" ? "Props" : "No Props"} />
                    </View>

                    <View style={styles.bodySection}>
                      <Text style={styles.bodySectionTitle}>Objective</Text>
                      <Text style={styles.bodySectionText}>
                        {objective || "No objective added yet."}
                      </Text>
                    </View>

                    <View style={[styles.bodySection, styles.bodySectionNoBorder]}>
                      <Text style={styles.bodySectionTitle}>Facilitate</Text>

                      <View style={styles.facilitateTabBar}>
                        {FACILITATE_TABS.map((tabKind, index) => {
                          const isActive = tabKind === activeFacilitateTab;

                          return (
                            <React.Fragment key={tabKind}>
                              <TouchableOpacity
                                style={[
                                  styles.facilitateTab,
                                  isActive && styles.facilitateTabActive,
                                ]}
                                onPress={() => setActiveFacilitateTab(tabKind)}
                                activeOpacity={0.85}
                              >
                                <Text
                                  style={[
                                    styles.facilitateTabText,
                                    isActive && styles.facilitateTabTextActive,
                                  ]}
                                >
                                  {tabKind === "prep"
                                    ? "Prep"
                                    : tabKind === "play"
                                      ? "Play"
                                      : "Debrief"}
                                </Text>
                              </TouchableOpacity>
                              {index < FACILITATE_TABS.length - 1 ? (
                                <View style={styles.facilitateTabDivider} />
                              ) : null}
                            </React.Fragment>
                          );
                        })}
                      </View>

                      {activePreviewTab ? (
                        <View style={styles.tabCard}>
                          {activePreviewTab.kind === "play" ||
                          activePreviewTab.kind === "debrief" ? (
                            <View style={styles.listGroup}>
                              {activePreviewTab.guidedItems.map((item, index) => (
                                <View
                                  key={`${activePreviewTab.id}-guided-${index}`}
                                  style={styles.listItem}
                                >
                                  <Text style={styles.listItemLabel}>
                                    {activePreviewTab.kind === "play"
                                      ? `Step ${index + 1}`
                                      : `Q${index + 1}`}
                                  </Text>
                                  <Text style={styles.listItemText}>
                                    {item.trim() || "No content added yet."}
                                  </Text>
                                </View>
                              ))}
                            </View>
                          ) : (
                            <View style={styles.listGroup}>
                              {activePreviewTab.sections.map((section, index) => (
                                <PreviewSectionBlock
                                  key={`${activePreviewTab.id}-section-${index}`}
                                  title={section.title}
                                  content={section.content}
                                />
                              ))}

                              {activePreviewTab.kind === "prep" && (
                                <View style={styles.materialBlock}>
                                  <Text style={styles.materialTitle}>Materials</Text>
                                  {activePreviewTab.noMaterialsNeeded ? (
                                    <Text style={styles.materialText}>No materials needed.</Text>
                                  ) : activePreviewTab.materials.length > 0 ? (
                                    activePreviewTab.materials.map((material) => (
                                      <PreviewMaterialItem
                                        key={`${activePreviewTab.id}-${material}`}
                                        label={material}
                                      />
                                    ))
                                  ) : (
                                    <Text style={styles.materialText}>No materials added yet.</Text>
                                  )}
                                </View>
                              )}
                            </View>
                          )}
                        </View>
                      ) : null}
                    </View>

                    <View style={[styles.bodySection, styles.bodySectionNoBorder]}>
                      <Text style={styles.bodySectionTitle}>SEL Opportunities</Text>
                      <View style={styles.selTagWrap}>
                        {selTags.length > 0 ? (
                          selTags.map((tag) => (
                            <View key={tag} style={styles.selTagChip}>
                              <Text style={styles.selTagChipText}>{tag}</Text>
                            </View>
                          ))
                        ) : (
                          <Text style={styles.bodySectionText}>No SEL tags selected.</Text>
                        )}
                      </View>
                    </View>
                  </View>
                </ScrollView>
              </View>

              <View pointerEvents="none" style={styles.phoneFrameWrap}>
                <Image
                  source={PhoneFrameImage as ImageSourcePropType}
                  style={styles.phoneFrameImage}
                  resizeMode="stretch"
                />
              </View>
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={onClose}
                activeOpacity={0.85}
              >
                <Text style={styles.secondaryButtonText}>Keep Editing</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={onSaveDraft}
                activeOpacity={0.85}
              >
                <Text style={styles.secondaryButtonText}>Save as Draft</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={onPublish}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryButtonText}>{publishLabel}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.28)",
  },
  pageContent: {
    flexGrow: 1,
    width: "100%",
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  previewShell: {
    width: "100%",
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "#FFFFFF",
    paddingTop: 40,
    paddingBottom: 32,
    paddingHorizontal: 40,
  },
  previewTitle: {
    color: "#153A7A",
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
    fontFamily: "League Spartan",
  },
  previewSubtitle: {
    color: "#909090",
    fontSize: 10,
    marginTop: 22,
    textAlign: "center",
    marginBottom: 14,
    fontFamily: "Instrument Sans",
  },
  phoneWrapper: {
    position: "relative",
    alignSelf: "center",
    marginTop: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  phoneScreen: {
    position: "absolute",
    overflow: "hidden",
    borderRadius: 60,
    zIndex: 1,
  },
  phoneScrollContent: {
    paddingBottom: 0,
  },
  phoneFrameWrap: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
    elevation: 8,
  },
  phoneFrameImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  heroCard: {
    minHeight: 286,
    overflow: "hidden",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    backgroundColor: "#DDE7F8",
  },
  heroImage: {
    width: "100%",
    height: 286,
  },
  heroPlaceholder: {
    width: "100%",
    height: 286,
    backgroundColor: "#DCE5F4",
  },
  heroOverlay: {
    position: "absolute",
    right: 18,
    bottom: 16,
    alignItems: "flex-end",
  },
  tutorialPill: {
    minHeight: 28.57,
    paddingHorizontal: 16.084,
    paddingVertical: 8.285,
    borderRadius: 62.85,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    gap: 5.028,
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOpacity: 0.12,
    shadowRadius: 2.514,
    shadowOffset: { width: 0, height: 0 },
    elevation: 2,
    marginBottom: 8,
  },
  tutorialPillText: {
    color: "#153A7A",
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "500",
    fontFamily: "Instrument Sans",
  },
  contentCard: {
    backgroundColor: "#FFFFFF",
    marginTop: -14,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 18,
  },
  topContentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 8,
  },
  previewActionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  previewActionButton: {
    width: 25,
    height: 25,
    borderRadius: 62.85,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOpacity: 0.2,
    shadowRadius: 2.514,
    shadowOffset: { width: 0, height: 0 },
    elevation: 2,
  },
  categoryChip: {
    backgroundColor: "#10B981",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  categoryChipText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  activityTitle: {
    color: "#153A7A",
    fontSize: 19,
    fontWeight: "700",
    lineHeight: 28,
    marginBottom: 10,
    fontFamily: "League Spartan",
  },
  metricRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 12,
    gap: 8,
  },
  metricItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metricValue: {
    color: "#153A7A",
    fontSize: 8.799,
    fontWeight: "500",
    fontFamily: "Instrument Sans",
  },
  metricDot: {
    color: "#153A7A",
    fontSize: 12,
  },
  descriptionText: {
    color: "#153A7A",
    fontSize: 8.799,
    lineHeight: 21,
    marginBottom: 12,
  },
  energyStarsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 15,
  },
  chip: {
    borderRadius: 25.14,
    borderWidth: 0.628,
    borderColor: "#EBEBEB",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  chipText: {
    color: "#153A7A",
    fontSize: 7.542,
    fontWeight: "400",
    fontFamily: "Instrument Sans",
  },
  bodySection: {
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: "#E3E8F0",
    marginTop: 0,
  },
  bodySectionNoBorder: {
    borderTopWidth: 0,
  },
  bodySectionTitle: {
    color: "#153A7A",
    fontSize: 16.341,
    fontWeight: "700",
    marginBottom: 8,
    fontFamily: "League Spartan",
  },
  bodySectionText: {
    color: "#153A7A",
    fontSize: 8.799,
    fontWeight: "400",
    lineHeight: 13,
    fontFamily: "Instrument Sans",
  },
  tabCard: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#D8DEE9",
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  listGroup: {
    gap: 18,
  },
  listItem: {
    backgroundColor: "transparent",
  },
  listItemLabel: {
    color: "#153A7A",
    fontSize: 12.57,
    fontWeight: "900",
    marginBottom: 8,
    fontFamily: "League Spartan",
  },
  listItemText: {
    color: "#153A7A",
    fontSize: 8.799,
    fontWeight: "400",
    fontFamily: "Instrument Sans",
  },
  sectionBlock: {
    backgroundColor: "transparent",
    gap: 8,
  },
  sectionBlockTitle: {
    color: "#153A7A",
    fontSize: 12.57,
    fontWeight: "900",
    fontFamily: "League Spartan",
  },
  sectionBlockText: {
    color: "#153A7A",
    fontSize: 8.799,
    fontWeight: "400",
    fontFamily: "Instrument Sans",
  },
  materialBlock: {
    backgroundColor: "transparent",
    gap: 10,
  },
  materialTitle: {
    color: "#153A7A",
    fontSize: 12.57,
    fontWeight: "900",
    fontFamily: "League Spartan",
  },
  materialText: {
    color: "#153A7A",
    fontSize: 8.799,
    fontWeight: "400",
    fontFamily: "Instrument Sans",
  },
  materialItemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  materialCheckbox: {
    width: 12,
    height: 12,
    borderWidth: 1,
    borderColor: "#153A7A",
    backgroundColor: "#FFFFFF",
  },
  materialItemText: {
    color: "#153A7A",
    fontSize: 8.799,
    fontWeight: "400",
    fontFamily: "Instrument Sans",
  },
  selTagWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  selTagChip: {
    backgroundColor: "#153A7A",
    borderRadius: 40,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  selTagChipText: {
    color: "#ffffff",
    fontSize: 7.54,
    fontWeight: "500",
    fontFamily: "Instrument Sans",
  },
  facilitateTabBar: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#D8DEE9",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  facilitateTab: {
    flex: 1,
    height: 23,
    backgroundColor: "#F3F3F3",
    alignItems: "center",
    justifyContent: "center",
  },
  webVideo: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  facilitateTabDivider: {
    width: 1,
    backgroundColor: "#E2E7F0",
  },
  facilitateTabActive: {
    backgroundColor: "#FFFFFF",
  },
  facilitateTabText: {
    color: "#6C6C6C",
    fontSize: 10,
    fontWeight: "500",
    fontFamily: "Instrument Sans",
  },
  facilitateTabTextActive: {
    color: "#153A7A",
    fontWeight: "500",
    fontSize: 10,
    fontFamily: "Instrument Sans",
  },
  actionsRow: {
    marginTop: 28,
    width: "100%",
    flexDirection: "row",
    gap: 16,
    justifyContent: "flex-end",
  },
  secondaryButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#153A7A",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "#153A7A",
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "Instrument Sans",
  },
  primaryButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#153A7A",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "Instrument Sans",
  },
});
