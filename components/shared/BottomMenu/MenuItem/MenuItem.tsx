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
  toggleCheckInDetailsDrawer,
  toggleDetailsDrawer,
  toggleNotification,
} from 'storage/home.storage';
import cx from 'classnames';
import {
  ABOUT_US,
  CHECK_IN,
  EXTERNAL,
  FAILURE,
  FLOW,
  IN_APP,
  IN_ROOM_DINING,
  LANGUAGE,
  LANGUAGES,
  PAIR_TO_ROOM,
  SUCCESS,
} from 'utils/constants';
import CheckIcon from '@icons/checkIcon.svg';
import { housekeepingOptions, serviceRequestOptionsArray } from 'storage/housekeeping.storage';
import { spaCategoryList, spaInformationStorage } from 'storage/spa.storage';
import { offerList, selectedOfferOption } from 'storage/offers.storage';
import { useTranslation } from 'react-i18next';
import HotelInfoDrawer from 'components/pages/home/HotelInformation/HotelInfoDrawer/HotelInfoDrawer';
import { CustomDrawer } from 'components/shared/CustomDrawer/CustomDrawer';
import { availablePaths } from 'utils/availablePaths';
import { activeCheckInFlow, useCheckedIn } from 'storage/check-in.storage';
import { ReactSVG } from 'react-svg';
import { isFunction } from 'lodash';
import { selectedRestaurantStorage } from 'storage/table-reservation.storage';
import { activeModule, diningOptionList } from 'utils/functions';
import { useConfig } from 'utils/hooks/useConfiguration';
import { IframeComponent } from 'components/shared/IframeComponent/IframeComponent';
import { diningInformationStorage } from 'storage/dining.storage';
import { useRouter } from 'next/router';
import { checkoutTrip } from 'storage/trips.storage';
import { Notification } from 'components/shared/Notification/Notification';

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
  iconStyle,
}) => {
  const navigate = useLocalizedRouter();
  const { t } = useTranslation(['common']);
  const router = useRouter();
  const [externalURL, setExternalURL] = useState<boolean>(false);
  const [openLanguage, setOpenLanguage] = useState<boolean>(false);
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
      } else if (title === ABOUT_US) {
        toggleOption();
        toggleMapState(true);
        toggleHotelInfoDrawer(true);
      } else if (title === LANGUAGE) {
        toggleOption();
        setOpenLanguage(true);
      }
    }
  }, [flow, navigate, pages, paths, redirectOptions, title, toggleOption]);

  const renderLanguage = () => (
    <div className={styles.wrapper}>
      <p className={styles.title}>{t('Choose Your Language')}</p>
      <div className={styles.optionsList}>
        {LANGUAGES?.map((language, index) => (
          <div key={index} className={cx(styles.optionsListItem)}>
            <p
              className={cx(styles.inActiveDiningText, {
                [styles.activeText]: language?.code === router?.query?.locale,
              })}
              onClick={async () => {
                setOpenLanguage(false);
                await router.push(`/${language?.code}/${router?.asPath?.slice(4)}`);
              }}
            >
              {/* translation is not required  */}
              {language?.name}
            </p>
            {language?.code === router?.query?.locale && <CheckIcon className={styles.icon} />}
          </div>
        ))}
      </div>
    </div>
  );

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
        <div
          onClick={onClick}
          className={cx(
            styles.menuItemWrapper,
            iconStyle,
            {
              [styles.itemWidth]: !iconStyle,
            },
            'globals-menuItemWrapper',
          )}
        >
          <div className={styles.menuItemIconWrapper}>
            {Icon && isFunction(Icon) ? (
              <Icon className={styles.imageIcon} />
            ) : (
              <ReactSVG src={Icon} className={styles.image} />
            )}
          </div>
          <p className={cx(styles.menuItemTitle, { [styles.fixedMenutitle]: iconStyle })}>
            {t(`${title}`)}
          </p>
        </div>
      )}
      <CustomDrawer
        open={openLanguage}
        content={renderLanguage()}
        onClose={() => setOpenLanguage(false)}
      />
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
  restaurantAndBarsActive,
  diningCategoryOptions,
  hamburger,
  path,
}) => {
  const { t } = useTranslation(['common']);
  const navigate = useLocalizedRouter();
  const isCheckedIn = useCheckedIn();
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
  const selectedCategoryList = useReactiveVar(diningInformationStorage);
  const offersOptionSelected: any = useReactiveVar(selectedOfferOption);
  const offersList = useReactiveVar(offerList);
  const [externalURL, setExternalURL] = useState<boolean>(false);
  const [externalLink, setExternalLink] = useState<any>();
  const [moduleTitle, setModuleTitle] = useState<any>();
  const [errorToggle, setErrorToggle] = useState<any>();
  const config = useConfig();
  const hotelName = config?.name;

  const checkInModule: boolean = activeModule(config?.modules, CHECK_IN);
  const pairToRoomModule: boolean = activeModule(config?.modules, PAIR_TO_ROOM);

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

  const moduleHandler = (module: any) => {
    if (module.redirectOptions === EXTERNAL) {
      setModuleTitle(module?.name);
      setExternalLink(module?.externalLink);
      setExternalURL(true);
      closeDrawer();
    }
    if (module.redirectOptions === IN_APP && path) {
      const redirectUrl = getRedirectLink(path, module.pages[0]);
      if (redirectUrl) {
        navigate(`/${redirectUrl}`);
        closeDrawer();
      }
    }
    if (module.redirectOptions === FLOW) {
      const redirectUrl = flowPathMap[module.flow as keyof typeof flowPathMap];
      if (redirectUrl) {
        closeDrawer();
        navigate(redirectUrl);
      } else if (module.name === ABOUT_US) {
        closeDrawer();
        toggleMapState(true);
        toggleHotelInfoDrawer(true);
      }
    }
  };

  const modulesOptionsRender = () => {
    return (
      <div className={styles.wrapper}>
        {' '}
        {homeActive && (
          <div>
            {isCheckedIn?.roomNumber && (
              <p className={styles.title}>{`${t('Room')} ${isCheckedIn?.roomNumber}`}</p>
            )}
            <div className={styles.optionsList}>
              <>
                {checkInModule && !isCheckedIn?.checkedIn && (
                  <p
                    className={cx(styles.inActiveText)}
                    onClick={() => {
                      toggleCheckInDetailsDrawer(true);
                      closeDrawer();
                      activeCheckInFlow(true);
                    }}
                  >
                    {t('Check-In')}
                  </p>
                )}

                {pairToRoomModule && !isCheckedIn?.checkedIn && (
                  <p
                    className={cx(styles.inActiveText)}
                    onClick={() => {
                      toggleCheckInDetailsDrawer(true);
                      closeDrawer();
                      activeCheckInFlow(false);
                    }}
                  >
                    {t('Pair to Room')}
                  </p>
                )}

                {hamburger &&
                  hamburger[isCheckedIn?.checkedIn ? 'post' : 'pre']?.map(
                    (moduleItem: any, index: any) => (
                      <p
                        className={cx(styles.inActiveText, {
                          [styles.activeText]: highLightServices,
                        })}
                        onClick={() => {
                          moduleHandler(moduleItem);
                        }}
                        key={index}
                      >
                        {t(moduleItem?.name)}
                      </p>
                    ),
                  )}

                {pairToRoomModule && isCheckedIn?.checkedIn && (
                  <p
                    className={cx(styles.inActiveText)}
                    onClick={() => {
                      closeDrawer();
                      setTimeout(() => {
                        checkoutTrip();
                      }, 5000);
                      setErrorToggle({
                        state: false,
                        message: t('Device Disconnected!'),
                        type: 'home',
                        description: t(
                          'Hope you had a pleasant stay with us. We look forward to your next visit.\nThank You.',
                        ),
                      });
                      toggleNotification(true);
                      toggleDetailsDrawer(false);
                    }}
                  >
                    {t('Unpair My Room')}
                  </p>
                )}
              </>
            </div>
          </div>
        )}
        {restaurantAndBarsActive && (
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
                    {t(`${diningOptionList(dining?.type)}`)}{' '}
                  </p>
                  {(diningOptionSelected?.type === dining?.type || irdOption?.length === 1) && (
                    <CheckIcon className={styles.icon} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {irdActive && (
          <div>
            <p className={styles.title}>{t('Choose your category')}</p>
            <div className={styles.optionsList}>
              {diningCategoryOptions?.map((dining: any, index: any) => (
                <div key={index} className={cx(styles.optionsListItem)}>
                  <p
                    className={cx(styles.inActiveDiningText, {
                      [styles.activeText]:
                        selectedCategoryList?.menuName === dining?.name ||
                        diningCategoryOptions?.length === 1,
                    })}
                    onClick={() => {
                      diningInformationStorage({
                        selectedMenu: dining?.id,
                        menuName: dining?.name,
                      });
                      closeDrawer();
                    }}
                  >
                    {dining?.name}
                  </p>
                  {(selectedCategoryList?.menuName === dining?.name ||
                    diningCategoryOptions?.length === 1) && <CheckIcon className={styles.icon} />}
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
                        {`${t(request?.title)}`}{' '}
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
        {externalURL && (
          <CustomDrawer
            open={externalURL}
            onClose={closeDrawer}
            content={
              <IframeComponent
                src={externalLink}
                handledrawerState={setExternalURL}
                name={hotelName || moduleTitle}
              />
            }
            isIframe={true}
          />
        )}
      </div>
    );
  };

  return (
    <>
      <CustomDrawer open={drawerStatus} onClose={closeDrawer} content={modulesOptionsRender()} />
      <HotelInfoDrawer />
      <Notification
        title={errorToggle?.message}
        description={errorToggle?.description}
        type={errorToggle?.state ? FAILURE : SUCCESS}
        redirect={errorToggle?.type === 'home' ? availablePaths?.HOME : null}
      />
    </>
  );
};
