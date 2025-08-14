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
            validation: yup
              .string()
              .email(t('Invalid email format') as string)
              .test(
                'no-globally-prohibited-chars',
                t('Invalid email format') as string,
                (value: string | undefined) => {
                  if (!value) return true;

                  const globallyProhibitedChars = /[£•√π÷×§∆€°©®™✓#]/;
                  return !globallyProhibitedChars.test(value);
                },
              )
              .test(
                'domain-rules',
                t('Invalid email format') as string,
                (value: string | undefined) => {
                  if (!value) return true;
                  const parts = value.split('@');

                  if (parts.length !== 2 || !parts[1] || parts[1].trim() === '') {
                    return false;
                  }
                  const domainPart = parts[1];

                  const domainRegex =
                    /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,63}$/;
                  return domainRegex.test(domainPart);
                },
              ),
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
          firstName: {
            validation: yup
              .string()
              .matches(
                /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/,
                t('First Name can only contain letters') as string,
              )
              .trim(),
            requiredMessage: t('First Name is required'),
          },
          lastName: {
            validation: yup
              .string()
              .matches(
                /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/,
                t('Last Name can only contain letters') as string,
              )
              .trim(),
            requiredMessage: t('Last Name is required'),
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
