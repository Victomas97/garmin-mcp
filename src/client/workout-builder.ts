import {
  WORKOUT_SPORT_TYPES,
  WORKOUT_STEP_TYPE_IDS,
  WORKOUT_CONDITION_TYPE_IDS,
  SWIM_STROKE_TYPE_IDS,
  SWIM_EQUIPMENT_TYPE_IDS,
  SWIM_DRILL_TYPE_IDS,
  SWIM_INSTRUCTION_TYPE_IDS,
  SWIM_INSTRUCTION_TARGET_TYPE,
  NO_TARGET_TYPE,
  DEFAULT_POOL_LENGTH_METERS,
} from '../constants/workout-types';
import type {
  CreateSwimWorkoutDto,
  CreateStrengthWorkoutDto,
  SwimStepDto,
  StrengthStepDto,
  WorkoutStepType,
} from '../dtos';

type ConditionKey = keyof typeof WORKOUT_CONDITION_TYPE_IDS;
type SportType = (typeof WORKOUT_SPORT_TYPES)[keyof typeof WORKOUT_SPORT_TYPES];
type GarminStep = Record<string, unknown>;

const METER_UNIT = { unitId: 1, unitKey: 'meter', factor: 100 };
const KILOGRAM_UNIT = { unitKey: 'kilogram' };

function buildStepType(stepType: WorkoutStepType | 'repeat'): Record<string, unknown> {
  return { stepTypeId: WORKOUT_STEP_TYPE_IDS[stepType], stepTypeKey: stepType };
}

function buildCondition(condition: ConditionKey): Record<string, unknown> {
  return { conditionTypeId: WORKOUT_CONDITION_TYPE_IDS[condition], conditionTypeKey: condition };
}

function resolveEndValue(endCondition: string, value: number | undefined, stepIndex: number): number | null {
  if (endCondition === 'lap.button') return null;
  if (value === undefined) {
    throw new Error(`Step ${stepIndex}: "value" is required when endCondition is "${endCondition}"`);
  }
  return value;
}

function buildSwimStep(step: SwimStepDto, stepOrder: number): GarminStep {
  const isRest = step.stepType === 'rest';
  const condition: ConditionKey = isRest && step.endCondition === 'time' ? 'fixed.rest' : step.endCondition;

  if (step.drillType && step.strokeType !== 'drill') {
    throw new Error(`Step ${stepOrder}: drillType requires strokeType "drill"`);
  }

  return {
    type: 'ExecutableStepDTO',
    stepOrder,
    stepType: buildStepType(step.stepType),
    description: step.description ?? null,
    endCondition: buildCondition(condition),
    endConditionValue: resolveEndValue(step.endCondition, step.value, stepOrder),
    preferredEndConditionUnit: step.endCondition === 'distance' ? METER_UNIT : null,
    targetType: NO_TARGET_TYPE,
    strokeType: step.strokeType
      ? { strokeTypeId: SWIM_STROKE_TYPE_IDS[step.strokeType], strokeTypeKey: step.strokeType }
      : { strokeTypeId: 0 },
    drillType: step.drillType
      ? { drillTypeId: SWIM_DRILL_TYPE_IDS[step.drillType], drillTypeKey: step.drillType }
      : null,
    equipmentType: step.equipmentType
      ? { equipmentTypeId: SWIM_EQUIPMENT_TYPE_IDS[step.equipmentType], equipmentTypeKey: step.equipmentType }
      : { equipmentTypeId: 0 },
    secondaryTargetType: step.intensity ? SWIM_INSTRUCTION_TARGET_TYPE : null,
    secondaryTargetValueOne: step.intensity ? SWIM_INSTRUCTION_TYPE_IDS[step.intensity] : null,
  };
}

function buildStrengthStep(step: StrengthStepDto, stepOrder: number): GarminStep {
  if ((step.category && !step.exerciseName) || (!step.category && step.exerciseName)) {
    throw new Error(`Step ${stepOrder}: category and exerciseName must be provided together`);
  }

  return {
    type: 'ExecutableStepDTO',
    stepOrder,
    stepType: buildStepType(step.stepType),
    description: step.description ?? null,
    endCondition: buildCondition(step.endCondition),
    endConditionValue: resolveEndValue(step.endCondition, step.value, stepOrder),
    targetType: NO_TARGET_TYPE,
    category: step.category ?? null,
    exerciseName: step.exerciseName ?? null,
    weightValue: step.weightKg ?? null,
    weightUnit: step.weightKg !== undefined ? KILOGRAM_UNIT : null,
  };
}

function buildSteps<S extends { type: 'step' }>(
  items: (S | { type: 'repeat'; iterations: number; skipLastRest?: boolean; steps: S[] })[],
  buildStep: (step: S, stepOrder: number) => GarminStep,
  defaultSkipLastRest: boolean,
): GarminStep[] {
  let stepOrder = 0;
  let childStepId = 0;

  return items.map((item) => {
    stepOrder += 1;
    if (item.type === 'step') return buildStep(item as S, stepOrder);

    childStepId += 1;
    const repeatOrder = stepOrder;
    const children = item.steps.map((child) => {
      stepOrder += 1;
      return { ...buildStep(child, stepOrder), childStepId };
    });

    return {
      type: 'RepeatGroupDTO',
      stepOrder: repeatOrder,
      stepType: buildStepType('repeat'),
      childStepId,
      numberOfIterations: item.iterations,
      endCondition: buildCondition('iterations'),
      endConditionValue: item.iterations,
      smartRepeat: false,
      skipLastRestStep: item.skipLastRest ?? defaultSkipLastRest,
      workoutSteps: children,
    };
  });
}

function buildWorkout(
  name: string,
  description: string | undefined,
  sportType: SportType,
  workoutSteps: GarminStep[],
  extra: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    workoutName: name,
    description: description ?? null,
    sportType,
    ...extra,
    workoutSegments: [{ segmentOrder: 1, sportType, workoutSteps }],
  };
}

export function buildSwimWorkout(dto: CreateSwimWorkoutDto): Record<string, unknown> {
  return buildWorkout(
    dto.name,
    dto.description,
    WORKOUT_SPORT_TYPES.swimming,
    buildSteps(dto.steps, buildSwimStep, true),
    { poolLength: dto.poolLength ?? DEFAULT_POOL_LENGTH_METERS, poolLengthUnit: METER_UNIT },
  );
}

export function buildStrengthWorkout(dto: CreateStrengthWorkoutDto): Record<string, unknown> {
  return buildWorkout(
    dto.name,
    dto.description,
    WORKOUT_SPORT_TYPES.strength_training,
    buildSteps(dto.steps, buildStrengthStep, false),
  );
}
