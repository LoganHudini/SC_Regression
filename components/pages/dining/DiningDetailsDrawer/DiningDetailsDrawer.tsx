import { PlusMinusInput } from 'components/shared/PlusMinusInput/PlusMinusInput';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import Cookinginstructions from '@icons/cooking_instructions.svg';
import React, { useCallback, useEffect, useState } from 'react';
import styles from './DiningDetailsDrawer.module.scss';
import { useTranslation } from 'react-i18next';
import { useReactiveVar } from '@apollo/client';
import {
  IDiningMenuStorageData,
  diningMenuStorage,
  editControl,
  toggleDiningDetailsDrawer,
} from 'storage/dining-menu.storage';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import produce from 'immer';
import { IRDMenuApiResponse } from 'core/graphql/queries/IRD_MENU';
import { DiningCheckboxItem } from 'components/pages/dining/DiningCheckboxItem/DiningCheckboxItem';
import { InputAdornment } from '@mui/material';
import { sortBy } from 'lodash';
import { iconsMap } from 'utils/hamburger/hamburgerIconsMap';
import { activeModule, filterLiveMenu, formatPriceIRD, irdActiveMenuList } from 'utils/functions';
import { addToCartEvent } from 'utils/gtag';
import cx from 'classnames';
import { CustomDrawer } from 'components/shared/CustomDrawer/CustomDrawer';
import { useCurrency } from 'utils/hooks/useCurrency';
import CustomCarousel from 'components/shared/CustomCarousel/CustomCarousel';
import { StyledInput } from 'components/shared/StyledInput/StyledInput';
import { useFormik } from 'formik';
import { instructionValidation } from 'validation/dining.validation';
import { useConfig } from 'utils/hooks/useConfiguration';
import { IN_ROOM_DINING } from 'utils/constants';
import { hotelInfoStorage } from 'storage/home.storage';
import { irdMenuOutputDetailsStorage } from 'storage/dining.storage';
import { DiningMenuElementUpsell } from '../DiningMenuElementUpsell/DiningMenuElementUpsell';

type DiningDetailsDrawerProps = {
  menuAvailability?: any;
};
const DiningDetailsDrawer: React.FC<DiningDetailsDrawerProps> = ({ menuAvailability }) => {
  const { t } = useTranslation(['dining', 'common']);
  const navigate = useLocalizedRouter();
  const selectedItemId = useReactiveVar(diningMenuStorage)?.selectedItemId;
  const selectedItemIndex = useReactiveVar(diningMenuStorage)?.selectedIndex;
  const diningData = useReactiveVar(diningMenuStorage) as IDiningMenuStorageData;
  const hotelInformation = useReactiveVar(hotelInfoStorage);
  const diningDetailsDrawerStatus = useReactiveVar(toggleDiningDetailsDrawer);
  const editControlStatus = useReactiveVar(editControl);
  const [count, setCount] = useState<number>(1);
  const [instruction, setInstruction] = useState('');
  const [updateAddons, setupdateAddons] = useState(false);
  const [totalAddons, settotalAddons] = useState<number>(0);
  const [customisation, setCustomisation] = useState<any>([]);
  const [addonsWarning, setAddonsWarning] = useState(false);
  const [groupedAddonsWarning, setGroupedAddonsWarning] = useState(false);
  const [groupedAddonLimitMap, setGroupedAddonLimitMap] = useState<Record<string, number>>({});
  const config = useConfig();
  const irdModule: any = activeModule(config?.modules, IN_ROOM_DINING);

  const [addons, setAddons] = useState<
    {
      code: string;
      id: string;
      name: string;
      price: number;
      comment?: string;
      quantity?: number;
      index?: any;
    }[]
  >();

  const [groupedAddons, setGroupedAddons] = useState<any>([]);
  const data = useReactiveVar(irdMenuOutputDetailsStorage) as IRDMenuApiResponse;

  const irdMenu = irdActiveMenuList(
    data,
    hotelInformation?.getPropertyDetailsByHotelId?.hotel?.location?.timezone,
  );
  const currency = useCurrency();

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

  const selectedItemWithIndex: any = diningData?.items?.find(
    (item: any, index: any) =>
      item?.itemId === selectedItemId && index === diningData?.selectedIndex,
  );

  useEffect(() => {
    if (selectedItemWithIndex && editControlStatus) {
      if (selectedItemWithIndex?.customisation?.length > 0) {
        setCustomisation(selectedItemWithIndex?.customisation);
      }
      if (selectedItemWithIndex?.addons?.length > 0) {
        setAddons(selectedItemWithIndex?.addons);
      }
      if (selectedItemWithIndex?.groupedAddons?.length > 0) {
        setGroupedAddons(selectedItemWithIndex?.groupedAddons);
      }
      setCount(selectedItemWithIndex.quantity || 1);
      setInstruction(selectedItemWithIndex?.cookingInstruction);
    }
  }, [selectedItemWithIndex, editControlStatus]);

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
    if (selectedItem?.groupedAddon && selectedItem?.groupedAddon.length > 0) {
      const groupCounts: Record<string, number> = {};
      const groupLimits: Record<string, number> = {};

      selectedItem.groupedAddon.forEach((group: any, index: number) => {
        const indexKey = index.toString();
        groupLimits[indexKey] = group.limit;
        groupCounts[indexKey] = 0;
      });

      (groupedAddons ?? []).forEach((addon: any) => {
        if (addon.index !== undefined) {
          const indexKey = addon.index.toString();
          groupCounts[indexKey] = (groupCounts[indexKey] || 0) + 1;
        }
      });

      let hasWarning = false;
      Object.keys(groupLimits).forEach((groupIndex) => {
        if ((groupCounts[groupIndex] || 0) > groupLimits[groupIndex]) {
          hasWarning = true;
        }
      });

      setGroupedAddonLimitMap(groupCounts);
      setGroupedAddonsWarning(hasWarning);
    } else {
      setGroupedAddonsWarning(false);
      setGroupedAddonLimitMap({});
    }
  }, [groupedAddons, selectedItem?.groupedAddon, updateAddons]);

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

  const handleSelectedCustomisation = (
    e: any,
    customisationItem: any,
    subData: any,
    index: any,
  ) => {
    const selectedCustomization = {
      ingredient: customisationItem.ingredient,
      name: e.target.value,
      code: subData.code,
      id: subData.id,
      index: index,
    };

    const updatedCustomizations = customisation.filter(
      (val: any) =>
        !(
          val?.ingredient === selectedCustomization.ingredient &&
          val?.index === selectedCustomization.index
        ),
    );

    const existingIndex = updatedCustomizations.findIndex(
      (val: any) =>
        val?.ingredient === selectedCustomization.ingredient &&
        val?.index === selectedCustomization.index &&
        val?.id === selectedCustomization.id &&
        val?.code === selectedCustomization.code &&
        val?.name === selectedCustomization.name,
    );

    if (existingIndex !== -1) {
      updatedCustomizations.splice(existingIndex, 1);
    } else {
      updatedCustomizations.push(selectedCustomization);
    }

    setCustomisation(updatedCustomizations);
  };

  const closeDrawer = useCallback(() => {
    toggleDiningDetailsDrawer(false);
    setCustomisation([]);
    setAddons([]);
    setGroupedAddons([]);
    editControl(false);
    setInstruction('');
    formik.resetForm();
    setCount(1);
    diningMenuStorage(
      produce(diningMenuStorage(), (draft) => {
        draft.selectedItemId = '';
        draft.selectedCategoryId = '';
      }),
    );
  }, []);
  const handleAdd = useCallback(() => {
    const sortedCustomisation: any = sortBy(customisation, (item) => item?.name);
    const sortedAddons = sortBy(addons, (item) => item?.name);
    const sortedGroupedAddons = sortBy(groupedAddons, (item) => item?.name);

    const customisationString = JSON.stringify(sortedCustomisation);
    const addonsString = JSON.stringify(sortedAddons);
    const groupedAddonsString = JSON.stringify(sortedGroupedAddons);

    if (editControlStatus) {
      diningMenuStorage(
        produce(diningMenuStorage(), (draft) => {
          const selectedItem = draft?.items.find(
            (el, index) =>
              el?.itemId === selectedItemId &&
              el?.customisation?.ingredient === sortedCustomisation?.ingredient &&
              el?.customisation?.code === sortedCustomisation?.code &&
              index === selectedItemIndex,
          );

          if (selectedItem) {
            const existingAddons = selectedItem?.addons || [];
            const existingCustomisation = selectedItem?.customisation || [];
            const existingGroupedAddons = selectedItem?.groupedAddons || [];

            const selectedItemAddonsString = JSON.stringify(
              sortBy(existingAddons, (item) => item?.name),
            );
            const selectedItemCustomisationString = JSON.stringify(
              sortBy(existingCustomisation, (item) => item?.name),
            );
            const selectedItemGroupedAddonsString = JSON.stringify(
              sortBy(existingGroupedAddons, (item) => item?.name),
            );

            const needsUpdate =
              (sortedAddons?.length > 0 && selectedItemAddonsString !== addonsString) ||
              (sortedCustomisation?.length > 0 &&
                selectedItemCustomisationString !== customisationString) ||
              (sortedGroupedAddons?.length > 0 &&
                selectedItemGroupedAddonsString !== groupedAddonsString);

            if (needsUpdate) {
              if (selectedItem.addons !== undefined || (addons && addons?.length > 0)) {
                selectedItem.addons = sortedAddons;
              }

              if (selectedItem.customisation !== undefined || customisation?.length > 0) {
                selectedItem.customisation = sortedCustomisation;
              }

              if (selectedItem.groupedAddons !== undefined || groupedAddons?.length > 0) {
                selectedItem.groupedAddons = sortedGroupedAddons;
              }
            }

            selectedItem.cookingInstruction = instruction ?? '';
            selectedItem.quantity = count || 1;
          }
        }),
      );
    } else {
      diningMenuStorage(
        produce(diningMenuStorage(), (draft) => {
          const existingItem = draft?.items?.find((el) => {
            //  no customization or addons
            if (
              el?.itemId === selectedItemId &&
              !(el?.customisation?.length || 0) &&
              !(el?.addons?.length || 0) &&
              !sortedCustomisation?.length &&
              !sortedAddons?.length
            ) {
              return true;
            }

            // matching customization and addons
            if (
              el?.itemId === selectedItemId &&
              JSON.stringify(sortBy(el?.addons || [], (item) => item?.name)) === addonsString &&
              JSON.stringify(sortBy(el?.groupedAddons || [], (item) => item?.name)) ===
                groupedAddonsString &&
              JSON.stringify(sortBy(el?.customisation || [], (item) => item?.name)) ===
                customisationString
            ) {
              return true;
            }

            // matching customization only
            if (
              el?.itemId === selectedItemId &&
              sortedCustomisation?.ingredient &&
              (el?.customisation?.length || 0) > 0 &&
              el?.customisation?.ingredient === sortedCustomisation?.ingredient &&
              el?.customisation?.code === sortedCustomisation?.code &&
              !sortedAddons?.length
            ) {
              return true;
            }

            //  matching addons only
            if (
              el?.itemId === selectedItemId &&
              sortedAddons?.length > 0 &&
              (el?.addons?.length || 0) > 0 &&
              el?.customisation?.ingredient === sortedCustomisation?.ingredient &&
              JSON.stringify(sortBy(el?.addons || [], (item) => item?.name)) === addonsString
            ) {
              return true;
            }

            // matching grouped addons only
            if (
              el?.itemId === selectedItemId &&
              sortedGroupedAddons?.length > 0 &&
              (el?.groupedAddons?.length || 0) > 0 &&
              el?.customisation?.ingredient === sortedCustomisation?.ingredient &&
              JSON.stringify(sortBy(el?.groupedAddons || [], (item) => item?.name)) ===
                groupedAddonsString
            ) {
              return true;
            }

            return false;
          });

          if (existingItem) {
            existingItem.quantity += count;
          } else {
            const baseItem: any = {
              itemId: selectedItem?.id,
              quantity: count,
              code: selectedItem?.code ?? '',
              price: selectedItem?.price ?? 0,
              title: selectedItem?.name ?? '',
              cookingInstruction: instruction ?? '',
              upsell: selectedItem?.upsell ?? [],
            };

            if (sortedCustomisation?.length > 0) {
              baseItem.customisation = sortedCustomisation;
            }

            if (sortedAddons?.length > 0) {
              baseItem.addons = sortedAddons;
            }

            if (sortedGroupedAddons?.length > 0) {
              baseItem.groupedAddons = sortedGroupedAddons;
            }

            draft.items.push(baseItem);
          }
        }),
      );
    }

    const item = {
      id: selectedItem?.id,
      name: selectedItem?.name,
      price: selectedItem?.price,
      quantity: count,
      currency: currency,
    };

    addToCartEvent(item);
    closeDrawer();
  }, [
    addons,
    groupedAddons,
    closeDrawer,
    count,
    currency,
    customisation,
    editControlStatus,
    instruction,
    selectedItem?.code,
    selectedItem?.id,
    selectedItem?.name,
    selectedItem?.price,
    selectedItem?.upsell,
    selectedItemId,
    selectedItemIndex,
  ]);

  const formik = useFormik({
    initialValues: { instruction: '' },
    validationSchema: instructionValidation,
    onSubmit: (values) => {
      setInstruction(values.instruction);
    },
  });

  const diningDetails = () => {
    const filteredCustomisation = selectedItem?.customisation?.map((customisationItem: any) =>
      customisationItem?.customisations?.filter((item: any) => item?.status),
    );

    const filteredList = data?.getIRDMenuOutputDetails?.filter(
      (item: any) =>
        item?.isActive &&
        filterLiveMenu(
          item?.hours,
          hotelInformation?.getPropertyDetailsByHotelId?.hotel?.location?.timezone,
        ),
    );

    return (
      <>
        <>
          {selectedItem?.images?.length > 0 && <CustomCarousel imageData={selectedItem} />}
          {selectedItem?.name && (
            <div className={cx(styles.titleWrapper)}>
              <h3
                className={cx(styles.title, {
                  [styles.titleWithImage]: selectedItem?.images?.length > 0,
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
                <p className={styles.ingredientsDescription}>{selectedItem?.ingredients}</p>
              </>
            )}

            {irdModule &&
              selectedItem?.customisation?.map(
                (customisationItem: any, customizationIndex: number) => (
                  <div key={customizationIndex}>
                    <div className={styles.customisationWrapper}>
                      <p className={styles.customisationsText}>{customisationItem?.ingredient}</p>

                      {!customisation?.some(
                        (selected: any) =>
                          selected.ingredient === customisationItem.ingredient &&
                          selected.index === customizationIndex,
                      ) && <p className={styles.optionalTextWarning}>{t('Required')}</p>}
                    </div>
                    <div className={styles.customisations}>
                      {customisationItem?.customisations
                        ?.filter((item: any) => item?.status)
                        ?.map((el: any, index: any) => (
                          <div key={index} className={styles.radioItemWrapper}>
                            <StyledButton
                              onClick={(e) =>
                                handleSelectedCustomisation(
                                  e,
                                  customisationItem,
                                  el,
                                  customizationIndex,
                                )
                              }
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
                ),
              )}

            {selectedItem?.addons && irdModule && (
              <>
                <div className={styles.addonsRow}>
                  <p className={styles.addonsText}>{t('Add-Ons')}</p>
                  {addonsWarning ? (
                    <p className={styles.optionalTextWarning}>{t('Limit exceeded')}</p>
                  ) : (
                    <p className={styles.optionalText}>
                      {/* {t('Select up to option(s)', { value: selectedItem?.addOnValue })} */}
                      {t('Select up to')} {selectedItem?.addOnValue} {t('option(s)')}
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

            {selectedItem?.groupedAddon && selectedItem?.groupedAddon?.length > 0 && irdModule && (
              <>
                {selectedItem?.groupedAddon?.map((groupedAddon: any, groupedAddonIndex: any) => (
                  <React.Fragment key={groupedAddonIndex}>
                    <div className={styles.addonsRow}>
                      <p className={styles.addonsText}>{groupedAddon?.title}</p>
                      {(groupedAddonLimitMap[groupedAddonIndex.toString()] || 0) >
                      groupedAddon?.limit ? (
                        <p className={styles.optionalTextWarning}>{t('Limit exceeded')}</p>
                      ) : (
                        <p className={styles.optionalText}>
                          {t('Select up to')} {groupedAddon?.limit} {t('option(s)')}
                        </p>
                      )}
                    </div>
                    <div className={styles.irdCheckboxItemWrapper}>
                      {groupedAddon?.addons?.map((el: any, index: any) => (
                        <div key={el?.id || index}>
                          <DiningCheckboxItem
                            setupdateAddons={setupdateAddons}
                            updateAddons={updateAddons}
                            element={el}
                            selectedItemId={selectedItemId}
                            addons={groupedAddons ?? []}
                            setAddons={setGroupedAddons}
                            checked={
                              groupedAddons?.some(
                                (item: any) =>
                                  item?.id === el?.id && item?.index === groupedAddonIndex,
                              )
                                ? true
                                : false
                            }
                            groupedAddonIndex={groupedAddonIndex}
                          />
                        </div>
                      ))}
                    </div>
                  </React.Fragment>
                ))}
              </>
            )}

            {irdModule && (
              <StyledInput
                variant='standard'
                autoComplete='off'
                fullWidth
                color='success'
                value={formik.values.instruction}
                className={styles.textInput}
                id='instruction'
                placeholder={`${t('Add special instructions')}`}
                onChange={(e) => {
                  formik.handleChange(e);
                  setInstruction(e.target.value);
                }}
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
                      font: '14px var(--primary-font-regular)',
                      color: 'var(--tertiary-text-color)',
                      marginInlineStart: '0.5rem',
                    },
                  },
                }}
                error={Boolean(formik.errors.instruction)}
                helperText={formik.errors.instruction ? t(formik.errors.instruction) : null}
              />
            )}

            {selectedItem?.upsell?.length > 0 && (
              <>
                <div className={styles.upsellWrapper}>
                  <h4 className={styles.youMayAlsoLikeText}>{t('You May Also Like')}</h4>
                  <div className={styles.upsell}>
                    {selectedItem?.upsell?.map((upsellItem: any, index: number) => (
                      <DiningMenuElementUpsell
                        key={index}
                        title={upsellItem?.name}
                        price={upsellItem?.price}
                        id={upsellItem?.id}
                        image={upsellItem?.image}
                        code={upsellItem?.code}
                        description={upsellItem?.description || ''}
                        customisation={upsellItem?.customisation || []}
                        index={index}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}

            {selectedItem?.price && irdModule && (
              <>
                <p className={styles.priceText}>{t('total item price')}</p>
                <p className={styles.totalItemPrice}>
                  <span className='globals-irdv2-irdPrice'>{currency} </span>
                  <span className={styles.price}>
                    {formatPriceIRD(selectedItem?.price + totalAddons)}
                  </span>
                </p>
              </>
            )}
          </div>
          {irdModule && (
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
                    Boolean(formik.errors.instruction) ||
                    count === 0 ||
                    (selectedItem?.customisation?.length > 0 &&
                      filteredCustomisation?.length !== customisation?.length) ||
                    addonsWarning ||
                    groupedAddonsWarning ||
                    !menuAvailability
                  }
                >
                  {editControlStatus ? t('Update Order') : t('Add to Cart')}
                </StyledButton>
              </div>
            </div>
          )}
        </>
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
