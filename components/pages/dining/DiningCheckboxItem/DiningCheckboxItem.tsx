import { WhiteStyledCheckbox } from 'components/shared/WhiteStyledCheckbox/WhiteStyledCheckbox';
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
  checked,
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
        <p className={styles.price}>
          <span className={styles.currency}>{CURRENCY}</span>
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
