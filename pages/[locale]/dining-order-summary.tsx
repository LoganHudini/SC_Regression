import { Header } from 'components/shared/Header/Header';
import { PageWrapper } from 'components/shared/PageWrapper/PageWrapper';
import { PlusMinusInput } from 'components/shared/PlusMinusInput/PlusMinusInput';
import { GetStaticProps } from 'next';
import i18nConfig from 'next-i18next.config';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import React, { useCallback, useEffect, useState } from 'react';
import styles from '../../styles/dining-order-summary/dining-order-summary.module.scss';
import { getStaticPaths } from 'utils/getStatic';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import { useTranslation } from 'react-i18next';
import { client } from 'core/graphql/client';
import { ApolloError, useQuery, useReactiveVar } from '@apollo/client';
import { IDiningMenuStorageData, diningMenuStorage } from 'storage/dining-menu.storage';
import { availablePaths } from 'utils/availablePaths';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { processError } from 'utils/processError';
import produce from 'immer';
import dayjs from 'dayjs';
import { CURRENCY } from 'core/graphql/endpoints';
import { DiningCustomisationDrawer } from 'components/pages/dining/DiningCustomisationDrawer/DiningCustomisationDrawer';
import { DINING, PAYMENT } from 'utils/constants';
import { InputAdornment, TextField } from '@mui/material';
import Cookinginstructions from '@icons/cooking_instructions.svg';
import { IRD_ORDER } from 'core/graphql/queries/IRD_ORDER';
import { Notification } from 'components/shared/Notification/Notification';
import { addToCartEvent, irdOrderEvent } from 'utils/gtag';
import { setScrollPosition } from 'utils/functions';
import { diningInformationStorage } from 'storage/dining.storage';
import DiningDetailsDrawer from 'components/pages/dining/DiningDetailsDrawer/DiningDetailsDrawer';
import { toggleNotification } from 'storage/home.storage';
import { ThankYouDrawer } from 'components/shared/ThankYouDrawer/ThankYouDrawer';
import { DiningMenuElementUpsell } from 'components/pages/dining/DiningMenuElementUpsell/DiningMenuElementUpsell';
import {
  GET_RESERVATION_NO_LAST_NAME,
  IGetReservationApiResponse,
} from 'core/graphql/queries/GET_RESERVATION';
import { useCheckedIn } from 'storage/check-in.storage';

export { getStaticPaths };

const DiningOrderSummary = () => {
  const { t } = useTranslation(['dining-order-summary', 'common']);
  const navigate = useLocalizedRouter();
  const checkinData = useCheckedIn();
  const reservationId = checkinData?.reservationId;
  const renderedItemIds: any = [];
  const [customisationDrawer, setCustomisationDrawer] = useState(false);
  const [specialRequests, setSpecialRequests] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentType, setpaymentType] = useState<any>(PAYMENT[0]);
  const [thankYouDrawer, setthankYouDrawer] = useState(false);
  const [guestNumber, setguestNumber] = useState(1);
  const [totalAmount, setTotalAmount] = useState(0);

  const { data: reservationData } = useQuery<IGetReservationApiResponse>(
    GET_RESERVATION_NO_LAST_NAME,
    {
      context: { clientName: 'rest' },
      variables: {
        confirmationNumber: reservationId,
      },
    },
  );

  const guestData = reservationData?.getReservation?.data?.guests[0];

  const diningData = useReactiveVar(diningMenuStorage) as IDiningMenuStorageData;

  const items = diningData?.items?.filter((item) => item?.quantity > 0);
  const restaurantId =
    (typeof window !== 'undefined' &&
      localStorage.getItem('restaurantId') &&
      JSON.parse(localStorage.getItem('restaurantId') ?? '')) ??
    '';

  useEffect(() => {
    const totalAmount = diningData?.items?.reduce((allTotal, item) => {
      const addonsTotal = item?.addons?.reduce((acc, addon) => {
        return acc + addon.price * item.quantity;
      }, 0);
      return allTotal + item.quantity * item.price + (addonsTotal ?? 0);
    }, 0);
    setTotalAmount(totalAmount);
  }, [diningData?.items]);

  useEffect(() => {
    if (items?.length === 0 && !thankYouDrawer) {
      navigate(availablePaths.DINING);
    }
  }, [items, navigate, thankYouDrawer]);

  const increment = useCallback(
    (itemId: string, index: number) => {
      const selectedItem = diningData?.items?.find(
        (item, i) => item?.itemId === itemId && i === index,
      );
      diningMenuStorage(
        produce(diningMenuStorage(), (draft) => {
          const item = draft?.items?.find((el, i) => el.itemId === itemId && i === index);

          if (item) {
            (item?.customisation ?? []).length > 0 || (item?.addons ?? []).length > 0
              ? setCustomisationDrawer((state) => !state)
              : (item.quantity++,
                addToCartEvent({
                  id: selectedItem?.itemId,
                  name: selectedItem?.title,
                  price: selectedItem?.price,
                  quantity: 1,
                }));

            draft.selectedItemId = itemId;
            draft.selectedIndex = index;
          }
        }),
      );
    },
    [diningData?.items],
  );

  const decrement = useCallback((itemId: string, index: number) => {
    diningMenuStorage(
      produce(diningMenuStorage(), (draft) => {
        const item = draft.items.find((el, i) => el.itemId === itemId && i === index);

        if (item) {
          if (item?.quantity === 1) {
            const index = draft?.items?.indexOf(item);
            if (index > -1) {
              draft?.items?.splice(index, 1);
            }
          } else {
            if (item?.quantity > 0) item.quantity--;
            draft.selectedItemId = itemId;
            draft.selectedIndex = index;
          }
        }
      }),
    );
  }, []);

  const handleSpecialRequestsChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSpecialRequests(e.target.value);
  }, []);

  const closeCustomisationDrawer = useCallback(() => {
    setCustomisationDrawer((state) => !state);
  }, []);

  const handleOrder = useCallback(async () => {
    setLoading(true);
    setScrollPosition(0, 0);
    diningInformationStorage(
      produce(diningInformationStorage(), (draft) => {
        if (draft) {
          draft.selectedCategory = '';
          draft.categoryName = '';
        }
      }),
    );

    const irdOrderPayload = {
      additionalNote: specialRequests,
      bookingId: checkinData?.reservationId,
      deliveryLocation: '',
      guestEmail: guestData?.emails[0],
      guestName: `${guestData?.firstName} ${guestData?.lastName}`,
      noOfItems: diningData.items.length,
      totalAmount,
      paymentMethod: paymentType?.name,
      roomNo: reservationData?.getReservation?.data?.roomTypes[0]?.roomNumber,
      startTime: dayjs().format('YYYY-MM-DD HH:mm'),
      noOfGuests: guestNumber,
      items: diningData?.items?.map((el) => ({
        name: el?.title,
        code: el?.code,
        count: el?.quantity,
        amount: el?.price,
        addOns: el?.addons?.map((item) => ({
          code: item?.code,
          name: item?.name,
          price: item?.price,
        })),
        customisations: el?.customisation?.map((item: any) => ({
          code: item?.code,
          name: item?.name,
        })),
        cookingInstructions: el?.cookingInstruction,
      })),
    };
    try {
      const response = await client.mutate({
        mutation: IRD_ORDER,
        context: { clientName: 'host_v3' },
        fetchPolicy: 'network-only',
        variables: irdOrderPayload,
      });
      irdOrderEvent(response?.data?.createOrder);
      // setthankYouDrawer(true);
      toggleNotification(true);
    } catch (getUpdatedReservationError) {
      processError(t, getUpdatedReservationError as ApolloError);
    }
    setLoading(false);
  }, [
    checkinData?.reservationId,
    diningData.items,
    guestData?.emails,
    guestData?.firstName,
    guestData?.lastName,
    guestNumber,
    paymentType?.name,
    reservationData?.getReservation?.data?.roomTypes,
    specialRequests,
    t,
    totalAmount,
  ]);

  const renderMenuElements = (items: any[]) => {
    return items
      ?.filter((item) => item?.price >= 0)
      ?.map((el, index) => (
        <React.Fragment key={el?.id}>
          <DiningMenuElementUpsell
            key={el?.id}
            id={el?.id}
            title={el?.name}
            image={el?.images[0]?.ratio1to1 || null}
            description={el?.description}
            price={el?.price}
            customisation={el?.customisation}
            index={index}
            code={el?.code}
            addons={el?.addons}
          />
        </React.Fragment>
      ));
  };

  return (
    <>
      <Head>
        <title>{t('Order Details')}</title>
      </Head>
      <Header displayBackButton screenTitle={t('Order Details') as string} />
      <PageWrapper className={styles.pageWrapper}>
        <p className={styles.itemsAddedText}>{t('Item(s) Added')}</p>
        <div className={styles.cartWrapper}>
          {items?.map((item, index) => {
            const totalAddonPrice: any = item?.addons?.reduce(
              (acc, addon) => acc + addon?.price,
              0,
            );
            const totalPrice = item?.price + totalAddonPrice ?? 0;
            return (
              item?.quantity > 0 && (
                <div key={index} className={styles.cartItemWrapper}>
                  <div className={styles.itemTitleWrapper}>
                    <p className={styles.itemTitle}>{item.title}</p>
                    <PlusMinusInput
                      value={item.quantity as number}
                      onClickMinus={() => decrement(item?.itemId ?? '', index)}
                      onClickPlus={() => increment(item?.itemId ?? '', index)}
                      minQuantity={0}
                      className={styles.plusMinus}
                      irdSummary
                    />
                  </div>
                  <div className={styles.selectionsWrapper}>
                    {(item?.customisation ?? [])?.length > 0 && (
                      <p className={styles.itemDescription}>
                        {item?.customisation?.map((item: any, index: any) => (
                          <>
                            {item?.ingredient}:{' '}
                            <span key={index} className={styles.items}>
                              {item?.name}
                            </span>
                            <br />
                          </>
                        ))}
                      </p>
                    )}
                    {(item?.addons ?? [])?.length > 0 && (
                      <p className={styles.itemDescription}>
                        {t('Add-ons :')}
                        {item?.addons?.map((item, index) => (
                          <span key={index} className={styles.items}>
                            {item?.name} ({CURRENCY} {item?.price})
                          </span>
                        ))}
                      </p>
                    )}
                    {item?.cookingInstruction && (
                      <p className={styles.itemDescription}>
                        {t('Instructions')}: {item?.cookingInstruction}
                      </p>
                    )}
                  </div>

                  <div className={styles.priceEditWrapper}>
                    <p className={styles.itemPrice}>
                      <span className={styles.itemCurrency}>{CURRENCY} </span>
                      {(isNaN(totalPrice)
                        ? item.quantity * item.price
                        : item.quantity * totalPrice
                      )?.toFixed(2)}
                    </p>
                    {/* <p className={styles.edit}>{`${t('edit')}`}</p> */}
                  </div>
                </div>
              )
            );
          })}
        </div>

        {items?.some((item: any) => item?.upsell?.length > 0) && (
          <>
            <div className={styles.upsellWrapper}>
              <p className={styles.youMayAlsoLikeText}>{t('You May Also Like')}</p>
              <div className={styles.upsell}>
                {items?.map((item) => {
                  if (!renderedItemIds.includes(item.itemId)) {
                    renderedItemIds.push(item.itemId);
                    return (
                      <React.Fragment key={item.itemId}>
                        {renderMenuElements(item?.upsell ?? [])}
                      </React.Fragment>
                    );
                  }
                })}
              </div>
            </div>
          </>
        )}

        <TextField
          autoComplete='off'
          onChange={handleSpecialRequestsChange}
          fullWidth
          color='success'
          className={styles.textInput}
          id='input-with-icon-textfield'
          placeholder={`${t('Special Requests')}`}
          InputProps={{
            startAdornment: (
              <InputAdornment position='end'>
                <Cookinginstructions />
              </InputAdornment>
            ),
            classes: {
              underline: styles.customUnderline,
            },
            inputProps: {
              maxLength: 30,
              style: {
                font: '14px var(--primary-font-news)',
                color: 'var(--tertiary-text-color)',
                marginInlineStart: '0.5rem',
              },
            },
          }}
          variant='standard'
        />

        <div className={styles.noOfGuests}>
          <div className={styles.guestTititle}>
            <p className={styles.noOfGuestsTitle}>{t('No of Guests')}</p>
            <p className={styles.noOfGuestsDesc}>
              {t('Cutlery will be sent based on the number of guests')}
            </p>
          </div>
          <PlusMinusInput
            value={guestNumber}
            onClickMinus={() => setguestNumber((i) => i - 1)}
            onClickPlus={() => setguestNumber((i) => i + 1)}
            minQuantity={1}
            className={styles.plusMinus}
            irdSummary
          />
        </div>

        <div className={styles.paymentContainer}>
          <p className={styles.paymentTitle}>{t('Payment Method')}</p>
          <div className={styles.buttonPaymentWrapper}>
            {PAYMENT?.map((item) => (
              <StyledButton
                key={item.id}
                variant={item?.name === paymentType?.name ? 'contained' : 'outlined'}
                className={styles.buttonPayment}
                onClick={() => setpaymentType(item)}
              >
                {t(`${item?.name}`)}
              </StyledButton>
            ))}
          </div>
        </div>

        <p className={styles.taxText}>
          {' '}
          {t(
            '* Rates are inclusive of applicable government taxes and subject to 10% service charge.',
          )}
        </p>

        {items?.length > 0 && (
          <div className={styles.confirmOrderButtonWrapper}>
            <div className={styles.totalCostRow}>
              <p className={styles.roomNumber}>
                {t('ROOM NO - ')} {reservationData?.getReservation?.data?.roomTypes[0]?.roomNumber}
              </p>
              <p className={styles.totalCost}>
                {t('TOTAL')} -{'  '}
                <span className={styles.currency}>{CURRENCY} </span> {totalAmount?.toFixed(2)}
              </p>
            </div>
            <StyledButton
              disabled={items?.length === 0 || (restaurantId == '' && paymentType.length === 0)}
              loading={loading}
              className={styles.confirmButton}
              onClick={handleOrder}
              variant='contained'
              count={items?.length}
            >
              {t('Confirm Order')}
            </StyledButton>
          </div>
        )}
        <DiningCustomisationDrawer
          customisationDrawer={customisationDrawer}
          closeCustomisationDrawer={closeCustomisationDrawer}
        />
        <ThankYouDrawer
          opened={thankYouDrawer}
          title={t('Your order has been confirmed.') as string}
          redirect={DINING}
          close={setthankYouDrawer}
        />
        <Notification
          title={t('Thank You!') as string}
          description={t('Your order has been confirmed.') as string}
          redirect={availablePaths?.DINING}
          type='success'
        />
        <DiningDetailsDrawer />
      </PageWrapper>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const locale = ctx?.params?.locale;

  return {
    props: {
      ...(await serverSideTranslations(
        locale as string,
        ['dining-order-summary', 'common'],
        i18nConfig,
      )),
    },
  };
};

export default DiningOrderSummary;
