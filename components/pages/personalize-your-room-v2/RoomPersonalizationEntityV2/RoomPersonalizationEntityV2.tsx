import React, { useCallback } from 'react';
import styles from './RoomPersonalizationEntityV2.module.scss';
import cx from 'classnames';
import { StyledButton } from '../../../shared/StyledButton/StyledButton';
import { IRoomPersonalizationEntityProps } from './RoomPersonalizationEntityV2.types';
import { useTranslation } from 'react-i18next';
import produce from 'immer';
import { personalizeYourRoomStorage } from 'storage/personalize-your-room.storage';
import { useReactiveVar } from '@apollo/client';
import { PlusMinusInput } from 'components/shared/PlusMinusInput/PlusMinusInput';
import { toggleNotification } from 'storage/home.storage';
import { FAILURE } from 'utils/constants';

export const RoomPersonalizationEntityV2: React.FC<IRoomPersonalizationEntityProps> = ({
  title,
  description,
  price,
  currency,
  id,
  maxQuantity,
  setNotificationState,
}) => {
  const { t } = useTranslation('personalize-your-room');
  const personalizationStorageInfo = useReactiveVar(personalizeYourRoomStorage);
  const currentItem = personalizationStorageInfo?.find((el) => el.id === id);

  const quantity = currentItem?.quantity || 0;

  const handleAdd = useCallback(() => {
    if (quantity < maxQuantity?.maxQuantityValue) {
      personalizeYourRoomStorage(
        produce(personalizeYourRoomStorage(), (draft) => {
          const item = draft?.find((el) => el.id === id);
          if (item) {
            item.quantity++;
          } else {
            draft?.push({
              id: id,
              quantity: 1,
              selected: true,
              title: title,
              price: price,
              currency: currency,
            });
          }
        }),
      );
    } else {
      toggleNotification(true);
      setNotificationState({
        title: t('Limit Exceeded!'),
        description: t('Maximum limit reached for the selected item'),
        redirect: null,
        type: FAILURE,
      });
    }
  }, [
    t,
    currency,
    id,
    maxQuantity?.maxQuantityValue,
    price,
    quantity,
    setNotificationState,
    title,
  ]);

  const handleRemove = useCallback(() => {
    personalizeYourRoomStorage(
      produce(personalizeYourRoomStorage(), (draft) => {
        const item = draft?.find((el) => el?.id === id);
        if (item) {
          const index = (draft ?? [])?.indexOf(item);
          item.quantity === 1 ? index > -1 && draft?.splice(index, 1) : item.quantity--;
        }
      }),
    );
  }, [id]);

  const isActive = Number(quantity) > 0;

  const handleToggle = () => {
    personalizeYourRoomStorage(
      produce(personalizeYourRoomStorage(), (draft) => {
        const item = draft?.find((el) => el.id === id);
        if (item) {
          const index = (draft ?? [])?.indexOf(item);
          if (index > -1) {
            draft?.splice(index, 1);
          }
        } else {
          draft?.push({
            id: id,
            quantity: 1,
            selected: true,
            title: title,
            price: price,
            currency: currency,
          });
        }
      }),
    );
  };

  return (
    <div className={styles.roomPersonalizationEntityWrapper}>
      <div className={styles.roomPersonalizationFirstColumn}>
        <h2 className={styles.roomPersonalizationTitle}>{title}</h2>
        {description && <p className={styles.roomPersonalizationText}>{description}</p>}
        <div className={styles.bottomSec}>
          <div className={cx(styles.price, { [styles.priceActive]: isActive })}>
            {currency}{' '}
            <span className={styles.priceNo}>
              {Number(price)?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          {maxQuantity?.status === 'active' ? (
            <>
              <PlusMinusInput
                value={quantity}
                onClickMinus={handleRemove}
                onClickPlus={handleAdd}
              />
            </>
          ) : (
            <StyledButton
              variant={quantity === 0 ? 'outlined' : 'contained'}
              className={styles.addButton}
              onClick={handleToggle}
            >
              {quantity === 0 ? t('Select') : t('Selected')}
            </StyledButton>
          )}
        </div>
      </div>
    </div>
  );
};
