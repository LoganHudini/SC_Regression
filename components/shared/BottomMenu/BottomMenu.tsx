import React, { useCallback, useState } from 'react';
import cx from 'classnames';
import styles from './BottomMenu.module.scss';
import { motion } from 'framer-motion';
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

import { MenuItem, ModuleOptionsDrawer } from 'components/shared/BottomMenu/MenuItem/MenuItem';
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
import { StyledButton } from '../StyledButton/StyledButton';
import Drawer from '@mui/material/Drawer';
import { useReactiveVar } from '@apollo/client';
import { toggleModuleOptionsDrawer } from 'storage/home.storage';

interface IHomeProps {
  pageData: IParsedHotelPage;
  paths: {
    path: string;
    id: string;
  }[];
}

export const BottomMenu = () => {
  const router = useRouter();

  const { t } = useTranslation('common');
  const drawerStatus = useReactiveVar(toggleModuleOptionsDrawer);

  const checkinData = useCheckedIn();

  const [moreItemsDisplayed, setMoreItemsDisplayed] = useState(false);
  const [diningBottomMenuDisplayed, setDiningBottomMenuDisplayed] = useState(false);

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

  return (
    <>
      <div className={styles.bottomMenuWrapper}>
        <motion.div
          whileHover={{
            scale: 1.2,
            transition: { duration: 0.3 },
          }}
          whileTap={{ scale: 0.8 }}
          className={styles.bottomMenuButton}
        >
          <StyledButton variant='contained' onClick={() => toggleModuleOptionsDrawer(true)}>
            ROOM 0411
          </StyledButton>
        </motion.div>
      </div>

      <ModuleOptionsDrawer />

      {/* <div
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
      </div> */}
    </>
  );
};
