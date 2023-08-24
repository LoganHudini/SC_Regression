import { StyledInput } from 'components/shared/StyledInput/StyledInput';
import styles from 'components/pages/AccompanyForm/AccompanyForm.module.scss';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import { IDocInfo } from 'types/guest-information.types';
import { identityVerificationValidation } from 'validation/guest-information-input.validation';
import { useState, useEffect, useCallback } from 'react';
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
import { Gender, emailRegex, phoneRegex } from 'utils/constants';

export { getStaticPaths };

const AccompanyForm: React.FC<IAccompanyFormProps> = () => {
  const { t } = useTranslation('check-in');
  const reservationData = client.readQuery<IGetReservationApiResponse>({
    query: GET_RESERVATION,
  });
  const reservationInfo: any = reservationData?.getReservation.data;

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
    if (accompanyGuestData) {
      setInfoCards(accompanyGuestData);
    } else if (reservationInfo?.guests?.length > 1) {
      const initialInfoCards: any = reservationInfo?.guests?.map((guest: any, index: number) => {
        if (index != 0) {
          return {
            formData: {
              firstName: guest.firstName || '',
              lastName: guest.lastName || '',
              id: guest.docNumber || '',
              email: undefined,
              gender: guest.gender || '',
              phoneNo: undefined,
              condition: 'false',
              alreadyUpdated: true,
            },
          };
        }
      });
      setInfoCards([...initialInfoCards].slice(1));
    } else {
      setInfoCards(() => [{ formData: { alreadyUpdated: false } }]);
    }
  }, [reservationInfo]);

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

  const handleInputChange = (index: number) => (e: any) => {
    const { name, value } = e.target;

    setInfoCards((prevCards: any) =>
      prevCards.map((card: any, i: number) =>
        i === index ? { ...card, formData: { ...card.formData, [name]: value } } : card,
      ),
    );
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
            docType: 'PASSPORT',
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
            console.error('API call failed:', error);
            console.log('err', data.formData.firstName);
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
    const updatedStatus = infoCards.map((card: any) =>
      Boolean(
        card.formData.firstName &&
          card.formData.lastName &&
          emailRegex.test(card.formData.email) &&
          phoneRegex.test(card.formData.phoneNo) &&
          card.formData.id &&
          card.formData.gender &&
          card.formData.condition == 'false',
      ),
    );
    setStatus(updatedStatus);
  }, [infoCards, conditionsAccepted, cardOPen]);

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

  const isValidEmail = (email: any) => {
    if (email === undefined) {
      return false;
    } else {
      return !emailRegex.test(email);
    }
  };

  const isValidPhone = (num: any) => {
    if (num === undefined) {
      return false;
    } else {
      return !phoneRegex.test(num);
    }
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
        screenTitle={t('Secondary Guests') as string}
      />
      <PageWrapper className={styles.pageWrapper}>
        <div>
          {infoCards.map((card: any, index: number) => {
            const status = Boolean(
              card.formData.firstName &&
                card.formData.lastName &&
                card.formData.email &&
                card.formData.phoneNo &&
                card.formData.id &&
                card.formData.gender &&
                card.formData.condition == 'false',
            );

            return (
              <InfoCard
                key={index}
                title={
                  status &&
                  !isValidEmail(card.formData.email) &&
                  !isValidPhone(card.formData.phoneNo)
                    ? `${card.formData.firstName} ${card.formData.lastName}`
                    : t('Accompanying Guest')
                }
                icon={
                  status &&
                  !isValidEmail(card.formData.email) &&
                  !isValidPhone(card.formData.phoneNo)
                    ? 'user'
                    : 'userGroup'
                }
                status={
                  status &&
                  !isValidEmail(card.formData.email) &&
                  !isValidPhone(card.formData.phoneNo)
                }
                isCardOpened={cardOPen}
              >
                <div className={styles.identityInputs}>
                  <div className={styles.col_100}>
                    <StyledInput
                      required
                      autoComplete='off'
                      label={t('FIRST NAME')}
                      className={styles.guestDataInput}
                      variant='standard'
                      name={'firstName'}
                      value={card?.formData?.firstName || ''}
                      onChange={handleInputChange(index)}
                    />
                  </div>

                  <div>
                    <StyledInput
                      required
                      autoComplete='off'
                      label={t('LAST NAME')}
                      className={styles.guestDataInput}
                      variant='standard'
                      name={'lastName'}
                      value={card.formData.lastName || ''}
                      onChange={handleInputChange(index)}
                    />
                  </div>
                  <div></div>
                  <div>
                    <StyledInput
                      required
                      autoComplete='off'
                      className={styles.guestDataInput}
                      label={t('PASSPORT/ ID NUMBER')}
                      variant='standard'
                      name={'id'}
                      value={card.formData.id || ''}
                      onChange={handleInputChange(index)}
                    />
                  </div>
                  <div className={styles.col_100}>
                    <StyledFormControl
                      required
                      className={styles.guestDataInput}
                      variant='standard'
                      sx={{ m: 1, minWidth: '100%' }}
                    >
                      <InputLabel>GENDER</InputLabel>
                      <Select
                        className={styles.guestDataInput}
                        label={t('GENDER')}
                        variant='standard'
                        name={'gender'}
                        id={'gender'}
                        value={card.formData.gender || ''}
                        onChange={handleInputChange(index)}
                      >
                        {Gender.map((item: any) => {
                          return (
                            <MenuItem value={item.value} key={item.value}>
                              <em>{item.name}</em>
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </StyledFormControl>
                  </div>

                  <div>
                    <StyledInput
                      required
                      autoComplete='off'
                      label={t('EMAIL')}
                      className={styles.guestDataInput}
                      variant='standard'
                      name={'email'}
                      value={card.formData.email || ''}
                      onChange={handleInputChange(index)}
                      type='email'
                      onFocus={() => isValidEmail(card.formData.email)}
                      error={isValidEmail(card.formData.email)}
                      helperText={!isValidEmail(card.formData.email) ? '' : 'Invalid email address'}
                    />
                  </div>
                  <div>
                    <StyledInput
                      required
                      autoComplete='off'
                      label={t('PHONE NUMBER')}
                      variant='standard'
                      className={styles.guestDataInput}
                      name={'phoneNo'}
                      value={card.formData.phoneNo || ''}
                      onChange={handleInputChange(index)}
                      type='number'
                      onFocus={() => isValidPhone(card.formData.phoneNo)}
                      error={isValidPhone(card.formData.phoneNo)}
                      helperText={
                        !isValidPhone(card.formData.phoneNo) ? '' : 'Invalid phone number'
                      }
                    />
                  </div>
                  <div className={styles.agrementWrapperTitle}>
                    <StyledCheckBox
                      onChange={handleInputChange(index)}
                      onClick={toggleConditionsAccepted}
                      name={'condition'}
                      value={conditionsAccepted}
                      checked={card.formData.condition == 'false'}
                    />
                    <p className={styles.agrementText}>
                      {t(
                        'I agree to receive an invitation email to validate and sign up for a complimentary ALL PESTANA CR7 Membership.',
                      )}
                    </p>
                  </div>
                  <div className={styles.buttonContainerForm}>
                    <StyledButton
                      variant='contained'
                      className={styles.update}
                      onClick={() => setCard(!cardOPen)}
                    >
                      ADD
                    </StyledButton>

                    {!card.formData.alreadyUpdated && (
                      <StyledButton
                        variant='outlined'
                        className={styles.delete}
                        onClick={() => {
                          AccompanyDrawer();
                          setaccompanyDeleteDrawer({ index: index, name: card.formData.firstName });
                        }}
                        disabled={infoCards.length === 1 ? true : false}
                      >
                        DELETE
                      </StyledButton>
                    )}
                  </div>
                </div>
              </InfoCard>
            );
          })}
        </div>
        <div className={styles.buttonContainer}>
          <StyledButton
            variant='contained'
            className={styles.buttonRight}
            onClick={submit}
            disabled={buttonValidation}
            loading={loading}
          >
            CONTINUE
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
