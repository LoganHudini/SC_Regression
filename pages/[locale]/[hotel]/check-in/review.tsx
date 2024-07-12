/* eslint-disable camelcase */
import Head from 'next/head';
import SignatureCanvas from 'react-signature-canvas';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Header } from 'components/shared/Header/Header';
import { PageWrapper } from 'components/shared/PageWrapper/PageWrapper';
import { StyledCheckBox } from 'components/shared/StyledCheckBox/StyledCheckBox';
import styles from '@styles/check-in-v2/check-in-v2.module.scss';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import { guestInformationStorage } from 'storage/guest-information.storage';
import { ApolloError, useReactiveVar } from '@apollo/client';
import {
  personalizeYourRoomStorage,
  upgradeYourRoomStorage,
} from 'storage/personalize-your-room.storage';
import { client } from 'core/graphql/client';
import { IGetReservationApiResponse, GET_RESERVATION } from 'core/graphql/queries/GET_RESERVATION';
import { CHECKIN, ICheckInApiRequest, PRECHECKIN } from 'core/graphql/queries/CHECKIN';
import { ICheckinProps } from 'types/check-in.types';
import { GetStaticProps } from 'next';
import { saveTrip } from 'storage/trips.storage';
import { StepperInformationStorage, checkinStorage } from 'storage/check-in.storage';
import {
  IPreSignDocUploadApiRequest,
  IPreSignDocUploadApiResponse,
  PRE_SIGN_DOC_UPLOAD,
} from 'core/graphql/queries/PRE_SIGN_DOC_UPLOAD';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'react-i18next';
import { getStaticPaths } from 'utils/getStatic';
import i18nConfig from 'next-i18next.config';
import { availablePaths } from 'utils/availablePaths';
import { DetailsCard, DetailsCardShrinked } from 'components/shared/DetailsCard/DetailsCard';
import { timeFormats } from 'utils/timeFormats';
import dayjs from 'dayjs';
import cx from 'classnames';
import { reservationGuestInfoStorageData } from 'storage/reservation-guest-info.storage';
import {
  PRE_CHECKIN_ERROR_MSG,
  cardTypes,
  CHECK_IN,
  REVIEW,
  CHKOUT,
  CANCELED,
  STEPPER_CHECK_IN,
  SUCCESS,
  FAILURE,
  CARD_TYPE,
  NOSHOW,
  ERRORMSG,
  NONE,
  WEBURL2,
  DOCUMENT_LIST,
  CHECKEDOUT,
  INFORMATION,
  GUESTINFORMATION,
  ACCOMPANYINGGUEST,
  personalisation,
  CMS,
  PMS,
} from 'utils/constants';
import { Notification } from 'components/shared/Notification/Notification';
import { hotelInformation, setDayjsLocale, toggleNotification } from 'storage/home.storage';
import { useConfig, usePaymentConfig } from 'utils/hooks/useConfiguration';
import { Stepper } from 'components/shared/Stepper/Stepper';
import produce from 'immer';
import {
  accompanyGuestDetails,
  updateNewAccompanyGuestDetails,
} from 'storage/accompany-guest-details';
import {
  getCheckInToken,
  handleCheckInAuthenticationFailure,
} from 'core/api/functions/getCheckInAuthentication';
import { processStatusCode } from 'utils/processError';
import { ASSETS_URL, S3_URL } from 'core/graphql/endpoints';
import Link from 'next/link';
import { fetchCharges, formatPrice } from 'utils/functions';
import Resizer from 'react-image-file-resizer';
import { UPDATE_EVA } from 'core/graphql/queries/UPDATE_EVA';
import { getHotelId } from 'utils/fetchConfigs';
import { Loader } from 'components/shared/Loaders/Loaders';

export { getStaticPaths };

const CheckIn: React.FC<ICheckinProps> = () => {
  const { t } = useTranslation(['check-in', 'common']);
  const navigate = useLocalizedRouter();
  const config = useConfig();
  const paymentConfig: any = usePaymentConfig();
  const hotelId = config?.hotelId;
  const guests = useReactiveVar(guestInformationStorage);
  const guestReservationInfo = useReactiveVar(reservationGuestInfoStorageData);
  const accompanyGuestInfo = useReactiveVar(accompanyGuestDetails);
  const updatedGuestData = useReactiveVar(updateNewAccompanyGuestDetails);
  const hotelInfo = useReactiveVar(hotelInformation);
  const dayjsLocaleLoader = useReactiveVar(setDayjsLocale);
  const [accompanyGuestInformationState, setAcccompanyGuestInformation] = useState(
    new Array(accompanyGuestInfo?.length)?.fill(false),
  );
  const personalizationEntities = useReactiveVar(personalizeYourRoomStorage);
  const upgradeRoomEntities = useReactiveVar(upgradeYourRoomStorage);
  const [errorNotification, setErrorNotification] = useState(false);
  const [conditionsAccepted, setConditionsAccepted] = useState(false);
  const [btnStatus, setBtnStatus] = useState(false);
  const [errorText, setErrorText] = useState(t('Please proceed to the front desk!'));
  const [signature, setSignature] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [signatureWidth, setSignatureWidth] = useState(340);

  // card expansion states
  const [stayInformation, setStayInformation] = useState(false);
  const [primaryGuestInformation, setPrimaryGuestInformation] = useState(false);
  const [creditCardInformation, setCreditCardInformation] = useState(false);

  const data: any = client.readQuery<IGetReservationApiResponse>({
    query: GET_RESERVATION,
  });
  const reservationInfo = data?.getReservation?.data;
  const adult = reservationInfo?.details.adultGuestCount.toString();
  const children = reservationInfo?.details.childGuestCount.toString();
  const roomNo = reservationInfo?.roomTypes[0]?.roomNumber;

  const cardType = cardTypes
    ?.find((item) => item?.code === guestReservationInfo?.cardType)
    ?.name?.toUpperCase();

  const checkInModule: any = config?.modules?.find((module: any) => module?.code === CHECK_IN);
  const reviewConfig = checkInModule?.submodules?.find(
    (submodule: any) => submodule?.name === REVIEW && submodule.isActive,
  );

  const guestSubmodule = checkInModule?.submodules?.find(
    (submodule: any) => submodule?.name === INFORMATION && submodule?.isActive,
  );
  const activeSections = guestSubmodule?.details?.filter((section: any) => section?.isActive);
  const guestInformationSection = activeSections?.find(
    (section: any) => section?.name === GUESTINFORMATION && section.isActive,
  );

  const accompanyingGuestSubmodule = checkInModule?.submodules?.find(
    (submodule: any) => submodule?.name === ACCOMPANYINGGUEST && submodule.isActive,
  );

  const personalisationConfig = checkInModule?.submodules?.find(
    (submodule: any) => submodule?.name === personalisation && submodule.isActive,
  );

  useEffect(() => {
    const signatureWidth = () => {
      const div = document.getElementById('signatureWrapper');
      if (div) {
        setSignatureWidth(div.offsetWidth);
      }
    };
    signatureWidth();
    window.addEventListener('resize', signatureWidth);

    return () => {
      window.removeEventListener('resize', signatureWidth);
    };
  }, []);

  useEffect(() => {
    if (
      !data ||
      data?.getReservation?.data?.reservationStatus === CANCELED ||
      data?.getReservation?.data?.reservationStatus === CHECKEDOUT ||
      data.getReservation.data.reservationStatus === CHKOUT ||
      data.getReservation.data.reservationStatus === NOSHOW
    ) {
      navigate(availablePaths?.HOME);
    }
  }, [data, navigate]);

  const preCheckInStatus = config?.preCheckInOnly
    ? true
    : !(roomNo && guestReservationInfo?.roomStatus && paymentConfig?.type !== NONE)
    ? true
    : false;

  useEffect(() => {
    if (conditionsAccepted && sigCanvas?.current && signature !== null) {
      setBtnStatus(true);
    } else {
      setBtnStatus(false);
    }
  }, [conditionsAccepted, signature]);

  const sigCanvas = useRef<SignatureCanvas>(null);

  const clearCanvas = useCallback(() => {
    if (sigCanvas.current) {
      sigCanvas?.current?.clear();
      setSignature(null);
      setBtnStatus(false);
    }
  }, []);

  const toggleConditionsAccepted = useCallback(() => {
    setConditionsAccepted((oldState) => !oldState);
  }, []);

  const handleSignatureChange = () => {
    setSignature(sigCanvas?.current);
  };

  const goToCheckIn = useCallback(async () => {
    setLoading(true);
    let guestSignature = '';

    // upload guest signature
    const uploadSignaturePayload: IPreSignDocUploadApiRequest = {
      groupId: 'e8030f49-afb1-43fc-80f6-c0515b62d5f6',
      type: 'reservation_docs',
      propertyType: 'hotels',
      confirmationId: reservationInfo?.confirmationId ?? '',
      filename: `${guests ? guests[0]?.firstName : ''}_${
        guests ? guests[0].lastName : ''
      }_signature.png`,
      contentType: 'image/png',
      contentLength: 8196,
      body: null,
      contents: (sigCanvas.current?.toDataURL() as string).replace('data:image/png;base64,', ''),
      isDocUpload: true,
    };
    const uploadSignature = async () => {
      const checkInToken = getCheckInToken();
      try {
        const uploadSignatureResponse = await client.query<IPreSignDocUploadApiResponse>({
          query: PRE_SIGN_DOC_UPLOAD,
          context: { clientName: 'rest', headers: { Authorization: 'Bearer ' + checkInToken } },
          variables: {
            confirmationNumber: reservationInfo?.confirmationId as string,
            body: uploadSignaturePayload,
          },
        });
        guestSignature = uploadSignatureResponse?.data?.preSignDocUpload?.data?.key;
      } catch (uploadSignatureError) {
        const statusCode = processStatusCode(uploadSignatureError as ApolloError);
        statusCode === 403
          ? handleCheckInAuthenticationFailure(uploadSignature)
          : setErrorNotification(true);
      }
    };
    await uploadSignature();

    // check-in
    if (guestSignature) {
      const checkInPayload: ICheckInApiRequest = {
        reservationType: reservationInfo?.confirmationType as string,
        reservationId: reservationInfo?.reservationId as string,
        bookingId: reservationInfo?.confirmationId as string,
        checkinDate: dayjs(reservationInfo?.details?.checkInDate as string).format(
          timeFormats.YEAR_MONTH_DAY,
        ),
        checkoutDate: dayjs(reservationInfo?.details?.checkOutDate as string).format(
          timeFormats.YEAR_MONTH_DAY,
        ),
        roomNo: roomNo as string,
        roomType: reservationInfo?.roomTypes[0]?.shortName as string,
        primaryGuestEmail: guestReservationInfo?.emails as string,
        primaryGuestFirstName: guestReservationInfo?.firstName as string,
        primaryGuestLastName: guestReservationInfo?.lastName as string,
        firstName: guestReservationInfo?.firstName as string,
        lastName: guestReservationInfo?.lastName as string,
        primaryGuestMobileNumber: guestReservationInfo?.phone as string,
        primaryGuestAddress: guestReservationInfo?.addressLine,
        country: guestReservationInfo?.nationality,
        profession: guestReservationInfo?.profession,
        guests: accompanyGuestInfo?.map(
          (guest: { firstName: string; lastName: string; emails: string; phone: string }) => ({
            firstName: guest?.firstName,
            lastName: guest?.lastName,
            email: guest?.emails,
            phone: guest?.phone,
          }),
        ),
        guestCount: {
          adult: adult,
          children: children,
        },
        paymentType: paymentConfig?.paymentMethod ?? guestReservationInfo?.paymentType,
        expirationDate: guestReservationInfo?.cardExpiryDate as string,
        cardHolderName:
          guestReservationInfo?.cardHolderName ||
          guestReservationInfo?.firstName + guestReservationInfo?.lastName,
        creditCardType: guestReservationInfo?.cardType,
        lastFourDigits: guestReservationInfo?.cardNumber?.substr(
          guestReservationInfo?.cardNumber?.length - 4,
        ),
        cardID: guestReservationInfo?.approvalCode ?? '',
        vaultedCardID: guestReservationInfo?.token,
        settlementType: paymentConfig?.settlementType ?? guestReservationInfo?.cardType,
        documentType: guestReservationInfo?.docType
          ? guestReservationInfo?.docType
          : reservationInfo?.guests[0]?.docType,
        documentNumber: guestReservationInfo?.docNo
          ? guestReservationInfo?.docNo
          : reservationInfo?.guests[0]?.docNo,
        channel: 'PWA',
        upsell:
          personalisationConfig?.type === PMS
            ? personalizationEntities?.map((personalization) => ({
                upsellName: personalization?.title,
                revenue: Number(Number(personalization?.price).toFixed(2)),
              }))
            : [],
        guestSignature: guestSignature,
        comment:
          personalisationConfig?.type === CMS
            ? personalizationEntities?.map((personalization) => ({
                upsellName: personalization?.title,
                revenue: Number(Number(personalization?.price).toFixed(2)),
              }))
            : '',
        isDoNotMove: true,
        arrivalFlight: guestReservationInfo?.estimatedTime ?? '',
        depositAmount: paymentConfig?.type !== NONE ? String(fetchCharges(reservationInfo)) : '',
        specialInstructions:
          paymentConfig?.type !== NONE
            ? 'vaultedCardID: ' + guestReservationInfo?.token ??
              '' +
                ', lastFourDigits: ' +
                (guestReservationInfo?.cardNumber?.length > 4
                  ? guestReservationInfo?.cardNumber.substr(
                      guestReservationInfo?.cardNumber.length - 4,
                    )
                  : guestReservationInfo?.cardNumber) ??
              '' + ', cardType: ' + cardType ??
              '' + ', expiryDate: ' + guestReservationInfo?.cardExpiryDate ??
              '' + ', approvalCode: ' + guestReservationInfo?.approvalCode ??
              '' + ', authorizedAmount: ' + String(fetchCharges(reservationInfo)) ??
              ''
            : '',
      };
      const checkIn = async () => {
        const checkInToken = getCheckInToken();
        try {
          await client.query({
            query: preCheckInStatus ? PRECHECKIN : CHECKIN,
            context: { clientName: 'rest', headers: { Authorization: 'Bearer ' + checkInToken } },
            variables: {
              confirmationNumber: reservationInfo?.confirmationId as string,
              body: checkInPayload,
            },
          });

          // EVA integration
          if (
            checkInModule?.eva &&
            (guestReservationInfo?.nationality !== 'SG' ||
              guestReservationInfo?.nationality?.toLowerCase() !== 'singapore')
          ) {
            const resizeFile = (file: any) =>
              new Promise((resolve) => {
                Resizer.imageFileResizer(
                  file,
                  200,
                  200,
                  'JPEG',
                  100,
                  0,
                  (uri: any) => {
                    resolve(uri);
                  },
                  'base64',
                  200,
                  200,
                );
              });

            const guestImage = await fetch(S3_URL + '/' + guestReservationInfo?.portrait)
              .then((response) => response.blob())
              .then((blob) => {
                const reader = new FileReader();
                reader.readAsDataURL(blob);
                return new Promise((res) => {
                  reader.onloadend = async () => {
                    const resizedImage = await resizeFile(blob);
                    res(resizedImage);
                  };
                });
              });
            const docImage = await fetch(S3_URL + '/' + guestReservationInfo?.docImage)
              .then((response) => response.blob())
              .then((blob) => {
                const reader = new FileReader();
                reader.readAsDataURL(blob);
                return new Promise((res) => {
                  reader.onloadend = async () => {
                    const resizedImage = await resizeFile(blob);
                    res(resizedImage);
                  };
                });
              });

            const guestDetails = {
              checkin: {
                confirmationNumber: reservationInfo?.confirmationId,
                date: dayjs(reservationInfo?.details?.checkInDate).format('YYYYMMDD'),
                checkoutDate: dayjs(reservationInfo?.details?.checkOutDate).format('YYYYMMDD'),
              },
              guests: [
                {
                  dob: dayjs(guestReservationInfo?.dob).format('YYYYMMDD'),
                  firstName: guestReservationInfo?.firstName.replace(/[0-9]/g, ''),
                  gender: reservationInfo?.guests[0].gender?.toLowerCase() == 'female' ? 'F' : 'M',
                  lastName: guestReservationInfo?.lastName.replace(/[0-9]/g, ''),
                  nationalityCountryCode: guestReservationInfo?.nationality,
                  document: {
                    number: guestReservationInfo?.docNo.replace(/\s/g, ''),
                    images: [
                      {
                        name: 'photo',
                        base64Content: guestImage,
                      },
                      {
                        name: 'scanned',
                        base64Content: docImage,
                      },
                      {
                        name: 'cropped',
                        base64Content: docImage,
                      },
                    ],
                  },
                },
              ],
            };
            await client.mutate({
              mutation: UPDATE_EVA,
              context: { clientName: 'host_v5' },
              variables: {
                checkin: guestDetails.checkin,
                guests: guestDetails.guests,
                hotelId: getHotelId(),
              },
            });
          }

          saveTrip({
            reservationId: reservationInfo?.confirmationId as string,
            preCheckedIn: preCheckInStatus ? true : false,
            checkedIn: preCheckInStatus ? false : true,
            name: guestReservationInfo?.lastName,
            email: guestReservationInfo?.emails,
            roomNumber: !preCheckInStatus ? roomNo : '',
            invoiceId: reservationInfo?.reservationId as string,
            hotelId: hotelId,
          });
          checkinStorage({
            reservationId: reservationInfo?.confirmationId as string,
            preCheckedIn: preCheckInStatus ? true : false,
            checkedIn: preCheckInStatus ? false : true,
            name: guestReservationInfo?.lastName,
            email: guestReservationInfo?.emails,
            roomNumber: !preCheckInStatus ? roomNo : '',
            invoiceId: reservationInfo?.reservationId as string,
            currency: reservationInfo?.details?.holdAmount?.currency,
          });
          setErrorNotification(false);
          guestInformationStorage(null);
          accompanyGuestDetails(null);
        } catch (checkinError) {
          const statusCode = processStatusCode(checkinError as ApolloError);
          if (statusCode === 403) {
            handleCheckInAuthenticationFailure(checkIn);
          } else {
            const error = checkinError as ApolloError;
            const networkError = error?.networkError as { result?: { errors?: string } };
            setErrorNotification(true);
            if (networkError?.result?.errors === PRE_CHECKIN_ERROR_MSG) {
              setErrorNotification(true);
              setErrorText(t('You have already completed the pre check-in process.'));
            }
          }
        }
        toggleNotification(true);
        setLoading(false);
      };
      await checkIn();
    }
  }, [
    accompanyGuestInfo,
    adult,
    cardType,
    checkInModule?.eva,
    children,
    guestReservationInfo?.addressLine,
    guestReservationInfo?.approvalCode,
    guestReservationInfo?.cardExpiryDate,
    guestReservationInfo?.cardHolderName,
    guestReservationInfo?.cardNumber,
    guestReservationInfo?.cardType,
    guestReservationInfo?.dob,
    guestReservationInfo?.docImage,
    guestReservationInfo?.docNo,
    guestReservationInfo?.docType,
    guestReservationInfo?.emails,
    guestReservationInfo?.estimatedTime,
    guestReservationInfo?.firstName,
    guestReservationInfo?.lastName,
    guestReservationInfo?.nationality,
    guestReservationInfo?.paymentType,
    guestReservationInfo?.phone,
    guestReservationInfo?.portrait,
    guestReservationInfo?.profession,
    guestReservationInfo?.token,
    guests,
    hotelId,
    paymentConfig?.paymentMethod,
    paymentConfig?.settlementType,
    paymentConfig?.type,
    personalisationConfig?.type,
    personalizationEntities,
    preCheckInStatus,
    reservationInfo,
    roomNo,
    t,
  ]);

  useEffect(() => {
    StepperInformationStorage(
      produce(StepperInformationStorage(), (draft: any) => {
        const item = draft?.find((el: any) => el?.title === STEPPER_CHECK_IN);
        if (item) {
          item.value = btnStatus ? 100 : 60;
        }
      }),
    );
  }, [btnStatus]);

  const Item: React.FC<any> = ({ title, value }) => {
    return (
      <>
        {value && (
          <div className={styles.itemsColumn}>
            <p className={styles.checkDatesText}>{title}</p>
            <p className={cx(styles.checkDatesDetails, styles.left)}>{value}</p>
          </div>
        )}
      </>
    );
  };

  const ItemFullWidth: React.FC<any> = ({ title, value, code }) => {
    const options = guestInformationSection?.details?.find(
      (detail: any) => detail?.name === code,
    )?.options;
    return (
      <>
        {value && (
          <div>
            <p className={styles.checkDatesText}>{title}</p>
            <p className={cx(styles.checkDatesDetails, styles.left)}>
              {options?.length > 0
                ? options?.find((option: any) => option?.value === value)?.name
                : value}
            </p>
          </div>
        )}
      </>
    );
  };

  const ShrinkedItem: React.FC<any> = ({ title, value, code }) => {
    const options = guestInformationSection?.details?.find(
      (detail: any) => detail?.name === code,
    )?.options;
    return (
      <>
        {value && (
          <div className={cx(styles.shrinkedText, styles.left)}>
            {title && title}{' '}
            {options?.length > 0
              ? options?.find((option: any) => option?.value === value)?.name
              : value}
          </div>
        )}
      </>
    );
  };

  const toggleStayInformation = () => {
    setStayInformation((prev) => !prev);
  };

  const toggleAccompanyGuestInformation = (index: any) => {
    setAcccompanyGuestInformation((prev) => {
      const newState = [...prev];
      newState[index] = !newState[index];
      return newState;
    });
  };

  const toggleCreditCardInformation = () => {
    setCreditCardInformation((prev) => !prev);
  };

  return (
    <>
      <Head>
        <title>
          {config?.name} | {t('Review & Sign')}
        </title>
      </Head>
      <Header displayBackButton screenTitle={t('Review & Sign') as string} language />
      {!dayjsLocaleLoader ? (
        <Loader />
      ) : (
        <PageWrapper className={styles.pageWrapper}>
          <Stepper />
          <div className={styles.titleWrapper}>
            <p className={styles.title}>{t('Review & Sign')}</p>
            <p className={styles.titleDescription}>
              {t(
                'Please review and confirm the below information to complete the Check-In process',
              )}
            </p>
          </div>
          <div onClick={toggleStayInformation}>
            {stayInformation ? (
              <DetailsCard title={t('Stay Information')} icon>
                <div className={styles.stayInformation}>
                  <Item
                    title={t('Check-In Date')}
                    value={dayjs(reservationInfo?.details?.checkInDate).format(
                      timeFormats.DAY_MONTH_YEAR,
                    )}
                  />
                  <Item
                    title={t('Checkout Date')}
                    value={dayjs(reservationInfo?.details?.checkOutDate).format(
                      timeFormats.DAY_MONTH_YEAR,
                    )}
                  />
                  <Item title={t('Booking Id')} value={reservationInfo?.confirmationId} />
                  {reservationInfo?.roomTypes?.length > 0 && (
                    <Item
                      title={t('Room Number')}
                      value={reservationInfo?.roomTypes[0]?.roomNumber}
                    />
                  )}

                  {(reservationInfo?.details?.adultGuestCount ||
                    reservationInfo?.details?.childGuestCount) && (
                    <div className={styles.itemsColumn}>
                      <p className={styles.checkDatesText}>{t('Guests')}</p>
                      <p className={cx(styles.checkDatesDetails, styles.left)}>
                        {reservationInfo?.details?.adultGuestCount > 0 && (
                          <>
                            {reservationInfo?.details?.adultGuestCount}{' '}
                            {reservationInfo?.details?.adultGuestCount === 1
                              ? t('Adult')
                              : t('Adults')}{' '}
                          </>
                        )}{' '}
                        {reservationInfo?.details?.childGuestCount > 0 && (
                          <>
                            {reservationInfo?.details?.childGuestCount}{' '}
                            {reservationInfo?.details?.childGuestCount === 1
                              ? t('Child')
                              : t('Children')}
                          </>
                        )}
                      </p>
                    </div>
                  )}

                  {reservationInfo?.roomTypes?.length > 0 &&
                    !reservationInfo?.roomTypes[0]?.suppressRate && (
                      <Item
                        title={t('Rate')}
                        value={`${reservationInfo?.details?.holdAmount?.currency} ${Number(
                          reservationInfo?.roomTypes[0]?.price,
                        )?.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                        })}`}
                      />
                    )}

                  {reservationInfo?.roomTypes?.length > 0 && (
                    <ItemFullWidth
                      title={t('Room Type')}
                      value={reservationInfo?.roomTypes[0]?.shortName}
                    />
                  )}
                </div>
              </DetailsCard>
            ) : (
              <DetailsCardShrinked title={t('Stay Information')}>
                <ShrinkedItem
                  title={t('Room No:')}
                  value={reservationInfo?.roomTypes[0]?.roomNumber}
                />
                <ShrinkedItem value={reservationInfo?.roomTypes[0]?.shortName} />
              </DetailsCardShrinked>
            )}
          </div>

          <div onClick={() => setPrimaryGuestInformation((prev) => !prev)}>
            {primaryGuestInformation ? (
              <DetailsCard title={t('Primary Guest Information')} icon>
                <div className={styles.guestInformation}>
                  {guestInformationSection?.details
                    ?.filter((detail: any) => detail?.isActive)
                    ?.map((details: any, index: number) => (
                      <ItemFullWidth
                        key={index}
                        title={t(details?.label)}
                        value={guestReservationInfo?.[details?.name]}
                        code={details?.name}
                      />
                    ))}
                </div>
              </DetailsCard>
            ) : (
              <DetailsCardShrinked title={t('Primary Guest Information')}>
                {guestInformationSection?.details
                  ?.slice(1, 4)
                  ?.map((configData: any, index: number) => (
                    <ShrinkedItem
                      key={index}
                      value={guestReservationInfo?.[configData.name]}
                      code={configData?.name}
                    />
                  ))}
              </DetailsCardShrinked>
            )}
          </div>

          {accompanyGuestInfo?.concat(updatedGuestData && updatedGuestData)?.length > 0 &&
            accompanyGuestInfo
              ?.concat(updatedGuestData && updatedGuestData)
              ?.map((accompanyGuest: any, index: number) => (
                <div
                  key={accompanyGuest?.id}
                  onClick={() => toggleAccompanyGuestInformation(index)}
                >
                  {accompanyGuestInformationState[index] ? (
                    <div>
                      <DetailsCard title={`${t('Guest')} ${index + 1}`} icon>
                        <div className={styles.guestInformation}>
                          {accompanyingGuestSubmodule?.details?.map(
                            (details: any, index: number) => (
                              <ItemFullWidth
                                key={index}
                                title={t(details?.label)}
                                value={accompanyGuest?.[details?.name]}
                                code={details?.name}
                              />
                            ),
                          )}
                        </div>
                      </DetailsCard>
                    </div>
                  ) : (
                    <DetailsCardShrinked title={`${t('Guest')} ${index + 1}`}>
                      <ShrinkedItem
                        value={`${accompanyGuest?.firstName} ${accompanyGuest?.lastName}`}
                      />
                    </DetailsCardShrinked>
                  )}
                </div>
              ))}

          {paymentConfig?.type !== NONE &&
            (paymentConfig?.isTotalChargeActive
              ? Number(reservationInfo?.roomTypes[0]?.totalCharge) > 0
              : true) && (
              <div onClick={toggleCreditCardInformation}>
                {creditCardInformation ? (
                  <DetailsCard title={t(`${reviewConfig?.creditCardDetails?.title}`)} icon>
                    <div>
                      {reviewConfig?.creditCardDetails?.details?.map(
                        (detail: any, index: number) => (
                          <div key={index} className={styles.checkDatesColumn}>
                            <p className={styles.checkDatesText}>{t(`${detail?.label}`)}</p>
                            <p className={cx(styles.checkDatesDetails, styles.left)}>
                              {detail?.name === CARD_TYPE
                                ? cardType
                                : guestReservationInfo?.[detail?.name] ??
                                  data?.getReservation?.data?.reservePayments[0]?.[detail?.name] ??
                                  ''}
                            </p>
                          </div>
                        ),
                      )}
                    </div>
                  </DetailsCard>
                ) : (
                  <DetailsCardShrinked title={t(`${reviewConfig?.creditCardDetails?.title}`)}>
                    {reviewConfig?.creditCardDetails?.details?.map((detail: any, index: number) => (
                      <div key={index} className={styles.checkDatesColumn}>
                        <ShrinkedItem
                          value={
                            detail?.name === 'cardType'
                              ? cardType
                              : guestReservationInfo?.[detail?.name] ??
                                data?.getReservation?.data?.reservePayments[0]?.[detail?.name] ??
                                ''
                          }
                        />
                      </div>
                    ))}
                  </DetailsCardShrinked>
                )}
              </div>
            )}

          {personalizationEntities?.length > 0 && (
            <div className={styles.cardWrapper}>
              <DetailsCard title={t(`${reviewConfig?.personalizationDetails[0]?.title}`)}>
                <div className={styles.personalzizationWrapper}>
                  <div className={styles.border}></div>
                  {personalizationEntities?.map((personalizationEntity) => (
                    <div key={personalizationEntity?.id} className={styles.personalizationData}>
                      <p className={styles.personalizationText}>
                        {personalizationEntity?.quantity} x {personalizationEntity?.title}
                      </p>
                      <p className={styles.personalizationQuantity}>
                        {personalizationEntity?.currency}{' '}
                        <span className={styles.price}>
                          {formatPrice(
                            Number(personalizationEntity?.price) *
                              Number(personalizationEntity?.quantity),
                          )}
                        </span>
                      </p>
                    </div>
                  ))}
                </div>
              </DetailsCard>
            </div>
          )}

          {upgradeRoomEntities?.length > 0 && (
            <div className={styles.cardWrapper}>
              <DetailsCard title={t(`${reviewConfig?.RoomUpgradeDetails[0]?.title}`)}>
                <div className={styles.personalzizationWrapper}>
                  <div className={styles.border}></div>
                  {upgradeRoomEntities?.map((personalizationEntity) => (
                    <div key={personalizationEntity?.id} className={styles.personalizationData}>
                      <p className={styles.personalizationText}>{personalizationEntity?.title}</p>
                      <p className={styles.personalizationQuantity}>
                        {personalizationEntity?.currency}{' '}
                        <span className={styles.price}>
                          {formatPrice(Number(personalizationEntity?.price))}
                        </span>
                      </p>
                    </div>
                  ))}
                </div>
              </DetailsCard>
            </div>
          )}

          <div className={styles.agrementWrapper}>
            <div className={styles.checkBoxAlign}>
              <StyledCheckBox onClick={toggleConditionsAccepted} value={conditionsAccepted} />
            </div>

            <p className={styles.agrementText}>
              {DOCUMENT_LIST.some((document) => hotelInfo?.[document.code]?.type) &&
                t('I have read, understood and agree to the')}{' '}
              {DOCUMENT_LIST.map((document, index) => {
                if (hotelInfo?.[document.code]?.type) {
                  return (
                    <>
                      <Link
                        href={
                          hotelInfo?.[document.code]?.type === WEBURL2
                            ? hotelInfo?.[document.code]?.url
                            : `${ASSETS_URL}/${hotelInfo?.[document.code]?.url}`
                        }
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        {t(`${document.name}`)}
                      </Link>
                      {index === DOCUMENT_LIST.length - 2
                        ? ` ${t('and')} `
                        : index !== DOCUMENT_LIST.length - 1 && ', '}
                    </>
                  );
                }
              })}
              {DOCUMENT_LIST.every((document) => !hotelInfo?.[document.code]?.type) &&
                t(`${reviewConfig?.termsAndCondition}`)}
            </p>
          </div>
          <div className={styles.guestSignatureWrapper}>
            <p className={styles.guestSignature}>{t('Guest Signature')}</p>
            <p className={styles.clearBtn} onClick={clearCanvas}>
              {t('Clear')}
            </p>
          </div>

          <div id='signatureWrapper' className={styles.agrementSignatureWrapper}>
            <SignatureCanvas
              ref={sigCanvas}
              penColor='#3D3C3C'
              canvasProps={{
                height: 100,
                width: signatureWidth,
              }}
              clearOnResize={false}
              onEnd={() => handleSignatureChange()}
            />
          </div>
          <div className={styles.btnWrapper}>
            <StyledButton
              disabled={!btnStatus}
              onClick={goToCheckIn}
              loading={loading}
              variant='contained'
              className={cx(styles.checkInButton)}
            >
              {t(`${reviewConfig?.buttonLabelCheckIn}`)}
            </StyledButton>
          </div>

          <Notification
            title={errorNotification ? t(ERRORMSG as string) : (t('Welcome Aboard!') as string)}
            description={
              errorNotification
                ? (errorText as string)
                : preCheckInStatus
                ? (t(
                    'You have pre checked-in successfully. Please proceed to the hotel lobby to collect your room key.',
                  ) as string)
                : (t(
                    'You have checked-in successfully. Please proceed to the hotel lobby to collect your room key.',
                  ) as string)
            }
            redirect={!errorNotification && availablePaths?.HOME}
            type={errorNotification ? FAILURE : SUCCESS}
            delay={9000}
          />
        </PageWrapper>
      )}
    </>
  );
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const locale = ctx?.params?.locale;
  return {
    props: {
      ...(await serverSideTranslations(
        locale as string,
        ['errors', 'check-in', 'common'],
        i18nConfig,
      )),
    },
  };
};

export default CheckIn;
