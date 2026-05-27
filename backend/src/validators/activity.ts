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
  body("groupSize").optional().isObject().withMessage("groupSize must be an object."),
  body("groupSize.min")
    .optional()
    .isInt({ min: 1 })
    .withMessage("groupSize.min must be a positive integer."),
  body("groupSize.max")
    .optional()
    .isInt({ min: 1 })
    .withMessage("groupSize.max must be a positive integer."),
  body("groupSize.anySize").optional().isBoolean(),
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
  body("groupSize.anySize").optional().isBoolean(),
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
  query("category")
    .optional()
    .isString()
    .isIn(ACTIVITY_CATEGORIES)
    .withMessage(`category must be one of: ${ACTIVITY_CATEGORIES.join(", ")}.`),
  query("energyLevel")
    .optional()
    .isString()
    .isIn(ACTIVITY_ENERGY_LEVELS)
    .withMessage(`energyLevel must be one of: ${ACTIVITY_ENERGY_LEVELS.join(", ")}.`),
  query("environment")
    .optional()
    .isString()
    .custom((value: string) => {
      const environments = value
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean);
      if (environments.length === 0) {
        throw new Error("environment must include at least one value.");
      }
      const invalid = environments.filter(
        (part) => !(ACTIVITY_ENVIRONMENTS as readonly string[]).includes(part),
      );
      if (invalid.length > 0) {
        throw new Error(`Invalid environment: ${invalid.join(", ")}.`);
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
  body("groupSize").isObject().withMessage("groupSize is required."),
  body("groupSize.min").isInt({ min: 1 }).withMessage("groupSize.min must be a positive integer."),
  body("groupSize.max").isInt({ min: 1 }).withMessage("groupSize.max must be a positive integer."),
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
