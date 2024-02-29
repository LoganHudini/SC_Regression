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
import cx from 'classnames';
import { toggleNotification } from 'storage/home.storage';
import { FAILURE } from 'utils/constants';

export const HousekeepingQuantityItem: React.FC<IHousekeepingQuantityItemProps> = ({
  title,
  id,
  maxQuantity,
  maxQuantityActive,
  changeAlignment,
  setNotificationState,
}) => {
  const { t } = useTranslation('housekeeping');

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
            draft?.selectedItems.push({ itemId: id, quantity: 1, name: title });
          }
        }),
      );
    } else {
      setNotificationState({
        title: t('Max limit exceeded!'),
        description: t('Max limit reached for the selected item'),
        redirect: null,
        type: FAILURE,
      });
      toggleNotification(true);
    }
  }, [id, maxQuantity, quantity, t, title]);

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
          draft?.selectedItems.push({ itemId: id, quantity: 1, requested: true, name: title });
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
      <div
        className={cx(styles.housekeepingQuantityItemWrapper, {
          [styles.housekeepingQuantityItemWrapperInner]: changeAlignment,
        })}
      >
        <p
          className={cx(styles.housekeepingQuantityItemTitle, {
            [styles.housekeepingQuantityItemTitleInner]: changeAlignment,
          })}
        >
          {changeAlignment ? title : t('Quantity')}
          <div className={styles.CountInner}>
            {changeAlignment ? `(${t('Max Count:')} ${maxQuantity})` : ''}
          </div>
        </p>
        <p
          className={cx(styles.maxCount, {
            [styles.disabled]: changeAlignment,
          })}
        >
          (Max Count: {maxQuantity})
        </p>
        <div
          className={cx(styles.plusMinusWrapper, {
            [styles.plusMinusWrapperTitleInner]: changeAlignment,
          })}
        >
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
