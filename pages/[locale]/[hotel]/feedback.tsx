import { Header } from 'components/shared/Header/Header';
import { PageWrapper } from 'components/shared/PageWrapper/PageWrapper';
import { GetStaticProps } from 'next';
import i18nConfig from 'next-i18next.config';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from '@styles/feedback/feedback.module.scss';
import { getStaticPaths } from 'utils/getStatic';
import { useLocale, useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { ApolloError, useQuery } from '@apollo/client';
import { GET_FEEDBACK } from 'core/graphql/queries/GET_FEEDBACK';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import cx from 'classnames';
import { CHECK_OUT, EMAIL_CAPS, ERRORMSG, FAILURE, RATING5STARS, SUCCESS } from 'utils/constants';
import Okay from '@icons/okayFeedback.svg';
import Good from '@icons/goodFeedback.svg';
import Great from '@icons/greatFeedback.svg';
import { client } from 'core/graphql/client';
import { PostFeedback } from 'core/graphql/queries/FEEDBACK';
import dayjs from 'dayjs';
import { timeFormats } from 'utils/timeFormats';
import { availablePaths } from 'utils/availablePaths';
import Head from 'next/head';
import { useCheckedIn } from 'storage/check-in.storage';
import { useConfig } from 'utils/hooks/useConfiguration';
import { GET_HOTEL_INFORMATION } from 'core/graphql/queries/GET_HOTEL_INFORMATION';
import { Loader } from 'components/shared/Loaders/Loaders';
import { Notification } from 'components/shared/Notification/Notification';
import { toggleNotification } from 'storage/home.storage';
import { activeItems } from 'utils/functions';
import { checkoutTrip } from 'storage/trips.storage';
import { StyledInput } from 'components/shared/StyledInput/StyledInput';
import { useFormik } from 'formik';
import { typeHereValidation } from 'validation/feedback.validation';

export { getStaticPaths };

const Feedback = () => {
  const { t } = useTranslation(['feedback']);
  const [feedbackText, setFeedbackText] = useState<any>();
  const [selectedFeedback, setSelectedFeedback] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const isCheckedIn = useCheckedIn();
  const locale = useLocale();
  const hotelId = useConfig()?.hotelId;
  const hotelName = useConfig()?.name;
  const navigate = useLocalizedRouter();
  const [notificationState, setNotificationState] = useState<any>(false);

  const { data: homeCarouselDetails, loading: homeCarouselLoading } = useQuery(
    GET_HOTEL_INFORMATION,
    {
      skip: !hotelId,
      context: { clientName: 'property_a' },
      fetchPolicy: 'no-cache',
      variables: {
        hotelId: hotelId,
        lang: locale === 'en' ? '' : locale,
      },
    },
  );

  const { data, loading: feedbackLoading } = useQuery(GET_FEEDBACK, {
    skip: !hotelId,
    context: { clientName: 'property_e' },
    fetchPolicy: 'no-cache',
    variables: {
      hotelId: hotelId,
      lang: locale === 'en' ? '' : locale,
    },
  });

  const feedbackData = activeItems(
    data?.listFeedback?.filter((item: any) => item?.destination === CHECK_OUT),
  );
  const hotelEmail = homeCarouselDetails?.getPropertyDetailsByHotelId?.hotel?.information?.find(
    (inforamtion: any) => inforamtion?.field === EMAIL_CAPS,
  )?.value;

  const formik = useFormik({
    initialValues: { typeHere: '' },
    validationSchema: typeHereValidation,
    onSubmit: (values) => {
      setFeedbackText(values.typeHere);
    },
  });

  const handleButtonClick = (categoryTitle: any, rating: any) => {
    setSelectedFeedback((prevSelectedRatings: any) => ({
      ...prevSelectedRatings,
      [categoryTitle]: rating,
    }));
  };

  const feedbackPayload = {
    orgEmail: 'arun.r@hudini.io', // do not change, feedback should be sent to arun
    email: isCheckedIn?.email,
    space: hotelName,
    guestName: `${isCheckedIn?.firstName} ${isCheckedIn?.lastName}`,
    feedbackDate: dayjs().format(timeFormats.YEAR_MONTH_DAY),
    comments: feedbackText,
    feedbackCategories: Object.entries(selectedFeedback)?.map(([description, rating]) => ({
      description,
      rating: rating?.toString(),
    })),
  };

  const submit = async () => {
    try {
      setLoading(true);
      await client.mutate({
        mutation: PostFeedback,
        context: { clientName: 'rest_d' },
        variables: {
          body: feedbackPayload,
        },
      });
      setTimeout(() => {
        checkoutTrip();
      }, 5000);
      toggleNotification(true);
      setNotificationState({
        title: t('Thank You!'),
        description: t('Feedback submitted successfully'),
        redirect: availablePaths.HOME,
        type: SUCCESS,
        apolloError: null,
      });
      setLoading(false);
    } catch (uploadSignatureError) {
      setNotificationState({
        title: t(ERRORMSG),
        redirect: null,
        type: FAILURE,
        apolloError: uploadSignatureError as ApolloError,
      });
      toggleNotification(true);
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>
          {hotelName} | {t('Feedback') as string}
        </title>
      </Head>
      <Header screenTitle={t('Feedback') as string} />
      {homeCarouselLoading || feedbackLoading ? (
        <Loader />
      ) : (
        <PageWrapper className={styles.pageWrapper}>
          <div className={styles.wrapper}>
            <div className={styles.title}>{feedbackData && feedbackData[0]?.subtext}</div>
            {feedbackData?.map((preference: any, index: number) => (
              <>
                <p className={styles.preferenceTitle}>{t('Kindly rate our services')}</p>
                <div key={index} className={styles.buttonWrapper}>
                  {preference?.feedbackCategories?.map((category: any, index: number) => (
                    <>
                      {category?.type === RATING5STARS && (
                        <>
                          <div className={styles.ratingWrapper} key={index}>
                            <p className={styles.categoryTitle}>{category.title}</p>
                            <div className={styles.emojiWrapper}>
                              <div
                                className={styles.emojiContainer}
                                onClick={() => handleButtonClick(category.title, 1)}
                              >
                                <Okay
                                  className={cx(styles.button, {
                                    [styles.selectedOption]: selectedFeedback[category.title] === 1,
                                  })}
                                />
                                <span className={styles.emojiTitle}>{t('OKAY')}</span>
                              </div>
                              <div
                                className={styles.emojiContainer}
                                onClick={() => handleButtonClick(category.title, 2)}
                              >
                                <Good
                                  className={cx(styles.button, {
                                    [styles.selectedOption]: selectedFeedback[category.title] === 2,
                                  })}
                                />
                                <span className={styles.emojiTitle}>{t('GOOD')}</span>
                              </div>
                              <div
                                className={styles.emojiContainer}
                                onClick={() => handleButtonClick(category.title, 3)}
                              >
                                <Great
                                  className={cx(styles.button, {
                                    [styles.selectedOption]: selectedFeedback[category.title] === 3,
                                  })}
                                />
                                <span className={styles.emojiTitle}>{t('GREAT')}</span>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  ))}
                  <div className={styles.feedbackTextWrapper}>
                    <span className={styles.categoryTitle}>{t('Feedback')} </span>
                    <StyledInput
                      placeholder={`${t('Type here')}`}
                      multiline
                      id='typeHere'
                      onChange={(e) => {
                        formik.handleChange(e);
                        setFeedbackText(e.target.value);
                      }}
                      fullWidth
                      value={formik.values.typeHere}
                      autoComplete='off'
                      sx={{
                        '& .MuiOutlinedInput-input': {
                          textAlign: 'left',
                        },
                      }}
                      className={cx(styles.guestDataInput, styles.demo)}
                      InputProps={{
                        classes: {
                          notchedOutline: styles.customUnderline,
                        },
                      }}
                      variant='outlined'
                      error={Boolean(formik.errors.typeHere)}
                      helperText={formik.errors.typeHere ? t(formik.errors.typeHere) : null}
                    />
                  </div>
                </div>
              </>
            ))}

            <div className={cx(styles.bottomMenuWrapper)}>
              <StyledButton
                variant='contained'
                disabled={Boolean(formik.errors.typeHere)}
                className={styles.bottomMenuButton}
                onClick={() => {
                  feedbackText || Object.keys(selectedFeedback).length > 0
                    ? submit()
                    : (navigate(availablePaths.HOME), checkoutTrip());
                }}
                loading={loading}
              >
                {feedbackText || Object.keys(selectedFeedback).length > 0
                  ? t('Submit Feedback')
                  : t('Back To Home')}
              </StyledButton>
            </div>
          </div>
        </PageWrapper>
      )}
      <Notification
        translation={t}
        title={notificationState?.title}
        apolloError={notificationState?.apolloError}
        redirect={notificationState?.redirect}
        type={notificationState?.type}
        description={notificationState?.description}
      />
    </>
  );
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const locale = ctx?.params?.locale;

  return {
    props: {
      ...(await serverSideTranslations(locale as string, ['errors', 'feedback'], i18nConfig)),
    },
  };
};

export default Feedback;
