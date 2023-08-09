export interface IPreCheckinPaymentInfoProps {
  paymentInfo: PaymentInfo;
}

export interface PaymentInfo {
  cardNumber?: string;
  expiryDate?: string;
  cardType?: string;
  cardHolderName?: string;
}
