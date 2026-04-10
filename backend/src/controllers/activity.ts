import Activity from "../models/activity";

import type { Request, Response } from "express";

type AggregateRow = { _id: string; count: number };

export async function listActivities(req: Request, res: Response) {
  const status = req.query.status as string | undefined;
  const search = req.query.search as string | undefined;
  const category = req.query.category as string | undefined;
  const sort = (req.query.sort as string) || "-createdAt";
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 10));
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { overview: { $regex: search, $options: "i" } },
    ];
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
    totalPages: Math.ceil(total / limit),
  });
}

export async function getActivity(req: Request, res: Response) {
  const activity = await Activity.findById(req.params.id);
  if (!activity) {
    res.status(404).json({ error: "Activity not found" });
    return;
  }
  res.json(activity);
}

export async function createActivity(req: Request, res: Response) {
  const body = req.body as Record<string, unknown>;
  const activity = await Activity.create({ ...body, status: "Draft" });
  res.status(201).json(activity);
}

export async function updateActivity(req: Request, res: Response) {
  const body = req.body as Record<string, unknown>;
  const activity = await Activity.findByIdAndUpdate(req.params.id, body, {
    new: true,
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

  const activity = await Activity.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true },
  );
  if (!activity) {
    res.status(404).json({ error: "Activity not found" });
    return;
  }
  res.json(activity);
}

export async function deleteActivity(req: Request, res: Response) {
  const activity = await Activity.findByIdAndDelete(req.params.id);
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

  const activity = await Activity.findById(req.params.id);
  if (!activity) {
    res.status(404).json({ error: "Activity not found" });
    return;
  }

  const fileUrl = `/uploads/activities/${req.file.filename}`;
  const body = req.body as { mediaTarget?: string; mediaType?: string };

  if (body.mediaTarget === "thumbnail") {
    await Activity.findByIdAndUpdate(req.params.id, { thumbnailUrl: fileUrl });
  } else {
    const mediaType = body.mediaType === "video" ? "video" : "image";
    await Activity.findByIdAndUpdate(req.params.id, {
      $push: { additionalMedia: { type: mediaType, url: fileUrl } },
    });
  }

  const updated = await Activity.findById(req.params.id);
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
