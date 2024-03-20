import React from 'react';
import styles from './Checkin.module.scss';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import { toggleCheckInDetailsDrawer } from 'storage/home.storage';
import { CHECKIN_NOW } from 'utils/constants';
import { activeCheckInFlow } from 'storage/check-in.storage';
import { useTranslation } from 'react-i18next';

interface ICheckinProps {
  title: string;
  description: string;
  buttonTitle: string;
}

export const Checkin: React.FC<ICheckinProps> = ({ title, description, buttonTitle }) => {
  const { t } = useTranslation(['common']);

  const handleComponentCta = () => {
    toggleCheckInDetailsDrawer(true);
    buttonTitle === t(CHECKIN_NOW) ? activeCheckInFlow(true) : activeCheckInFlow(false);
  };

  return (
    <>
      <div className={styles.PairtoRoomWrapper}>
        <p className={styles.pairRoomTitle}>{title}</p>
        <p className={styles.pairRoomdesc}>{description}</p>
        <div className={styles.buttonWrapper}>
          <StyledButton variant='outlined' className={styles.button} onClick={handleComponentCta}>
            {buttonTitle}
          </StyledButton>
        </div>
      </div>
    </>
  );
};
