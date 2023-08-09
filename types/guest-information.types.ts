export interface IGuest {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  countryCode: string;
  addressLine1: string;
  addressLine2: string;
  nationality: string;
  docType: string;
  docNumber: string;
  effectiveDate: string;
  expiryDate: string;
  countryOfIssue: string;
  dob: string;
  id: string;

  document?: {
    base64: string;
    contentType: string;
    fileName: string;
  };
}

export interface IGuestInformationProps {
  countryCodes: { code: string; name: string }[] | null;
}

export interface IGuestInfo {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  id: string;
}

export interface IDocInfo {
  docNo: string;
  docType: string;
  id: string;
  effectiveDate: string;
  expiryDate: string;
  issueCountry: string;
}

export interface IPaymentInfo {
  cardNumber: string;
  cardExpiryDate: string;
  cardType: string;
  cardHolderName: string;
  id: string;
}
