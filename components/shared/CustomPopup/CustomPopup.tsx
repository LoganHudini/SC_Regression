import styles from './CustomPopup.module.scss';
import { Modal } from '@mui/material';
import React from 'react';

interface ICustomPopupProps {
  open?: boolean | any;
  content?: any;
  onClose?: any;
  background?: boolean;
}

export const CustomPopup: React.FC<ICustomPopupProps> = ({ open, onClose, content }) => {
  return (
    <>
      <Modal open={open && open} onClose={onClose}>
        <div className={styles.drawerContentWrapper}>{content}</div>
      </Modal>
    </>
  );
};
