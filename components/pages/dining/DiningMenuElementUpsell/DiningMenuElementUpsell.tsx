import { PlusMinusInput } from 'components/shared/PlusMinusInput/PlusMinusInput';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './DiningMenuElementUpsell.module.scss';
import { IDiningMenuElementProps } from './DiningMenuElementUpsell.types';
import { diningMenuStorage } from 'storage/dining-menu.storage';
import { StableImage } from 'components/shared/StableImage/StableImage';
import { ASSETS_URL, CURRENCY } from 'core/graphql/endpoints';
import produce from 'immer';
import { useReactiveVar } from '@apollo/client';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import cx from 'classnames';
import { useCurrency } from 'utils/hooks/useConfiguration';

export const DiningMenuElementUpsell: React.FC<IDiningMenuElementProps> = ({
  title,
  description,
  price,
  id,
  image,
  code,
}) => {
  const { t } = useTranslation('dining-menu');
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

        draft.selectedItemId = id;
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
        draft.selectedItemId = id;
      }),
    );
  }, [id]);

  return (
    <div className={styles.card}>
      <div className={styles.contentWrapper} onClick={onClickPlus}>
        <h4 className={cx(styles.title, { [styles.titleWithImage]: image })}>{title}</h4>
        {description && (
          <p className={cx(styles.description, { [styles.descriptionWithImage]: image })}>
            {description}
          </p>
        )}
        <p className={styles.currency}>
          {currency} <span className={styles.price}>{price?.toFixed(2)}</span>
        </p>
      </div>
      <div className={styles.imageWrapper}>
        <div className={styles.pointer} onClick={onClickPlus}>
          {image && <StableImage className={styles.image} src={`${ASSETS_URL}/${image}`} />}
        </div>
        {totalQuantity == 0 ? (
          <StyledButton onClick={onClickPlus} className={cx(styles.addCta)} variant='contained'>
            {t('Add')}
          </StyledButton>
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
