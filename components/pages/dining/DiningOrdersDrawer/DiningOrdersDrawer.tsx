import React, { useCallback, useState } from 'react';
import { StyledButton } from '../../../shared/StyledButton/StyledButton';
import styles from './DiningOrdersDrawer.module.scss';
import Drawer from '@mui/material/Drawer';
import { IDiningOrdersDrawerProps } from './DiningOrdersDrawer.types';
import { STATUS } from 'utils/constants';
import CheckMark from '@icons/thinCheckMark.svg';
import dayjs from 'dayjs';
import { timeFormats } from 'utils/timeFormats';
import { useTranslation } from 'react-i18next';
import { useCurrency } from 'utils/hooks/useConfiguration';

export const DiningOrdersDrawer: React.FC<IDiningOrdersDrawerProps> = ({
  ordersDrawer,
  closeOrdersDrawer,
  ordersData,
}) => {
  const { t } = useTranslation(['common', 'dining']);
  const [myOrders, setMyOrders] = useState(true);
  const [thankYou, setThankYou] = useState(false);
  const [expandedCardId, setExpandedCardId] = useState('');
  const currency = useCurrency();

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

  const itemTotal = useCallback((item: any) => {
    return (
      item?.amount * item?.count +
      item?.addOns?.reduce((acc: number, addon: any) => acc + addon?.price, 0)
    );
  }, []);

  return (
    <Drawer
      variant='temporary'
      anchor='bottom'
      open={ordersDrawer}
      onClose={closeDrawer}
      PaperProps={{
        elevation: 0,
        style: {
          borderTopLeftRadius: 'var(--primary-drawer-top-left-border-radius)',
          borderTopRightRadius: 'var(--primary-drawer-top-right-border-radius)',
          maxWidth: '768px',
          margin: 'auto',
          maxHeight: 'var(--primary-drawer-height)',
        },
      }}
    >
      {myOrders && (
        <div className={styles.myOrdersWrapper}>
          <div className={styles.drawerNotch}></div>
          <h3 className={styles.heading}>{t('My Orders')}</h3>
          <div className={styles.container}>
            <p className={styles.title}>{t('In-Room Dining')}</p>{' '}
            <div className={styles.scroll}>
              {ordersData?.map((orderCategory: any) => {
                const isCardExpanded = expandedCardId === orderCategory.id;
                const status = STATUS?.find((status: any) => status?.key === orderCategory?.status);
                return (
                  <React.Fragment key={orderCategory.id}>
                    <div
                      className={styles.orderCard}
                      onClick={() => {
                        if (isCardExpanded) {
                          setExpandedCardId('');
                        } else {
                          setExpandedCardId(orderCategory.id);
                        }
                      }}
                    >
                      <div className={styles.orderWrapper}>
                        <p className={styles.orderHeading}>{t('Order ID')}</p>{' '}
                        <span className={styles.status}>{t(`${status?.value}`)}</span>
                      </div>
                      <div
                        className={`${styles.orderWrapper} ${
                          isCardExpanded ? styles.expanded : ''
                        }`}
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
                                <span className={styles.currency}>{currency}</span>{' '}
                                {itemTotal(item)?.toFixed(2)}
                              </p>
                            </div>
                            <div className={styles.itemRow}>
                              {item?.customisations?.map((item: any, index: number) => (
                                <p key={index} className={styles.itemDescription}>
                                  {t('Customisations')}:{' '}
                                  <span className={styles.grayText}>{item?.name}</span>
                                </p>
                              ))}
                              {(item?.addOns ?? [])?.length > 0 && (
                                <p className={styles.itemDescription}>
                                  {t('Add-ons :')}{' '}
                                  {item?.addOns?.map((item: any, index: number) => (
                                    <span key={index} className={styles.grayText}>
                                      {item?.name} ({currency} {item?.price})
                                    </span>
                                  ))}
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
                            <span className={styles.currency}>{currency}</span>{' '}
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
                  <span className={styles.currency}>{currency} </span>
                  {totalToBePaid?.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <StyledButton variant='contained' className={styles.button} onClick={closeDrawer}>
            {t('Close')}
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
