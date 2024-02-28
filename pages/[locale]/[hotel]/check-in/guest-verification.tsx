import React, { useCallback, useEffect, useState } from 'react';
import Head from 'next/head';
import { Header } from 'components/shared/Header/Header';
import styles from '@styles/pre-checkin-form/pre-checkin-form.module.scss';
import { PageWrapper } from 'components/shared/PageWrapper/PageWrapper';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import { GET_RESERVATION, IGetReservationApiResponse } from 'core/graphql/queries/GET_RESERVATION';
import { client } from 'core/graphql/client';
import cx from 'classnames';
import { GetStaticProps } from 'next';
import { ApolloError, useReactiveVar } from '@apollo/client';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'react-i18next';
import { getStaticPaths } from 'utils/getStatic';
import i18nConfig from 'next-i18next.config';
import { availablePaths } from 'utils/availablePaths';
import { PreCheckinGuestInfo } from 'components/pages/check-in/PreCheckinGuestInfo/PreCheckinGuestInfo';
import { reservationGuestInfoStorageData } from 'storage/reservation-guest-info.storage';
import {
  IUpdateGuestDetailsApiRequest,
  UPDATE_GUEST_DETAILS,
} from 'core/graphql/queries/UPDATE_GUEST_DETAILS';
import { useConfig, usePaymentConfig } from 'utils/hooks/useConfiguration';
import {
  CHECK_IN,
  EMAIL_REGEX,
  GUESTINFORMATION,
  INFORMATION,
  PHONE,
  PHONE_REGEX,
  EMAILS,
  STEPPER_REVIEW,
  STEPPER_PAYMENT,
  STEPPER_CUSTOMISATION,
  ACCOMPANYINGGUEST,
  YOUVERSE,
  PRIMARY,
  FAILURE,
  INCODE,
  DOCTYPE,
  ERRORMSG,
  NONE,
} from 'utils/constants';
import { updateDocTypeOptions } from 'utils/functions';
import { docTypeStorage } from 'storage/guest-information.storage';
import { Stepper } from 'components/shared/Stepper/Stepper';
import { StepperInformationStorage, youverseProfileIDStorage } from 'storage/check-in.storage';
import produce from 'immer';
import Camera from '@icons/cameraIcon.svg';
import { accompanyGuestDetails } from 'storage/accompany-guest-details';
import { Notification } from 'components/shared/Notification/Notification';
import { notificationDetails, toggleNotification } from 'storage/home.storage';
import {
  getCheckInToken,
  handleCheckInAuthenticationFailure,
} from 'core/api/functions/getCheckInAuthentication';
import { processStatusCode } from 'utils/processError';
import { usePersonalisation } from 'utils/hooks/usePersonalisation';

export { getStaticPaths };

const Guest: React.FC<any> = () => {
  const navigate = useLocalizedRouter();
  const [loading, setLoading] = useState(false);
  const notificationInfo = useReactiveVar(notificationDetails);
  const config = useConfig();
  const paymentConfig: any = usePaymentConfig();
  const { t } = useTranslation('about-your-stay');
  const guestReservationInfo = useReactiveVar(reservationGuestInfoStorageData);
  const accompanyGuestData = useReactiveVar(accompanyGuestDetails);
  const [personalisationData] = usePersonalisation();

  const reservationData = client.readQuery<IGetReservationApiResponse>({
    query: GET_RESERVATION,
  });

  const reservationInfo = reservationData?.getReservation?.data;

  const checkinModule: any = config?.modules?.find((module) => module?.code === CHECK_IN);

  // primary guest configuration
  const guestSubmodule = checkinModule?.submodules?.find(
    (submodule: any) => submodule?.name === INFORMATION && submodule?.isActive,
  );
  const activeSections = guestSubmodule?.details?.filter((section: any) => section?.isActive);
  const guestInformationSection = activeSections?.find(
    (section: any) => section?.name === GUESTINFORMATION && section.isActive,
  );
  const documentTypes = guestInformationSection?.details?.find(
    (e: any) => e?.name === DOCTYPE,
  )?.options;

  // accompanyguest configuration
  const accompanyingGuestSubmodule = checkinModule?.submodules?.find(
    (submodule: any) => submodule?.name === ACCOMPANYINGGUEST && submodule.isActive,
  );
  const accompanyGuestInformationSection = updateDocTypeOptions(
    accompanyingGuestSubmodule?.details,
    documentTypes,
  );

  useEffect(() => {
    if (documentTypes) {
      docTypeStorage(documentTypes);
    }
  }, [documentTypes]);

  useEffect(() => {
    if (!reservationData) {
      navigate(availablePaths?.HOME);
    }
  }, [reservationData, navigate]);

  // primary guest initialization
  const extractDataForField = useCallback(
    (inputFieldName: string) => {
      let source: any = reservationInfo?.guests && reservationInfo?.guests[0];
      const paymentAttributes: any =
        reservationInfo?.reservePayments && reservationInfo?.reservePayments[0];

      if (source && source[inputFieldName]) {
        guestInformationSection?.type === YOUVERSE && inputFieldName === 'docNo'
          ? (source = '')
          : (source = source[inputFieldName]);
      } else {
        source = '';
      }

      if (Array.isArray(source)) {
        source = source.join(', ');
      }

      return source;
    },
    [guestInformationSection?.type, reservationInfo?.guests, reservationInfo?.reservePayments],
  );

  useEffect(() => {
    if (reservationInfo?.guests) {
      const initialGuestReservationInfo = activeSections?.reduce((values: any, section: any) => {
        section?.details?.forEach((field: any) => {
          const { name } = field;
          values[name] = extractDataForField(name);
        });
        return values;
      }, {});

      for (const key in initialGuestReservationInfo) {
        if (Object.prototype.hasOwnProperty.call(initialGuestReservationInfo, key)) {
          if (!initialGuestReservationInfo[key]) {
            initialGuestReservationInfo[key] = '';
          }
        }
      }

      reservationGuestInfoStorageData({
        ...initialGuestReservationInfo,
        ...guestReservationInfo,
        isComplete: validateCompleteGuestDetails(
          guestReservationInfo,
          guestInformationSection?.details,
        ),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extractDataForField, reservationInfo?.guests]);

  // guest validation
  const validateCompleteGuestDetails = (guestDetails: any, field: any) => {
    if (!guestDetails) {
      return true;
    }
    if (field === undefined) {
      return true;
    }
    return field?.every((fieldItem: any) => {
      if (!fieldItem.required) {
        return true;
      }

      const infoValue = fieldItem?.name in guestDetails ? guestDetails[fieldItem?.name] : true;

      if (fieldItem.name === PHONE) {
        return PHONE_REGEX.test(infoValue);
      }

      if (fieldItem.name === EMAILS) {
        return EMAIL_REGEX.test(infoValue);
      }

      return !!infoValue;
    });
  };

  const guestValidation = validateCompleteGuestDetails(
    guestReservationInfo,
    guestInformationSection?.details,
  );

  const generateAccompanyGuestDetails = useCallback(
    (accompanyGuestLists: any) => {
      return accompanyGuestLists
        ?.map((accompanyGuest: any) => {
          const guestData: any = { id: accompanyGuest?.id };

          accompanyGuestInformationSection?.forEach((item: any) => {
            if (item?.name in accompanyGuest && item?.isActive) {
              guestData[item?.name] = Array.isArray(accompanyGuest[item?.name])
                ? accompanyGuest[item?.name][0] || ''
                : guestInformationSection?.type === YOUVERSE && item?.name === 'docNo'
                ? ''
                : accompanyGuest[item?.name] || '';
            }
          });
          return { guestData };
        })
        ?.map((item: any) => item?.guestData);
    },
    [accompanyGuestInformationSection, guestInformationSection?.type],
  );

  // accompany guests initialization and validation
  useEffect(() => {
    if (
      reservationInfo &&
      reservationInfo?.guests?.length > 1 &&
      accompanyGuestData?.length === 0
    ) {
      accompanyGuestDetails(generateAccompanyGuestDetails(reservationInfo?.guests?.slice(1)));
    }
  }, [accompanyGuestData, generateAccompanyGuestDetails, reservationInfo]);

  const accompanyGuestValidation = accompanyGuestData
    ?.map((accompanyGuest: any) =>
      validateCompleteGuestDetails(accompanyGuest, accompanyGuestInformationSection),
    )
    ?.every((item: boolean) => item);

  // stepper component
  useEffect(() => {
    StepperInformationStorage(
      produce(StepperInformationStorage(), (draft: any) => {
        const item = draft?.find((el: any) => el?.title === STEPPER_REVIEW);
        if (item) {
          item.value = !(!guestValidation || !reservationData || !accompanyGuestValidation)
            ? 100
            : 60;
        }
      }),
    );
  }, [accompanyGuestValidation, reservationData, guestValidation]);

  useEffect(() => {
    StepperInformationStorage(
      produce(StepperInformationStorage(), (draft: any) => {
        const item = draft?.find((el: any) => el?.title === STEPPER_PAYMENT);
        if (item) {
          paymentConfig?.type === NONE ? (item.title = STEPPER_CUSTOMISATION) : null;
        }
      }),
    );
  }, [paymentConfig?.type]);

  const nextStep = () => {
    if (paymentConfig?.type === NONE && personalisationData?.length === 0) {
      navigate(availablePaths?.REVIEW);
    } else if (paymentConfig?.type === NONE && personalisationData?.length !== 0) {
      navigate(availablePaths?.PERSONALIZE);
    } else if (paymentConfig?.type !== NONE && personalisationData?.length !== 0) {
      navigate(availablePaths?.CARD_AUTHORISATION);
    } else if (paymentConfig?.type !== NONE && personalisationData?.length === 0) {
      navigate(availablePaths?.CARD_AUTHORISATION);
    }
  };

  // document update
  const goToTheNextStep = useCallback(async () => {
    setLoading(true);
    let successFlag = true;

    try {
      const updateGuestDetailsPayload: IUpdateGuestDetailsApiRequest = {
        docType: documentTypes?.find(
          (option: any) => option?.value === guestReservationInfo?.docType,
        )?.code,
        docNumber: guestReservationInfo?.docNo,
        reservationId: reservationInfo?.confirmationId as string,
        firstName: guestReservationInfo?.firstName,
        lastName: guestReservationInfo?.lastName,
        profileId: reservationInfo?.guests[0]?.id as string,
        isPrimary: 'Y',
        effectiveDate: guestReservationInfo?.effectiveDate,
        expiryDate: guestReservationInfo?.expiryDate,
        countryOfIssue: guestReservationInfo?.issueCountry,
        channel: 'PWA',
        updateGuestDetails: {
          name: {
            firstName: guestReservationInfo?.firstName,
            lastName: guestReservationInfo?.lastName,
            nationality: guestReservationInfo?.nationality,
            dob: guestReservationInfo?.dob,
          },
          address: {
            id: reservationInfo?.guests[0]?.addressOperaId as string,
            addressLine1: guestReservationInfo?.addressLine1,
            addressLine2: guestReservationInfo?.addressLine2,
            addressType: 'HOME',
            countryCode: guestReservationInfo?.countryCode ?? '',
          },
          phone: {
            id: reservationInfo?.guests[0]?.phoneOperaId
              ? reservationInfo?.guests[0]?.phoneOperaId[0]
              : '',
            phoneType: 'HOME',
            phoneNumber: guestReservationInfo?.phone ?? '',
            phoneRole: 'PHONE',
          },
          email: {
            id: reservationInfo?.guests[0]?.emailOperaId
              ? reservationInfo?.guests[0]?.emailOperaId[0]
              : '',
            email: guestReservationInfo?.emails,
          },
        },
      };

      const updatePrimaryGuest = () => {
        const checkInToken = getCheckInToken();
        try {
          client.query({
            query: UPDATE_GUEST_DETAILS,
            context: { clientName: 'rest', headers: { Authorization: 'Bearer ' + checkInToken } },
            variables: {
              confirmationNumber: reservationInfo?.confirmationId as string,
              body: updateGuestDetailsPayload,
            },
          });
        } catch (error) {
          const statusCode = processStatusCode(error as ApolloError);
          statusCode === 403
            ? handleCheckInAuthenticationFailure(updatePrimaryGuest)
            : (successFlag = false);
        }
      };
      updatePrimaryGuest();

      if (accompanyGuestData.length > 0) {
        for (let i = 0; i < accompanyGuestData.length; i++) {
          const data = accompanyGuestData[i];
          if (data?.docType) {
            const updateAccompanyGuestDetailsPayload: IUpdateGuestDetailsApiRequest = {
              docType: documentTypes?.find((option: any) => option?.value === data?.docType)?.code,
              docNumber: data?.docNo,
              reservationId: reservationInfo?.reservationId as string,
              firstName: data?.firstName,
              lastName: data?.lastName,
              profileId: data?.id as string,
              isPrimary: 'N',
              effectiveDate: '',
              expiryDate: data?.expiryDate || '',
              countryOfIssue: data?.issueCountry || '',
              gender: data?.gender,
              channel: 'PWA',
              updateGuestDetails: {
                name: {
                  firstName: data?.firstName,
                  lastName: data?.lastName,
                  nationality: '',
                  dob: '',
                },
                phone: {
                  phoneType: 'HOME',
                  phoneNumber: data?.phone ?? '',
                  phoneRole: 'PHONE',
                },
                email: {
                  email: data?.emails,
                },
              },
            };

            const updateAccompanyGuests = () => {
              const checkInToken = getCheckInToken();
              try {
                client.query({
                  query: UPDATE_GUEST_DETAILS,
                  context: {
                    clientName: 'rest',
                    headers: { Authorization: 'Bearer ' + checkInToken },
                  },
                  variables: {
                    confirmationNumber: reservationInfo?.confirmationId as string,
                    body: updateAccompanyGuestDetailsPayload,
                  },
                });
              } catch (error) {
                const statusCode = processStatusCode(error as ApolloError);
                statusCode === 403
                  ? handleCheckInAuthenticationFailure(updateAccompanyGuests)
                  : (successFlag = false);
              }
            };
            updateAccompanyGuests();
          }
        }
      }

      if (successFlag) {
        nextStep();
      } else {
        toggleNotification(true);
        notificationDetails({
          title: 'Please Try Again!',
          description: 'Failed to update your details.',
          redirect: null,
          type: FAILURE,
        });
      }
    } catch (error) {
      notificationDetails({
        title: ERRORMSG,
        redirect: null,
        type: FAILURE,
        apolloError: error as ApolloError,
      });
      toggleNotification(true);
      // processError(t, error as ApolloError);
    }

    setLoading(false);
  }, [
    documentTypes,
    guestReservationInfo?.docNo,
    guestReservationInfo?.firstName,
    guestReservationInfo?.lastName,
    guestReservationInfo?.effectiveDate,
    guestReservationInfo?.expiryDate,
    guestReservationInfo?.issueCountry,
    guestReservationInfo?.nationality,
    guestReservationInfo?.dob,
    guestReservationInfo?.addressLine1,
    guestReservationInfo?.addressLine2,
    guestReservationInfo?.countryCode,
    guestReservationInfo?.phone,
    guestReservationInfo?.emails,
    guestReservationInfo?.docType,
    reservationInfo?.confirmationId,
    reservationInfo?.guests,
    reservationInfo?.reservationId,
    accompanyGuestData,
    paymentConfig?.type,
    navigate,
  ]);

  return (
    <>
      <Head>
        <title>
          {config?.name} | {t('Identity Verification')}
        </title>
      </Head>
      <Header
        screenTitle={t(`${guestSubmodule?.label}`) as string}
        displayBackButton
        backRoute={availablePaths?.CHECK_IN}
      />

      <PageWrapper className={styles.pageWrapper}>
        <Stepper />
        <div className={styles.titleWrapper}>
          <p className={styles.title}>{t('Identity Verification')}</p>
          <p className={styles.description}>
            {t(
              'Scan your Passport/ID to verify your identity. Your information is protected by responsible data practices.',
            )}
          </p>
        </div>
        {reservationInfo?.details?.contactPerson?.firstName && (
          <div className={styles.boxWrapper}>
            <p className={styles.guestType}>{t('Primary Guest')}</p>
            <div className={styles.box}>
              <div className={styles.cardTitleWrapper}>
                <p
                  className={styles.cardTitle}
                >{`${reservationInfo?.details?.contactPerson?.firstName} ${reservationInfo?.details?.contactPerson?.lastName}`}</p>
                {/* {guestReservationInfo?.docNo &&
                  guestReservationInfo?.docType &&
                  guestInformationSection?.type === YOUVERSE && (
                    <div
                      onClick={() => {
                        youverseProfileIDStorage({
                          id: reservationInfo?.guests[0]?.id,
                          guestType: PRIMARY,
                        });
                        navigate(availablePaths?.YOUVERSE);
                      }}
                    >
                      <EditIcon />
                    </div>
                  )} */}
              </div>
              <div>
                {guestInformationSection?.type === YOUVERSE ||
                guestInformationSection?.type === INCODE ? (
                  !guestReservationInfo?.docNo ||
                  !guestReservationInfo?.docType ||
                  !guestReservationInfo?.issueCountry ? (
                    <StyledButton
                      variant='contained'
                      className={styles.scanDocWrapper}
                      onClick={() => {
                        youverseProfileIDStorage({
                          id: reservationInfo?.guests[0]?.id,
                          guestType: PRIMARY,
                        });
                        navigate(
                          guestInformationSection?.type === YOUVERSE
                            ? availablePaths?.YOUVERSE
                            : availablePaths?.INCODE,
                        );
                      }}
                    >
                      <Camera />
                      <span className={styles.scanDocText}>{t('SCAN DOCUMENT')}</span>
                    </StyledButton>
                  ) : (
                    guestReservationInfo &&
                    guestInformationSection?.details && (
                      <PreCheckinGuestInfo
                        selectedGuest={guestReservationInfo}
                        guestInformationSection={guestInformationSection?.details}
                        updateSelectedGuestInformation={reservationGuestInfoStorageData}
                        type='primary'
                      ></PreCheckinGuestInfo>
                    )
                  )
                ) : (
                  guestReservationInfo &&
                  guestInformationSection?.details?.length > 0 && (
                    <PreCheckinGuestInfo
                      selectedGuest={guestReservationInfo}
                      guestInformationSection={guestInformationSection?.details}
                      updateSelectedGuestInformation={reservationGuestInfoStorageData}
                      type='primary'
                    ></PreCheckinGuestInfo>
                  )
                )}
              </div>
            </div>
          </div>
        )}
        {accompanyGuestData && accompanyGuestData?.length > 0 && (
          <div className={styles.boxWrapper}>
            <p className={styles.guestType}>
              {accompanyGuestData?.length === 1
                ? t('Accompanying Guest')
                : t('Accompanying Guests')}{' '}
            </p>
            {accompanyGuestData?.length > 0 &&
              accompanyGuestData?.map((selectedAccompanyGuest: any, index: number) => (
                <div key={index} className={styles.identityInputs}>
                  <div className={styles.cardTitleWrapper}>
                    <p className={styles.cardTitleAccompany}>
                      {`${selectedAccompanyGuest?.firstName} ${selectedAccompanyGuest?.lastName}`}
                    </p>
                    {/* {accompanyingGuestSubmodule?.type === YOUVERSE &&
                      selectedAccompanyGuest?.docNo &&
                      selectedAccompanyGuest?.docType && (
                        <div
                          onClick={() => {
                            youverseProfileIDStorage({
                              id: selectedAccompanyGuest?.id,
                              guestType: ACCOMPANYINGGUEST,
                            });
                            navigate(availablePaths?.YOUVERSE);
                          }}
                        >
                          <EditIcon />
                        </div>
                      )} */}
                  </div>

                  {accompanyingGuestSubmodule?.type === YOUVERSE ? (
                    !selectedAccompanyGuest?.docNo || !selectedAccompanyGuest?.docType ? (
                      <StyledButton
                        variant='contained'
                        className={styles.scanDocWrapper}
                        onClick={() => {
                          youverseProfileIDStorage({
                            id: selectedAccompanyGuest?.id,
                            guestType: ACCOMPANYINGGUEST,
                          });
                          navigate(availablePaths?.YOUVERSE);
                        }}
                      >
                        <Camera />
                        <span className={styles.scanDocText}>{t('SCAN DOCUMENT')}</span>
                      </StyledButton>
                    ) : (
                      selectedAccompanyGuest &&
                      accompanyGuestInformationSection?.length > 0 && (
                        <PreCheckinGuestInfo
                          selectedGuest={selectedAccompanyGuest}
                          guestInformationSection={accompanyGuestInformationSection}
                          updateSelectedGuestInformation={accompanyGuestDetails}
                          type='secondary'
                        ></PreCheckinGuestInfo>
                      )
                    )
                  ) : (
                    selectedAccompanyGuest &&
                    accompanyGuestInformationSection?.length > 0 && (
                      <PreCheckinGuestInfo
                        selectedGuest={selectedAccompanyGuest}
                        guestInformationSection={accompanyGuestInformationSection}
                        updateSelectedGuestInformation={accompanyGuestDetails}
                        type='secondary'
                      ></PreCheckinGuestInfo>
                    )
                  )}
                </div>
              ))}
          </div>
        )}
        <div className={cx(styles.bottomMenuWrapper)}>
          <StyledButton
            variant='contained'
            loading={loading}
            disabled={!guestValidation || !reservationData || !accompanyGuestValidation}
            onClick={goToTheNextStep}
            className={cx(styles.bottomMenuButton)}
          >
            {t('Next')}
          </StyledButton>
        </div>
      </PageWrapper>

      <Notification
        title={notificationInfo?.title}
        description={notificationInfo?.description}
        apolloError={notificationInfo?.apolloError}
        redirect={notificationInfo?.redirect}
        type={notificationInfo?.type}
      />
    </>
  );
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const locale = ctx?.params?.locale;
  return {
    props: {
      ...(await serverSideTranslations(locale as string, ['about-your-stay'], i18nConfig)),
    },
  };
};

export default Guest;
