import { useLanguage, useLocale, useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import cx from 'classnames';
import React, { useCallback, useState } from 'react';
import HomeHeader from '@icons/HomeHeader.svg';
import RadissonLogo from '@icons/RadissonLogo.svg';
import MyOrders from '@icons/foodDelivery.svg';
import DropDownIrdCategory from '@icons/DropDownIrdCategory.svg';
import LangActive from '@icons/language-active.svg';
import LangInactive from '@icons/language-inactive.svg';
import SearchIrd from '@icons/serachIrd.svg';
import styles from './Header.module.scss';
import { IHeaderProps } from './Header.types';
import { useRouter } from 'next/router';
import ArrowBackIosIcon from '@icons/ArrowBack.svg';
import { availablePaths } from 'utils/availablePaths';
import { ALL_DAY, HEADERS, LANGUAGE_LIST_BARCELONA, HOME } from 'utils/constants';
import { diningInformationStorage } from 'storage/dining.storage';
import { useQuery, useReactiveVar } from '@apollo/client';
import CrossDropdown from '@icons/crossDropdown.svg';
import { GET_ORDERS } from 'core/graphql/queries/GET_ORDERS_BY_ID';
import { DiningOrdersDrawer } from 'components/pages/dining/DiningOrdersDrawer/DiningOrdersDrawer';
import languageDetector from 'utils/languageDetector';
import { setScrollPosition } from 'utils/functions';
import produce from 'immer';
import { useTranslation } from 'react-i18next';

export const Header: React.FC<IHeaderProps> = ({
  screenTitle,
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
  lang,
  languageHandler,
}) => {
  const { t } = useTranslation('common');
  const navigate = useLocalizedRouter();
  const router = useRouter();
  const locale = useLocale();
  const filter = useReactiveVar(diningInformationStorage);
  const irdMenu = filter?.menuName || (header && header[0]?.name);
  const irdMenuTimings = header && header[0]?.hours;
  const [language, setLanguage] = useState<boolean>(false);
  const [orderDrawer, setOrderDrawer] = useState(false);
  const [languageSelected, setLanguageSelected] = useState(useLanguage());
  const reservationId =
    (typeof window !== 'undefined' &&
      localStorage.getItem('guestDetails') &&
      JSON.parse(localStorage.getItem('guestDetails') ?? '').roomNumber) ??
    '';

  const { data: myOrders } = useQuery(GET_ORDERS, {
    context: { clientName: 'host_v3' },
    variables: {
      bookingId: reservationId,
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

  const goHome = useCallback(() => {
    setScrollPosition(0, 0);
    navigate(availablePaths?.INDEX);
    diningInformationStorage(
      produce(diningInformationStorage(), (draft) => {
        if (draft) {
          draft.selectedCategory = '';
          draft.categoryName = '';
        }
      }),
    );
  }, [navigate]);

  const handleLanguageChange = async (event: any, el: any) => {
    setLanguageSelected({ title: el?.title, value: el.value });
    languageDetector.cache && languageDetector?.cache(el.value as string);
    await router.push(`/${el.value}/${router?.asPath?.slice(4)}`);
    setLanguage(!language);
    languageHandler(language);
  };

  return (
    <>
      <div
        className={cx(styles.container, className, { [styles.containerTransparent]: transparent })}
      >
        <div className={styles.categoryContainer}>
          {displayHome && (
            <button className={styles.backButton} onClick={goHome}>
              <HomeHeader className={styles.backIcon} viewBox='0 0 25.204 25.927' />
            </button>
          )}

          {displayBackButton && (
            <button className={styles.backButton} onClick={goBack}>
              <ArrowBackIosIcon className={styles.backIconIrd} viewBox='0 0 30.204 35.927' />
            </button>
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
              {irdMenu && <DropDownIrdCategory className={styles.categoryDropdown} />}
            </div>
          ) : (
            <RadissonLogo />
          )}

          {displaySearchButton && search && (
            <button className={styles.searchIconButton} onClick={onSearchBtnClick}>
              <SearchIrd className={styles.searchIcon} />
            </button>
          )}
          {ordersData?.length > 0 && screenTitle === HOME && (
            <div className={styles.myOrdersIconContainer}>
              <div className={styles.myOrdersIconWrapper} onClick={openOrdersDrawer}>
                <MyOrders className={styles.myOrdersIcon} />
              </div>
            </div>
          )}
          {lang && (
            <button
              className={styles.closeButton1}
              onClick={() => {
                setLanguage(!language);
                languageHandler(language);
              }}
            >
              {!language ? (
                <LangInactive className={styles.closeIcon} />
              ) : (
                <LangActive className={styles.closeIcon} />
              )}
            </button>
          )}
        </div>
      </div>
      <div>
        <>
          {language && (
            <div className={styles.containerLang}>
              <div>
                <div
                  onClick={() => {
                    setLanguage(!language);
                    languageHandler(language);
                  }}
                >
                  <CrossDropdown className={cx(styles.close)} />
                </div>
                <div className={styles.filterView}>
                  <div className={styles.filterViewOptionContainer}>
                    {LANGUAGE_LIST_BARCELONA?.map((el, index) => (
                      <div
                        className={cx(styles.dropDowntext, {
                          [styles.selected]: languageSelected?.title === el?.title,
                        })}
                        id={el?.title}
                        onClick={(e) => {
                          handleLanguageChange(e, el);
                        }}
                        placeholder={el?.title}
                        key={`${el}-${index}`}
                      >
                        {el?.title}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      </div>

      <>
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
      {screenTitle === HEADERS[0] && <p className={styles.screenTitle}>{t(`${screenTitle}`)}</p>}
    </>
  );
};
