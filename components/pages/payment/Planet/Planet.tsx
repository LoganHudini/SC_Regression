import { ApolloError, useReactiveVar } from '@apollo/client';
import {
  getCheckInToken,
  handleCheckInAuthenticationFailure,
} from 'core/api/functions/getCheckInAuthentication';
import { client } from 'core/graphql/client';
import { GET_RESERVATION, IGetReservationApiResponse } from 'core/graphql/queries/GET_RESERVATION';
import { INITIATE_PAYMENT_PLANET } from 'core/graphql/queries/INITIATE_PAYMENT';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { notificationStorage, toggleNotification } from 'storage/home.storage';
import { reservationGuestInfoStorageData } from 'storage/reservation-guest-info.storage';
import { FAILURE, PAY_BY_LINK, SUCCESS } from 'utils/constants';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { processStatusCode } from 'utils/processError';
import styles from './Planet.module.scss';
import cx from 'classnames';
import { availablePaths } from 'utils/availablePaths';
import { GET_PAYMENT_STATUS } from 'core/graphql/queries/GET_PAYMENT_STATUS';
import { convertYYMMToLastDate } from 'utils/functions';

interface IInitiatePaymentApiRequest {
  InitiatePaymentPayload: {
    data: {
      tokenForm: any;
      transactionIdentifier: any;
    };
  };
}

export const Planet: React.FC<any> = ({ paymentFlow }) => {
  const { t } = useTranslation(['check-in-payment', 'common']);
  const navigate = useLocalizedRouter();
  const iframeRef: any = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);
  const guestReservationInfo = useReactiveVar(reservationGuestInfoStorageData);

  const reservationData = client.readQuery<IGetReservationApiResponse>({
    query: GET_RESERVATION,
  });

  const reservationInfo = reservationData && reservationData?.getReservation?.data;
  const randomTransactionId =
    Math.floor(Math.random() * 9000000000) + 1000000000 + '-' + reservationInfo?.reservationId;

  const [transactionId, setTransactionId] = useState('');

  useEffect(() => {
    const preparePayment = async () => {
      const checkInToken = await getCheckInToken();

      if (reservationInfo) {
        const initiatePaymentPayload = {
          confirmationId: reservationInfo.confirmationId,
          referenceNumber: randomTransactionId,
          // eslint-disable-next-line camelcase
          payment_flow: paymentFlow ?? '',
        };
        let paymentData: IInitiatePaymentApiRequest | null = null;
        try {
          const { data } = await client.query({
            query: INITIATE_PAYMENT_PLANET,
            variables: {
              body: initiatePaymentPayload,
            },
            context: {
              clientName: 'rest',
              headers: { Authorization: 'Bearer ' + checkInToken },
            },
            fetchPolicy: 'network-only',
          });
          setTransactionId(randomTransactionId);
          paymentData = data;
        } catch (initiatePaymentError) {
          const statusCode = processStatusCode(initiatePaymentError as ApolloError);
          statusCode === 403
            ? handleCheckInAuthenticationFailure(preparePayment)
            : (notificationStorage({
                title: t('Payment Failed!') as string,
                description: t('Card Authentication Failed!') as string,
                type: FAILURE,
              }),
              toggleNotification(true),
              paymentFlow === PAY_BY_LINK && navigate(availablePaths?.HOME));
        }

        if (randomTransactionId) {
          const html = paymentData?.InitiatePaymentPayload?.data?.tokenForm;
          const doc = iframeRef?.current?.contentWindow?.document;

          if (doc) {
            doc.open();
            doc.write(html);
            doc.close();
            setLoading(false);
          }
        }
      }
    };
    preparePayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reservationInfo, t]);

  const handleChange = async () => {
    setTimeout(async () => {
      if (transactionId) {
        const cardOptions = [
          { code: 'MC', value: 'MC' },
          { code: 'VA', value: 'VS' },
          { code: 'AX', value: 'AX' },
        ];
        try {
          const { data: paymentStatusData } = await client.query({
            query: GET_PAYMENT_STATUS,
            context: {
              clientName: 'rest',
              headers: { Authorization: 'Bearer ' + (await getCheckInToken()) },
            },
            fetchPolicy: 'network-only',
            variables: {
              paymentId: transactionId,
              confirmationId: reservationInfo?.confirmationId,
            },
          });

          const status = paymentStatusData?.getPaymentStatus?.data['status '];

          const formattedExpiryDate = convertYYMMToLastDate(
            paymentStatusData.getPaymentStatus.data['cardExpiry'],
          );

          if (status === 'Success') {
            notificationStorage({
              title: t('Thank You!') as string as string,
              description: t('Card Authentication Completed') as string,
              type: SUCCESS,
            });
            toggleNotification(true);
            if (paymentFlow === PAY_BY_LINK) {
              client.clearStore();
              navigate(availablePaths?.HOME);
            } else {
              reservationGuestInfoStorageData({
                ...guestReservationInfo,
                token: paymentStatusData?.getPaymentStatus?.data['token'],
                cardNumber: paymentStatusData?.getPaymentStatus?.data['cardNumber '],
                cardHolderName: paymentStatusData?.getPaymentStatus?.data['cardHolderName '],
                cardType: cardOptions?.find(
                  (option: any) =>
                    option?.value === paymentStatusData?.getPaymentStatus?.data['paymentMethod '],
                )?.code,
                cardExpiryDate: formattedExpiryDate,
                approvalCode: paymentStatusData?.getPaymentStatus?.data['approvalCode'],
                paymentType: cardOptions?.find(
                  (option: any) =>
                    option?.value === paymentStatusData?.getPaymentStatus?.data['cardType '],
                )?.code,
              });
              navigate(availablePaths?.CARD_AUTHORISATION);
            }
          } else if (status === 'Failed') {
            notificationStorage({
              title: t('Payment Failed!') as string,
              description: t('Card Authentication Failed!') as string,
              type: FAILURE,
            });
            toggleNotification(true);
            paymentFlow === PAY_BY_LINK
              ? navigate(availablePaths?.HOME)
              : navigate(availablePaths?.CARD_AUTHORISATION);
          }
        } catch (paymentStatusError) {
          const statusCode = processStatusCode(paymentStatusError as ApolloError);
          statusCode === 403
            ? handleCheckInAuthenticationFailure(handleChange)
            : (notificationStorage({
                title: t('Payment Failed!') as string,
                description: t('Card Authentication Failed!') as string,
                type: FAILURE,
              }),
              toggleNotification(true));
        }
      }
    }, 1500);
  };

  return (
    <div>
      <iframe
        id='planetIframe'
        title='Payment'
        className={cx(styles.paymentWindow, { [styles.paymentWindowHidden]: loading })}
        ref={iframeRef}
        onLoad={handleChange}
        // sandbox='allow-scripts allow-forms allow-top-navigation allow-same-origin'git
      />
    </div>
  );
};
