import { CosmosClient } from '@azure/cosmos';
import { DefaultAzureCredential } from '@azure/identity';
import type { PlayerRecordRepository } from './playerRecordRepository';
import type { PlayerRecordDocument } from '../models/player-record';

export function createCosmosRepository(): PlayerRecordRepository {
  const endpoint = process.env.COSMOS_ENDPOINT;
  const databaseName = process.env.COSMOS_DATABASE ?? 'jetpack-game';
  const containerName = process.env.COSMOS_CONTAINER ?? 'player-records';
  const connectionString = process.env.COSMOS_CONNECTION_STRING;
  if (!endpoint && !connectionString) throw new Error('Cosmos 설정이 없습니다.');

  const client = connectionString
    ? new CosmosClient(connectionString)
    : new CosmosClient({ endpoint: endpoint!, aadCredentials: new DefaultAzureCredential() });
  const container = client.database(databaseName).container(containerName);

  return {
    async getByUserId(userId: string) {
      const { resource } = await container.item(userId, userId).read<PlayerRecordDocument>();
      return resource ?? null;
    },
    async upsert(record: PlayerRecordDocument) {
      const { resource } = await container.items.upsert<PlayerRecordDocument>(record);
      if (!resource) throw new Error('Cosmos 저장 결과가 비어 있습니다.');
      return resource;
    },
    async listAll() {
      const { resources } = await container.items.query<PlayerRecordDocument>('SELECT * FROM c').fetchAll();
      return resources;
    },
  };
}
