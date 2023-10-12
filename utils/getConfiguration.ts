import { configuration } from 'core/graphql/queries/GET_CONFIGURATION';
import { CHECK_IN, CREDIT_CARD_INFO, INFORMATION, SOFITEL_MANILA } from './constants';

export const getConfig = () => {
  return configuration?.find((config) => config.code === SOFITEL_MANILA);
};

export const paymentConfiguration = getConfig()
  ?.modules?.find((module: any) => module?.isActive && module?.code === CHECK_IN)
  ?.submodules?.find((submodule: any) => submodule?.isActive && submodule?.name === INFORMATION)
  ?.details?.find((detail: any) => detail?.isActive && detail?.name === CREDIT_CARD_INFO);
