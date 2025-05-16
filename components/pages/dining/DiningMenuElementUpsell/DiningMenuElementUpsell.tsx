import { PlusMinusInput } from 'components/shared/PlusMinusInput/PlusMinusInput';
import React, { useCallback } from 'react';
import styles from './DiningMenuElementUpsell.module.scss';
import { IDiningMenuElementProps } from './DiningMenuElementUpsell.types';
import { diningMenuStorage } from 'storage/dining-menu.storage';
import produce from 'immer';
import { useReactiveVar } from '@apollo/client';
import cx from 'classnames';
import { useCurrency } from 'utils/hooks/useCurrency';
import { formatPriceIRD } from 'utils/functions';

export const DiningMenuElementUpsell: React.FC<IDiningMenuElementProps> = ({
  title,
  price,
  id,
  image,
  code,
}) => {
  const diningData = useReactiveVar(diningMenuStorage);
  const totalQuantity = diningData?.items
    ?.filter((el) => el.itemId === id && el.quantity > 0)
    .reduce((acc, el) => acc + el.quantity, 0);
  const currency = useCurrency();

  const onClickPlus = useCallback(() => {
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

        // draft.selectedItemId = id;
      }),
    );
  }, [code, id, price, title]);

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
        // draft.selectedItemId = id;
      }),
    );
  }, [id]);

  return (
    <div className={styles.card}>
      <div className={styles.contentWrapper} onClick={onClickPlus}>
        <h4 className={cx(styles.title, { [styles.titleWithImage]: image })}>{title}</h4>
        <p className={styles.currency}>
          {currency} <span className={styles.price}>{formatPriceIRD(price)}</span>
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
