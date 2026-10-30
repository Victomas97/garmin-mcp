import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GarminClient } from './garmin.client';
import { GarminAuth } from './garmin-auth';
import { EXERCISES_CATALOG_URL } from '../constants';
import type { CreateStrengthWorkoutDto } from '../dtos';

const CATALOG = {
  categories: {
    SQUAT: {
      exercises: {
        BARBELL_BACK_SQUAT: { primaryMuscles: ['QUADS', 'GLUTES'], secondaryMuscles: ['LOWER_BACK'] },
        GOBLET_SQUAT: { primaryMuscles: ['QUADS'], secondaryMuscles: ['GLUTES'] },
      },
    },
    DEADLIFT: {
      exercises: {
        ROMANIAN_DEADLIFT: { primaryMuscles: ['HAMSTRINGS', 'GLUTES'], secondaryMuscles: ['LOWER_BACK'] },
        SINGLE_LEG_ROMANIAN_DEADLIFT_WITH_DUMBBELL: { primaryMuscles: ['HAMSTRINGS'], secondaryMuscles: ['GLUTES'] },
      },
    },
    PLANK: {
      exercises: {
        PLANK: { primaryMuscles: ['CORE'], secondaryMuscles: ['SHOULDERS'] },
      },
    },
  },
};

function calendarItem(id: number, date: string, itemType = 'workout'): Record<string, unknown> {
  return {
    id,
    itemType,
    title: `Item ${id}`,
    date,
    workoutId: itemType === 'workout' ? id + 1000 : null,
    sportTypeKey: itemType === 'workout' ? 'swimming' : null,
    protectedWorkoutSchedule: id === 3 ? true : null,
  };
}

const CALENDAR: Record<string, unknown> = {
  '/calendar-service/year/2026/month/9': {
    calendarItems: [
      calendarItem(1, '2026-09-30'),
      calendarItem(3, '2026-10-31'),
      calendarItem(2, '2026-10-15'),
      calendarItem(50, '2026-10-15', 'activity'),
      calendarItem(51, '2026-10-16', 'weight'),
    ],
  },
  '/calendar-service/year/2026/month/10': {
    calendarItems: [calendarItem(3, '2026-10-31'), calendarItem(4, '2026-11-02'), calendarItem(5, '2026-11-20')],
  },
};

const STRENGTH_DTO: CreateStrengthWorkoutDto = {
  name: 'Gym',
  steps: [
    {
      type: 'repeat',
      iterations: 3,
      steps: [
        { type: 'step', stepType: 'interval', endCondition: 'reps', value: 8, category: 'SQUAT', exerciseName: 'BARBELL_BACK_SQUAT' },
        { type: 'step', stepType: 'rest', endCondition: 'time', value: 90 },
      ],
    },
    { type: 'step', stepType: 'interval', endCondition: 'time', value: 45, category: 'PLANK', exerciseName: 'PLANK' },
  ],
};

describe('GarminClient workouts (mocked API)', () => {
  let client: GarminClient;
  let request: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    request = vi.fn(async (endpoint: string, options?: { method?: string }) => {
      if (endpoint === EXERCISES_CATALOG_URL) return CATALOG;
      if (endpoint in CALENDAR) return CALENDAR[endpoint];
      if (endpoint === '/workout-service/workout' && options?.method === 'POST') {
        return { workoutId: 123, workoutName: 'Created' };
      }
      if (endpoint.startsWith('/workout-service/schedule/') && options?.method === 'POST') {
        return {
          workoutScheduleId: 999,
          calendarDate: '2026-12-31',
          ownerId: 1,
          workout: { workoutId: 123, workoutName: 'Created', workoutSegments: [] },
        };
      }
      return '';
    });
    vi.spyOn(GarminAuth.prototype, 'request').mockImplementation(request as never);
    client = new GarminClient('test@example.com', 'secret');
  });

  afterEach(() => vi.restoreAllMocks());

  describe('searchExercises', () => {
    it('matches all query terms regardless of case and separators', async () => {
      const data = (await client.searchExercises({ query: 'romanian deadlift' })) as any;
      expect(data.total).toBe(2);
      expect(data.exercises.map((e: any) => e.exerciseName)).toEqual([
        'ROMANIAN_DEADLIFT',
        'SINGLE_LEG_ROMANIAN_DEADLIFT_WITH_DUMBBELL',
      ]);
      expect(data.exercises[0]).toEqual({
        category: 'DEADLIFT',
        exerciseName: 'ROMANIAN_DEADLIFT',
        primaryMuscles: ['HAMSTRINGS', 'GLUTES'],
        secondaryMuscles: ['LOWER_BACK'],
      });
    });

    it('filters by category case insensitively', async () => {
      const data = (await client.searchExercises({ category: 'squat' })) as any;
      expect(data.exercises.every((e: any) => e.category === 'SQUAT')).toBe(true);
      expect(data.total).toBe(2);
    });

    it('filters by primary or secondary muscle', async () => {
      const data = (await client.searchExercises({ muscle: 'glutes' })) as any;
      expect(data.exercises.map((e: any) => e.exerciseName).sort()).toEqual([
        'BARBELL_BACK_SQUAT',
        'GOBLET_SQUAT',
        'ROMANIAN_DEADLIFT',
        'SINGLE_LEG_ROMANIAN_DEADLIFT_WITH_DUMBBELL',
      ]);
    });

    it('applies limit but reports full total', async () => {
      const data = (await client.searchExercises({ limit: 2 })) as any;
      expect(data.total).toBe(5);
      expect(data.exercises).toHaveLength(2);
    });

    it('returns empty result when nothing matches', async () => {
      const data = (await client.searchExercises({ query: 'nonexistent' })) as any;
      expect(data).toEqual({ total: 0, exercises: [] });
    });

    it('fetches the catalog only once', async () => {
      await client.searchExercises({ query: 'squat' });
      await client.searchExercises({ query: 'plank' });
      const catalogCalls = request.mock.calls.filter(([endpoint]) => endpoint === EXERCISES_CATALOG_URL);
      expect(catalogCalls).toHaveLength(1);
    });
  });

  describe('createStrengthWorkout', () => {
    it('posts the built workout and returns the created workout', async () => {
      const data = await client.createStrengthWorkout(STRENGTH_DTO);
      expect(data).toEqual({ workoutId: 123, workoutName: 'Created' });

      const post = request.mock.calls.find(([endpoint]) => endpoint === '/workout-service/workout')!;
      expect(post[1].method).toBe('POST');
      expect(post[1].body).toMatchObject({
        workoutName: 'Gym',
        sportType: { sportTypeKey: 'strength_training' },
      });
    });

    it('rejects unknown exercises before posting', async () => {
      await expect(
        client.createStrengthWorkout({
          name: 'Bad',
          steps: [
            { type: 'step', stepType: 'interval', endCondition: 'reps', value: 8, category: 'SQUAT', exerciseName: 'FAKE_SQUAT' },
            {
              type: 'repeat',
              iterations: 2,
              steps: [{ type: 'step', stepType: 'interval', endCondition: 'reps', value: 5, category: 'NOPE', exerciseName: 'PLANK' }],
            },
          ],
        }),
      ).rejects.toThrow('Unknown Garmin exercises: SQUAT/FAKE_SQUAT, NOPE/PLANK');

      expect(request.mock.calls.some(([endpoint]) => endpoint === '/workout-service/workout')).toBe(false);
    });

    it('creates and schedules when scheduleDate is provided', async () => {
      const data = await client.createStrengthWorkout({ ...STRENGTH_DTO, scheduleDate: '2026-12-31' });
      expect(data).toEqual({
        workout: { workoutId: 123, workoutName: 'Created' },
        schedule: { workoutScheduleId: 999, calendarDate: '2026-12-31', workoutId: 123, workoutName: 'Created' },
      });

      const schedule = request.mock.calls.find(([endpoint]) => endpoint === '/workout-service/schedule/123')!;
      expect(schedule[1]).toEqual({ method: 'POST', body: { date: '2026-12-31' } });
    });
  });

  describe('createSwimWorkout', () => {
    it('posts a swimming workout without touching the exercise catalog', async () => {
      await client.createSwimWorkout({
        name: 'Swim',
        steps: [{ type: 'step', stepType: 'warmup', endCondition: 'distance', value: 200 }],
      });

      expect(request.mock.calls.some(([endpoint]) => endpoint === EXERCISES_CATALOG_URL)).toBe(false);
      const post = request.mock.calls.find(([endpoint]) => endpoint === '/workout-service/workout')!;
      expect(post[1].body).toMatchObject({ sportType: { sportTypeKey: 'swimming' }, poolLength: 25 });
    });
  });

  describe('schedule management', () => {
    it('scheduleWorkout returns a trimmed summary without the full workout', async () => {
      const data = await client.scheduleWorkout(123, '2026-12-31');
      expect(data).toEqual({ workoutScheduleId: 999, calendarDate: '2026-12-31', workoutId: 123, workoutName: 'Created' });
    });

    it('listScheduledWorkouts queries each month with 0-indexed months and filters to workouts in range', async () => {
      const data = await client.listScheduledWorkouts('2026-10-01', '2026-11-10');

      const calendarCalls = request.mock.calls.map(([endpoint]) => endpoint).filter((e) => e.startsWith('/calendar'));
      expect(calendarCalls).toEqual(['/calendar-service/year/2026/month/9', '/calendar-service/year/2026/month/10']);
      expect(data).toEqual([
        { scheduleId: 2, date: '2026-10-15', title: 'Item 2', workoutId: 1002, sportTypeKey: 'swimming', isProtected: false },
        { scheduleId: 3, date: '2026-10-31', title: 'Item 3', workoutId: 1003, sportTypeKey: 'swimming', isProtected: true },
        { scheduleId: 4, date: '2026-11-02', title: 'Item 4', workoutId: 1004, sportTypeKey: 'swimming', isProtected: false },
      ]);
    });

    it('listScheduledWorkouts handles a single day', async () => {
      const data = (await client.listScheduledWorkouts('2026-10-15', '2026-10-15')) as unknown[];
      expect(data).toHaveLength(1);
    });

    it('listScheduledWorkouts crosses year boundaries', async () => {
      request.mockResolvedValue({ calendarItems: [] });
      await client.listScheduledWorkouts('2026-12-20', '2027-01-05');
      expect(request.mock.calls.map(([endpoint]) => endpoint)).toEqual([
        '/calendar-service/year/2026/month/11',
        '/calendar-service/year/2027/month/0',
      ]);
    });

    it('listScheduledWorkouts rejects inverted ranges', async () => {
      await expect(client.listScheduledWorkouts('2026-10-10', '2026-10-01')).rejects.toThrow(/must not be after/);
    });

    it('unscheduleWorkout sends DELETE to the schedule endpoint', async () => {
      await client.unscheduleWorkout(999);
      expect(request).toHaveBeenCalledWith('/workout-service/schedule/999', { method: 'DELETE' });
    });

    it('deleteWorkout sends DELETE to the workout endpoint', async () => {
      await client.deleteWorkout(123);
      expect(request).toHaveBeenCalledWith('/workout-service/workout/123', { method: 'DELETE' });
    });
  });
});
