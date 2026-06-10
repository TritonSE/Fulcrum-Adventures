import { API_BASE_URL } from "./api";

import type {
  Activity,
  ApiActivity,
  ApiDuration,
  ApiGroupSize,
  CustomTab,
  PlayStep,
} from "../types/activity";

function mapDuration(duration: ApiDuration) {
  switch (duration) {
    case "5-15 min":
      return { min: 5, max: 15 };
    case "15-30 min":
      return { min: 15, max: 30 };
    case "30+ min":
      return { min: 30, max: 99 };
  }
}

function mapMediaUrl(url?: string) {
  if (!url) return undefined;
  if (/^https?:\/\//.test(url)) return url;

  return new URL(url, `${API_BASE_URL}/`).toString();
}

function mapGroupSize(groupSize: ApiGroupSize): Activity["groupSize"] {
  if (groupSize.anySize) {
    return {
      min: groupSize.min ?? 1,
      max: groupSize.max ?? 99,
      anySize: true,
    };
  }

  return {
    min: groupSize.min,
    max: groupSize.max,
  };
}

function parseBlocks(content: string) {
  return content
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);
}

function stripBlockTitle(block: string, titles: string[]) {
  const lines = block
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const firstLine = lines[0]?.replace(/:$/, "").toLowerCase();

  if (firstLine && titles.map((title) => title.toLowerCase()).includes(firstLine)) {
    return lines.slice(1).join("\n").trim();
  }

  return lines.join("\n").trim();
}

function parseListItems(content: string) {
  return content
    .split(/\n/)
    .map((line) => line.replace(/^\s*(?:\d+\.|[-•])\s*/, "").trim())
    .filter(Boolean);
}

function parsePrefixedBlock(body: string) {
  const separatorIndex = body.indexOf(":");
  if (separatorIndex === -1) return null;

  return {
    label: body.slice(0, separatorIndex).trim(),
    content: body.slice(separatorIndex + 1).trim(),
  };
}

function splitPrefixedLines(body: string, prefixPattern: RegExp) {
  const chunks: string[] = [];
  let currentChunk = "";

  body
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line) => {
      if (prefixPattern.test(line)) {
        if (currentChunk) chunks.push(currentChunk.trim());
        currentChunk = line;
        return;
      }

      currentChunk = currentChunk ? `${currentChunk}\n${line}` : line;
    });

  if (currentChunk) chunks.push(currentChunk.trim());

  return chunks;
}

function parsePrepSetup(content: string) {
  return parseBlocks(content).flatMap((block) => {
    const body = stripBlockTitle(block, ["Prep", "Set-Up", "Setup"]);
    return parseListItems(body);
  });
}

function parsePlaySteps(content: string): PlayStep[] {
  return parseBlocks(content)
    .flatMap((block) =>
      splitPrefixedLines(
        stripBlockTitle(block, ["Play", "Rules", "How to Play"]),
        /^Step\s+\d+\s*:/i,
      ),
    )
    .map((body, index) => {
      if (!body) return null;

      const prefixedBlock = parsePrefixedBlock(body);
      const stepMatch = prefixedBlock ? /^Step\s+(\d+)$/i.exec(prefixedBlock.label) : null;
      if (prefixedBlock && stepMatch) {
        return {
          stepNumber: Number(stepMatch[1]),
          content: prefixedBlock.content,
        };
      }

      return {
        stepNumber: index + 1,
        content: body,
      };
    })
    .filter((step): step is { stepNumber: number; content: string } => Boolean(step?.content));
}

function parseDebriefQuestions(content: string) {
  return parseBlocks(content)
    .flatMap((block) =>
      splitPrefixedLines(stripBlockTitle(block, ["Debrief", "Reflection Questions"]), /^Q\d+\s*:/i),
    )
    .map((block) => {
      const body = block.trim();
      const prefixedBlock = parsePrefixedBlock(body);
      const questionMatch = prefixedBlock ? /^Q\d+$/i.exec(prefixedBlock.label) : null;
      if (prefixedBlock && questionMatch) return prefixedBlock.content.trim();

      return body.trim();
    })
    .filter(Boolean);
}

function mapFacilitateSections(apiActivity: ApiActivity): Activity["facilitate"] {
  if (apiActivity.facilitateSections.length === 0) {
    return undefined;
  }

  return apiActivity.facilitateSections.reduce<NonNullable<Activity["facilitate"]>>(
    (sections, section) => {
      const key = section.tabName.toLowerCase();

      if (key === "prep" || key === "setup") {
        sections.prep = {
          setup: [...(sections.prep?.setup ?? []), ...parsePrepSetup(section.content)],
        };
      } else if (key === "play") {
        sections.play = {
          steps: [...(sections.play?.steps ?? []), ...parsePlaySteps(section.content)],
        };
      } else if (key === "debrief") {
        sections.debrief = {
          questions: [
            ...(sections.debrief?.questions ?? []),
            ...parseDebriefQuestions(section.content),
          ],
        };
      } else {
        sections[section.tabName] = {
          sections: parseBlocks(section.content).map((block) => {
            const [header, ...rest] = block.split(/\n/).map((line) => line.trim());
            return {
              header: rest.length > 0 ? header : undefined,
              content: (rest.length > 0 ? rest.join("\n") : header).trim(),
            };
          }),
        } satisfies CustomTab;
      }

      return sections;
    },
    {},
  );
}

export function mapApiActivityToActivity(apiActivity: ApiActivity): Activity {
  const primaryEnvironment = apiActivity.environment[0] ?? "Any Environment";
  const primaryCategory = apiActivity.category[0];

  return {
    id: apiActivity._id,
    title: apiActivity.title,
    gradeLevel: apiActivity.gradeRange,
    groupSize: mapGroupSize(apiActivity.groupSize),
    duration: mapDuration(apiActivity.duration),
    category: primaryCategory,
    categories: apiActivity.category,
    description: apiActivity.overview,
    energyLevel: apiActivity.energyLevel,
    environment: primaryEnvironment,
    materials: apiActivity.materials,
    imageUrl: mapMediaUrl(apiActivity.thumbnailUrl),
    objective: apiActivity.objective,
    facilitate: mapFacilitateSections(apiActivity),
    selTags: apiActivity.selTags,
    hasTutorial: Boolean(apiActivity.videoUrl),
    videoUrl: mapMediaUrl(apiActivity.videoUrl),
  };
}
