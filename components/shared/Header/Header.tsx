/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import { useLocale, useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import cx from 'classnames';
import React, { useCallback, useState } from 'react';
import MenuDropDown from '@icons/menuDropDown.svg';
import MenuDropDownSecondary from '@icons/menuDropDownSecondary.svg';
import Language from '@icons/languageHeader.svg';
import SearchIrd from '@icons/serachIrd.svg';
import styles from './Header.module.scss';
import { IHeaderProps } from './Header.types';
import { useRouter } from 'next/router';
import ArrowBackIosIcon from '@icons/ArrowBack.svg';
import { ALL_DAY } from 'utils/constants';
import { diningInformationStorage } from 'storage/dining.storage';
import { useQuery, useReactiveVar } from '@apollo/client';
import { GET_ORDERS } from 'core/graphql/queries/GET_ORDERS_BY_ID';
import { DiningOrdersDrawer } from 'components/pages/dining/DiningOrdersDrawer/DiningOrdersDrawer';
import { setScrollPosition } from 'utils/functions';
import produce from 'immer';
import { useTranslation } from 'react-i18next';
import { BRAND_CODE } from 'core/graphql/endpoints';
import { useConfig } from 'utils/hooks/useConfiguration';
import { useCheckedIn } from 'storage/check-in.storage';
import { LanguageDrawer } from '../BottomMenu/LanguageDrawer/LanguageDrawer';

export const Header: React.FC<IHeaderProps> = ({
  transparent,
  displayBackButton,
  irdModule,
  openCategory,
  backRoute,
  onSearchBtnClick,
  displaySearchButton,
  header,
  search,
  setOpencategory,
  displayHome,
  className,
  language,
}) => {
  const { t } = useTranslation('common');
  const navigate = useLocalizedRouter();
  const router = useRouter();
  const locale = useLocale();
  const config = useConfig();
  const hotelId = config?.hotelId;
  const hotel = config?.code;
  const logo = config?.logo;
  const languages = config?.languages || [];
  const checkinData = useCheckedIn();
  const filter = useReactiveVar(diningInformationStorage);
  const irdMenu = filter?.menuName || (header && header[0]?.name);
  const irdMenuTimings = header && header[0]?.hours;
  const [orderDrawer, setOrderDrawer] = useState(false);
  const [openLanguage, setOpenLanguage] = useState(false);
  const [backIconError, setBackIconError] = useState(false);

  const { data: myOrders } = useQuery(GET_ORDERS, {
    skip: !hotelId || !checkinData?.reservationId,
    context: { clientName: 'property_d' },
    variables: {
      hotelId: hotelId,
      bookingId: checkinData?.reservationId,
      lang: locale === 'en' ? '' : locale,
    },
    fetchPolicy: 'no-cache',
  });

  const ordersData = myOrders?.getOrdersByBookingId;

  const openOrdersDrawer = () => {
    setOrderDrawer(true);
  };

  const closeOrdersDrawer = () => {
    setOrderDrawer(false);
  };

  const goBack = useCallback(() => {
    if (backRoute) {
      navigate(backRoute);
    } else {
      router.back();
    }
  }, [backRoute, navigate, router]);

  const goHome = (backRoutePath?: any) => {
    setScrollPosition(0, 0);
    diningInformationStorage(
      produce(diningInformationStorage(), (draft) => {
        if (draft) {
          draft.selectedCategory = '';
          draft.categoryName = '';
        }
      }),
    );
    if (backRoute) {
      navigate(backRoute);
    } else {
      navigate(`/${hotel}/`);
    }
  };

  return (
    <>
      <div
        className={cx(styles.container, className, { [styles.containerTransparent]: transparent })}
      >
        <div className={styles.categoryContainer}>
          {displayHome && (
            <div className={styles.backButton} onClick={() => goHome()}>
              <img src={`/images/${BRAND_CODE}/HomeHeader.svg`} />
            </div>
          )}

          {displayBackButton && (
            <div className={styles.backButton} onClick={goBack}>
              {!backIconError ? (
                <img
                  src={`/images/${BRAND_CODE}/HomeHeader.svg`}
                  className={styles.img}
                  onError={() => setBackIconError(true)}
                />
              ) : (
                <ArrowBackIosIcon className={styles.backIcon} />
              )}
            </div>
          )}

          {irdModule && irdMenu ? (
            <div className={styles.irdMenu} onClick={() => setOpencategory(!openCategory)}>
              <div className={styles.irdMenuTitle}>
                {irdMenu}
                {irdMenuTimings?.length > 0 && (
                  <p className={styles.irdMenuTiming}>
                    {irdMenuTimings[0]?.open === ALL_DAY
                      ? t(`${irdMenuTimings[0]?.open}`)
                      : `${irdMenuTimings[0]?.open} - ${
                          irdMenuTimings[0]?.close === '00:00' ? '24:00' : irdMenuTimings[0]?.close
                        }`}
                  </p>
                )}
              </div>
              {irdMenu && !openCategory ? (
                <MenuDropDown className={styles.categoryDropdown} />
              ) : (
                <MenuDropDownSecondary className={styles.categoryDropdown} />
              )}
            </div>
          ) : (
            // screenTitle && <p className={styles.screenHeader}>{t(`${screenTitle}`)}</p>
            <>
              {' '}
              <img
                className={cx(styles.headerLogo, {
                  [styles.fairmontLogo]: BRAND_CODE === 'fairmont',
                })}
                src={`/images/${
                  hotel === 'fairmont-makkah-clock-royal-tower'
                    ? `${hotel}/Logo.svg`
                    : config?.propertyHeaderLogo
                    ? `propertyHeaderLogo/${hotel}.svg`
                    : `${BRAND_CODE}/Logo.svg`
                }`}
                onClick={goHome}
              />
              {logo && hotel !== 'fairmont-makkah-clock-royal-tower' && (
                <p className={cx(styles.propertyName, 'globals-propertyName')}>{logo}</p>
              )}
            </>
          )}

          {displaySearchButton && search && (
            <button className={styles.searchIconButton} onClick={onSearchBtnClick}>
              <SearchIrd className={styles.searchIcon} />
            </button>
          )}

          {languages.length > 1 && language && (
            <button
              className={styles.language}
              onClick={() => {
                setOpenLanguage(true);
              }}
            >
              <Language />
            </button>
          )}
        </div>
      </div>
      <LanguageDrawer openLanguage={openLanguage} setOpenLanguage={setOpenLanguage} />
      {ordersData?.length > 0 && (
        <>
          <DiningOrdersDrawer
            ordersDrawer={orderDrawer}
            ordersData={ordersData}
            closeOrdersDrawer={closeOrdersDrawer}
          />
        </>
      )}
    </>
  );
};
