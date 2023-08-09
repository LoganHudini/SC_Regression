import { IPersonalizeYourRoomStorageData } from 'storage/personalize-your-room.storage';

export interface IRoomPersonalizationEntityProps {
  title: string;
  description: string;
  type: 'PER_DAY' | 'PER_STAY';
  price: string;
  currency: string;
  id: string;
  count: string;
  setCurrentPersonalizationEntities: React.Dispatch<
    React.SetStateAction<IPersonalizeYourRoomStorageData>
  >;
}
