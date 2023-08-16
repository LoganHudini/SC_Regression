import React, { useCallback } from 'react';
import styles from './MenuItem.module.scss';
import { IHamburgerMenuDrawerProps, IMenuItemProps } from './MenuItem.types';
import { useRouter } from 'next/router';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { getRedirectLink } from 'utils/getRedirectLink';
import { flowPathMap } from 'utils/flowPathMap';
import Drawer from '@mui/material/Drawer';
import { useReactiveVar } from '@apollo/client';
import { toggleHamburgerMenuDrawer, toggleModuleOptionsDrawer } from 'storage/home.storage';
import cx from 'classnames';
import { hamburgerIconsMap } from 'utils/hamburger/hamburgerIconsMap';

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
    if (redirectOptions === 'EXTERNAL') {
      window.open(externalLink, '_blank');
      toggleOption();
    }
    if (redirectOptions === 'IN_APP' && paths) {
      const redirectUrl = getRedirectLink(paths, pages[0]);
      if (redirectUrl) {
        navigate(`/${redirectUrl}`);
        toggleOption();
      }
    }
    if (redirectOptions === 'FLOW') {
      const redirectUrl = flowPathMap[flow as keyof typeof flowPathMap];
      if (redirectUrl) {
        navigate(redirectUrl);
        toggleOption();
      }
    }
  }, [externalLink, flow, navigate, pages, paths, redirectOptions, toggleOption]);

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

export const ModuleOptionsDrawer = () => {
  const drawerStatus = useReactiveVar(toggleModuleOptionsDrawer);
  const closeDrawer = () => {
    toggleModuleOptionsDrawer(false);
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
      >
        <div className={styles.drawerNotch}></div>
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
      </Drawer>
    </>
  );
};
