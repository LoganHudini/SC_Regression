import * as yup from 'yup';
import { textFieldValidation } from '../utils/functions';

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
