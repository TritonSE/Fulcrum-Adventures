import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

// SVG Imports
import ActiveGraphic from "../../assets/icons/active_graphic.svg";
import ConnectionGraphic from "../../assets/icons/connection_graphic.svg";
import DebriefGraphic from "../../assets/icons/debrief_graphic.svg";
import IcebreakerGraphic from "../../assets/icons/icebreaker_graphic.svg";
import OpenerGraphic from "../../assets/icons/opener_graphic.svg";
import TeamChallengeGraphic from "../../assets/icons/team_challenge_graphic.svg";
import { CATEGORY_COLORS } from "../constants/activityColors";

import { styles } from "./CategoryCardBig.styles";

import type { Category } from "../types/activity";
import type { SvgProps } from "react-native-svg";

const CATEGORY_GRAPHICS: Record<Category, React.FC<SvgProps>> = {
  Opener: OpenerGraphic,
  Icebreaker: IcebreakerGraphic,
  Active: ActiveGraphic,
  Connection: ConnectionGraphic,
  Debrief: DebriefGraphic,
  "Team Challenge": TeamChallengeGraphic,
};

type CategoryCardBigProps = {
  category: Category;
  onPress?: () => void;
};

export const CategoryCardBig: React.FC<CategoryCardBigProps> = ({ category, onPress }) => {
  const textColor = CATEGORY_COLORS[category];
  const ImageComponent = CATEGORY_GRAPHICS[category];

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <Text style={[styles.title, { color: textColor }]}>{category}</Text>
      <View style={styles.imageContainer}>
        {/* Render the SVG component derived from category */}
        <ImageComponent width="100%" height="100%" />
      </View>
    </TouchableOpacity>
  );
};
