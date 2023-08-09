import * as yup from 'yup';

export const emailMeValidation = yup.object({
  email: yup.string().email('Enter a valid email').required('Required'),
});
