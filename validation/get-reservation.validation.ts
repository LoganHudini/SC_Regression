import * as yup from 'yup';
import { textFieldValidation } from '../utils/functions';
import { EMAIL_REGEX, PHONE_REGEX } from 'utils/constants';

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
