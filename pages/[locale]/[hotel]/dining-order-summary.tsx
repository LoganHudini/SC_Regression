import { Header } from 'components/shared/Header/Header';
import { PageWrapper } from 'components/shared/PageWrapper/PageWrapper';
import { PlusMinusInput } from 'components/shared/PlusMinusInput/PlusMinusInput';
import { GetStaticProps } from 'next';
import i18nConfig from 'next-i18next.config';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import styles from '@styles/dining-order-summary/dining-order-summary.module.scss';
import { getStaticPaths } from 'utils/getStatic';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import { useTranslation } from 'react-i18next';
import { client } from 'core/graphql/client';
import { ApolloError, useReactiveVar } from '@apollo/client';
import {
  IDiningMenuStorageData,
  diningMenuStorage,
  toggleDiningDetailsDrawer,
  editControl,
} from 'storage/dining-menu.storage';
import { availablePaths } from 'utils/availablePaths';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import produce from 'immer';
import dayjs from 'dayjs';
import { DiningCustomisationDrawer } from 'components/pages/dining/DiningCustomisationDrawer/DiningCustomisationDrawer';
import {
  CMS,
  DEFAULT_SERVICE_CHARGE_MESSAGE,
  ERRORMSG,
  FAILED_TO_FETCH_BOOKING_DETAILS,
  FAILURE,
  INVALID_BOOKING_STATUS,
  IN_ROOM_DINING,
  SERVICE_CHARGES,
  SUCCESS,
  VENDOR,
} from 'utils/constants';
import { InputAdornment } from '@mui/material';
import Cookinginstructions from '@icons/cooking_instructions.svg';
import { IRD_ORDER } from 'core/graphql/queries/IRD_ORDER';
import { addToCartEvent } from 'utils/gtag';
import { findModule, formatPriceIRD, setScrollPosition } from 'utils/functions';
import { diningInformationStorage } from 'storage/dining.storage';
import DiningDetailsDrawer from 'components/pages/dining/DiningDetailsDrawer/DiningDetailsDrawer';
import { hotelInfoStorage, notificationStorage, toggleNotification } from 'storage/home.storage';
import { DiningMenuElementUpsell } from 'components/pages/dining/DiningMenuElementUpsell/DiningMenuElementUpsell';
import { reviewSignAndCheckBox, useCheckedIn } from 'storage/check-in.storage';
import { useConfig } from 'utils/hooks/useConfiguration';
import { IRD_ORDER_TRANSACTION_POS } from 'core/graphql/queries/IRD_ORDER_TRANSACTION_POS';
import EditIcon from '@icons/commonEditIcon.svg';
import { useCurrency } from 'utils/hooks/useCurrency';
import { checkoutTrip } from 'storage/trips.storage';
import {
  getInHouseToken,
  handleinHouseAuthenticationFailure,
} from 'core/api/functions/getInHouseAuthentication';
import { processStatusCode } from 'utils/processError';
import cx from 'classnames';
import { StyledInput } from 'components/shared/StyledInput/StyledInput';
import { useFormik } from 'formik';
import { instructionValidation } from 'validation/dining.validation';
import SignatureCanvas from 'react-signature-canvas';

export { getStaticPaths };

const DiningOrderSummary = () => {
  const { t } = useTranslation(['dining-order-summary', 'dining']);
  const navigate = useLocalizedRouter();
  const checkinData = useCheckedIn();
  const renderedItemIds: any = [];
  const config = useConfig();
  const hotelId = config?.hotelId;
  const hotelName = config?.name;
  const irdOrderType: any = findModule(config?.modules, IN_ROOM_DINING);
  const hotelInfo = useReactiveVar(hotelInfoStorage);
  const [customisationDrawer, setCustomisationDrawer] = useState(false);
  const [specialRequests, setSpecialRequests] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentType, setpaymentType] = useState<any>(
    irdOrderType?.payment?.length > 0 ? irdOrderType?.payment[0] : [],
  );
  const [guestNumber, setguestNumber] = useState(1);
  const [totalAmount, setTotalAmount] = useState(0);
  const currency = useCurrency();
  const reviewAndSign = useReactiveVar(reviewSignAndCheckBox);
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [signature, setSignature] = useState<any>(reviewAndSign?.sign || null);
  const diningData = useReactiveVar(diningMenuStorage) as IDiningMenuStorageData;
  const [signatureWidth, setSignatureWidth] = useState(340);
  const [btnStatus, setBtnStatus] = useState(false);

  const information = hotelInfo?.getPropertyDetailsByHotelId?.hotel?.detailsCustomAttributes;

  const getServiceCharges = (data: any) =>
    data?.find((item: any) => item?.key === SERVICE_CHARGES)?.value ||
    DEFAULT_SERVICE_CHARGE_MESSAGE;

  const servicechargeDisplay = getServiceCharges(information);

  const items = diningData?.items?.filter((item) => item?.quantity > 0);

  useEffect(() => {
    const totalAmount = diningData?.items?.reduce((allTotal, item) => {
      const addonsTotal =
        item?.addons?.length > 0 &&
        item?.addons?.reduce((acc: any, addon: any) => {
          return acc + addon?.price * item?.quantity;
        }, 0);
      return allTotal + item?.quantity * item?.price + addonsTotal;
    }, 0);
    setTotalAmount(totalAmount);
  }, [diningData?.items]);

  useEffect(() => {
    if (items?.length === 0) {
      navigate(availablePaths.DINING);
    }
  }, [items, navigate]);

  const clearCanvas = useCallback(() => {
    sigCanvas?.current?.clear();
    setSignature(null);
    setBtnStatus(false);
    reviewSignAndCheckBox(
      produce(reviewSignAndCheckBox(), (draft: any) => {
        draft.sign = null;
      }),
    );
  }, []);

  const formik = useFormik({
    initialValues: { instruction: '' },
    validationSchema: instructionValidation,
    onSubmit: (values) => {
      setSpecialRequests(values.instruction);
    },
  });

  const increment = useCallback(
    (itemId: string, index: number) => {
      const selectedItem = diningData?.items?.find(
        (item, i) => item?.itemId === itemId && i === index,
      );
      diningMenuStorage(
        produce(diningMenuStorage(), (draft) => {
          const item = draft?.items?.find((el, i) => el?.itemId === itemId && i === index);

          if (item) {
            (item?.customisation ?? []).length > 0 || (item?.addons ?? []).length > 0
              ? setCustomisationDrawer((state) => !state)
              : (item.quantity++,
                addToCartEvent({
                  id: selectedItem?.itemId,
                  name: selectedItem?.title,
                  price: selectedItem?.price,
                  quantity: 1,
                  currency: currency,
                }));
            draft.selectedItemId = itemId;
            draft.selectedIndex = index;
          }
        }),
      );
    },
    [currency, diningData?.items],
  );

  const editFunction = useCallback((itemId: any, index: number) => {
    diningMenuStorage(
      produce(diningMenuStorage(), (draft) => {
        const item = draft?.items?.find((el, i) => el.itemId === itemId && i === index);

        if (item) {
          draft.selectedItemId = itemId;
          draft.selectedIndex = index;
          editControl(true);
          toggleDiningDetailsDrawer(true);
        }
      }),
    );
  }, []);

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
    editControl(false);
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
      guestEmail: checkinData?.email,
      guestName: checkinData?.lastName,
      noOfItems: diningData.items.length,
      totalAmount,
      paymentMethod: paymentType?.name,
      roomNo: checkinData?.roomNumber,
      startTime: dayjs().format('YYYY-MM-DD HH:mm'),
      noOfGuests: guestNumber,
      items: diningData?.items?.map((el) => ({
        name: el?.title,
        code: el?.code,
        count: el?.quantity,
        amount: el?.price,
        addOns: el?.addons?.map((item: any) => ({
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
      guestSignature: irdOrderType?.signatureRequired
        ? (sigCanvas?.current?.toDataURL() as string)?.replace('data:image/png;base64,', '')
        : '',
    };

    const irdOrderPOSPayload = {
      hotelId: hotelId,
      date: '',
      deliveryLocation: '',
      bookingId: checkinData?.reservationId,
      guestName: checkinData?.lastName,
      guests: guestNumber,
      paymentMethod: paymentType?.name,
      roomNo: checkinData?.roomNumber,
      items: diningData?.items?.map((el) => ({
        name: el?.title,
        code: el?.code,
        quantity: el?.quantity,
        price: el?.price,
        comment: el?.cookingInstruction || '',
        addons: el?.addons?.map((item: any) => ({
          code: item?.code,
          name: item?.name,
          price: item?.price,
          quantity: 1,
          comment: '',
        })),
        customisations: el?.customisation?.map((item: any) => ({
          code: item?.code,
          name: item?.name,
        })),
      })),
      additionalNote: specialRequests,
      guestSignature: irdOrderType?.signatureRequired
        ? (sigCanvas?.current?.toDataURL() as string)?.replace('data:image/png;base64,', '')
        : '',
    };

    let response;
    try {
      if (irdOrderType?.type === CMS) {
        response = await client.mutate({
          mutation: IRD_ORDER,
          context: { clientName: 'property_d' },
          fetchPolicy: 'network-only',
          variables: irdOrderPayload,
        });
      } else if (irdOrderType?.type === VENDOR) {
        const inHouseToken = await getInHouseToken(
          '',
          checkinData?.roomNumber,
          checkinData?.lastName,
        );
        await client.mutate({
          mutation: IRD_ORDER_TRANSACTION_POS,
          context: {
            clientName: 'integration_b',
            headers: {
              Authorization: 'Bearer ' + inHouseToken,
            },
          },
          fetchPolicy: 'network-only',
          variables: irdOrderPOSPayload,
        });
      }
      // irdOrderEvent(response?.data?.createOrder, currency);
      setTimeout(() => {
        diningMenuStorage({ items: [] });
      }, 5000);
      notificationStorage({
        title: t('Thank You!'),
        type: SUCCESS,
        description: t('Your order has been confirmed.'),
        redirect: availablePaths?.DINING,
      });
      toggleNotification(true);
      reviewSignAndCheckBox({ checkBox: false, sign: null });
    } catch (getUpdatedReservationError) {
      const networkError = getUpdatedReservationError as ApolloError;
      const statusCode = processStatusCode(networkError);

      const FailureCheck1 =
        networkError?.message === FAILED_TO_FETCH_BOOKING_DETAILS ? true : false;
      const FailureCheck2 = networkError?.message === INVALID_BOOKING_STATUS ? true : false;

      if (statusCode === 403) {
        handleinHouseAuthenticationFailure(handleOrder);
      } else {
        notificationStorage({
          title: FailureCheck1 || FailureCheck2 ? t('Invalid Reservation') : t(ERRORMSG),
          type: FAILURE,
          description:
            FailureCheck1 || FailureCheck2
              ? t(
                  'Reservation status is invalid. Please try again with a valid reservation details',
                )
              : t('Your order was not confirmed.'),
          redirect: FailureCheck1 || FailureCheck2 ? availablePaths.HOME : null,
        });
        toggleNotification(true);
        if (FailureCheck1 || FailureCheck2) {
          checkoutTrip();
        }
      }
    }
    setLoading(false);
  }, [
    checkinData?.email,
    checkinData?.lastName,
    checkinData?.reservationId,
    checkinData?.roomNumber,
    diningData.items,
    guestNumber,
    hotelId,
    irdOrderType?.type,
    paymentType?.name,
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
            image={
              el?.images && Array.isArray(el.images) && el.images.length > 0
                ? el.images[0]?.ratio1to1
                : null
            }
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

  const handleSignatureChange = () => {
    const signatureData = sigCanvas?.current?.toData();
    setSignature(signatureData);
    const signvalue = { ...reviewAndSign };
    signvalue.sign = signatureData;
    reviewSignAndCheckBox(signvalue);
  };

  useEffect(() => {
    if (sigCanvas?.current && signature !== null) {
      setBtnStatus(true);
    } else {
      setBtnStatus(false);
    }
  }, [signature]);

  useEffect(() => {
    const signatureWidth = () => {
      const div = document.getElementById('signatureWrapper');
      if (div) {
        setSignatureWidth(div.offsetWidth);
      }
    };
    signatureWidth();
    window.addEventListener('resize', signatureWidth);

    return () => {
      window.removeEventListener('resize', signatureWidth);
    };
  }, []);

  useEffect(() => {
    setTimeout(() => {
      restoreSignature();
    }, 500);
  }, [signature, sigCanvas?.current]);

  const restoreSignature = () => {
    if (signature && sigCanvas?.current) {
      requestAnimationFrame(() => {
        sigCanvas?.current?.clear();
        sigCanvas?.current?.fromData(signature);
      });
    }
  };

  return (
    <>
      <Head>
        <title>
          {hotelName} | {t('Order Details')}
        </title>
      </Head>
      <Header displayBackButton screenTitle={t('Order Details') as string} />
      <PageWrapper className={styles.pageWrapper}>
        <p className={styles.itemsAddedText}>{t('Item(s) Added')}</p>
        <div className={styles.cartWrapper}>
          {items?.map((item, index) => {
            const totalAddonPrice: any =
              item?.addons?.length > 0 &&
              item?.addons?.reduce((acc: any, addon: any) => acc + addon?.price, 0);
            const totalPrice = item?.price + totalAddonPrice;
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
                      <p className={styles.itemDescriptionCust}>
                        {item?.customisation?.map((items: any, index: any) => (
                          <div key={index}>
                            {items?.name}
                            {index !== item?.customisation?.length - 1 ? ', ' : ''}

                            <br />
                          </div>
                        ))}
                      </p>
                    )}
                    {(item?.addons ?? [])?.length > 0 && (
                      <div className={styles.addonsWrapperCols}>
                        {item?.addons?.map((items: any, index: any) => (
                          <div className={styles.addonsWrapperRows} key={index}>
                            <span className={styles.itemDescription}>
                              {items?.name}
                              {' - '}
                            </span>
                            <span key={index} className={styles.items}>
                              <span key={index} className={styles.itemsCurrency}>
                                <span className='irdPrice'>{currency} </span>
                              </span>
                              {formatPriceIRD(items?.price)}{' '}
                              {index !== item?.addons?.length - 1 ? ',' : ''}{' '}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    {(item?.groupedAddons ?? [])?.length > 0 && (
                      <div className={styles.addonsWrapperCols}>
                        {item?.groupedAddons?.map((items: any, index: any) => (
                          <div className={styles.addonsWrapperRows} key={index}>
                            <span className={styles.itemDescription}>
                              {items?.name}
                              {' - '}
                            </span>
                            <span key={index} className={styles.items}>
                              <span key={index} className={styles.itemsCurrency}>
                                <span className='irdPrice'>{currency} </span>
                              </span>
                              {formatPriceIRD(items?.price)}{' '}
                              {index !== item?.groupedAddons?.length - 1 ? ',' : ''}{' '}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    {item?.cookingInstruction && (
                      <p className={styles.itemDescription}>
                        {t('Instructions')}: {item?.cookingInstruction}
                      </p>
                    )}
                  </div>

                  <div className={cx(styles.priceEditWrapper, 'irdV2FLow')}>
                    <EditIcon
                      className={styles.edit}
                      onClick={() => editFunction(item?.itemId, index)}
                    />
                    <p className={styles.itemPrice}>
                      <span className={styles.itemCurrency}>{currency} </span>
                      {formatPriceIRD(
                        isNaN(totalPrice) ? item.quantity * item.price : item.quantity * totalPrice,
                      )}
                    </p>
                  </div>
                  <div className={cx(styles.priceEditWrapper, 'irdV2FLowShow')}>
                    <EditIcon
                      className={styles.edit}
                      onClick={() => editFunction(item?.itemId, index)}
                    />
                    <p className={styles.itemPrice}>
                      {formatPriceIRD(
                        isNaN(totalPrice) ? item.quantity * item.price : item.quantity * totalPrice,
                      )}
                    </p>
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

        <StyledInput
          autoComplete='off'
          variant='standard'
          onChange={(e) => {
            formik.handleChange(e);
            setSpecialRequests(e.target.value);
          }}
          fullWidth
          color='success'
          value={formik.values.instruction}
          className={styles.textInput}
          id='instruction'
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
                font: '14px var(--primary-font-heading)',
                color: 'var(--tertiary-text-color)',
                marginInlineStart: '0.5rem',
              },
            },
          }}
          error={Boolean(formik.errors.instruction)}
          helperText={formik.errors.instruction ? t(formik.errors.instruction) : null}
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

        {irdOrderType?.payment?.length > 1 && (
          <div className={styles.paymentContainer}>
            <p className={styles.paymentTitle}>{t('Payment Method')}</p>
            <div className={styles.buttonPaymentWrapper}>
              {irdOrderType?.payment?.map((item: any) => (
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
        )}

        <p className={styles.taxText}>{t(`${servicechargeDisplay}`)}</p>

        {irdOrderType?.signatureRequired && (
          <>
            <div className={styles.guestSignatureWrapper}>
              <p className={styles.guestSignature}>{t('Guest Signature')}</p>
              <p className={styles.clearBtn} onClick={clearCanvas}>
                {t('Clear')}
              </p>
            </div>
            <div id='signatureWrapper' className={styles.agrementSignatureWrapper}>
              <SignatureCanvas
                ref={sigCanvas}
                penColor='#3D3C3C'
                canvasProps={{
                  height: 100,
                  width: signatureWidth,
                }}
                clearOnResize={false}
                onEnd={() => handleSignatureChange()}
              />
            </div>
          </>
        )}

        {items?.length > 0 && (
          <div className={styles.confirmOrderButtonWrapper}>
            <StyledButton
              disabled={
                Boolean(formik.errors.instruction) ||
                items?.length === 0 ||
                paymentType?.length === 0 ||
                (irdOrderType?.signatureRequired && !btnStatus)
              }
              loading={loading}
              className={styles.confirmButton}
              onClick={handleOrder}
              variant='contained'
            >
              <div className={`${styles.buttonContentWrapper} irdV2DiningConfirmButton`}>
                <div className={styles.buttonWrapper}>
                  {items?.length > 0 && <span className={styles.itemCount}>{items?.length}</span>}
                  <span className={`${styles.currency} irdPrice`}>
                    <span className={styles.currencyTitle}> {currency} </span>
                    {formatPriceIRD(totalAmount)}
                  </span>
                </div>
                <div className='irdV2FLow'>{t('Confirm')}</div>
                <div className='irdV2FlowShow'>{t('Place Order')}</div>
              </div>
            </StyledButton>
          </div>
        )}
        <DiningCustomisationDrawer
          customisationDrawer={customisationDrawer}
          closeCustomisationDrawer={closeCustomisationDrawer}
        />
        <DiningDetailsDrawer menuAvailability />
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
        ['errors', 'dining-order-summary', 'dining'],
        i18nConfig,
      )),
    },
  };
};

export default DiningOrderSummary;
