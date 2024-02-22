import { client } from 'core/graphql/client';
import {
  GET_AUTHENTICATION,
  GET_RESERVATION,
  IGetReservationApiResponse,
} from 'core/graphql/queries/GET_RESERVATION';
import { getHotelId } from 'utils/fetchConfigs';

// extract checkInToken from session storage
export const getCheckInTokenSession = () =>
  (typeof window !== 'undefined' &&
    sessionStorage.getItem('checkInToken') &&
    JSON.parse(sessionStorage.getItem('checkInToken') ?? '')) ??
  '';

// authentication
export const getCheckInToken = (confirmationId?: string, lastName?: string, errorCode?: number) => {
  const hotelId = getHotelId();

  const getToken = async () => {
    const reservationData = client.readQuery<IGetReservationApiResponse>({
      query: GET_RESERVATION,
    });
    const reservationInfo = reservationData?.getReservation?.data;

    const { data: authenticatedData } = await client.query({
      query: GET_AUTHENTICATION,
      context: { clientName: 'rest' },
      variables: {
        body: {
          confirmationId: (confirmationId || reservationInfo?.confirmationId)?.toString()?.trim(),
          lastname: (lastName || reservationInfo?.guests[0]?.lastName)?.toString()?.trim(),
          hotelId: hotelId,
          type: 'CHECK_IN',
        },
      },
      fetchPolicy: 'no-cache',
    });

    sessionStorage.setItem(
      'checkInToken',
      JSON.stringify(authenticatedData?.getAuthentication?.data?.token) ?? '',
    );

    return authenticatedData?.getAuthentication?.data?.token
      ? authenticatedData?.getAuthentication?.data?.token
      : null;
  };

  const sessionToken = getCheckInTokenSession();
  return errorCode && errorCode === 403 ? getToken() : sessionToken ? sessionToken : getToken();
};

// handler for authentication failure
export const handleCheckInAuthenticationFailure = async (callback?: any, values?: any) => {
  sessionStorage.setItem('checkInToken', '');
  callback && values ? callback(values) : callback && callback();
};
