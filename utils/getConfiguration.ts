import { configuration } from 'core/graphql/queries/GET_CONFIGURATION';
import { SOFITEL_MANILA } from './constants';

export const getConfig = () => {
  return configuration?.find((config) => config.code === SOFITEL_MANILA);
};
