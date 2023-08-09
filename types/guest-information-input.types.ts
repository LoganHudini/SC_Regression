export interface IIdentityVerificationProps {
  docTypes: { code: string; name: string }[] | null;
  countryCodes: { code: string; name: string }[] | null;
}
