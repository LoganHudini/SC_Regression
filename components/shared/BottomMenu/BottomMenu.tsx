import React, { useEffect, useRef } from 'react';
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
  selectedCompendiumCategory,
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
import cx from 'classnames';
import { useHideOnScroll } from 'utils/hooks/useHideOnScroll';
import { DetailDrawer } from '../DetailDrawer/DetailDrawer';
import useOutsideAlerter from 'utils/hooks/useOutsideAlerter';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { HEADERS } from 'utils/constants';

export const BottomMenu: React.FC<unknown> = () => {
  const wrapperRef = useRef(null);
  const router = useRouter();
  const hideOnScroll = useHideOnScroll();
  const hamburgerMenuStatus = useReactiveVar(toggleHamburgerMenuDrawer);
  const houseKeepingOptionSelected = useReactiveVar(housekeepingOptions);
  const diningOptionSelected = useReactiveVar(diningOptions);
  const spaInformation = useReactiveVar(spaInformationStorage);
  const isCheckedIn = useCheckedIn();
  const homeActive = router?.pathname === '/[locale]';
  const irdActive =
    router?.pathname?.includes(availablePaths?.DINING) ||
    router?.pathname?.includes(availablePaths?.RESTAURANTS_BARS);
  const housekeepingActive = router?.pathname?.includes(availablePaths.HOUSEKEEPING);
  const spaActive = router?.pathname?.includes(availablePaths?.SPA);
  const hotelCompendiumActive = router?.pathname?.includes(availablePaths.HOTEL_COMPENDIUM);
  const hotelCompendiumSelected: any = useReactiveVar(selectedCompendiumCategory);
  const arrowActive = homeActive && !isCheckedIn ? false : true;
  const restaurantActive = router.pathname.includes(HEADERS[0]);

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

  useEffect(() => {
    hideOnScroll && toggleHamburgerMenuDrawer(false);
  }, [hideOnScroll]);

  useOutsideAlerter(wrapperRef);

  return (
    <>
      <div className={cx(styles.bottomMenuWrapper, { [styles.hideOnScroll]: hideOnScroll })}>
        <motion.div
          whileTap={{ scale: 0.8 }}
          className={styles.bottomMenuButton}
          onClick={openModuleOptionsDrawer}
        >
          <StyledButton variant='contained'>
            <span className={styles.btnText}>
              {homeActive && (isCheckedIn ? t('Room 401') : t('CHECK-IN'))}
              {irdActive && t(`${diningOptionSelected?.title}`)}
              {housekeepingActive && t(`${houseKeepingOptionSelected?.title}`)}
              {spaActive && t(`${spaInformation?.selectedSpaCategoryName}`)}
              {hotelCompendiumActive && t(`${hotelCompendiumSelected?.name}`)}
            </span>
            <DownArrowIcon className={styles.downArrow} />
          </StyledButton>
        </motion.div>

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
      </div>

      <ModuleOptionsDrawer
        {...{ homeActive, irdActive, housekeepingActive, spaActive, hotelCompendiumActive }}
      />

      {hamburgerMenuStatus && hamburger && (
        <div ref={wrapperRef} className={cx(styles.hamburgerMenuContainer)}>
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
