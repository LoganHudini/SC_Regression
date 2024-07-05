/* eslint-disable react-hooks/exhaustive-deps */
import { useQuery, useReactiveVar } from '@apollo/client';
import { GetStaticProps } from 'next';
import i18nConfig from 'next-i18next.config';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import React, { useEffect, useCallback, useState } from 'react';
import { getStaticPaths } from 'utils/getStatic';
import styles from '@styles/spa/spa.module.scss';
import { useTranslation } from 'react-i18next';
import { PageWrapper } from 'components/shared/PageWrapper/PageWrapper';
import { Header } from 'components/shared/Header/Header';
import {
  toggleDetailsDrawer,
  toggleHamburgerMenuDrawer,
  toggleNotification,
} from 'storage/home.storage';
import { activeItems, restaurantId } from 'utils/functions';
import { ListComponentEntity } from 'components/shared/ListComponents/ListComponents';
import { CustomDrawer } from 'components/shared/CustomDrawer/CustomDrawer';
import { GET_SPA_DETAILS } from 'core/graphql/queries/GET_SPA_DETAILS';
import Head from 'next/head';
import { spaCategoryList, spaInformationStorage } from 'storage/spa.storage';
import { Loader } from 'components/shared/Loaders/Loaders';
import produce from 'immer';
import { Notification } from 'components/shared/Notification/Notification';
import { availablePaths } from 'utils/availablePaths';
import { ASSETS_URL, HOTEL_ID } from 'core/graphql/endpoints';
import { StableImage } from 'components/shared/StableImage/StableImage';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import { useConfig } from 'utils/hooks/useConfiguration';
import { useLocale, useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import {
  ACTIVE,
  ERRORMSG,
  EXTERNAL_URL,
  FAILURE,
  SPA_BOOKING_FLOW,
  SUCCESS,
  SPA_TREATMENTS,
} from 'utils/constants';
import DateTimeSelect from 'components/shared/DateTimeSelect/DateTimeSelect';
import { client } from 'core/graphql/client';
import dayjs from 'dayjs';
import { timeFormats } from 'utils/timeFormats';
import { useCheckedIn } from 'storage/check-in.storage';
import { ListCounter } from 'components/shared/ListCounter/ListCounter';
import { CREATE_SPA_ORDER } from 'core/graphql/queries/CREATE_SPA_RESERVATION';
import { PlusMinusInput } from 'components/shared/PlusMinusInput/PlusMinusInput';
import { IframeComponent } from 'components/shared/IframeComponent/IframeComponent';
import { useCurrency } from 'utils/hooks/useCurrency';
import cx from 'classnames';
import { PhoneEmail } from 'components/shared/PhoneEmail/PhoneEmail';

export { getStaticPaths };

const Spa: React.FC = () => {
  const { t } = useTranslation(['spa']);
  const navigate = useLocalizedRouter();
  const hotelId = useConfig()?.hotelId;
  const hotelName = useConfig()?.name;
  const locale = useLocale();
  const spaInfo = useReactiveVar(spaInformationStorage);
  const spaDetailsDrawerStatus = useReactiveVar(toggleDetailsDrawer);
  const currency = useCurrency();
  const [timeSelectDrawer, setTimeSelectDrawer] = useState(false);
  const [detailContent, setDetailContent] = useState(true);
  const [selectedTime, setSelectedTime] = useState(
    dayjs().format(timeFormats.DAY_MONTH_HOUR_MINUTE_AM),
  );
  const isCheckedIn = useCheckedIn();
  const currentYear = new Date().getFullYear();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [guestCount, setGuestCount] = useState(1);
  const [errorNotification, setErrorNotification] = useState(false);
  const [spaBooking, setspaBooking] = useState(false);

  const { data, loading } = useQuery(GET_SPA_DETAILS, {
    skip: !hotelId,
    context: { clientName: 'host_v0' },
    fetchPolicy: 'no-cache',
    variables: {
      hotelId: hotelId,
      lang: locale === 'en' ? '' : locale,
    },
  });

  const spaInformation = activeItems(data?.getSpaDetails?.spa)?.find(
    (info: any) => info?.id === spaInfo?.selectedSpaInfoId,
  );

  const spaTreatmentsList = activeItems(data?.getSpaDetails?.treatments)?.filter(
    (treatment: any) =>
      treatment?.spaId === spaInfo?.selectedSpaInfoId &&
      treatment?.spaCategoryId === spaInfo?.selectedSpaCategoryId,
  );

  let spaCategory: any = [];
  data?.getSpaDetails?.categories?.forEach((category: any) => {
    activeItems(data?.getSpaDetails?.treatments)?.forEach((treatment: any) => {
      if (
        treatment?.spaId === spaInfo?.selectedSpaInfoId &&
        category?.id === treatment?.spaCategoryId &&
        !spaCategory?.includes(category)
      ) {
        spaCategory = [...spaCategory, category];
      }
    });
  });

  spaCategoryList(spaCategory);
  const selectedSpaItem = spaTreatmentsList?.find(
    (item: any) => item?.id === spaInfo?.selectedSpaTreatmentId,
  );

  useEffect(() => {
    if (spaTreatmentsList?.length === 0) {
      navigate(availablePaths?.HOME);
    }
  }, []);

  useEffect(() => {
    data?.getSpaDetails?.spa &&
      spaInformationStorage({
        selectedSpaInfoName:
          spaInfo?.selectedSpaInfoName ?? activeItems(data?.getSpaDetails?.spa)[0]?.name,
        selectedSpaInfoId:
          spaInfo?.selectedSpaInfoId ?? activeItems(data?.getSpaDetails?.spa)[0]?.id,
        selectedSpaCategoryName: spaCategory[0]?.name,
        selectedSpaCategoryId: spaCategory[0]?.id,
      });
  }, [
    data?.getSpaDetails?.spa,
    spaCategory[0],
    spaInfo?.selectedSpaInfoId,
    spaInfo?.selectedSpaInfoName,
  ]);

  const selectedSpa = (treatment: any) => {
    spaInformationStorage(
      produce(spaInformationStorage(), (draft: any) => {
        if (draft) {
          draft.selectedSpaTreatmentName = treatment?.name;
          draft.selectedSpaTreatmentId = treatment?.id;
        }
      }),
    );
    toggleDetailsDrawer(true);
    toggleHamburgerMenuDrawer(false);
    setDetailContent(true);
  };

  const closeDrawer = () => {
    toggleDetailsDrawer(false);
    spaInformationStorage(
      produce(spaInformationStorage(), (draft) => {
        null;
      }),
    );
    setTimeSelectDrawer(false);
  };

  const closeSpa = () => {
    setspaBooking(false);
  };

  const onCtaClick = () => {
    if (spaInformation?.cta?.redirectOption === EXTERNAL_URL) {
      setspaBooking(true);
    }
    if (spaInformation?.cta?.redirectOption === SPA_BOOKING_FLOW) {
      setDetailContent(false);
      setTimeSelectDrawer(true);
    }
  };

  const handleSpaReservation = useCallback(async () => {
    const DetailsReservationPayload = {
      bookingId: isCheckedIn?.reservationId,
      hotelId: HOTEL_ID,
      bookingTime: dayjs().format(timeFormats.DATE_TIME),
      roomNo: isCheckedIn?.roomNumber,
      guestName: isCheckedIn?.name,
      guestType: isCheckedIn?.roomNumber ? 'resident' : 'nonresident',
      numberOfGuest: guestCount,
      pax: '',
      scheduledDate: dayjs(selectedTime).year(currentYear).format(timeFormats.YEAR_MONTH_DAY),
      scheduledTime: dayjs(selectedTime).format(timeFormats.RAILWAY_TIME),
      treatmentDuration: selectedSpaItem?.duration[currentIndex]?.duration as string,
      totalAmount: selectedSpaItem?.duration[currentIndex]?.price,
      spaId: selectedSpaItem?.spaId,
      items: [
        {
          name: selectedSpaItem?.name,
          treatmentDuration: selectedSpaItem?.duration[currentIndex]?.duration,
          amount: selectedSpaItem?.duration[currentIndex]?.price,
          description: '',
        },
      ],
      spaName: selectedSpaItem?.name,
    };

    try {
      await client.mutate({
        mutation: CREATE_SPA_ORDER,
        context: { clientName: 'host_v3' },
        fetchPolicy: 'network-only',
        variables: DetailsReservationPayload,
      });
      setTimeout(() => {
        closeDrawer();
      }, 4000);
      setErrorNotification(false);
    } catch (err) {
      setErrorNotification(true);
    }
    toggleNotification(true);
  }, [
    selectedTime,
    currentYear,
    restaurantId,
    isCheckedIn?.name,
    isCheckedIn?.roomNumber,
    guestCount,
  ]);

  const spaDetails = () => (
    <div>
      {detailContent && (
        <div
          className={cx({
            [styles.listComponentMargin]: spaInformation?.cta?.status === ACTIVE,
          })}
        >
          {selectedSpaItem?.images?.length > 0 && (
            <StableImage
              className={styles.image}
              src={`${ASSETS_URL}/${selectedSpaItem?.images[0]?.ratio16to9}`}
            />
          )}

          <div className={styles.wrapper}>
            {selectedSpaItem?.name && (
              <h2 className={styles.detailComponentTitle}>{t(`${selectedSpaItem?.name}`)}</h2>
            )}

            {selectedSpaItem?.duration?.length > 0 && (
              <>
                {selectedSpaItem?.duration?.map((duration: any, index: number) => (
                  <p key={index + duration?.duration} className={styles.detailComponentDuration}>
                    <span className={styles.currency}>{currency} </span>
                    {Number(duration?.price)?.toLocaleString('en-US')}
                    {'   '}|{'   '}
                    {duration?.duration} Min
                  </p>
                ))}
              </>
            )}

            {selectedSpaItem?.description && (
              <p className={styles.detailComponentDescription}>
                {t(`${selectedSpaItem?.description}`)}
              </p>
            )}
            {(spaInformation?.contact?.phone || spaInformation?.contact?.email) && (
              <PhoneEmail
                phone={spaInformation?.contact?.phone}
                email={spaInformation?.contact?.email}
              />
            )}
          </div>
          {spaInformation?.cta?.status === ACTIVE && (
            <StyledButton variant='contained' onClick={onCtaClick} className={styles.button}>
              {spaInformation?.cta?.ctaTitle || t('BOOK NOW')}
            </StyledButton>
          )}
        </div>
      )}

      {timeSelectDrawer && (
        <div className={styles.timeSelectDrawerWrapper}>
          <div className={styles.counterWrapper}>
            <p className={styles.counterTitle}>{t('No. of people')}</p>
            <PlusMinusInput
              value={guestCount}
              className={styles.plusMinusInput}
              onClickMinus={() => setGuestCount((count) => count - 1)}
              onClickPlus={() => setGuestCount((count) => count + 1)}
              minQuantity={1}
              valueClassName={styles.value}
            />
          </div>
          <div className={styles.counterWrapper}>
            <p className={styles.counterTitle}>{t('Duration')}</p>
            <ListCounter
              values={selectedSpaItem?.duration}
              className={styles.plusMinusInput}
              valueClassName={styles.value}
              setCurrentIndex={setCurrentIndex}
              currentIndex={currentIndex}
            />
          </div>
          <div className={styles.timeWrapper}>
            <p className={styles.preferredTitle}>{t('Preferred Date & Time')}</p>
            <DateTimeSelect
              setSelectedTime={setSelectedTime}
              selectedTime={selectedTime}
              handleSave={handleSpaReservation}
              showSchedules={undefined}
              buttonTitle={t('FIND A TABLE')}
              buttonStyle={styles.buttonPicker}
            />
          </div>
        </div>
      )}
      <Notification
        title={errorNotification ? (ERRORMSG as string) : (t('Thank You!') as string)}
        description={
          errorNotification
            ? ('Your booking was not received.' as string)
            : (t(
                'Your booking has been received. Our reservation team will get in touch with you soon',
              ) as string)
        }
        redirect={null}
        type={errorNotification ? FAILURE : SUCCESS}
      />
    </div>
  );

  return (
    <>
      <Head>
        <title>
          {hotelName} | {t('Spa')}
        </title>
      </Head>
      <Header screenTitle={t('Spa') as string} displayHome />
      {loading ? (
        <Loader />
      ) : (
        <PageWrapper
          className={styles.pageWrapper}
          displayBottomMenu={spaCategory && spaTreatmentsList}
        >
          <div>
            {spaTreatmentsList?.length > 0 ? (
              spaTreatmentsList?.map((selectedSpaItem: any) => (
                <ListComponentEntity
                  key={selectedSpaItem.id}
                  queryResultEntity={selectedSpaItem}
                  selectedListItem={selectedSpa}
                />
              ))
            ) : (
              <div className={styles.treatmentsNotFound}>
                <h2>Spa treatments not found</h2>
              </div>
            )}
          </div>
        </PageWrapper>
      )}

      {spaBooking ? (
        <CustomDrawer
          open={spaBooking}
          onClose={closeSpa}
          content={
            <IframeComponent
              src={spaInformation?.cta?.redirectUrl}
              handledrawerState={setspaBooking}
              name={SPA_TREATMENTS}
            />
          }
          isIframe={true}
        />
      ) : (
        <CustomDrawer open={spaDetailsDrawerStatus} onClose={closeDrawer} content={spaDetails()} />
      )}
    </>
  );
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const locale = ctx?.params?.locale;

  return {
    props: {
      ...(await serverSideTranslations(locale as string, ['spa', 'common'], i18nConfig)),
    },
  };
};
export default Spa;
