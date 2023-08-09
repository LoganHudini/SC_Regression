import { IGetRoomDetailsApiResponse } from 'core/graphql/queries/GET_ROOM_DETAILS';

export interface ICheckinProps {
  roomDetails: IGetRoomDetailsApiResponse;
  countryCodes: {
    code: string;
    name: string;
  }[];
}
