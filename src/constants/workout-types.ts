export const EXERCISES_CATALOG_URL = 'https://connect.garmin.com/web-data/exercises/Exercises.json';
export const DEFAULT_POOL_LENGTH_METERS = 25;
export const DEFAULT_EXERCISE_SEARCH_LIMIT = 50;

export const WORKOUT_SPORT_TYPES = {
  swimming: { sportTypeId: 4, sportTypeKey: 'swimming' },
  strength_training: { sportTypeId: 5, sportTypeKey: 'strength_training' },
} as const;

export const WORKOUT_STEP_TYPE_IDS = {
  warmup: 1,
  cooldown: 2,
  interval: 3,
  recovery: 4,
  rest: 5,
  repeat: 6,
  other: 7,
  main: 8,
} as const;

export const WORKOUT_CONDITION_TYPE_IDS = {
  'lap.button': 1,
  time: 2,
  distance: 3,
  iterations: 7,
  'fixed.rest': 8,
  reps: 10,
} as const;

export const SWIM_STROKE_TYPE_IDS = {
  any_stroke: 1,
  backstroke: 2,
  breaststroke: 3,
  drill: 4,
  fly: 5,
  free: 6,
  individual_medley: 7,
  mixed: 8,
} as const;

export const SWIM_EQUIPMENT_TYPE_IDS = {
  fins: 1,
  kickboard: 2,
  paddles: 3,
  pull_buoy: 4,
  snorkel: 5,
} as const;

export const SWIM_DRILL_TYPE_IDS = {
  kick: 1,
  pull: 2,
  drill: 3,
} as const;

export const SWIM_INSTRUCTION_TYPE_IDS = {
  recovery: 1,
  very_easy: 2,
  easy: 3,
  moderate: 4,
  hard: 5,
  very_hard: 6,
  all_out: 7,
  fast: 8,
  ascend: 9,
  descend: 10,
} as const;

export const SWIM_INSTRUCTION_TARGET_TYPE = {
  workoutTargetTypeId: 18,
  workoutTargetTypeKey: 'swim.instruction',
} as const;

export const NO_TARGET_TYPE = {
  workoutTargetTypeId: 1,
  workoutTargetTypeKey: 'no.target',
} as const;
