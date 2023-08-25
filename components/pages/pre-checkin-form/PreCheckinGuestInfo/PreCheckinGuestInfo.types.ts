export interface IPreCheckinGuestInfoProps {
  selectedGuest: any; // SelectedGuest
  guestInformationSection?: any;
}

export interface SelectedGuest {
  firstName: string | undefined;
  lastName: string | undefined;
  email: string | undefined;
  phone: string | undefined;
}
