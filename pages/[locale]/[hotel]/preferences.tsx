import { Header } from 'components/shared/Header/Header';
import { PageWrapper } from 'components/shared/PageWrapper/PageWrapper';
import { GetStaticProps } from 'next';
import i18nConfig from 'next-i18next.config';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from '@styles/preferences/preferences.module.scss';
import { getStaticPaths } from 'utils/getStatic';
import { useLocale, useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { ApolloError, useQuery } from '@apollo/client';
import { GET_FEEDBACK } from 'core/graphql/queries/GET_FEEDBACK';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import cx from 'classnames';
import { CHECKIN, HEADERSCONFIG, PREFERENCES, YESNO } from 'utils/constants';
import { useConfig } from 'utils/hooks/useConfiguration';
import { StableImage } from 'components/shared/StableImage/StableImage';
import { GET_HOTEL_INFORMATION } from 'core/graphql/queries/GET_HOTEL_INFORMATION';
import { ASSETS_URL } from 'core/graphql/endpoints';
import { client } from 'core/graphql/client';
import { POST_REQUEST } from 'core/graphql/queries/POST_REQUEST';
import { availablePaths } from 'utils/availablePaths';
import { processError } from 'utils/processError';
import { buttonArrow } from 'utils/functions';
import { useCheckedIn } from 'storage/check-in.storage';
import { Loader } from 'components/shared/Loaders/Loaders';
import Head from 'next/head';

export { getStaticPaths };

const Preferences = () => {
  const { t } = useTranslation('dining');
  const isCheckedIn = useCheckedIn();
  const config = useConfig();
  const locale = useLocale();
  const hotelId = useConfig()?.hotelId;
  const hotelName = useConfig()?.name;
  const navigate = useLocalizedRouter();
  const [selectedOptions, setSelectedOptions] = useState<any>({});
  const [loading, setLoading] = useState<any>(false);
  const homeModule: any = config?.modules?.find((module) => module?.code === PREFERENCES);
  const imageDetails = homeModule?.submodules?.find(
    (submodule: any) => submodule?.code === HEADERSCONFIG && submodule.isActive,
  )?.details[0];

  const { data, loading: feedbackLoading } = useQuery(GET_FEEDBACK, {
    skip: !hotelId,
    context: { clientName: 'host_v4' },
    fetchPolicy: 'no-cache',
    variables: {
      hotelId: hotelId,
      lang: locale === 'en' ? '' : locale,
    },
  });

  const { data: homeCarouselDetails, loading: homeCarouselLoading } = useQuery(
    GET_HOTEL_INFORMATION,
    {
      skip: !hotelId,
      context: { clientName: 'host_v0' },
      fetchPolicy: 'no-cache',
      variables: {
        hotelId: hotelId,
        lang: locale === 'en' ? '' : locale,
      },
    },
  );

  const hotelImages = homeCarouselDetails?.getPropertyDetailsByHotelId?.hotel?.images[0];

  const preferencesData = data?.listFeedback?.filter((item: any) => item?.destination === CHECKIN);

  useEffect(() => {
    preferencesData?.length === 0 && navigate(availablePaths.HOME);
  }, [navigate, preferencesData]);

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

  const submit = async () => {
    const commentStrings = [];
    for (const categoryTitle in selectedOptions) {
      const comment = `${categoryTitle}: ${selectedOptions[categoryTitle].join(', ')}`;
      commentStrings.push(comment);
    }
    const comments = commentStrings.join(' | ');

    const preferencesPayload = {
      bookingId: isCheckedIn?.invoiceId,
      commentId: '',
      comments: comments,
    };

    try {
      setLoading(true);
      const uploadSignatureResponse = await client.mutate({
        mutation: POST_REQUEST,
        context: { clientName: 'rest' },
        variables: {
          body: preferencesPayload,
        },
      });
      navigate(availablePaths?.HOME);
      setLoading(false);
    } catch (uploadSignatureError) {
      processError(t, uploadSignatureError as ApolloError);
      setLoading(false);
    }
  };
  return (
    <>
      <Head>
        <title>
          {hotelName} | {t('Preferences')}
        </title>
      </Head>
      <Header screenTitle={t('Preferences') as string} displayHome />
      {homeCarouselLoading || feedbackLoading ? (
        <Loader />
      ) : (
        <PageWrapper className={styles.pageWrapper}>
          {hotelImages && (
            <StableImage className={styles.image} src={`${ASSETS_URL}/${hotelImages?.master}`} />
          )}

          <div className={styles.wrapper}>
            <div className={styles.title}>{imageDetails?.title}</div>
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
                            onClick={() =>
                              handleOptionSelect(preference?.pageTitle, category?.title)
                            }
                            className={cx(styles.button, {
                              [styles.buttonSelected]: selectedOptions[
                                preference.pageTitle
                              ]?.includes(category?.title),
                            })}
                          >
                            {category?.title}
                          </div>
                        )}
                      </>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className={cx(styles.bottomMenuWrapper)}>
              <StyledButton
                variant='contained'
                className={styles.bottomMenuButton}
                onClick={submit}
                loading={loading}
                arrow={buttonArrow}
                disabled={Object.keys(selectedOptions)?.length === 0}
              >
                {t('submit')}
              </StyledButton>
            </div>
          </div>
        </PageWrapper>
      )}
    </>
  );
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const locale = ctx?.params?.locale;

  return {
    props: {
      ...(await serverSideTranslations(locale as string, ['preferences', 'common'], i18nConfig)),
    },
  };
};

export default Preferences;
