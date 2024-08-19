import React from 'react';
import styles from './Checkin.module.scss';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import { toggleCheckInDetailsDrawer } from 'storage/home.storage';
import { CHECKIN_NOW } from 'utils/constants';
import { activeCheckInFlow } from 'storage/check-in.storage';
import { useTranslation } from 'react-i18next';
import AppStore from '@icons/appStore.svg';
import PlayStore from '@icons/googlePlay.svg';

interface ICheckinProps {
  title: string;
  description: string;
  buttonTitle: string;
  downloadText?: string | boolean | null;
}

export const Checkin: React.FC<ICheckinProps> = ({
  title,
  description,
  buttonTitle,
  downloadText = false,
}) => {
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
        {downloadText && (
          <>
            <p className={styles.pairRoomdesc}>{downloadText}</p>
            <div className={styles.iconWrapper}>
              <AppStore />
              <PlayStore />
            </div>
          </>
        )}
      </div>
    </>
  );
};
