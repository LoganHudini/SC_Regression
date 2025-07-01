import { WhiteStyledCheckbox } from 'components/shared/WhiteStyledCheckbox/WhiteStyledCheckbox';
import React, { useCallback } from 'react';
import styles from './DiningCheckboxItem.module.scss';
import { IDiningCheckboxItemProps } from './DiningCheckboxItem.types';
import { useReactiveVar } from '@apollo/client';
import { editControl } from 'storage/dining-menu.storage';
import { useCurrency } from 'utils/hooks/useCurrency';
import { findModule, formatPriceIRD } from 'utils/functions';
import cx from 'classnames';
import { IN_ROOM_DINING } from 'utils/constants';
import { useConfig } from 'utils/hooks/useConfiguration';

export const DiningCheckboxItem: React.FC<IDiningCheckboxItemProps> = ({
  element,
  addons,
  setAddons,
  setupdateAddons,
  updateAddons,
  checked,
  groupedAddonIndex,
}) => {
  const editControlStatus = useReactiveVar(editControl);
  const currency = useCurrency();

  const toggleRequested = useCallback(() => {
    if (editControlStatus) {
      setupdateAddons(!updateAddons);

      const IndexOfItem: any = addons?.findIndex(
        (item) => item?.id === element?.id && item?.index === groupedAddonIndex,
      );

      if (IndexOfItem !== -1) {
        setAddons((AddonsAdded: any) => {
          const newAddons = [...AddonsAdded];
          newAddons?.splice(IndexOfItem, 1);
          return newAddons;
        });
      } else {
        setAddons([...(addons ?? []), { ...element, index: groupedAddonIndex }]);
      }
    } else {
      setupdateAddons(!updateAddons);
      const item = addons?.find(
        (item) => item?.id === element?.id && item?.index === groupedAddonIndex,
      );
      if (item) {
        const index = (addons ?? [])?.indexOf(item);
        if (index > -1) {
          addons?.splice(index, 1);
        }
      } else {
        setAddons([...(addons ?? []), { ...element, index: groupedAddonIndex }]);
      }
    }
  }, [addons, editControlStatus, element, setAddons, setupdateAddons, updateAddons]);
  const config = useConfig();

  const irdModuleContent: any = findModule(config?.modules, IN_ROOM_DINING);

  const isIRDv2 = irdModuleContent?.version === 'v2';

  const showCurrency = () => {
    return (
      <>
        <p className={cx(styles.price, { 'globals-irdv2-showCurrencyInCheckbox': isIRDv2 })}>
          <span className={styles.currency}>{currency}</span>
          {formatPriceIRD(element?.priceInDecimal)}
        </p>
      </>
    );
  };

  return (
    <div className={styles.irdCheckboxItem}>
      <div className={styles.name}>
        {element?.name}
        {isIRDv2 && (
          <span className={cx(styles.priceCurrency, { 'globals-irdv2-irdFlowShow': isIRDv2 })}>
            {formatPriceIRD(element?.priceInDecimal)}
          </span>
        )}
      </div>

      <WhiteStyledCheckbox
        onChange={toggleRequested}
        value={element.id}
        label={showCurrency()}
        labelPlacement='start'
        checked={checked}
      />
    </div>
  );
};
