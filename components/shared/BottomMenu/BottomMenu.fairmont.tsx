import React, { useCallback, useState } from 'react';
import cx from 'classnames';
import styles from './BottomMenu.module.scss';
import MoreIcon from '@icons/more.svg';
import MoreActiveIcon from '@icons/moreActive.svg';
import HomeIcon from '@icons/home.svg';
import HomeActiveIcon from '@icons/homeActive.svg';
import DiningIcon from '@icons/dining.svg';
import DiningActiveIcon from '@icons/diningActive.svg';
import ChatIcon from '@icons/chat.svg';
import ChatActiveIcon from '@icons/chatActive.svg';
import HousekeepingIcon from '@icons/housekeeping.svg';
import HousekeepingActiveIcon from '@icons/housekeepingActive.svg';
import RoomControlIcon from '@icons/roomControl.svg';
import CloseOutlinedIcon from '@icons/CloseOutlined.svg';

import { MenuItem } from 'components/shared/BottomMenu/MenuItem/MenuItem';
import Link from 'utils/link';
import { useCheckedIn } from 'storage/check-in.storage';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import { availablePaths } from 'utils/availablePaths';
import { IHamburgerProps } from 'utils/hamburger/getHamburgerProps';
import { hamburgerIconsMap } from 'utils/hamburger/hamburgerIconsMap';
import { DiningBottomBar } from 'components/pages/dining/DiningBottomBar/DiningBottomBar';
import { Headers } from 'utils/constants';
import { IParsedHotelPage } from 'core/graphql/queries/GET_HOTEL_INFO';
import { HOME_PAGE } from 'core/graphql/endpoints';

interface IHomeProps {
  pageData: IParsedHotelPage;
  paths: {
    path: string;
    id: string;
  }[];
}

export const BottomMenu: React.FC<IHomeProps & IHamburgerProps> = ({
  hamburger,
  pages,
  pageData,
}) => {
  const router = useRouter();

  const { t } = useTranslation('common');
  const checkinData = useCheckedIn();

  const [moreItemsDisplayed, setMoreItemsDisplayed] = useState(false);
  const [diningBottomMenuDisplayed, setDiningBottomMenuDisplayed] = useState(false);
  const homeActive = pageData?.name === HOME_PAGE;
  const diningActive =
    router.pathname.includes(availablePaths.DINING) || pageData?.name === Headers[0];
  const housekeepingActive = router.pathname.includes(availablePaths.HOUSEKEEPING);
  const chatActive = router.pathname.includes(availablePaths.CHAT);

  const toggleMoreItemsDisplayed = useCallback(() => {
    setDiningBottomMenuDisplayed(false);
    setMoreItemsDisplayed((oldState) => !oldState);
  }, []);

  const toggleDiningBottomMenuDisplayed = useCallback(() => {
    // setMoreItemsDisplayed(false);
    // setDiningBottomMenuDisplayed((oldState) => !oldState);
    // navigate(availablePaths.DINING);
  }, []);

  const toggleAllMenuDisplayed = useCallback(() => {
    setMoreItemsDisplayed(false);
    setDiningBottomMenuDisplayed(false);
  }, []);

  return (
    <>
      <div className={styles.bottonMenuContainer}>
        <div className={styles.bottomMenuWrapper}>
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

          <Link
            href={availablePaths.DINING}
            className={cx(styles.bottomMenuLinkInner, {
              [styles.bottomMenuLinkInnerActive]: diningActive || diningBottomMenuDisplayed,
            })}
            onClick={toggleDiningBottomMenuDisplayed}
          >
            <div className={styles.bottomMenuLinkIconWrapper}>
              {diningActive || diningBottomMenuDisplayed ? <DiningActiveIcon /> : <DiningIcon />}
            </div>
            <p className={styles.bottomMenuText}>{t('Dining')}</p>
          </Link>

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

          {/* <button
            className={cx(styles.bottomMenuLinkInner, styles.moreButton, {
              [styles.moreButtonActive]: moreItemsDisplayed,
            })}
            onClick={toggleMoreItemsDisplayed}
          >
            {moreItemsDisplayed ? <MoreActiveIcon /> : <MoreIcon />}
            <p className={styles.bottomMenuText}>{t('More')}</p>
          </button> */}
        </div>
      </div>

      <div
        className={cx(styles.blurOverlay, { [styles.blurOverlayDisplayed]: moreItemsDisplayed })}
        onClick={toggleMoreItemsDisplayed}
      />
      <div
        className={cx(styles.moreMenuItemsContainer, {
          [styles.moreMenuItemsContainerDisplayed]: moreItemsDisplayed,
        })}
      >
        <button className={styles.closeMoreMenuItemsButton} onClick={toggleMoreItemsDisplayed}>
          <CloseOutlinedIcon className={styles.closeMoreMenuItemsIcon} />
        </button>

        <div className={styles.menuItems}>
          {hamburger[checkinData.checkedIn ? 'post' : 'pre'].map((hamburgerMenuElement) => (
            <MenuItem
              Icon={
                hamburgerIconsMap[hamburgerMenuElement.name as keyof typeof hamburgerIconsMap] ||
                RoomControlIcon
              }
              title={hamburgerMenuElement.name}
              key={hamburgerMenuElement.id}
              externalLink={hamburgerMenuElement.externalLink}
              flow={hamburgerMenuElement.flow}
              pages={hamburgerMenuElement.pages}
              redirectOptions={hamburgerMenuElement.redirectOptions}
              paths={pages}
              status={hamburgerMenuElement.isActive}
              toggleOption={toggleMoreItemsDisplayed}
            />
          ))}
        </div>
      </div>

      <DiningBottomBar
        toggleDiningBottomBarOpened={toggleDiningBottomMenuDisplayed}
        opened={diningBottomMenuDisplayed}
      />
    </>
  );
};
