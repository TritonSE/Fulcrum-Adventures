import { isValidObjectId } from "mongoose";

import Activity from "../models/activity";
import { uploadActivityMedia } from "../services/firebaseStorage";
import { resolveThumbnailUrl } from "../utils/activity-thumbnail";

import type { Request, Response } from "express";

function routeParam(value: string | string[] | undefined): string {
  if (value === undefined) return "";
  return Array.isArray(value) ? value[0] : value;
}

function applyThumbnailFields(body: Record<string, unknown>): Record<string, unknown> {
  const thumbnailUrl = resolveThumbnailUrl(
    body.thumbnailUrl as string | undefined,
    body.videoUrl as string | undefined,
  );
  if (thumbnailUrl !== undefined) {
    return { ...body, thumbnailUrl };
  }
  return body;
}

async function applyThumbnailFieldsForUpdate(
  id: string,
  body: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const existing = await Activity.findById(id).select("thumbnailUrl videoUrl").lean();
  if (!existing) return body;

  const thumbnailUrl = resolveThumbnailUrl(
    (body.thumbnailUrl as string | undefined) ?? existing.thumbnailUrl,
    (body.videoUrl as string | undefined) ?? existing.videoUrl,
  );

  if (thumbnailUrl !== undefined) {
    return { ...body, thumbnailUrl };
  }
  return body;
}

type AggregateRow = { _id: string; count: number };

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseQueryList(value: string | string[] | undefined): string[] {
  if (value === undefined) return [];
  const values = Array.isArray(value) ? value : [value];
  return values
    .flatMap((item) => item.split(","))
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseBucketRange(value: string | undefined): { min: number; max?: number } | undefined {
  if (!value) return undefined;
  if (value === "K-2") return { min: 0, max: 2 };
  if (value === "3-5") return { min: 3, max: 5 };
  if (value === "6-8") return { min: 6, max: 8 };
  if (value === "9-12") return { min: 9, max: 12 };
  if (value === "Small (3-15)") return { min: 3, max: 15 };
  if (value === "Medium (15-30)") return { min: 15, max: 30 };
  if (value === "Large (30+)") return { min: 30 };
  return undefined;
}

function parseActivitySort(value: string | undefined): string {
  if (value === "title" || value === "-title" || value === "-updatedAt") return value;
  return "-createdAt";
}

const UNTITLED_ACTIVITY_BASE = "Untitled Activity";

async function resolveDraftTitle(excludeActivityId?: string): Promise<string> {
  const filter: Record<string, unknown> = {
    title: new RegExp(`^${escapeRegex(UNTITLED_ACTIVITY_BASE)}(?:\\s+(\\d+))?$`),
  };

  if (excludeActivityId && isValidObjectId(excludeActivityId)) {
    filter._id = { $ne: excludeActivityId };
  }

  const activities = await Activity.find(filter).select("title").lean<{ title?: string }[]>();
  const usedNumbers = new Set<number>();

  activities.forEach((activity) => {
    const title = activity.title?.trim();
    if (!title) return;

    if (title === UNTITLED_ACTIVITY_BASE) {
      usedNumbers.add(1);
      return;
    }

    const match = /^Untitled Activity\s+(\d+)$/.exec(title);
    if (match?.[1]) {
      usedNumbers.add(Number(match[1]));
    }
  });

  let nextNumber = 1;
  while (usedNumbers.has(nextNumber)) {
    nextNumber += 1;
  }

  return `${UNTITLED_ACTIVITY_BASE} ${nextNumber}`;
}

async function applyDraftTitleDefaults(
  body: Record<string, unknown>,
  excludeActivityId?: string,
): Promise<Record<string, unknown>> {
  if (body.status !== "Draft") {
    return body;
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (title.length > 0) {
    return body;
  }

  return {
    ...body,
    title: await resolveDraftTitle(excludeActivityId),
  };
}

export async function listActivities(req: Request, res: Response) {
  const status = req.query.status as string | undefined;
  const search = req.query.search as string | undefined;
  const categories = parseQueryList(req.query.category as string | string[] | undefined);
  const durations = parseQueryList(req.query.duration as string | string[] | undefined);
  const gradeLevels = parseQueryList(req.query.gradeLevel as string | string[] | undefined);
  const groupSizes = parseQueryList(req.query.groupSize as string | string[] | undefined);
  const energyLevel = req.query.energyLevel as string | undefined;
  const environments = parseQueryList(req.query.environment as string | string[] | undefined);
  const setup = req.query.setup as string | undefined;
  const sort = parseActivitySort(req.query.sort as string | undefined);
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.max(1, Math.min(30, Number(req.query.limit) || 10));
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  const andFilters: Record<string, unknown>[] = [];
  if (status) filter.status = status;
  if (categories.length > 0) filter.category = { $in: categories };
  if (durations.length > 0) filter.duration = { $in: durations };
  if (energyLevel) filter.energyLevel = energyLevel;
  if (setup) filter.setup = setup;
  const gradeRangeFilters = gradeLevels
    .map((gradeLevel) => parseBucketRange(gradeLevel))
    .filter((range): range is { min: number; max?: number } => range !== undefined)
    .map((range) =>
      range.max === undefined
        ? { "gradeRange.min": { $gte: range.min } }
        : { "gradeRange.min": { $lte: range.max }, "gradeRange.max": { $gte: range.min } },
    );
  if (gradeRangeFilters.length > 0) {
    andFilters.push({ $or: gradeRangeFilters });
  }
  const groupSizeRangeFilters = groupSizes
    .map((groupSize) => parseBucketRange(groupSize))
    .filter((range): range is { min: number; max?: number } => range !== undefined)
    .map((range) =>
      range.max === undefined
        ? { "groupSize.max": { $gte: range.min } }
        : {
            "groupSize.min": { $lte: range.max },
            "groupSize.max": { $gte: range.min },
          },
    );
  if (groupSizeRangeFilters.length > 0) {
    andFilters.push({ $or: [{ "groupSize.anySize": true }, ...groupSizeRangeFilters] });
  }
  if (environments.length > 0) {
    filter.environment = { $in: environments };
  }
  if (search) {
    const escapedSearch = escapeRegex(search);
    const searchFilter = [
      { title: { $regex: escapedSearch, $options: "i" } },
      { overview: { $regex: escapedSearch, $options: "i" } },
    ];
    andFilters.push({ $or: searchFilter });
  }
  if (andFilters.length > 0) {
    filter.$and = andFilters;
  }

  const [activities, total] = await Promise.all([
    Activity.find(filter).sort(sort).skip(skip).limit(limit),
    Activity.countDocuments(filter),
  ]);

  res.json({
    activities,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit - 1e-10),
  });
}

export async function getActivity(req: Request, res: Response) {
  const id = routeParam(req.params.id);
  if (!isValidObjectId(id)) {
    res.status(400).json({ error: "Invalid activity id" });
    return;
  }

  const activity = await Activity.findById(id);
  if (!activity) {
    res.status(404).json({ error: "Activity not found" });
    return;
  }
  res.json(activity);
}

export async function createActivity(req: Request, res: Response) {
  const body = applyThumbnailFields(req.body as Record<string, unknown>);
  const draftBody = await applyDraftTitleDefaults({ ...body, status: "Draft" });
  const activity = await Activity.create(draftBody);
  res.status(201).json(activity);
}

export async function updateActivity(req: Request, res: Response) {
  const id = routeParam(req.params.id);
  const body = await applyThumbnailFieldsForUpdate(id, req.body as Record<string, unknown>);
  const draftBody = await applyDraftTitleDefaults(body, id);
  const activity = await Activity.findByIdAndUpdate(id, draftBody, {
    returnDocument: "after",
    runValidators: true,
  });
  if (!activity) {
    res.status(404).json({ error: "Activity not found" });
    return;
  }
  res.json(activity);
}

export async function updateActivityStatus(req: Request, res: Response) {
  const { status } = req.body as { status: string };
  if (!["Draft", "Published", "Archived"].includes(status)) {
    res.status(400).json({ error: "Invalid status. Must be Draft, Published, or Archived." });
    return;
  }

  const id = routeParam(req.params.id);
  const activity = await Activity.findByIdAndUpdate(
    id,
    { status },
    { returnDocument: "after", runValidators: true },
  );
  if (!activity) {
    res.status(404).json({ error: "Activity not found" });
    return;
  }
  res.json(activity);
}

export async function deleteActivity(req: Request, res: Response) {
  const id = routeParam(req.params.id);
  const activity = await Activity.findByIdAndDelete(id);
  if (!activity) {
    res.status(404).json({ error: "Activity not found" });
    return;
  }
  res.status(204).send();
}

export async function uploadMedia(req: Request, res: Response) {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }

  const activityId = routeParam(req.params.id);
  if (!isValidObjectId(activityId)) {
    res.status(400).json({ error: "Invalid activity id" });
    return;
  }

  const activity = await Activity.findById(activityId);
  if (!activity) {
    res.status(404).json({ error: "Activity not found" });
    return;
  }

  const fileUrl = await uploadActivityMedia(req.file, activityId);
  const body = (req.body ?? {}) as { mediaTarget?: string };
  const mediaTarget = body.mediaTarget;

  if (mediaTarget === "thumbnail") {
    await Activity.findByIdAndUpdate(activityId, { thumbnailUrl: fileUrl });
  } else if (mediaTarget === "additional") {
    await Activity.findByIdAndUpdate(activityId, {
      $push: { additionalMedia: { type: "image", url: fileUrl } },
    });
  } else {
    res.status(400).json({ error: "Invalid mediaTarget." });
    return;
  }

  const updated = await Activity.findById(activityId);
  res.json(updated);
}

export async function getActivityStats(_req: Request, res: Response) {
  const [categoryStats, statusCounts, totalCount] = await Promise.all([
    Activity.aggregate<AggregateRow>([
      { $unwind: "$category" },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Activity.aggregate<AggregateRow>([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Activity.countDocuments(),
  ]);

  const categories = categoryStats.map((s) => ({
    category: s._id,
    count: s.count,
    percentage: totalCount > 0 ? Math.round((s.count / totalCount) * 1000) / 10 : 0,
  }));

  const statuses = Object.fromEntries(statusCounts.map((s) => [s._id, s.count]));

  res.json({ total: totalCount, categories, statuses });
}
