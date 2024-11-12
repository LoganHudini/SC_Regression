import styles from './CustomDrawer.module.scss';
import { SwipeableDrawer } from '@mui/material';
import cx from 'classnames';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { toggleOpenCheckOutDrawer } from 'storage/checkout.storage';
import {
  toggleCheckInDetailsDrawer,
  toggleDetailsDrawer,
  toggleHamburgerMenuDrawer,
  toggleHotelInfoDrawer,
  toggleModuleOptionsDrawer,
} from 'storage/home.storage';

interface IDetailPageProps {
  open: boolean;
  content?: any;
  onClose?: any;
  background?: boolean;
  isIframe?: boolean;
}

export const CustomDrawer: React.FC<IDetailPageProps> = ({
  open,
  onClose,
  content,
  isIframe = false,
}) => {
  const router = useRouter();
  const contentRef: any = useRef(null);
  const [drawerHeight, setDrawerHeight] = useState<any>();
  const [drawerMaxHeight, setDrawerMaxHeight] = useState<any>(drawerHeight);

  useEffect(() => {
    let primaryDrawerHeight: any;
    if (!drawerHeight) {
      primaryDrawerHeight = getComputedStyle(document.documentElement).getPropertyValue(
        isIframe ? '--primary-iframe-drawer-height' : '--primary-drawer-height',
      );
      setDrawerHeight(primaryDrawerHeight);
      setDrawerMaxHeight(primaryDrawerHeight);
    }
  }, []);

  useEffect(() => {
    const contentElement = contentRef.current;
    const handleScroll = () => {
      if (contentElement) {
        const { scrollHeight, clientHeight } = contentElement;
        const newMaxHeight = Math.min(scrollHeight, clientHeight);
        const newHeight = (newMaxHeight / window.innerHeight) * 100;
        if (Math.floor(newHeight) <= 90) {
          setDrawerMaxHeight(isIframe ? '100dvh' : '90dvh');
        }
      }
    };

    if (open && contentElement) {
      contentElement.addEventListener('scroll', handleScroll);
    }

    return () => {
      setDrawerMaxHeight(drawerHeight);
      if (contentElement) {
        contentElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, [drawerHeight, open, isIframe]);

  useEffect(() => {
    router.beforePopState(({ as }) => {
      if (as !== router.asPath) {
        onClose();
        toggleDetailsDrawer(false);
        toggleCheckInDetailsDrawer(false);
        toggleHamburgerMenuDrawer(false);
        toggleModuleOptionsDrawer(false);
        toggleOpenCheckOutDrawer(false);
        toggleHotelInfoDrawer(false);
      }
      return true;
    });
    return () => {
      router.beforePopState(() => true);
    };
  }, [onClose, router]);

  useEffect(() => {
    if (open && contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [open]);

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
        onOpen={() => console.log()}
        PaperProps={{
          elevation: 0,
          style: {
            maxWidth: '768px',
            maxHeight: drawerMaxHeight,
            margin: 'auto',
            backgroundColor: 'var(--primary-drawer-color)',
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
        disableSwipeToOpen={true}
      >
        <div ref={contentRef} className={styles.drawerContent}>
          {!isIframe && <div className={styles.drawerNotch}></div>}
          {content}
          <div className={styles.drawerNotchBottom}></div>
        </div>
      </SwipeableDrawer>
    </>
  );
};
