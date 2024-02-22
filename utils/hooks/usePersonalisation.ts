import dayjs from 'dayjs';
import { timeFormats } from 'utils/timeFormats';
import {
  GET_AVAILABLE_PERSONALIZATIONS_CMS,
  IPersonalizeYourRoomApiResponse,
} from 'core/graphql/queries/GET_AVAILABLE_PERSONALIZATIONS';
import { useQuery } from '@apollo/client';
import { client } from 'core/graphql/client';
import { GET_RESERVATION, IGetReservationApiResponse } from 'core/graphql/queries/GET_RESERVATION';
import { activeItems } from 'utils/functions';
import { getCheckInToken } from 'core/api/functions/getCheckInAuthentication';

export const usePersonalisation = () => {
  const reservationData = client.readQuery<IGetReservationApiResponse>({
    query: GET_RESERVATION,
  });

  const reservationInfo = reservationData?.getReservation?.data;
  const startDate = dayjs(reservationInfo?.details?.checkInDate).format(timeFormats.YEAR_MONTH_DAY);
  const endDate = dayjs(reservationInfo?.details?.checkOutDate).format(timeFormats.YEAR_MONTH_DAY);

  const { loading: personalisationDataloadingStatus, data: personalisationData } =
    useQuery<IPersonalizeYourRoomApiResponse>(GET_AVAILABLE_PERSONALIZATIONS_CMS, {
      context: {
        clientName: 'rest',
        headers: { Authorization: 'Bearer ' + getCheckInToken() },
      },
      variables: {
        startDate: startDate,
        endDate: endDate,
        confirmationId: reservationInfo?.confirmationId,
      },
    });

  return [
    personalisationData?.getAvailablePersonalizations?.data
      ? activeItems(personalisationData?.getAvailablePersonalizations?.data)
      : [],
    personalisationDataloadingStatus,
  ];
};
