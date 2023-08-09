export interface EmailMeProps {
  toggleOpened: () => void;
  opened: boolean;
  reservationId: string;
  registeredGuest: string;
  email: string;
}
