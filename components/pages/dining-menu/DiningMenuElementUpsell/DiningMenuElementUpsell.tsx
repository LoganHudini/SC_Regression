import { PlusMinusInput } from 'components/shared/PlusMinusInput/PlusMinusInput';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './DiningMenuElementUpsell.module.scss';
import { IDiningMenuElementProps } from './DiningMenuElementUpsell.types';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { availablePaths } from 'utils/availablePaths';
import { diningMenuStorage } from 'storage/dining-menu.storage';
import { StableImage } from 'components/shared/StableImage/StableImage';
import { ASSETS_URL, CURRENCY } from 'core/graphql/endpoints';
import produce from 'immer';
import { useReactiveVar } from '@apollo/client';

export const DiningMenuElementUpsell: React.FC<IDiningMenuElementProps> = ({
  title,
  description,
  price,
  id,
  image,
  customisation,
  code,
}) => {
  const { t } = useTranslation('dining-menu');
  const navigate = useLocalizedRouter();

  const diningData = useReactiveVar(diningMenuStorage);
  const totalQuantity = diningData?.items
    ?.filter((el) => el.itemId === id && el.quantity > 0)
    .reduce((acc, el) => acc + el.quantity, 0);

  const handleDiningDetails = useCallback(() => {
    diningMenuStorage(
      produce(diningMenuStorage(), (draft) => {
        draft.selectedItemId = id;
      }),
    );
    navigate(availablePaths.DINING_DETAILS);
  }, [id, navigate]);

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
    <div className={styles.wrapper}>
      <div className={styles.topWrapper} onClick={handleDiningDetails}>
        {image && <StableImage className={styles.image} src={`${ASSETS_URL}/${image}`} />}
        <div className={styles.titleDescriptionWrapper}>
          <div className={styles.titleRow}>
            <div className={styles.title}>{title}</div>
            <div className={styles.currency}>
              {CURRENCY} <span className={styles.price}>{price}</span>
            </div>
          </div>
          <p className={description ? styles.description : styles.noDescription}>{description}</p>
        </div>
      </div>
      <div className={styles.servingsRow}>
        <p className={styles.servingsText}>{t('Servings')}</p>
        {customisation && <p className={styles.customisableText}>{t('customisable')}</p>}
        <div className={styles.servingsCounter}>
          <PlusMinusInput
            value={totalQuantity || 0}
            onClickPlus={onClickPlus}
            onClickMinus={onClickMinus}
          />
        </div>
      </div>
    </div>
  );
};
