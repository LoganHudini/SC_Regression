import React, { useCallback, useState } from 'react';
import { StyledButton } from '../../../shared/StyledButton/StyledButton';
import styles from './DiningOrdersDrawer.module.scss';
import Drawer from '@mui/material/Drawer';
import { IDiningOrdersDrawerProps } from './DiningOrdersDrawer.types';
import { STATUS } from 'utils/constants';
import CheckMark from '@icons/thinCheckMark.svg';
import dayjs from 'dayjs';
import { timeFormats } from 'utils/timeFormats';
import { CURRENCY } from 'core/graphql/endpoints';
import { useTranslation } from 'react-i18next';
import { client } from 'core/graphql/client';
import { ApolloError, useReactiveVar } from '@apollo/client';
import { REQUEST_F_AND_B_BILL } from 'core/graphql/queries/REQUEST_F_AND_B_BILL';
import { restaurantListStorage } from 'storage/table-reservation.storage';
import { useLocale } from 'utils/hooks/useLocalizedRouter';
import { processError } from 'utils/processError';

export const DiningOrdersDrawer: React.FC<IDiningOrdersDrawerProps> = ({
  ordersDrawer,
  closeOrdersDrawer,
  ordersData,
}) => {
  const { t } = useTranslation(['common', 'dining']);
  const locale = useLocale();
  const [myOrders, setMyOrders] = useState(true);
  const [thankYou, setThankYou] = useState(false);
  const [expandedCardId, setExpandedCardId] = useState('');

  const name =
    (typeof window !== 'undefined' &&
      localStorage.getItem('FandB_guestDetails') &&
      JSON.parse(localStorage.getItem('FandB_guestDetails') ?? '').name) ??
    '';
  const numberOfGuest =
    (typeof window !== 'undefined' &&
      localStorage.getItem('NoOfGuest') &&
      JSON.parse(localStorage.getItem('NoOfGuest') ?? '')) ??
    1;
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
  const roomNumber =
    (typeof window !== 'undefined' &&
      localStorage.getItem('FandB_guestDetails') &&
      JSON.parse(localStorage.getItem('FandB_guestDetails') ?? '')?.roomNumber) ??
    '';
  const phoneNumber =
    (typeof window !== 'undefined' &&
      localStorage.getItem('FandB_guestDetails') &&
      JSON.parse(localStorage.getItem('FandB_guestDetails') ?? '').phoneNumber) ??
    '';

  const restaurantsList = useReactiveVar(restaurantListStorage);

  const restaurantName = restaurantsList?.find((item) => item.id === restaurantId);

  const handleRequestBill = () => {
    if (restaurantId === '') {
      closeDrawer();
    } else {
      handleConfirm();
    }
  };

  const handleConfirm = async () => {
    const requestBill = {
      guestName: name,
      guestType: roomNumber ? 'Resident' : 'Non-Resident',
      noOfGuests: numberOfGuest,
      phoneNumber: phoneNumber,
      restaurantId: restaurantId,
      roomNumber: roomNumber,
      tableNumber: tableNumber,
      lang: locale === 'en' ? '' : locale,
    };

    try {
      const response = await client.mutate({
        mutation: REQUEST_F_AND_B_BILL,
        context: { clientName: 'host_v5' },
        fetchPolicy: 'network-only',
        variables: requestBill,
      });
      setMyOrders(false);
      setThankYou(true);
    } catch (error) {
      processError(t, error as ApolloError);
    }
  };

  const handleOk = () => {
    setThankYou(false);
    closeDrawer();
  };

  const closeDrawer = () => {
    closeOrdersDrawer();
    setMyOrders(true);
  };

  const totalToBePaid = ordersData
    ?.map((x: any) => x?.totalAmount)
    ?.reduce((sum, amount) => sum + amount);

  const itemTotal = useCallback(
    (item: any) => {
      return (
        item?.amount * item?.count +
        (!restaurantId ? item?.addOns : item?.addons)?.reduce(
          (acc: number, addon: any) => acc + addon?.price,
          0,
        )
      );
    },
    [restaurantId],
  );

  return (
    <Drawer
      variant='temporary'
      anchor='bottom'
      open={ordersDrawer}
      onClose={closeDrawer}
      PaperProps={{
        elevation: 0,
        style: {
          borderTopRightRadius: '2rem',
          borderTopLeftRadius: '2rem',
          maxWidth: '772px',
          margin: 'auto',
          maxHeight: '70vh',
        },
      }}
    >
      {myOrders && (
        <div className={styles.myOrdersWrapper}>
          <h3 className={styles.heading}>{t('My Orders')}</h3>

          <div className={styles.titleRow}>
            <p className={styles.title}>
              {restaurantId ? restaurantName?.name || t('Restaurant Order') : t('In-Room Dining')}
            </p>{' '}
          </div>
          <div className={styles.container}>
            <div className={styles.scroll}>
              {ordersData?.map((orderCategory: any) => {
                const isCardExpanded = expandedCardId === orderCategory.id;
                const status = STATUS?.find((status: any) => status?.key === orderCategory?.status);
                return (
                  <React.Fragment key={orderCategory.id}>
                    <div className={styles.orderCard}>
                      <div className={styles.orderWrapper}>
                        <p className={styles.orderHeading}>{t('Order ID')}</p>{' '}
                        <span className={styles.status}>{t(`${status?.value}`)}</span>
                      </div>
                      <div
                        className={`${styles.orderWrapper} ${
                          isCardExpanded ? styles.expanded : ''
                        }`}
                        onClick={() => {
                          if (isCardExpanded) {
                            setExpandedCardId('');
                          } else {
                            setExpandedCardId(orderCategory.id);
                          }
                        }}
                      >
                        <p className={styles.dateTime}>{orderCategory?.id.substring(6, 0)}</p>
                        <p className={styles.dateTime}>
                          {dayjs(orderCategory.startTime).format(
                            timeFormats.DAY_MONTH_YEAR_HOUR_MINUTE_AM,
                          )}
                        </p>
                      </div>
                    </div>
                    {isCardExpanded && (
                      <div className={styles.expandCard}>
                        {orderCategory?.items?.map((item: any, index: number) => (
                          <>
                            <div className={styles.itemsContainerBill} key={index}>
                              <p className={styles.items}>
                                {item?.count} x {item?.name}{' '}
                              </p>
                              <p className={styles.itemsPrice}>
                                {' '}
                                <span className={styles.currency}>{CURRENCY}</span>{' '}
                                {itemTotal(item)?.toFixed(2)}
                              </p>
                            </div>
                            <div className={styles.itemRow}>
                              {item?.customisations[0]?.name && (
                                <p className={styles.itemDescription}>
                                  {' '}
                                  {t('Customisation')}: {item?.customisations[0]?.name}
                                </p>
                              )}
                              {((!restaurantId ? item?.addOns : item?.addons) ?? [])?.length >
                                0 && (
                                <p className={styles.itemDescription}>
                                  {' '}
                                  {t('Add-ons :')}{' '}
                                  {(!restaurantId ? item?.addOns : item?.addons)?.map(
                                    (item: any, index: number) => (
                                      <span key={index} className={styles.items}>
                                        {item?.name} ({CURRENCY} {item?.price})
                                      </span>
                                    ),
                                  )}
                                </p>
                              )}
                              {item?.cookingInstructions && (
                                <p className={styles.itemDescription}>
                                  {t('Instructions')}: {item?.cookingInstructions}
                                </p>
                              )}
                            </div>
                          </>
                        ))}

                        <div className={styles.totalContainerBill}>
                          <p className={styles.total}>{t('Total')} </p>
                          <p className={styles.totalPrice}>
                            {' '}
                            <span className={styles.currency}>{CURRENCY}</span>{' '}
                            {orderCategory?.totalAmount?.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
              <div className={styles.orderWrapperTotal}>
                <p className={styles.totalTitle}>{t('Total to be paid')}</p>
                <p className={styles.totalTitlePrice}>
                  {' '}
                  <span className={styles.currency}>{CURRENCY}</span> {totalToBePaid?.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <StyledButton
            disabled={
              restaurantId && !ordersData?.some((item: any) => item?.status === STATUS[2].key)
            }
            variant='contained'
            className={styles.button}
            onClick={handleRequestBill}
          >
            {restaurantId ? t('Request Bill') : t('Close')}
          </StyledButton>
        </div>
      )}

      {thankYou && (
        <div className={styles.myOrdersWrapper}>
          <CheckMark className={styles.checkIcon} />
          <div className={styles.thankyouRow}>
            <p className={styles.thankyouTitle}>{t('Thank You')}</p>
            <p className={styles.message}>{t('Bill Requested successfully')}</p>
          </div>

          <StyledButton variant='contained' className={styles.buttonOk} onClick={handleOk}>
            {t('OK')}
          </StyledButton>
        </div>
      )}
    </Drawer>
  );
};
