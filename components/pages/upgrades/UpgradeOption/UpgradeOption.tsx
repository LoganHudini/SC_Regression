import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { upgradesStorage } from 'storage/upgrades.storage';
import { Card } from '../../../shared/Card/Card';
import { UpgradeCarousel } from '../UpgradeCarousel/UpgradeCarousel';
import styles from './UpgradeOption.module.scss';
import { IUpgradesOptionProps } from './UpgradeOption.types';

export const UpgradeOption: React.FC<IUpgradesOptionProps> = ({
  title,
  description,
  rate,
  isSelected,
  images,
  id,
}) => {
  const { t } = useTranslation('upgrades');

  const descriptionTooLong = description.length > 95;
  const shortedDescription = descriptionTooLong ? `${description.slice(0, 80)}...` : description;

  const toggleCardSelected = useCallback(() => {
    upgradesStorage({
      upgradeId: isSelected ? undefined : id,
      upgradeRate: isSelected ? undefined : rate,
    });
  }, [id, isSelected, rate]);

  return (
    <div className={styles.upgradeOptionWrapper}>
      <Card displayShowMoreBtn isCardOpened={isSelected} onClickShowMore={toggleCardSelected}>
        <h3 className={styles.upgradeTitle}>{title}</h3>
        <p className={styles.upgradeDescription}>
          {t('Pay More', { rate })}
          <br />
          {isSelected ? description : shortedDescription}
          {descriptionTooLong && !isSelected && (
            <button className={styles.readMoreBtn} onClick={toggleCardSelected}>
              {t('Read More')}
            </button>
          )}
        </p>
        {isSelected && images.length > 0 && <UpgradeCarousel images={images} />}
      </Card>
    </div>
  );
};
