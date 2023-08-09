import React, { useCallback, useState } from 'react';
import { Card } from '../../../shared/Card/Card';
import cx from 'classnames';
import ExpandMoreOutlinedIcon from '@icons/ExpandMoreOutlinedIcon.svg';
import { IGuestInformationProps } from './GuestInformation.types';
import styles from './GuestInformation.module.scss';
import { useTranslation } from 'react-i18next';

export const GuestInformation: React.FC<IGuestInformationProps> = ({
  primary,
  guestName,
  guestDocumentId,
  addressLine1,
  addressLine2,
  email,
  phone,
  country,
}) => {
  const [expanded, setExpanded] = useState(false);

  const { t } = useTranslation('check-in');

  const toggleExpandCard = useCallback(() => {
    setExpanded((oldState) => !oldState);
  }, []);

  return (
    <Card>
      <div className={styles.guestInformationWrapper}>
        <div className={styles.guestInformationMain}>
          <h2 className={styles.guestInformationTitle}>
            {primary ? t('Primary Guest Information') : t('Secondary Guest Information')}
          </h2>
          <p className={styles.guestInformationText}>{guestName}</p>
          <div
            className={cx(styles.additionalGuestInformation, {
              [styles.additionalGuestInformationOpened]: expanded,
            })}
          >
            <p className={styles.guestInformationText}>{phone}</p>
            <p className={styles.guestInformationText}>{email}</p>
            <p className={styles.guestInformationText}>{addressLine1}</p>
            <p className={styles.guestInformationText}>{addressLine2}</p>
          </div>
          <p className={styles.guestInformationText}>{country}</p>
          <p className={styles.guestInformationText}>{`${t(
            'Document Number',
          )}: ${guestDocumentId}`}</p>
        </div>
        <button className={styles.guestInformationButton} onClick={toggleExpandCard}>
          <ExpandMoreOutlinedIcon
            className={cx(styles.guestInformationIcon, {
              [styles.guestInformationIconExpanded]: expanded,
            })}
          />
        </button>
      </div>
    </Card>
  );
};
