import { PlusMinusInput } from 'components/shared/PlusMinusInput/PlusMinusInput';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './DiningMenuElement.module.scss';
import { IDiningMenuElementProps } from './DiningMenuElement.types';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { availablePaths } from 'utils/availablePaths';
import { diningMenuStorage } from 'storage/dining-menu.storage';
import { StableImage } from 'components/shared/StableImage/StableImage';
import { ASSETS_URL, CURRENCY } from 'core/graphql/endpoints';
import produce from 'immer';
import { useReactiveVar } from '@apollo/client';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import { DiningCustomisationDrawer } from 'components/pages/dining-menu/DiningCustomisationDrawer/DiningCustomisationDrawer';
import { toast } from 'react-toastify';
import cx from 'classnames';
import { addToCartEvent, viewItemEvent } from 'utils/gtag';

export const DiningMenuElement: React.FC<IDiningMenuElementProps> = ({
  title,
  description,
  price,
  id,
  image,
  customisation,
  menuAvailability,
}) => {
  const { t } = useTranslation('dining');
  const navigate = useLocalizedRouter();
  const [customisationDrawer, setCustomisationDrawer] = useState(false);
  const tableNumber =
    (typeof window !== 'undefined' &&
      localStorage.getItem('tableNumber') &&
      JSON.parse(localStorage.getItem('tableNumber') ?? '')) ??
    '';
  const restaurantId =
    (typeof window !== 'undefined' &&
      localStorage.getItem('restaurantId') &&
      JSON.parse(localStorage.getItem('restaurantId') ?? '')) ??
    '';
  const diningData = useReactiveVar(diningMenuStorage);
  const totalQuantity = diningData?.items
    ?.filter((el) => el.itemId === id && el.quantity > 0)
    .reduce((acc, el) => acc + el.quantity, 0);

  const handleDiningDetails = useCallback(() => {
    if (tableNumber === '' && restaurantId !== '') {
      toast(t('Scan QR Code to proceed'), { type: 'error' });
    } else {
      diningMenuStorage(
        produce(diningMenuStorage(), (draft) => {
          draft.selectedItemId = id;
        }),
      );
      const item = { id: id, name: title, price: price };
      viewItemEvent(item);
      navigate(availablePaths.DINING_DETAILS);
    }
  }, [id, navigate, price, restaurantId, t, tableNumber, title]);

  const onClickPlus = useCallback(() => {
    const selectedItem = diningData?.items?.find((item) => item?.itemId === id);
    diningMenuStorage(
      produce(diningMenuStorage(), (draft) => {
        const items = draft?.items?.filter((el) => el.itemId === id);
        const item = items[items.length - 1];
        if (item) {
          customisation || (item?.addons ?? []).length > 0
            ? setCustomisationDrawer((state) => !state)
            : (item.quantity++,
              addToCartEvent({
                id: selectedItem?.itemId,
                name: selectedItem?.title,
                price: selectedItem?.price,
                quantity: 1,
              }));

          draft.selectedItemId = id;
          draft.selectedIndex = draft.items.lastIndexOf(item);
        }
      }),
    );
  }, [customisation, diningData?.items, id]);

  const closeCustomisationDrawer = useCallback(() => {
    setCustomisationDrawer((state) => !state);
  }, []);

  const onClickMinus = useCallback(() => {
    diningMenuStorage(
      produce(diningMenuStorage(), (draft) => {
        draft.items.reverse();
        const item = draft?.items?.find((el) => el.itemId === id && el.quantity > 0);
        if (item) {
          item.quantity--;
        }
        draft.items = draft.items?.filter((item) => item.quantity > 0).reverse();
        draft.selectedItemId = id;
      }),
    );
  }, [id]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div
          className={cx(styles.topWrapper, { [styles.disable]: !menuAvailability })}
          onClick={handleDiningDetails}
        >
          <div className={styles.titleDescriptionWrapper}>
            <div className={styles.titleRow}>
              <div className={styles.title}>{title}</div>
            </div>
            {description && (
              <p className={image ? styles.description : styles.noDescription}>{description}</p>
            )}
          </div>
          <p className={styles.servingsText}>
            {CURRENCY} <span className={styles.price}>{price?.toFixed(2)}</span>
          </p>
        </div>
        <div className={styles.servingsRow}>
          <div className={styles.servingsCounter}>
            <div className={styles.pointer} onClick={handleDiningDetails}>
              {image && <StableImage className={styles.image} src={`${ASSETS_URL}/${image}`} />}
            </div>
            {totalQuantity == 0 ? (
              <StyledButton
                onClick={handleDiningDetails}
                className={cx(styles.totalButton, { [styles.menuUnavailable]: !menuAvailability })}
                variant='contained'
              >
                {t('Add')}
              </StyledButton>
            ) : (
              <div className={styles.counterStyle}>
                <PlusMinusInput
                  value={totalQuantity || 0}
                  onClickPlus={onClickPlus}
                  onClickMinus={onClickMinus}
                />
              </div>
            )}
            {customisation && (
              <p className={styles.customisableText} onClick={handleDiningDetails}>
                {t('customisable')}
              </p>
            )}
          </div>
        </div>
        <DiningCustomisationDrawer
          customisationDrawer={customisationDrawer}
          closeCustomisationDrawer={closeCustomisationDrawer}
        />
      </div>
    </div>
  );
};
