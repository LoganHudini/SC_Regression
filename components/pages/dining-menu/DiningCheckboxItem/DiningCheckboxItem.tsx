import { WhiteStyledCheckbox } from 'components/shared/WhiteStyledCheckbix/WhiteStyledCheckbox';
import React, { useCallback } from 'react';
import styles from './DiningCheckboxItem.module.scss';
import { IDiningCheckboxItemProps } from './DiningCheckboxItem.types';
import { CURRENCY } from 'core/graphql/endpoints';

export const DiningCheckboxItem: React.FC<IDiningCheckboxItemProps> = ({
  element,
  addons,
  setAddons,
  setupdateAddons,
  updateAddons,
}) => {
  const toggleRequested = useCallback(() => {
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
  }, [addons, element, setAddons, setupdateAddons, updateAddons]);

  const showCurrency = () => {
    return (
      <>
        <div className={styles.currencyWrapper}>
          <div className={styles.name}>{element?.name}</div>
          <div className={styles.currencyWrapperSecondary}>
            <span className={styles.currency}>{CURRENCY}</span>
            <span className={styles.price}> {element?.price?.toFixed(2)}</span>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className={styles.irdCheckboxItem}>
      <WhiteStyledCheckbox onChange={toggleRequested} value={element.id} label={showCurrency()} />
    </div>
  );
};
