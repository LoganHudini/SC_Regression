import { PlusMinusInput } from 'components/shared/PlusMinusInput/PlusMinusInput';
import React, { useCallback } from 'react';
import styles from './DiningMenuElementUpsell.module.scss';
import { IDiningMenuElementProps } from './DiningMenuElementUpsell.types';
import { diningMenuStorage, toggleDiningDetailsDrawer } from 'storage/dining-menu.storage';
import { irdMenuOutputDetailsStorage } from 'storage/dining.storage';

import produce from 'immer';
import { useReactiveVar } from '@apollo/client';
import cx from 'classnames';
import { useCurrency } from 'utils/hooks/useCurrency';
import { findModule, formatPriceIRD, irdActiveMenuList } from 'utils/functions';
import { useConfig } from 'utils/hooks/useConfiguration';
import { IN_ROOM_DINING } from 'utils/constants';
import { hotelInfoStorage } from 'storage/home.storage';
import { IRDMenuApiResponse } from 'core/graphql/queries/IRD_MENU';

export const DiningMenuElementUpsell: React.FC<IDiningMenuElementProps> = ({
  title,
  price,
  id,
  image,
  code,
  setCustomisationDrawer,
}) => {
  const diningData = useReactiveVar(diningMenuStorage);
  const totalQuantity = diningData?.items
    ?.filter((el) => el.itemId === id && el.quantity > 0)
    .reduce((acc, el) => acc + el.quantity, 0);
  const currency = useCurrency();

  const data = useReactiveVar(irdMenuOutputDetailsStorage) as IRDMenuApiResponse;
  const irdMenu = irdActiveMenuList(
    data,
    useReactiveVar(hotelInfoStorage)?.getPropertyDetailsByHotelId?.hotel?.location?.timezone,
  );

  let irdItemsList: any = [];
  irdMenu?.forEach((irdItem: any) =>
    irdItem?.categories?.forEach?.((categoryItem: any) => {
      categoryItem?.items?.length > 0 && (irdItemsList = [...irdItemsList, ...categoryItem.items]);
      categoryItem?.subCategories?.forEach((subCategoryItem: any) => {
        subCategoryItem?.items?.length > 0 &&
          (irdItemsList = [...irdItemsList, ...subCategoryItem.items]);
      });
    }),
  );

  const menuItem = irdItemsList?.find((item: any) => item?.id === id);

  const removeFromAllUpsellLists = useCallback((itemId: string) => {
    diningMenuStorage(
      produce(diningMenuStorage(), (draft) => {
        draft?.items?.forEach((item) => {
          if (item?.upsell) {
            item.upsell = item?.upsell?.filter((upsell) => upsell?.id !== itemId);
          }
        });
      }),
    );
  }, []);

  const onClickPlus = useCallback(() => {
    const existingItem = diningData?.items?.find(
      (item) =>
        item.itemId === id &&
        (item?.customisation?.length > 0 ||
          item?.addons?.length > 0 ||
          item?.groupedAddons?.length > 0),
    );

    if (existingItem) {
      diningMenuStorage(
        produce(diningMenuStorage(), (draft) => {
          draft.selectedItemId = id;
          draft.selectedIndex = diningData?.items?.findIndex((item) => item.itemId === id) || 0;
        }),
      );
      removeFromAllUpsellLists(id);
      setCustomisationDrawer(true);
    } else {
      const hasCustomization = menuItem?.customisation?.length > 0;
      const hasAddons = menuItem?.addons?.length > 0;
      const hasGroupedAddons = menuItem?.groupedAddon?.length > 0;

      if (hasCustomization || hasAddons || hasGroupedAddons) {
        diningMenuStorage(
          produce(diningMenuStorage(), (draft) => {
            draft.selectedItemId = id;
            draft.selectedIndex = -1;

            const selectedItem = draft?.items?.find(
              (item) => item?.itemId === draft?.selectedItemId,
            );
            if (selectedItem && selectedItem.upsell) {
              selectedItem.upsell = selectedItem?.upsell?.filter((item) => item?.id !== id);
            }
          }),
        );
        toggleDiningDetailsDrawer(true);
      } else {
        diningMenuStorage(
          produce(diningMenuStorage(), (draft) => {
            const item = draft.items.find((el) => el.itemId === id);

            if (item) {
              item.quantity++;
            } else {
              draft.items.push({
                itemId: id,
                quantity: 1,
                price,
                title,
                code,
              });
            }
          }),
        );
        removeFromAllUpsellLists(id);
      }
    }
  }, [
    code,
    id,
    price,
    title,
    menuItem,
    diningData?.items,
    setCustomisationDrawer,
    removeFromAllUpsellLists,
  ]);

  const onClickMinus = useCallback(() => {
    diningMenuStorage(
      produce(diningMenuStorage(), (draft) => {
        const itemBoth = draft?.items?.find(
          (el) =>
            el.itemId === id &&
            (el?.addons ?? [])?.length > 0 &&
            el?.customisation?.ingredient &&
            el?.customisation?.code &&
            el.quantity > 0,
        );

        const itemCustomisation = draft?.items?.find(
          (el) =>
            el.itemId === id &&
            el?.customisation?.ingredient &&
            el?.customisation?.code &&
            el.quantity > 0,
        );

        const itemAddons = draft?.items?.find(
          (el) => el.itemId === id && (el?.addons ?? [])?.length > 0 && el.quantity > 0,
        );
        const item = draft?.items?.find((el) => el.itemId === id && el.quantity > 0);

        if (itemBoth) {
          itemBoth.quantity--;
        } else if (itemCustomisation) {
          itemCustomisation.quantity--;
        } else if (itemAddons) {
          itemAddons.quantity--;
        } else if (item) {
          item.quantity--;
        }
        draft.items = draft.items?.filter((item) => item.quantity > 0);
      }),
    );
  }, [id]);
  const config = useConfig();
  interface ModuleContent {
    version?: string;
    [key: string]: unknown;
  }
  const irdModuleContent = findModule(config?.modules, IN_ROOM_DINING) as ModuleContent;
  const isIRDv2 = irdModuleContent?.version === 'v2';

  return (
    <div className={styles.card}>
      <div className={styles.contentWrapper}>
        <h4 className={cx(styles.title, { [styles.titleWithImage]: image })}>{title}</h4>
        <p className={cx(styles.currency)}>
          <span className={isIRDv2 ? 'globals-irdv2-irdPrice' : ''}>{currency} </span>
          <span className={styles.price}>{formatPriceIRD(price)}</span>
        </p>
      </div>

      <div className={styles.imageWrapper}>
        {totalQuantity == 0 ? (
          <span onClick={onClickPlus} className={cx(styles.addCta)}>
            +
          </span>
        ) : (
          <div className={styles.counterStyle}>
            <PlusMinusInput
              value={totalQuantity || 0}
              onClickPlus={onClickPlus}
              onClickMinus={onClickMinus}
              irdSummary
            />
          </div>
        )}
      </div>
    </div>
  );
};
