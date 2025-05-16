import { WhiteStyledCheckbox } from 'components/shared/WhiteStyledCheckbox/WhiteStyledCheckbox';
import React, { useCallback } from 'react';
import styles from './DiningCheckboxItem.module.scss';
import { IDiningCheckboxItemProps } from './DiningCheckboxItem.types';
import { useReactiveVar } from '@apollo/client';
import { editControl } from 'storage/dining-menu.storage';
import { useCurrency } from 'utils/hooks/useCurrency';
import { formatPriceIRD } from 'utils/functions';

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

  const showCurrency = () => {
    return (
      <>
        <p className={styles.price}>
          <span className={styles.currency}>{currency}</span>
          {formatPriceIRD(element?.price)}
        </p>
      </>
    );
  };

  return (
    <div className={styles.irdCheckboxItem}>
      <div className={styles.name}>{element?.name}</div>
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
