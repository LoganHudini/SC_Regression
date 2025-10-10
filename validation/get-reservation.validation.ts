import * as yup from 'yup';
import { textFieldValidation } from '../utils/functions';
import { EMAIL_REGEX, PHONE_REGEX } from 'utils/constants';
import parsePhoneNumber from 'libphonenumber-js';
import { validatePhoneNumber } from 'utils/hooks/useValidate';

export const getReservationForCheckinValidation = yup.object({
  confirmationNumber: textFieldValidation().required('Booking ID is a required field'),
  lastName: textFieldValidation().required('Last Name is a required field'),
});

export const getcheckInTokenValidation = yup.object({
  confirmationNumber: textFieldValidation().required('Booking ID is a required field'),
});

export const getReservationForConnectToRoomValidation = yup.object({
  roomNo: textFieldValidation().required('Room Number is a required field'),
  lastName: textFieldValidation().required('Last Name is a required field'),
});

export const getEmailRoomValidation = yup.object({
  email: textFieldValidation().required('Email is required').email('Invalid email'),
});

export const getPhoneEmailValidation = yup.object({
  firstName: yup
    .string()
    .required('First Name is required')
    .test('First Name is required', (value: any) => value && value?.trim().length > 0),
  lastName: yup
    .string()
    .required('Last Name is required')
    .test('Last Name is required', (value: any) => value && value?.trim().length > 0),
  phoneNumber: yup
    .string()
    .required('Phone Number is required')
    .matches(PHONE_REGEX, 'Invalid Phone Number')
    .test('Phone Number is required', (value: any) => value && value?.trim().length > 0),
  email: yup
    .string()
    .required('Email is required')
    .matches(EMAIL_REGEX, 'Invalid Email')
    .test('Email is required', (value: any) => value && value?.trim()?.length > 0),
  gender: yup.string().required('Gender is required'),
});

// toggle this based on your form requirements
const isRequired = true; // or pass as argument if needed dynamically

export const getPhoneEmailValidationForTableReservation = () => {
  // const { t } = useTranslation('check-in');
  return yup.object({
    phoneNumber: yup
      .string()
      .test('isValidPhoneNumber', 'Invalid phone number' as string, (value) => {
        if (!value) return !isRequired;
        const phoneString = String(value);
        const parsedPhone = parsePhoneNumber(phoneString);

        return isRequired
          ? validatePhoneNumber(phoneString)
          : parsedPhone?.nationalNumber || phoneString.split(' ')[1]
          ? validatePhoneNumber(phoneString)
          : true;
      })
      .when([], {
        is: () => isRequired,
        then: (schema) => schema.required('Phone Number is required' as string),
      }),

    email: yup
      .string()
      .required('Email is required' as string)
      .matches(EMAIL_REGEX, 'Invalid Email' as string)
      .test('Email is required', (value: any) => value && value?.trim()?.length > 0),

    lastName: textFieldValidation().required('Last Name is a required field' as string),

    firstName: textFieldValidation().required('First Name is a required field' as string),
  });
};
