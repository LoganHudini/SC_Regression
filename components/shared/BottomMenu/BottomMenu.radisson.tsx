import React, { useCallback, useState } from 'react';
import cx from 'classnames';
import styles from './BottomMenu.module.scss';
import HomeIcon from '@icons/home.svg';
import HomeActiveIcon from '@icons/homeActive.svg';
import DiningIcon from '@icons/dining.svg';
import DiningActiveIcon from '@icons/diningActive.svg';
import HousekeepingIcon from '@icons/housekeeping.svg';
import HousekeepingActiveIcon from '@icons/housekeepingActive.svg';
import Link from 'utils/link';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import { availablePaths } from 'utils/availablePaths';
import { IHamburgerProps } from 'utils/hamburger/getHamburgerProps';
import { DiningBottomBar } from 'components/pages/dining/DiningBottomBar/DiningBottomBar';
import { BARCELONA, Headers } from 'utils/constants';
import { IParsedHotelPage } from 'core/graphql/queries/GET_HOTEL_INFO';
import { BRANCH_CODE, HOME_PAGE } from 'core/graphql/endpoints';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';

interface IHomeProps {
  pageData: IParsedHotelPage;
  paths: {
    path: string;
    id: string;
  }[];
}

export const BottomMenu: React.FC<IHomeProps & IHamburgerProps> = ({ pageData }) => {
  const router = useRouter();

  const { t } = useTranslation('common');
  const [moreItemsDisplayed, setMoreItemsDisplayed] = useState(false);
  const [diningBottomMenuDisplayed, setDiningBottomMenuDisplayed] = useState(false);
  const homeActive = pageData?.name === HOME_PAGE;
  const diningActive =
    router.pathname.includes(availablePaths.DINING) || pageData?.name === Headers[0];
  const housekeepingActive = router.pathname.includes(availablePaths.HOUSEKEEPING);
  const navigate = useLocalizedRouter();

  const hotelName = BRANCH_CODE === BARCELONA;
  const toggleDiningBottomMenuDisplayed = useCallback(() => {
    if (hotelName) {
      navigate(availablePaths?.RESTAURANTS_BARS);
    } else {
      setMoreItemsDisplayed(false);
      setDiningBottomMenuDisplayed((oldState) => !oldState);
    }
  }, [hotelName, navigate]);

  const toggleAllMenuDisplayed = useCallback(() => {
    setMoreItemsDisplayed(false);
    setDiningBottomMenuDisplayed(false);
    if (typeof window !== 'undefined') {
      const item = localStorage.getItem('guestDetails');
      if (item === null) {
        localStorage.setItem(
          'guestDetails',
          JSON.stringify({
            name: '',
            roomNumber: '',
          }) ?? '',
        );
      }
    }
  }, []);

  return (
    <>
      <div className={styles.bottonMenuContainer}>
        <div
          className={cx(styles.bottomMenuWrapper, {
            [styles.homeActivehotelName]: hotelName,
          })}
        >
          <div
            className={cx(styles.bottomMenuLinkInner, {
              [styles.bottomMenuLinkInnerActive]: homeActive,
            })}
          >
            <div
              className={cx(styles.home, {
                [styles.homeActive]: homeActive,
              })}
            >
              <Link
                className={styles.bottomMenuLink}
                href={availablePaths.INDEX}
                onClick={toggleAllMenuDisplayed}
              >
                <div className={styles.bottomMenuLinkInner}>
                  <div className={styles.bottomMenuLinkIconWrapper}>
                    {homeActive ? <HomeActiveIcon /> : <HomeIcon />}
                  </div>
                  <p className={styles.bottomMenuText}>{t('Home')}</p>
                </div>
              </Link>
            </div>
          </div>

          <div className={cx(styles.diningWrapper, { [styles.diningWrapperActive]: diningActive })}>
            <div
              className={cx(styles.bottomMenuLinkInner, {
                [styles.bottomMenuLinkInnerActive]: diningActive || diningBottomMenuDisplayed,
              })}
              onClick={toggleDiningBottomMenuDisplayed}
            >
              <div className={cx(styles.dining, { [styles.diningActiveActive]: diningActive })}>
                <div className={styles.bottomMenuLinkIconWrapper}>
                  {diningActive || diningBottomMenuDisplayed ? (
                    <DiningActiveIcon />
                  ) : (
                    <DiningIcon />
                  )}
                </div>
                <p className={styles.bottomMenuText}>{t('Dining')}</p>
              </div>
            </div>
          </div>
          {!hotelName && (
            <div className={styles.housekeepingWrapper}>
              <Link
                className={styles.bottomMenuLink}
                href={availablePaths.HOUSEKEEPING}
                onClick={toggleAllMenuDisplayed}
              >
                <div
                  className={cx(styles.bottomMenuLinkInner, {
                    [styles.bottomMenuLinkInnerActive]: housekeepingActive,
                  })}
                >
                  <div className={styles.bottomMenuLinkIconWrapper}>
                    {housekeepingActive ? <HousekeepingActiveIcon /> : <HousekeepingIcon />}
                  </div>
                  <p className={styles.bottomMenuText}>{t('Services')}</p>
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>

      <DiningBottomBar
        toggleDiningBottomBarOpened={toggleDiningBottomMenuDisplayed}
        opened={diningBottomMenuDisplayed}
      />
    </>
  );
};
