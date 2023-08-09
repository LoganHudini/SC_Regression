import { makeVar } from '@apollo/client';

interface IUpgradesStorageData {
  upgradeId?: string;
  upgradeRate?: number;
}

export const upgradesStorage = makeVar<IUpgradesStorageData>({});
