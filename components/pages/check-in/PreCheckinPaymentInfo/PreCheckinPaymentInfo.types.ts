export interface IPreCheckinPaymentInfoProps {
  paymentInfo: any; // PaymentInfo
  creditCardInfoSection?: any;
  paymentType?: string;
}

export interface PaymentInfo {
  cardNumber?: string;
  expiryDate?: string;
  cardType?: string;
  cardHolderName?: string;
}
