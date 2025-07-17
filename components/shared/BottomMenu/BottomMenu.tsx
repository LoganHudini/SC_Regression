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
  hotelInfoStorage,
  selectedCompendiumCategory,
  toggleCheckInDetailsDrawer,
  toggleDetailsDrawer,
  toggleHamburgerMenuDrawer,
  toggleMessageBirdChat,
  toggleModuleOptionsDrawer,
  isGetStarted,
} from 'storage/home.storage';
import {
  GET_HAMBURGER_MENU,
  IGetHamburgerMenuDetailsApiResponse,
} from 'core/graphql/queries/GET_HAMBURGER_MENU';
import { hamburgerIconsMap } from 'utils/hamburger/hamburgerIconsMap';
import { availablePaths } from 'utils/availablePaths';
import { useRouter } from 'next/router';
import { housekeepingOptions, serviceRequestOptionsArray } from 'storage/housekeeping.storage';
import { activeCheckInFlow, useCheckedIn } from 'storage/check-in.storage';
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
import { activeModule, diningOptionList, getHamburgerIcons } from 'utils/functions';
import { CHECK_IN, MESSAGE_BOX, URL, PAIR_TO_ROOM, CHECKOUT_TEXT } from 'utils/constants';
import { IBottomMenuProps } from './BottomMenu.types';
import {
  IDiningMenuStorageData,
  diningCategoryStorage,
  diningMenuStorage,
} from 'storage/dining-menu.storage';
import { diningInformationStorage } from 'storage/dining.storage';
import MyOrders from '@icons/orderDish.svg';
import CloseIcon from '@icons/closeIcon.svg';
import HamburgerIcon from '@icons/hamburger.svg';
import { GET_MESSAGEBOX_URL } from 'core/graphql/queries/GET_MESSAGEBOX_URL';
import { client } from 'core/graphql/client';
import { messageBoxURL } from 'storage/chats';

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
  const hotelInfo = useReactiveVar(hotelInfoStorage);
  const { t } = useTranslation(['common']);
  const spaInformation = useReactiveVar(spaInformationStorage);
  const hotelCompendiumSelected: any = useReactiveVar(selectedCompendiumCategory);
  const checkInModule: boolean = activeModule(config?.modules, CHECK_IN);
  const pairToRoomModule: boolean = activeModule(config?.modules, PAIR_TO_ROOM);
  const checkOutModule: boolean = activeModule(config?.modules, CHECKOUT_TEXT);
  const diningCategoryOptions = useReactiveVar(diningCategoryStorage);
  const hotelCompendiumInfo: any = useReactiveVar(getHotelCompendium);
  const spaCategories = useReactiveVar(spaCategoryList);
  const offersList = useReactiveVar(offerList);
  const serviceRequestOptions: any = useReactiveVar(serviceRequestOptionsArray);
  const diningData = useReactiveVar(diningMenuStorage) as IDiningMenuStorageData;
  const getTotalItems = diningData?.items?.reduce((total, item) => total + (item.quantity || 0), 0);
  const navigate = useLocalizedRouter();
  const homeActiveRef = useRef<boolean>();
  const homeActive: boolean | undefined = homeActiveRef.current;
  const restaurantAndBarsActive = router?.asPath?.includes(availablePaths?.RESTAURANTS_BARS);
  const irdActive = router?.asPath?.includes(availablePaths?.DINING);
  const housekeepingActive = router?.asPath?.includes(availablePaths.HOUSEKEEPING);
  const spaActive = router?.asPath === `/${router?.query?.locale}${availablePaths?.SPA}/`;
  const spaInfoActive = router?.asPath === `/${router?.query?.locale}${availablePaths?.SPA_INFO}/`;
  const itineraryActive =
    router?.asPath === `/${router?.query?.locale}${availablePaths?.ITINERARY}/`;
  const offersActive = router?.asPath?.includes(availablePaths?.OFFERS);
  const hotelCompendiumActive = router?.asPath?.includes(availablePaths?.HOTEL_COMPENDIUM);
  const checkOutActive = router?.asPath?.includes(availablePaths.BILL);
  const selectedDiningCategory = useReactiveVar(diningInformationStorage);
  const webUrl = hotelInfo?.getPropertyDetailsByHotelId?.hotel?.information?.find(
    (url: any) => url?.type === URL,
  );

  useEffect(() => {
    homeActiveRef.current = router?.pathname === '/[locale]/[hotel]';
  }, [router?.pathname]);

  const { data } = useQuery<IGetHamburgerMenuDetailsApiResponse>(GET_HAMBURGER_MENU, {
    skip: !hotelId,
    context: { clientName: 'property_e' },
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

  useOutsideAlerter(wrapperRef);

  const hamburgerMenuRender = () => {
    let hamburgerMenuItems: any = [];
    const HamburgerIconItems =
      config?.languages && config?.languages?.length > 1 ? getHamburgerIcons() : [];

    if (isCheckedIn?.checkedIn) {
      hamburgerMenuItems = hamburger && hamburger?.post?.concat(HamburgerIconItems);
    } else {
      hamburgerMenuItems = hamburger && hamburger?.pre?.concat(HamburgerIconItems);
    }

    return (
      <div ref={wrapperRef} className={cx(styles.hamburgerMenuContainer)}>
        {hamburgerMenuItems?.map((hamburgerMenuElement: any, index: number) => (
          <MenuItem
            Icon={
              (hamburgerMenuElement?.menuIconUrl &&
                `${ASSETS_URL}/${hamburgerMenuElement?.menuIconUrl}`) ||
              hamburgerIconsMap[hamburgerMenuElement.name as keyof typeof hamburgerIconsMap] ||
              HamburgerIcon
            }
            title={hamburgerMenuElement.name}
            key={hamburgerMenuElement.id + index}
            externalLink={hamburgerMenuElement.externalLink}
            flow={hamburgerMenuElement.flow}
            pages={hamburgerMenuElement.pages}
            redirectOptions={hamburgerMenuElement.redirectOptions}
            status={hamburgerMenuElement.isActive}
            toggleOption={closeHamburgerMenuDrawer}
            hotelName={hotelName}
          />
        ))}
      </div>
    );
  };

  const confirmOrder = useCallback(() => {
    navigate(availablePaths.DINING_ORDER_SUMMARY);
  }, [navigate]);

  const widgetStatus = useReactiveVar(toggleMessageBirdChat);

  const availableItems =
    (homeActive && isCheckedIn?.checkedIn) ||
    (housekeepingActive && serviceRequestOptions?.length > 1) ||
    (offersActive && filteredOffersListInfo?.length > 1) ||
    (spaActive && spaCategories?.length > 1) ||
    (hotelCompendiumActive && filteredhotelCompendiumInfo?.length > 1) ||
    (irdActive && diningCategoryOptions?.length > 1) ||
    checkOutActive;

  const fetchMessageBoxUrl = async () => {
    try {
      const data = await client.mutate({
        mutation: GET_MESSAGEBOX_URL,
        context: { clientName: 'integration_h' },
        fetchPolicy: 'network-only',
        variables: {
          roomNo: isCheckedIn?.roomNumber,
        },
      });
      data?.data?.generateChatUrl?.url && messageBoxURL(data?.data?.generateChatUrl?.url);
    } catch (err) {
      messageBoxURL(null);
    }
  };

  return (
    <>
      {(homeActive ||
        (restaurantAndBarsActive && diningOptionSelected?.type) ||
        (housekeepingActive && houseKeepingOptionSelected?.title) ||
        (spaActive && spaInformation?.selectedSpaCategoryName) ||
        (offersActive && offersOptionSelected?.type) ||
        (hotelCompendiumActive && hotelCompendiumSelected?.name) ||
        spaInfoActive ||
        checkOutActive ||
        itineraryActive ||
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
              availableItems
                ? openModuleOptionsDrawer()
                : homeActive
                ? config?.preCheckInOnly && isCheckedIn?.preCheckedIn
                  ? webUrl?.value
                    ? window.open(webUrl?.value)
                    : null
                  : checkInModule
                  ? (toggleCheckInDetailsDrawer(true), isGetStarted(false), activeCheckInFlow(true))
                  : pairToRoomModule
                  ? (toggleCheckInDetailsDrawer(true),
                    isGetStarted(false),
                    activeCheckInFlow(false))
                  : webUrl?.value
                  ? window.open(webUrl?.value)
                  : null
                : null;
            }}
          >
            <span className={styles.btnText}>
              {homeActive &&
                (isCheckedIn?.checkedIn
                  ? `Room ${isCheckedIn?.roomNumber}`
                  : config?.preCheckInOnly && isCheckedIn?.preCheckedIn
                  ? webUrl?.value
                    ? t('Visit Website')
                    : t('Home')
                  : checkInModule
                  ? config?.preCheckInOnly
                    ? t('Pre-Register')
                    : t('Check-In')
                  : pairToRoomModule
                  ? t('Connect to room')
                  : webUrl?.value
                  ? t('Visit Website')
                  : t('Home'))}
              {restaurantAndBarsActive && t(diningOptionList(diningOptionSelected?.type))}
              {itineraryActive && t('Explore Activities')}
              {irdActive && t(`${selectedDiningCategory?.menuName}`)}
              {housekeepingActive && t(`${houseKeepingOptionSelected?.title}`)}
              {spaActive && t(`${spaInformation?.selectedSpaCategoryName}`)}
              {spaInfoActive && t('Spa')}
              {offersActive && t(`${offersOptionSelected?.type}`)}
              {hotelCompendiumActive && hotelCompendiumSelected?.name}
              {checkOutActive
                ? !checkOutModule && pairToRoomModule
                  ? t('Disconnect Room')
                  : checkOutModule && amountDue
                  ? t('Pay & Checkout')
                  : t('Checkout')
                : null}
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
              <p className={styles.myOrdersLength}>{getTotalItems && getTotalItems}</p>
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
                  if (isCheckedIn?.roomNumber && config?.chatOption === MESSAGE_BOX) {
                    fetchMessageBoxUrl();
                  }
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
