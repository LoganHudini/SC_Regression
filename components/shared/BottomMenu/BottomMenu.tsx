import React, { useEffect, useState, useRef } from 'react';
import styles from './BottomMenu.module.scss';
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
import CheckInDrawer from 'components/pages/check-in/CheckInDrawer/CheckInDrawer';
import cx from 'classnames';
import { useHideOnScroll } from 'utils/hooks/useHideOnScroll';
import useOutsideAlerter from 'utils/hooks/useOutsideAlerter';
import { selectedOfferOption } from 'storage/offers.storage';
import { CustomDrawer } from '../CustomDrawer/CustomDrawer';
import { buttonArrow } from 'utils/functions';
import { selectedRestaurantStorage } from 'storage/table-reservation.storage';

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
  const checkOutActive = router?.pathname?.includes(availablePaths.BILL);
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
      if (checkOutActive && isCheckedIn?.checkedIn) {
        toggleDetailsDrawer(true);
      } else {
        toggleModuleOptionsDrawer(true);
        toggleHamburgerMenuDrawer(false);
      }
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
          hamburger[isCheckedIn?.checkedIn ? 'post' : 'pre'].map((hamburgerMenuElement) => (
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
          arrow={buttonArrow && !isCheckedIn?.checkedIn && homeActive}
        >
          <span className={styles.btnText}>
            {homeActive &&
              (isCheckedIn?.checkedIn ? `Room ${isCheckedIn?.roomNumber}` : t('CHECK-IN'))}
            {irdActive && t(`${diningOptionSelected?.title}`)}
            {housekeepingActive && t(`${houseKeepingOptionSelected?.title}`)}
            {spaActive && t(`${spaInformation?.selectedSpaCategoryName}`)}
            {offersActive && t(`${offersOptionSelected?.type}`)}
            {hotelCompendiumActive && t(`${hotelCompendiumSelected?.name}`)}
            {checkOutActive && t('PAY & CHECKOUT')}
          </span>
          {homeActive ? (
            isCheckedIn?.checkedIn &&
            isCheckedIn?.roomNumber && <DownArrowIcon className={styles.downArrow} />
          ) : (
            <DownArrowIcon className={styles.downArrow} />
          )}
        </StyledButton>

        <div className={styles.hamburgerIcon}>
          <Hamburger
            distance={'sm'}
            color={'var(--primary-theme-color)'}
            toggled={hamburgerMenuStatus}
            toggle={(toggled) => {
              if (toggled) {
                selectedRestaurantStorage([]);
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

      <CustomDrawer
        open={hamburgerMenuStatus}
        onClose={closeHamburgerMenuDrawer}
        content={hamburgerMenuRender()}
      />

      <CheckInDrawer />
    </>
  );
};
