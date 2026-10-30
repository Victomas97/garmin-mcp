import { z } from 'zod';
import { dateString } from '../constants';

const stepTypeEnum = z.enum(['warmup', 'cooldown', 'interval', 'recovery', 'rest', 'main', 'other']);

export type WorkoutStepType = 'warmup' | 'cooldown' | 'interval' | 'recovery' | 'rest' | 'main' | 'other';

export type SwimStrokeType =
  | 'any_stroke'
  | 'backstroke'
  | 'breaststroke'
  | 'drill'
  | 'fly'
  | 'free'
  | 'individual_medley'
  | 'mixed';

export type SwimEquipmentType = 'fins' | 'kickboard' | 'paddles' | 'pull_buoy' | 'snorkel';

export type SwimDrillType = 'kick' | 'pull' | 'drill';

export type SwimIntensity =
  | 'recovery'
  | 'very_easy'
  | 'easy'
  | 'moderate'
  | 'hard'
  | 'very_hard'
  | 'all_out'
  | 'fast'
  | 'ascend'
  | 'descend';

export type SwimStepDto = {
  type: 'step';
  stepType: WorkoutStepType;
  endCondition: 'distance' | 'time' | 'lap.button';
  value?: number;
  strokeType?: SwimStrokeType;
  drillType?: SwimDrillType;
  equipmentType?: SwimEquipmentType;
  intensity?: SwimIntensity;
  description?: string;
};

export type SwimRepeatDto = {
  type: 'repeat';
  iterations: number;
  skipLastRest?: boolean;
  steps: SwimStepDto[];
};

export type CreateSwimWorkoutDto = {
  name: string;
  description?: string;
  poolLength?: number;
  steps: (SwimStepDto | SwimRepeatDto)[];
  scheduleDate?: string;
};

const swimStepSchema = z.object({
  type: z.literal('step'),
  stepType: stepTypeEnum.describe('Step type. Use "rest" for rests between reps'),
  endCondition: z
    .enum(['distance', 'time', 'lap.button'])
    .describe(
      'How the step ends: "distance" (meters), "time" (seconds) or "lap.button" (open step, ends when pressing lap; the watch asks for the distance swum)',
    ),
  value: z
    .number()
    .positive()
    .optional()
    .describe('Meters for distance, seconds for time. Omit for lap.button'),
  strokeType: z
    .enum(['any_stroke', 'backstroke', 'breaststroke', 'drill', 'fly', 'free', 'individual_medley', 'mixed'])
    .optional()
    .describe('Swim stroke. Use "drill" together with drillType for technique work'),
  drillType: z.enum(['kick', 'pull', 'drill']).optional().describe('Drill type, only when strokeType is "drill"'),
  equipmentType: z
    .enum(['fins', 'kickboard', 'paddles', 'pull_buoy', 'snorkel'])
    .optional()
    .describe('Equipment used during the step'),
  intensity: z
    .enum(['recovery', 'very_easy', 'easy', 'moderate', 'hard', 'very_hard', 'all_out', 'fast', 'ascend', 'descend'])
    .optional()
    .describe('Swim intensity instruction shown on the watch'),
  description: z.string().optional().describe('Free text note shown on the watch (e.g. "RPE 3-4")'),
});

const swimRepeatSchema = z.object({
  type: z.literal('repeat'),
  iterations: z.number().int().min(1).max(99).describe('Number of repetitions of the group'),
  skipLastRest: z.boolean().optional().describe('Skip the final rest step on the last repetition. Defaults to true'),
  steps: z.array(swimStepSchema).min(1).describe('Steps repeated in the group'),
});

export const createSwimWorkoutSchema = z.object({
  name: z.string().min(1).describe('Workout name'),
  description: z.string().optional().describe('Workout description'),
  poolLength: z
    .number()
    .positive()
    .optional()
    .describe('Pool length in meters. Defaults to 25'),
  steps: z
    .array(z.discriminatedUnion('type', [swimStepSchema, swimRepeatSchema]))
    .min(1)
    .describe('Ordered workout steps. Each item is a single step or a repeat group of steps'),
  scheduleDate: dateString.optional().describe('Optional date (YYYY-MM-DD) to schedule the workout on the calendar'),
});

export type StrengthStepDto = {
  type: 'step';
  stepType: WorkoutStepType;
  endCondition: 'reps' | 'time' | 'lap.button';
  value?: number;
  category?: string;
  exerciseName?: string;
  weightKg?: number;
  description?: string;
};

export type StrengthRepeatDto = {
  type: 'repeat';
  iterations: number;
  skipLastRest?: boolean;
  steps: StrengthStepDto[];
};

export type CreateStrengthWorkoutDto = {
  name: string;
  description?: string;
  steps: (StrengthStepDto | StrengthRepeatDto)[];
  scheduleDate?: string;
};

const strengthStepSchema = z.object({
  type: z.literal('step'),
  stepType: stepTypeEnum.describe('Step type. Use "interval" for exercise sets and "rest" for rests'),
  endCondition: z
    .enum(['reps', 'time', 'lap.button'])
    .describe('How the step ends: "reps", "time" (seconds) or "lap.button"'),
  value: z
    .number()
    .positive()
    .optional()
    .describe('Number of reps or seconds. Omit for lap.button'),
  category: z
    .string()
    .optional()
    .describe('Garmin exercise category (e.g. "SQUAT"). Use search_exercises to find valid values'),
  exerciseName: z
    .string()
    .optional()
    .describe('Garmin exercise name within the category (e.g. "BARBELL_BACK_SQUAT"). Use search_exercises'),
  weightKg: z.number().positive().optional().describe('Load in kilograms'),
  description: z.string().optional().describe('Free text note shown on the watch (e.g. "RIR 2")'),
});

const strengthRepeatSchema = z.object({
  type: z.literal('repeat'),
  iterations: z.number().int().min(1).max(99).describe('Number of sets (repetitions of the group)'),
  skipLastRest: z.boolean().optional().describe('Skip the final rest step on the last set. Defaults to false'),
  steps: z.array(strengthStepSchema).min(1).describe('Steps repeated in each set (exercise, rest, ...)'),
});

export const createStrengthWorkoutSchema = z.object({
  name: z.string().min(1).describe('Workout name'),
  description: z.string().optional().describe('Workout description'),
  steps: z
    .array(z.discriminatedUnion('type', [strengthStepSchema, strengthRepeatSchema]))
    .min(1)
    .describe('Ordered workout steps. Each item is a single step or a repeat group (sets)'),
  scheduleDate: dateString.optional().describe('Optional date (YYYY-MM-DD) to schedule the workout on the calendar'),
});

export type SearchExercisesDto = {
  query?: string;
  category?: string;
  muscle?: string;
  limit?: number;
};

export const searchExercisesSchema = z.object({
  query: z
    .string()
    .optional()
    .describe('Text to search in exercise names (e.g. "bench", "romanian deadlift")'),
  category: z.string().optional().describe('Exact Garmin category (e.g. "SQUAT", "ROW", "CORE")'),
  muscle: z.string().optional().describe('Primary or secondary muscle (e.g. "GLUTES", "CHEST", "CORE")'),
  limit: z.number().int().min(1).max(500).optional().describe('Maximum results. Defaults to 50'),
});

export type ScheduleWorkoutDto = {
  workoutId: number;
  date: string;
};

export const scheduleWorkoutSchema = z.object({
  workoutId: z.number().positive().describe('The workout ID'),
  date: dateString.describe('Date in YYYY-MM-DD format'),
});

export type ListScheduledWorkoutsDto = {
  startDate: string;
  endDate: string;
};

export const listScheduledWorkoutsSchema = z.object({
  startDate: dateString.describe('Start date in YYYY-MM-DD format'),
  endDate: dateString.describe('End date in YYYY-MM-DD format'),
});

export type UnscheduleWorkoutDto = {
  scheduleId: number;
};

export const unscheduleWorkoutSchema = z.object({
  scheduleId: z.number().positive().describe('The scheduleId from list_scheduled_workouts (or workoutScheduleId returned when scheduling)'),
});

export type DeleteWorkoutDto = {
  workoutId: number;
};

export const deleteWorkoutSchema = z.object({
  workoutId: z.number().positive().describe('The workout ID to delete'),
});
