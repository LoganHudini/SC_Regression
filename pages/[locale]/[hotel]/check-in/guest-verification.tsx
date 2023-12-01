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
import { ApolloError, useReactiveVar, useQuery } from '@apollo/client';
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
import { processError } from 'utils/processError';
import { useConfig } from 'utils/hooks/useConfiguration';
import {
  CHECK_IN,
  EMAIL_REGEX,
  GUESTINFORMATION,
  INFORMATION,
  PHONE,
  PHONE_REGEX,
  EMAILS,
  STEPPER_REVIEW,
  ACCOMPANYINGGUEST,
  EMAIL,
  SELECTDROPDOWN,
  CHECKBOX,
  YOUVERSE,
  PRIMARY,
  DATEPICKER,
  FAILURE,
  INCODE,
  DOCTYPE,
  ERRORMSG,
} from 'utils/constants';
import { updateDocTypeOptions } from 'utils/functions';
import { docTypeStorage } from 'storage/guest-information.storage';
import { Stepper } from 'components/shared/Stepper/Stepper';
import { StepperInformationStorage, youverseProfileIDStorage } from 'storage/check-in.storage';
import produce from 'immer';
import { StyledInput } from 'components/shared/StyledInput/StyledInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { StyledFormControl } from 'components/shared/StyledFormControl/StyledFormControl';
import DropDown from '@icons/dropDownIcon.svg';
import Camera from '@icons/cameraIcon.svg';
import { StyledCheckBox } from 'components/shared/StyledCheckBox/StyledCheckBox';
import { accompanyGuestDetails } from 'storage/accompany-guest-details';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { timeFormats } from 'utils/timeFormats';
import { Notification } from 'components/shared/Notification/Notification';
import { notificationDetails, toggleNotification } from 'storage/home.storage';
export { getStaticPaths };

const Guest: React.FC<any> = () => {
  const navigate = useLocalizedRouter();
  const [loading, setLoading] = useState(false);
  const notificationInfo = useReactiveVar(notificationDetails);
  const config = useConfig();
  const { t } = useTranslation('about-your-stay');

  const reservationData = client.readQuery<IGetReservationApiResponse>({
    query: GET_RESERVATION,
  });

  const checkinModule: any = config?.modules?.find((module) => module?.code === CHECK_IN);
  const guestSubmodule = checkinModule?.submodules?.find(
    (submodule: any) => submodule?.name === INFORMATION && submodule?.isActive,
  );
  const activeSections = guestSubmodule?.details?.filter((section: any) => section?.isActive);

  const guestInformationSection = activeSections?.find(
    (section: any) => section?.name === GUESTINFORMATION && section.isActive,
  );

  const transformedData = guestInformationSection?.details?.find(
    (e: any) => e?.name === DOCTYPE,
  )?.options;

  useEffect(() => {
    if (transformedData) {
      docTypeStorage(transformedData);
    }
  }, [transformedData]);

  const reservationInfo = reservationData?.getReservation?.data;
  const guestReservationInfo = useReactiveVar(reservationGuestInfoStorageData);
  const guestLength = reservationInfo?.guests?.length;

  useEffect(() => {
    if (!reservationData) {
      navigate(availablePaths?.HOME);
    }
  }, [reservationData, navigate]);

  const extractDataForField = useCallback(
    (fieldName: string) => {
      const fieldPath = fieldName.split('.');

      let source: any = reservationInfo?.guests[0];
      const remainingAttributes: any = reservationInfo?.reservePayments[0];

      for (const field of fieldPath) {
        if (source && source[field]) {
          source = source[field];
        } else {
          source = remainingAttributes[field];
          break;
        }
      }

      if (Array.isArray(source)) {
        source = source.join(', ');
      }
      return source;
    },
    [reservationInfo?.guests, reservationInfo?.reservePayments],
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
        isComplete: validateGuestReservation(guestInformationSection?.details),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extractDataForField, reservationInfo?.guests]);

  const validateGuestReservation = (field: any) => {
    if (!guestReservationInfo) {
      return true;
    }
    if (field === undefined) {
      return true;
    }
    return field?.every((fieldItem: any) => {
      if (!fieldItem.required) {
        return true;
      }

      const infoValue = guestReservationInfo[fieldItem?.name];

      if (fieldItem.name === PHONE) {
        return PHONE_REGEX.test(infoValue);
      }

      if (fieldItem.name === EMAILS) {
        return EMAIL_REGEX.test(infoValue);
      }

      return !!infoValue;
    });
  };

  const validButton = validateGuestReservation(guestInformationSection?.details);

  const accompanyingGuestSubmodule = checkinModule?.submodules?.find(
    (submodule: any) => submodule?.name === ACCOMPANYINGGUEST && submodule.isActive,
  );

  const docTypeFunction = updateDocTypeOptions(
    accompanyingGuestSubmodule?.details,
    transformedData,
  );

  const [otherFieldErrors, setOtherFieldErrors] = useState<any>([]);
  let isValid: any = true;
  let errorMessage: any = '';

  const handleFieldBlur: any = (index: any, fieldName: any, value: any, item?: any) => {
    if (!value) {
      errorMessage = t(`${item} is required`);
    } else if (fieldName === EMAIL && !EMAIL_REGEX.test(value)) {
      isValid = false;
      errorMessage = t('Invalid email address');
    } else if (fieldName === PHONE && !PHONE_REGEX.test(value)) {
      isValid = false;
      errorMessage = t('Invalid phone number');
    }

    setOtherFieldErrors((prevErrors: any) => {
      const updatedErrors: any = [...prevErrors];
      updatedErrors[index] = { fieldName, isValid, errorMessage };
      return updatedErrors;
    });
  };

  const [infoCards, setInfoCards] = useState<any>([]);
  const [statusClass, setStatus] = useState<any>([]);
  const [conditionsAccepted, setConditionsAccepted] = useState(false);
  const accompanyGuestData = useReactiveVar(accompanyGuestDetails);

  useEffect(() => {
    function extractAndStoreGuests(response: any) {
      if (response?.guests && response?.guests?.length > 1) {
        const storedGuests = response?.guests?.slice(1)?.map((guest: any) => {
          return {
            formData: {
              alreadyUpdated: true,
              id: guest?.id,
              firstName: guest?.firstName,
              lastName: guest?.lastName,
              email: '',
              phone: null,
              docType: '',
              docNo: '',
            },
          };
        });

        return storedGuests;
      } else {
        return [];
      }
    }
    if (!accompanyGuestData) {
      accompanyGuestDetails(extractAndStoreGuests(reservationInfo));
    }
  }, [reservationInfo, accompanyGuestData]);

  useEffect(() => {
    const generateInfoCards = (guestData: any, initial = false) => {
      return guestData?.map((guest: any) => {
        const formData: any = { alreadyUpdated: !initial, id: guest?.id };

        docTypeFunction?.forEach((item: any) => {
          const guestItem = guest[item?.name];
          if (guestItem && guestItem.isActive) {
            formData[item?.name] = guestItem.value;
          } else if (item?.name in guest) {
            formData[item?.name] = guest[item?.name];
          } else if (item?.isActive) {
            formData[item?.name] = '';
          }
        });

        return { formData };
      });
    };

    if (accompanyGuestData && accompanyGuestData?.length > 0) {
      setInfoCards(accompanyGuestData);
    } else if (reservationInfo && reservationInfo?.guests?.length > 1) {
      const initialInfoCards = generateInfoCards(reservationInfo?.guests.slice(1), false);
      setInfoCards(initialInfoCards);
    } else {
      setInfoCards([{ formData: { alreadyUpdated: false } }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accompanyGuestData, accompanyingGuestSubmodule?.details, reservationInfo]);

  const buttonValidation =
    guestLength && guestLength > 1 && statusClass?.some((item: any) => item === false);

  const handleInputChange = (index: number, label?: any) => (e: any) => {
    const { name, value, required } = e.target;

    setInfoCards((prevCards: any) =>
      prevCards.map((card: any, i: number) =>
        i === index ? { ...card, formData: { ...card.formData, [name]: value } } : card,
      ),
    );
    if (required) {
      setOtherFieldErrors((prevErrors: any) => {
        const updatedErrors = [...prevErrors];
        const fieldName = name;
        let isValid = true;
        let errorMessage = '';

        if (!value) {
          errorMessage = t(`${label} is required`);
        } else if (fieldName === EMAIL && !EMAIL_REGEX.test(value)) {
          isValid = false;
          errorMessage = t('Invalid email address');
        } else if (fieldName === PHONE && !PHONE_REGEX.test(value)) {
          isValid = false;
          errorMessage = t('Invalid phone number');
        }

        updatedErrors[index] = { fieldName, isValid, errorMessage };
        return updatedErrors;
      });
    }
  };

  useEffect(() => {
    const updatedStatus = infoCards?.map((card: any) => {
      let cardStatus = true;

      docTypeFunction?.forEach((item: any) => {
        if (item?.isActive && item?.required) {
          if (item?.required) {
            if (!card?.formData[item?.name]) {
              cardStatus = false;
            }
          }

          if (item?.name === EMAIL && !EMAIL_REGEX.test(card.formData[item?.name])) {
            cardStatus = false;
          }
          if (item?.name === PHONE && !PHONE_REGEX.test(card.formData[item?.name])) {
            cardStatus = false;
          }
        }
      });

      return cardStatus;
    });

    setStatus(updatedStatus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [infoCards, accompanyingGuestSubmodule?.details]);

  const toggleConditionsAccepted = useCallback(() => {
    setConditionsAccepted((oldState) => !oldState);
  }, []);

  useEffect(() => {
    StepperInformationStorage(
      produce(StepperInformationStorage(), (draft: any) => {
        const item = draft?.find((el: any) => el?.title === STEPPER_REVIEW);
        if (item) {
          item.value = !(!validButton || !reservationData || buttonValidation) ? 100 : 60;
        }
      }),
    );
  }, [buttonValidation, reservationData, validButton]);

  const goToTheNextStep = useCallback(async () => {
    setLoading(true);
    let successFlag = true;

    try {
      const updateGuestDetailsPayload: IUpdateGuestDetailsApiRequest = {
        docType: transformedData?.find(
          (option: any) => option?.name === guestReservationInfo?.docType,
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
      try {
        await client.query({
          query: UPDATE_GUEST_DETAILS,
          context: { clientName: 'rest' },
          variables: {
            confirmationNumber: reservationInfo?.confirmationId as string,
            body: updateGuestDetailsPayload,
          },
        });
      } catch (error) {
        successFlag = false;
      }

      const updatedData = infoCards?.filter((card: any) => card?.formData?.alreadyUpdated);
      if (updatedData.length > 0) {
        for (let i = 0; i < updatedData.length; i++) {
          const data = updatedData[i];
          if (data?.formData?.docType) {
            const updateAccompanyGuestDetailsPayload: IUpdateGuestDetailsApiRequest = {
              docType: transformedData?.find(
                (option: any) => option?.name === data?.formData?.docType,
              )?.code,
              docNumber: data?.formData?.docNo,
              reservationId: reservationInfo?.reservationId as string,
              firstName: data?.formData?.firstName,
              lastName: data?.formData?.lastName,
              profileId: data?.formData?.id as string,
              isPrimary: 'N',
              effectiveDate: '',
              expiryDate: data?.formData?.expiryDate || '',
              countryOfIssue: data?.formData?.issueCountry || '',
              gender: data?.formData?.gender,
              channel: 'PWA',
              updateGuestDetails: {
                name: {
                  firstName: data?.formData?.firstName,
                  lastName: data?.formData?.lastName,
                  nationality: '',
                  dob: '',
                },
                phone: {
                  phoneType: 'HOME',
                  phoneNumber: data?.formData?.phone ?? '',
                  phoneRole: 'PHONE',
                },
                email: {
                  email: data?.formData?.email,
                },
              },
            };

            try {
              await client.query({
                query: UPDATE_GUEST_DETAILS,
                context: { clientName: 'rest' },
                variables: {
                  confirmationNumber: reservationInfo?.confirmationId as string,
                  body: updateAccompanyGuestDetailsPayload,
                },
              });
            } catch (error) {
              successFlag = false;
            }
          }
        }
      }

      if (successFlag) {
        accompanyGuestDetails(infoCards);
        navigate(availablePaths?.CARD_AUTHORISATION);
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
    transformedData,
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
    infoCards,
    navigate,
    t,
  ]);

  return (
    <>
      <Head>
        <title>
          {config?.name} | {t('Identity Verification')}
        </title>
      </Head>
      <Header screenTitle={t(`${guestSubmodule?.label}`) as string} displayBackButton />

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
            <>
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
                    ></PreCheckinGuestInfo>
                  )
                )
              ) : (
                guestReservationInfo &&
                guestInformationSection?.details && (
                  <PreCheckinGuestInfo
                    selectedGuest={guestReservationInfo}
                    guestInformationSection={guestInformationSection?.details}
                  ></PreCheckinGuestInfo>
                )
              )}
            </>
          </div>
        </div>
        {guestLength && guestLength > 1 && (
          <div className={styles.boxWrapper}>
            <p className={styles.guestType}>
              {infoCards?.length === 1 ? t('Accompanying Guest') : t('Accompanying Guests')}{' '}
            </p>
            {infoCards?.map((card: any, index: number) => (
              <div key={index} className={styles.identityInputs}>
                <div className={styles.cardTitleWrapper}>
                  <p className={styles.cardTitleAccompany}>
                    {`${card?.formData?.firstName} ${card?.formData?.lastName}`}
                  </p>
                  {/* {accompanyingGuestSubmodule?.type === YOUVERSE &&
                      card?.formData?.docNo &&
                      card?.formData?.docType && (
                        <div
                          onClick={() => {
                            youverseProfileIDStorage({
                              id: card?.formData?.id,
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
                  !card?.formData?.docNo || !card?.formData?.docType ? (
                    <StyledButton
                      variant='contained'
                      className={styles.scanDocWrapper}
                      onClick={() => {
                        youverseProfileIDStorage({
                          id: card?.formData?.id,
                          guestType: ACCOMPANYINGGUEST,
                        });
                        navigate(availablePaths?.YOUVERSE);
                      }}
                    >
                      <Camera />
                      <span className={styles.scanDocText}>{t('SCAN DOCUMENT')}</span>
                    </StyledButton>
                  ) : (
                    docTypeFunction?.map((item: any) => {
                      if (item?.isActive) {
                        return (
                          <React.Fragment key={item?.name}>
                            {item?.type === SELECTDROPDOWN ? (
                              <div className={styles.col_100}>
                                <StyledFormControl
                                  required={item?.required}
                                  disabled={item?.isDisabled}
                                  className={styles.guestDataInput}
                                  variant='standard'
                                  sx={{ m: 1, minWidth: '100%' }}
                                >
                                  <InputLabel>{item?.label}</InputLabel>
                                  <Select
                                    className={styles.guestDataInput}
                                    label={item?.label}
                                    variant='standard'
                                    name={item?.name}
                                    id={item?.name}
                                    value={card?.formData?.[item?.name] || ''}
                                    onChange={handleInputChange(index)}
                                    disabled={item?.isDisabled}
                                    IconComponent={DropDown}
                                  >
                                    {item?.options?.map((item: any) => {
                                      return (
                                        <MenuItem value={item?.value} key={item?.value}>
                                          <em>{item?.name}</em>
                                        </MenuItem>
                                      );
                                    })}
                                  </Select>
                                </StyledFormControl>
                              </div>
                            ) : item?.type === CHECKBOX ? (
                              <div className={styles.agrementWrapperTitle}>
                                <StyledCheckBox
                                  onChange={handleInputChange(index)}
                                  onClick={toggleConditionsAccepted}
                                  name={item?.name}
                                  value={conditionsAccepted}
                                  checked={card.formData.condition == 'false'}
                                />
                                <p className={styles.agrementText}>
                                  {t(`${item?.label}`) as string}
                                </p>
                              </div>
                            ) : (
                              <div className={styles.col_100}>
                                <StyledInput
                                  required={item?.required}
                                  autoComplete='off'
                                  label={item?.label}
                                  className={styles.guestDataInput}
                                  variant='standard'
                                  name={item?.name}
                                  value={card?.formData?.[item?.name] || ''}
                                  type={item?.type}
                                  disabled={item?.isDisabled}
                                  onChange={handleInputChange(index, item?.label)}
                                  onFocus={() => {
                                    item?.required &&
                                      handleFieldBlur(
                                        index,
                                        item?.name,
                                        card?.formData?.[item?.name] || '',
                                        item?.label,
                                      );
                                  }}
                                  error={
                                    otherFieldErrors[index]?.fieldName === item?.name &&
                                    !otherFieldErrors[index]?.isValid
                                  }
                                  helperText={
                                    otherFieldErrors[index]?.fieldName === item?.name
                                      ? otherFieldErrors[index]?.errorMessage
                                      : ''
                                  }
                                />
                              </div>
                            )}
                          </React.Fragment>
                        );
                      } else {
                        return null;
                      }
                    })
                  )
                ) : (
                  docTypeFunction?.map((item: any) => {
                    if (item?.isActive) {
                      return (
                        <React.Fragment key={item?.name}>
                          {item?.type === SELECTDROPDOWN ? (
                            <div className={styles.col_100}>
                              <StyledFormControl
                                required={item?.required}
                                disabled={item?.isDisabled}
                                className={styles.guestDataInput}
                                variant='standard'
                                sx={{ m: 1, minWidth: '100%' }}
                              >
                                <InputLabel>{item?.label}</InputLabel>
                                <Select
                                  className={styles.guestDataInput}
                                  label={item?.label}
                                  variant='standard'
                                  name={item?.name}
                                  id={item?.name}
                                  value={card?.formData?.[item?.name] || ''}
                                  onChange={handleInputChange(index)}
                                  disabled={item?.isDisabled}
                                  IconComponent={DropDown}
                                >
                                  {item?.options?.map((item: any) => {
                                    return (
                                      <MenuItem value={item?.value} key={item?.value}>
                                        <em>{item?.name}</em>
                                      </MenuItem>
                                    );
                                  })}
                                </Select>
                              </StyledFormControl>
                            </div>
                          ) : item?.type === CHECKBOX ? (
                            <div className={styles.agrementWrapperTitle}>
                              <StyledCheckBox
                                onChange={handleInputChange(index)}
                                onClick={toggleConditionsAccepted}
                                name={item?.name}
                                value={conditionsAccepted}
                                checked={card.formData.condition == 'false'}
                              />
                              <p className={styles.agrementText}>{t(`${item?.label}`) as string}</p>
                            </div>
                          ) : item?.type === DATEPICKER ? (
                            <div className={styles.col_100}>
                              <DatePicker
                                label={item?.label}
                                className={styles.guestDataInput}
                                value={card?.formData?.[item?.name] || ''}
                                onChange={(date) => {
                                  const expiryDate = dayjs(date).format(timeFormats.YEAR_MONTH_DAY);

                                  handleInputChange(
                                    index,
                                    item?.label,
                                  )({ target: { name: item?.name, value: expiryDate } });
                                }}
                                disabled={item?.isDisabled}
                                disableFuture={item?.isDisableFuture}
                                disablePast={item?.isDisablePast}
                                renderInput={(params) => (
                                  <StyledInput
                                    required={item?.required}
                                    autoComplete='off'
                                    className={styles.guestDataInput}
                                    variant='standard'
                                    name={item?.name}
                                    id={item?.name}
                                    {...params}
                                    error={
                                      otherFieldErrors[index]?.fieldName === item?.name &&
                                      !otherFieldErrors[index]?.isValid
                                    }
                                    helperText={
                                      otherFieldErrors[index]?.fieldName === item?.name
                                        ? otherFieldErrors[index]?.errorMessage
                                        : ''
                                    }
                                  />
                                )}
                              />
                            </div>
                          ) : (
                            <div className={styles.col_100}>
                              <StyledInput
                                required={item?.required}
                                autoComplete='off'
                                label={item?.label}
                                className={styles.guestDataInput}
                                variant='standard'
                                name={item?.name}
                                value={card?.formData?.[item?.name] || ''}
                                type={item?.type}
                                disabled={item?.isDisabled}
                                onChange={handleInputChange(index, item?.label)}
                                onFocus={() => {
                                  item?.required &&
                                    handleFieldBlur(
                                      index,
                                      item?.name,
                                      card?.formData?.[item?.name] || '',
                                      item?.label,
                                    );
                                }}
                                error={
                                  otherFieldErrors[index]?.fieldName === item?.name &&
                                  !otherFieldErrors[index]?.isValid
                                }
                                helperText={
                                  otherFieldErrors[index]?.fieldName === item?.name
                                    ? otherFieldErrors[index]?.errorMessage
                                    : ''
                                }
                              />
                            </div>
                          )}
                        </React.Fragment>
                      );
                    } else {
                      return null;
                    }
                  })
                )}
              </div>
            ))}
          </div>
        )}
        <div className={cx(styles.bottomMenuWrapper)}>
          <StyledButton
            variant='contained'
            loading={loading}
            disabled={!validButton || !reservationData || buttonValidation}
            onClick={goToTheNextStep}
            className={styles.bottomMenuButton}
          >
            {t('Next')}
          </StyledButton>
        </div>
      </PageWrapper>

      <Notification
        title={notificationInfo?.title}
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
