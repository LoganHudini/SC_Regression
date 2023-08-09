import React, { useState } from 'react';
import Drawer from '@mui/material/Drawer';
import styles from './TableReservationDrawer.module.scss';
import { TableReservationDrawerProps } from './TableReservationDrawer.types';
import { useReactiveVar } from '@apollo/client';
import { restaurantListStorage } from 'storage/table-reservation.storage';
import CheckIcon from '@icons/checkIcon.svg';

export const TableReservationDrawer: React.FC<TableReservationDrawerProps> = ({
  customisationDrawer,
  closeCustomisationDrawer,
  setSelectedRestaurantName,
}) => {
  const restaurantsList = useReactiveVar(restaurantListStorage);
  const [id, setId] = useState<string>();

  const handleClick = (id: string) => {
    closeCustomisationDrawer();
    setId(id);
    const item = restaurantsList?.find((item) => item.id === id);
    if (item) setSelectedRestaurantName(item.name);
  };
  return (
    <div>
      <Drawer
        variant='temporary'
        anchor='bottom'
        open={customisationDrawer}
        onClose={closeCustomisationDrawer}
        PaperProps={{
          elevation: 0,
          style: {
            borderTopRightRadius: '2rem',
            borderTopLeftRadius: '2rem',
            margin: '0 auto',
            maxWidth: '768px',
          },
        }}
      >
        <div className={styles.wrapper}>
          <div className={styles.title}>Restaurants</div>
          <div className={styles.list}>
            {restaurantsList?.map((item) => (
              <div key={item.id} onClick={() => handleClick(item.id)} className={styles.items}>
                <div className={styles.name}>{item.name}</div>
                {id === item?.id && (
                  <div className={styles.icon}>
                    {' '}
                    <CheckIcon />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Drawer>
    </div>
  );
};
