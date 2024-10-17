import { client } from 'core/graphql/client';
import {
  GET_AUTHENTICATION,
  GET_RESERVATION,
  IGetReservationApiResponse,
} from 'core/graphql/queries/GET_RESERVATION';
import { getHotelId } from 'utils/fetchConfigs';

// extract inHouseToken from session storage
export const getInHouseTokenSession = () =>
  (typeof window !== 'undefined' &&
    sessionStorage.getItem('inHouseToken') &&
    JSON.parse(sessionStorage.getItem('inHouseToken') ?? '')) ??
  '';

// authentication
export const getInHouseToken = (
  confirmationId?: string | null,
  roomNumber?: string,
  lastName?: string,
  errorCode?: number | null,
) => {
  const hotelId = getHotelId();
  const reservationData = client.readQuery<IGetReservationApiResponse>({
    query: GET_RESERVATION,
  });
  const reservationInfo = reservationData?.getReservation?.data;

  const getToken = async () => {
    if (
      (
        roomNumber ||
        (reservationInfo &&
          reservationInfo?.roomTypes?.length > 0 &&
          reservationInfo?.roomTypes[0]?.roomNumber)
      )
        ?.toString()
        ?.trim() &&
      (
        lastName ||
        (reservationInfo &&
          reservationInfo?.roomTypes?.length > 0 &&
          reservationInfo?.guests[0]?.lastName)
      )
        ?.toString()
        ?.trim()
    ) {
      const { data: authenticatedData } = await client.query({
        query: GET_AUTHENTICATION,
        context: { clientName: 'rest' },
        variables: {
          body: {
            confirmationId: (confirmationId || reservationInfo?.confirmationId)?.toString()?.trim(),
            roomNumber: (roomNumber || reservationInfo?.roomTypes[0]?.roomNumber)
              ?.toString()
              ?.trim(),
            lastname: (lastName || reservationInfo?.guests[0]?.lastName)?.toString()?.trim(),
            hotelId: hotelId,
            type: 'IN_HOUSE',
          },
        },
        fetchPolicy: 'no-cache',
      });

      sessionStorage.setItem(
        'inHouseToken',
        JSON.stringify(authenticatedData?.getAuthentication?.data?.token) ?? '',
      );

      return authenticatedData?.getAuthentication?.data?.token ?? null;
    } else {
      return null;
    }
  };

  const sessionToken = getInHouseTokenSession();
  return errorCode && errorCode === 403 ? getToken() : sessionToken ? sessionToken : getToken();
};

// handler for authentication failure
export const handleinHouseAuthenticationFailure = async (callback?: any, values?: any) => {
  sessionStorage.setItem('inHouseToken', '');
  callback && values ? callback(values) : callback && callback();
};
