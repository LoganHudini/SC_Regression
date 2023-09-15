import { Header } from 'components/shared/Header/Header';
import { PageWrapper } from 'components/shared/PageWrapper/PageWrapper';
import { GetStaticProps } from 'next';
import i18nConfig from 'next-i18next.config';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from '../../styles/preferences/preferences.module.scss';
import { getStaticPaths } from 'utils/getStatic';
import { useRouter } from 'next/router';
import { useLocale, useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { useQuery } from '@apollo/client';
import { GET_FEEDBACK } from 'core/graphql/queries/GET_FEEDBACK';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import cx from 'classnames';
import { HEADERSCONFIG, PREFERENCES, YESNO } from 'utils/constants';
import { getConfig } from 'utils/getConfiguration';
import { StableImage } from 'components/shared/StableImage/StableImage';
import { GET_HOTEL_INFORMATION } from 'core/graphql/queries/GET_HOTEL_INFORMATION';
import { ASSETS_URL } from 'core/graphql/endpoints';

export { getStaticPaths };

const Preferences = () => {
  const { t } = useTranslation('dining');
  const router = useRouter();
  const config = getConfig();

  const locale = useLocale();
  const navigate = useLocalizedRouter();
  const [selectedOptions, setSelectedOptions] = useState<any>({});
  const homeModule: any = config?.modules?.find((module) => module?.code === PREFERENCES);
  const imageDetails = homeModule?.submodules?.find(
    (submodule: any) => submodule?.code === HEADERSCONFIG && submodule.isActive,
  )?.details[0];

  const { data } = useQuery(GET_FEEDBACK, {
    context: { clientName: 'host_v4' },
    fetchPolicy: 'no-cache',
  });

  const { data: homeCarouselDetails, loading: homeCarouselLoading } = useQuery(
    GET_HOTEL_INFORMATION,
    {
      context: { clientName: 'host_v0' },
      fetchPolicy: 'no-cache',
    },
  );

  const hotelImages = homeCarouselDetails?.getPropertyDetailsByHotelId?.hotel?.images[0];

  const preferencesData = data?.listFeedback;
  const handleOptionSelect = (categoryTitle: any, option: any) => {
    setSelectedOptions((prevSelectedOptions: any) => {
      const isSelected = prevSelectedOptions[categoryTitle]?.includes(option);
      if (isSelected) {
        const updatedOptions = prevSelectedOptions[categoryTitle].filter(
          (selectedOption: any) => selectedOption !== option,
        );
        if (updatedOptions.length === 0) {
          const updatedSelectedOptions = { ...prevSelectedOptions };
          delete updatedSelectedOptions[categoryTitle];
          return updatedSelectedOptions;
        }
        return {
          ...prevSelectedOptions,
          [categoryTitle]: updatedOptions,
        };
      } else {
        return {
          ...prevSelectedOptions,
          [categoryTitle]: [...(prevSelectedOptions[categoryTitle] || []), option],
        };
      }
    });
  };

  return (
    <>
      <Header screenTitle={t('Preferences') as string} displayHome />

      <PageWrapper className={styles.pageWrapper}>
        {hotelImages && (
          <StableImage className={styles.image} src={`${ASSETS_URL}/${hotelImages?.master}`} />
        )}

        <div className={styles.wrapper}>
          <div className={styles.title}>{imageDetails.title}</div>
          <div className={styles.container}>
            {preferencesData?.map((preference: any, index: number) => (
              <div key={index} className={styles.buttonWrapper}>
                <p className={styles.preferenceTitle}>{preference.pageTitle}</p>
                <div className={styles.preferenceWrap}>
                  {preference.feedbackCategories.map((category: any, index: number) => (
                    <>
                      {category?.type === YESNO && (
                        <div
                          key={index}
                          onClick={() => handleOptionSelect(preference.pageTitle, category.title)}
                          className={cx(styles.button, {
                            [styles.buttonSelected]: selectedOptions[
                              preference.pageTitle
                            ]?.includes(category.title),
                          })}
                        >
                          {category.title}
                        </div>
                      )}
                    </>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className={styles.confirmOrderButton}>
            <div className={styles.confirmationWrapperBotton}>
              <StyledButton
                className={styles.submitButton}
                //   onClick={submit}
                variant='contained'
              >
                {t('submit')}
              </StyledButton>
            </div>
          </div>
        </div>
      </PageWrapper>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const locale = ctx?.params?.locale;

  return {
    props: {
      ...(await serverSideTranslations(locale as string, ['common'], i18nConfig)),
    },
  };
};

export default Preferences;
