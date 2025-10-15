import { makeVar } from '@apollo/client';

export type ConfigErrorType = 'not-found' | 'api-fail' | undefined;

export const configErrorVar = makeVar<ConfigErrorType>(undefined);
