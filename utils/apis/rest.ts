import { ApolloError } from '@apollo/client';
import {
  getCheckInToken,
  handleCheckInAuthenticationFailure,
} from 'core/api/functions/getCheckInAuthentication';
import { client } from 'core/graphql/client';
import { GET_ROOM_STATUS } from 'core/graphql/queries/GET_ROOM_STATUS';
import { processStatusCode } from 'utils/processError';

export const checkRoomStatus = async (roomNo: string, hotelId: any, confirmationId: any) => {
  const { data, error } = await client.query({
    query: GET_ROOM_STATUS,
    context: {
      clientName: 'rest',
      headers: { Authorization: 'Bearer ' + getCheckInToken() },
    },
    variables: {
      roomNumber: roomNo,
      hotelId: hotelId,
      confirmationId: confirmationId,
    },
  });
  if (error) {
    const statusCode = processStatusCode(error as ApolloError);
    statusCode === 403 && handleCheckInAuthenticationFailure(checkRoomStatus);
  }
  return data && data?.getRoomStatus?.data?.roomStatus === 'IP' ? true : false;
};
