import { ApolloError } from '@apollo/client';
import { TFunction } from 'i18next';
import { toast } from 'react-toastify';

export const processError = (t: TFunction, error?: ApolloError) => {
  const networkError = error?.networkError as { result?: { errors?: string } };

  if (networkError?.result?.errors) {
    toast(networkError.result.errors, { type: 'error' });
  } else {
    toast(t('common:PleaseTryAgain'), { type: 'error' });
  }
};
