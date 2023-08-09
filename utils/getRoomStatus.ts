import { client } from 'core/graphql/client';
import { checkinStorage } from 'storage/check-in.storage';
import { GET_RESERVATION_STATUS } from 'core/graphql/queries/GET_RESERVATION_STATUS';

export const getRoomStatus = (checkedInData: any, reservationData: any) => {
  const roomNo = reservationData?.getReservation.data.roomTypes[0].roomNumber;
  const reservationInfo = reservationData?.getReservation.data;
  const reservationDetailsStored = process.env.NEXT_PUBLIC_RESERVATION_STORED;

  if (reservationDetailsStored === 'onprem') {
    client
      .query({
        query: GET_RESERVATION_STATUS,
        context: { clientName: 'onprem' },
        variables: {
          roomId: roomNo,
        },
        fetchPolicy: 'no-cache',
      })
      .then((res) => {
        if (
          res.data.getReservationStatus.data.booking_id !== checkedInData.reservationId ||
          res.data.getReservationStatus.data.front_office_status !== 'OCC'
        ) {
          checkinStorage({ checkedIn: false });
          return false;
        } else {
          return true;
        }
      });
  }
  return true;
};
