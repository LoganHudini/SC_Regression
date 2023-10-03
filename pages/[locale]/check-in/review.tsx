import Head from 'next/head';
import SignatureCanvas from 'react-signature-canvas';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Card } from '../../../components/shared/Card/Card';
import { Header } from 'components/shared/Header/Header';
import { PageWrapper } from '../../../components/shared/PageWrapper/PageWrapper';
import { StyledCheckBox } from '../../../components/shared/StyledCheckBox/StyledCheckBox';
import styles from '../../../styles/check-in-v2/check-in-v2.module.scss';
import { StyledButton } from '../../../components/shared/StyledButton/StyledButton';
import { guestInformationStorage } from 'storage/guest-information.storage';
import { ApolloError, useQuery, useReactiveVar } from '@apollo/client';
import {
  personalizeYourRoomStorage,
  specialRequestsStorage,
} from 'storage/personalize-your-room.storage';
import { client } from 'core/graphql/client';
import { IGetReservationApiResponse, GET_RESERVATION } from 'core/graphql/queries/GET_RESERVATION';
import { CHECKIN, ICheckInApiRequest } from 'core/graphql/queries/CHECKIN';
import { ICheckinProps } from 'types/check-in.types';
import {
  IGetRoomDetailsApiResponse,
  GET_ROOM_DETAILS,
} from 'core/graphql/queries/GET_ROOM_DETAILS';
import { GetStaticProps } from 'next';
import { processError } from 'utils/processError';
import {
  GET_COUNTRY_CODES,
  IGetCountryCodesApiResponse,
} from 'core/graphql/queries/GET_COUNTRY_CODES';
import { saveTrip } from 'storage/trips.storage';
import { checkinStorage } from 'storage/check-in.storage';
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
import { DetailsCard } from 'components/shared/DetailsCard/DetailsCard';
import { timeFormats } from 'utils/timeFormats';
import dayjs from 'dayjs';
import cx from 'classnames';
import { reservationGuestInfoStorageData } from 'storage/reservation-guest-info.storage';
import { CURRENCY } from 'core/graphql/endpoints';
import { PRECHECKIN } from 'core/graphql/queries/PRECHECKIN';
import { toast } from 'react-toastify';
import {
  PRE_CHECKIN_ERROR_MSG,
  cardTypes,
  CHECK_IN,
  REVIEW,
  CHKOUT,
  CHECKEDOUT,
  CANCELED,
  PERSONALISATION,
} from 'utils/constants';
import { GET_E_REG_DETAILS } from 'core/graphql/queries/GET_E_REG_DETAILS';
import { getConfig } from 'utils/getConfiguration';
import { buttonArrow } from 'utils/functions';

export { getStaticPaths };

const CheckIn: React.FC<ICheckinProps> = () => {
  const navigate = useLocalizedRouter();
  const config = getConfig();
  const { t } = useTranslation(['check-in', 'common']);
  const guests = useReactiveVar(guestInformationStorage);
  const guestReservationInfo = useReactiveVar(reservationGuestInfoStorageData);
  const personalizationEntities = useReactiveVar(personalizeYourRoomStorage);
  const specialRequests = useReactiveVar(specialRequestsStorage);

  const [conditionsAccepted, setConditionsAccepted] = useState(false);
  const [btnStatus, setBtnStatus] = useState(false);
  const [signature, setSignature] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const reservationData = client.readQuery<IGetReservationApiResponse>({
    query: GET_RESERVATION,
  });

  const reservationInfo = reservationData?.getReservation.data;

  const data: any = client.readQuery<IGetReservationApiResponse>({
    query: GET_RESERVATION,
  });

  const getEregDetails = useQuery(GET_E_REG_DETAILS, {
    context: { clientName: 'host_v6' },
    fetchPolicy: 'no-cache',
  });

  const checkinModule: any = config?.modules?.find((module) => module?.code === CHECK_IN);
  const reviewConfig = checkinModule?.submodules?.find(
    (submodule: any) => submodule?.name === REVIEW && submodule.isActive,
  );

  const eRegistration =
    getEregDetails?.data?.getHotelSystemsDigitalCheckinConfig?.eRegistrationForm;

  const eRegDocumentInformationDetails = eRegistration?.documentInformation?.filter(
    (showData: any) => showData?.required,
  );

  const eRegPersonalization = eRegistration?.roomDetails?.filter(
    (showData: any) => showData?.name === PERSONALISATION,
  );

  useEffect(() => {
    if (
      !reservationData ||
      !data ||
      data?.getReservation?.data?.reservationStatus === CANCELED ||
      data?.getReservation?.data?.reservationStatus === CHECKEDOUT ||
      data.getReservation.data.reservationStatus === CHKOUT
    ) {
      navigate(availablePaths?.HOME);
    }
  }, [data, navigate, reservationData]);

  useEffect(() => {
    if (conditionsAccepted && sigCanvas?.current && signature !== null) {
      setBtnStatus(true);
    } else {
      setBtnStatus(false);
    }
  }, [conditionsAccepted, signature]);

  const sigCanvas = useRef<any>(null);

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

  const adult = reservationInfo?.details.adultGuestCount.toString();
  const children = reservationInfo?.details.childGuestCount.toString();
  const roomNo = reservationInfo?.roomTypes[0]?.roomNumber;
  // console.log(reservationInfo, guestReservationInfo);

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
      paymentType: guestReservationInfo?.cardType,
      expirationDate: guestReservationInfo?.cardExpiryDate as string,
      creditCardType: guestReservationInfo?.cardType,
      lastFourDigits: guestReservationInfo?.cardNumber?.substr(
        guestReservationInfo?.cardNumber?.length - 4,
      ),
      vaultedCardID: guestReservationInfo?.token,
      settlement: 'Web',
      documentType: guestReservationInfo?.docType as string,
      documentNumber: guestReservationInfo?.docNo as string,
      guestSignature: '',
    };

    const uploadSignaturePayload: IPreSignDocUploadApiRequest = {
      groupId: 'e8030f49-afb1-43fc-80f6-c0515b62d5f6',
      type: 'reservation_docs',
      propertyType: 'hotels',
      confirmationId: reservationInfo?.confirmationId ?? '',
      filename: `${guests ? guests[0].firstName : ''}_${
        guests ? guests[0].lastName : ''
      }_signature.png`,
      contentType: 'image/png',
      contentLength: 8196,
      body: null,
      contents: (sigCanvas.current?.toDataURL() as string).replace('data:image/png;base64,', ''),
      isDocUpload: true,
    };

    try {
      const uploadSignatureResponse = await client.query<IPreSignDocUploadApiResponse>({
        query: PRE_SIGN_DOC_UPLOAD,
        context: { clientName: 'rest' },
        variables: {
          confirmationNumber: reservationInfo?.confirmationId as string,
          body: uploadSignaturePayload,
        },
      });
      checkInPayload.guestSignature = uploadSignatureResponse.data.preSignDocUpload.data.key;
    } catch (uploadSignatureError) {
      processError(t, uploadSignatureError as ApolloError);
    }

    try {
      await client.query({
        query: roomNo ? CHECKIN : PRECHECKIN,
        context: { clientName: 'rest' },
        variables: {
          confirmationNumber: reservationInfo?.confirmationId as string,
          body: checkInPayload,
        },
      });

      saveTrip({
        reservationId: reservationInfo?.confirmationId as string,
        preCheckedIn: !roomNo ? true : false,
        checkedIn: roomNo ? true : false,
        name: guestReservationInfo?.lastName,
        email: guestReservationInfo?.emails,
        roomNumber: roomNo,
        invoiceId: reservationInfo?.reservationId as string,
      });

      checkinStorage({
        reservationId: reservationInfo?.confirmationId as string,
        preCheckedIn: !roomNo ? true : false,
        checkedIn: roomNo ? true : false,
        name: guestReservationInfo?.lastName,
        email: guestReservationInfo?.emails,
        roomNumber: roomNo,
        invoiceId: reservationInfo?.reservationId as string,
      });

      toast('You have successfully checked-in, please proceed to the hotel lobby', {
        type: 'success',
      });
      navigate(availablePaths.HOME);
    } catch (checkinError) {
      const error = checkinError as ApolloError;
      const networkError = error?.networkError as { result?: { errors?: string } };

      if (networkError?.result?.errors === PRE_CHECKIN_ERROR_MSG) {
        toast('You are Pre Checked-In', { type: 'error' });
      } else {
        toast('Please try again', { type: 'error' });
      }
    }
    setLoading(false);
  }, [
    reservationInfo?.confirmationType,
    reservationInfo?.reservationId,
    reservationInfo?.confirmationId,
    reservationInfo?.details?.checkInDate,
    reservationInfo?.details?.checkOutDate,
    reservationInfo?.roomTypes,
    roomNo,
    guestReservationInfo?.emails,
    guestReservationInfo?.firstName,
    guestReservationInfo?.lastName,
    guestReservationInfo?.phone,
    guestReservationInfo?.cardType,
    guestReservationInfo?.cardExpiryDate,
    guestReservationInfo?.cardNumber,
    guestReservationInfo?.token,
    guestReservationInfo?.docType,
    guestReservationInfo?.docNo,
    adult,
    children,
    guests,
    t,
    navigate,
  ]);

  return (
    <>
      <Head>
        <title>{t(`${reviewConfig.title}`)}</title>
      </Head>
      <Header displayBackButton screenTitle={t(`${reviewConfig.label}`) as string} />
      <PageWrapper className={styles.pageWrapper}>
        <div className={styles.infoText}>{t(`${reviewConfig.subTitle}`)}</div>
        <DetailsCard title={t(`${reviewConfig.guestInformationDetails[0].title}`)}>
          <div>
            <div className={styles.checkDates}>
              <div className={styles.checkDatesColumn}>
                <p className={cx(styles.checkDatesText, styles.textTransform)}>{t('Check-In')}</p>{' '}
                <p className={styles.checkDatesDetails}>
                  {dayjs(data?.getReservation.data.details.checkInDate).format(
                    timeFormats.DAY_MONTH_YEAR,
                  )}
                </p>
              </div>
              <div className={styles.checkDatesColumn}>
                <p className={cx(styles.checkDatesText, styles.right, styles.textTransform)}>
                  {t('Checkout')}
                </p>{' '}
                <p className={cx(styles.checkDatesDetails, styles.right)}>
                  {dayjs(data?.getReservation.data.details.checkOutDate).format(
                    timeFormats.DAY_MONTH_YEAR,
                  )}
                </p>
              </div>
            </div>
          </div>
          <div className={styles.description}>
            <div>
              {data?.getReservation.data.guests[0].firstName ?? ''}{' '}
              {data?.getReservation.data.guests[0].lastName ?? ''}
            </div>
            <div>{data?.getReservation.data.guests[0].emails ?? ''}</div>
            <div>{data?.getReservation.data.guests[0].phone ?? ''}</div>
          </div>
        </DetailsCard>

        <DetailsCard title={t(`${reviewConfig?.creditCardDetails?.title}`)}>
          <div>
            {reviewConfig?.creditCardDetails?.details?.map((detail: any, index: number) => (
              <div key={index} className={styles.checkDatesColumn}>
                <p className={styles.checkDatesText}>{detail?.label}</p>
                <p className={cx(styles.checkDatesDetails, styles.left)}>
                  {detail?.name === 'cardType'
                    ? cardTypes?.find((item) => item?.code === guestReservationInfo?.cardType)?.name
                    : guestReservationInfo?.[detail?.name] ??
                      data?.getReservation?.data?.reservePayments[0]?.[detail?.name] ??
                      ''}
                </p>
              </div>
            ))}
          </div>
        </DetailsCard>

        {eRegDocumentInformationDetails?.length !== 0 && (
          <DetailsCard title={t(`${reviewConfig.identityVerificationDetails[0].title}`)}>
            <div>
              <div className={styles.border}></div>
              <div>
                {eRegDocumentInformationDetails?.map((showData: any, index: number) => (
                  <div key={index} className={styles.checkDatesColumn}>
                    {reviewConfig?.identityVerificationDetails
                      ?.filter((cmsData: any) => cmsData.cmsName === showData?.name)
                      ?.map((configData: any) => (
                        <div key={index}>
                          <p className={styles.checkDatesText}>{configData.label}</p>
                          <p className={cx(styles.checkDatesDetails, styles.left)}>
                            {guestReservationInfo?.[configData.name] ??
                              data?.getReservation?.data?.guests[0]?.[configData.name] ??
                              ''}
                          </p>
                        </div>
                      ))}
                  </div>
                ))}
              </div>
            </div>
          </DetailsCard>
        )}

        {((eRegPersonalization &&
          eRegPersonalization[0]?.required &&
          personalizationEntities.length > 0) ||
          specialRequests) && (
          <div className={styles.cardWrapper}>
            <DetailsCard title={t(`${reviewConfig.personalizationDetails[0].title}`)}>
              <div className={styles.personalzizationWrapper}>
                <div className={styles.border}></div>
                {personalizationEntities?.map((personalizationEntity) => (
                  <div key={personalizationEntity?.code} className={styles.personalizationData}>
                    <p className={styles.personalizationText}>
                      {personalizationEntity?.quantity} x {personalizationEntity?.title}
                    </p>
                    <p className={styles.personalizationQuantity}>
                      {CURRENCY}{' '}
                      <span className={styles.price}>
                        {Number(personalizationEntity?.price) *
                          Number(personalizationEntity?.quantity)}
                      </span>
                    </p>
                  </div>
                ))}
                {specialRequests && (
                  <>
                    <p className={styles.specialRequestsTitle}>{t('Special Request')}</p>
                    <p className={styles.specialRequestsText}>{specialRequests}</p>
                  </>
                )}
              </div>
            </DetailsCard>
          </div>
        )}
        {(reservationInfo?.settlementTypes?.length || 0) > 0 && (
          <div className={styles.cardWrapper}>
            <Card>
              <div className={styles.settlementWrapper}>
                <h2 className={styles.settlementTitle}>{t('Settlement')}</h2>

                <p className={styles.settlementSubtitle}>
                  {reservationInfo?.settlementTypes.map((el, index) => (
                    <div key={index}>
                      {el?.name}
                      <br />
                    </div>
                  ))}
                </p>
              </div>
            </Card>
          </div>
        )}
        <div className={styles.agrementWrapper}>
          <div className={styles.checkBoxAlign}>
            <StyledCheckBox onClick={toggleConditionsAccepted} value={conditionsAccepted} />
          </div>
          <p
            className={styles.agrementText}
            dangerouslySetInnerHTML={{ __html: reviewConfig?.termsAndCondition }}
          ></p>
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
              canvasProps={{ height: 100, width: 350 }}
              clearOnResize={false}
              onEnd={() => handleSignatureChange()}
            />
          </Card>
        </div>
        <div className={styles.btnWrapper}>
          <StyledButton
            disabled={!btnStatus}
            className={styles.checkInButton}
            onClick={goToCheckIn}
            loading={loading}
            variant='contained'
            arrow={buttonArrow}
          >
            {t(`${reviewConfig.buttonLabelCheckIn}`)}
          </StyledButton>
        </div>
      </PageWrapper>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const locale = ctx?.params?.locale;
  const { data } = await client.query<IGetRoomDetailsApiResponse>({
    query: GET_ROOM_DETAILS,
    context: { clientName: 'host_v0' },
  });

  const { data: countryCodesData } = await client.query<IGetCountryCodesApiResponse>({
    query: GET_COUNTRY_CODES,
    context: { clientName: 'rest' },
  });

  return {
    props: {
      roomDetails: data,
      countryCodes: countryCodesData.getCountryCodes.data,
      ...(await serverSideTranslations(locale as string, ['check-in', 'common'], i18nConfig)),
    },
  };
};

export default CheckIn;
