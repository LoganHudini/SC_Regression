import * as yup from 'yup';

export const deviceActivationValidation = yup.object({
  confirmationNumber: yup.string().required('Required'),
  lastName: yup.string().required('Required'),
});
