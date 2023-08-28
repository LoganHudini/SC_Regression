import React, { useCallback, useEffect, useState } from 'react';
import { StyledButton } from '../../../shared/StyledButton/StyledButton';
import styles from './DiningCustomisationDrawer.module.scss';
import Drawer from '@mui/material/Drawer';
import { IDiningCustomisationDrawerProps } from './DiningCustomisationDrawer.types';
import { useReactiveVar } from '@apollo/client';
import {
  diningMenuStorage,
  IDiningMenuStorageData,
  toggleDiningDetailsDrawer,
} from 'storage/dining-menu.storage';
import { availablePaths } from 'utils/availablePaths';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import produce from 'immer';
import { useTranslation } from 'react-i18next';
import { CURRENCY } from 'core/graphql/endpoints';
import { addToCartEvent } from 'utils/gtag';

export const DiningCustomisationDrawer: React.FC<IDiningCustomisationDrawerProps> = ({
  customisationDrawer,
  closeCustomisationDrawer,
}) => {
  const { t } = useTranslation(['common', 'dining']);
  const [totalAddons, settotalAddons] = useState<number>(0);
  const navigate = useLocalizedRouter();
  const diningData = useReactiveVar(diningMenuStorage) as IDiningMenuStorageData;
  const selectedItemId = diningData?.selectedItemId;
  const selectedItem = diningData?.items?.find(
    (item, index) => item?.itemId === selectedItemId && index === diningData?.selectedIndex,
  );

  useEffect(() => {
    settotalAddons((selectedItem?.addons ?? [])?.reduce((acc, addon) => acc + addon?.price, 0));
  }, [totalAddons, selectedItem?.addons]);

  const handleAddNew = useCallback(() => {
    closeCustomisationDrawer();
    toggleDiningDetailsDrawer(true);
  }, [closeCustomisationDrawer]);

  const handleRepeatLast = useCallback(() => {
    const addedItem = {
      id: selectedItem?.itemId,
      name: selectedItem?.title,
      price: selectedItem?.price,
      quantity: selectedItem?.quantity,
    };
    closeCustomisationDrawer();
    diningMenuStorage(
      produce(diningMenuStorage(), (draft) => {
        const item = draft?.items?.find(
          (el, index) => el?.itemId === selectedItem?.itemId && index === diningData?.selectedIndex,
        );
        if (item) {
          item.quantity++;
          addToCartEvent(addedItem);
        }
      }),
    );
  }, [closeCustomisationDrawer, diningData?.selectedIndex, selectedItem]);

  return (
    <Drawer
      variant='temporary'
      anchor='bottom'
      open={customisationDrawer}
      onClose={closeCustomisationDrawer}
      PaperProps={{
        elevation: 0,
        style: {
          borderTopRightRadius: '2rem',
          borderTopLeftRadius: '2rem',
          maxWidth: '772px',
          margin: 'auto',
        },
      }}
    >
      <div className={styles.wrapper}>
        <h3 className={styles.title}>{t('Repeat previous customisation?')} </h3>

        <div className={styles.priceContainer}>
          {selectedItem?.title && <h4 className={styles.itemTitle}>{selectedItem?.title}</h4>}
          {selectedItem?.price && (
            <h4 className={styles.itemPrice}>
              {CURRENCY} {(selectedItem?.price + totalAddons)?.toFixed(2)}
            </h4>
          )}
        </div>
        {selectedItem?.customisation?.ingredient && selectedItem?.customisation?.name && (
          <p className={styles.itemDescription}>
            {' '}
            <span className={styles.grayText}>{selectedItem?.customisation?.ingredient}:</span>{' '}
            {selectedItem?.customisation?.name}
          </p>
        )}
        {(selectedItem?.addons ?? [])?.length > 0 && (
          <p className={styles.itemDescription}>
            <span className={styles.grayText}>{t('Add-ons :')} </span>
            {selectedItem?.addons?.map((item, index) => (
              <span key={index} className={styles.item}>
                {item?.name}
              </span>
            ))}
          </p>
        )}
        <div className={styles.buttonContainer}>
          <StyledButton variant='outlined' className={styles.buttonLeft} onClick={handleAddNew}>
            {t('ADD NEW')}
          </StyledButton>

          <StyledButton
            variant='contained'
            className={styles.buttonRight}
            onClick={handleRepeatLast}
          >
            {t('REPEAT LAST')}
          </StyledButton>
        </div>
      </div>
    </Drawer>
  );
};
