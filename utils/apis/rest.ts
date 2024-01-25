import { client } from 'core/graphql/client';
import { GET_ROOM_STATUS } from 'core/graphql/queries/GET_ROOM_STATUS';

export const checkRoomStatus = async (roomNo: string, hotelId: any) => {
  try {
    const { data } = await client.query({
      query: GET_ROOM_STATUS,
      context: { clientName: 'rest' },
      fetchPolicy: 'no-cache',
      variables: {
        roomNumber: roomNo,
        hotelId: hotelId,
      },
    });
    return data && data?.getRoomStatus?.data?.roomStatus === 'IP' ? true : false;
  } catch (e) {
    console.error(e);
  }
};
