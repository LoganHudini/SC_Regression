import dayjs from 'dayjs';
import { timeFormats } from 'utils/timeFormats';
import {
  GET_AVAILABLE_PERSONALIZATIONS_CMS,
  GET_AVAILABLE_PERSONALIZATIONS_PMS,
  IPersonalizeYourRoomApiResponse,
} from 'core/graphql/queries/GET_AVAILABLE_PERSONALIZATIONS';
import { useQuery } from '@apollo/client';
import { client } from 'core/graphql/client';
import { GET_RESERVATION, IGetReservationApiResponse } from 'core/graphql/queries/GET_RESERVATION';
import { activeItems } from 'utils/functions';
import { getCheckInToken } from 'core/api/functions/getCheckInAuthentication';
import { useConfig } from './useConfiguration';
import { CHECK_IN, CMS, personalisation } from 'utils/constants';
import { personalizationStorage } from 'storage/personalize-your-room.storage';
import { useEffect } from 'react';

export const usePersonalisation = () => {
  const config = useConfig();
  const checkInModule: any = config?.modules?.find((module: any) => module?.code === CHECK_IN);
  const personalisationConfig = checkInModule?.submodules?.find(
    (submodule: any) => submodule?.name === personalisation && submodule.isActive,
  );

  const reservationData = client.readQuery<IGetReservationApiResponse>({
    query: GET_RESERVATION,
  });

  const reservationInfo = reservationData?.getReservation?.data;
  const startDate = dayjs(reservationInfo?.details?.checkInDate).format(timeFormats.YEAR_MONTH_DAY);
  const endDate = dayjs(reservationInfo?.details?.checkOutDate).format(timeFormats.YEAR_MONTH_DAY);

  const { loading: personalisationDataloadingStatus, data: personalisationData } =
    useQuery<IPersonalizeYourRoomApiResponse>(
      personalisationConfig?.type === CMS
        ? GET_AVAILABLE_PERSONALIZATIONS_CMS
        : GET_AVAILABLE_PERSONALIZATIONS_PMS,
      {
        context: {
          clientName: 'rest',
          headers: { Authorization: 'Bearer ' + getCheckInToken() },
        },
        variables: {
          startDate: startDate,
          endDate: endDate,
          confirmationId: reservationInfo?.confirmationId,
        },
      },
    );

  useEffect(() => {
    if (!personalisationDataloadingStatus) {
      personalizationStorage(
        personalisationData?.getAvailablePersonalizations?.data
          ? activeItems(personalisationData?.getAvailablePersonalizations?.data)
          : [],
      );
    }
  }, [personalisationDataloadingStatus, personalisationData]);

  return personalisationDataloadingStatus;
};
