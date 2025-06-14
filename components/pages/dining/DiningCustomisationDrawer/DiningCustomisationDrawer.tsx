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
import produce from 'immer';
import { useTranslation } from 'react-i18next';
import { addToCartEvent } from 'utils/gtag';
import { useCurrency } from 'utils/hooks/useCurrency';
import { findModule, formatPriceIRD } from 'utils/functions';
import cx from 'classnames';
import { useConfig } from 'utils/hooks/useConfiguration';
import { IN_ROOM_DINING } from 'utils/constants';

export const DiningCustomisationDrawer: React.FC<IDiningCustomisationDrawerProps> = ({
  customisationDrawer,
  closeCustomisationDrawer,
}) => {
  const { t } = useTranslation('dining');
  const [totalAddons, settotalAddons] = useState<number>(0);
  const diningData = useReactiveVar(diningMenuStorage) as IDiningMenuStorageData;
  const selectedItemId = diningData?.selectedItemId;
  const selectedItem = diningData?.items?.find(
    (item, index) => item?.itemId === selectedItemId && index === diningData?.selectedIndex,
  );
  const currency = useCurrency();

  useEffect(() => {
    settotalAddons(
      (selectedItem?.addons ?? [])?.reduce((acc: any, addon: any) => acc + addon?.priceInDecimal, 0),
    );
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
      currency: currency,
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
  }, [
    closeCustomisationDrawer,
    currency,
    diningData?.selectedIndex,
    selectedItem?.itemId,
    selectedItem?.price,
    selectedItem?.quantity,
    selectedItem?.title,
  ]);
  const config = useConfig();
  const irdModuleContent: any = findModule(config?.modules, IN_ROOM_DINING);
  const isIRDv2 = irdModuleContent?.version === 'v2';

  return (
    <Drawer
      variant='temporary'
      anchor='bottom'
      open={customisationDrawer}
      onClose={closeCustomisationDrawer}
      PaperProps={{
        elevation: 0,
        style: {
          borderTopLeftRadius: 'var(--primary-drawer-top-left-border-radius)',
          borderTopRightRadius: 'var(--primary-drawer-top-right-border-radius)',
          maxWidth: '768px',
          margin: 'auto',
        },
      }}
    >
      <div className={styles.wrapper}>
        <div className={styles.drawerNotch}></div>
        <h3 className={styles.title}>{t('Repeat last used customization?')} </h3>

        <div className={styles.priceContainer}>
          {selectedItem?.title && <p className={styles.itemTitle}>{selectedItem?.title}</p>}
        </div>
        {(selectedItem?.customisation ?? [])?.length > 0 && (
          <p className={styles.itemDescriptionCust}>
            {selectedItem?.customisation?.map((item: any, index: any) => (
              <span key={index} className={styles.customisation}>
                <span className={styles.grayText}>
                  {item?.name}
                  {index !== selectedItem?.customisation.length - 1 ? ', ' : ''}
                </span>
                <br />
              </span>
            ))}
          </p>
        )}
        {(selectedItem?.addons ?? [])?.length > 0 && (
          <p className={styles.itemDescription}>
            <span className={styles.addonsTitle}>{t('Add-ons')} :</span>
            {selectedItem?.addons?.map((item: any, index: any) => (
              <span key={index} className={styles.item}>
                {item?.name}
                {' - '}
                <span className={styles.currencyItems}>
                  <span className={isIRDv2 ? 'globals-irdv2-irdPrice' : ''}>{currency} </span>{' '}
                  {formatPriceIRD(item?.priceInDecimal)}
                </span>
              </span>
            ))}
          </p>
        )}
        {(selectedItem?.groupedAddons ?? [])?.length > 0 && (
          <p className={styles.itemDescription}>
            <span className={styles.addonsTitle}>{t('Grouped Add-ons')} :</span>
            {selectedItem?.groupedAddons?.map((item: any, index: any) => (
              <span key={index} className={styles.item}>
                {item?.name}
                {' - '}
                <span className={styles.currencyItems}>
                  <span className={isIRDv2 ? 'globals-irdv2-irdPrice' : ''}>{currency} </span>
                  {formatPriceIRD(item?.price)}
                </span>
              </span>
            ))}
          </p>
        )}
        {selectedItem?.price && (
          <>
            <p className={styles.itemPrice}>
              <span className={styles.addonsTitle}>{t('Total Item Price :')}</span>
              <div>
                <span className={cx(styles.currency, { 'globals-irdv2-irdPrice': isIRDv2 })}>{currency} </span>{' '}
                <span className={styles.currencyValue}>
                  {formatPriceIRD(selectedItem?.price + totalAddons)}
                </span>
              </div>
            </p>
          </>
        )}
        {selectedItem?.cookingInstruction && (
          <p className={styles.itemDescription}>
            <span className={styles.grayText}>{t('Instructions')}</span>:{' '}
            {selectedItem?.cookingInstruction}
          </p>
        )}
        <div className={styles.buttonContainer}>
          <StyledButton variant='outlined' className={styles.buttonLeft} onClick={handleAddNew}>
            {t('Add New')}
          </StyledButton>

          <StyledButton
            variant='contained'
            className={styles.buttonRight}
            onClick={handleRepeatLast}
          >
            {t('Repeat Last')}
          </StyledButton>
        </div>
      </div>
    </Drawer>
  );
};
