import OpenerGraphic from "../../src/assets/Opener.png";
import IcebreakerGraphic from "../../src/assets/Icebreaker.png";
import ActiveGraphic from "../../src/assets/Active.png";
import ConnectionGraphic from "../../src/assets/Connection.png";
import DebriefGraphic from "../../src/assets/Debrief.png";
import TeamChallengeGraphic from "../../src/assets/TeamChallenge.png";
import { CATEGORY_COLORS } from "../constants/activityColors";
import "./CategoryCard.css";

export type Category =
  | "Opener"
  | "Icebreaker"
  | "Connection"
  | "Active"
  | "Debrief"
  | "Team Challenge";

interface CategoryCardProps {
  category: Category;
  percentOfActivities: number;
  numActivities: number;
}

const CATEGORY_GRAPHICS: Record<Category, string> = {
  Opener: OpenerGraphic,
  Icebreaker: IcebreakerGraphic,
  Connection: ConnectionGraphic,
  Active: ActiveGraphic,
  Debrief: DebriefGraphic,
  "Team Challenge": TeamChallengeGraphic,
};

// Arranged in order of top, right, bottom, left
const CATEGORY_PADDING: Record<Category, number[]> = {
  Opener: [14, 46.81, 65.64, 60],
  Icebreaker: [14, 44.88, 78.68, 60],
  Connection: [14, 32.8, 72.95, 44.33],
  Active: [0, 52.19, 47.14, 23],
  Debrief: [10, 56.4, 76.9, 56],
  "Team Challenge": [11, 36.3, 77.1, 47.3],
};

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  percentOfActivities,
  numActivities,
}) => {
  const textColor = CATEGORY_COLORS[category];
  const categoryGraphic = CATEGORY_GRAPHICS[category];
  const categoryPadding = CATEGORY_PADDING[category];
  
  return (
    <div className="categoryCard">
      <div
        className="categoryCardImage"
        style={{
          padding: `${categoryPadding[0]}px ${categoryPadding[1]}px ${categoryPadding[2]}px ${categoryPadding[3]}px`,
        }}
      >
        <img height="100%" width="100%" src={categoryGraphic} alt={category} />
      </div>

      <div className="categoryCardContent">
        <div className="categoryCardTextContainer">
          <p className="categoryText" style={{ color: textColor }}>
            {category}
          </p>
          <p className="percentOfTotalActivitiesText">
            {percentOfActivities}% of total
          </p>
        </div>
        <div className="categoryCardActivityNumberCircle">
          <p className="numActivitiesText">{numActivities}</p>
        </div>
      </div>
    </div>
  );
};
