import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import {
  GET_SALUTATIONS,
  IGetSalutationsResponse,
  ISalutationValue,
} from 'core/graphql/queries/GET_SALUTATIONS';
import { useConfig } from './useConfiguration';
import { useLocale } from './useLocalizedRouter';

export const useSalutations = () => {
  const config = useConfig();
  const locale = useLocale();
  const hotelId = config?.hotelId;

  const { data, loading, error } = useQuery<IGetSalutationsResponse>(GET_SALUTATIONS, {
    variables: {
      hotelId: hotelId,
      lang: locale === 'en' ? '' : locale,
    },
    skip: !hotelId,
    context: { clientName: 'property_g' },
    errorPolicy: 'all',
  });

  const salutations = useMemo(() => {
    if (!data?.getLov || data.getLov.length === 0) {
      return [];
    }

    const lovData = data.getLov[0];
    if (!lovData.lists || lovData.lists.length === 0) {
      return [];
    }

    const titleList = lovData.lists.find((list) => list.listName === 'title');
    if (!titleList?.languages || titleList.languages.length === 0) {
      return [];
    }

    const currentLang = locale === 'en' ? 'en' : locale;
    let languageData = titleList.languages.find((lang) => lang.lang === currentLang);

    if (!languageData) {
      languageData = titleList.languages.find((lang) => lang.lang === 'en');
    }

    if (!languageData && titleList.languages.length > 0) {
      languageData = titleList.languages[0];
    }

    if (!languageData?.values) {
      return [];
    }

    return languageData.values.map((value: ISalutationValue) => ({
      name: value.name,
      value: value.id,
      label: value.name,
    }));
  }, [data, locale]);

  return {
    salutations,
    loading,
    error,
    hasSalutations: salutations.length > 0,
  };
};
