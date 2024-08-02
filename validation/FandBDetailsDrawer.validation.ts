import { textFieldValidation } from 'utils/functions';
import * as yup from 'yup';

export const CheckinDetailsValidation = yup.object({
  name: textFieldValidation().required('Name is a required field'),
  roomNumber: textFieldValidation().required('Room Number is a required field'),
});

export const CheckinDetailsValidationWithoutRoomNo = yup.object({
  phoneNumber: yup
    .string()
    .required('Phone Number is a required field')
    .matches(
      /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/,
      'Please enter valid phone number',
    ),
  name: textFieldValidation().required('Name is a required field'),
});
