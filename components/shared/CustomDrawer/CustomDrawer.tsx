import React, { useEffect, useState } from 'react';
import styles from './CustomDrawer.module.scss';
import { Drawer } from '@mui/material';
import { handleTouchEnd, handleTouchStart } from 'utils/hooks/useDrawerSwipe';
import cx from 'classnames';
import { useRouter } from 'next/router';
import { availablePaths } from 'utils/availablePaths';

interface IDetailPageProps {
  open: boolean;
  content?: any;
  onClose?: any;
}

export const CustomDrawer: React.FC<IDetailPageProps> = ({ open, onClose, content }) => {
  const router = useRouter();
  const [startY, setStartY] = useState(0);
  const irdActive = router?.pathname?.includes(availablePaths?.DINING);

  return (
    <Drawer
      variant='temporary'
      anchor='bottom'
      open={open}
      onClose={onClose}
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
            color: 'var(--primary-drawer-background-color)',
            opacity: irdActive ? 'var(--primary-drawer-background-opacity)' : '1',
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
    </Drawer>
    // <>
    //   <div
    //     onClick={onClose}
    //     className={cx(styles.background, { [styles.backgroundOpened]: open })}
    //   ></div>
    //   <div
    //     className={cx(styles.wrapper, { [styles.wrapperOpened]: open })}
    //     onTouchStart={(e) => handleTouchStart(e, setStartY)}
    //     onTouchEnd={(e) => handleTouchEnd(e, startY, setStartY, onClose)}
    //   >
    //     {' '}
    //     <div className={styles.drawerNotch}></div>
    //     {content}
    //   </div>
    // </>
  );
};
