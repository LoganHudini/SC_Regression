import { StyledInput } from 'components/shared/StyledInput/StyledInput';
import styles from 'components/pages/AccompanyForm/AccompanyForm.module.scss';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import { IDocInfo } from 'types/guest-information.types';
import { identityVerificationValidation } from 'validation/guest-information-input.validation';
import React, { useState, useEffect, useCallback } from 'react';
import { ApolloError, useReactiveVar } from '@apollo/client';
import { reservationGuestInfoStorageData } from 'storage/reservation-guest-info.storage';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { StyledFormControl } from 'components/shared/StyledFormControl/StyledFormControl';
import { availablePaths } from 'utils/availablePaths';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import IdScanImage from '@icons/idScanImage.svg';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { timeFormats } from 'utils/timeFormats';
import DateRangeIcon from '@icons/DateRangeIcon.svg';
import DropDown from '@icons/dropDownIcon.svg';
import { PageWrapper } from 'components/shared/PageWrapper/PageWrapper';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import i18nConfig from 'next-i18next.config';
import { getStaticPaths } from 'utils/getStatic';
import { IAccompanyFormProps } from 'components/pages/AccompanyForm/AccompanyForm.types';
import { InfoCard } from 'components/shared/InfoCard/InfoCard';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import { StyledCheckBox } from 'components/shared/StyledCheckBox/StyledCheckBox';
import Head from 'next/head';
import { Header } from 'components/shared/Header/Header';
import { HOTEL_CODE } from 'core/graphql/endpoints';
import { AccompanyFormValidation } from 'components/pages/AccompanyForm/AccompanyForm.validation';
import { processError } from 'utils/processError';
import { client } from 'core/graphql/client';
import {
  IUpdateGuestDetailsApiRequest,
  UPDATE_GUEST_DETAILS,
} from 'core/graphql/queries/UPDATE_GUEST_DETAILS';
import { AddaccompanyDetails } from 'core/graphql/queries/ADD_GUEST';
import { accompanyGuestDetails } from 'storage/accompany-guest-details';
import { GET_RESERVATION, IGetReservationApiResponse } from 'core/graphql/queries/GET_RESERVATION';
import {
  Gender,
  EMAIL_REGEX,
  PHONE_REGEX,
  EMAIL,
  PHONE,
  CHECKIN,
  ACCOMPANYINGGUEST,
  PASSPORT,
  SELECTDROPDOWN,
  USERGROUP,
  CHECKBOX,
} from 'utils/constants';
import { getConfig } from 'utils/getConfiguration';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

export { getStaticPaths };

const AccompanyForm: React.FC<IAccompanyFormProps> = () => {
  const { t } = useTranslation('check-in');
  const reservationData = client.readQuery<IGetReservationApiResponse>({
    query: GET_RESERVATION,
  });
  const reservationInfo: any = reservationData?.getReservation.data;
  const config = getConfig();
  const checkinModule: any = config?.modules?.find((module) => module?.name === CHECKIN);
  const accompanyingGuestSubmodule = checkinModule?.submodules?.find(
    (submodule: any) => submodule?.name === ACCOMPANYINGGUEST && submodule.isActive,
  );
  const [emailErrors, setEmailErrors] = useState<string[]>([]);
  const [phoneErrors, setPhoneErrors] = useState<string[]>([]);
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
  const [loading, setLoading] = useState(false);
  const [cardOPen, setCard] = useState(false);
  const [accompanyDrawerState, setaccompanyDrawer] = useState(false);
  const [accompanyDrawerDelete, setaccompanyDeleteDrawer] = useState<any>();
  const navigate = useLocalizedRouter();
  const accompanyGuestData = useReactiveVar(accompanyGuestDetails);

  useEffect(() => {
    const generateInfoCards = (guestData: any, initial = false) => {
      return guestData.map((guest: any) => {
        const formData: any = { alreadyUpdated: !initial };

        accompanyingGuestSubmodule?.details?.forEach((item: any) => {
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

    if (accompanyGuestData && accompanyGuestData.length > 0) {
      const updatedInfoCards = generateInfoCards(accompanyGuestData);
      setInfoCards(updatedInfoCards);
    } else if (reservationInfo?.guests?.length > 1) {
      const initialInfoCards = generateInfoCards(reservationInfo.guests.slice(1), true);
      setInfoCards(initialInfoCards);
    } else {
      setInfoCards([{ formData: { alreadyUpdated: false } }]);
    }
  }, [accompanyGuestData, reservationInfo]);

  const buttonValidation = statusClass.some((item: any) => item === false);

  const AccompanyDrawer = useCallback(async () => {
    setaccompanyDrawer((state) => !state);
  }, [accompanyDrawerState]);

  const guestReservationInfo = useReactiveVar(reservationGuestInfoStorageData);

  useEffect(() => {
    if (!reservationData) {
      // navigate(availablePaths.GET_RESERVATION);
    }
  }, [reservationData, navigate]);

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

  const addInfoCard = () => {
    setInfoCards((prevCards: any) => [...prevCards, { formData: { alreadyUpdated: false } }]);
    setStatus((prevStatus: any) => [...prevStatus, false]);
  };

  const submit = async () => {
    setLoading(true);
    try {
      const updatedData = infoCards?.filter((card: any) => card?.formData?.alreadyUpdated);
      const newData = infoCards?.filter((card: any) => !card?.formData?.alreadyUpdated);

      if (updatedData.length > 0) {
        for (let i = 0; i < updatedData.length; i++) {
          const data = updatedData[i];
          const updateGuestDetailsPayload: IUpdateGuestDetailsApiRequest = {
            docType: PASSPORT,
            docNumber: data.formData.id,
            reservationId: reservationInfo?.reservationId as string,
            firstName: data.formData.firstName,
            lastName: data.formData.lastName,
            profileId: reservationInfo?.guests[0]?.id as string,
            isPrimary: 'N',
            effectiveDate: '',
            expiryDate: '',
            countryOfIssue: '',
            gender: data.formData.gender,
            updateGuestDetails: {
              name: {
                firstName: data.formData.firstName,
                lastName: data.formData.lastName,
                nationality: '',
                dob: '',
              },
              phone: {
                phoneType: 'HOME',
                phoneNumber: data.formData.phoneNo,
                phoneRole: 'PHONE',
              },
              email: {
                email: data.formData.email,
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
            break;
          }
        }
      }

      if (newData.length > 0) {
        const newAccompanyDetailsPayload = {
          guests: newData.map((data: any) => ({
            firstName: data.formData.firstName,
            lastName: data.formData.lastName,
            email: data.formData.email,
            phone: data.formData.phoneNo,
            gender: data.formData.gender,
            address: {},
            guestSignature: '',
            docType: '',
            docNumber: data.formData.id,
            effectiveDate: '',
            expiryDate: '',
            placeOfIssue: '',
            countryOfIssue: '',
          })),
        };

        await client.query({
          query: AddaccompanyDetails,
          context: { clientName: 'rest' },
          variables: {
            confirmationNumber: reservationInfo?.confirmationId as string,
            body: newAccompanyDetailsPayload,
          },
        });
      }

      accompanyGuestDetails(infoCards);
      navigate(availablePaths?.PERSONALIZE_YOUR_ROOM);
    } catch (error) {
      processError(t, error as ApolloError);
    }

    setLoading(false);
  };
  useEffect(() => {
    const updatedStatus = infoCards?.map((card: any) => {
      let cardStatus = true;

      accompanyingGuestSubmodule?.details?.forEach((item: any) => {
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

          // Add more validation
        }
      });

      return cardStatus;
    });

    setStatus(updatedStatus);
  }, [infoCards, accompanyingGuestSubmodule.details]);

  const toggleConditionsAccepted = useCallback(() => {
    setConditionsAccepted((oldState) => !oldState);
  }, [cardOPen]);

  const handleDeleteCard = (index: number) => {
    setInfoCards((prevCards: any) => {
      const updatedCards = [...prevCards];
      updatedCards.splice(accompanyDrawerDelete?.index, 1);
      return updatedCards;
    });

    setStatus((prevStatus: any) => {
      const updatedStatus = [...prevStatus];
      updatedStatus.splice(accompanyDrawerDelete?.index, 1);
      return updatedStatus;
    });
    AccompanyDrawer();
  };

  // useEffect(() => {
  //   if (infoCards.length === 0) {
  //     navigate(availablePaths?.PERSONALIZE_YOUR_ROOM);
  //   }
  // }, [infoCards])

  return (
    <>
      <Header
        displayBackButton
        backRoute={availablePaths?.GUEST_INFORMATION_INPUT}
        screenTitle={t(`${accompanyingGuestSubmodule?.label}`) as string}
      />
      <PageWrapper className={styles.pageWrapper}>
        <div>
          {infoCards.map((card: any, index: number) => {
            const status = statusClass[index];

            return (
              <InfoCard
                key={index}
                title={status ? `${card.formData.firstName}` : t('Accompanying Guest')}
                icon={status ? accompanyingGuestSubmodule?.cardIcon : USERGROUP}
                status={status}
                isCardOpened={cardOPen}
              >
                <div className={styles.identityInputs}>
                  {accompanyingGuestSubmodule.details.map((item: any) => {
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
                                  {item?.options.map((item: any) => {
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
                          ) : (
                            <div className={styles.col_100}>
                              <StyledInput
                                required={item?.required}
                                autoComplete='off'
                                label={item?.label.toLowerCase()}
                                className={styles.guestDataInput}
                                variant='standard'
                                name={item?.name}
                                value={card?.formData?.[item?.name]?.toLowerCase() || ''}
                                type={item?.type}
                                disabled={item?.isDisabled}
                                onChange={handleInputChange(index, item?.label)}
                                onFocus={() => {
                                  item?.required &&
                                    handleFieldBlur(
                                      index,
                                      item?.name,
                                      card?.formData?.[item?.name]?.toLowerCase() || '',
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
                  })}
                </div>
              </InfoCard>
            );
          })}
        </div>

        <div className={styles.confirmOrderButton}>
          <div className={styles.confirmationWrapperBotton}>
            <StyledButton
              disabled={buttonValidation}
              loading={loading}
              className={styles.button}
              onClick={submit}
              variant='contained'
              arrow
            >
              {t('continue')}
            </StyledButton>
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
      ...(await serverSideTranslations(
        locale as string,
        ['get-reservation', 'common'],
        i18nConfig,
      )),
    },
  };
};

export default AccompanyForm;
