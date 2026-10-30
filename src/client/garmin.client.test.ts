import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import dotenv from 'dotenv';
import { GarminClient } from './garmin.client';

dotenv.config();

const email = process.env.GARMIN_EMAIL!;
const password = process.env.GARMIN_PASSWORD!;

const DELAY_MS = 500;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function yesterday(): string {
  const now = new Date();
  now.setDate(now.getDate() - 1);
  return now.toISOString().split('T')[0]!;
}

function daysAgo(n: number): string {
  const now = new Date();
  now.setDate(now.getDate() - n);
  return now.toISOString().split('T')[0]!;
}

function weekAgo(): string {
  return daysAgo(7);
}

function monthAgo(): string {
  const now = new Date();
  now.setMonth(now.getMonth() - 1);
  return now.toISOString().split('T')[0]!;
}

describe('GarminClient (live API)', () => {
  let client: GarminClient;

  beforeAll(() => {
    expect(email).toBeTruthy();
    expect(password).toBeTruthy();
    client = new GarminClient(email, password);
  });

  afterEach(() => sleep(DELAY_MS));

  describe('Activities', () => {
    it('get_activities', async () => {
      const data = await client.getActivities(0, 5);
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
    }, 30000);

    it('get_activities with activityType filter', async () => {
      const data = await client.getActivities(0, 5, 'running');
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
    }, 30000);

    it('get_activities_by_date', async () => {
      const data = await client.getActivitiesByDate(monthAgo(), yesterday());
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
    }, 30000);

    it('get_last_activity', async () => {
      const data = await client.getLastActivity();
      expect(data).toBeDefined();
    }, 30000);

    it('count_activities', async () => {
      const data = await client.countActivities();
      expect(data).toBeDefined();
    }, 30000);

    it('get_activity (first from list)', async () => {
      const activities = await client.getActivities(0, 1) as { activityId: number }[];
      if (activities.length > 0) {
        await sleep(DELAY_MS);
        const data = await client.getActivity(activities[0]!.activityId);
        expect(data).toBeDefined();
      }
    }, 30000);

    it('get_activity_details', async () => {
      const activities = await client.getActivities(0, 1) as { activityId: number }[];
      if (activities.length > 0) {
        await sleep(DELAY_MS);
        const data = await client.getActivityDetails(activities[0]!.activityId);
        expect(data).toBeDefined();
      }
    }, 30000);

    it('get_activity_splits', async () => {
      const activities = await client.getActivities(0, 1) as { activityId: number }[];
      if (activities.length > 0) {
        await sleep(DELAY_MS);
        const data = await client.getActivitySplits(activities[0]!.activityId);
        expect(data).toBeDefined();
      }
    }, 30000);

    it('get_activity_weather', async () => {
      const activities = await client.getActivities(0, 1) as { activityId: number }[];
      if (activities.length > 0) {
        await sleep(DELAY_MS);
        const data = await client.getActivityWeather(activities[0]!.activityId);
        expect(data).toBeDefined();
      }
    }, 30000);

    it('get_activity_hr_zones', async () => {
      const activities = await client.getActivities(0, 1) as { activityId: number }[];
      if (activities.length > 0) {
        await sleep(DELAY_MS);
        const data = await client.getActivityHrZones(activities[0]!.activityId);
        expect(data).toBeDefined();
      }
    }, 30000);

    it('get_activity_exercise_sets', async () => {
      const activities = await client.getActivities(0, 1) as { activityId: number }[];
      if (activities.length > 0) {
        await sleep(DELAY_MS);
        const data = await client.getActivityExerciseSets(activities[0]!.activityId);
        expect(data).toBeDefined();
      }
    }, 30000);

    it('get_activity_gear', async () => {
      const activities = await client.getActivities(0, 1) as { activityId: number }[];
      if (activities.length > 0) {
        await sleep(DELAY_MS);
        const data = await client.getActivityGear(activities[0]!.activityId);
        expect(data).toBeDefined();
      }
    }, 30000);

    it('get_activity_typed_splits', async () => {
      const activities = await client.getActivities(0, 1) as { activityId: number }[];
      if (activities.length > 0) {
        await sleep(DELAY_MS);
        const data = await client.getActivityTypedSplits(activities[0]!.activityId);
        expect(data).toBeDefined();
      }
    }, 30000);

    it('get_activity_split_summaries', async () => {
      const activities = await client.getActivities(0, 1) as { activityId: number }[];
      if (activities.length > 0) {
        await sleep(DELAY_MS);
        const data = await client.getActivitySplitSummaries(activities[0]!.activityId);
        expect(data).toBeDefined();
      }
    }, 30000);

    it('get_activity_power_in_timezones', async () => {
      const activities = await client.getActivities(0, 1) as { activityId: number }[];
      if (activities.length > 0) {
        await sleep(DELAY_MS);
        const data = await client.getActivityPowerInTimezones(activities[0]!.activityId);
        expect(data).toBeDefined();
      }
    }, 30000);

    it('get_activity_types', async () => {
      const data = await client.getActivityTypes();
      expect(data).toBeDefined();
    }, 30000);

    it('get_progress_summary', async () => {
      const data = await client.getProgressSummary(monthAgo(), yesterday());
      expect(data).toBeDefined();
    }, 30000);
  });

  describe('Daily Health', () => {
    it('get_daily_summary', async () => {
      const data = await client.getDailySummary(yesterday());
      expect(data).toBeDefined();
    }, 30000);

    it('get_steps', async () => {
      const data = await client.getSteps(yesterday());
      expect(data).toBeDefined();
    }, 30000);

    it('get_steps_chart', async () => {
      const data = await client.getStepsChart(yesterday());
      expect(data).toBeDefined();
    }, 30000);

    it('get_heart_rate', async () => {
      const data = await client.getHeartRate(yesterday());
      expect(data).toBeDefined();
    }, 30000);

    it('get_resting_heart_rate', async () => {
      const data = await client.getRestingHeartRate(yesterday());
      expect(data).toBeDefined();
    }, 30000);

    it('get_stress', async () => {
      const data = await client.getStress(yesterday());
      expect(data).toBeDefined();
    }, 30000);

    it('get_body_battery', async () => {
      const data = await client.getBodyBattery(weekAgo(), yesterday());
      expect(data).toBeDefined();
    }, 30000);

    it('get_body_battery single day (endDate defaults)', async () => {
      const data = await client.getBodyBattery(yesterday(), yesterday());
      expect(data).toBeDefined();
    }, 30000);

    it('get_body_battery_events', async () => {
      const data = await client.getBodyBatteryEvents(yesterday());
      expect(data).toBeDefined();
    }, 30000);

    it('get_respiration', async () => {
      const data = await client.getRespiration(yesterday());
      expect(data).toBeDefined();
    }, 30000);

    it('get_spo2', async () => {
      const data = await client.getSpO2(yesterday());
      expect(data).toBeDefined();
    }, 30000);

    it('get_intensity_minutes', async () => {
      const data = await client.getIntensityMinutes(yesterday());
      expect(data).toBeDefined();
    }, 30000);

    it('get_floors', async () => {
      const data = await client.getFloors(yesterday());
      expect(data).toBeDefined();
    }, 30000);

    it('get_hydration', async () => {
      const data = await client.getHydration(yesterday());
      expect(data).toBeDefined();
    }, 30000);

    it('get_daily_events', async () => {
      const data = await client.getDailyEvents(yesterday());
      expect(data).toBeDefined();
    }, 30000);
  });

  describe('Trends', () => {
    it('get_daily_steps_range', async () => {
      const data = await client.getDailySteps(weekAgo(), yesterday());
      expect(data).toBeDefined();
    }, 30000);

    it('get_daily_steps_range auto-chunks >28 days', async () => {
      const data = await client.getDailySteps(daysAgo(60), yesterday());
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
    }, 60000);

    it('get_weekly_steps', async () => {
      const data = await client.getWeeklySteps(yesterday(), 4);
      expect(data).toBeDefined();
    }, 30000);

    it('get_weekly_steps default 52 weeks', async () => {
      const data = await client.getWeeklySteps(yesterday());
      expect(data).toBeDefined();
    }, 30000);

    it('get_weekly_stress', async () => {
      const data = await client.getWeeklyStress(yesterday(), 4);
      expect(data).toBeDefined();
    }, 30000);

    it('get_weekly_stress default 52 weeks', async () => {
      const data = await client.getWeeklyStress(yesterday());
      expect(data).toBeDefined();
    }, 30000);

    it('get_weekly_intensity_minutes', async () => {
      const data = await client.getWeeklyIntensityMinutes(weekAgo(), yesterday());
      expect(data).toBeDefined();
    }, 30000);
  });

  describe('Sleep', () => {
    it('get_sleep_data', async () => {
      const data = await client.getSleepData(yesterday());
      expect(data).toBeDefined();
    }, 30000);

    it('get_sleep_data_raw', async () => {
      const data = await client.getSleepDataRaw(yesterday());
      expect(data).toBeDefined();
    }, 30000);
  });

  describe('Body Composition', () => {
    it('get_body_composition', async () => {
      const data = await client.getBodyComposition(monthAgo(), yesterday());
      expect(data).toBeDefined();
    }, 30000);

    it('get_latest_weight', async () => {
      const data = await client.getLatestWeight();
      expect(data).toBeDefined();
    }, 30000);

    it('get_daily_weigh_ins', async () => {
      const data = await client.getDailyWeighIns(yesterday());
      expect(data).toBeDefined();
    }, 30000);

    it('get_weigh_ins', async () => {
      const data = await client.getWeighIns(monthAgo(), yesterday());
      expect(data).toBeDefined();
    }, 30000);

    it('get_blood_pressure', async () => {
      const data = await client.getBloodPressure(monthAgo(), yesterday());
      expect(data).toBeDefined();
    }, 30000);
  });

  describe('Performance & Training', () => {
    it('get_vo2max', async () => {
      const data = await client.getVO2Max(yesterday());
      expect(data).toBeDefined();
    }, 30000);

    it('get_training_readiness', async () => {
      const data = await client.getTrainingReadiness(yesterday());
      expect(data).toBeDefined();
    }, 30000);

    it('get_training_status', async () => {
      const data = await client.getTrainingStatus(yesterday());
      expect(data).toBeDefined();
    }, 30000);

    it('get_hrv', async () => {
      const data = await client.getHRV(yesterday());
      expect(data).toBeDefined();
    }, 30000);

    it('get_endurance_score range', async () => {
      const data = await client.getEnduranceScore(monthAgo(), yesterday());
      expect(data).toBeDefined();
    }, 30000);

    it('get_endurance_score single day', async () => {
      const data = await client.getEnduranceScore(yesterday());
      expect(data).toBeDefined();
    }, 30000);

    it('get_hill_score range', async () => {
      const data = await client.getHillScore(monthAgo(), yesterday());
      expect(data).toBeDefined();
    }, 30000);

    it('get_hill_score single day', async () => {
      const data = await client.getHillScore(yesterday());
      expect(data).toBeDefined();
    }, 30000);

    it('get_race_predictions latest', async () => {
      const data = await client.getRacePredictions();
      expect(data).toBeDefined();
    }, 30000);

    it('get_race_predictions range', async () => {
      const data = await client.getRacePredictions(monthAgo(), yesterday(), 'daily');
      expect(data).toBeDefined();
    }, 30000);

    it('get_fitness_age', async () => {
      const data = await client.getFitnessAge(yesterday());
      expect(data).toBeDefined();
    }, 30000);

    it('get_personal_records', async () => {
      const data = await client.getPersonalRecords();
      expect(data).toBeDefined();
    }, 30000);

    it('get_lactate_threshold latest', async () => {
      const data = await client.getLactateThreshold();
      expect(data).toBeDefined();
    }, 30000);

    it('get_lactate_threshold range', async () => {
      const data = await client.getLactateThreshold(monthAgo(), yesterday(), 'daily');
      expect(data).toBeDefined();
    }, 30000);

    it('get_cycling_ftp', async () => {
      const data = await client.getCyclingFTP();
      expect(data).toBeDefined();
    }, 30000);
  });

  describe('Profile & Devices', () => {
    it('get_user_profile', async () => {
      const data = await client.getUserProfile();
      expect(data).toBeDefined();
    }, 30000);

    it('get_user_settings', async () => {
      const data = await client.getUserSettings();
      expect(data).toBeDefined();
    }, 30000);

    it('get_devices', async () => {
      const data = await client.getDevices();
      expect(data).toBeDefined();
    }, 30000);

    it('get_device_last_used', async () => {
      const data = await client.getDeviceLastUsed();
      expect(data).toBeDefined();
    }, 30000);

    it('get_primary_training_device', async () => {
      const data = await client.getPrimaryTrainingDevice();
      expect(data).toBeDefined();
    }, 30000);

    it('get_gear', async () => {
      const data = await client.getGear();
      expect(data).toBeDefined();
    }, 30000);

    it('get_gear_defaults', async () => {
      const data = await client.getGearDefaults();
      expect(data).toBeDefined();
    }, 30000);

    it('get_goals', async () => {
      const data = await client.getGoals();
      expect(data).toBeDefined();
    }, 30000);

    it('get_earned_badges', async () => {
      const data = await client.getEarnedBadges();
      expect(data).toBeDefined();
    }, 30000);

    it('get_workouts', async () => {
      const data = await client.getWorkouts();
      expect(data).toBeDefined();
    }, 30000);
  });

  describe('Range Wrappers', () => {
    it('get_sleep_data_range (3 days)', async () => {
      const data = await client.getSleepDataRange(daysAgo(3), yesterday());
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(3);
    }, 60000);

    it('get_hrv_range (3 days)', async () => {
      const data = await client.getHRVRange(daysAgo(3), yesterday());
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(3);
    }, 60000);

    it('get_stress_range (3 days)', async () => {
      const data = await client.getStressRange(daysAgo(3), yesterday());
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(3);
    }, 60000);

    it('get_spo2_range (3 days)', async () => {
      const data = await client.getSpO2Range(daysAgo(3), yesterday());
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(3);
    }, 60000);

    it('get_respiration_range (3 days)', async () => {
      const data = await client.getRespirationRange(daysAgo(3), yesterday());
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(3);
    }, 60000);

    it('get_training_readiness_range (3 days)', async () => {
      const data = await client.getTrainingReadinessRange(daysAgo(3), yesterday());
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(3);
    }, 60000);

    it('get_vo2max_range (3 days)', async () => {
      const data = await client.getVO2MaxRange(daysAgo(3), yesterday());
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(3);
    }, 60000);
  });

  describe('Health Snapshot', () => {
    it('get_daily_health_snapshot', async () => {
      const data = await client.getDailyHealthSnapshot(yesterday());
      expect(data).toBeDefined();
      expect(data.date).toBe(yesterday());
      expect(data).toHaveProperty('summary');
      expect(data).toHaveProperty('heartRate');
      expect(data).toHaveProperty('stress');
      expect(data).toHaveProperty('bodyBattery');
      expect(data).toHaveProperty('sleep');
      expect(data).toHaveProperty('hrv');
      expect(data).toHaveProperty('respiration');
      expect(data).toHaveProperty('spo2');
      expect(data).toHaveProperty('steps');
      expect(data).toHaveProperty('floors');
      expect(data).toHaveProperty('intensityMinutes');
    }, 60000);
  });

  describe('Training Plans', () => {
    it('get_training_plans', async () => {
      try {
        const data = await client.getTrainingPlans();
        expect(data).toBeDefined();
      } catch (e: unknown) {
        const status = (e as { response?: { status?: number } }).response?.status;
        expect([404]).toContain(status);
      }
    }, 30000);
  });

  describe('Wellness', () => {
    it('get_menstrual_data_for_date', async () => {
      try {
        const data = await client.getMenstrualDataForDate(yesterday());
        expect(data).toBeDefined();
      } catch (e: unknown) {
        const status = (e as { response?: { status?: number } }).response?.status;
        expect([403, 404]).toContain(status);
      }
    }, 30000);

    it('get_menstrual_calendar', async () => {
      try {
        const data = await client.getMenstrualCalendar(monthAgo(), yesterday());
        expect(data).toBeDefined();
      } catch (e: unknown) {
        const status = (e as { response?: { status?: number } }).response?.status;
        expect([403, 404]).toContain(status);
      }
    }, 30000);

    it('get_pregnancy_summary', async () => {
      try {
        const data = await client.getPregnancySummary();
        expect(data).toBeDefined();
      } catch (e: unknown) {
        const status = (e as { response?: { status?: number } }).response?.status;
        expect([403, 404]).toContain(status);
      }
    }, 30000);

    it('get_lifestyle_logging_data', async () => {
      try {
        const data = await client.getLifestyleLoggingData(yesterday());
        expect(data).toBeDefined();
      } catch (e: unknown) {
        const status = (e as { response?: { status?: number } }).response?.status;
        expect([403, 404]).toContain(status);
      }
    }, 30000);
  });

  describe('Badges & Challenges', () => {
    it('get_available_badges', async () => {
      const data = await client.getAvailableBadges();
      expect(data).toBeDefined();
    }, 30000);

    it('get_adhoc_challenges', async () => {
      const data = await client.getAdhocChallenges();
      expect(data).toBeDefined();
    }, 30000);

    it('get_badge_challenges', async () => {
      const data = await client.getBadgeChallenges();
      expect(data).toBeDefined();
    }, 30000);

    it('get_available_badge_challenges', async () => {
      const data = await client.getAvailableBadgeChallenges();
      expect(data).toBeDefined();
    }, 30000);

    it('get_non_completed_badge_challenges', async () => {
      const data = await client.getNonCompletedBadgeChallenges();
      expect(data).toBeDefined();
    }, 30000);

    it('get_inprogress_virtual_challenges', async () => {
      const data = await client.getInProgressVirtualChallenges();
      expect(data).toBeDefined();
    }, 30000);
  });

  describe('Workouts: create -> get -> delete', () => {
    const createdIds = new Set<number>();
    const scheduleIds = new Set<number>();

    type LiveStep = Record<string, any>;

    function getLiveSteps(workout: Record<string, any>): LiveStep[] {
      return workout.workoutSegments[0].workoutSteps;
    }

    async function expectWorkoutDeleted(workoutId: number): Promise<void> {
      await client.deleteWorkout(workoutId);
      createdIds.delete(workoutId);
      await sleep(DELAY_MS);
      const status = await client
        .getWorkout(String(workoutId))
        .then(() => 200)
        .catch((e: { response?: { status?: number } }) => e.response?.status);
      expect(status).toBe(404);
    }

    afterAll(async () => {
      for (const scheduleId of scheduleIds) await client.unscheduleWorkout(scheduleId).catch(() => undefined);
      for (const workoutId of createdIds) await client.deleteWorkout(workoutId).catch(() => undefined);
    }, 60000);

    it('swim workout', async () => {
      const created = (await client.createSwimWorkout({
        name: 'MCP TEST swim',
        description: 'vitest',
        poolLength: 25,
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
            steps: [
              { type: 'step', stepType: 'interval', endCondition: 'distance', value: 100, strokeType: 'free', intensity: 'moderate', equipmentType: 'pull_buoy' },
              { type: 'step', stepType: 'rest', endCondition: 'lap.button' },
            ],
          },
          { type: 'step', stepType: 'cooldown', endCondition: 'distance', value: 100 },
        ],
      })) as { workoutId: number };
      createdIds.add(created.workoutId);
      expect(created.workoutId).toBeGreaterThan(0);

      await sleep(DELAY_MS);
      const workout = (await client.getWorkout(String(created.workoutId))) as Record<string, any>;
      expect(workout).toMatchObject({
        workoutId: created.workoutId,
        workoutName: 'MCP TEST swim',
        description: 'vitest',
        sportType: { sportTypeKey: 'swimming' },
        poolLength: 25,
      });

      const steps = getLiveSteps(workout);
      expect(steps).toHaveLength(4);
      expect(steps[0]).toMatchObject({
        stepType: { stepTypeKey: 'warmup' },
        endCondition: { conditionTypeKey: 'distance' },
        endConditionValue: 200,
        strokeType: { strokeTypeKey: 'free' },
        description: 'RPE 2',
      });
      expect(steps[1]).toMatchObject({ type: 'RepeatGroupDTO', numberOfIterations: 4, skipLastRestStep: true });
      expect(steps[1]!.workoutSteps[0]).toMatchObject({
        endCondition: { conditionTypeKey: 'lap.button' },
        strokeType: { strokeTypeKey: 'drill' },
        drillType: { drillTypeKey: 'kick' },
        equipmentType: { equipmentTypeKey: 'kickboard' },
      });
      expect(steps[1]!.workoutSteps[1]).toMatchObject({
        stepType: { stepTypeKey: 'rest' },
        endCondition: { conditionTypeKey: 'fixed.rest' },
        endConditionValue: 20,
      });
      expect(steps[2]!.workoutSteps[0]).toMatchObject({
        equipmentType: { equipmentTypeKey: 'pull_buoy' },
        secondaryTargetType: { workoutTargetTypeKey: 'swim.instruction' },
        secondaryTargetValueOne: 4,
      });
      expect(steps[2]!.workoutSteps[1]).toMatchObject({ endCondition: { conditionTypeKey: 'lap.button' } });
      expect(steps[3]).toMatchObject({ stepType: { stepTypeKey: 'cooldown' }, endConditionValue: 100 });

      await expectWorkoutDeleted(created.workoutId);
    }, 60000);

    it('strength workout', async () => {
      const created = (await client.createStrengthWorkout({
        name: 'MCP TEST gym',
        steps: [
          { type: 'step', stepType: 'warmup', endCondition: 'time', value: 300, category: 'CARDIO', exerciseName: 'JUMP_ROPE' },
          {
            type: 'repeat',
            iterations: 3,
            steps: [
              { type: 'step', stepType: 'interval', endCondition: 'reps', value: 8, category: 'DEADLIFT', exerciseName: 'ROMANIAN_DEADLIFT', weightKg: 50, description: 'RIR 2' },
              { type: 'step', stepType: 'rest', endCondition: 'time', value: 90 },
            ],
          },
          { type: 'step', stepType: 'interval', endCondition: 'time', value: 45, category: 'PLANK', exerciseName: 'PLANK' },
          { type: 'step', stepType: 'rest', endCondition: 'lap.button' },
        ],
      })) as { workoutId: number };
      createdIds.add(created.workoutId);
      expect(created.workoutId).toBeGreaterThan(0);

      await sleep(DELAY_MS);
      const workout = (await client.getWorkout(String(created.workoutId))) as Record<string, any>;
      expect(workout).toMatchObject({
        workoutId: created.workoutId,
        workoutName: 'MCP TEST gym',
        sportType: { sportTypeKey: 'strength_training' },
      });

      const steps = getLiveSteps(workout);
      expect(steps).toHaveLength(4);
      expect(steps[0]).toMatchObject({
        stepType: { stepTypeKey: 'warmup' },
        endCondition: { conditionTypeKey: 'time' },
        endConditionValue: 300,
        category: 'CARDIO',
        exerciseName: 'JUMP_ROPE',
      });
      expect(steps[1]).toMatchObject({ type: 'RepeatGroupDTO', numberOfIterations: 3, skipLastRestStep: false });
      expect(steps[1]!.workoutSteps[0]).toMatchObject({
        endCondition: { conditionTypeKey: 'reps' },
        endConditionValue: 8,
        category: 'DEADLIFT',
        exerciseName: 'ROMANIAN_DEADLIFT',
        weightValue: 50,
        weightUnit: { unitKey: 'kilogram' },
        description: 'RIR 2',
      });
      expect(steps[1]!.workoutSteps[1]).toMatchObject({
        stepType: { stepTypeKey: 'rest' },
        endCondition: { conditionTypeKey: 'time' },
        endConditionValue: 90,
      });
      expect(steps[2]).toMatchObject({ category: 'PLANK', exerciseName: 'PLANK', endConditionValue: 45 });
      expect(steps[3]).toMatchObject({ endCondition: { conditionTypeKey: 'lap.button' } });

      await expectWorkoutDeleted(created.workoutId);
    }, 60000);

    it('create with scheduleDate -> list calendar -> unschedule -> delete', async () => {
      const result = (await client.createSwimWorkout({
        name: 'MCP TEST scheduled',
        scheduleDate: '2099-12-31',
        steps: [{ type: 'step', stepType: 'interval', endCondition: 'distance', value: 400 }],
      })) as { workout: { workoutId: number }; schedule: { workoutScheduleId: number; calendarDate: string } };
      createdIds.add(result.workout.workoutId);
      scheduleIds.add(result.schedule.workoutScheduleId);
      expect(result.schedule).toMatchObject({ calendarDate: '2099-12-31', workoutId: result.workout.workoutId });

      await sleep(DELAY_MS);
      const scheduled = (await client.getScheduledWorkout(String(result.schedule.workoutScheduleId))) as Record<string, any>;
      expect(scheduled).toMatchObject({
        workoutScheduleId: result.schedule.workoutScheduleId,
        calendarDate: '2099-12-31',
        workout: { workoutId: result.workout.workoutId },
      });

      const listed = (await client.listScheduledWorkouts('2099-12-31', '2099-12-31')) as Record<string, any>[];
      expect(listed).toContainEqual(
        expect.objectContaining({
          scheduleId: result.schedule.workoutScheduleId,
          workoutId: result.workout.workoutId,
          title: 'MCP TEST scheduled',
          sportTypeKey: 'swimming',
        }),
      );

      await client.unscheduleWorkout(result.schedule.workoutScheduleId);
      scheduleIds.delete(result.schedule.workoutScheduleId);
      await sleep(DELAY_MS);

      const scheduleStatus = await client
        .getScheduledWorkout(String(result.schedule.workoutScheduleId))
        .then(() => 200)
        .catch((e: { response?: { status?: number } }) => e.response?.status);
      expect(scheduleStatus).toBe(404);
      const afterUnschedule = (await client.listScheduledWorkouts('2099-12-31', '2099-12-31')) as Record<string, any>[];
      expect(afterUnschedule.map((w) => w.scheduleId)).not.toContain(result.schedule.workoutScheduleId);

      const stillSaved = (await client.getWorkout(String(result.workout.workoutId))) as Record<string, any>;
      expect(stillSaved.workoutId).toBe(result.workout.workoutId);

      await expectWorkoutDeleted(result.workout.workoutId);
    }, 60000);

    it('rejects unknown exercises without creating anything', async () => {
      await expect(
        client.createStrengthWorkout({
          name: 'MCP TEST invalid',
          steps: [{ type: 'step', stepType: 'interval', endCondition: 'reps', value: 8, category: 'SQUAT', exerciseName: 'FAKE_SQUAT' }],
        }),
      ).rejects.toThrow('Unknown Garmin exercises: SQUAT/FAKE_SQUAT');
    }, 30000);
  });

  describe('Utility: dateRange', () => {
    it('generates correct date array', () => {
      const dates = client.dateRange('2024-01-01', '2024-01-05');
      expect(dates).toEqual([
        '2024-01-01',
        '2024-01-02',
        '2024-01-03',
        '2024-01-04',
        '2024-01-05',
      ]);
    });

    it('single day range returns one date', () => {
      const dates = client.dateRange('2024-03-15', '2024-03-15');
      expect(dates).toEqual(['2024-03-15']);
    });

    it('empty range when start > end', () => {
      const dates = client.dateRange('2024-01-05', '2024-01-01');
      expect(dates).toEqual([]);
    });
  });
});
