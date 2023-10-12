import React, { useCallback, useState } from 'react';
import styles from './RoomPersonalizationEntityV2.module.scss';
import cx from 'classnames';
import { StyledButton } from '../../../shared/StyledButton/StyledButton';
import RemoveOutlinedIcon from '@icons/RemoveOutlined.svg';
import AddOutlinedIcon from '@icons/AddOutlined.svg';
import { IRoomPersonalizationEntityProps } from './RoomPersonalizationEntityV2.types';
import { useTranslation } from 'react-i18next';

export const RoomPersonalizationEntityV2: React.FC<IRoomPersonalizationEntityProps> = ({
  title,
  description,
  price,
  type,
  currency,
  id,
  setCurrentPersonalizationEntities,
  count,
}) => {
  const [quantity, setQuantity] = useState(count);
  const { t } = useTranslation('personalize-your-room');

  const handleAdd = useCallback(() => {
    const newEntity = {
      id: id as string,
      quantity: +quantity + 1,
      price: `${price}`,
      title,
      currency: `${currency}`,
    };
    setQuantity(+quantity + 1);
    setCurrentPersonalizationEntities((oldEntities: any) => {
      const newEntities = [...oldEntities.filter((el: any) => el.id !== id), newEntity];
      return newEntities;
    });
  }, [quantity, currency, id, price, setCurrentPersonalizationEntities, title]);

  const handleRemove = useCallback(() => {
    const newEntity = {
      id: id as string,
      quantity: +quantity - 1,
      price: `${price}`,
      title,
      currency: `${currency}`,
    };
    setQuantity(+quantity - 1);
    setCurrentPersonalizationEntities((oldEntities: any) => {
      const newEntities = [...oldEntities.filter((el: any) => el.id !== id), newEntity];
      return newEntities;
    });
  }, [quantity, currency, id, price, setCurrentPersonalizationEntities, title]);

  const isActive = Number(quantity) > 0;

  return (
    <div className={styles.roomPersonalizationEntityWrapper}>
      <div className={styles.roomPersonalizationFirstColumn}>
        <h2 className={styles.roomPersonalizationTitle}>{title}</h2>
        <p className={styles.roomPersonalizationText}>{description}</p>
        <div className={styles.bottomSec}>
          <div className={cx(styles.price, { [styles.priceActive]: isActive })}>
            {currency} <span className={styles.priceNo}>{price}</span>
          </div>
          {isActive ? (
            <div className={styles.roomPersonalizationInputWrapper}>
              <span className={styles.minusButton} onClick={handleRemove}>
                <RemoveOutlinedIcon className={styles.minusIcon} />
              </span>
              <div className={styles.roomPersonalizationInput}>
                <span>{quantity}</span>
              </div>
              <span className={styles.plusButton} onClick={handleAdd}>
                <AddOutlinedIcon className={styles.plusIcon} />
              </span>
            </div>
          ) : (
            <StyledButton className={styles.addButton} onClick={handleAdd} variant='contained'>
              {t('Select')}
            </StyledButton>
          )}
        </div>
      </div>
    </div>
  );
};
