import React, { useCallback, useEffect } from 'react';
import Head from 'next/head';
import { Header } from 'components/shared/Header/Header';
import styles from '@styles/pre-checkin-form/pre-checkin-form.module.scss';
import { PageWrapper } from 'components/shared/PageWrapper/PageWrapper';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { InfoCard } from 'components/shared/InfoCard/InfoCard';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import { GET_RESERVATION, IGetReservationApiResponse } from 'core/graphql/queries/GET_RESERVATION';
import { client } from 'core/graphql/client';
import cx from 'classnames';
import { GetStaticProps } from 'next';
import { AboutYourStayProps } from 'types/about-your-stay.types';
import { useReactiveVar } from '@apollo/client';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'react-i18next';
import { getStaticPaths } from 'utils/getStatic';
import i18nConfig from 'next-i18next.config';
import { availablePaths } from 'utils/availablePaths';
import { PreCheckinPaymentInfo } from 'components/pages/check-in/PreCheckinPaymentInfo/PreCheckinPaymentInfo';
import { reservationGuestInfoStorageData } from 'storage/reservation-guest-info.storage';
import { useConfig } from 'utils/hooks/useConfiguration';
import {
  CHECK_IN,
  CREDITCARD,
  CREDIT_CARD_INFO,
  EMAIL_REGEX,
  INFORMATION,
  PHONE,
  PHONE_REGEX,
  EMAILS,
  STEPPER_PAYMENT,
} from 'utils/constants';
import { Stepper } from 'components/shared/Stepper/Stepper';
import { StepperInformationStorage } from 'storage/check-in.storage';
import produce from 'immer';
import EditIcon from '@icons/commonEditIcon.svg';
import CardIcon from '@icons/cardIcon.svg';

export { getStaticPaths };

const CardAuthorisation: React.FC<AboutYourStayProps> = () => {
  const navigate = useLocalizedRouter();
  const config = useConfig();

  const { t } = useTranslation('about-your-stay');

  const reservationData = client.readQuery<IGetReservationApiResponse>({
    query: GET_RESERVATION,
  });

  const checkinModule: any = config?.modules?.find((module) => module?.code === CHECK_IN);
  const accompanyingGuestSubmodule = checkinModule?.submodules?.find(
    (submodule: any) => submodule?.name === INFORMATION && submodule.isActive,
  );
  const activeSections = accompanyingGuestSubmodule?.details?.filter(
    (section: any) => section.isActive,
  );
  const creditCardInfoSection = activeSections?.find(
    (section: any) => section?.name === CREDIT_CARD_INFO,
  );

  const paymentType = creditCardInfoSection?.type;

  const reservationInfo = reservationData?.getReservation?.data;
  const guestReservationInfo = useReactiveVar(reservationGuestInfoStorageData);

  useEffect(() => {
    if (!reservationData) {
      navigate(availablePaths.HOME);
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
        isComplete: validateGuestReservation(creditCardInfoSection?.details),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extractDataForField, reservationInfo?.guests]);

  const goToTheNextStep = useCallback(() => {
    navigate(availablePaths?.PERSONALIZE);
  }, [navigate]);

  const validateGuestReservation = (field: any) => {
    if (!guestReservationInfo) {
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

  const validButton = validateGuestReservation(creditCardInfoSection?.details);

  useEffect(() => {
    StepperInformationStorage(
      produce(StepperInformationStorage(), (draft: any) => {
        const item = draft?.find((el: any) => el?.title === STEPPER_PAYMENT);
        if (item) {
          item.value = validButton ? 80 : 40;
        }
      }),
    );
  }, [validButton]);

  return (
    <>
      <Head>
        <title>
          {config?.name} | {t('Card Confirmation')}
        </title>
      </Head>
      <Header screenTitle={t(`${accompanyingGuestSubmodule?.label}`) as string} displayBackButton />
      <PageWrapper className={styles.pageWrapper}>
        <Stepper />
        <div className={styles.cardAuthorisationTitleWrapper}>
          <p className={styles.title}>{t('Card Confirmation')}</p>
          <p className={styles.description}>
            {t(
              'Your card used during booking will be authorised for incidentals and real-time bill payments.',
            )}
          </p>
        </div>

        <div className={styles.box}>
          <div className={styles.titleRow}>
            <p className={styles.cardTitle}>Card Details</p>
            {guestReservationInfo?.cardNumber && (
              <EditIcon onClick={() => navigate(availablePaths?.PAYMENT)} />
            )}
          </div>
          {creditCardInfoSection &&
            guestReservationInfo &&
            (!guestReservationInfo?.cardNumber ? (
              <StyledButton
                variant='contained'
                className={styles.scanDocWrapper}
                onClick={() => {
                  navigate(availablePaths?.PAYMENT);
                }}
              >
                <CardIcon />
                <span className={styles.scanDocText}>{t('ADD CARD')}</span>
              </StyledButton>
            ) : (
              <PreCheckinPaymentInfo
                paymentInfo={guestReservationInfo}
                creditCardInfoSection={creditCardInfoSection?.details}
                paymentType={paymentType}
              ></PreCheckinPaymentInfo>
            ))}
        </div>

        <div className={cx(styles.bottomMenuWrapper)}>
          <StyledButton
            variant='contained'
            disabled={!validButton || !reservationData}
            onClick={goToTheNextStep}
            className={styles.bottomMenuButton}
          >
            {t('Next')}
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
      ...(await serverSideTranslations(locale as string, ['about-your-stay'], i18nConfig)),
    },
  };
};

export default CardAuthorisation;
