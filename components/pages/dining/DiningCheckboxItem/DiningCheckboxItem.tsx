import { WhiteStyledCheckbox } from 'components/shared/WhiteStyledCheckbox/WhiteStyledCheckbox';
import React, { useCallback } from 'react';
import styles from './DiningCheckboxItem.module.scss';
import { IDiningCheckboxItemProps } from './DiningCheckboxItem.types';
import { CURRENCY } from 'core/graphql/endpoints';
import { useReactiveVar } from '@apollo/client';
import { editControl } from 'storage/dining-menu.storage';
import { useCurrency } from 'utils/hooks/useConfiguration';

export const DiningCheckboxItem: React.FC<IDiningCheckboxItemProps> = ({
  element,
  addons,
  setAddons,
  setupdateAddons,
  updateAddons,
  checked,
}) => {
  const editControlStatus = useReactiveVar(editControl);

  const toggleRequested = useCallback(() => {
    if (editControlStatus) {
      setupdateAddons(!updateAddons);

      const IndexOfItem: any = addons?.findIndex((item) => item?.id === element?.id);

      if (IndexOfItem !== -1) {
        setAddons((AddonsAdded: any) => {
          const newAddons = [...AddonsAdded];
          newAddons?.splice(IndexOfItem, 1);
          return newAddons;
        });
      } else {
        setAddons([...(addons ?? []), element]);
      }
    } else {
      setupdateAddons(!updateAddons);
      const item = addons?.find((item) => item?.id === element?.id);
      if (item) {
        const index = (addons ?? [])?.indexOf(item);
        if (index > -1) {
          addons?.splice(index, 1);
        }
      } else {
        setAddons([...(addons ?? []), element]);
      }
    }
  }, [addons, element, setAddons, setupdateAddons, updateAddons]);
  const currency = useCurrency();

  // const toggleRequested = useCallback(() => {
  //   setupdateAddons(!updateAddons);
  //   const item = addons?.find((item) => item?.id === element?.id);
  //   if (item) {
  //     const index = (addons ?? [])?.indexOf(item);
  //     if (index > -1) {
  //       addons?.splice(index, 1);
  //     }
  //   } else {
  //     setAddons([...(addons ?? []), element]);
  //   }
  // }, [addons, element, setAddons, setupdateAddons, updateAddons]);

  const showCurrency = () => {
    return (
      <>
        <p className={styles.price}>
          <span className={styles.currency}>{currency}</span>
          {element?.price?.toFixed(2)}
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
