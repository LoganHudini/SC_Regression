import { WhiteStyledCheckbox } from 'components/shared/WhiteStyledCheckbix/WhiteStyledCheckbox';
import React, { useCallback } from 'react';
import styles from './HousekeepingCheckboxItem.module.scss';
import { IHousekeepingCheckboxItemProps } from './HousekeepingCheckboxItem.types';
import { useReactiveVar } from '@apollo/client';
import { housekeepingCheckboxStorage } from 'storage/housekeeping-checkbox.storage';
import produce from 'immer';

export const HousekeepingCheckboxItem: React.FC<IHousekeepingCheckboxItemProps> = ({
  title,
  id,
}) => {
  const housekeepingInfo = useReactiveVar(housekeepingCheckboxStorage);
  const currentItem = housekeepingInfo?.selectedItems.find((el) => el.itemId === id);

  const checked = currentItem?.quantity === 1;

  const toggleRequested = useCallback(() => {
    housekeepingCheckboxStorage(
      produce(housekeepingCheckboxStorage(), (draft) => {
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

  return (
    <div className={styles.housekeepingCheckboxItemWrapper}>
      <WhiteStyledCheckbox checked={checked} onChange={toggleRequested} value={id} label={title} />
    </div>
  );
};
