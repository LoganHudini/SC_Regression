import React, { useCallback, useState } from 'react';
import styles from './MenuItem.module.scss';
import { IMenuItemProps, IModuleOptionsDrawerProps } from './MenuItem.types';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { getRedirectLink } from 'utils/getRedirectLink';
import { flowPathMap } from 'utils/flowPathMap';
import { useReactiveVar } from '@apollo/client';
import {
  diningOptions,
  getHotelCompendium,
  selectedCompendiumCategory,
  toggleHamburgerMenuDrawer,
  toggleModuleOptionsDrawer,
  toggleHotelInfoDrawer,
  toggleMapState,
  diningHeaders,
  toggleMessageBirdChat,
} from 'storage/home.storage';
import cx from 'classnames';
import {
  CHAT_FLOW,
  CHECK_IN,
  EXTERNAL,
  FLOW,
  HOTEL_INFORMATION_FLOW,
  IN_APP,
  IN_ROOM_DINING,
} from 'utils/constants';
import CheckIcon from '@icons/checkIcon.svg';
import { housekeepingOptions, serviceRequestOptionsArray } from 'storage/housekeeping.storage';
import { spaCategoryList, spaInformationStorage } from 'storage/spa.storage';
import { offerList, selectedOfferOption } from 'storage/offers.storage';
import { useTranslation } from 'react-i18next';
import HotelInfoDrawer from 'components/pages/home/HotelInformation/HotelInfoDrawer/HotelInfoDrawer';
import { CustomDrawer } from 'components/shared/CustomDrawer/CustomDrawer';
import { availablePaths } from 'utils/availablePaths';
import { useCheckedIn } from 'storage/check-in.storage';
import { ReactSVG } from 'react-svg';
import { isFunction } from 'lodash';
import { selectedRestaurantStorage } from 'storage/table-reservation.storage';
import { getHotelCode } from 'utils/fetchConfigs';
import { activeModule, diningOptionList } from 'utils/functions';
import { useConfig } from 'utils/hooks/useConfiguration';
import { setHighLightCheckOut } from 'storage/menu-item';
import { IframeComponent } from 'components/shared/IframeComponent/IframeComponent';

export const MenuItem: React.FC<IMenuItemProps> = ({
  title,
  Icon,
  externalLink,
  flow,
  pages,
  redirectOptions,
  paths,
  status,
  hotelName,
  toggleOption,
}) => {
  const navigate = useLocalizedRouter();
  const [externalURL, setExternalURL] = useState<boolean>(false);
  const closeBooking = () => {
    setExternalURL(false);
  };
  const onClick = useCallback(() => {
    if (redirectOptions === EXTERNAL) {
      setExternalURL(true);
      toggleOption();
    }
    if (redirectOptions === IN_APP && paths) {
      const redirectUrl = getRedirectLink(paths, pages[0]);
      if (redirectUrl) {
        navigate(`/${redirectUrl}`);
        toggleOption();
      }
    }
    if (redirectOptions === FLOW) {
      const redirectUrl = flowPathMap[flow as keyof typeof flowPathMap];
      if (redirectUrl) {
        toggleOption();
        navigate(redirectUrl);
      } else if (flow === HOTEL_INFORMATION_FLOW) {
        toggleOption();
        toggleMapState(true);
        toggleHotelInfoDrawer(true);
      } else if (flow === CHAT_FLOW) {
        if ((window as any).MessageBirdChatWidget) {
          (window as any).MessageBirdChatWidget.toggleChat(true);
        }
        toggleMessageBirdChat(true);
        toggleOption();
      }
    }
  }, [flow, navigate, pages, paths, redirectOptions, toggleOption]);

  return (
    <>
      {externalURL && (
        <CustomDrawer
          open={externalURL}
          onClose={closeBooking}
          content={
            <IframeComponent
              src={externalLink}
              handledrawerState={setExternalURL}
              name={hotelName || title}
            />
          }
          isIframe={true}
        />
      )}
      {status && (
        <div onClick={onClick} className={styles.menuItemWrapper}>
          <div className={styles.menuItemIconWrapper}>
            <div>
              {Icon && isFunction(Icon) ? (
                <Icon className={styles.imageIcon} />
              ) : (
                <ReactSVG src={Icon} className={styles.image} />
              )}
            </div>
          </div>
          <p className={styles.menuItemTitle}>{title}</p>
        </div>
      )}
    </>
  );
};

export const ModuleOptionsDrawer: React.FC<IModuleOptionsDrawerProps> = ({
  homeActive,
  irdActive,
  housekeepingActive,
  hotelCompendiumActive,
  spaActive,
  offersActive,
}) => {
  const hotel = getHotelCode();

  const navigate = useLocalizedRouter();
  const isCheckedIn = useCheckedIn();
  const config = useConfig();
  const [highLightIRD, setHighLightIRD] = useState(false);
  const [highLightServices, setHighLightServices] = useState(false);
  const diningOptionSelected = useReactiveVar(diningOptions);
  const irdOption = useReactiveVar(diningHeaders);
  const houseKeepingOptionSelected = useReactiveVar(housekeepingOptions);
  const serviceRequestOptions: any = useReactiveVar(serviceRequestOptionsArray);
  const drawerStatus = useReactiveVar(toggleModuleOptionsDrawer);
  const compendiumInfo: any = useReactiveVar(getHotelCompendium);
  const selectedCompendiumInfo: any = useReactiveVar(selectedCompendiumCategory);
  const spaInformation = useReactiveVar(spaInformationStorage);
  const spaCategories = useReactiveVar(spaCategoryList);
  const offersOptionSelected: any = useReactiveVar(selectedOfferOption);
  const offersList = useReactiveVar(offerList);
  const highLightCheckOut = useReactiveVar(setHighLightCheckOut);

  const { t } = useTranslation(['common']);
  const checkinModule: boolean = activeModule(config?.modules, CHECK_IN);

  const filteredDetails = compendiumInfo?.categories?.filter((category: any) => {
    return compendiumInfo?.amenities?.find(
      (amenity: any) => amenity?.categoryIds.includes(category?.id) && amenity?.isActive,
    );
  });

  const closeDrawer = () => {
    toggleModuleOptionsDrawer(false);
    toggleHamburgerMenuDrawer(false);
  };

  const handleSelect = (data: any) => {
    selectedCompendiumCategory(data);
    closeDrawer();
  };

  const modulesOptionsRender = () => {
    return (
      <div className={styles.wrapper}>
        {' '}
        {homeActive && (
          <div>
            {isCheckedIn?.roomNumber && (
              <p className={styles.title}>Room {isCheckedIn?.roomNumber}</p>
            )}
            <div className={styles.optionsList}>
              <>
                <p
                  className={cx(styles.inActiveText, {
                    [styles.activeText]: highLightIRD,
                  })}
                  onClick={() => {
                    setHighLightIRD(true);
                    setHighLightCheckOut(false);
                    navigate(availablePaths.DINING);
                    closeDrawer();
                  }}
                >
                  {t('In-Room Dining')}
                </p>
                <p
                  className={cx(styles.inActiveText, {
                    [styles.activeText]: highLightServices,
                  })}
                  onClick={() => {
                    setHighLightServices(true);
                    setHighLightCheckOut(false);
                    navigate(availablePaths.HOUSEKEEPING);
                    closeDrawer();
                  }}
                >
                  {t('Services')}
                </p>
                <div className={styles.optionsListItem}>
                  <p
                    className={cx(styles.inActiveDiningText, {
                      [styles.activeText]: highLightCheckOut,
                    })}
                    onClick={() => {
                      setHighLightCheckOut(true);
                      navigate(availablePaths.BILL);
                      closeDrawer();
                    }}
                  >
                    {t('Stay Summary')}
                  </p>
                  {highLightCheckOut && <CheckIcon className={styles.icon} />}
                </div>
              </>
            </div>
          </div>
        )}
        {irdActive && (
          <div>
            <p className={styles.title}>{t('In-Room Dining')}</p>
            <div className={styles.optionsList}>
              {irdOption?.map((dining: any, index: any) => (
                <div key={index} className={cx(styles.optionsListItem)}>
                  <p
                    className={cx(styles.inActiveDiningText, {
                      [styles.activeText]:
                        diningOptionSelected?.type === dining?.type || irdOption?.length === 1,
                    })}
                    onClick={() => {
                      selectedRestaurantStorage({});
                      diningOptions(dining);
                      closeDrawer();
                      dining?.type === IN_ROOM_DINING
                        ? navigate(availablePaths.DINING)
                        : navigate(availablePaths.RESTAURANTS_BARS);
                    }}
                  >
                    {diningOptionList(dining?.type)}{' '}
                  </p>
                  {(diningOptionSelected?.type === dining?.type || irdOption?.length === 1) && (
                    <CheckIcon className={styles.icon} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {housekeepingActive && (
          <div>
            <p className={styles.title}>{t('Services')} </p>
            <div className={styles.optionsList}>
              {serviceRequestOptions?.map((request: any, index: number) => (
                <div key={index} className={cx(styles.optionsListItem)}>
                  {request?.id && (
                    <>
                      <p
                        className={cx(styles.inActiveDiningText, {
                          [styles.activeText]: houseKeepingOptionSelected?.id === request?.id,
                        })}
                        onClick={() => {
                          housekeepingOptions(request);
                          closeDrawer();
                        }}
                      >
                        {request?.title}{' '}
                      </p>
                      {houseKeepingOptionSelected?.id === request?.id && (
                        <CheckIcon className={styles.icon} />
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {hotelCompendiumActive && (
          <div>
            <p className={styles.title}>{t('Things To Do')}</p>
            <div className={styles.optionsList}>
              {filteredDetails?.map((category: any, index: any) => (
                <div key={index} className={cx(styles.optionsListItem)}>
                  <p
                    className={cx(styles.inActiveDiningText, {
                      [styles.activeText]: selectedCompendiumInfo?.id === category?.id,
                    })}
                    onClick={() => handleSelect(category)}
                  >
                    {category?.name}{' '}
                  </p>
                  {selectedCompendiumInfo?.id === category?.id && (
                    <CheckIcon className={styles.icon} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {spaActive && (
          <div>
            <p className={styles.title}>{t('Spa & Wellness')}</p>
            <div className={styles.optionsList}>
              {spaCategories?.map((category: any, index: number) => (
                <div key={index} className={cx(styles.optionsListItem)}>
                  <p
                    className={cx(styles.inActiveDiningText, {
                      [styles.activeText]: category?.id === spaInformation?.selectedSpaCategoryId,
                    })}
                    onClick={() => {
                      closeDrawer();
                      spaInformationStorage({
                        ...spaInformation,
                        selectedSpaCategoryId: category?.id,
                        selectedSpaCategoryName: category?.name,
                      });
                    }}
                  >
                    {category?.name}{' '}
                  </p>
                  {category?.id === spaInformation?.selectedSpaCategoryId && (
                    <CheckIcon className={styles.icon} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {offersActive && (
          <div>
            <p className={styles.title}>{t('Offers')}</p>
            <div className={styles.optionsList}>
              {Array.from(new Set(offersList?.map((item: any) => item?.type))).map((type) => {
                return (
                  <div key={type} className={cx(styles.optionsListItem)}>
                    <p
                      className={cx(styles.inActiveDiningText, {
                        [styles.activeText]: offersOptionSelected?.type === type,
                      })}
                      onClick={() => {
                        selectedOfferOption({ type });
                        closeDrawer();
                      }}
                    >
                      {type}{' '}
                    </p>
                    {offersOptionSelected?.type === type && <CheckIcon className={styles.icon} />}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <CustomDrawer open={drawerStatus} onClose={closeDrawer} content={modulesOptionsRender()} />
      <HotelInfoDrawer />
    </>
  );
};
