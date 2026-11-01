import { app } from '@azure/functions';
import { createCosmosRepository } from '../storage/cosmosClient';
import { createLeaderboardHandler } from './getLeaderboard';
import { createSaveRunHandler } from './saveRun';

const repository = createCosmosRepository;

app.http('saveRun', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'runs',
  handler: async (request) => createSaveRunHandler(repository())(request),
});

app.http('getLeaderboard', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'leaderboard',
  handler: async (request) => createLeaderboardHandler(repository())(request),
});
