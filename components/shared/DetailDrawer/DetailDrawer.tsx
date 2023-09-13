import React, { useState } from 'react';
import styles from './DetailDrawer.module.scss';
import { Drawer } from '@mui/material';
import { handleTouchEnd, handleTouchStart } from 'utils/hooks/useDrawerSwipe';

interface IDetailPageProps {
  open: boolean;
  data?: any;
  content?: any;
  onClose?: any;
}

export const DetailDrawer: React.FC<IDetailPageProps> = ({ open, onClose, content }) => {
  const [startY, setStartY] = useState(0);

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
            opacity: open ? 'var(--primary-drawer-background-opacity)' : '0',
            transition: 'opacity 0.5s ease-in-out',
            backdropFilter: 'blur(2px)',
          },
        },
      }}
      onTouchStart={(e) => handleTouchStart(e, setStartY)}
      onTouchEnd={(e) => handleTouchEnd(e, startY, setStartY, onClose)}
    >
      <div className={styles.drawerNotch}></div>
      {content}
    </Drawer>
  );
};
