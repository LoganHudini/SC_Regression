import { PlusMinusInput } from 'components/shared/PlusMinusInput/PlusMinusInput';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './DiningMenuElement.module.scss';
import { IDiningMenuElementProps } from './DiningMenuElement.types';
import { diningMenuStorage, toggleDiningDetailsDrawer } from 'storage/dining-menu.storage';
import { StableImage } from 'components/shared/StableImage/StableImage';
import { ASSETS_URL } from 'core/graphql/endpoints';
import produce from 'immer';
import { useReactiveVar } from '@apollo/client';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import { DiningCustomisationDrawer } from 'components/pages/dining/DiningCustomisationDrawer/DiningCustomisationDrawer';
import cx from 'classnames';
import { addToCartEvent, viewItemEvent } from 'utils/gtag';
import { useCurrency } from 'utils/hooks/useCurrency';
import { activeModule, formatPriceIRD } from 'utils/functions';
import { useConfig } from 'utils/hooks/useConfiguration';
import { IN_ROOM_DINING } from 'utils/constants';
import { iconsMap } from 'utils/hamburger/hamburgerIconsMap';

export const DiningMenuElement: React.FC<IDiningMenuElementProps> = ({
  title,
  description,
  price,
  id,
  image,
  customisation,
  menuAvailability,
  ingredients,
  tags,
  allergens,
  categoryName,
}) => {
  const { t } = useTranslation('dining');
  const [customisationDrawer, setCustomisationDrawer] = useState(false);
  const diningData = useReactiveVar(diningMenuStorage);
  const config = useConfig();
  const currency = useCurrency();
  const irdModule: any = activeModule(config?.modules, IN_ROOM_DINING);
  /*eslint-disable*/
  const isChefSpecial = categoryName === "Chef's Special";

  const totalQuantity = diningData?.items
    ?.filter((el) => el.itemId === id && el.quantity > 0)
    .reduce((acc, el) => acc + el.quantity, 0);

  const handleDiningDetails = useCallback(() => {
    diningMenuStorage(
      produce(diningMenuStorage(), (draft) => {
        draft.selectedItemId = id;
      }),
    );
    const item = { id: id, name: title, price: price, currency: currency };
    viewItemEvent(item);
    toggleDiningDetailsDrawer(true);
  }, [currency, id, price, title]);

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
                currency: currency,
              }));

          draft.selectedItemId = id;
          draft.selectedIndex = draft.items.lastIndexOf(item);
        }
      }),
    );
  }, [currency, customisation, diningData?.items, id]);

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
    <div>
      <div className={cx(styles.card, 'irdV2FLow')}>
        <div className={styles.contentWrapper} onClick={handleDiningDetails}>
          <h4 className={cx(styles.title, { [styles.titleWithImage]: image })}>{title}</h4>
          {description && (
            <p className={cx(styles.description, { [styles.descriptionWithImage]: image })}>
              {description}
            </p>
          )}
          <p className={styles.currency}>
            {currency} <span className={styles.price}>{formatPriceIRD(price)}</span>
          </p>
        </div>
        <div className={styles.imageWrapper}>
          <div className={styles.pointer} onClick={handleDiningDetails}>
            {image && <StableImage className={styles.image} src={`${ASSETS_URL}/${image}`} />}
          </div>
          {irdModule &&
            (totalQuantity == 0 ? (
              <StyledButton
                onClick={handleDiningDetails}
                className={cx(styles.addCta)}
                variant='contained'
                disabled={!menuAvailability}
              >
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
            ))}
          {customisation && irdModule && (
            <p className={styles.customisableText} onClick={handleDiningDetails}>
              {t('customizable')}
            </p>
          )}
        </div>
        <DiningCustomisationDrawer
          customisationDrawer={customisationDrawer}
          closeCustomisationDrawer={closeCustomisationDrawer}
        />
      </div>

      <div
        className={cx(styles.cardV2, 'irdV2FlowShow', { [styles.chefSpecialCard]: isChefSpecial })}
      >
        <div className={styles.contentV2Wrapper}>
          <StableImage
            className={styles.imageV2}
            src={`${ASSETS_URL}/${image}`}
            onClick={handleDiningDetails}
          />

          <div className={styles.detailsWrapperContentV2} onClick={handleDiningDetails}>
            {tags?.name && (
              <span className={cx(styles.tagTitleV2, { [styles.chefSpecialTag]: isChefSpecial })}>
                {tags?.name}
              </span>
            )}
            <p className={styles.titleV2}>{title}</p>

            <p className={cx(styles.descriptionV2, { [styles.descriptionWithImage]: image })}>
              {ingredients} {formatPriceIRD(price)}
            </p>
            <div className={styles.allergensWrapper}>
              {allergens &&
                allergens.length > 0 &&
                allergens.map((tag: any, index: number) => {
                  const key: any = tag?.name?.toLowerCase();
                  const Icon = iconsMap[key] as any;
                  return Icon ? <Icon key={index} /> : null;
                })}
            </div>
          </div>
        </div>
        <div className={styles.V2BtnWrapper}>
          {irdModule &&
            (totalQuantity == 0 ? (
              <StyledButton
                onClick={handleDiningDetails}
                className={cx(styles.addCta)}
                variant='contained'
                disabled={!menuAvailability}
              >
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
            ))}
          {customisation && irdModule && (
            <p className={styles.customisableText} onClick={handleDiningDetails}>
              {t('customizable')}
            </p>
          )}
        </div>
        <DiningCustomisationDrawer
          customisationDrawer={customisationDrawer}
          closeCustomisationDrawer={closeCustomisationDrawer}
        />
      </div>
    </div>
  );
};
