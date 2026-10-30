import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { GarminClient } from '../client';
import {
  createSwimWorkoutSchema,
  createStrengthWorkoutSchema,
  searchExercisesSchema,
  scheduleWorkoutSchema,
  listScheduledWorkoutsSchema,
  unscheduleWorkoutSchema,
  deleteWorkoutSchema,
} from '../dtos';

export function registerWorkoutTools(server: McpServer, client: GarminClient): void {
  server.registerTool(
    'create_swim_workout',
    {
      description:
        'Create a structured pool swim workout in Garmin Connect (syncs to the watch). Supports repeat groups, rest steps (time or lap button), strokes, drills, equipment and intensity. Optionally schedules it on a date',
      inputSchema: createSwimWorkoutSchema.shape,
    },
    async (params) => {
      const data = await client.createSwimWorkout(params);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'create_strength_workout',
    {
      description:
        'Create a structured strength (gym) workout in Garmin Connect (syncs to the watch). Exercises must use Garmin category/exerciseName pairs from search_exercises. Use repeat groups for sets with rest steps. Optionally schedules it on a date',
      inputSchema: createStrengthWorkoutSchema.shape,
    },
    async (params) => {
      const data = await client.createStrengthWorkout(params);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'search_exercises',
    {
      description:
        'Search the Garmin strength exercise catalog by name, category or muscle. Returns category/exerciseName pairs for create_strength_workout',
      inputSchema: searchExercisesSchema.shape,
    },
    async (params) => {
      const data = await client.searchExercises(params);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'schedule_workout',
    {
      description: 'Schedule an existing workout on a calendar date so it syncs to the watch',
      inputSchema: scheduleWorkoutSchema.shape,
    },
    async ({ workoutId, date }) => {
      const data = await client.scheduleWorkout(workoutId, date);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'list_scheduled_workouts',
    {
      description:
        'List workouts scheduled on the Garmin calendar between two dates, with the scheduleId needed by unschedule_workout',
      inputSchema: listScheduledWorkoutsSchema.shape,
    },
    async ({ startDate, endDate }) => {
      const data = await client.listScheduledWorkouts(startDate, endDate);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'unschedule_workout',
    {
      description:
        'Delete a workout from the calendar by scheduleId (from list_scheduled_workouts). The saved workout itself is kept; use delete_workout to remove it too',
      inputSchema: unscheduleWorkoutSchema.shape,
    },
    async ({ scheduleId }) => {
      const data = await client.unscheduleWorkout(scheduleId);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data || 'Workout unscheduled', null, 2) }],
      };
    },
  );

  server.registerTool(
    'delete_workout',
    {
      description: 'Delete a saved workout permanently. This action cannot be undone',
      inputSchema: deleteWorkoutSchema.shape,
    },
    async ({ workoutId }) => {
      const data = await client.deleteWorkout(workoutId);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data || 'Workout deleted', null, 2) }],
      };
    },
  );
}
