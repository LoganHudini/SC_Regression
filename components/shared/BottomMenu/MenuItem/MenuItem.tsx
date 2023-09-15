import React, { useCallback, useState } from 'react';
import styles from './MenuItem.module.scss';
import { IMenuItemProps, IModuleOptionsDrawerProps } from './MenuItem.types';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { getRedirectLink } from 'utils/getRedirectLink';
import { flowPathMap } from 'utils/flowPathMap';
import Drawer from '@mui/material/Drawer';
import { useReactiveVar } from '@apollo/client';
import {
  diningOptions,
  getHotelCompendium,
  selectedCompendiumCategory,
  toggleHamburgerMenuDrawer,
  toggleModuleOptionsDrawer,
  toggleHotelInfoDrawer,
} from 'storage/home.storage';
import cx from 'classnames';
import {
  ABOUT_US,
  DINING_OPTIONS,
  EXTERNAL,
  FLOW,
  IN_APP,
  SERVICE_REQUEST_OPTIONS,
} from 'utils/constants';
import CheckIcon from '@icons/checkIcon.svg';
import { housekeepingOptions } from 'storage/housekeeping.storage';
import { handleTouchEnd, handleTouchStart } from 'utils/hooks/useDrawerSwipe';
import { spaInformationStorage } from 'storage/spa.storage';
import { offerList, selectedOfferOption } from 'storage/offers.storage';
import { useTranslation } from 'react-i18next';
import HotelInfoDrawer from 'components/pages/home/HotelInformation/HotelInfoDrawer/HotelInfoDrawer';

export const MenuItem: React.FC<IMenuItemProps> = ({
  title,
  Icon,
  externalLink,
  flow,
  pages,
  redirectOptions,
  paths,
  status,
  toggleOption,
}) => {
  const navigate = useLocalizedRouter();
  const onClick = useCallback(() => {
    if (redirectOptions === EXTERNAL) {
      window.open(externalLink, '_blank');
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
        toggleHotelInfoDrawer(true);
      }
    }
  }, [externalLink, flow, navigate, pages, paths, redirectOptions, title, toggleOption]);

  return (
    <>
      {status && (
        <div onClick={onClick} className={styles.menuItemWrapper}>
          <div className={styles.menuItemIconWrapper}>
            <Icon />
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
  offersActive
}) => {
  const navigate = useLocalizedRouter();
  const diningOptionSelected = useReactiveVar(diningOptions);
  const houseKeepingOptionSelected = useReactiveVar(housekeepingOptions);
  const drawerStatus = useReactiveVar(toggleModuleOptionsDrawer);
  const compendiumInfo: any = useReactiveVar(getHotelCompendium);
  const selectedCompendiumInfo: any = useReactiveVar(selectedCompendiumCategory);
  const spaInformation = useReactiveVar(spaInformationStorage);
  const offersOptionSelected: any = useReactiveVar(selectedOfferOption);
  const offersList = useReactiveVar(offerList);
  const [startY, setStartY] = useState(0);
  const { t } = useTranslation(['common']);

  const filteredDetails = compendiumInfo?.categories?.filter((category: any) => {
    return compendiumInfo?.amenities?.find(
      (amenity: any) => category?.id === amenity?.categoryIds[0] && amenity?.isActive,
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

  return (
    <>
      {' '}
      <Drawer
        variant='temporary'
        anchor='bottom'
        open={drawerStatus}
        onClose={closeDrawer}
        PaperProps={{
          elevation: 0,
          style: {
            padding: '2rem 0',
            maxWidth: '768px',
            margin: 'auto',
            maxHeight: '40vh',
          },
        }}
        onTouchStart={(e) => handleTouchStart(e, setStartY)}
        onTouchEnd={(e) => handleTouchEnd(e, startY, setStartY, closeDrawer)}
      >
        <div className={styles.drawerNotch}></div>
        {homeActive && (
          <div>
            <p className={styles.title}>Room 411</p>
            <div className={styles.optionsList}>
              <p
                className={cx(styles.inActiveText, {
                  [styles.activeText]: true,
                })}
              >
                {t('View Bill')}
              </p>
              <p
                className={cx(styles.inActiveText, {
                  [styles.activeText]: false,
                })}
              >
                {t('Checkout')}
              </p>
            </div>
          </div>
        )}

        {irdActive && (
          <div>
            <p className={styles.title}>{t('Choose your category')}</p>
            <div className={styles.optionsList}>
              {DINING_OPTIONS?.map((dining) => (
                <div key={dining?.id} className={cx(styles.optionsListItem)}>
                  <p
                    className={cx(styles.inActiveDiningText, {
                      [styles.activeText]: diningOptionSelected?.id === dining?.id,
                    })}
                    onClick={() => {
                      diningOptions(dining);
                      closeDrawer();
                      navigate(dining?.path);
                    }}
                  >
                    {dining?.title}{' '}
                  </p>
                  {diningOptionSelected?.id === dining?.id && <CheckIcon className={styles.icon} />}
                </div>
              ))}
            </div>
          </div>
        )}

        {housekeepingActive && (
          <div>
            <p className={styles.title}>{t('Choose your category')} </p>
            <div className={styles.optionsList}>
              {SERVICE_REQUEST_OPTIONS?.map((request) => (
                <div key={request?.id} className={cx(styles.optionsListItem)}>
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
                </div>
              ))}
            </div>
          </div>
        )}

        {hotelCompendiumActive && (
          <div>
            <p className={styles.title}>{t('Choose your category')}</p>
            <div className={styles.optionsList}>
              {filteredDetails?.map((category: any) => (
                <div key={category?.id} className={cx(styles.optionsListItem)}>
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
            <p className={styles.title}>{t('Choose your category')}</p>
            <div className={styles.optionsList}>
              <div className={cx(styles.optionsListItem)}>
                <p
                  className={cx(styles.inActiveDiningText, {
                    [styles.activeText]: true,
                  })}
                  onClick={() => {
                    closeDrawer();
                  }}
                >
                  {spaInformation?.selectedSpaCategoryName}{' '}
                </p>
                {true && <CheckIcon className={styles.icon} />}
              </div>
            </div>
          </div>
        )}
        {offersActive && (
          <div>
            <p className={styles.title}>{t('Choose your category')}</p>
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
      </Drawer>
      <HotelInfoDrawer />
    </>
  );
};
