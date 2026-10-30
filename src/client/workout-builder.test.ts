import { describe, it, expect } from 'vitest';
import { buildSwimWorkout, buildStrengthWorkout } from './workout-builder';
import type { CreateSwimWorkoutDto, CreateStrengthWorkoutDto } from '../dtos';

type Step = Record<string, any>;

function getSteps(workout: Record<string, unknown>): Step[] {
  return (workout.workoutSegments as Step[])[0]!.workoutSteps as Step[];
}

describe('buildSwimWorkout', () => {
  const dto: CreateSwimWorkoutDto = {
    name: 'Swim',
    description: 'Aerobic',
    steps: [
      { type: 'step', stepType: 'warmup', endCondition: 'distance', value: 200, strokeType: 'free', description: 'RPE 2' },
      {
        type: 'repeat',
        iterations: 4,
        steps: [
          { type: 'step', stepType: 'interval', endCondition: 'lap.button', strokeType: 'drill', drillType: 'kick', equipmentType: 'kickboard' },
          { type: 'step', stepType: 'rest', endCondition: 'time', value: 20 },
        ],
      },
      {
        type: 'repeat',
        iterations: 6,
        skipLastRest: false,
        steps: [
          { type: 'step', stepType: 'interval', endCondition: 'distance', value: 100, intensity: 'moderate', equipmentType: 'pull_buoy' },
          { type: 'step', stepType: 'rest', endCondition: 'lap.button' },
        ],
      },
      { type: 'step', stepType: 'cooldown', endCondition: 'time', value: 120 },
    ],
  };

  const workout = buildSwimWorkout(dto);
  const steps = getSteps(workout);

  it('sets swimming sport type, name, description and default 25m pool', () => {
    expect(workout.workoutName).toBe('Swim');
    expect(workout.description).toBe('Aerobic');
    expect(workout.sportType).toEqual({ sportTypeId: 4, sportTypeKey: 'swimming' });
    expect(workout.poolLength).toBe(25);
    expect(workout.poolLengthUnit).toMatchObject({ unitKey: 'meter' });
    expect((workout.workoutSegments as Step[])[0]!.sportType).toEqual(workout.sportType);
  });

  it('uses custom pool length', () => {
    expect(buildSwimWorkout({ ...dto, poolLength: 50 }).poolLength).toBe(50);
  });

  it('numbers steps sequentially including repeat groups and children', () => {
    expect(steps.map((s) => s.stepOrder)).toEqual([1, 2, 5, 8]);
    expect(steps[1]!.workoutSteps.map((s: Step) => s.stepOrder)).toEqual([3, 4]);
    expect(steps[2]!.workoutSteps.map((s: Step) => s.stepOrder)).toEqual([6, 7]);
  });

  it('builds a distance step with stroke and meter unit', () => {
    expect(steps[0]).toMatchObject({
      type: 'ExecutableStepDTO',
      stepType: { stepTypeId: 1, stepTypeKey: 'warmup' },
      endCondition: { conditionTypeId: 3, conditionTypeKey: 'distance' },
      endConditionValue: 200,
      preferredEndConditionUnit: { unitKey: 'meter' },
      strokeType: { strokeTypeId: 6, strokeTypeKey: 'free' },
      equipmentType: { equipmentTypeId: 0 },
      description: 'RPE 2',
    });
  });

  it('builds repeat groups with iterations and childStepId', () => {
    expect(steps[1]).toMatchObject({
      type: 'RepeatGroupDTO',
      stepType: { stepTypeId: 6, stepTypeKey: 'repeat' },
      endCondition: { conditionTypeId: 7, conditionTypeKey: 'iterations' },
      numberOfIterations: 4,
      endConditionValue: 4,
      childStepId: 1,
    });
    expect(steps[2]!.childStepId).toBe(2);
    expect(steps[1]!.workoutSteps.every((s: Step) => s.childStepId === 1)).toBe(true);
  });

  it('defaults skipLastRestStep to true for swim and honors override', () => {
    expect(steps[1]!.skipLastRestStep).toBe(true);
    expect(steps[2]!.skipLastRestStep).toBe(false);
  });

  it('builds a lap button drill step with drill type and equipment', () => {
    expect(steps[1]!.workoutSteps[0]).toMatchObject({
      endCondition: { conditionTypeId: 1, conditionTypeKey: 'lap.button' },
      endConditionValue: null,
      preferredEndConditionUnit: null,
      strokeType: { strokeTypeId: 4, strokeTypeKey: 'drill' },
      drillType: { drillTypeId: 1, drillTypeKey: 'kick' },
      equipmentType: { equipmentTypeId: 2, equipmentTypeKey: 'kickboard' },
    });
  });

  it('maps timed rest to fixed.rest', () => {
    expect(steps[1]!.workoutSteps[1]).toMatchObject({
      stepType: { stepTypeId: 5, stepTypeKey: 'rest' },
      endCondition: { conditionTypeId: 8, conditionTypeKey: 'fixed.rest' },
      endConditionValue: 20,
    });
  });

  it('keeps lap button rest as lap.button', () => {
    expect(steps[2]!.workoutSteps[1].endCondition).toMatchObject({ conditionTypeKey: 'lap.button' });
  });

  it('keeps time condition on non rest steps', () => {
    expect(steps[3]).toMatchObject({
      endCondition: { conditionTypeId: 2, conditionTypeKey: 'time' },
      endConditionValue: 120,
      preferredEndConditionUnit: null,
    });
  });

  it('sets swim instruction intensity as secondary target', () => {
    expect(steps[2]!.workoutSteps[0]).toMatchObject({
      targetType: { workoutTargetTypeKey: 'no.target' },
      secondaryTargetType: { workoutTargetTypeId: 18, workoutTargetTypeKey: 'swim.instruction' },
      secondaryTargetValueOne: 4,
      equipmentType: { equipmentTypeId: 4, equipmentTypeKey: 'pull_buoy' },
    });
    expect(steps[0]!.secondaryTargetType).toBeNull();
  });

  it('throws when value is missing for distance or time', () => {
    expect(() =>
      buildSwimWorkout({ name: 'x', steps: [{ type: 'step', stepType: 'interval', endCondition: 'distance' }] }),
    ).toThrow(/"value" is required/);
  });

  it('throws when drillType is used without drill stroke', () => {
    expect(() =>
      buildSwimWorkout({
        name: 'x',
        steps: [{ type: 'step', stepType: 'interval', endCondition: 'lap.button', strokeType: 'free', drillType: 'kick' }],
      }),
    ).toThrow(/drillType requires strokeType "drill"/);
  });
});

describe('buildStrengthWorkout', () => {
  const dto: CreateStrengthWorkoutDto = {
    name: 'Gym',
    steps: [
      { type: 'step', stepType: 'warmup', endCondition: 'time', value: 300, category: 'CARDIO', exerciseName: 'JUMP_ROPE' },
      {
        type: 'repeat',
        iterations: 3,
        steps: [
          { type: 'step', stepType: 'interval', endCondition: 'reps', value: 8, category: 'SQUAT', exerciseName: 'BARBELL_BACK_SQUAT', weightKg: 60, description: 'RIR 2' },
          { type: 'step', stepType: 'rest', endCondition: 'time', value: 90 },
        ],
      },
      { type: 'step', stepType: 'rest', endCondition: 'lap.button' },
    ],
  };

  const workout = buildStrengthWorkout(dto);
  const steps = getSteps(workout);

  it('sets strength sport type without pool fields', () => {
    expect(workout.sportType).toEqual({ sportTypeId: 5, sportTypeKey: 'strength_training' });
    expect(workout.description).toBeNull();
    expect(workout).not.toHaveProperty('poolLength');
  });

  it('builds a reps step with exercise and load in kg', () => {
    expect(steps[1]!.workoutSteps[0]).toMatchObject({
      endCondition: { conditionTypeId: 10, conditionTypeKey: 'reps' },
      endConditionValue: 8,
      category: 'SQUAT',
      exerciseName: 'BARBELL_BACK_SQUAT',
      weightValue: 60,
      weightUnit: { unitKey: 'kilogram' },
      description: 'RIR 2',
    });
  });

  it('keeps timed rest as time condition (not fixed.rest)', () => {
    expect(steps[1]!.workoutSteps[1]).toMatchObject({
      stepType: { stepTypeKey: 'rest' },
      endCondition: { conditionTypeId: 2, conditionTypeKey: 'time' },
      endConditionValue: 90,
      category: null,
      exerciseName: null,
      weightValue: null,
      weightUnit: null,
    });
  });

  it('defaults skipLastRestStep to false for strength', () => {
    expect(steps[1]!.skipLastRestStep).toBe(false);
  });

  it('builds lap button step without value', () => {
    expect(steps[2]).toMatchObject({ endCondition: { conditionTypeKey: 'lap.button' }, endConditionValue: null });
  });

  it('throws when category is given without exerciseName', () => {
    expect(() =>
      buildStrengthWorkout({
        name: 'x',
        steps: [{ type: 'step', stepType: 'interval', endCondition: 'reps', value: 5, category: 'SQUAT' }],
      }),
    ).toThrow(/category and exerciseName must be provided together/);
  });

  it('throws when reps value is missing', () => {
    expect(() =>
      buildStrengthWorkout({ name: 'x', steps: [{ type: 'step', stepType: 'interval', endCondition: 'reps' }] }),
    ).toThrow(/"value" is required/);
  });
});
