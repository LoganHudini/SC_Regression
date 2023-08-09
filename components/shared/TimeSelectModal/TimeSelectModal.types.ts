import { Dispatch, SetStateAction } from 'react';
export interface ITimeSelectProps {
  toggleOpened: () => void;
  opened: boolean;
  setSelectedTime: React.Dispatch<React.SetStateAction<string>>;
  selectedTime?: string | null | undefined;
  minutesArrayProps?: any;
  selectedDate?: string;
  disable?: boolean;
  setDisable?: Dispatch<SetStateAction<boolean>>;
}
