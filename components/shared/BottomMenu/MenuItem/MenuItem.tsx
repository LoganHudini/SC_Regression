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
  toggleHamburgerMenuDrawer,
  toggleHotelInfoDrawer,
  toggleModuleOptionsDrawer,
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
import HotelInfoDrawer from 'components/pages/home/HotelInformation/HotelInfoDrawer/HotelInfoDrawer';
import { spaInformationStorage } from 'storage/spa.storage';

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
        title === ABOUT_US ? toggleHotelInfoDrawer(true) : navigate(redirectUrl);
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
  spaActive,
}) => {
  const navigate = useLocalizedRouter();
  const diningOptionSelected = useReactiveVar(diningOptions);
  const houseKeepingOptionSelected = useReactiveVar(housekeepingOptions);
  const drawerStatus = useReactiveVar(toggleModuleOptionsDrawer);
  const spaInformation = useReactiveVar(spaInformationStorage);
  const [startY, setStartY] = useState(0);

  const closeDrawer = () => {
    toggleModuleOptionsDrawer(false);
    toggleHamburgerMenuDrawer(false);
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
                View Bill
              </p>
              <p
                className={cx(styles.inActiveText, {
                  [styles.activeText]: false,
                })}
              >
                Checkout
              </p>
            </div>
          </div>
        )}

        {irdActive && (
          <div>
            <p className={styles.title}>Choose your category</p>
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
            <p className={styles.title}>Choose your category</p>
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

        {spaActive && (
          <div>
            <p className={styles.title}>Choose your category</p>
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
      </Drawer>
      <HotelInfoDrawer />
    </>
  );
};
