import React, { useEffect, useState } from 'react';
import styles from './CustomDrawer.module.scss';
import { SwipeableDrawer, Drawer } from '@mui/material';
import { handleTouchEnd, handleTouchStart } from 'utils/hooks/useDrawerSwipe';
import cx from 'classnames';
import { useRouter } from 'next/router';
import { availablePaths } from 'utils/availablePaths';

interface IDetailPageProps {
  open: boolean;
  content?: any;
  onClose?: any;
  onOpen?: any;
}

export const CustomDrawer: React.FC<IDetailPageProps> = ({ open, onClose, onOpen, content }) => {
  const router = useRouter();
  const [startY, setStartY] = useState(0);
  const irdActive = router?.pathname?.includes(availablePaths?.DINING);

  return (
    <>
      <div
        onClick={onClose}
        className={cx(styles.background, { [styles.backgroundOpened]: open })}
      ></div>{' '}
      <SwipeableDrawer
        variant='temporary'
        anchor='bottom'
        open={open}
        onClose={onClose}
        onOpen={onOpen}
        PaperProps={{
          elevation: 0,
          style: {
            maxWidth: '768px',
            maxHeight: 'var(--primary-drawer-height)',
            margin: 'auto',
            borderTopLeftRadius: 'var(--primary-drawer-top-left-border-radius)',
            borderTopRightRadius: 'var(--primary-drawer-top-right-border-radius)',
          },
        }}
        slotProps={{
          backdrop: {
            style: {
              backdropFilter: 'blur(2px)',
              maxWidth: '768px',
              margin: 'auto',
              overflow: 'hidden',
            },
          },
        }}
        onTouchStart={(e) => handleTouchStart(e, setStartY)}
        onTouchEnd={(e) => handleTouchEnd(e, startY, setStartY, onClose)}
      >
        <div className={styles.drawerNotch}></div>
        {content}
        <div className={styles.drawerNotchBottom}></div>
      </SwipeableDrawer>
    </>
  );
};
