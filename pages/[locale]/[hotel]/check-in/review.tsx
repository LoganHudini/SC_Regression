/* eslint-disable camelcase */
import Head from 'next/head';
import SignatureCanvas from 'react-signature-canvas';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Card } from 'components/shared/Card/Card';
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
import { CHECKIN, ICheckInApiRequest } from 'core/graphql/queries/CHECKIN';
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
import { PRECHECKIN } from 'core/graphql/queries/PRECHECKIN';
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
  STEPPER_REVIEW,
  STEPPER_PAYMENT,
  WEBURL2,
  DOCUMENT_LIST,
  CHECKEDOUT,
} from 'utils/constants';
import { Notification } from 'components/shared/Notification/Notification';
import { hotelInformation, toggleNotification } from 'storage/home.storage';
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
import { ASSETS_URL } from 'core/graphql/endpoints';
import Link from 'next/link';
import { checkRoomStatus } from 'core/api/functions/checkRoomStatus';
import { formatPrice } from 'utils/functions';

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
  const [accompanyGuestInformationState, setAcccompanyGuestInformation] = useState(
    new Array(accompanyGuestInfo?.length)?.fill(false),
  );
  const personalizationEntities = useReactiveVar(personalizeYourRoomStorage);
  const upgradeRoomEntities = useReactiveVar(upgradeYourRoomStorage);
  const [errorNotification, setErrorNotification] = useState(false);
  const [roomStatus, setRoomStatus] = useState(false);
  const [conditionsAccepted, setConditionsAccepted] = useState(false);
  const [btnStatus, setBtnStatus] = useState(false);
  const [errorText, setErrorText] = useState(t('Please proceed to the front desk!'));
  const [signature, setSignature] = useState<any>(null);
  const [loading, setLoading] = useState(false);

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

  const checkInModule: any = config?.modules?.find((module) => module?.code === CHECK_IN);
  const reviewConfig = checkInModule?.submodules?.find(
    (submodule: any) => submodule?.name === REVIEW && submodule.isActive,
  );

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

  useEffect(() => {
    async function updateRoomStatus() {
      setRoomStatus(await checkRoomStatus(roomNo, hotelId, reservationInfo?.confirmationId));
    }
    updateRoomStatus();
  }, [hotelId, reservationInfo?.confirmationId, roomNo]);

  const preCheckInStatus = config?.preCheckInOnly
    ? true
    : !(roomNo && roomStatus && paymentConfig?.type !== NONE)
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
    const checkInPayload: ICheckInApiRequest = {
      reservationType: reservationInfo?.confirmationType as string,
      reservationId: reservationInfo?.reservationId as string,
      bookingId: reservationInfo?.confirmationId as string,
      checkinDate: reservationInfo?.details?.checkInDate as string,
      checkoutDate: reservationInfo?.details?.checkOutDate as string,
      roomNo: roomNo as string,
      roomType: reservationInfo?.roomTypes[0]?.shortName as string,
      primaryGuestEmail: guestReservationInfo?.emails as string,
      primaryGuestFirstName: guestReservationInfo?.firstName as string,
      primaryGuestLastName: guestReservationInfo?.lastName as string,
      primaryGuestMobileNumber: guestReservationInfo?.phone as string,
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
      vaultedCardID: guestReservationInfo?.token,
      settlementType: paymentConfig?.settlementType ?? guestReservationInfo?.cardType,
      documentType: guestReservationInfo?.docType as string,
      documentNumber: guestReservationInfo?.docNo as string,
      channel: 'PWA',
      upsell: personalizationEntities?.map((personalization) => ({
        upsellName: personalization?.title,
        revenue: Number(Number(personalization?.price).toFixed(2)),
      })),
      guestSignature: '',
      comment: guestReservationInfo?.transactionId ?? '',
      isDoNotMove: true,
    };

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
        checkInPayload.guestSignature = uploadSignatureResponse.data.preSignDocUpload.data.key;
      } catch (uploadSignatureError) {
        const statusCode = processStatusCode(uploadSignatureError as ApolloError);
        statusCode === 403
          ? handleCheckInAuthenticationFailure(uploadSignature)
          : setErrorNotification(true);
      }
    };
    uploadSignature();

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
        StepperInformationStorage([
          { value: 60, label: 1, title: STEPPER_REVIEW },
          { value: 0, label: 2, title: STEPPER_PAYMENT },
          { value: 0, label: 3, title: STEPPER_CHECK_IN },
        ]);
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
    checkIn();
  }, [
    reservationInfo?.confirmationType,
    reservationInfo?.reservationId,
    reservationInfo?.confirmationId,
    reservationInfo?.details?.checkInDate,
    reservationInfo?.details?.checkOutDate,
    reservationInfo?.details?.holdAmount?.currency,
    reservationInfo?.roomTypes,
    roomNo,
    guestReservationInfo?.emails,
    guestReservationInfo?.firstName,
    guestReservationInfo?.lastName,
    guestReservationInfo?.phone,
    guestReservationInfo?.paymentType,
    guestReservationInfo?.cardExpiryDate,
    guestReservationInfo?.cardHolderName,
    guestReservationInfo?.cardType,
    guestReservationInfo?.cardNumber,
    guestReservationInfo?.token,
    guestReservationInfo?.docType,
    guestReservationInfo?.docNo,
    guestReservationInfo?.transactionId,
    adult,
    children,
    paymentConfig?.paymentMethod,
    paymentConfig?.settlementType,
    personalizationEntities,
    guests,
    preCheckInStatus,
    hotelId,
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
  const ItemFullWidth: React.FC<any> = ({ title, value }) => {
    return (
      <>
        {value && (
          <div>
            <p className={styles.checkDatesText}>{title}</p>
            <p className={cx(styles.checkDatesDetails, styles.left)}>{value}</p>
          </div>
        )}
      </>
    );
  };

  const ShrinkedItem: React.FC<any> = ({ title, value }) => {
    return (
      <>
        {value && (
          <div className={cx(styles.shrinkedText, styles.left)}>
            {title && title} {value}
          </div>
        )}
      </>
    );
  };

  const toggleStayInformation = () => {
    setStayInformation((prev) => !prev);
  };

  const togglePrimaryGuestInformation = () => {
    setPrimaryGuestInformation((prev) => !prev);
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
      <Header displayBackButton screenTitle={t('Review & Sign') as string} />
      <PageWrapper className={styles.pageWrapper}>
        <Stepper />
        <div className={styles.titleWrapper}>
          <p className={styles.title}>{t('Review & Sign')}</p>
          <p className={styles.titleDescription}>
            {t('Please review and confirm the below information to complete the Check-In process')}
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
                <Item title={t('Room Number')} value={reservationInfo?.roomTypes[0]?.roomNumber} />

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

                <Item
                  title={t('Rate')}
                  value={`${reservationInfo?.details?.holdAmount?.currency} ${Number(
                    reservationInfo?.roomTypes[0]?.totalCharge,
                  )?.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                  })}`}
                />

                <ItemFullWidth
                  title={t('Room Type')}
                  value={reservationInfo?.roomTypes[0]?.shortName}
                />
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

        <div onClick={togglePrimaryGuestInformation}>
          {primaryGuestInformation ? (
            <DetailsCard title={t('Primary Guest Information')} icon>
              <div className={styles.guestInformation}>
                <ItemFullWidth
                  title={t('First Name')}
                  value={reservationInfo?.guests[0]?.firstName}
                />
                <ItemFullWidth
                  title={t('Last Name')}
                  value={reservationInfo?.guests[0]?.lastName}
                />
                <ItemFullWidth
                  title={t('Email')}
                  value={guestReservationInfo?.emails ?? reservationInfo?.guests[0]?.emails}
                />
                <ItemFullWidth
                  title={t('Phone Number')}
                  value={guestReservationInfo?.phone ?? reservationInfo?.guests[0]?.phone}
                />

                {reviewConfig?.identityVerificationDetails?.map(
                  (configData: any, index: number) => (
                    <ItemFullWidth
                      key={index}
                      title={configData?.label}
                      value={
                        guestReservationInfo?.[configData.name] ??
                        data?.getReservation?.data?.guests[0]?.[configData.name] ??
                        ''
                      }
                    />
                  ),
                )}
                {guestReservationInfo?.dateOfBirth && (
                  <ItemFullWidth
                    title={t('Date of Birth')}
                    value={dayjs(guestReservationInfo?.dateOfBirth).format(
                      timeFormats.DAY_MONTH_YEAR_2,
                    )}
                  />
                )}
              </div>
            </DetailsCard>
          ) : (
            <DetailsCardShrinked title={t('Primary Guest Information')}>
              <ShrinkedItem
                value={`${reservationInfo?.guests[0]?.firstName} ${reservationInfo?.guests[0]?.lastName}`}
              />
              {reviewConfig?.identityVerificationDetails?.map((configData: any, index: number) => (
                <ShrinkedItem
                  key={index}
                  value={
                    guestReservationInfo?.[configData.name] ??
                    data?.getReservation?.data?.guests[0]?.[configData.name] ??
                    ''
                  }
                />
              ))}
            </DetailsCardShrinked>
          )}
        </div>

        {accompanyGuestInfo.concat(updatedGuestData)?.length > 0 &&
          accompanyGuestInfo.concat(updatedGuestData)?.map((accompanyGuest: any, index: number) => (
            <div key={accompanyGuest.id} onClick={() => toggleAccompanyGuestInformation(index)}>
              {accompanyGuestInformationState[index] ? (
                <div>
                  <DetailsCard title={`Guest ${index + 1}`} icon>
                    <div className={styles.guestInformation}>
                      <ItemFullWidth title={t('First Name')} value={accompanyGuest?.firstName} />
                      <ItemFullWidth title={t('Last Name')} value={accompanyGuest?.lastName} />
                      <ItemFullWidth title={t('Email')} value={accompanyGuest?.emails} />
                      <ItemFullWidth title={t('Phone Number')} value={accompanyGuest?.phone} />
                      {reviewConfig?.identityVerificationDetails?.map(
                        (configData: any, index: number) => (
                          <Item
                            key={index}
                            title={configData?.label}
                            value={accompanyGuest?.[configData?.name] ?? ''}
                          />
                        ),
                      )}
                      {accompanyGuest?.dateOfBirth && (
                        <ItemFullWidth
                          title={t('Date of Birth')}
                          value={dayjs(accompanyGuest?.dateOfBirth).format(
                            timeFormats.DAY_MONTH_YEAR_2,
                          )}
                        />
                      )}
                    </div>
                  </DetailsCard>
                </div>
              ) : (
                <DetailsCardShrinked title={`Guest ${index + 1}`}>
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
                    {reviewConfig?.creditCardDetails?.details?.map((detail: any, index: number) => (
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
                    ))}
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
                      {`${document.name}`}
                    </Link>
                    {index !== DOCUMENT_LIST.length - 2 && ` ${t('and')} `}
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

        <div className={styles.agrementSignatureWrapper}>
          <Card>
            <SignatureCanvas
              ref={sigCanvas}
              maxWidth={1.5}
              penColor='#3D3C3C'
              canvasProps={{
                height: 100,
                width: 350,
              }}
              clearOnResize={false}
              onEnd={() => handleSignatureChange()}
            />
          </Card>
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
        />
      </PageWrapper>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const locale = ctx?.params?.locale;
  return {
    props: {
      ...(await serverSideTranslations(locale as string, ['check-in', 'common'], i18nConfig)),
    },
  };
};

export default CheckIn;
