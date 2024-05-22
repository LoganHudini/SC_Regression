import { useTranslation } from 'react-i18next';
import { PHONE_REGEX } from 'utils/constants';
import * as yup from 'yup';

const useValidate = (sections: any) => {
  const { t } = useTranslation('check-in');

  return yup.object().shape(
    sections.reduce((schema: any, field: any) => {
      const isActive = field?.isActive;
      const isRequired = field?.required;

      if (isActive) {
        schema[field?.name] = yup.string();

        const validationRules: any = {
          emails: {
            validation: yup.string().email(t('Invalid email format') as string),
            requiredMessage: t('Email is required'),
          },
          phone: {
            validation: yup.string().matches(PHONE_REGEX, t('Invalid phone number') as string),
            requiredMessage: t('Phone Number is required'),
          },
          // Add more validation
        };

        if (validationRules[field?.name]) {
          schema[field?.name] = validationRules[field?.name].validation.when([`${isRequired}`], {
            is: true,
            then: schema[field?.name].required(validationRules[field?.name].requiredMessage),
          });
        }

        if (isRequired) {
          schema[field?.name] = schema[field?.name].required(t(`${field?.label} is required`));
        }

        return schema;
      }

      return schema;
    }, {}),
  );
};

export default useValidate;
