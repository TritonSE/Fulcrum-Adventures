import { body, query } from "express-validator";

import {
  ACTIVITY_CATEGORIES,
  ACTIVITY_DURATIONS,
  ACTIVITY_ENERGY_LEVELS,
  ACTIVITY_ENVIRONMENTS,
  ACTIVITY_SETUPS,
  ACTIVITY_SORT_FIELDS,
  ACTIVITY_STATUSES,
} from "../constants/activity";

import type { ValidationChain } from "express-validator";

const GRADE_LEVELS = ["K-2", "3-5", "6-8", "9-12"] as const;
const GROUP_SIZES = ["Small (3-15)", "Medium (15-30)", "Large (30+)"] as const;

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function categoryItemsValidator(value: unknown): boolean {
  if (!isStringArray(value)) return false;
  return value.every((item) => (ACTIVITY_CATEGORIES as readonly string[]).includes(item));
}

function environmentItemsValidator(value: unknown): boolean {
  if (!isStringArray(value)) return false;
  return value.every((item) => (ACTIVITY_ENVIRONMENTS as readonly string[]).includes(item));
}

function parsePositiveInt(value: unknown): number | null {
  if (typeof value === "number" && Number.isInteger(value) && value >= 1) {
    return value;
  }
  if (typeof value === "string" && /^\d+$/.test(value)) {
    const parsed = Number(value);
    if (parsed >= 1) return parsed;
  }
  return null;
}

function validateGroupSize(value: unknown): boolean {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("groupSize must be an object.");
  }

  const groupSize = value as { min?: unknown; max?: unknown; anySize?: unknown };

  if (groupSize.anySize !== undefined && typeof groupSize.anySize !== "boolean") {
    throw new Error("groupSize.anySize must be a boolean.");
  }

  if (groupSize.anySize === true) {
    return true;
  }

  const min = parsePositiveInt(groupSize.min);
  const max = parsePositiveInt(groupSize.max);
  if (min === null) {
    throw new Error("groupSize.min must be a positive integer.");
  }
  if (max === null) {
    throw new Error("groupSize.max must be a positive integer.");
  }
  if (min > max) {
    throw new Error("groupSize.min cannot be greater than groupSize.max.");
  }

  return true;
}

// Normalizes a query param that may arrive as a single string or string[]
// (express parses repeated keys as string[] automatically when using query())
function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string") return [value];
  return [];
}

const optionalActivityBodyFields: ValidationChain[] = [
  body("thumbnailUrl").optional().isString(),
  body("videoUrl").optional().isString(),
  body("objective").optional().isString(),
  body("category")
    .optional()
    .isArray({ min: 1, max: 3 })
    .withMessage("category must have between 1 and 3 items.")
    .custom(categoryItemsValidator)
    .withMessage(`category must be one of: ${ACTIVITY_CATEGORIES.join(", ")}.`),
  body("gradeRange").optional().isObject().withMessage("gradeRange must be an object."),
  body("gradeRange.min")
    .optional()
    .isInt({ min: 0, max: 12 })
    .withMessage("gradeRange.min must be between 0 and 12."),
  body("gradeRange.max")
    .optional()
    .isInt({ min: 0, max: 12 })
    .withMessage("gradeRange.max must be between 0 and 12."),
  body("groupSize").optional().custom(validateGroupSize),
  body("duration")
    .optional()
    .isString()
    .isIn(ACTIVITY_DURATIONS)
    .withMessage(`duration must be one of: ${ACTIVITY_DURATIONS.join(", ")}.`),
  body("energyLevel")
    .optional()
    .isString()
    .isIn(ACTIVITY_ENERGY_LEVELS)
    .withMessage(`energyLevel must be one of: ${ACTIVITY_ENERGY_LEVELS.join(", ")}.`),
  body("environment")
    .optional()
    .isArray({ min: 1 })
    .custom(environmentItemsValidator)
    .withMessage(`environment must be one of: ${ACTIVITY_ENVIRONMENTS.join(", ")}.`),
  body("setup")
    .optional()
    .isString()
    .isIn(ACTIVITY_SETUPS)
    .withMessage(`setup must be one of: ${ACTIVITY_SETUPS.join(", ")}.`),
  body("facilitateSections").optional().isArray(),
  body("facilitateSections.*.tabName")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("facilitateSections tabName is required."),
  body("facilitateSections.*.content")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("facilitateSections content is required."),
  body("materials").optional().isArray(),
  body("materials.*").optional().isString(),
  body("selTags").optional().isArray(),
  body("selTags.*").optional().isString(),
  body("status")
    .optional()
    .isString()
    .isIn(ACTIVITY_STATUSES)
    .withMessage(`status must be one of: ${ACTIVITY_STATUSES.join(", ")}.`),
];

const optionalCreateOnlyFields: ValidationChain[] = [
  body("thumbnailUrl").optional().isString(),
  body("videoUrl").optional().isString(),
  body("objective").optional().isString(),
  body("environment")
    .optional()
    .isArray({ min: 1 })
    .custom(environmentItemsValidator)
    .withMessage(`environment must be one of: ${ACTIVITY_ENVIRONMENTS.join(", ")}.`),
  body("setup")
    .optional()
    .isString()
    .isIn(ACTIVITY_SETUPS)
    .withMessage(`setup must be one of: ${ACTIVITY_SETUPS.join(", ")}.`),
  body("facilitateSections").optional().isArray(),
  body("facilitateSections.*.tabName")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("facilitateSections tabName is required."),
  body("facilitateSections.*.content")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("facilitateSections content is required."),
  body("materials").optional().isArray(),
  body("materials.*").optional().isString(),
  body("selTags").optional().isArray(),
  body("selTags.*").optional().isString(),
];

export const listActivitiesQuery: ValidationChain[] = [
  query("status")
    .optional()
    .isString()
    .isIn(ACTIVITY_STATUSES)
    .withMessage(`status must be one of: ${ACTIVITY_STATUSES.join(", ")}.`),
  query("search").optional().isString().withMessage("search must be a string."),

  // Accepts repeated keys: category=Opener&category=Active
  query("category")
    .optional()
    .customSanitizer(toStringArray)
    .custom((values: string[]) => {
      if (values.length === 0) throw new Error("category must include at least one value.");
      const invalid = values.filter((v) => !(ACTIVITY_CATEGORIES as readonly string[]).includes(v));
      if (invalid.length > 0) {
        throw new Error(
          `Invalid category: ${invalid.join(", ")}. Must be one of: ${ACTIVITY_CATEGORIES.join(", ")}.`,
        );
      }
      return true;
    }),

  query("duration")
    .optional()
    .customSanitizer(toStringArray)
    .custom((values: string[]) => {
      if (values.length === 0) throw new Error("duration must include at least one value.");
      const invalid = values.filter((v) => !(ACTIVITY_DURATIONS as readonly string[]).includes(v));
      if (invalid.length > 0) {
        throw new Error(
          `Invalid duration: ${invalid.join(", ")}. Must be one of: ${ACTIVITY_DURATIONS.join(", ")}.`,
        );
      }
      return true;
    }),

  query("gradeLevel")
    .optional()
    .customSanitizer(toStringArray)
    .custom((values: string[]) => {
      if (values.length === 0) throw new Error("gradeLevel must include at least one value.");
      const invalid = values.filter((v) => !(GRADE_LEVELS as readonly string[]).includes(v));
      if (invalid.length > 0) {
        throw new Error(
          `Invalid gradeLevel: ${invalid.join(", ")}. Must be one of: ${GRADE_LEVELS.join(", ")}.`,
        );
      }
      return true;
    }),

  query("groupSize")
    .optional()
    .customSanitizer(toStringArray)
    .custom((values: string[]) => {
      if (values.length === 0) throw new Error("groupSize must include at least one value.");
      const invalid = values.filter((v) => !(GROUP_SIZES as readonly string[]).includes(v));
      if (invalid.length > 0) {
        throw new Error(
          `Invalid groupSize: ${invalid.join(", ")}. Must be one of: ${GROUP_SIZES.join(", ")}.`,
        );
      }
      return true;
    }),

  query("energyLevel")
    .optional()
    .isString()
    .isIn(ACTIVITY_ENERGY_LEVELS)
    .withMessage(`energyLevel must be one of: ${ACTIVITY_ENERGY_LEVELS.join(", ")}.`),
  query("environment")
    .optional()
    .customSanitizer(toStringArray)
    .custom((values: string[]) => {
      if (values.length === 0) throw new Error("environment must include at least one value.");
      const invalid = values.filter(
        (v) => !(ACTIVITY_ENVIRONMENTS as readonly string[]).includes(v),
      );
      if (invalid.length > 0) {
        throw new Error(
          `Invalid environment: ${invalid.join(", ")}. Must be one of: ${ACTIVITY_ENVIRONMENTS.join(", ")}.`,
        );
      }
      return true;
    }),
  query("setup")
    .optional()
    .isString()
    .isIn(ACTIVITY_SETUPS)
    .withMessage(`setup must be one of: ${ACTIVITY_SETUPS.join(", ")}.`),
  query("sort")
    .optional()
    .isString()
    .custom((value: string) => {
      const field = value.startsWith("-") ? value.slice(1) : value;
      if (!(ACTIVITY_SORT_FIELDS as readonly string[]).includes(field)) {
        throw new Error(`Invalid sort field. Allowed: ${ACTIVITY_SORT_FIELDS.join(", ")}.`);
      }
      return true;
    }),
  query("page").optional().isInt({ min: 1 }).withMessage("page must be a positive integer."),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 30 })
    .withMessage("limit must be between 1 and 30."),
];

export const createActivityBody: ValidationChain[] = [
  body("title").isString().trim().notEmpty().withMessage("title is required."),
  body("overview").isString().trim().notEmpty().withMessage("overview is required."),
  body("category")
    .isArray({ min: 1, max: 3 })
    .withMessage("category must have between 1 and 3 items.")
    .custom(categoryItemsValidator)
    .withMessage(`category must be one of: ${ACTIVITY_CATEGORIES.join(", ")}.`),
  body("gradeRange").isObject().withMessage("gradeRange is required."),
  body("gradeRange.min")
    .isInt({ min: 0, max: 12 })
    .withMessage("gradeRange.min must be between 0 and 12."),
  body("gradeRange.max")
    .isInt({ min: 0, max: 12 })
    .withMessage("gradeRange.max must be between 0 and 12."),
  body("groupSize").custom(validateGroupSize),
  body("duration")
    .isString()
    .isIn(ACTIVITY_DURATIONS)
    .withMessage(`duration must be one of: ${ACTIVITY_DURATIONS.join(", ")}.`),
  body("energyLevel")
    .isString()
    .isIn(ACTIVITY_ENERGY_LEVELS)
    .withMessage(`energyLevel must be one of: ${ACTIVITY_ENERGY_LEVELS.join(", ")}.`),
  ...optionalCreateOnlyFields,
];

export const updateActivityBody: ValidationChain[] = [
  body("title").optional().isString().trim().notEmpty().withMessage("title cannot be empty."),
  body("overview").optional().isString().trim().notEmpty().withMessage("overview cannot be empty."),
  ...optionalActivityBodyFields,
];
