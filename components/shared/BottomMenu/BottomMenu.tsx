import React, { useCallback, useEffect, useRef } from 'react';
import styles from './BottomMenu.module.scss';
import DownArrowIcon from '@icons/downArrow.svg';
import { MenuItem, ModuleOptionsDrawer } from 'components/shared/BottomMenu/MenuItem/MenuItem';
import { useTranslation } from 'react-i18next';
import { StyledButton } from '../StyledButton/StyledButton';
import { useQuery, useReactiveVar } from '@apollo/client';
import {
  diningOptions,
  getHotelCompendium,
  selectedCompendiumCategory,
  toggleDetailsDrawer,
  toggleHamburgerMenuDrawer,
  toggleMessageBirdChat,
  toggleModuleOptionsDrawer,
} from 'storage/home.storage';
import {
  GET_HAMBURGER_MENU,
  IGetHamburgerMenuDetailsApiResponse,
} from 'core/graphql/queries/GET_HAMBURGER_MENU';
import { hamburgerIconsMap } from 'utils/hamburger/hamburgerIconsMap';
import { availablePaths } from 'utils/availablePaths';
import { useRouter } from 'next/router';
import { housekeepingOptions, serviceRequestOptionsArray } from 'storage/housekeeping.storage';
import { useCheckedIn } from 'storage/check-in.storage';
import { spaCategoryList, spaInformationStorage } from 'storage/spa.storage';
import { Fade as Hamburger } from 'hamburger-react';
import CheckInDrawer from 'components/pages/check-in/CheckInDrawer/CheckInDrawer';
import cx from 'classnames';
import { useHideOnScroll } from 'utils/hooks/useHideOnScroll';
import useOutsideAlerter from 'utils/hooks/useOutsideAlerter';
import { offerList, selectedOfferOption } from 'storage/offers.storage';
import { CustomDrawer } from '../CustomDrawer/CustomDrawer';
import { selectedRestaurantStorage } from 'storage/table-reservation.storage';
import { ASSETS_URL } from 'core/graphql/endpoints';
import { useConfig } from 'utils/hooks/useConfiguration';
import { useLocale, useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { activeModule, diningOptionList } from 'utils/functions';
import { CHECK_IN, POST, PRE, hamburgerMenuset } from 'utils/constants';
import { IBottomMenuProps } from './BottomMenu.types';
import {
  IDiningMenuStorageData,
  diningCategoryStorage,
  diningMenuStorage,
} from 'storage/dining-menu.storage';
import { diningInformationStorage } from 'storage/dining.storage';
import MyOrders from '@icons/orderDish.svg';
import PoweredByHudiniIcon from '@icons/hudini.svg';
import CloseIcon from '@icons/closeIcon.svg';

export const BottomMenu: React.FC<IBottomMenuProps> = ({ disabled, amountDue }) => {
  const wrapperRef = useRef(null);
  const router = useRouter();
  const locale = useLocale();
  const isCheckedIn = useCheckedIn();
  const config = useConfig();
  const hotelId = config?.hotelId;
  const hotelName = config?.name;
  const hideOnScroll = useHideOnScroll();
  const hamburgerMenuStatus = useReactiveVar(toggleHamburgerMenuDrawer);
  const houseKeepingOptionSelected = useReactiveVar(housekeepingOptions);
  const diningOptionSelected = useReactiveVar(diningOptions);
  const offersOptionSelected: any = useReactiveVar(selectedOfferOption);
  const { t } = useTranslation(['common']);
  const spaInformation = useReactiveVar(spaInformationStorage);
  const hotelCompendiumSelected: any = useReactiveVar(selectedCompendiumCategory);
  const checkInModule: boolean = activeModule(config?.modules, CHECK_IN);
  const diningCategoryOptions = useReactiveVar(diningCategoryStorage);
  const hotelCompendiumInfo: any = useReactiveVar(getHotelCompendium);
  const spaCategories = useReactiveVar(spaCategoryList);
  const offersList = useReactiveVar(offerList);
  const serviceRequestOptions: any = useReactiveVar(serviceRequestOptionsArray);
  const diningData = useReactiveVar(diningMenuStorage) as IDiningMenuStorageData;
  const navigate = useLocalizedRouter();
  const homeActiveRef = useRef<boolean>();
  const homeActive: boolean | undefined = homeActiveRef.current;
  const restaurantAndBarsActive = router?.asPath?.includes(availablePaths?.RESTAURANTS_BARS);
  const irdActive = router?.asPath?.includes(availablePaths?.DINING);
  const housekeepingActive = router?.asPath?.includes(availablePaths.HOUSEKEEPING);
  const spaActive = router?.asPath?.includes(availablePaths?.SPA);
  const offersActive = router?.asPath?.includes(availablePaths?.OFFERS);
  const hotelCompendiumActive = router?.asPath?.includes(availablePaths?.HOTEL_COMPENDIUM);
  const checkOutActive = router?.asPath?.includes(availablePaths.BILL);
  const selectedDiningCategory = useReactiveVar(diningInformationStorage);

  useEffect(() => {
    homeActiveRef.current = router?.pathname === '/[locale]/[hotel]';
  }, [router?.pathname]);

  const { data } = useQuery<IGetHamburgerMenuDetailsApiResponse>(GET_HAMBURGER_MENU, {
    skip: !hotelId,
    context: { clientName: 'host_v4' },
    fetchPolicy: 'no-cache',
    variables: {
      hotelId: hotelId,
      lang: locale === 'en' ? '' : locale,
    },
  });

  const hamburger = data?.getUiBuilderHamburgerMenuDetails;

  const filteredOffersListInfo = Array.from(new Set(offersList?.map((item: any) => item?.type)));

  const filteredhotelCompendiumInfo = hotelCompendiumInfo?.categories?.filter((category: any) => {
    return hotelCompendiumInfo?.amenities?.find(
      (amenity: any) => amenity?.categoryIds.includes(category?.id) && amenity?.isActive,
    );
  });

  const openModuleOptionsDrawer = () => {
    if (checkOutActive && isCheckedIn?.checkedIn) {
      toggleDetailsDrawer(true);
    } else {
      if (!restaurantAndBarsActive) {
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

  const hamburgerMenuIcons =
    hamburger && (isCheckedIn?.checkedIn ? hamburger[POST] : hamburger[PRE]);

  const afterCheckinBottomArray = hamburgerMenuset;

  const hamburgerMenuRender = () => {
    return (
      <div ref={wrapperRef} className={cx(styles.hamburgerMenuWrapper)}>
        {!homeActive &&
          [hamburgerMenuIcons].map(
            (menuArray, index) =>
              menuArray &&
              menuArray.length > 0 && (
                <div
                  key={index}
                  className={cx(styles.hamburgerMenuContainer, {
                    [styles.divider]: index === 1 || index === 2,
                  })}
                >
                  {menuArray.map((hamburgerMenuElement) => (
                    <MenuItem
                      Icon={
                        (hamburgerMenuElement?.menuIconUrl &&
                          `${ASSETS_URL}/${hamburgerMenuElement?.menuIconUrl}`) ||
                        hamburgerIconsMap[
                          hamburgerMenuElement?.name as keyof typeof hamburgerIconsMap
                        ]
                      }
                      title={hamburgerMenuElement?.name}
                      key={hamburgerMenuElement?.id}
                      externalLink={hamburgerMenuElement?.externalLink}
                      flow={hamburgerMenuElement?.flow}
                      pages={hamburgerMenuElement?.pages}
                      redirectOptions={hamburgerMenuElement?.redirectOptions}
                      status={hamburgerMenuElement?.isActive}
                      toggleOption={closeHamburgerMenuDrawer}
                      hotelName={hotelName}
                    />
                  ))}
                </div>
              ),
          )}
        {[afterCheckinBottomArray].map(
          (menuArray, index) =>
            menuArray &&
            menuArray.length > 0 && (
              <div
                key={index}
                className={cx(styles.afterCheckinBottomArrayContainer, {
                  [styles.divider]: index === 1 || index === 2,
                })}
              >
                {menuArray?.map((hamburgerMenuElement) => (
                  <MenuItem
                    Icon={
                      (hamburgerMenuElement?.menuIconUrl &&
                        `${ASSETS_URL}/${hamburgerMenuElement?.menuIconUrl}`) ||
                      hamburgerIconsMap[
                        hamburgerMenuElement?.name as keyof typeof hamburgerIconsMap
                      ]
                    }
                    title={hamburgerMenuElement?.name}
                    key={hamburgerMenuElement?.name}
                    externalLink={hamburgerMenuElement?.externalLink}
                    flow={hamburgerMenuElement?.flow}
                    pages={hamburgerMenuElement?.pages}
                    redirectOptions={hamburgerMenuElement?.redirectOptions}
                    status={hamburgerMenuElement?.isActive}
                    toggleOption={closeHamburgerMenuDrawer}
                    hotelName={hotelName}
                    iconStyle={styles.iconStyle}
                  />
                ))}
              </div>
            ),
        )}
        <div className={styles.poweredByHudini}>
          <PoweredByHudiniIcon />
        </div>
      </div>
    );
  };

  const confirmOrder = useCallback(() => {
    navigate(availablePaths.DINING_ORDER_SUMMARY);
  }, [navigate]);

  const widgetStatus = useReactiveVar(toggleMessageBirdChat);

  const availableItems =
    homeActive ||
    (housekeepingActive && serviceRequestOptions?.length > 1) ||
    (offersActive && filteredOffersListInfo?.length > 1) ||
    (spaActive && spaCategories?.length > 1) ||
    (hotelCompendiumActive && filteredhotelCompendiumInfo?.length > 1) ||
    (irdActive && diningCategoryOptions?.length > 1);

  return (
    <>
      {(homeActive ||
        (restaurantAndBarsActive && diningOptionSelected?.type) ||
        (housekeepingActive && houseKeepingOptionSelected?.title) ||
        (spaActive && spaInformation?.selectedSpaCategoryName) ||
        (offersActive && offersOptionSelected?.type) ||
        (hotelCompendiumActive && hotelCompendiumSelected?.name) ||
        checkOutActive ||
        (irdActive && selectedDiningCategory?.menuName)) && (
        <div
          className={cx(styles.bottomMenuWrapper, {
            [styles.hideOnScroll]:
              hideOnScroll && (irdActive ? diningData?.items?.length === 0 : true),
          })}
        >
          <StyledButton
            disabled={disabled}
            variant='contained'
            className={cx(styles.bottomMenuButton, 'globals-bottomMenuButton', {
              [styles.bottomMenuButtonWithoutArrow]: homeActive || !(checkOutActive || homeActive),
            })}
            onClick={() => {
              availableItems && openModuleOptionsDrawer();
            }}
          >
            <span className={styles.btnText}>
              {homeActive &&
                (isCheckedIn?.checkedIn ? `${t('Room')} ${isCheckedIn?.roomNumber}` : t('Explore'))}
              {restaurantAndBarsActive && t(diningOptionList(diningOptionSelected?.type))}
              {irdActive && t(`${selectedDiningCategory?.menuName}`)}
              {housekeepingActive && t(`${houseKeepingOptionSelected?.title}`)}
              {spaActive && t(`${spaInformation?.selectedSpaCategoryName}`)}
              {offersActive && t(`${offersOptionSelected?.type}`)}
              {hotelCompendiumActive && hotelCompendiumSelected?.name}
              {checkOutActive &&
                (checkInModule
                  ? amountDue
                    ? t('Checkout')
                    : t('Pay & Checkout')
                  : t('Disconnect Room'))}
            </span>

            {availableItems && (
              <span className={styles.expandArrow}>
                <DownArrowIcon />
              </span>
            )}
          </StyledButton>

          {irdActive && diningData?.items?.length > 0 && (
            <div className={styles.orderIconWrapper} onClick={confirmOrder}>
              <MyOrders className={styles.myOrdersIcon} />
              <p className={styles.myOrdersLength}>{diningData?.items?.length}</p>
            </div>
          )}

          <div className={styles.hamburgerIcon}>
            <Hamburger
              distance={'sm'}
              rounded
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
      )}

      {widgetStatus && (
        <CloseIcon
          className={styles.closeWidgetIcon}
          onClick={() => {
            if ((window as any).MessageBirdChatWidget) {
              (window as any).MessageBirdChatWidget.toggleChat(false);
            }
            toggleMessageBirdChat(false);
          }}
        />
      )}

      <ModuleOptionsDrawer
        {...{
          homeActive,
          irdActive,
          housekeepingActive,
          hotelCompendiumActive,
          spaActive,
          offersActive,
          restaurantAndBarsActive,
          diningCategoryOptions,
          hamburger,
          filteredhotelCompendiumInfo,
          spaCategories,
          offersList,
          serviceRequestOptions,
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
