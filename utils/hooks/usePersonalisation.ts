import dayjs from 'dayjs';
import { timeFormats } from 'utils/timeFormats';
import {
  GET_AVAILABLE_PERSONALIZATIONS_CMS,
  IPersonalizeYourRoomApiResponse,
} from 'core/graphql/queries/GET_AVAILABLE_PERSONALIZATIONS';
import { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { client } from 'core/graphql/client';
import { GET_RESERVATION, IGetReservationApiResponse } from 'core/graphql/queries/GET_RESERVATION';

export const usePersonalisation = () => {
  const reservationData = client.readQuery<IGetReservationApiResponse>({
    query: GET_RESERVATION,
  });

  const reservationInfo = reservationData?.getReservation?.data;
  const startDate = dayjs(reservationInfo?.details.checkInDate).format(timeFormats.YEAR_MONTH_DAY);
  const endDate = dayjs(reservationInfo?.details.checkOutDate).format(timeFormats.YEAR_MONTH_DAY);

  const { loading: personalisationDataloadingStatus, data: personalisationData } =
    useQuery<IPersonalizeYourRoomApiResponse>(GET_AVAILABLE_PERSONALIZATIONS_CMS, {
      context: { clientName: 'rest' },
      variables: {
        startDate: startDate,
        endDate: endDate,
      },
    });

  const [availablePersonalizations, setAvailablePersonalisation] = useState(null);

  useEffect(() => {
    if (!personalisationDataloadingStatus) {
      const data = personalisationData?.getAvailablePersonalizations?.data?.filter(
        (el) => el?.isActive,
      );
      setAvailablePersonalisation(() => [...data]);
    }
  }, [personalisationDataloadingStatus, personalisationData]);

  return [availablePersonalizations, personalisationDataloadingStatus];
};
