import { useTranslation } from 'react-i18next';
import { TEXT } from 'utils/constants';
import { textFieldValidation } from 'utils/functions';
import * as yup from 'yup';
import parsePhoneNumber from 'libphonenumber-js';

export const validatePhoneNumber = (values: string) => {
  try {
    const value = values?.toString() || '';
    if (!value) return false;
    const parsedNumber = parsePhoneNumber(value);
    return parsedNumber?.isValid() || false;
  } catch (error: any) {
    return false;
  }
};

const useValidate = (sections: any) => {
  const { t } = useTranslation('check-in');

  return yup.object().shape(
    sections?.reduce((schema: any, field: any) => {
      const isActive = field?.isActive;
      const isRequired = field?.required;

      if (isActive) {
        if (field?.type === TEXT) {
          schema[field?.name] = textFieldValidation();
        } else {
          schema[field?.name] = yup.string();
        }

        const validationRules: any = {
          emails: {
            validation: yup.string().email(t('Invalid email format') as string),
            requiredMessage: t('Email is required'),
          },
          phone: {
            validation: yup
              .string()
              .test('isValidPhoneNumber', t('Invalid phone number') as string, (value) => {
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
                then: (schema) => schema.required(t('Phone Number is required') as string),
              }),
          },
          // Add more validation
        };

        if (validationRules[field?.name]) {
          schema[field?.name] = validationRules[field?.name].validation?.when([`${isRequired}`], {
            is: true,
            then: schema[field?.name]?.required(validationRules[field?.name]?.requiredMessage),
          });
        }

        if (isRequired) {
          schema[field?.name] = schema[field?.name]?.required(t(`${field?.label} is required`));
        }

        return schema;
      }

      return schema;
    }, {}),
  );
};

export default useValidate;
