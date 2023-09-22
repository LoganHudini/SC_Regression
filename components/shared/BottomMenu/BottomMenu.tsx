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
  toggleCheckInDetailsDrawer,
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
import useOutsideAlerter from 'utils/hooks/useOutsideAlerter';
import { selectedOfferOption } from 'storage/offers.storage';
import { CustomDrawer } from '../CustomDrawer/CustomDrawer';

export const BottomMenu: React.FC<unknown> = () => {
  const wrapperRef = useRef(null);
  const router = useRouter();
  const hideOnScroll = useHideOnScroll();
  const hamburgerMenuStatus = useReactiveVar(toggleHamburgerMenuDrawer);
  const houseKeepingOptionSelected = useReactiveVar(housekeepingOptions);
  const diningOptionSelected = useReactiveVar(diningOptions);
  const offersOptionSelected: any = useReactiveVar(selectedOfferOption);
  const { t } = useTranslation(['common']);
  const spaInformation = useReactiveVar(spaInformationStorage);
  const isCheckedIn = useCheckedIn();
  const homeActive = router?.pathname === '/[locale]';
  const irdActive =
    router?.pathname?.includes(availablePaths?.DINING) ||
    router?.pathname?.includes(availablePaths?.RESTAURANTS_BARS);
  const housekeepingActive = router?.pathname?.includes(availablePaths.HOUSEKEEPING);
  const spaActive = router?.pathname?.includes(availablePaths?.SPA);
  const offersActive = router.pathname.includes(availablePaths.OFFERS);
  const hotelCompendiumActive = router?.pathname?.includes(availablePaths.HOTEL_COMPENDIUM);
  const hotelCompendiumSelected: any = useReactiveVar(selectedCompendiumCategory);

  const { data } = useQuery<IGetHamburgerMenuDetailsApiResponse>(GET_HAMBURGER_MENU, {
    context: { clientName: 'host_v4' },
    fetchPolicy: 'no-cache',
  });

  const hamburger = data?.getUiBuilderHamburgerMenuDetails;

  const openModuleOptionsDrawer = () => {
    if (homeActive && !isCheckedIn?.checkedIn) {
      toggleCheckInDetailsDrawer(true);
    } else {
      toggleModuleOptionsDrawer(true);
      toggleHamburgerMenuDrawer(false);
    }
  };

  const closeHamburgerMenuDrawer = () => {
    toggleHamburgerMenuDrawer(false);
  };

  useEffect(() => {
    hideOnScroll && toggleHamburgerMenuDrawer(false);
  }, [hideOnScroll]);

  useOutsideAlerter(wrapperRef);

  const hamburgerMenuRender = () => {
    return (
      <div ref={wrapperRef} className={cx(styles.hamburgerMenuContainer)}>
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
    );
  };

  return (
    <>
      <div className={cx(styles.bottomMenuWrapper, { [styles.hideOnScroll]: hideOnScroll })}>
        <StyledButton
          variant='contained'
          className={styles.bottomMenuButton}
          onClick={openModuleOptionsDrawer}
        >
          <span className={styles.btnText}>
            {homeActive && (isCheckedIn?.checkedIn ? t('Room 401') : t('CHECK-IN'))}
            {irdActive && t(`${diningOptionSelected?.title}`)}
            {housekeepingActive && t(`${houseKeepingOptionSelected?.title}`)}
            {spaActive && t(`${spaInformation?.selectedSpaCategoryName}`)}
            {offersActive && t(`${offersOptionSelected?.type}`)}
            {hotelCompendiumActive && t(`${hotelCompendiumSelected?.name}`)}
          </span>
          <DownArrowIcon className={styles.downArrow} />
        </StyledButton>

        <div className={styles.hamburgerIcon}>
          <Hamburger
            distance={'sm'}
            color={'var(--primary-theme-color)'}
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
        {...{
          homeActive,
          irdActive,
          housekeepingActive,
          hotelCompendiumActive,
          spaActive,
          offersActive,
        }}
      />

      {/* {hamburgerMenuStatus && hamburger && (
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
      )} */}

      <CustomDrawer
        open={hamburgerMenuStatus}
        onClose={closeHamburgerMenuDrawer}
        content={hamburgerMenuRender()}
      />

      <CheckInDrawer />
    </>
  );
};
