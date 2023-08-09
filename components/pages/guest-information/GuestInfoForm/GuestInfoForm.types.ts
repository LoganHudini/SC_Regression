import { IGuest } from 'types/guest-information.types';

export interface GuestInfoFormProps {
  guest: IGuest;
  primary?: boolean;
  handleUpdateGuest: (guestId: string) => void;
  country?: string;
  index: number;
}
