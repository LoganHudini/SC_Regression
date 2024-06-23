import * as yup from 'yup';

export const identityVerificationValidation = yup.object({
  firstName: yup.string().required('Required'),
  lastName: yup.string().required('Required'),
  countryCode: yup.string().required('Required'),
  email: yup.string().email('Enter a valid email').required('Required'),
  phone: yup
    .string()
    .required('Required')
    .matches(
      /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/,
      'Please enter valid phone number',
    ),
  dob: yup.string().required('Required'),
  docNumber: yup.string().required('Required'),
  effectiveDate: yup.string().required('Required'),
  expiryDate: yup.string().required('Required'),
  nationality: yup.string().required('Required'),
  docType: yup.string().required('Required'),
  countryOfIssue: yup.string().required('Required'),
});
