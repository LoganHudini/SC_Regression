import { Header } from 'components/shared/Header/Header';
import { PageWrapper } from 'components/shared/PageWrapper/PageWrapper';
import { PlusMinusInput } from 'components/shared/PlusMinusInput/PlusMinusInput';
import { GetStaticProps } from 'next';
import i18nConfig from 'next-i18next.config';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import React, { useCallback, useEffect, useState } from 'react';
import styles from '../../../styles/dining-order-summary/dining-order-summary.module.scss';
import { getStaticPaths } from 'utils/getStatic';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import { useTranslation } from 'react-i18next';
import { client } from 'core/graphql/client';
import { ApolloError, useReactiveVar } from '@apollo/client';
import { IDiningMenuStorageData, diningMenuStorage } from 'storage/dining-menu.storage';
import { availablePaths } from 'utils/availablePaths';
import { useLocale, useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { processError } from 'utils/processError';
import { IHamburgerProps, getHamburgerProps } from 'utils/hamburger/getHamburgerProps';
import produce from 'immer';
import dayjs from 'dayjs';
import { BRANCH_CODE, CURRENCY } from 'core/graphql/endpoints';
import { DiningCustomisationDrawer } from 'components/pages/dining-menu/DiningCustomisationDrawer/DiningCustomisationDrawer';
import { TimeSelect } from 'components/shared/TimeSelectModal/TimeSelectModal';
import { BARCELONA, DINING, DUBAI_WATERFRONT, PAYMENT, PAYMENTFANDB } from 'utils/constants';
import { InputAdornment, TextField } from '@mui/material';
import Cookinginstructions from '@icons/cooking_instructions.svg';
import { CheckinDetails } from 'components/shared/CheckinDetailsDrawer/CheckinDetailsDrawer';
import { IRD_ORDER } from 'core/graphql/queries/IRD_ORDER';
import { ThankYouDrawer } from 'components/pages/ThankYouDrawer/ThankYouDrawer';
import { CREATE_FANDB_ORDER } from 'core/graphql/queries/CREATE_FOOD_AND_BEVERAGES_ORDER';
import { FandBDetailsDrawer } from 'components/pages/FandBDetailsDrawer/FandBDetailsDrawer';
import { DiningMenuElementUpsell } from 'components/pages/dining-menu/DiningMenuElementUpsell/DiningMenuElementUpsell';
import { addToCartEvent, fAndBOrderEvent, irdOrderEvent } from 'utils/gtag';
import { FandBOrders, setScrollPosition } from 'utils/functions';
import { diningInformationStorage } from 'storage/dining.storage';

export { getStaticPaths };

const DiningOrderSummary: React.FC<IHamburgerProps> = ({ hamburger, pages }) => {
  const { t } = useTranslation('dining-order-summary');
  const navigate = useLocalizedRouter();
  const locale = useLocale();
  const [customisationDrawer, setCustomisationDrawer] = useState(false);
  const [specialRequests, setSpecialRequests] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedTime, setSelectedTime] = useState('00:00');
  const [timeSelectOpened, setTimeSelectOpened] = useState(false);
  const [confirmOpened, setConfirmOpened] = useState(false);
  const [paymentType, setpaymentType] = useState<any>({
    name: BRANCH_CODE === BARCELONA ? PAYMENTFANDB[0]?.name : PAYMENT[0]?.name,
  });
  const [thankYouDrawer, setthankYouDrawer] = useState(false);
  const [restDrawer, setrestDrawer] = useState(false);
  const [guestNumber, setguestNumber] = useState(1);
  const [totalAmount, setTotalAmount] = useState(0);
  const [buttonTitle, setbuttonTitle] = useState('');
  const [thankYouDrawerConfirm, setthankYouDrawerConfirm] = useState(false);
  const existingOrders = FandBOrders();

  const diningData = useReactiveVar(diningMenuStorage) as IDiningMenuStorageData;

  const items = diningData?.items?.filter((item) => item?.quantity > 0);
  const restaurantId =
    (typeof window !== 'undefined' &&
      localStorage.getItem('restaurantId') &&
      JSON.parse(localStorage.getItem('restaurantId') ?? '')) ??
    '';

  const toggleConfirmDrawerOpened = useCallback(() => {
    setConfirmOpened((oldState) => !oldState);
  }, [confirmOpened]);

  const restDrawerOpened = useCallback(() => {
    setrestDrawer((oldState) => !oldState);
  }, [restDrawer]);

  useEffect(() => {
    const totalAmount = diningData?.items?.reduce((allTotal, item) => {
      const addonsTotal = item?.addons?.reduce((acc, addon) => {
        return acc + addon.price * item.quantity;
      }, 0);
      return allTotal + item.quantity * item.price + (addonsTotal ?? 0);
    }, 0);
    setTotalAmount(totalAmount);
  }, [diningData?.items]);

  const toggleTimeSelectOpened = useCallback(() => {
    setTimeSelectOpened((oldState) => !oldState);
  }, []);

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
            item?.customisation?.ingredient || (item?.addons ?? []).length > 0
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

  const restOrder = useCallback(async () => {
    localStorage.setItem('NoOfGuest', JSON.stringify(guestNumber) ?? '');
    const roomNumber =
      (typeof window !== 'undefined' &&
        localStorage.getItem('FandB_guestDetails') &&
        JSON.parse(localStorage.getItem('FandB_guestDetails') ?? '')?.roomNumber) ??
      '';
    const restOrderPayload = {
      additionalNote: specialRequests,
      guestName:
        (typeof window !== 'undefined' &&
          localStorage.getItem('FandB_guestDetails') &&
          JSON.parse(localStorage.getItem('FandB_guestDetails') ?? '')?.name) ??
        '',
      guestType: roomNumber ? 'Resident' : 'Non-Resident',
      items: diningData?.items?.map((el) => ({
        name: el?.title,
        code: el?.code,
        count: el?.quantity,
        amount: el?.price,
        addons: el?.addons?.map((item) => ({
          code: item?.code,
          name: item?.name,
          price: item?.price,
        })),
        customisations: el?.customisation?.ingredient
          ? [{ name: el?.customisation?.name, code: el?.customisation?.code }]
          : [],
        cookingInstructions: el?.cookingInstruction,
      })),
      noOfGuests: guestNumber,
      noOfItems: diningData?.items?.length,
      phoneNumber:
        (typeof window !== 'undefined' &&
          localStorage.getItem('FandB_guestDetails') &&
          JSON.parse(localStorage.getItem('FandB_guestDetails') ?? '').phoneNumber) ??
        '',
      restaurantId:
        (typeof window !== 'undefined' &&
          localStorage.getItem('restaurantId') &&
          JSON.parse(localStorage.getItem('restaurantId') ?? '')) ??
        '',
      roomNo: roomNumber,
      startTime: dayjs().format('YYYY-MM-DD HH:mm'),
      tableNumber:
        (typeof window !== 'undefined' &&
          localStorage.getItem('tableNumber') &&
          JSON.parse(localStorage.getItem('tableNumber') ?? '')) ??
        '',
      totalAmount,
      paymentMethod: paymentType?.name ?? '',
      lang: locale === 'en' ? '' : locale,
    };
    try {
      const response = await client.mutate({
        mutation: CREATE_FANDB_ORDER,
        context: { clientName: 'host_v5' },
        fetchPolicy: 'network-only',
        variables: restOrderPayload,
      });
      localStorage.setItem(
        'FandBOrders',
        JSON.stringify([...existingOrders, response?.data?.createFAndBOrder?.id]) ?? '',
      );
      setthankYouDrawer(true);
      fAndBOrderEvent(response?.data?.createFAndBOrder);
    } catch (getUpdatedReservationError) {
      processError(t, getUpdatedReservationError as ApolloError);
    }
  }, [
    guestNumber,
    specialRequests,
    diningData?.items,
    totalAmount,
    paymentType?.name,
    locale,
    existingOrders,
    t,
  ]);

  const handleOrder = useCallback(async () => {
    setScrollPosition(0, 0);
    diningInformationStorage(
      produce(diningInformationStorage(), (draft) => {
        if (draft) {
          draft.selectedCategory = '';
          draft.categoryName = '';
        }
      }),
    );
    const roomNumber =
      (typeof window !== 'undefined' &&
        localStorage.getItem('guestDetails') &&
        JSON.parse(localStorage.getItem('guestDetails') ?? '').roomNumber) ??
      '';

    if (
      (typeof window !== 'undefined' &&
        localStorage.getItem('tableNumber') &&
        JSON.parse(localStorage.getItem('tableNumber') ?? '')) ??
      ''
    ) {
      restDrawerOpened();
    }

    if (
      ((typeof window !== 'undefined' &&
        localStorage.getItem('restaurantId') &&
        JSON.parse(localStorage.getItem('restaurantId') ?? '')) ??
        '') == '' &&
      !thankYouDrawerConfirm
    ) {
      toggleConfirmDrawerOpened();
    } else if (roomNumber != '' && thankYouDrawerConfirm) {
      setLoading(true);
      const irdOrderPayload = {
        additionalNote: specialRequests,
        bookingId:
          (typeof window !== 'undefined' &&
            localStorage.getItem('guestDetails') &&
            JSON.parse(localStorage.getItem('guestDetails') ?? '').roomNumber) ??
          '',
        deliveryLocation: '',
        guestEmail: '',
        guestName:
          (typeof window !== 'undefined' &&
            localStorage.getItem('guestDetails') &&
            JSON.parse(localStorage.getItem('guestDetails') ?? '').name) ??
          '',
        noOfItems: diningData.items.length,
        totalAmount,
        paymentMethod: paymentType?.name ?? '',
        roomNo:
          (typeof window !== 'undefined' &&
            localStorage.getItem('guestDetails') &&
            JSON.parse(localStorage.getItem('guestDetails') ?? '').roomNumber) ??
          '',
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
          customisations: el?.customisation?.ingredient
            ? [{ name: el?.customisation?.name, code: el?.customisation?.code }]
            : [],
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
        setthankYouDrawerConfirm(false);
        setthankYouDrawer(true);
        diningMenuStorage({ items: [] });
      } catch (getUpdatedReservationError) {
        processError(t, getUpdatedReservationError as ApolloError);
      }
      setLoading(false);
    }
  }, [
    diningData?.items,
    guestNumber,
    paymentType?.name,
    restDrawerOpened,
    specialRequests,
    t,
    thankYouDrawerConfirm,
    toggleConfirmDrawerOpened,
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
            image={el?.images[0]?.master || null}
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

  const renderedItemIds: any = [];

  const isWindowDefined = typeof window !== 'undefined';
  const guestDetails =
    (isWindowDefined &&
      localStorage.getItem('guestDetails') &&
      JSON.parse(localStorage.getItem('guestDetails') ?? '')) ??
    '';
  const tableNumber =
    (isWindowDefined &&
      localStorage.getItem('tableNumber') &&
      JSON.parse(localStorage.getItem('tableNumber') ?? '')) ??
    '';
  useEffect(() => {
    if (guestDetails.roomNumber) {
      setbuttonTitle(t('ROOM NO - ') + guestDetails.roomNumber);
    } else if (tableNumber) {
      setbuttonTitle(t('TABLE NO - ') + tableNumber);
    }
  }, [tableNumber, guestDetails, t]);

  return (
    <>
      <Head>
        <title>{t('Order Details')}</title>
      </Head>
      <Header displayBackButton screenTitle={t('Order Details') as string} />
      <PageWrapper hamburger={hamburger} pages={pages} className={styles.pageWrapper}>
        <p className={styles.itemsTitle}>{t('Item(s) Added')}</p>
        <div className={styles.itemsWrapper}>
          {items?.map((item, index) => {
            const totalAddonPrice: any = item?.addons?.reduce(
              (acc, addon) => acc + addon?.price,
              0,
            );
            const totalPrice = item?.price + totalAddonPrice ?? 0;
            return (
              item?.quantity > 0 && (
                <div key={index} className={styles.itemRow}>
                  <div className={styles.itemDesc}>
                    <p className={styles.itemTitle}>{item.title}</p>
                    {item?.customisation?.name && (
                      <p className={styles.itemDescription}>
                        {' '}
                        {item?.customisation?.ingredient}: {item?.customisation?.name}
                      </p>
                    )}
                    {(item?.addons ?? [])?.length > 0 && (
                      <p className={styles.itemDescription}>
                        {' '}
                        {t('Add-ons :')}{' '}
                        {item?.addons?.map((item, index) => (
                          <span key={index} className={styles.items}>
                            {item?.name} ({CURRENCY} {item?.price})
                          </span>
                        ))}
                      </p>
                    )}
                    {item?.cookingInstruction && (
                      <p className={styles.itemDescription}>
                        {t('Instructions')} : {item?.cookingInstruction}
                      </p>
                    )}

                    <p className={styles.itemTitle}>
                      {CURRENCY}{' '}
                      {(isNaN(totalPrice)
                        ? item.quantity * item.price
                        : item.quantity * totalPrice
                      )?.toFixed(2)}
                    </p>
                  </div>
                  <div className={styles.plusMinusInputWrapper}>
                    <PlusMinusInput
                      value={item.quantity as number}
                      onClickMinus={() => decrement(item?.itemId ?? '', index)}
                      onClickPlus={() => increment(item?.itemId ?? '', index)}
                      minQuantity={0}
                      className={styles.plusMinus}
                      irdSummary
                    />
                    {/* <p onClick={editHandler} className={styles.edit}>{`${t('edit')}`}</p> */}
                  </div>
                </div>
              )
            );
          })}
        </div>
        {items?.some((item: any) => item?.upsell?.length > 0) && (
          <>
            <div className={styles.divider}></div>
            <div className={styles.upsell}>
              <h2 className={styles.youMayAlsoLikeText}>{t('You May Also Like')}</h2>
              <div className={styles.upsellWrapper}>
                {items.map((item) => {
                  if (!renderedItemIds.includes(item.itemId)) {
                    renderedItemIds.push(item.itemId);

                    return (
                      <React.Fragment key={item.itemId}>
                        {renderMenuElements(item?.upsell ?? [])}
                      </React.Fragment>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          </>
        )}
        <div className={styles.divider}></div>
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
                fontFamily: styles.placeHolderInstruction,
              },
            },
          }}
          variant='standard'
          style={{ borderBottomColor: 'red' }}
        />
        <div className={styles.guestCount}>
          <div className={styles.guestTititle}>
            <p className={styles.totalCostTitle}>{t('No of Guests')}</p>
            <p className={styles.totalCostTitleCutlury}>
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
            {(BRANCH_CODE === BARCELONA ? PAYMENTFANDB : PAYMENT)?.map((item) => (
              <StyledButton
                key={item.id}
                variant={item.name === paymentType?.name ? 'contained' : 'outlined'}
                className={styles.buttonPayment}
                onClick={() => setpaymentType(item)}
              >
                {t(`${item?.name}`)}
              </StyledButton>
            ))}
          </div>
        </div>

        <div className={styles.taxWrapper}>
          {BRANCH_CODE === DUBAI_WATERFRONT ? (
            <p className={styles.taxText}>
              {' '}
              {t(
                '* All prices include 5% VAT, 10% service charge, and 7% municipality fee, but exclude AED 5 tray fee',
              )}
            </p>
          ) : (
            <p className={styles.taxText}> {t('* All prices include 10% VAT')}</p>
          )}
        </div>
        <TimeSelect
          opened={timeSelectOpened}
          toggleOpened={toggleTimeSelectOpened}
          setSelectedTime={setSelectedTime}
          selectedTime={selectedTime}
        />
        {items?.length > 0 && (
          <div className={styles.confirmOrderButton}>
            <div className={styles.confirmationWrapperBotton}>
              <div className={styles.totalCostRow}>
                <p className={styles.totalCostTitleButton}>
                  {buttonTitle ?? ''}
                  {/* {router.query['restId'] ? ` Table - Number ${router.query['restId']}` : ''} */}
                </p>
                <p className={styles.totalCostValue}>
                  {t('TOTAL')}
                  {'  '}
                  {CURRENCY} <span className={styles.currencyValue}>{totalAmount?.toFixed(2)}</span>
                </p>
              </div>
              <StyledButton
                disabled={items?.length === 0 || (restaurantId == '' && paymentType.length === 0)}
                loading={loading}
                className={styles.button}
                onClick={handleOrder}
                variant='contained'
                count={items?.length}
              >
                {t('Confirm Order')}
              </StyledButton>
            </div>
          </div>
        )}
        <DiningCustomisationDrawer
          customisationDrawer={customisationDrawer}
          closeCustomisationDrawer={closeCustomisationDrawer}
        />
        <CheckinDetails
          setthankYouDrawerConfirm={setthankYouDrawerConfirm}
          opened={confirmOpened}
          toggleOpened={toggleConfirmDrawerOpened}
        />
        <FandBDetailsDrawer
          restOrder={restOrder}
          opened={restDrawer}
          toggleOpened={restDrawerOpened}
          paymentSelected={paymentType?.name}
        />
        {/* <PaymentDrawer
          setpaymentType={setpaymentType}
          opened={paymentDrawer}
          toggleOpened={paymentdrawerOpen}
        /> */}
        <ThankYouDrawer
          opened={thankYouDrawer}
          title={t('Your order has been confirmed.') as string}
          redirect={DINING}
          close={setthankYouDrawer}
        />
        {/* <DiningConfirmationDrawer opened={opened} toggleOpened={toggleOpened} /> */}
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
      ...(await getHamburgerProps()),
    },
  };
};

export default DiningOrderSummary;
