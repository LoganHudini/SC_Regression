import React, { useState } from 'react';
import styles from './Shift4.module.scss';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import useScripts from 'utils/hooks/useScripts';
import { PaymentLoader } from '../PaymentLoader/PaymentLoader';
import { INITIATE_PAYMENT_SHIFT4 } from 'core/graphql/queries/INITIATE_PAYMENT';
import { client } from 'core/graphql/client';
import { reservationGuestInfoStorageData } from 'storage/reservation-guest-info.storage';
import { availablePaths } from 'utils/availablePaths';
import { GET_RESERVATION } from 'core/graphql/queries/GET_RESERVATION';
import produce from 'immer';
import { getCheckInToken } from 'core/api/functions/getCheckInAuthentication';

const Shift4 = () => {
  const navigate = useLocalizedRouter();
  const [loading, setLoading] = useState(true);
  let backgroundImg = '';
  try {
    backgroundImg = '';
  } catch {
    backgroundImg = '';
  }
  const wrapperStyle = {
    backgroundImage: 'url(' + backgroundImg + ')',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    backgroundSize: 'cover',
  };
  const checkInToken = getCheckInToken();

  const reservationData = client.readQuery({
    query: GET_RESERVATION,
  });

  const reservationInfo = reservationData?.getReservation.data;

  const loaded = useScripts('https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js');
  const loaded1 = useScripts('https://i4m.i4go.com/js/jquery.i4goTrueToken.js');

  const initialize = async () => {
    const initiatePaymentPayload = {
      // currency: reservationInfo?.details.holdAmount.currency as string,
      // amount: 2,
      bookingId: reservationInfo?.confirmationId as string,
      // orderId: reservationInfo?.confirmationId as string,
    };
    const { data } = await client.query({
      query: INITIATE_PAYMENT_SHIFT4,
      variables: { body: initiatePaymentPayload },
      context: { clientName: 'rest', headers: { Authorization: 'Bearer ' + checkInToken } },
      fetchPolicy: 'network-only',
    });

    setLoading(false);
    (window as any).$(function () {
      (window as any).$('#form-main').i4goTrueToken({
        server: data?.initiatePayment?.data?.answer.payment_zone_data,
        accessBlock: data?.initiatePayment?.data?.answer.transaction_id,
        self: document.location,
        template: 'bootstrap3-horizontal',
        gcDisablesExpiration: true,
        gcDisablesCVV2Code: true,
        encryptedOnlySwipe: true,
        deviceEntryOnly: {
          classes: '',
          label: '',
          required: false,
        },
        url: data?.initiatePayment?.data?.answer.intent,
        frameContainer: 'i4goFrame',
        frameName: '',
        frameAutoResize: true,
        submitButton: {
          label: 'Secure My Payment Information',
          visible: true,
        },
        frameClasses: '',
        formAutoSubmitOnSuccess: false,
        formAutoSubmitOnFailure: false,
        onSuccess: function (form: any, response: any) {
          reservationGuestInfoStorageData(
            produce(reservationGuestInfoStorageData(), (draft: any) => {
              draft.token = response.i4go_utoken;
              draft.cardNumber = response.otn.cardnumber;
              draft.cardHolderName = response.i4go_cardholdername;
              draft.cardType = response.i4go_cardtype;
              draft.cardExpiryDate =
                response.i4go_expirationmonth + '/' + response.i4go_expirationyear;
            }),
          );
          navigate(availablePaths?.CARD_AUTHORISATION);
        },
        onFailure: function () {
          navigate(availablePaths.CARD_AUTHORISATION);
        },
        onComplete: function () {
          navigate(availablePaths?.CARD_AUTHORISATION);
        },
        onPaymentDataChanged: function (
          iobj: any,
          intermediatePaymentData: any,
          paymentDataRequestUpdate: any,
        ) {
          return paymentDataRequestUpdate;
        },

        acceptedPayments: 'AX,DC,GC,JC,MC,NS,VS',
        language: 'en',
        formPaymentResponse: 'customNameFori4go_response',
        formPaymentResponseCode: 'customNameFori4go_responsecode',
        formPaymentResponseText: 'customNameFori4go_responsetext',
        formPaymentMaskedCard: 'customNameFori4go_maskedcard',
        formPaymentToken: 'customNameFori4go_uniqueid',
        formPaymentExpMonth: 'customNameFori4go_expirationmonth',
        formPaymentExpYear: 'customNameFori4go_expirationyear',
        formPaymentType: 'customNameFori4go_cardtype',
        formCardholderName: 'customNameFori4go_cardholdername',
        formStreetAddress: 'customNameFori4go_streetaddress',
        formPostalCode: 'customNameFori4go_postalcode',
        formMetaToken: 'customNameFori4go_metatoken',
        formExtendedCardData: 'customNameFori4go_extendedcarddata',
        formApplePayToken: 'customNameFori4go_applepaytoken',
        formGooglePayToken: 'customNameFori4go_googlepaytoken',
      });
    });
  };

  if (loaded && loaded1) {
    initialize();
  }

  if (loading) {
    return (
      <div>
        <PaymentLoader />
      </div>
    );
  } else {
    return (
      <div className={styles.payment} style={wrapperStyle}>
        <div className={styles.paymentBanner}>
          <form id='form-main'>
            <div id='i4goFrame'></div>
          </form>
        </div>
      </div>
    );
  }
};
export default Shift4;
