import * as yup from 'yup';
import { textFieldValidation } from '../utils/functions';

export const typeHereValidation = yup.object({
  typeHere: textFieldValidation(),
});
