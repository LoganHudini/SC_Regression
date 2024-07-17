import { client } from 'core/graphql/client';
import {
  GET_AUTHENTICATION,
  GET_RESERVATION,
  IGetReservationApiResponse,
} from 'core/graphql/queries/GET_RESERVATION';
import { getHotelId } from 'utils/fetchConfigs';

// extract checkOutToken from session storage
export const getCheckOutTokenSession = () =>
  (typeof window !== 'undefined' &&
    sessionStorage.getItem('checkOutToken') &&
    JSON.parse(sessionStorage.getItem('checkOutToken') ?? '')) ??
  '';

// authentication
export const getCheckOutToken = (roomNumber?: string, lastName?: string, errorCode?: number) => {
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
          roomNumber: (roomNumber || reservationInfo?.roomTypes[0]?.roomNumber)?.toString()?.trim(),
          lastname: (lastName || reservationInfo?.guests[0]?.lastName)?.toString()?.trim(),
          hotelId: hotelId,
          type: 'CHECK_OUT',
        },
      },
      fetchPolicy: 'no-cache',
    });

    sessionStorage.setItem(
      'checkOutToken',
      JSON.stringify(authenticatedData?.getAuthentication?.data?.token) ?? '',
    );

    return authenticatedData?.getAuthentication?.data?.token ?? null;
  };

  const sessionToken = getCheckOutTokenSession();

  return errorCode && errorCode === 403 ? getToken() : sessionToken ? sessionToken : getToken();
};

// handler for authentication failure
export const handleCheckOutAuthenticationFailure = (callback?: any, values?: any) => {
  sessionStorage.setItem('checkOutToken', '');
  callback && values ? callback(values) : callback && callback();
};
