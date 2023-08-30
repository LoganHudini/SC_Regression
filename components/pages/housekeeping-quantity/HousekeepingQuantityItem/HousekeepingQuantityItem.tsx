import React, { useCallback } from 'react';
import { PlusMinusInput } from '../../../shared/PlusMinusInput/PlusMinusInput';
import styles from './HousekeepingQuantityItem.module.scss';
import { IHousekeepingQuantityItemProps } from './HousekeepingQuantityItem.types';
import { useReactiveVar } from '@apollo/client';
import produce from 'immer';
import { toast } from 'react-toastify';
import { housekeepingQuantityStorage } from 'storage/housekeeping-quantity.storage';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import { useTranslation } from 'react-i18next';

export const HousekeepingQuantityItem: React.FC<IHousekeepingQuantityItemProps> = ({
  title,
  id,
  maxQuantity,
  maxQuantityActive,
}) => {
  const { t } = useTranslation('housekeeping-quantity');

  const housekeepingInfo = useReactiveVar(housekeepingQuantityStorage);
  const currentItem = housekeepingInfo?.selectedItems.find((el) => el.itemId === id);

  const quantity = currentItem?.quantity || 0;

  const onClickPlus = useCallback(() => {
    if (quantity < maxQuantity) {
      housekeepingQuantityStorage(
        produce(housekeepingQuantityStorage(), (draft) => {
          const item = draft?.selectedItems.find((el) => el.itemId === id);
          if (item) {
            item.quantity++;
          } else {
            draft?.selectedItems.push({ itemId: id, quantity: 1 });
          }
        }),
      );
    } else {
      toast(t('Max limit reached for the selected item'), { type: 'error' });
    }
  }, [id, maxQuantity, quantity, t]);

  const toggleRequested = useCallback(() => {
    housekeepingQuantityStorage(
      produce(housekeepingQuantityStorage(), (draft) => {
        const item = draft?.selectedItems.find((el) => el.itemId === id);
        if (item) {
          if (item.quantity === 0) {
            item.quantity = 1;
            item.requested = true;
          } else {
            item.quantity = 0;
            item.requested = false;
          }
        } else {
          draft?.selectedItems.push({ itemId: id, quantity: 1, requested: true });
        }
      }),
    );
  }, [id]);

  const onClickMinus = useCallback(() => {
    housekeepingQuantityStorage(
      produce(housekeepingQuantityStorage(), (draft) => {
        const item = draft?.selectedItems.find((el) => el.itemId === id);
        if (item) {
          item.quantity--;
        }
      }),
    );
  }, [id]);

  return (
    <>
      <div className={styles.housekeepingQuantityItemWrapper}>
        <p className={styles.housekeepingQuantityItemTitle}>Quantity</p>
        <p className={styles.maxCount}>(Max Count: {maxQuantity} )</p>
        <div className={styles.plusMinusWrapper}>
          {maxQuantityActive ? (
            <PlusMinusInput
              value={quantity}
              onClickMinus={onClickMinus}
              onClickPlus={onClickPlus}
            />
          ) : (
            <StyledButton
              variant={quantity === 0 ? 'outlined' : 'contained'}
              onClick={toggleRequested}
              className={styles.button}
            >
              {quantity === 0 ? t('SELECT') : t('SELECTED')}
            </StyledButton>
          )}
        </div>
      </div>
    </>
  );
};
