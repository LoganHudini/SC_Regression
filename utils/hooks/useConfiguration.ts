import { useReactiveVar } from '@apollo/client';
import { checkRoomStatus } from 'core/api/functions/checkRoomStatus';
import { client } from 'core/graphql/client';
import { configuration } from 'core/graphql/queries/GET_CONFIGURATION';
import { GET_RESERVATION, IGetReservationApiResponse } from 'core/graphql/queries/GET_RESERVATION';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { reservationGuestInfoStorageData } from 'storage/reservation-guest-info.storage';

import { CHECK_IN, CREDIT_CARD_INFO, GUESTINFORMATION, INFORMATION, NONE } from 'utils/constants';

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
  const guestReservationInfo = useReactiveVar(reservationGuestInfoStorageData);
  const data: any = client.readQuery<IGetReservationApiResponse>({
    query: GET_RESERVATION,
  });

  const reservationInfo = data?.getReservation?.data;
  const paymentStatus: any = config?.modules
    ?.find((module: any) => module?.isActive && module?.code === CHECK_IN)
    ?.submodules?.find((submodule: any) => submodule?.isActive && submodule?.name === INFORMATION)
    ?.details?.find((detail: any) => detail?.isActive && detail?.name === CREDIT_CARD_INFO);

  useEffect(() => {
    const getRoomStatus = async () => {
      paymentStatus.loader = true;
      const roomStatus = await checkRoomStatus(
        reservationInfo?.roomTypes[0]?.roomNumber,
        reservationInfo?.confirmationId,
      );
      reservationGuestInfoStorageData({
        ...reservationGuestInfoStorageData(),
        roomStatus: roomStatus,
      });
      if (!roomStatus) {
        paymentStatus.type = NONE;
      }
      paymentStatus.loader = false;
    };
    if (guestReservationInfo?.roomStatus == null) {
      getRoomStatus();
    }
  }, [
    guestReservationInfo?.roomStatus,
    paymentStatus,
    reservationInfo?.confirmationId,
    reservationInfo?.roomTypes,
  ]);

  return paymentStatus;
};

export const useDocumentConfig = () => {
  const config = useConfig();
  return config?.modules
    ?.find((module: any) => module?.isActive && module?.code === CHECK_IN)
    ?.submodules?.find((submodule: any) => submodule?.isActive && submodule?.name === INFORMATION)
    ?.details?.find((detail: any) => detail?.isActive && detail?.name === GUESTINFORMATION);
};
