import { useEffect, useRef, useState } from "react";
import {
  Image,
  type LayoutChangeEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { ClipPath, Defs, G, Path, Rect } from "react-native-svg";

import NoteIcon from "../../assets/NoteIcon";

type Activity = {
  id: string;
  title: string;
  description: string;
  category: string;
  gradeLevel: string;
  participants: string;
  duration: string;
  difficulty: number;
  tags: string[];
  objective: string;
  facilitate: {
    prep: {
      setup: string[];
      materials: string[];
    };
    play: string[];
    debrief?: string[];
    safety?: string[];
    variations?: string[];
  };
  selOpportunities: string[];
  mediaUrl?: string | number; // string for URLs, number for require() local images
  tutorialUrl?: string;
};

type ActivityDetailProps = {
  activity: Activity;
  onBack?: () => void;
  onOpenNotes?: () => void;
};

const dividerStyles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#F9F9F9",
    paddingHorizontal: 16,
    paddingVertical: 0,
  },
  line: {
    width: "100%",
    height: 1,
    backgroundColor: "#D9D9D9",
  },
});

const SectionDivider = () => {
  return (
    <View style={dividerStyles.container}>
      <View style={dividerStyles.line} />
    </View>
  );
};

const DownloadIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
    <G clipPath="url(#downloadClip)">
      <Path
        d="M1 10.0042V19H19V10"
        stroke="#153A7A"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M14.5 9.5L10 14L5.5 9.5"
        stroke="#153A7A"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9.99609 1V14"
        stroke="#153A7A"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </G>
    <Defs>
      <ClipPath id="downloadClip">
        <Rect width={20} height={20} fill="white" />
      </ClipPath>
    </Defs>
  </Svg>
);

const BookmarkIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M17.6271 18.6861L12 16.5L6.5 18.6861V4.5H17.5L17.6271 18.6861ZM17 3H7C6.46957 3 5.96086 3.21071 5.58579 3.58579C5.21071 3.96086 5 4.46957 5 5V21L12 18L19 21V5C19 3.89 18.1 3 17 3Z"
      fill="#153A7A"
    />
  </Svg>
);

const SuccessCheckIcon = () => (
  <Svg width={14} height={14} viewBox="0 0 14 14" fill="none">
    <Path
      d="M11.5 4L5.5 10L2.5 7"
      stroke="#36C759"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ClockIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C10.6868 2 9.38642 2.25866 8.17317 2.7612C6.95991 3.26375 5.85752 4.00035 4.92893 4.92893C3.05357 6.8043 2 9.34784 2 12C2 14.6522 3.05357 17.1957 4.92893 19.0711C5.85752 19.9997 6.95991 20.7363 8.17317 21.2388C9.38642 21.7413 10.6868 22 12 22C14.6522 22 17.1957 20.9464 19.0711 19.0711C20.9464 17.1957 22 14.6522 22 12C22 10.6868 21.7413 9.38642 21.2388 8.17317C20.7363 6.95991 19.9997 5.85752 19.0711 4.92893C18.1425 4.00035 17.0401 3.26375 15.8268 2.7612C14.6136 2.25866 13.3132 2 12 2ZM16.5978 15.5537C16.3781 15.9106 15.9106 16.0219 15.5537 15.8022L11 13V7.75C11 7.33579 11.3358 7 11.75 7C12.1642 7 12.5 7.33579 12.5 7.75V12.2L16.3419 14.5051C16.7041 14.7225 16.8192 15.1938 16.5978 15.5537Z"
      fill="#153A7A"
    />
  </Svg>
);

const GroupIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 3C12.9283 3 13.8185 3.38146 14.4749 4.06048C15.1313 4.73949 15.5 5.66042 15.5 6.62069C15.5 7.58096 15.1313 8.50189 14.4749 9.1809C13.8185 9.85991 12.9283 10.2414 12 10.2414C11.0717 10.2414 10.1815 9.85991 9.52513 9.1809C8.86875 8.50189 8.5 7.58096 8.5 6.62069C8.5 5.66042 8.86875 4.73949 9.52513 4.06048C10.1815 3.38146 11.0717 3 12 3ZM5 5.58621C5.56 5.58621 6.08 5.74138 6.53 6.02069C6.38 7.5 6.8 8.96897 7.66 10.1172C7.16 11.1103 6.16 11.7931 5 11.7931C4.20435 11.7931 3.44129 11.4661 2.87868 10.8841C2.31607 10.3021 2 9.51274 2 8.68965C2 7.86657 2.31607 7.07719 2.87868 6.49519C3.44129 5.91318 4.20435 5.58621 5 5.58621ZM19 5.58621C19.7956 5.58621 20.5587 5.91318 21.1213 6.49519C21.6839 7.07719 22 7.86657 22 8.68965C22 9.51274 21.6839 10.3021 21.1213 10.8841C20.5587 11.4661 19.7956 11.7931 19 11.7931C17.84 11.7931 16.84 11.1103 16.34 10.1172C17.2 8.96897 17.62 7.5 17.47 6.02069C17.92 5.74138 18.44 5.58621 19 5.58621ZM5.5 16.1897C5.5 14.0483 8.41 12.3103 12 12.3103C15.59 12.3103 18.5 14.0483 18.5 16.1897V18H5.5V16.1897ZM0 18V16.4483C0 15.0103 1.89 13.8 4.45 13.4483C3.86 14.1517 3.5 15.1241 3.5 16.1897V18H0ZM24 18H20.5V16.1897C20.5 15.1241 20.14 14.1517 19.55 13.4483C22.11 13.8 24 15.0103 24 16.4483V18Z"
      fill="#153A7A"
    />
  </Svg>
);

const GradeLevelIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
    <Path
      d="M8.46619 3.82694C9.45945 3.46068 10.5413 3.46068 11.5346 3.82694L19.3784 6.71943C20.2072 7.02608 20.2072 8.26137 19.3784 8.56802L11.5346 11.4605C10.5413 11.8268 9.45945 11.8268 8.46619 11.4605L2.78044 9.36183C2.57128 9.52498 2.41431 9.75144 2.33045 10.011C2.46644 10.1102 2.5778 10.2425 2.65514 10.3965C2.73248 10.5506 2.77354 10.722 2.77486 10.8963C2.77617 11.0706 2.73771 11.2426 2.6627 11.398C2.58769 11.5533 2.47834 11.6874 2.34386 11.7889L2.34799 11.8085L3.25107 16.0918C3.27114 16.1871 3.27066 16.2859 3.24967 16.381C3.22867 16.4761 3.1877 16.565 3.12976 16.6411C3.07182 16.7173 2.99839 16.7788 2.91489 16.8211C2.83139 16.8634 2.73995 16.8855 2.6473 16.8856H0.840117C0.747378 16.8856 0.655815 16.8637 0.572187 16.8215C0.488559 16.7792 0.415003 16.7178 0.356949 16.6416C0.298894 16.5654 0.257825 16.4764 0.236772 16.3812C0.21572 16.2861 0.215222 16.1872 0.235315 16.0918L1.13839 11.8074L1.14355 11.7889C0.998936 11.68 0.883456 11.5337 0.808296 11.364C0.733137 11.1943 0.700845 11.007 0.714548 10.8203C0.728251 10.6336 0.787485 10.4538 0.886512 10.2983C0.98554 10.1428 1.121 10.0169 1.27979 9.93271C1.35579 9.58249 1.50104 9.25309 1.70604 8.96601L0.622347 8.56693C-0.207449 8.26029 -0.207449 7.02499 0.622347 6.71835L8.46619 3.82694Z"
      fill="#153A7A"
    />
    <Path
      d="M3.71678 11.0533L3.34488 13.7832C3.28103 14.2482 3.48714 14.7296 3.92737 15.0135C5.22342 15.8518 7.33608 16.8855 9.99874 16.8855C12.2124 16.8918 14.3669 16.2289 16.1295 14.9991C16.5383 14.711 16.7142 14.2512 16.656 13.8141L16.2796 11.0522L11.6633 12.5355C10.5853 12.882 9.41107 12.882 8.33304 12.5355L3.71678 11.0533Z"
      fill="#153A7A"
    />
  </Svg>
);

const LightningIcon = ({ filled = false }: { filled?: boolean }) => (
  <Svg width={16} height={22} viewBox="0 0 16 22" fill="none">
    <Path
      d="M9.7373 0.914551C10.3089 0.491866 11.1626 0.944087 11.0811 1.69678L10.2021 9.80615H14.1299C14.881 9.80645 15.2627 10.7098 14.7393 11.2485L5.62207 20.6265C5.04529 21.2196 4.04644 20.7226 4.17188 19.9048L5.49219 11.3062H1.60352C0.85137 11.3062 0.469988 10.4013 0.995117 9.86279L9.62695 1.01123L9.7373 0.914551Z"
      stroke={filled ? "#ECD528" : "#D9D9D9"}
      fill={filled ? "#ECD528" : "none"}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </Svg>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 0,
  },
  contentWrapper: {
    flex: 1,
  },
  mediaSection: {
    width: "100%",
    height: 240,
    position: "relative",
    backgroundColor: "#F3F3F3",
  },
  mediaImage: {
    width: "100%",
    height: "100%",
  },
  mediaPlaceholder: {
    width: "100%",
    height: "100%",
    overflow: "hidden",
  },
  checkeredPattern: {
    width: "100%",
    height: "100%",
    backgroundColor: "#F3F3F3",
    opacity: 0.5,
    borderWidth: 1,
    borderColor: "#D9D9D9",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D9D9D9",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  backButtonIcon: {
    fontSize: 24,
    color: "#153A7A",
    fontWeight: "300",
  },
  tutorialButton: {
    position: "absolute",
    bottom: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D9D9D9",
    zIndex: 10,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  playIcon: {
    fontSize: 12,
    color: "#153A7A",
    marginRight: 6,
  },
  tutorialText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#153A7A",
    letterSpacing: 2,
    fontFamily: "Instrument Sans",
  },
  overviewSection: {
    backgroundColor: "#F9F9F9",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  overviewSectionNoCategory: {
    paddingBottom: 12,
  },
  overviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  categoryTag: {
    backgroundColor: "#3C47BD",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryTagText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#FFFFFF",
    letterSpacing: 2,
    fontFamily: "Instrument Sans",
  },
  actionIcons: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  actionIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 100,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EBEBEB",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  metadataIconContainer: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#153A7A",
    marginBottom: 12,
    lineHeight: 27.04,
  },
  metadataRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  metadataText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#153A7A",
    letterSpacing: 2,
    fontFamily: "Instrument Sans",
  },
  metadataIcon: {
    fontSize: 14,
  },
  metadataDot: {
    fontSize: 14,
    color: "#153A7A",
    marginHorizontal: 4,
  },
  description: {
    fontSize: 14,
    fontWeight: "400",
    color: "#153A7A",
    lineHeight: 21,
    marginBottom: 16,
    letterSpacing: 2,
    fontFamily: "Instrument Sans",
  },
  difficultyTagsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  difficultyIcons: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
  },
  lightningIconContainer: {
    width: 16,
    height: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "#EBEBEB",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "400",
    color: "#153A7A",
    letterSpacing: 2,
    fontFamily: "Instrument Sans",
  },
  dividerContainer: {
    width: "100%",
    backgroundColor: "#F9F9F9",
    paddingHorizontal: 16,
    paddingVertical: 0,
  },
  dividerLine: {
    width: "100%",
    height: 1,
    backgroundColor: "#D9D9D9",
  },
  section: {
    backgroundColor: "#F9F9F9",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
  },
  firstSection: {
    paddingTop: 16,
  },
  lastSection: {
    paddingBottom: 0,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#153A7A",
    marginBottom: 16,
    lineHeight: 27.04,
  },
  sectionContent: {
    fontSize: 14,
    fontWeight: "400",
    color: "#153A7A",
    lineHeight: 21,
    letterSpacing: 0,
    fontFamily: "Instrument Sans",
  },
  tabsWrapper: {
    marginBottom: 8,
    backgroundColor: "#FFFFFF",
  },
  tabsScrollView: {
    flexGrow: 0,
  },
  tabsScrollContent: {
    paddingLeft: 0,
    paddingRight: 0,
  },
  tab: {
    height: 37,
    paddingTop: 8,
    paddingRight: 32,
    paddingBottom: 9,
    paddingLeft: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F3F3",
    borderWidth: 1,
    borderColor: "#D9D9D9",
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  tabWithRightBorder: {
    borderRightWidth: 1,
    borderRightColor: "#D9D9D9",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#6C6C6C",
    letterSpacing: 0,
    fontFamily: "Instrument Sans",
  },
  tabTextActive: {
    color: "#153A7A",
    fontWeight: "700",
    fontFamily: "Instrument Sans",
  },
  contentCard: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 8,
    padding: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    borderTopWidth: 0,
    borderRightWidth: 1,
    borderRightColor: "#D9D9D9",
    borderBottomWidth: 1,
    borderBottomColor: "#D9D9D9",
    borderLeftWidth: 0,
  },
  subsection: {
    marginBottom: 20,
  },
  subsectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#153A7A",
    marginBottom: 12,
    lineHeight: 20.8,
  },
  playHeading: {
    fontSize: 20,
    fontWeight: "700",
    color: "#153A7A",
    marginBottom: 12,
    fontFamily: "Instrument Sans",
  },
  debriefHeading: {
    fontSize: 20,
    fontWeight: "700",
    color: "#153A7A",
    marginBottom: 12,
    fontFamily: "Instrument Sans",
  },
  playStepLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#153A7A",
    marginBottom: 4,
    fontFamily: "Instrument Sans",
  },
  playStepSubsection: {
    marginBottom: 24,
  },
  numberedItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  number: {
    fontSize: 14,
    fontWeight: "400",
    color: "#153A7A",
    marginRight: 4,
    marginTop: 2,
  },
  numberedText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#153A7A",
    lineHeight: 21,
    flex: 1,
    letterSpacing: 0,
    fontFamily: "Instrument Sans",
  },
  bulletItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  bullet: {
    fontSize: 14,
    color: "#153A7A",
    marginRight: 8,
    marginTop: 2,
    fontFamily: "Instrument Sans",
  },
  bulletText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#153A7A",
    lineHeight: 21,
    flex: 1,
    letterSpacing: 0,
    fontFamily: "Instrument Sans",
  },
  selTagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  selTag: {
    backgroundColor: "#153A7A",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  selTagText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#FFFFFF",
    letterSpacing: 2,
  },
  notificationWrap: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 34,
    alignItems: "center",
    zIndex: 10,
  },
  notificationBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#36C759",
    borderRadius: 12,
    paddingVertical: 8,
    paddingLeft: 12,
    paddingRight: 16,
    gap: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 6,
  },
  notificationIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  notificationText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
    fontFamily: "Instrument Sans",
    marginLeft: 15,
  },
  notificationActionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  notificationActionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    fontFamily: "Instrument Sans",
  },
});

export default function ActivityDetail({ activity, onBack, onOpenNotes }: ActivityDetailProps) {
  const [activeTab, setActiveTab] = useState<"prep" | "play" | "debrief" | "safety" | "variations">(
    "prep",
  );
  const [scrollViewHeight, setScrollViewHeight] = useState(0);
  const [notification, setNotification] = useState<"download" | "bookmark" | null>(null);

  useEffect(() => {
    if (!notification) return;
    const t = setTimeout(() => setNotification(null), 3000);
    return () => clearTimeout(t);
  }, [notification]);

  const hasOverview = !!activity.category;

  const tabs = ["Prep", "Play", "Debrief", "Safety", "Variations"] as const;
  const tabKeys: ("prep" | "play" | "debrief" | "safety" | "variations")[] = [
    "prep",
    "play",
    "debrief",
    "safety",
    "variations",
  ];
  const tabsScrollViewRef = useRef<ScrollView>(null);

  const handleTabPress = (
    tabKey: "prep" | "play" | "debrief" | "safety" | "variations",
    index: number,
  ) => {
    setActiveTab(tabKey);
    if (index === tabs.length - 1) {
      setTimeout(() => {
        tabsScrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleScrollViewLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setScrollViewHeight(height);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={true}
        bounces={true}
        alwaysBounceVertical={false}
        removeClippedSubviews={false}
        scrollEventThrottle={16}
        contentInsetAdjustmentBehavior="automatic"
        onLayout={handleScrollViewLayout}
      >
        <View
          style={[styles.contentWrapper, scrollViewHeight > 0 && { minHeight: scrollViewHeight }]}
        >
          <View style={styles.mediaSection}>
            {activity.mediaUrl ? (
              <Image
                source={
                  typeof activity.mediaUrl === "number"
                    ? activity.mediaUrl
                    : typeof activity.mediaUrl === "string" && activity.mediaUrl.startsWith("http")
                      ? { uri: activity.mediaUrl }
                      : { uri: activity.mediaUrl }
                }
                style={styles.mediaImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.mediaPlaceholder}>
                <View style={styles.checkeredPattern} />
              </View>
            )}

            <TouchableOpacity
              style={styles.backButton}
              onPress={onBack ? () => onBack() : undefined}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Text style={styles.backButtonIcon}>‹</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.tutorialButton}>
              <Text style={styles.playIcon}>▶</Text>
              <Text style={styles.tutorialText}>Tutorial</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.overviewSection, !hasOverview && styles.overviewSectionNoCategory]}>
            <View style={styles.overviewHeader}>
              {activity.category && (
                <View style={styles.categoryTag}>
                  <Text style={styles.categoryTagText}>{activity.category}</Text>
                </View>
              )}
              <View style={styles.actionIcons}>
                <TouchableOpacity
                  style={styles.actionIconCircle}
                  onPress={() => setNotification("download")}
                  accessibilityRole="button"
                  accessibilityLabel="Download"
                >
                  <DownloadIcon />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionIconCircle}
                  onPress={onOpenNotes}
                  accessibilityRole="button"
                  accessibilityLabel="Open notes"
                >
                  <NoteIcon />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionIconCircle}
                  onPress={() => setNotification("bookmark")}
                  accessibilityRole="button"
                  accessibilityLabel="Save activity"
                >
                  <BookmarkIcon />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.title}>{activity.title}</Text>

            <View style={styles.metadataRow}>
              {activity.gradeLevel && (
                <>
                  <View style={styles.metadataIconContainer}>
                    <GradeLevelIcon />
                  </View>
                  <Text style={styles.metadataText}>{activity.gradeLevel}</Text>
                  <Text style={styles.metadataDot}>•</Text>
                </>
              )}
              {activity.participants && (
                <>
                  <View style={styles.metadataIconContainer}>
                    <GroupIcon />
                  </View>
                  <Text style={styles.metadataText}>{activity.participants}</Text>
                  <Text style={styles.metadataDot}>•</Text>
                </>
              )}
              {activity.duration && (
                <>
                  <View style={styles.metadataIconContainer}>
                    <ClockIcon />
                  </View>
                  <Text style={styles.metadataText}>{activity.duration}</Text>
                </>
              )}
            </View>

            {activity.description && <Text style={styles.description}>{activity.description}</Text>}

            <View style={styles.difficultyTagsRow}>
              <View style={styles.difficultyIcons}>
                {[1, 2, 3].map((level) => (
                  <View key={level} style={styles.lightningIconContainer}>
                    <LightningIcon filled={level <= activity.difficulty} />
                  </View>
                ))}
              </View>
              <View style={styles.tagsContainer}>
                {activity.tags.map((tag) => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <SectionDivider />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Objective</Text>
            <Text style={styles.sectionContent}>{activity.objective}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Facilitate</Text>

            <View style={styles.tabsWrapper}>
              <ScrollView
                ref={tabsScrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.tabsScrollContent}
                style={styles.tabsScrollView}
              >
                {tabs.map((tab, index) => {
                  const tabKey = tabKeys[index];
                  const isActive = activeTab === tabKey;
                  const isLast = index === tabs.length - 1;
                  return (
                    <TouchableOpacity
                      key={tab}
                      style={[
                        styles.tab,
                        isActive && styles.tabActive,
                        !isLast && styles.tabWithRightBorder,
                      ]}
                      onPress={() => handleTabPress(tabKey, index)}
                    >
                      <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.contentCard}>
              {activeTab === "prep" && (
                <>
                  {activity.facilitate.prep.setup && activity.facilitate.prep.setup.length > 0 && (
                    <View style={styles.subsection}>
                      <Text style={styles.subsectionTitle}>Set-Up</Text>
                      {activity.facilitate.prep.setup.map((item) => (
                        <Text key={`setup-${item}`} style={styles.sectionContent}>
                          {item}
                        </Text>
                      ))}
                    </View>
                  )}

                  {activity.facilitate.prep.materials &&
                    activity.facilitate.prep.materials.length > 0 && (
                      <View style={styles.subsection}>
                        <Text style={styles.subsectionTitle}>Materials</Text>
                        {activity.facilitate.prep.materials.map((item) => (
                          <View key={`material-${item}`} style={styles.bulletItem}>
                            <Text style={styles.bullet}>•</Text>
                            <Text style={styles.bulletText}>{item}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                </>
              )}

              {activeTab === "play" && (
                <View>
                  <Text style={styles.playHeading}>How to Play</Text>
                  {activity.facilitate.play.map((item, index) => (
                    <View key={`play-${item}`} style={styles.playStepSubsection}>
                      <Text style={styles.playStepLabel}>Step {index + 1}</Text>
                      <Text style={styles.sectionContent}>{item}</Text>
                    </View>
                  ))}
                </View>
              )}

              {activeTab === "debrief" && (
                <View>
                  <Text style={styles.debriefHeading}>Debrief</Text>
                  {activity.facilitate.debrief?.map((item, index) => (
                    <View key={`debrief-${item}`} style={styles.numberedItem}>
                      <Text style={styles.number}>{index + 1}.</Text>
                      <Text style={styles.numberedText}>{item}</Text>
                    </View>
                  ))}
                </View>
              )}

              {activeTab === "safety" && (
                <View>
                  <Text style={styles.debriefHeading}>Safety</Text>
                  {activity.facilitate.safety?.map((item) => (
                    <Text key={`safety-${item}`} style={styles.sectionContent}>
                      {item}
                    </Text>
                  ))}
                </View>
              )}

              {activeTab === "variations" && (
                <View>
                  <Text style={styles.debriefHeading}>Variations</Text>
                  {activity.facilitate.variations?.map((item) => (
                    <Text key={`variations-${item}`} style={styles.sectionContent}>
                      {item}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          </View>

          <View style={[styles.section, styles.lastSection]}>
            <Text style={styles.sectionTitle}>SEL Opportunity</Text>
            <View style={styles.selTagsContainer}>
              {activity.selOpportunities.map((tag) => (
                <View key={`sel-${tag}`} style={styles.selTag}>
                  <Text style={styles.selTagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {notification && (
        <View style={styles.notificationWrap} pointerEvents="box-none">
          <View style={styles.notificationBanner}>
            <View style={styles.notificationIconCircle}>
              <SuccessCheckIcon />
            </View>
            <Text style={styles.notificationText} numberOfLines={1}>
              {notification === "download" ? "Activity downloaded!" : "Activity bookmarked!"}
            </Text>
            <TouchableOpacity
              style={styles.notificationActionBtn}
              onPress={() => setNotification(null)}
            >
              <Text style={styles.notificationActionText}>
                {notification === "download" ? "View" : "Playlists"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
