import React, { useCallback, useState } from 'react';
import cx from 'classnames';
import styles from './BottomMenu.module.scss';

import MoreIcon from '@icons/more.svg';
import FacilitiesIcon from '@icons/facilities.svg';
import TripsIcon from '@icons/trips.svg';
import DiningIcon from '@icons/dining.svg';
import ChatIcon from '@icons/chat.svg';
import HousekeepingIcon from '@icons/housekeeping.svg';
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

export const BottomMenu: React.FC<IHamburgerProps> = ({ hamburger, pages }) => {
  const router = useRouter();

  const { t } = useTranslation('common');

  const checkinData = useCheckedIn();

  const [moreItemsDisplayed, setMoreItemsDisplayed] = useState(false);
  const [diningBottomMenuDisplayed, setDiningBottomMenuDisplayed] = useState(false);

  const tripsActive = router.pathname.includes(availablePaths.TRIPS);
  const housekeepingActive = router.pathname.includes(availablePaths.HOUSEKEEPING);
  const roomControlsActive = router.pathname.includes(availablePaths.ROOM_CONTROLS);
  const diningActive = router.pathname.includes(availablePaths.DINING);
  const chatActive = router.pathname.includes(availablePaths.CHAT);

  const toggleMoreItemsDisplayed = useCallback(() => {
    setMoreItemsDisplayed((oldState) => !oldState);
  }, []);
  const toggleDiningBottomMenuDisplayed = useCallback(() => {
    setDiningBottomMenuDisplayed((oldState) => !oldState);
  }, []);

  return (
    <>
      <div className={styles.bottomMenuWrapper}>
        {checkinData.checkedIn ? (
          <>
            <Link className={styles.bottomMenuLink} href={availablePaths.ROOM_CONTROLS}>
              <div
                className={cx(styles.bottomMenuLinkInner, {
                  [styles.bottomMenuLinkInnerActive]: roomControlsActive,
                })}
              >
                <div className={styles.bottomMenuLinkIconWrapper}>
                  <RoomControlIcon />
                </div>
                <p className={styles.bottomMenuText}>{t('Room control')}</p>
              </div>
            </Link>
            <Link className={styles.bottomMenuLink} href={availablePaths.HOUSEKEEPING}>
              <div
                className={cx(styles.bottomMenuLinkInner, {
                  [styles.bottomMenuLinkInnerActive]: housekeepingActive,
                })}
              >
                <div className={styles.bottomMenuLinkIconWrapper}>
                  <HousekeepingIcon />
                </div>
                <p className={styles.bottomMenuText}>{t('Housekeeping')}</p>
              </div>
            </Link>
          </>
        ) : (
          <>
            <Link className={styles.bottomMenuLink} href='/'>
              <div className={styles.bottomMenuLinkInner}>
                <div className={styles.bottomMenuLinkIconWrapper}>
                  <FacilitiesIcon />
                </div>
                <p className={styles.bottomMenuText}>{t('Facilities')}</p>
              </div>
            </Link>
            <Link className={styles.bottomMenuLink} href={availablePaths.TRIPS}>
              <div
                className={cx(styles.bottomMenuLinkInner, {
                  [styles.bottomMenuLinkInnerActive]: tripsActive,
                })}
              >
                <div className={styles.bottomMenuLinkIconWrapper}>
                  <TripsIcon />
                </div>
                <p className={styles.bottomMenuText}>{t('Trips')}</p>
              </div>
            </Link>
          </>
        )}
        {checkinData.checkedIn ? (
          <Link className={styles.bottomMenuLink} href={availablePaths.DINING}>
            <div
              className={cx(styles.bottomMenuLinkInner, {
                [styles.bottomMenuLinkInnerActive]: diningActive,
              })}
            >
              <div className={styles.bottomMenuLinkIconWrapper}>
                <DiningIcon />
              </div>
              <p className={styles.bottomMenuText}>{t('In-Room Dining')}</p>
            </div>
          </Link>
        ) : (
          <div onClick={toggleDiningBottomMenuDisplayed} className={styles.bottomMenuLink}>
            <div
              className={cx(styles.bottomMenuLinkInner, {
                [styles.bottomMenuLinkInnerActive]: diningActive || diningBottomMenuDisplayed,
              })}
            >
              <div className={styles.bottomMenuLinkIconWrapper}>
                <DiningIcon />
              </div>
              <p className={styles.bottomMenuText}>{t('Dining')}</p>
            </div>
          </div>
        )}
        <Link className={styles.bottomMenuLink} href={availablePaths.CHAT}>
          <div
            className={cx(styles.bottomMenuLinkInner, {
              [styles.bottomMenuLinkInnerActive]: chatActive,
            })}
          >
            <div className={styles.bottomMenuLinkIconWrapper}>
              <ChatIcon />
            </div>
            <p className={styles.bottomMenuText}>{t('Chat')}</p>
          </div>
        </Link>

        <button
          className={cx(styles.bottomMenuLinkInner, styles.moreButton, {
            [styles.moreButtonActive]: moreItemsDisplayed,
          })}
          onClick={toggleMoreItemsDisplayed}
        >
          <MoreIcon />
          <p className={styles.bottomMenuText}>{t('More')}</p>
        </button>
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
