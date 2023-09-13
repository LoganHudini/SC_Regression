import React from 'react';
import styles from './BottomMenu.module.scss';
import { motion } from 'framer-motion';
import HamburgerIcon from '@icons/hamburger.svg';
import DownArrowIcon from '@icons/downArrow.svg';
import { MenuItem, ModuleOptionsDrawer } from 'components/shared/BottomMenu/MenuItem/MenuItem';
import { useTranslation } from 'react-i18next';
import { StyledButton } from '../StyledButton/StyledButton';
import { useQuery, useReactiveVar } from '@apollo/client';
import {
  diningOptions,
  selectedCompendiumItems,
  toggleDetailsDrawer,
  toggleHamburgerMenuDrawer,
  toggleModuleOptionsDrawer,
} from 'storage/home.storage';
import {
  GET_HAMBURGER_MENU,
  IGetHamburgerMenuDetailsApiResponse,
} from 'core/graphql/queries/GET_HAMBURGER_MENU';
import { hamburgerIconsMap } from 'utils/hamburger/hamburgerIconsMap';
import { availablePaths } from 'utils/availablePaths';
import { useRouter } from 'next/router';
import { housekeepingOptions } from 'storage/housekeeping.storage';
import { useCheckedIn } from 'storage/check-in.storage';
import { spaInformationStorage } from 'storage/spa.storage';
import { Fade as Hamburger } from 'hamburger-react';
import CheckInDrawer from 'components/pages/check-in/CheckInDrawer';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { HEADERS } from 'utils/constants';

export const BottomMenu: React.FC<any> = () => {
  const router = useRouter();
  const hamburgerMenuStatus = useReactiveVar(toggleHamburgerMenuDrawer);
  const houseKeepingOptionSelected = useReactiveVar(housekeepingOptions);
  const diningOptionSelected = useReactiveVar(diningOptions);
  const hotelCompendiumSelected: any = useReactiveVar(selectedCompendiumItems);

  const spaInformation = useReactiveVar(spaInformationStorage);
  const isCheckedIn = useCheckedIn();
  const homeActive = router?.pathname === '/[locale]';

  const arrowActive = homeActive && !isCheckedIn ? false : true;
  const irdActive =
    router.pathname.includes(availablePaths?.DINING) ||
    router.pathname.includes(availablePaths?.RESTAURANTS_BARS);
  const restaurantActive = router.pathname.includes(HEADERS[0]);
  const housekeepingActive = router.pathname.includes(availablePaths.HOUSEKEEPING);
  const hotelCompendiumActive = router?.pathname?.includes(availablePaths.HOTEL_COMPENDIUM);
  const spaActive = router?.pathname?.includes(availablePaths?.SPA);

  const navigate = useLocalizedRouter();

  const { data } = useQuery<IGetHamburgerMenuDetailsApiResponse>(GET_HAMBURGER_MENU, {
    context: { clientName: 'host_v4' },
    fetchPolicy: 'no-cache',
  });

  const hamburger = data?.getUiBuilderHamburgerMenuDetails;

  const { t } = useTranslation(['common']);

  const openModuleOptionsDrawer = () => {
    if (isCheckedIn) {
      toggleModuleOptionsDrawer(true);
      toggleHamburgerMenuDrawer(false);
    } else {
      toggleDetailsDrawer(true);
    }
  };

  const closeHamburgerMenuDrawer = () => {
    toggleHamburgerMenuDrawer(false);
  };

  return (
    <>
      <div className={styles.bottomMenuWrapper}>
        <motion.div whileTap={{ scale: 0.8 }} className={styles.bottomMenuButton}>
          <StyledButton variant='contained' onClick={openModuleOptionsDrawer}>
            {homeActive && (isCheckedIn ? t('Room 401') : t('CHECK-IN'))}
            {irdActive && t(`${diningOptionSelected?.title}`)}
            {housekeepingActive && t(`${houseKeepingOptionSelected?.title}`)}
            {hotelCompendiumActive && t(`${hotelCompendiumSelected?.name}`)}
            {spaActive && spaInformation?.selectedSpaCategoryName}
            {arrowActive && <DownArrowIcon className={styles.downArrow} />}
          </StyledButton>
        </motion.div>

        {hamburger && hamburger['post']?.length > 0 && (
          <div className={styles.hamburgerIcon}>
            <Hamburger
              toggled={hamburgerMenuStatus}
              toggle={(toggled) => {
                if (toggled) {
                  toggleHamburgerMenuDrawer(true);
                } else {
                  toggleHamburgerMenuDrawer(false);
                }
              }}
            />
          </div>
        )}
      </div>

      <ModuleOptionsDrawer
        {...{ homeActive, irdActive, housekeepingActive, hotelCompendiumActive, spaActive }}
      />

      {hamburgerMenuStatus && hamburger && (
        <div className={styles.hamburgerMenuContainer}>
          {hamburger['post'].map((hamburgerMenuElement) => (
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

      <CheckInDrawer />
    </>
  );
};
