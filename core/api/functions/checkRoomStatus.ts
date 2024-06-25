import { ApolloError } from '@apollo/client';
import {
  getCheckInToken,
  handleCheckInAuthenticationFailure,
} from 'core/api/functions/getCheckInAuthentication';
import { client } from 'core/graphql/client';
import { GET_ROOM_STATUS } from 'core/graphql/queries/GET_ROOM_STATUS';
import { processStatusCode } from 'utils/processError';

export const checkRoomStatus = async (roomNo: string, confirmationId: string) => {
  let roomStatus = false;
  if (roomNo) {
    try {
      const { data } = await client.query({
        query: GET_ROOM_STATUS,
        context: {
          clientName: 'rest',
          headers: { Authorization: 'Bearer ' + getCheckInToken() },
        },
        variables: {
          roomNumber: roomNo,
          confirmationId: confirmationId,
        },
      });
      roomStatus =
        data &&
        (data?.getRoomStatus?.data?.roomStatus === 'IP' ||
          data?.getRoomStatus?.data?.roomStatus === 'Available')
          ? true
          : false;
    } catch (error) {
      const statusCode = processStatusCode(error as ApolloError);
      if (statusCode === 403) {
        handleCheckInAuthenticationFailure(checkRoomStatus);
      } else {
        roomStatus = false;
      }
    }
  }
  return roomStatus;
};
