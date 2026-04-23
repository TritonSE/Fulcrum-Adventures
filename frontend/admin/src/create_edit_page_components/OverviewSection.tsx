import React from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";

import { ActivityOverviewField } from "./sub_components/ActivityOverviewField";
import { ActivityTitleField } from "./sub_components/ActivityTitleField";
import { CategorySection } from "./sub_components/CategorySection";
import { DurationSection } from "./sub_components/DurationSection";
import { EnergyLevelSection } from "./sub_components/EnergyLevelSection";
import { EnvironmentSection } from "./sub_components/EnvironmentSection";
import { GradeSection } from "./sub_components/GradeSection";
import { GroupSizeSection } from "./sub_components/GroupSizeSection";
import { SetupSection } from "./sub_components/SetupSection";
import { ThumbnailSection } from "./sub_components/ThumbnailSection";

export type DurationOption = "5-15 min" | "15-30 min" | "30+ min" | null;
export type EnergyLevelOption = "Low" | "Medium" | "High" | null;
export type SetupOption = "Props" | "No Props" | null;

export type OverviewFormState = {
  thumbnailVideoName: string | null;
  thumbnailImageName: string | null;
  title: string;
  overview: string;
  categories: string[];
  gradeMin: string;
  gradeMax: string;
  groupSizeMin: string;
  groupSizeMax: string;
  anyGroupSize: boolean;
  duration: DurationOption;
  energyLevel: EnergyLevelOption;
  environments: string[];
  anyEnvironment: boolean;
  setup: SetupOption;
};

export const createDefaultOverviewState = (): OverviewFormState => ({
  thumbnailVideoName: null,
  thumbnailImageName: null,
  title: "",
  overview: "",
  categories: [],
  gradeMin: "K",
  gradeMax: "6",
  groupSizeMin: "",
  groupSizeMax: "",
  anyGroupSize: false,
  duration: null,
  energyLevel: null,
  environments: [],
  anyEnvironment: false,
  setup: null,
});

type OverviewSectionProps = {
  value: OverviewFormState;
  onChange: (patch: Partial<OverviewFormState>) => void;
  onPickVideo?: () => void;
  onPickImage?: () => void;
};

export const OverviewSection: React.FC<OverviewSectionProps> = ({
  value,
  onChange,
  onPickVideo,
  onPickImage,
}) => {
  const { width } = useWindowDimensions();
  const isWide = width >= 1000;

  return (
    <View style={styles.container}>
      <ThumbnailSection
        videoFileName={value.thumbnailVideoName}
        imageFileName={value.thumbnailImageName}
        onPickVideo={onPickVideo}
        onPickImage={onPickImage}
      />

      <ActivityTitleField value={value.title} onChangeText={(next) => onChange({ title: next })} />

      <ActivityOverviewField
        value={value.overview}
        onChangeText={(next) => onChange({ overview: next })}
      />

      <CategorySection
        selected={value.categories}
        onChange={(next) => onChange({ categories: next })}
      />

      <GradeSection
        minValue={value.gradeMin}
        maxValue={value.gradeMax}
        onChange={(minValue, maxValue) => onChange({ gradeMin: minValue, gradeMax: maxValue })}
      />

      <GroupSizeSection
        minValue={value.groupSizeMin}
        maxValue={value.groupSizeMax}
        anySize={value.anyGroupSize}
        onChangeMin={(next) => onChange({ groupSizeMin: next })}
        onChangeMax={(next) => onChange({ groupSizeMax: next })}
        onChangeAnySize={(next) =>
          onChange({
            anyGroupSize: next,
            ...(next ? { groupSizeMin: "", groupSizeMax: "" } : {}),
          })
        }
      />

      <DurationSection value={value.duration} onChange={(next) => onChange({ duration: next })} />

      <EnergyLevelSection
        value={value.energyLevel}
        onChange={(next) => onChange({ energyLevel: next })}
      />

      <View style={[styles.bottomRow, !isWide && styles.bottomRowMobile]}>
        <View style={styles.environmentColumn}>
          <EnvironmentSection
            selected={value.environments}
            anyEnvironment={value.anyEnvironment}
            onChangeSelected={(next) => onChange({ environments: next })}
            onChangeAnyEnvironment={(next) =>
              onChange({
                anyEnvironment: next,
                ...(next ? { environments: [] } : {}),
              })
            }
          />
        </View>

        <View style={styles.setupColumn}>
          <SetupSection value={value.setup} onChange={(next) => onChange({ setup: next })} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: 28,
  },
  bottomRow: {
    width: "100%",
    flexDirection: "row",
    gap: 24,
    alignItems: "flex-start",
  },
  bottomRowMobile: {
    flexDirection: "column",
    gap: 28,
  },
  environmentColumn: {
    flex: 1,
    width: "100%",
  },
  setupColumn: {
    width: 220,
  },
});
