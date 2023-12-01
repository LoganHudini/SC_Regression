import { configuration } from 'core/graphql/queries/GET_CONFIGURATION';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { CHECK_IN, CREDIT_CARD_INFO, GUESTINFORMATION, INFORMATION } from 'utils/constants';

export const useConfig = () => {
  const router = useRouter();
  // console.log(router);
  useEffect(() => {
    if (router?.query?.hotel) {
      localStorage.setItem('hotel', JSON.stringify(router?.query?.hotel) ?? '');
    }
  }, [router.query]);

  const hotel = router?.query?.hotel
    ? router?.query?.hotel
    : (typeof window !== 'undefined' &&
        localStorage.getItem('hotel') &&
        JSON.parse(localStorage.getItem('hotel') ?? '')) ??
      '';

  return configuration?.find((config) => hotel && config?.code === hotel);
};

export const usePaymentConfig = () => {
  const config = useConfig();
  return config?.modules
    ?.find((module: any) => module?.isActive && module?.code === CHECK_IN)
    ?.submodules?.find((submodule: any) => submodule?.isActive && submodule?.name === INFORMATION)
    ?.details?.find((detail: any) => detail?.isActive && detail?.name === CREDIT_CARD_INFO);
};

export const useDocumentConfig = () => {
  const config = useConfig();
  return config?.modules
    ?.find((module: any) => module?.isActive && module?.code === CHECK_IN)
    ?.submodules?.find((submodule: any) => submodule?.isActive && submodule?.name === INFORMATION)
    ?.details?.find((detail: any) => detail?.isActive && detail?.name === GUESTINFORMATION);
};
