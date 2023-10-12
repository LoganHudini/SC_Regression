import styles from './CustomDrawer.module.scss';
import { SwipeableDrawer } from '@mui/material';
import cx from 'classnames';

interface IDetailPageProps {
  open: boolean;
  content?: any;
  onClose?: any;
}

export const CustomDrawer: React.FC<IDetailPageProps> = ({ open, onClose, content }) => {
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
        disableSwipeToOpen={true}
      >
        <div className={styles.drawerNotch}></div>
        {content}
        <div className={styles.drawerNotchBottom}></div>
      </SwipeableDrawer>
    </>
  );
};
