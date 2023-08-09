import * as yup from 'yup';

export const TableNumberValidation = yup.object({
  tableNumber: yup.string().required('Table Number is a required field'),
});
