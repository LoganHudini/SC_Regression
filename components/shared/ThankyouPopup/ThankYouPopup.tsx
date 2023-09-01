import { Dialog } from '@mui/material';
import React from 'react';
import styles from './ThankYouPopup.module.scss';

const ThankYouPopup = (props: any) => {
  const { openPopup, setOpenPopup } = props;

  return (
    <Dialog open={openPopup} onClose={() => setOpenPopup(false)}>
      <>
        <div className={styles.content}>
          <div className={styles.wrapper}>
            <video width='50' autoPlay>
              <source src='/videos/doneTick.mp4' type='video/mp4' />
            </video>
          </div>
          <div>
            <div className={styles.heading}>Thank You!</div>
            <div className={styles.request}>Your request has been confirmed</div>
          </div>
        </div>
      </>
    </Dialog>
  );
};

export default ThankYouPopup;
