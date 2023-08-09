import React, { useCallback, useState } from 'react';
import cx from 'classnames';
import styles from './BottomMenu.module.scss';

import MoreIcon from '@icons/more.svg';
import DiningIcon from '@icons/dining.svg';
import HousekeepingIcon from '@icons/housekeeping.svg';
import RoomControlIcon from '@icons/roomControl.svg';
import CloseOutlinedIcon from '@icons/CloseOutlined.svg';
import DiningActiveIcon from '@icons/diningActive.svg';
import HomeActiveIcon from '@icons/homeActive.svg';
import HousekeepingActiveIcon from '@icons/housekeepingActive.svg';
import HomeIcon from '@icons/home.svg';
import ChatActiveIcon from '@icons/chatActive.svg';
import ChatIcon from '@icons/chat.svg';
import MoreActiveIcon from '@icons/moreActive.svg';

import { MenuItem } from 'components/shared/BottomMenu/MenuItem/MenuItem';
import Link from 'utils/link';
import { useCheckedIn, checkinStorage } from 'storage/check-in.storage';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import { availablePaths } from 'utils/availablePaths';
import { IHamburgerProps } from 'utils/hamburger/getHamburgerProps';
import { hamburgerIconsMap } from 'utils/hamburger/hamburgerIconsMap';
import { DiningBottomBar } from 'components/pages/dining/DiningBottomBar/DiningBottomBar';
import { Headers } from 'utils/constants';
import { GET_ONPREM_TOKEN, IOnPremTokenApiRequest } from 'core/graphql/queries/GET_ONPREM_TOKEN';
import { client } from 'core/graphql/client';
import { GET_RESERVATION, IGetReservationApiResponse } from 'core/graphql/queries/GET_RESERVATION';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { HOME_PAGE } from 'core/graphql/endpoints';
import { IParsedHotelPage } from 'core/graphql/queries/GET_HOTEL_INFO';

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
  const navigate = useLocalizedRouter();

  const { t } = useTranslation('common');
  const checkinData = useCheckedIn();

  const [moreItemsDisplayed, setMoreItemsDisplayed] = useState(false);
  const [diningBottomMenuDisplayed, setDiningBottomMenuDisplayed] = useState(false);

  const housekeepingActive = router.pathname.includes(availablePaths.HOUSEKEEPING);
  const homeActive = pageData?.name === HOME_PAGE;
  const diningActive =
    router.pathname.includes(availablePaths.DINING) || pageData?.name === Headers[0];
  // const chatActive = router.pathname.includes(availablePaths.CHAT);

  const toggleMoreItemsDisplayed = useCallback(() => {
    setDiningBottomMenuDisplayed(false);
    setMoreItemsDisplayed((oldState) => !oldState);
  }, []);

  const toggleDiningBottomMenuDisplayed = useCallback(() => {
    setMoreItemsDisplayed(false);
    setDiningBottomMenuDisplayed((oldState) => !oldState);
  }, []);

  const toggleAllMenuDisplayed = useCallback(() => {
    setMoreItemsDisplayed(false);
    setDiningBottomMenuDisplayed(false);
  }, []);
  const reservationData = client.readQuery<IGetReservationApiResponse>({
    query: GET_RESERVATION,
  });

  const getHouseKeepingToken = useCallback(async () => {
    setMoreItemsDisplayed(false);
    setDiningBottomMenuDisplayed(false);
    if (checkinData.checkedIn) {
      const payload: IOnPremTokenApiRequest = {
        roomNo: reservationData?.getReservation?.data?.roomTypes[0]?.roomNumber ?? '0100',
        bookingId: reservationData?.getReservation?.data?.confirmationId ?? '',
        lastName: 'iptvuser',
        deviceType: 'IPTV',
      };
      const token: any = await client.query({
        query: GET_ONPREM_TOKEN,
        context: { clientName: 'onprem' },
        variables: {
          body: payload,
        },
        fetchPolicy: 'no-cache',
      });
      checkinStorage({
        reservationId: reservationData?.getReservation?.data?.confirmationId as string,
        checkedIn: true,
        token: token.data.getOnPremToken?.data?.access_token ?? '',
      });
    }
    navigate(availablePaths.HOUSEKEEPING);
  }, []);

  return (
    <>
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

        <div
          className={cx(styles.bottomMenuLinkInner, {
            [styles.bottomMenuLinkInnerActive]: diningActive || diningBottomMenuDisplayed,
          })}
          onClick={toggleDiningBottomMenuDisplayed}
        >
          <div className={styles.bottomMenuLinkIconWrapper}>
            {diningActive || diningBottomMenuDisplayed ? <DiningActiveIcon /> : <DiningIcon />}
          </div>
          <p className={styles.bottomMenuText}>{t('Dining')}</p>
        </div>

        <div className={styles.bottomMenuLink} onClick={getHouseKeepingToken}>
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
        </div>

        {/* <Link
          className={styles.bottomMenuLink}
          href={availablePaths.CHAT}
          onClick={toggleAllMenuDisplayed}
        >
          <div
            className={cx(styles.bottomMenuLinkInner, {
              [styles.bottomMenuLinkInnerActive]: chatActive,
            })}
          >
            <div className={styles.bottomMenuLinkIconWrapper}>
              {chatActive ? <ChatIcon /> : <ChatActiveIcon />}
            </div>
            <p className={styles.bottomMenuText}>{t('Chat')}</p>
          </div>
        </Link> */}

        <button
          className={cx(styles.bottomMenuLinkInner, styles.moreButton, {
            [styles.moreButtonActive]: moreItemsDisplayed,
          })}
          onClick={toggleMoreItemsDisplayed}
        >
          {moreItemsDisplayed ? <MoreActiveIcon /> : <MoreIcon />}
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
