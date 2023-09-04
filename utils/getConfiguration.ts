import { configuration } from 'core/graphql/queries/GET_CONFIGURATION';
import { MANILA } from './constants';

export const getConfig = () => {
  return configuration?.find((config) => config.code === MANILA);
};
