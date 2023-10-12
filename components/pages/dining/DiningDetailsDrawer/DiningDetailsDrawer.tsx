import { PlusMinusInput } from 'components/shared/PlusMinusInput/PlusMinusInput';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import Cookinginstructions from '@icons/cooking_instructions.svg';
import React, { useCallback, useEffect, useState } from 'react';
import styles from './DiningDetailsDrawer.module.scss';
import { useTranslation } from 'react-i18next';
import { useQuery, useReactiveVar } from '@apollo/client';
import { diningMenuStorage, toggleDiningDetailsDrawer } from 'storage/dining-menu.storage';
import { useLocale, useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { StableImage } from 'components/shared/StableImage/StableImage';
import { ASSETS_URL, CURRENCY } from 'core/graphql/endpoints';
import produce from 'immer';
import { IRDMenuApiResponse, IRD_MENU } from 'core/graphql/queries/IRD_MENU';
import { DiningCheckboxItem } from 'components/pages/dining/DiningCheckboxItem/DiningCheckboxItem';
import { InputAdornment } from '@mui/material';
import { DiningMenuElementSkeleton } from 'components/pages/dining/DiningMenuElementSkeleton/DiningMenuElementSkeleton';
import { sortBy } from 'lodash';
import TextField from '@mui/material/TextField';
import { iconsMap } from 'utils/hamburger/hamburgerIconsMap';
import { irdActiveMenuList } from 'utils/functions';
import { addToCartEvent } from 'utils/gtag';
import cx from 'classnames';
import { CustomDrawer } from 'components/shared/CustomDrawer/CustomDrawer';

const DiningDetailsDrawer = () => {
  const { t } = useTranslation(['dining', 'common']);
  const navigate = useLocalizedRouter();
  const locale = useLocale();
  const selectedItemId = useReactiveVar(diningMenuStorage)?.selectedItemId;
  const diningDetailsDrawerStatus = useReactiveVar(toggleDiningDetailsDrawer);
  const [count, setCount] = useState<number>(1);
  const [instruction, setinstruction] = useState('');
  const [updateAddons, setupdateAddons] = useState(false);
  const [totalAddons, settotalAddons] = useState<number>(0);
  const [customisation, setCustomisation] = useState<any>([]);
  const [addonsWarning, setAddonsWarning] = useState(false);
  const [addons, setAddons] = useState<
    {
      code: string;
      id: string;
      name: string;
      price: number;
    }[]
  >();

  const { data, loading } = useQuery<IRDMenuApiResponse>(IRD_MENU, {
    context: { clientName: 'host_v2' },
    variables: {
      restaurantId:
        (typeof window !== 'undefined' &&
          localStorage.getItem('restaurantId') &&
          JSON.parse(localStorage.getItem('restaurantId') ?? '')) ??
        '',
      lang: locale === 'en' ? '' : locale,
    },
    fetchPolicy: 'no-cache',
  });

  const irdMenu = irdActiveMenuList(data);

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

  const selectedItem =
    selectedItemId && irdItemsList?.find((item: any) => item?.id === selectedItemId);

  useEffect(() => {
    if (selectedItem?.addOnLimit) {
      if ((addons ?? [])?.length > selectedItem?.addOnValue) {
        setAddonsWarning(true);
      } else {
        setAddonsWarning(false);
      }
    }
    settotalAddons((addons ?? [])?.reduce((acc, addon) => acc + addon?.price, 0));
  }, [addons, updateAddons, totalAddons, selectedItem?.addOnLimit, selectedItem?.addOnValue]);

  useEffect(() => {
    if (!selectedItemId || count === 0) {
      toggleDiningDetailsDrawer(false);
      setCount(1);
    }
  }, [count, navigate, selectedItemId]);

  const incrementCount = useCallback(() => {
    setCount((state) => state + 1);
  }, []);

  const decrementCount = useCallback(() => {
    setCount((state) => state - 1);
  }, []);

  const handleSelectedCustomisation = (e: any, customisationItem: any, subData: any) => {
    const selectedCustomization = {
      ingredient: customisationItem.ingredient,
      name: e.target.value,
      code: subData.code,
      id: subData.id,
    };

    const updatedCustomizations = customisation?.filter(
      (customization: any) => customization?.ingredient !== customisationItem?.ingredient,
    );

    updatedCustomizations?.push(selectedCustomization);

    setCustomisation(updatedCustomizations);
  };

  const cookingInstructions = useCallback((event: any) => {
    setinstruction(event?.target.value);
  }, []);

  const closeDrawer = useCallback(() => {
    toggleDiningDetailsDrawer(false);
    setCustomisation([]);
    setAddons([]);
    setCount(1);
    diningMenuStorage(
      produce(diningMenuStorage(), (draft) => {
        draft.selectedItemId = '';
      }),
    );
  }, []);

  const handleAdd = useCallback(() => {
    const customisationData = sortBy(customisation, (item) => item?.name);
    const addOnsData = sortBy(addons, (item) => item?.name);

    diningMenuStorage(
      produce(diningMenuStorage(), (draft) => {
        const item = draft?.items?.find(
          (el) =>
            el?.itemId === selectedItemId &&
            (el?.customisation ?? [])?.length === 0 &&
            (el?.addons ?? [])?.length === 0 &&
            customisation?.length === 0 &&
            addOnsData?.length === 0,
        );

        const itemBoth = draft?.items.find(
          (el) =>
            el.itemId === selectedItemId &&
            addOnsData?.length === 0 &&
            (el?.addons ?? [])?.length > 0 &&
            JSON.stringify(addOnsData) ===
              JSON.stringify(sortBy(el?.addons, (item) => item?.name)) &&
            JSON.stringify(customisationData) ===
              JSON.stringify(sortBy(el?.customisation, (item) => item?.name)),
          // customisation?.ingredient &&
          // el?.customisation?.ingredient &&
          // el?.customisation?.ingredient === customisation?.ingredient &&
          // el?.customisation?.code === customisation?.code,
        );

        const itemCustomisation = draft?.items.find(
          (el) =>
            el.itemId === selectedItemId &&
            customisation?.ingredient &&
            (el?.customisation ?? [])?.length > 0 &&
            el?.customisation?.ingredient === customisation?.ingredient &&
            el?.customisation?.code === customisation?.code &&
            addOnsData?.length === 0,
        );

        const itemAddons = draft?.items.find(
          (el) =>
            el.itemId === selectedItemId &&
            addOnsData?.length > 0 &&
            (el?.addons ?? [])?.length > 0 &&
            el?.customisation?.ingredient === customisation?.ingredient &&
            JSON.stringify(addOnsData) === JSON.stringify(sortBy(el?.addons, (item) => item?.name)),
        );

        if (itemBoth) {
          itemBoth.quantity += count;
          // console.log('Both matches');
        } else if (itemCustomisation) {
          itemCustomisation.quantity += count;
          // console.log('Cust matches');
        } else if (itemAddons) {
          itemAddons.quantity += count;
          // console.log('Addons matches');
        } else {
          // console.log('No match');
          if (customisation?.length > 0 || addOnsData?.length > 0) {
            if (addOnsData?.length > 0 && customisation?.length > 0) {
              draft.items.push({
                itemId: selectedItem?.id,
                quantity: count,
                code: selectedItem?.code ?? '',
                price: selectedItem?.price ?? 0,
                title: selectedItem?.name ?? '',
                cookingInstruction: instruction ?? '',
                customisation: customisationData,
                addons: addOnsData,
                upsell: selectedItem?.upsell ?? [],
              });
              // console.log('Customisation & Addons only');
            } else if (customisation?.length > 0) {
              draft.items.push({
                itemId: selectedItem?.id,
                quantity: count,
                code: selectedItem?.code ?? '',
                price: selectedItem?.price ?? 0,
                title: selectedItem?.name ?? '',
                cookingInstruction: instruction ?? '',
                customisation: customisation,
                upsell: selectedItem?.upsell ?? [],
              });
              // console.log('Customisation only');
            } else if (addOnsData?.length > 0) {
              draft.items.push({
                itemId: selectedItem?.id,
                quantity: count,
                code: selectedItem?.code ?? '',
                price: selectedItem?.price ?? 0,
                title: selectedItem?.name ?? '',
                cookingInstruction: instruction ?? '',
                addons: addOnsData,
                upsell: selectedItem?.upsell ?? [],
              });
              // console.log('Addons only');
            }
          } else {
            if (item) {
              if (!customisation?.ingredient && addOnsData.length === 0) {
                // console.log(
                //   'No customisation or addons selected or Customisation or addons does not exist',
                // );
                item.quantity += count;
                // console.log(item.quantity);
              }
            } else {
              draft.items.push({
                itemId: selectedItem?.id,
                quantity: count,
                price: selectedItem?.price ?? 0,
                cookingInstruction: instruction ?? '',
                title: selectedItem?.name ?? '',
                code: selectedItem?.code ?? '',
                upsell: selectedItem?.upsell ?? [],
              });
              // console.log('Added');
            }
          }
        }
      }),
    );
    const item = {
      id: selectedItem?.id,
      name: selectedItem?.name,
      price: selectedItem?.price,
      quantity: count,
    };
    addToCartEvent(item);
    closeDrawer();
  }, [
    addons,
    closeDrawer,
    count,
    customisation,
    instruction,
    selectedItem?.code,
    selectedItem?.id,
    selectedItem?.name,
    selectedItem?.price,
    selectedItem?.upsell,
    selectedItemId,
  ]);

  const diningDetails = () => {
    const filteredCustomisation = selectedItem?.customisation?.map((customisationItem: any) =>
      customisationItem?.customisations?.filter((item: any) => item?.status),
    );

    return (
      <>
        {' '}
        {loading ? (
          <>
            <DiningMenuElementSkeleton />
            <DiningMenuElementSkeleton />
            <DiningMenuElementSkeleton />
            <DiningMenuElementSkeleton />
            <DiningMenuElementSkeleton />
          </>
        ) : (
          <>
            {selectedItem && selectedItem?.images[0]?.ratio16to9 ? (
              <StableImage
                className={styles.image}
                src={`${ASSETS_URL}/${selectedItem?.images[0]?.ratio16to9}`}
              />
            ) : (
              <div className='imagePlaceHolderAnimation' />
            )}
            {selectedItem?.name && (
              <div className={styles.titleWrapper}>
                <h3
                  className={cx(styles.title, {
                    [styles.titleWithImage]: selectedItem?.images[0],
                  })}
                >
                  {selectedItem?.name}
                </h3>
              </div>
            )}
            <div className={styles.wrapper}>
              {selectedItem?.allergens && (
                <div className={styles.tagsWrapper}>
                  {selectedItem?.allergens
                    ?.filter?.((allergen: any) => allergen?.status)
                    ?.map((tags: any, key: any) => {
                      const IconComponent =
                        iconsMap[tags.name.toLowerCase() as keyof typeof iconsMap];
                      return (
                        <div key={key} className={styles.tags}>
                          {IconComponent && <IconComponent className={styles.allergens} />}
                          {tags?.name}
                        </div>
                      );
                    })}
                </div>
              )}
              {selectedItem?.description && (
                <p className={styles.description}>{selectedItem?.description}</p>
              )}

              {selectedItem?.ingredients && (
                <>
                  <h4 className={styles.ingredientsText}>{t('Ingredients')}</h4>
                  <p className={styles.ingredientsDescription}>{selectedItem?.ingredients}</p>
                </>
              )}

              {selectedItem?.customisation?.map((customisationItem: any, index: number) => (
                <div key={index}>
                  <div className={styles.customisationWrapper}>
                    <p className={styles.customisationsText}>{customisationItem?.ingredient}</p>

                    {!customisation?.some(
                      (selected: any) => selected.ingredient === customisationItem.ingredient,
                    ) && <p className={styles.optionalTextWarning}>{t('Required')}</p>}
                  </div>
                  <div className={styles.customisations}>
                    {customisationItem?.customisations
                      ?.filter((item: any) => item?.status)
                      ?.map((el: any, index: any) => (
                        <div key={index} className={styles.radioItemWrapper}>
                          <StyledButton
                            onClick={(e) => handleSelectedCustomisation(e, customisationItem, el)}
                            className={cx(styles.customizationInactive, {
                              [styles.customizationActive]: customisation?.some(
                                (customization: any) =>
                                  customization?.ingredient === customisationItem?.ingredient &&
                                  customization?.name === el?.name,
                              ),
                            })}
                            variant='contained'
                            value={el.name}
                          >
                            {el.name}
                          </StyledButton>
                        </div>
                      ))}
                  </div>
                </div>
              ))}

              {selectedItem?.addons && (
                <>
                  <div className={styles.addonsRow}>
                    <p className={styles.addonsText}>{t('Add-Ons')}</p>
                    {addonsWarning ? (
                      <p className={styles.optionalTextWarning}>{t('Limit exceeded')}</p>
                    ) : (
                      <p className={styles.optionalText}>
                        {/* {t('Select up to option(s)', { value: selectedItem?.addOnValue })} */}
                        Select up to {selectedItem?.addOnValue} option(s)
                      </p>
                    )}
                  </div>
                  <div className={styles.irdCheckboxItemWrapper}>
                    {selectedItem?.addons
                      ?.filter((item: any) => item?.status)
                      ?.map((el: any, index: any) => (
                        <div key={index}>
                          <DiningCheckboxItem
                            setupdateAddons={setupdateAddons}
                            updateAddons={updateAddons}
                            element={el}
                            selectedItemId={selectedItemId}
                            addons={addons ?? []}
                            setAddons={setAddons}
                            checked={addons?.some((item) => item?.id === el?.id) ? true : false}
                          />
                        </div>
                      ))}
                  </div>
                </>
              )}

              <TextField
                autoComplete='off'
                fullWidth
                color='success'
                className={styles.textInput}
                id='input-with-icon-textfield'
                placeholder={`${t('Add instructions')}`}
                onChange={cookingInstructions}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <Cookinginstructions />
                    </InputAdornment>
                  ),
                  classes: {
                    underline: styles.customUnderline,
                  },
                  inputProps: {
                    maxLength: 30,
                    style: {
                      font: '14px var(--primary-font-heading)',
                      color: 'var(--tertiary-text-color)',
                      marginInlineStart: '0.5rem',
                    },
                  },
                }}
                variant='standard'
              />

              {selectedItem?.price && (
                <>
                  <p className={styles.priceText}>{t('total item price')}</p>
                  <p className={styles.totalItemPrice}>
                    {CURRENCY}{' '}
                    <span className={styles.price}>
                      {' '}
                      {(selectedItem?.price + totalAddons)?.toFixed(2)}
                    </span>
                  </p>
                </>
              )}
            </div>
            <div className={styles.counterContainer}>
              <PlusMinusInput
                value={count}
                className={styles.plusMinusInput}
                onClickMinus={decrementCount}
                onClickPlus={incrementCount}
              />

              <div>
                <StyledButton
                  onClick={handleAdd}
                  className={styles.addToCart}
                  variant='contained'
                  disabled={
                    count === 0 ||
                    (selectedItem?.customisation?.length > 0 &&
                      filteredCustomisation?.length !== customisation?.length) ||
                    addonsWarning
                  }
                >
                  {t('Add to cart')}
                </StyledButton>
              </div>
            </div>
          </>
        )}
      </>
    );
  };

  return (
    <CustomDrawer
      open={diningDetailsDrawerStatus}
      onClose={closeDrawer}
      content={diningDetails()}
    />
  );
};

export default DiningDetailsDrawer;
