import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { getStaticPaths } from 'utils/getStatic';
import i18nConfig from 'next-i18next.config';
import { client } from 'core/graphql/client';
import { GET_YOUVERSE_CONFIG } from 'core/graphql/queries/GET_YOUVERSE_CONFIG';
import { GET_YOUVERSE_RESPONSE } from 'core/graphql/queries/GET_YOUVERSE_RESPONSE';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { availablePaths } from 'utils/availablePaths';
import { reservationGuestInfoStorageData } from 'storage/reservation-guest-info.storage';
import { ApolloError, useReactiveVar } from '@apollo/client';
import { GET_RESERVATION, IGetReservationApiResponse } from 'core/graphql/queries/GET_RESERVATION';
import { useConfig, useDocumentConfig } from 'utils/hooks/useConfiguration';
import { youverseProfileIDStorage } from 'storage/check-in.storage';
import { accompanyGuestDetails } from 'storage/accompany-guest-details';
import { DOCTYPE, FAILURE, PRIMARY } from 'utils/constants';
import { STORE_RESERVATION } from 'core/graphql/queries/STORE_RESERVATION';
import { Notification } from 'components/shared/Notification/Notification';
import { notificationDetails, toggleNotification } from 'storage/home.storage';
import { timeFormats } from 'utils/timeFormats';
import dayjs from 'dayjs';
import {
  getCheckInToken,
  handleCheckInAuthenticationFailure,
} from 'core/api/functions/getCheckInAuthentication';
import { processStatusCode } from 'utils/processError';

export { getStaticPaths };

const Youverse: React.FC = () => {
  const { t } = useTranslation(['check-in']);
  const navigate = useLocalizedRouter();
  const hotel = useConfig()?.name;
  const [src, setSrc] = useState('');
  const notificationInfo = useReactiveVar(notificationDetails);
  const youverseProfileIDState = useReactiveVar(youverseProfileIDStorage);
  const guestReservationInfo = useReactiveVar(reservationGuestInfoStorageData);
  const accompanyGuestData = useReactiveVar(accompanyGuestDetails);
  const documentConfig: any = useDocumentConfig();

  const docTypes = documentConfig?.details?.find((e: any) => e?.name === DOCTYPE)?.options;

  const reservationData = client.readQuery<IGetReservationApiResponse>({
    query: GET_RESERVATION,
  });

  const confirmationId = reservationData?.getReservation?.data?.confirmationId;
  const lastName = reservationData?.getReservation?.data?.guests[0]?.lastName;
  const checkInDate = reservationData?.getReservation?.data?.details?.checkInDate;
  const checkOutDate = reservationData?.getReservation?.data?.details?.checkOutDate;

  const reservationDataSelected = reservationData?.getReservation?.data?.guests?.find(
    (item) => item?.id === youverseProfileIDState?.id,
  );

  const docScanId = 'docScanId_' + reservationDataSelected?.id;

  useEffect(() => {
    const getYouverseConfig = () => {
      const checkInToken = getCheckInToken();
      const payload = {
        userId: docScanId,
        expireDate: dayjs()?.add(1, 'day').format(timeFormats?.YOUVERSE_EXPIRE_DATE),
        documentOptions: [...new Set(docTypes?.map((opt: any) => opt?.vendorDocType))],
      };

      client
        .query({
          query: GET_YOUVERSE_CONFIG,
          context: { clientName: 'rest', headers: { Authorization: 'Bearer ' + checkInToken } },
          fetchPolicy: 'no-cache',
          variables: {
            body: payload,
            confirmationId: confirmationId,
          },
        })
        .then((res: any) => {
          setSrc(res?.data?.getyoonikconfig?.data?.redirectUrl);
        })
        .catch((error: any) => {
          const statusCode = processStatusCode(error as ApolloError);
          statusCode === 403 && handleCheckInAuthenticationFailure(getYouverseConfig);
        });
    };
    getYouverseConfig();

    const interval = setInterval(() => getData(), 10000);

    function getData() {
      client
        .query({
          query: GET_YOUVERSE_RESPONSE,
          context: {
            clientName: 'rest',
            headers: { Authorization: 'Bearer ' + getCheckInToken() },
          },
          fetchPolicy: 'no-cache',
          variables: {
            docId: docScanId,
            confirmationId: confirmationId,
          },
        })
        .then((res: any) => {
          if (
            res?.data?.getyoonikresponse?.data?.status === 'Failed' ||
            res?.data?.getyoonikresponse?.data?.status === 'Success'
          ) {
            if (res?.data?.getyoonikresponse?.data?.status === 'Success') {
              if (
                res?.data?.getyoonikresponse?.data?.firstName &&
                res?.data?.getyoonikresponse?.data?.lastName &&
                !(
                  (res?.data?.getyoonikresponse?.data?.firstName
                    ?.toLowerCase()
                    .includes(reservationDataSelected?.firstName?.toLowerCase()) ||
                    res?.data?.getyoonikresponse?.data?.firstName
                      ?.toLowerCase()
                      .includes(reservationDataSelected?.lastName?.toLowerCase())) &&
                  (res?.data?.getyoonikresponse?.data?.lastName
                    ?.toLowerCase()
                    .includes(reservationDataSelected?.firstName.toLowerCase()) ||
                    res?.data?.getyoonikresponse?.data?.lastName
                      ?.toLowerCase()
                      .includes(reservationDataSelected?.lastName.toLowerCase()))
                )
              ) {
                toggleNotification(true);
                notificationDetails({
                  title: t('Oops Match Not Found!') as string,
                  description: t(
                    // eslint-disable-next-line quotes
                    "Reservation details doesn't match with Document details.",
                  ) as string,
                  redirect: availablePaths?.GUEST_VERIFICATION,
                  type: FAILURE,
                });
              } else if (
                res?.data?.getyoonikresponse?.data?.surname &&
                !res?.data?.getyoonikresponse?.data?.surname
                  ?.toLowerCase()
                  ?.includes(reservationDataSelected?.firstName.toLowerCase()) &&
                !res?.data?.getyoonikresponse?.data?.surname
                  ?.toLowerCase()
                  ?.includes(reservationDataSelected?.lastName.toLowerCase())
              ) {
                toggleNotification(true);
                notificationDetails({
                  title: t('Oops Match Not Found!') as string,
                  description: t(
                    // eslint-disable-next-line quotes
                    "Reservation details doesn't match with Document details.",
                  ) as string,
                  redirect: availablePaths?.GUEST_VERIFICATION,
                  type: FAILURE,
                });
              } else {
                try {
                  client.mutate({
                    mutation: STORE_RESERVATION,
                    context: { clientName: 'integration_v5' },
                    variables: {
                      profileId: docScanId,
                      reservationId: confirmationId,
                      lastName: lastName,
                      checkInDate: checkInDate,
                      checkOutDate: checkOutDate,
                    },
                  });
                } catch (e) {
                  console.error(e);
                }
                if (youverseProfileIDState?.guestType === PRIMARY) {
                  reservationGuestInfoStorageData({
                    ...guestReservationInfo,
                    docNo: res?.data?.getyoonikresponse?.data?.documentNumber,
                    docType: docTypes?.find(
                      (document: any) =>
                        document?.youverse === res?.data?.getyoonikresponse?.data?.youverseType,
                    )?.name,
                    effectiveDate: res?.data?.getyoonikresponse?.data?.issueDate,
                    expiryDate: res?.data?.getyoonikresponse?.data?.expiryDate,
                    issueCountry:
                      res?.data?.getyoonikresponse?.data?.country ||
                      res?.data?.getyoonikresponse?.data?.state,
                  });
                  // console.log('youverse', guestReservationInfo);
                } else {
                  // console.log('accompany', guestReservationInfo);
                  const updatedData = accompanyGuestData?.map((guest: any) => {
                    if (guest?.id === reservationDataSelected?.id) {
                      return {
                        ...guest,
                        docNo: res?.data?.getyoonikresponse?.data?.documentNumber,
                        docType: docTypes?.find(
                          (document: any) =>
                            document?.youverse === res?.data?.getyoonikresponse?.data?.youverseType,
                        )?.name,
                        effectiveDate: res?.data?.getyoonikresponse?.data?.issueDate,
                        expiryDate: res?.data?.getyoonikresponse?.data?.expiryDate,
                        issueCountry:
                          res?.data?.getyoonikresponse?.data?.country ||
                          res?.data?.getyoonikresponse?.data?.state,
                      };
                    }
                    return guest;
                  });
                  accompanyGuestDetails(updatedData);
                }
              }
            }
            if (res?.data?.getyoonikresponse?.data?.status === 'Failed') {
              toggleNotification(true);
              notificationDetails({
                title: t('Please Try Again!') as string,
                description: t('Verification process failed.') as string,
                redirect: availablePaths?.GUEST_VERIFICATION,
                type: FAILURE,
              });
            }
            navigate(availablePaths?.GUEST_VERIFICATION);
            clearInterval(interval);
          }
        })
        .catch((error: any) => {
          const statusCode = processStatusCode(error as ApolloError);
          statusCode === 403 && handleCheckInAuthenticationFailure(getData);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Head>
        <title>
          {hotel} | {t('Document Scanning')}
        </title>
      </Head>

      <div>
        <iframe src={src} allow='camera' style={{ width: '100%', height: '100dvh' }} />
      </div>
      <Notification
        title={notificationInfo?.title}
        description={notificationInfo?.description}
        redirect={notificationInfo?.redirect}
        type={notificationInfo?.type}
      />
    </>
  );
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const locale = ctx?.params?.locale;
  return {
    props: {
      ...(await serverSideTranslations(locale as string, ['check-in'], i18nConfig)),
    },
  };
};

export default Youverse;
