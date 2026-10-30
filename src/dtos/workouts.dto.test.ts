import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  createSwimWorkoutSchema,
  createStrengthWorkoutSchema,
  searchExercisesSchema,
  scheduleWorkoutSchema,
} from './workouts.dto';

describe('createSwimWorkoutSchema', () => {
  const valid = {
    name: 'Swim',
    steps: [
      { type: 'step', stepType: 'warmup', endCondition: 'distance', value: 200, strokeType: 'free' },
      {
        type: 'repeat',
        iterations: 4,
        steps: [
          { type: 'step', stepType: 'interval', endCondition: 'lap.button', strokeType: 'drill', drillType: 'kick' },
          { type: 'step', stepType: 'rest', endCondition: 'time', value: 20 },
        ],
      },
    ],
    scheduleDate: '2026-12-31',
  };

  it('accepts a valid workout', () => {
    expect(createSwimWorkoutSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects empty steps', () => {
    expect(createSwimWorkoutSchema.safeParse({ ...valid, steps: [] }).success).toBe(false);
  });

  it('rejects strength-only end conditions', () => {
    const steps = [{ type: 'step', stepType: 'interval', endCondition: 'reps', value: 8 }];
    expect(createSwimWorkoutSchema.safeParse({ ...valid, steps }).success).toBe(false);
  });

  it('rejects unknown stroke and equipment', () => {
    const stroke = [{ type: 'step', stepType: 'interval', endCondition: 'lap.button', strokeType: 'doggy' }];
    const equipment = [{ type: 'step', stepType: 'interval', endCondition: 'lap.button', equipmentType: 'boat' }];
    expect(createSwimWorkoutSchema.safeParse({ ...valid, steps: stroke }).success).toBe(false);
    expect(createSwimWorkoutSchema.safeParse({ ...valid, steps: equipment }).success).toBe(false);
  });

  it('rejects nested repeat groups', () => {
    const steps = [{ type: 'repeat', iterations: 2, steps: [{ type: 'repeat', iterations: 2, steps: [] }] }];
    expect(createSwimWorkoutSchema.safeParse({ ...valid, steps }).success).toBe(false);
  });

  it('rejects invalid iterations and schedule date', () => {
    const steps = [{ type: 'repeat', iterations: 0, steps: valid.steps[1]!.steps }];
    expect(createSwimWorkoutSchema.safeParse({ ...valid, steps }).success).toBe(false);
    expect(createSwimWorkoutSchema.safeParse({ ...valid, scheduleDate: '31/12/2026' }).success).toBe(false);
  });
});

describe('createStrengthWorkoutSchema', () => {
  const valid = {
    name: 'Gym',
    steps: [
      {
        type: 'repeat',
        iterations: 3,
        steps: [
          { type: 'step', stepType: 'interval', endCondition: 'reps', value: 8, category: 'SQUAT', exerciseName: 'BARBELL_BACK_SQUAT', weightKg: 60 },
          { type: 'step', stepType: 'rest', endCondition: 'time', value: 90 },
        ],
      },
    ],
  };

  it('accepts a valid workout', () => {
    expect(createStrengthWorkoutSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects swim-only end conditions', () => {
    const steps = [{ type: 'step', stepType: 'interval', endCondition: 'distance', value: 100 }];
    expect(createStrengthWorkoutSchema.safeParse({ ...valid, steps }).success).toBe(false);
  });

  it('rejects non positive weight', () => {
    const steps = [{ type: 'step', stepType: 'interval', endCondition: 'reps', value: 8, weightKg: 0 }];
    expect(createStrengthWorkoutSchema.safeParse({ ...valid, steps }).success).toBe(false);
  });
});

describe('searchExercisesSchema', () => {
  it('accepts empty params and rejects out of range limit', () => {
    expect(searchExercisesSchema.safeParse({}).success).toBe(true);
    expect(searchExercisesSchema.safeParse({ limit: 0 }).success).toBe(false);
    expect(searchExercisesSchema.safeParse({ limit: 501 }).success).toBe(false);
  });
});

describe('scheduleWorkoutSchema', () => {
  it('requires a positive workoutId and YYYY-MM-DD date', () => {
    expect(scheduleWorkoutSchema.safeParse({ workoutId: 1, date: '2026-10-06' }).success).toBe(true);
    expect(scheduleWorkoutSchema.safeParse({ workoutId: -1, date: '2026-10-06' }).success).toBe(false);
    expect(scheduleWorkoutSchema.safeParse({ workoutId: 1, date: '2026-10-6' }).success).toBe(false);
  });
});

describe('MCP input schema shape', () => {
  it('works when rebuilt from .shape as registerTool does', () => {
    const rebuilt = z.object(createSwimWorkoutSchema.shape);
    expect(rebuilt.safeParse({ name: 'x', steps: [{ type: 'step', stepType: 'rest', endCondition: 'lap.button' }] }).success).toBe(true);
  });
});
