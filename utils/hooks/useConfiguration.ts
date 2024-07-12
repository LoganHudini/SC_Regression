import { useReactiveVar } from '@apollo/client';
import { checkRoomStatus } from 'core/api/functions/checkRoomStatus';
import { client } from 'core/graphql/client';
import { configuration } from 'core/graphql/queries/GET_CONFIGURATION';
import { GET_RESERVATION, IGetReservationApiResponse } from 'core/graphql/queries/GET_RESERVATION';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { reservationGuestInfoStorageData } from 'storage/reservation-guest-info.storage';
import {
  CHECK_IN,
  NATIONALITY,
  CREDIT_CARD_INFO,
  FIRST_NAME,
  GUESTINFORMATION,
  INFORMATION,
  LAST_NAME,
  NONE,
  ACCOMPANYINGGUEST,
} from 'utils/constants';

export const useConfig = () => {
  const router = useRouter();
  const guestReservationInfo = useReactiveVar(reservationGuestInfoStorageData);
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

  const hotelConfigs = configuration?.find((config) => hotel && config?.code === hotel);
  const hotelConfigsBasedOnNationality = structuredClone(hotelConfigs);

  if (hotelConfigs?.idVerificationBasedOnNationality) {
    const updatedHotelConfigs: any = hotelConfigsBasedOnNationality?.modules
      ?.find((module: any) => module?.code === CHECK_IN)
      ?.submodules?.find((submodule: any) => submodule?.name === INFORMATION)
      ?.details?.find((detail: any) => detail?.name === GUESTINFORMATION);
    const accompanyGuestConfigs = hotelConfigsBasedOnNationality?.modules
      ?.find((module: any) => module?.code === CHECK_IN)
      ?.submodules?.find((submodule: any) => submodule?.name === ACCOMPANYINGGUEST);

    if (updatedHotelConfigs) {
      if (
        hotelConfigsBasedOnNationality?.idVerificationNationality?.includes(
          guestReservationInfo?.nationality,
        )
      ) {
        // Enable all the fields that are disabled
        updatedHotelConfigs?.details
          ?.filter(
            (detail: any) =>
              detail?.isDisabled && detail?.name !== FIRST_NAME && detail?.name !== LAST_NAME,
          )
          ?.forEach((detail: any) => {
            detail.isDisabled = false;
          });

        // Remove fields based on fieldsToBeRemoved configuration
        updatedHotelConfigs?.details
          ?.filter((detail: any) =>
            hotelConfigsBasedOnNationality?.fieldsToBeRemoved?.includes(detail?.name),
          )
          ?.forEach((detail: any) => {
            detail.isActive = false;
            detail.required = false;
          });
        accompanyGuestConfigs?.details
          ?.filter((detail: any) =>
            hotelConfigsBasedOnNationality?.fieldsToBeRemoved?.includes(detail?.name),
          )
          ?.forEach((detail: any) => {
            detail.required = false;
          });

        // Disable the NATIONALITY field
        const nationalityDetail = updatedHotelConfigs?.details?.find(
          (detail: any) => detail?.name === NATIONALITY,
        );
        if (nationalityDetail) {
          nationalityDetail.isDisabled = true;
        }

        // Set the type to manual
        updatedHotelConfigs.type = 'manual';
      }
    }
  }

  return hotelConfigs?.idVerificationBasedOnNationality
    ? hotelConfigsBasedOnNationality?.idVerificationNationality?.includes(
        guestReservationInfo?.nationality,
      )
      ? hotelConfigsBasedOnNationality
      : hotelConfigs
    : hotelConfigs;
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
    if (
      !config?.preCheckInOnly &&
      guestReservationInfo?.roomStatus == null &&
      reservationInfo?.roomTypes[0]?.roomNumber
    ) {
      getRoomStatus();
    }
  }, [
    config?.preCheckInOnly,
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
