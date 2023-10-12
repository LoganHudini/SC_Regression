import * as yup from 'yup';

export const AccompanyFormValidation = yup.object().shape({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  id: yup.string().required('ID number is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  dob: yup.string().required('Date of birth is required'),
  phoneNo: yup.number().required('Phone number is required'),
  condition: yup.boolean().oneOf([true], 'You must accept the conditions'),
});
