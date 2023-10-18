import { StyledInput } from 'components/shared/StyledInput/StyledInput';
import styles from 'components/pages/check-in/AccompanyForm/AccompanyForm.module.scss';
import { useTranslation } from 'react-i18next';
import React, { useState, useEffect, useCallback } from 'react';
import { ApolloError, useReactiveVar } from '@apollo/client';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { StyledFormControl } from 'components/shared/StyledFormControl/StyledFormControl';
import { availablePaths } from 'utils/availablePaths';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import DropDown from '@icons/dropDownIcon.svg';
import { PageWrapper } from 'components/shared/PageWrapper/PageWrapper';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import i18nConfig from 'next-i18next.config';
import { getStaticPaths } from 'utils/getStatic';
import { IAccompanyFormProps } from 'components/pages/check-in/AccompanyForm/AccompanyForm.types';
import { InfoCard } from 'components/shared/InfoCard/InfoCard';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import { StyledCheckBox } from 'components/shared/StyledCheckBox/StyledCheckBox';
import { Header } from 'components/shared/Header/Header';
import { processError } from 'utils/processError';
import { client } from 'core/graphql/client';
import {
  IUpdateGuestDetailsApiRequest,
  UPDATE_GUEST_DETAILS,
} from 'core/graphql/queries/UPDATE_GUEST_DETAILS';
import { ADD_ACCOMPANY_GUEST } from 'core/graphql/queries/ADD_GUEST';
import { accompanyGuestDetails } from 'storage/accompany-guest-details';
import { GET_RESERVATION, IGetReservationApiResponse } from 'core/graphql/queries/GET_RESERVATION';
import {
  EMAIL_REGEX,
  PHONE_REGEX,
  EMAIL,
  PHONE,
  CHECK_IN,
  ACCOMPANYINGGUEST,
  SELECTDROPDOWN,
  CHECKBOX,
  USERGROUP,
} from 'utils/constants';
import { getConfig } from 'utils/getConfiguration';
import cx from 'classnames';
import { buttonArrow, updateDocTypeOptions } from 'utils/functions';
import { docTypeStorage } from 'storage/guest-information.storage';

export { getStaticPaths };

const AccompanyForm: React.FC<IAccompanyFormProps> = () => {
  const { t } = useTranslation('check-in');
  const reservationData = client.readQuery<IGetReservationApiResponse>({
    query: GET_RESERVATION,
  });
  const docTypeGlobals = useReactiveVar(docTypeStorage);

  const reservationInfo: any = reservationData?.getReservation.data;
  const config = getConfig();
  const checkinModule: any = config?.modules?.find((module) => module?.code === CHECK_IN);
  const accompanyingGuestSubmodule = checkinModule?.submodules?.find(
    (submodule: any) => submodule?.name === ACCOMPANYINGGUEST && submodule.isActive,
  );

  const docTypeFunction = updateDocTypeOptions(accompanyingGuestSubmodule?.details, docTypeGlobals);

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
  const navigate = useLocalizedRouter();
  const accompanyGuestData = useReactiveVar(accompanyGuestDetails);

  useEffect(() => {
    const generateInfoCards = (guestData: any, initial = false) => {
      return guestData.map((guest: any) => {
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
      setCard(true);
    } else if (reservationInfo?.guests?.length > 1) {
      const initialInfoCards = generateInfoCards(reservationInfo.guests.slice(1), false);
      setInfoCards(initialInfoCards);
    } else {
      setInfoCards([{ formData: { alreadyUpdated: false } }]);
    }
  }, [accompanyingGuestSubmodule?.details, reservationInfo]);

  const buttonValidation = statusClass.some((item: any) => item === false);

  useEffect(() => {
    if (!reservationData) {
      navigate(availablePaths?.HOME);
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

  const submit = async () => {
    setLoading(true);
    let successFlag = true;
    let errorState: any = '';
    try {
      const updatedData = infoCards?.filter((card: any) => card?.formData?.alreadyUpdated);
      const newData = infoCards?.filter((card: any) => !card?.formData?.alreadyUpdated);

      if (updatedData.length > 0) {
        for (let i = 0; i < updatedData.length; i++) {
          const data = updatedData[i];
          const updateGuestDetailsPayload: IUpdateGuestDetailsApiRequest = {
            docType: data?.formData?.docType,
            docNumber: data?.formData?.docNo,
            reservationId: reservationInfo?.reservationId as string,
            firstName: data?.formData?.firstName,
            lastName: data?.formData?.lastName,
            profileId: data?.formData?.id as string,
            isPrimary: 'N',
            effectiveDate: '',
            expiryDate: '',
            countryOfIssue: '',
            gender: data?.formData?.gender,
            updateGuestDetails: {
              name: {
                firstName: data?.formData?.firstName,
                lastName: data?.formData?.lastName,
                nationality: '',
                dob: '',
              },
              phone: {
                phoneType: 'HOME',
                phoneNumber: data?.formData?.phone,
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
                body: updateGuestDetailsPayload,
              },
            });
          } catch (error) {
            successFlag = false;
            errorState = error;
          }
        }
      }

      if (newData?.length > 0) {
        const newAccompanyDetailsPayload = {
          guests: newData.map((data: any) => ({
            firstName: data?.formData?.firstName,
            lastName: data?.formData?.lastName,
            email: data?.formData?.email,
            phone: data?.formData?.phone,
            gender: data?.formData?.gender,
            address: {},
            guestSignature: '',
            docType: data?.formData?.docType,
            docNumber: data?.formData?.docNo,
            effectiveDate: '',
            expiryDate: '',
            placeOfIssue: '',
            countryOfIssue: '',
          })),
        };

        try {
          await client.query({
            query: ADD_ACCOMPANY_GUEST,
            context: { clientName: 'rest' },
            variables: {
              confirmationNumber: reservationInfo?.confirmationId as string,
              body: newAccompanyDetailsPayload,
            },
          });
        } catch (err) {
          successFlag = false;
          errorState = err;
          console.log(err);
        }
      }
      if (successFlag) {
        accompanyGuestDetails(infoCards);
        navigate(availablePaths?.PERSONALIZE_YOUR_ROOM);
      } else {
        processError(t, errorState as ApolloError);
      }
    } catch (error) {
      processError(t, error as ApolloError);
    }

    setLoading(false);
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
  }, [infoCards, accompanyingGuestSubmodule.details]);

  const toggleConditionsAccepted = useCallback(() => {
    setConditionsAccepted((oldState) => !oldState);
  }, []);

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
                icon={USERGROUP}
                status={status}
                isCardOpened={cardOPen}
              >
                <div className={styles.identityInputs}>
                  {docTypeFunction?.map((item: any) => {
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

        <div className={cx(styles.bottomMenuWrapper)}>
          <StyledButton
            disabled={buttonValidation}
            loading={loading}
            onClick={submit}
            variant='contained'
            className={styles.bottomMenuButton}
            arrow={buttonArrow}
          >
            {t('continue')}
          </StyledButton>
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
