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
  UPGRADE_ROOM,
  CMS,
  ROOM,
  SECONDARY,
  NEWGUEST,
  NEWGUESTFORM,
  SUCCESS,
} from 'utils/constants';
import { updateDocTypeOptions } from 'utils/functions';
import { docTypeStorage } from 'storage/guest-information.storage';
import { Stepper } from 'components/shared/Stepper/Stepper';
import { StepperInformationStorage, youverseProfileIDStorage } from 'storage/check-in.storage';
import produce from 'immer';
import Camera from '@icons/cameraIcon.svg';
import {
  accompanyGuestDetails,
  newAccompanyGuestDetails,
  updateNewAccompanyGuestDetails,
} from 'storage/accompany-guest-details';
import { Notification } from 'components/shared/Notification/Notification';
import { notificationDetails, toggleNotification } from 'storage/home.storage';
import {
  getCheckInToken,
  handleCheckInAuthenticationFailure,
} from 'core/api/functions/getCheckInAuthentication';
import { processStatusCode } from 'utils/processError';
import { personalizationStorage } from 'storage/personalize-your-room.storage';
import { ADD_ACCOMPANY_GUEST } from 'core/graphql/queries/ADD_GUEST';
import { DetailsCard, DetailsCardShrinked } from 'components/shared/DetailsCard/DetailsCard';

export { getStaticPaths };

const Guest: React.FC<any> = () => {
  const { t } = useTranslation(['about-your-stay', 'check-in']);
  const navigate = useLocalizedRouter();
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [addAccompanyGuest, setAddAccompanyGuest] = useState(false);
  const [newGuestAdded, setNewGuestAdded] = useState(false);
  const notificationInfo = useReactiveVar(notificationDetails);
  const config = useConfig();
  const paymentConfig: any = usePaymentConfig();
  const guestReservationInfo = useReactiveVar(reservationGuestInfoStorageData);
  const accompanyGuestData = useReactiveVar(accompanyGuestDetails);
  const availablePersonalizations = useReactiveVar(personalizationStorage);
  const newGuestData = useReactiveVar(newAccompanyGuestDetails);
  const updatedGuestData = useReactiveVar(updateNewAccompanyGuestDetails);
  const [openToggleNewGuest, setOpenToggleNewGuest] = useState(
    new Array(updatedGuestData?.length)?.fill(false),
  );
  const [openToggleAccompanyGuest, setOpenToggleAccompanyGuest] = useState(
    new Array(accompanyGuestData?.length)?.fill(false),
  );
  const [openTogglePrimaryGuest, setOpenTogglePrimaryGuest] = useState(false);

  const reservationData = client.readQuery<IGetReservationApiResponse>({
    query: GET_RESERVATION,
  });

  const reservationInfo = reservationData?.getReservation?.data;

  const checkInModule: any = config?.modules?.find((module) => module?.code === CHECK_IN);

  // primary guest configuration
  const guestSubmodule = checkInModule?.submodules?.find(
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
  const accompanyingGuestSubmodule = checkInModule?.submodules?.find(
    (submodule: any) => submodule?.name === ACCOMPANYINGGUEST && submodule.isActive,
  );
  const accompanyGuestInformationSection = updateDocTypeOptions(
    accompanyingGuestSubmodule?.details,
    documentTypes,
  );

  const upgradeRoomConfig = checkInModule?.submodules?.find(
    (submodule: any) => submodule?.name === UPGRADE_ROOM && submodule.isActive,
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

  const newAcompanyGuestValidation = newGuestData
    ? validateCompleteGuestDetails(newGuestData, accompanyGuestInformationSection)
    : false;

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

  const nextStep = useCallback(() => {
    if (
      (paymentConfig?.type === NONE ||
        (paymentConfig?.isTotalChargeActive &&
          Number(reservationInfo?.roomTypes[0]?.totalCharge) === 0)) &&
      availablePersonalizations?.length === 0
    ) {
      navigate(availablePaths?.REVIEW);
    } else if (paymentConfig?.type === NONE && availablePersonalizations?.length !== 0) {
      navigate(availablePaths?.PERSONALIZE);
    } else {
      const filteredRoomList: any =
        availablePersonalizations?.length > 0 &&
        availablePersonalizations?.filter((item: any) => item?.isActive && item?.type === ROOM);
      if (upgradeRoomConfig?.type !== CMS && filteredRoomList?.length > 0) {
        navigate(availablePaths?.UPGRADE_ROOM);
      } else {
        navigate(availablePaths?.CARD_AUTHORISATION);
      }
    }
  }, [
    paymentConfig?.type,
    paymentConfig?.isTotalChargeActive,
    reservationInfo?.roomTypes,
    availablePersonalizations,
    navigate,
    upgradeRoomConfig?.type,
  ]);

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
            dob: guestReservationInfo?.dateOfBirth,
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
                dob: data?.dateOfBirth,
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

      if (successFlag) {
        nextStep();
      } else {
        toggleNotification(true);
        notificationDetails({
          title: t('Please Try Again!') as string,
          description: t('Failed to update your details.') as string,
          redirect: null,
          type: FAILURE,
        });
      }
    } catch (error) {
      notificationDetails({
        title: t(ERRORMSG) as string,
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
    guestReservationInfo?.dateOfBirth,
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
    nextStep,
    t,
  ]);

  const handleClickAccompanyGuest = () => {
    const guestFields = accompanyGuestInformationSection.reduce((acc: any, curr: any) => {
      if (curr.label && curr.isActive) {
        acc[curr.name] = '';
      }
      return acc;
    }, {});
    newAccompanyGuestDetails(guestFields);
    setAddAccompanyGuest(true);
    setNewGuestAdded(false);
  };

  const saveGuest = async () => {
    const checkInToken = getCheckInToken();
    const addAccompanyGuestDetailsPayload = {
      isRegisterNewProfile: true,
      guests: [
        {
          firstName: newGuestData?.firstName,
          lastName: newGuestData?.lastName,
          phone: newGuestData?.phone,
          email: newGuestData?.emails,
          docType: newGuestData?.docType?.toUpperCase(),
          docNumber: newGuestData?.docNo,
          dob: newGuestData?.dateOfBirth,
        },
      ],
    };
    try {
      setGuestLoading(true);
      const res: any = await client.query({
        query: ADD_ACCOMPANY_GUEST,
        context: {
          clientName: 'rest',
          headers: { Authorization: 'Bearer ' + checkInToken },
        },
        variables: {
          confirmationNumber: reservationInfo?.confirmationId as string,
          body: addAccompanyGuestDetailsPayload,
        },
      });

      setNewGuestAdded(true);
      setAddAccompanyGuest(false);
      updateNewAccompanyGuestDetails([
        ...updatedGuestData,
        {
          ...newGuestData,
          id: res?.data?.addAccompanyDetails?.data?.at(-1)?.id,
        },
      ]);
      toggleNotification(true);
      notificationDetails({
        title: t('Guest Added') as string,
        description: t('Guest information added successfully.') as string,
        redirect: null,
        type: SUCCESS,
      });
      setGuestLoading(false);
    } catch (error) {
      toggleNotification(true);
      notificationDetails({
        title: t('Please Try Again!') as string,
        description: t('Failed to add guest details.') as string,
        redirect: null,
        type: FAILURE,
      });
      setGuestLoading(false);
    }
  };

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
                    <span className={styles.scanDocText}>{t('Scan Document')}</span>
                  </StyledButton>
                ) : (
                  guestReservationInfo &&
                  guestInformationSection?.details &&
                  (openTogglePrimaryGuest ? (
                    <DetailsCard
                      title={t('Guest Information')}
                      icon
                      handleClick={() => setOpenTogglePrimaryGuest((prev) => !prev)}
                    >
                      <div className={styles.margin}>
                        <PreCheckinGuestInfo
                          selectedGuest={guestReservationInfo}
                          guestInformationSection={guestInformationSection?.details}
                          updateSelectedGuestInformation={reservationGuestInfoStorageData}
                          type={PRIMARY}
                        />
                      </div>
                    </DetailsCard>
                  ) : (
                    <DetailsCardShrinked
                      title={t('Guest Information')}
                      handleClick={() => setOpenTogglePrimaryGuest((prev) => !prev)}
                    >
                      <div className={styles.cardTitleWrapper}>
                        <p
                          className={styles.cardTitle}
                        >{`${reservationInfo?.details?.contactPerson?.firstName} ${reservationInfo?.details?.contactPerson?.lastName}`}</p>
                      </div>
                    </DetailsCardShrinked>
                  ))
                )
              ) : (
                guestReservationInfo &&
                guestInformationSection?.details?.length > 0 &&
                (openTogglePrimaryGuest ? (
                  <DetailsCard
                    title={t('Guest Information')}
                    handleClick={() => setOpenTogglePrimaryGuest((prev) => !prev)}
                    icon
                  >
                    <div className={styles.margin}>
                      <PreCheckinGuestInfo
                        selectedGuest={guestReservationInfo}
                        guestInformationSection={guestInformationSection?.details}
                        updateSelectedGuestInformation={reservationGuestInfoStorageData}
                        type={PRIMARY}
                      />
                    </div>
                  </DetailsCard>
                ) : (
                  <DetailsCardShrinked
                    title={t('Guest Information')}
                    handleClick={() => setOpenTogglePrimaryGuest((prev) => !prev)}
                  >
                    <div className={styles.cardTitleWrapper}>
                      <p
                        className={styles.cardTitle}
                      >{`${reservationInfo?.details?.contactPerson?.firstName} ${reservationInfo?.details?.contactPerson?.lastName}`}</p>
                    </div>
                  </DetailsCardShrinked>
                ))
              )}
            </div>
          </div>
        )}
        {accompanyGuestData && accompanyGuestData?.length > 0 && (
          <div className={styles.boxWrapper}>
            <p className={styles.guestType}>
              {accompanyGuestData?.length + updatedGuestData?.length === 1
                ? t('Accompanying Guest')
                : t('Accompanying Guests')}{' '}
            </p>
            {accompanyGuestData?.length > 0 &&
              accompanyGuestData?.map((selectedAccompanyGuest: any, index: number) => (
                <div key={index}>
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
                        <span className={styles.scanDocText}>{t('Scan Document')}</span>
                      </StyledButton>
                    ) : (
                      selectedAccompanyGuest &&
                      accompanyGuestInformationSection?.length > 0 &&
                      (openToggleAccompanyGuest[index] ? (
                        <DetailsCard
                          title={`${t('Guest')} ${index + 1}`}
                          handleClick={() =>
                            setOpenToggleAccompanyGuest((prev) => {
                              const newState = [...prev];
                              newState[index] = !newState[index];
                              return newState;
                            })
                          }
                          icon
                        >
                          <div className={styles.margin}>
                            <PreCheckinGuestInfo
                              selectedGuest={selectedAccompanyGuest}
                              guestInformationSection={accompanyGuestInformationSection}
                              updateSelectedGuestInformation={accompanyGuestDetails}
                              type={SECONDARY}
                            />
                          </div>
                        </DetailsCard>
                      ) : (
                        <DetailsCardShrinked
                          title={`${t('Guest')} ${index + 1}`}
                          handleClick={() =>
                            setOpenToggleAccompanyGuest((prev) => {
                              const newState = [...prev];
                              newState[index] = !newState[index];
                              return newState;
                            })
                          }
                        >
                          <div className={styles.cardTitleWrapper}>
                            <p className={styles.cardTitleAccompany}>
                              {`${selectedAccompanyGuest?.firstName} ${selectedAccompanyGuest?.lastName}`}
                            </p>
                          </div>
                        </DetailsCardShrinked>
                      ))
                    )
                  ) : (
                    selectedAccompanyGuest &&
                    accompanyGuestInformationSection?.length > 0 &&
                    (openToggleAccompanyGuest[index] ? (
                      <DetailsCard
                        title={`${t('Guest')} ${index + 1}`}
                        handleClick={() =>
                          setOpenToggleAccompanyGuest((prev) => {
                            const newState = [...prev];
                            newState[index] = !newState[index];
                            return newState;
                          })
                        }
                        icon
                      >
                        <div className={styles.margin}>
                          <PreCheckinGuestInfo
                            selectedGuest={selectedAccompanyGuest}
                            guestInformationSection={accompanyGuestInformationSection}
                            updateSelectedGuestInformation={accompanyGuestDetails}
                            type={SECONDARY}
                          />
                        </div>
                      </DetailsCard>
                    ) : (
                      <DetailsCardShrinked
                        title={`${t('Guest')} ${index + 1}`}
                        handleClick={() =>
                          setOpenToggleAccompanyGuest((prev) => {
                            const newState = [...prev];
                            newState[index] = !newState[index];
                            return newState;
                          })
                        }
                      >
                        <div className={styles.cardTitleWrapper}>
                          <p className={styles.cardTitleAccompany}>
                            {`${selectedAccompanyGuest?.firstName} ${selectedAccompanyGuest?.lastName}`}
                          </p>
                        </div>
                      </DetailsCardShrinked>
                    ))
                  )}
                </div>
              ))}
          </div>
        )}
        {updatedGuestData?.length > 0 && (
          <div className={styles.boxWrapper}>
            {updatedGuestData?.map((guestData: any, index: any) => (
              <div key={index}>
                {openToggleNewGuest[index] ? (
                  <DetailsCard
                    title={t(`${t('Guest')} ${accompanyGuestData?.length + index + 1}`)}
                    icon
                    handleClick={() =>
                      setOpenToggleNewGuest((prev) => {
                        const newState = [...prev];
                        newState[index] = !newState[index];
                        return newState;
                      })
                    }
                  >
                    <div className={styles.margin}>
                      <PreCheckinGuestInfo
                        selectedGuest={guestData}
                        guestInformationSection={accompanyGuestInformationSection}
                        updateSelectedGuestInformation={updateNewAccompanyGuestDetails}
                        type={NEWGUEST}
                      />
                    </div>
                  </DetailsCard>
                ) : (
                  <DetailsCardShrinked
                    title={t(`${t('Guest')} ${accompanyGuestData?.length + index + 1}`)}
                    handleClick={() =>
                      setOpenToggleNewGuest((prev) => {
                        const newState = [...prev];
                        newState[index] = !newState[index];
                        return newState;
                      })
                    }
                  >
                    <div className={styles.cardTitleWrapper}>
                      <p className={styles.cardTitleAccompany}>
                        {`${guestData?.firstName} ${guestData?.lastName}`}
                      </p>
                    </div>
                  </DetailsCardShrinked>
                )}
              </div>
            ))}
          </div>
        )}

        {addAccompanyGuest && (
          <div className={styles.boxWrapperForm}>
            <div className={styles.box}>
              <PreCheckinGuestInfo
                selectedGuest={newGuestData}
                guestInformationSection={accompanyGuestInformationSection}
                updateSelectedGuestInformation={newAccompanyGuestDetails}
                type={NEWGUESTFORM}
              />
              {!newGuestAdded && (
                <StyledButton
                  variant='contained'
                  disabled={!newAcompanyGuestValidation}
                  className={styles.button}
                  loading={guestLoading}
                  onClick={() => saveGuest()}
                >
                  {t('Save')}
                </StyledButton>
              )}
            </div>
          </div>
        )}
        {accompanyingGuestSubmodule?.type !== YOUVERSE &&
          reservationInfo &&
          reservationInfo?.guests?.length + updatedGuestData?.length <
            reservationInfo?.details?.totalGuestCount &&
          !addAccompanyGuest && (
            <StyledButton
              variant='contained'
              className={styles.button}
              onClick={() => handleClickAccompanyGuest()}
            >
              {t('Add Guest')}
            </StyledButton>
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
      ...(await serverSideTranslations(
        locale as string,
        ['about-your-stay', 'check-in'],
        i18nConfig,
      )),
    },
  };
};

export default Guest;
