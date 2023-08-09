import React, { useCallback, useState } from 'react';
import { Card } from '../../../shared/Card/Card';
import styles from './GuestInfoForm.module.scss';
import cx from 'classnames';
import { GuestInfoFormProps } from './GuestInfoForm.types';
import { useTranslation } from 'react-i18next';

export const GuestInfoForm: React.FC<GuestInfoFormProps> = ({
  guest,
  primary,
  country,
  index,
  handleUpdateGuest,
}) => {
  const [isCardOpened, setIsCardOpened] = useState(false);

  const { t } = useTranslation('guest-information');

  const toggleCardOpened = useCallback(() => {
    setIsCardOpened(!isCardOpened);
  }, [isCardOpened]);

  const updateGuest = useCallback(() => {
    handleUpdateGuest(guest.id);
  }, [guest.id, handleUpdateGuest]);

  return (
    <>
      <div className={styles.guestInfoCardWrapper}>
        <Card
          displayShowMoreBtn
          onClickShowMore={toggleCardOpened}
          isCardOpened={isCardOpened}
          displayEditBtn={true}
          onClickEdit={updateGuest}
        >
          <h3 className={styles.cardTitle}>
            {primary ? t('Primary Guest') : `${t('Accompanying Guest')} ${index}`}
          </h3>
          <div className={styles.guestInfo}>
            <p className={styles.guestInfoText}>{`${guest.firstName} ${guest.lastName}`}</p>
            {guest.email && <p className={styles.guestInfoText}>{guest.email}</p>}
            {guest.phone && <p className={styles.guestInfoText}>{guest.phone}</p>}
            {guest.addressLine1 && <p className={styles.guestInfoText}>{guest.addressLine1}</p>}
            {guest.addressLine2 && <p className={styles.guestInfoText}>{guest.addressLine2}</p>}
            <div
              className={cx(styles.additionalGuestInfo, {
                [styles.additionalGuestInfoOpened]: isCardOpened,
              })}
            >
              {country && <p className={styles.guestInfoText}>{country}</p>}
              {guest.docNumber && (
                <p className={styles.guestInfoText}>{`${t('Document Number')}: ${
                  guest.docNumber
                }`}</p>
              )}
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};
