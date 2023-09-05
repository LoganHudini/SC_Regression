/* eslint-disable @next/next/no-img-element */
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import React, { useCallback, useState } from 'react';
import cx from 'classnames';
import { PlusMinusInput } from '../../../shared/PlusMinusInput/PlusMinusInput';
import styles from './HousekeepingItem.module.scss';
import { IHousekeepingItemProps } from './HousekeepingItem.types';
import { availablePaths } from 'utils/availablePaths';
import { useReactiveVar } from '@apollo/client';
import { housekeepingStorage } from 'storage/housekeeping.storage';
import { produce } from 'immer';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { serviceRequestIcons } from 'utils/serviceRequestIcons';

export const HousekeepingItem: React.FC<IHousekeepingItemProps> = ({
  housekeepingItem,
  handleClick,
}) => {
  const navigate = useLocalizedRouter();

  const { t } = useTranslation('housekeeping');

  const [maxFlag, setMaxFlag] = useState(true);

  const housekeepingInfo = useReactiveVar(housekeepingStorage);
  const currentItem = housekeepingInfo?.selectedItems?.find(
    (el) => el?.itemId === housekeepingItem?.id,
  );

  const hasSelectedSubItems = housekeepingItem?.items?.some((housekeepingSubItem) => {
    const selectedSubItem = housekeepingInfo?.selectedItems?.find(
      (el) => el?.itemId === housekeepingSubItem?.id && el?.quantity !== 0,
    );

    return Boolean(selectedSubItem);
  });

  const hasSelectedItems = housekeepingInfo?.selectedItems?.find(
    (el) => el?.itemId === housekeepingItem?.id,
  );

  const quantity = currentItem?.quantity || 0;

  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  const expandDescription = useCallback(() => {
    setDescriptionExpanded(true);
  }, []);

  const onClickPlus = useCallback(() => {
    if (maxFlag) {
      if (quantity < housekeepingItem.maxQuantity) {
        housekeepingStorage(
          produce(housekeepingStorage(), (draft) => {
            const item = draft?.selectedItems?.find((el) => el.itemId === housekeepingItem.id);
            if (item) {
              item.quantity++;
            } else {
              draft?.selectedItems?.push({
                itemId: housekeepingItem?.id,
                quantity: 1,
                code: housekeepingItem?.code,
                name: housekeepingItem?.name,
              });
            }
          }),
        );
      } else {
        setMaxFlag(false);
        toast(t('Item count exceeds the limit'), { type: 'error' });
      }
    }
  }, [
    housekeepingItem?.code,
    housekeepingItem.id,
    housekeepingItem.maxQuantity,
    housekeepingItem?.name,
    maxFlag,
    quantity,
    t,
  ]);

  const onClickMinus = useCallback(() => {
    setMaxFlag(true);
    housekeepingStorage(
      produce(housekeepingStorage(), (draft) => {
        const item = draft?.selectedItems?.find((el) => el?.itemId === housekeepingItem?.id);
        if (item) {
          item.quantity--;
        }
      }),
    );
  }, [housekeepingItem?.id]);

  const toggleRequest = useCallback(() => {
    housekeepingStorage(
      produce(housekeepingStorage(), (draft: any) => {
        const item = draft?.selectedItems.find((el: any) => el.itemId === housekeepingItem.id);

        if (item?.quantity === 1) {
          item.quantity = 0;
          item.requested = false;
        } else {
          draft.currentItem = housekeepingItem;
          draft.requestModalOpened = true;
        }
      }),
    );
  }, [housekeepingItem]);

  const goToHousekeepingDetailsPage = useCallback(() => {
    housekeepingStorage(
      produce(housekeepingStorage(), (draft: any) => {
        draft.currentItem = housekeepingItem;
      }),
    );
    if (!housekeepingItem?.maxQuantityActive && !housekeepingItem?.isItemActive) {
      {
        housekeepingItem?.scheduleActive
          ? housekeepingStorage(
              produce(housekeepingStorage(), (draft: any) => {
                draft.requestModalOpened = true;
                draft.currentItem = housekeepingItem;
              }),
            )
          : housekeepingStorage(
              produce(housekeepingStorage(), (draft: any) => {
                const item = draft?.selectedItems?.find(
                  (el: any) => el?.itemId === draft?.currentItem?.id,
                );

                if (item) {
                  const index = draft?.selectedItems?.indexOf(item);
                  if (index > -1) {
                    draft?.selectedItems?.splice(index, 1);
                  }
                } else {
                  draft?.selectedItems?.push({
                    itemId: draft.currentItem?.id as string,
                    code: draft.currentItem?.code as string,
                    name: draft.currentItem?.name as string,
                    quantity: 1,
                    requested: true,
                  });
                }
              }),
            );
      }
    } else if (!housekeepingItem?.maxQuantityActive && housekeepingItem?.isItemActive) {
      if (housekeepingItem?.items?.some((el) => el.maxQuantityActive)) {
        navigate(availablePaths.HOUSEKEEPING_QUANTITY);
      } else {
        navigate(availablePaths.HOUSEKEEPING_CHECKBOX);
      }
    }
  }, [housekeepingItem, navigate]);
  const selectedIcon: any = serviceRequestIcons?.find(
    (icon) => housekeepingItem?.icon === icon?.name,
  );

  return (
    <>
      <div className={styles.housekeepingItemWrapper} onClick={() => handleClick(housekeepingItem)}>
        <div className={styles.iconWrapper}>
          {selectedIcon && <img src={selectedIcon?.icon} alt='Icon' width={45} height={45} />}
        </div>
        <h2 className={styles.housekeepingItemTitle}>{housekeepingItem?.name}</h2>
      </div>
    </>
  );
};
