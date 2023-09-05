export interface IPreCheckinDocInfoProps {
  docInfo: any; // DocInfo
  identityVerificationSection?: any;
}

export interface DocInfo {
  docType: string | undefined;
  docNo: string | undefined;
}
