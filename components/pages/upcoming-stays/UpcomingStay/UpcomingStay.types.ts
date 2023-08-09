import { IGetRoomDetailsApiResponse } from 'core/graphql/queries/GET_ROOM_DETAILS';
import { IGuestStorageData } from 'storage/guest-information.storage';
import { IPersonalizeYourRoomStorageData } from 'storage/personalize-your-room.storage';
import { TimeFilter } from '../UpcomingStaysFilter/UpcomingStaysFilter.types';

export interface IUpcomingStayProps {
  reservationId: string;
  selectedFilter: TimeFilter | null;
  roomDetails: IGetRoomDetailsApiResponse;
  specialRequests?: string;
  guests?: IGuestStorageData | null;
  personalizationEntities?: IPersonalizeYourRoomStorageData;
}
