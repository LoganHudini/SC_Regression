import { configuration } from 'core/graphql/queries/GET_CONFIGURATION';
import { CHECK_IN, SOFITEL_MANILA } from './constants';

export const getConfig = () => {
  return configuration?.find((config) => config.code === SOFITEL_MANILA);
};

export const paymentConfiguration = getConfig()
  ?.modules?.find((module) => module?.isActive && module?.code === CHECK_IN)
  ?.submodules?.find((submodule: any) => submodule?.isActive && submodule?.name === 'information')
  ?.details?.find((detail: any) => detail?.isActive && detail?.name === 'Credit Card Info');
