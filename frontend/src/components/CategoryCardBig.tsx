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

//Arramged in order of top, left, right, bottom
const CATEGORY_PADDING: Record<Category, number[]> = {
  Opener: [57, 44, 10, 15],
  Icebreaker: [54, 15, 0, 9.5],
  Active: [20, 37, 0, 0],
  Connection: [74, 16, 0, 3],
  Debrief: [45, 20, 8.5, 8],
  "Team Challenge": [84, 0, 0, 0],
}

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
      <View style={[styles.imageContainer, {
        paddingTop: CATEGORY_PADDING[category][0], 
        paddingLeft: CATEGORY_PADDING[category][1], 
        paddingRight: CATEGORY_PADDING[category][2], 
        paddingBottom: CATEGORY_PADDING[category][3]
      }]}>
        {/* Render the SVG component derived from category */}
        <ImageComponent width="100%" height="100%" />
      </View>
    </TouchableOpacity>
  );
};
