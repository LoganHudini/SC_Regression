import React, { useCallback } from 'react';
import styles from './RoomPersonalizationEntity.module.scss';
import cx from 'classnames';
import { StyledButton } from '../../../shared/StyledButton/StyledButton';
import RemoveOutlinedIcon from '@icons/RemoveOutlined.svg';
import AddOutlinedIcon from '@icons/AddOutlined.svg';
import { IRoomPersonalizationEntityProps } from './RoomPersonalizationEntity.types';
import { useTranslation } from 'react-i18next';

export const RoomPersonalizationEntity: React.FC<IRoomPersonalizationEntityProps> = ({
  title,
  description,
  price,
  type,
  currency,
  id,
  setCurrentPersonalizationEntities,
  count,
}) => {
  const { t } = useTranslation('personalize-your-room');

  const handleAdd = useCallback(() => {
    const newEntity = {
      code: id as string,
      quantity: String(+count + 1),
      price: `${price} ${currency}`,
      title,
    };

    setCurrentPersonalizationEntities((oldEntities) => {
      const newEntities = [...oldEntities.filter((el) => el.code !== id), newEntity];
      return newEntities;
    });
  }, [count, currency, id, price, setCurrentPersonalizationEntities, title]);

  const handleRemove = useCallback(() => {
    const newEntity = {
      code: id as string,
      quantity: String(+count - 1),
      price: `${price} ${currency}`,
      title,
    };

    setCurrentPersonalizationEntities((oldEntities) => {
      const newEntities = [...oldEntities.filter((el) => el.code !== id), newEntity];
      return newEntities;
    });
  }, [count, currency, id, price, setCurrentPersonalizationEntities, title]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newEntity = {
        code: id as string,
        quantity: e.target.value,
        price: `${price} ${currency}`,
        title,
      };

      setCurrentPersonalizationEntities((oldEntities) => {
        const newEntities = [...oldEntities.filter((el) => el.code !== id), newEntity];
        return newEntities;
      });
    },
    [currency, id, price, setCurrentPersonalizationEntities, title],
  );

  const isActive = Number(count) > 0;

  return (
    <div className={styles.roomPersonalizationEntityWrapper}>
      <div className={styles.roomPersonalizationFirstColumn}>
        <h2 className={styles.roomPersonalizationTitle}>{title}</h2>
        <p className={styles.roomPersonalizationText}>{description}</p>
      </div>
      <div
        className={cx(styles.roomPersonalizationControls, {
          [styles.roomPersonalizationControlsActive]: isActive,
        })}
      >
        <p className={cx(styles.perDay, { [styles.perDayActive]: isActive })}>
          {type === 'PER_DAY' && t('Per day')}
          {type === 'PER_STAY' && t('Per stay')}
        </p>
        <p className={cx(styles.price, { [styles.priceActive]: isActive })}>
          {currency} <span>{price}</span>
        </p>
        {isActive ? (
          <div className={styles.roomPersonalizationInputWrapper}>
            <button className={styles.minusButton} onClick={handleRemove}>
              <RemoveOutlinedIcon className={styles.minusIcon} />
            </button>
            <input
              className={styles.roomPersonalizationInput}
              value={count}
              onChange={handleInputChange}
            />
            <button className={styles.plusButton} onClick={handleAdd}>
              <AddOutlinedIcon className={styles.plusIcon} />
            </button>
          </div>
        ) : (
          <StyledButton className={styles.addButton} onClick={handleAdd} variant='outlined'>
            {t('Add')}
          </StyledButton>
        )}
      </div>
    </div>
  );
};
