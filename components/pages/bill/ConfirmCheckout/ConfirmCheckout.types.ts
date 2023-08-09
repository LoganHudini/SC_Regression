export interface ConfirmCheckoutProps {
  totalAmountDue: string;
  toggleOpened: () => void;
  opened: boolean;
  reservationType: string;
  reservationId: string;
  bookingId: string;
}
