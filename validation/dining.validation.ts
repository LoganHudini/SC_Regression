import * as yup from 'yup';
import { textFieldValidation } from '../utils/functions';

export const instructionValidation = yup.object({
  instruction: textFieldValidation(),
});
