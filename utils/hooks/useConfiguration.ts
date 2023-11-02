import { configuration } from 'core/graphql/queries/GET_CONFIGURATION';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

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
  // console.log(hotel ? true : false);
  return configuration?.find((config) => hotel && config?.code === hotel);
  // return configuration?.find((config) => config.code === SOFITEL_MANILA);
};

// export const paymentConfiguration = getConfig()
//   ?.modules?.find((module: any) => module?.isActive && module?.code === CHECK_IN)
//   ?.submodules?.find((submodule: any) => submodule?.isActive && submodule?.name === INFORMATION)
//   ?.details?.find((detail: any) => detail?.isActive && detail?.name === CREDIT_CARD_INFO);
