import React from 'react';
import styles from './BottomMenu.module.scss';
import { motion } from 'framer-motion';
import HamburgerIcon from '@icons/hamburger.svg';
import DownArrowIcon from '@icons/downArrow.svg';
import CloseHamburgerIcon from '@icons/closeHamburger.svg';

import { MenuItem, ModuleOptionsDrawer } from 'components/shared/BottomMenu/MenuItem/MenuItem';
import { useTranslation } from 'react-i18next';
import { StyledButton } from '../StyledButton/StyledButton';
import { useQuery, useReactiveVar } from '@apollo/client';
import { toggleHamburgerMenuDrawer, toggleModuleOptionsDrawer } from 'storage/home.storage';
import {
  GET_HAMBURGER_MENU,
  IGetHamburgerMenuDetailsApiResponse,
} from 'core/graphql/queries/GET_HAMBURGER_MENU';
import { hamburgerIconsMap } from 'utils/hamburger/hamburgerIconsMap';
import { availablePaths } from 'utils/availablePaths';
import { useRouter } from 'next/router';
import { HEADERS } from 'utils/constants';
import { housekeepingOptions } from 'storage/housekeeping.storage';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';

export const BottomMenu = () => {
  const router = useRouter();
  const hamburgerMenuStatus = useReactiveVar(toggleHamburgerMenuDrawer);
  const houseKeepingOptionSelected = useReactiveVar(housekeepingOptions);

  const arrowActive = true;
  const homeActive = router.pathname === '/[locale]';
  const irdActive = router.pathname.includes(availablePaths?.DINING);
  const restaurantActive = router.pathname.includes(HEADERS[0]);
  const housekeepingActive = router.pathname.includes(availablePaths.HOUSEKEEPING);
  const navigate = useLocalizedRouter();

  const { data } = useQuery<IGetHamburgerMenuDetailsApiResponse>(GET_HAMBURGER_MENU, {
    context: { clientName: 'host_v4' },
    fetchPolicy: 'no-cache',
  });

  const hamburger = data?.getUiBuilderHamburgerMenuDetails;

  const { t } = useTranslation(['common']);

  const openModuleOptionsDrawer = () => {
    toggleModuleOptionsDrawer(true);
    toggleHamburgerMenuDrawer(false);
  };

  const openHamburgerMenuDrawer = () => {
    toggleHamburgerMenuDrawer(true);
    toggleModuleOptionsDrawer(false);
  };

  const closeHamburgerMenuDrawer = () => {
    toggleHamburgerMenuDrawer(false);
  };

  return (
    <>
      <div className={styles.bottomMenuWrapper}>
        <motion.div whileTap={{ scale: 0.8 }} className={styles.bottomMenuButton}>
          <StyledButton variant='contained' onClick={openModuleOptionsDrawer}>
            {homeActive && t('Room 401')}
            {irdActive && t('In-Room Dining')}
            {housekeepingActive && t(`${houseKeepingOptionSelected?.title}`)}
            {arrowActive && <DownArrowIcon className={styles.downArrow} />}
          </StyledButton>
        </motion.div>
        {hamburgerMenuStatus ? (
          <CloseHamburgerIcon
            className={styles.hamburgerIcon}
            onClick={() => toggleHamburgerMenuDrawer(false)}
          />
        ) : (
          <HamburgerIcon className={styles.hamburgerIcon} onClick={openHamburgerMenuDrawer} />
        )}
      </div>

      <ModuleOptionsDrawer {...{ homeActive, irdActive, housekeepingActive }} />

      {hamburgerMenuStatus && (
        <div className={styles.hamburgerMenuContainer}>
          {hamburger &&
            hamburger['post'].map((hamburgerMenuElement) => (
              <MenuItem
                Icon={
                  hamburgerIconsMap[hamburgerMenuElement.name as keyof typeof hamburgerIconsMap] ||
                  HamburgerIcon
                }
                title={hamburgerMenuElement.name}
                key={hamburgerMenuElement.id}
                externalLink={hamburgerMenuElement.externalLink}
                flow={hamburgerMenuElement.flow}
                pages={hamburgerMenuElement.pages}
                redirectOptions={hamburgerMenuElement.redirectOptions}
                status={hamburgerMenuElement.isActive}
                toggleOption={closeHamburgerMenuDrawer}
              />
            ))}
        </div>
      )}
    </>
  );
};
