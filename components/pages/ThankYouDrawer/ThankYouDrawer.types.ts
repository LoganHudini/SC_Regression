import { Dispatch, SetStateAction } from 'react';

export interface IThankYouDrawerProps {
  opened: boolean;
  title?: string;
  redirect: string;
  close: Dispatch<SetStateAction<boolean>>;
}
