import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

import ActiveGraphic from "../../assets/images/active_graphic.png";
import ConnectionGraphic from "../../assets/images/connection_graphic.png";
import DebriefGraphic from "../../assets/images/debrief_graphic.png";
import IcebreakerGraphic from "../../assets/images/icebreaker_graphic.png";
import OpenerGraphic from "../../assets/images/opener_graphic.png";
import TeamChallengeGraphic from "../../assets/images/team_challenge_graphic.png";
import { CATEGORY_COLORS } from "../constants/activityColors";

import { styles } from "./CategoryCardBig.styles";

import type { Category } from "../types/activity";
import type { ImageSourcePropType } from "react-native";

const CATEGORY_GRAPHICS: Record<Category, ImageSourcePropType> = {
  Opener: OpenerGraphic as ImageSourcePropType,
  Icebreaker: IcebreakerGraphic as ImageSourcePropType,
  Active: ActiveGraphic as ImageSourcePropType,
  Connection: ConnectionGraphic as ImageSourcePropType,
  Debrief: DebriefGraphic as ImageSourcePropType,
  "Team Challenge": TeamChallengeGraphic as ImageSourcePropType,
};

//Arramged in order of top, left, right, bottom
const CATEGORY_PADDING: Record<Category, number[]> = {
  Opener: [57, 44, 10, 15],
  Icebreaker: [54, 15, 0, 9.5],
  Active: [20, 37, 0, 0],
  Connection: [74, 16, 0, 3],
  Debrief: [45, 20, 8.5, 8],
  "Team Challenge": [84, 0, 0, 0],
};

type CategoryCardBigProps = {
  category: Category;
  onPress?: () => void;
};

export const CategoryCardBig: React.FC<CategoryCardBigProps> = ({ category, onPress }) => {
  const textColor = CATEGORY_COLORS[category];
  const categoryGraphic = CATEGORY_GRAPHICS[category];
  const src = Image.resolveAssetSource(categoryGraphic);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <Text style={[styles.title, { color: textColor }]}>{category}</Text>
      <View
        style={[
          styles.imageContainer,
          {
            paddingTop: CATEGORY_PADDING[category][0],
            paddingLeft: CATEGORY_PADDING[category][1],
            paddingRight: CATEGORY_PADDING[category][2],
            paddingBottom: CATEGORY_PADDING[category][3],
          },
        ]}
      >
        {/* Render the PNG at half the original width/height since it 
        was exported at 2x to prevent it looking pixelated */}
        <Image
          source={categoryGraphic}
          style={{ width: src.width / 2, height: src.height / 2, resizeMode: "contain" }}
        />
      </View>
    </TouchableOpacity>
  );
};
