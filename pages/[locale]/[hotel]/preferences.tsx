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
import { StyledInput } from 'components/shared/StyledInput/StyledInput';
import { typeHereValidation } from 'validation/feedback.validation';
import { useFormik } from 'formik';
import cx from 'classnames';
import {
  CANCELED,
  CANCELLED,
  CHECKEDOUT,
  CHECKIN,
  CHKOUT,
  FAILURE,
  HEADERSCONFIG,
  NOSHOW,
  PREFERENCES,
  SUCCESS,
  YESNO,
} from 'utils/constants';
import { useConfig } from 'utils/hooks/useConfiguration';
import { StableImage } from 'components/shared/StableImage/StableImage';
import { GET_HOTEL_INFORMATION } from 'core/graphql/queries/GET_HOTEL_INFORMATION';
import { ASSETS_URL } from 'core/graphql/endpoints';
import { client } from 'core/graphql/client';
import { POST_REQUEST } from 'core/graphql/queries/POST_REQUEST';
import { availablePaths } from 'utils/availablePaths';
import { Loader } from 'components/shared/Loaders/Loaders';
import Head from 'next/head';
import { notificationStorage, toggleNotification } from 'storage/home.storage';
import {
  getCheckInToken,
  handleCheckInAuthenticationFailure,
} from 'core/api/functions/getCheckInAuthentication';
import { processStatusCode } from 'utils/processError';
import { useRouter } from 'next/router';
import { GET_RESERVATION, IGetReservationApiResponse } from 'core/graphql/queries/GET_RESERVATION';
import { saveTrip } from 'storage/trips.storage';
import { checkinStorage } from 'storage/check-in.storage';

export { getStaticPaths };

const Preferences = () => {
  const { t } = useTranslation(['common']);
  const config = useConfig();
  const locale = useLocale();
  const hotelId = useConfig()?.hotelId;
  const hotelName = useConfig()?.name;
  const navigate = useLocalizedRouter();
  const [selectedOptions, setSelectedOptions] = useState<any>({});
  const [loading, setLoading] = useState<any>(false);
  const router = useRouter();
  const resId = router?.query?.resId ?? '';
  const lastName = router?.query?.lastName ?? '';
  const reservationData = client.readQuery<IGetReservationApiResponse>({
    query: GET_RESERVATION,
  });

  const reservationInfo = reservationData?.getReservation?.data;
  const [commentText, setcommentText] = useState<any>();

  const getReservation = async () => {
    try {
      const token = await getCheckInToken(resId?.toString()?.trim(), lastName?.toString()?.trim());
      const { data } = await client.query({
        query: GET_RESERVATION,
        context: {
          clientName: 'rest',
          headers: {
            Authorization: 'Bearer ' + token,
          },
        },
        variables: {
          confirmationNumber: resId?.toString()?.trim(),
          lastName: lastName?.toString()?.trim(),
          hotelId: hotelId,
        },
        fetchPolicy: 'no-cache',
      });
      if (
        data.getReservation.data.reservationStatus === CANCELED ||
        data.getReservation.data.reservationStatus === CHKOUT ||
        data.getReservation.data.reservationStatus === CHECKEDOUT ||
        data.getReservation.data.reservationStatus === CANCELLED ||
        data.getReservation.data.reservationStatus === NOSHOW
      ) {
        notificationStorage({
          title: t('Reservation Not Found'),
          redirect: availablePaths?.HOME,
          type: FAILURE,
          description: t('Please proceed to the front desk for further assistance.'),
        });
        toggleNotification(true);
      } else if (data) {
        client.writeQuery({
          query: GET_RESERVATION,
          data,
        });
      }
      const reservationInformation = data?.getReservation?.data;
      saveTrip({
        reservationId:
          reservationInformation?.confirmationId !== 'NA'
            ? reservationInformation?.confirmationId
            : reservationInformation?.uniqueBookingId,
        preCheckedIn: false,
        checkedIn: false,
        firstName: reservationInformation?.details.contactPerson.firstName,
        lastName: reservationInformation?.details.contactPerson.lastName,
        email: reservationInformation?.details.contactPerson.email,
        phoneNumber: reservationInformation?.details?.contactPerson?.phoneNumber,
        roomNumber: reservationInformation?.roomTypes[0]?.roomNumber,
        invoiceId: reservationInformation?.reservationId,
        hotelId: hotelId,
      });
      checkinStorage({
        reservationId:
          reservationInformation?.confirmationId !== 'NA'
            ? reservationInformation?.confirmationId
            : reservationInformation?.uniqueBookingId,
        preCheckedIn: false,
        checkedIn: false,
        firstName: reservationInformation?.details.contactPerson.firstName,
        lastName: reservationInformation?.details.contactPerson.lastName,
        email: reservationInformation?.details.contactPerson.email,
        phoneNumber: reservationInfo?.details?.contactPerson?.phoneNumber,
        roomNumber: reservationInformation?.roomTypes[0]?.roomNumber,
        invoiceId: reservationInformation?.reservationId,
        currency: reservationInformation?.details.holdAmount.currency,
        hotelId: hotelId,
      });
    } catch (error) {
      const statusCode = processStatusCode(error as ApolloError);
      statusCode === 403
        ? handleCheckInAuthenticationFailure(getReservation)
        : (notificationStorage({
            title: t('Reservation Not Found'),
            redirect: availablePaths?.HOME,
            type: FAILURE,
          }),
          toggleNotification(true));
    }
  };

  useEffect(() => {
    if (resId && lastName) {
      getReservation();
      return;
    }

    const timeoutId = setTimeout(() => {
      if (!lastName || !resId) {
        notificationStorage({
          title: t('Reservation Not Found'),
          redirect: availablePaths?.HOME,
          type: FAILURE,
        });
        toggleNotification(true);
      }
    }, 2000);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastName, resId, t]);

  const homeModule: any = config?.modules?.find((module: any) => module?.code === PREFERENCES);
  const imageDetails = homeModule?.submodules?.find(
    (submodule: any) => submodule?.code === HEADERSCONFIG && submodule.isActive,
  )?.details[0];

  const { data, loading: feedbackLoading } = useQuery(GET_FEEDBACK, {
    skip: !hotelId,
    context: { clientName: 'property_e' },
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
      context: { clientName: 'property_a' },
      fetchPolicy: 'no-cache',
      variables: {
        hotelId: hotelId,
        lang: locale === 'en' ? '' : locale,
      },
    },
  );

  const hotelImages = homeCarouselDetails?.getPropertyDetailsByHotelId?.hotel?.images[0];

  const preferencesData = data?.listFeedback?.filter(
    (item: any) => item?.destination === CHECKIN && item?.isActive,
  );

  useEffect(() => {
    preferencesData?.length === 0 && navigate(availablePaths.HOME);
  }, [navigate, preferencesData, resId]);

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

  const formik = useFormik({
    initialValues: { typeHere: '' },
    validationSchema: typeHereValidation,
    onSubmit: (values) => {
      setcommentText(values.typeHere);
    },
  });

  const submit = async () => {
    const checkInToken = await getCheckInToken();
    const commentStrings = [];
    for (const categoryTitle in selectedOptions) {
      const comment = `${categoryTitle}: ${selectedOptions[categoryTitle].join(', ')}`;
      commentStrings.push(comment);
    }
    const preferencesComments = commentStrings.join(' | ');

    const comments = commentText
      ? `${preferencesComments} | comments: ${commentText}`
      : preferencesComments;

    const preferencesPayload = {
      bookingId: reservationInfo?.uniqueBookingId,
      reservationId: reservationInfo?.reservationId,
      commentId: '',
      comments: comments,
    };

    try {
      setLoading(true);
      await client.mutate({
        mutation: POST_REQUEST,
        context: { clientName: 'rest', headers: { Authorization: 'Bearer ' + checkInToken } },
        variables: {
          body: preferencesPayload,
        },
      });
      notificationStorage({
        title: t('Your Stay, Your Way!'),
        redirect: availablePaths?.HOME,
        type: SUCCESS,
        description: 'Thanks for sharing your preferences with us!',
      });
      toggleNotification(true);
      setLoading(false);
    } catch (uploadSignatureError) {
      const statusCode = processStatusCode(uploadSignatureError as ApolloError);
      statusCode === 403
        ? handleCheckInAuthenticationFailure(submit)
        : (notificationStorage({
            title: t('Oops!'),
            redirect: null,
            type: FAILURE,
            description: t('We are having an issue saving your preferences. Please try again.'),
          }),
          toggleNotification(true),
          setLoading(false));
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
              {preferencesData?.length > 0 &&
                preferencesData?.map((preference: any, index: number) => (
                  <div key={index} className={styles.buttonWrapper}>
                    <p className={styles.preferenceTitle}>{preference?.pageTitle}</p>
                    <div className={styles.preferenceWrap}>
                      {preference?.feedbackCategories?.length > 0 &&
                        preference?.feedbackCategories?.map(
                          (category: any, feedbackCategoriesIndex: number) =>
                            category?.type === YESNO && (
                              <div
                                key={feedbackCategoriesIndex}
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
                            ),
                        )}
                    </div>
                  </div>
                ))}
            </div>

            <div className={styles.commentTextWrapper}>
              <span className={styles.categoryTitle}>{t('Comments')} </span>
              <StyledInput
                placeholder={`${t('Type here')}`}
                multiline
                id='typeHere'
                onChange={(e) => {
                  formik.handleChange(e);
                  setcommentText(e.target.value);
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
                inputProps={{
                  maxLength: 150,
                }}
              />
            </div>

            <div className={cx(styles.bottomMenuWrapper)}>
              <StyledButton
                variant='contained'
                className={styles.bottomMenuButton}
                onClick={submit}
                loading={loading}
                disabled={Object.keys(selectedOptions)?.length === 0}
              >
                {t('Submit')}
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
      ...(await serverSideTranslations(locale as string, ['errors', 'common'], i18nConfig)),
    },
  };
};

export default Preferences;
