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
import { useReactiveVar } from '@apollo/client';
import { GET_RESERVATION, IGetReservationApiResponse } from 'core/graphql/queries/GET_RESERVATION';
import { useConfig } from 'utils/hooks/useConfiguration';
import { youverseProfileIDStorage } from 'storage/check-in.storage';
import { accompanyGuestDetails } from 'storage/accompany-guest-details';
import { DOCUMENT_OPTIONS, FAILURE, PRIMARY } from 'utils/constants';
import { STORE_RESERVATION } from 'core/graphql/queries/STORE_RESERVATION';
import { Notification } from 'components/shared/Notification/Notification';
import { notificationDetails, toggleNotification } from 'storage/home.storage';
import { timeFormats } from 'utils/timeFormats';
import dayjs from 'dayjs';

export { getStaticPaths };

const Youverse: React.FC = () => {
  const { t } = useTranslation('youverse');
  const navigate = useLocalizedRouter();
  const hotel = useConfig()?.name;
  const [src, setSrc] = useState('');
  const notificationInfo = useReactiveVar(notificationDetails);
  const youverseProfileIDState = useReactiveVar(youverseProfileIDStorage);
  const accompanyGuestData = useReactiveVar(accompanyGuestDetails);

  const guestReservationInfo = useReactiveVar(reservationGuestInfoStorageData);
  const reservationData = client.readQuery<IGetReservationApiResponse>({
    query: GET_RESERVATION,
  });

  const reservationId = reservationData?.getReservation?.data?.confirmationId;

  const reservationDataSelected = reservationData?.getReservation?.data?.guests?.find(
    (item) => item?.id === youverseProfileIDState?.id,
  );

  const docScanId = 'docScanId_' + reservationDataSelected?.id;

  useEffect(() => {
    const payload = {
      userId: docScanId,
      expireDate: dayjs()?.add(10, 'minute').format(timeFormats?.YOUVERSE_EXPIRE_DATE),
      documentOptions: ['PASSPORT', 'IDENTITY_CARD', 'DRIVING_LICENSE'],
    };
    client
      .query({
        query: GET_YOUVERSE_CONFIG,
        context: { clientName: 'rest' },
        fetchPolicy: 'no-cache',
        variables: {
          body: payload,
        },
      })
      .then(async (res: any) => {
        setSrc(res?.data?.getyoonikconfig?.data?.redirectUrl);
      });

    const interval = setInterval(() => getData(), 10000);

    function getData() {
      client
        .query({
          query: GET_YOUVERSE_RESPONSE,
          context: { clientName: 'rest' },
          fetchPolicy: 'no-cache',
          variables: {
            docId: docScanId,
          },
        })
        .then(async (res: any) => {
          if (
            res?.data?.getyoonikresponse?.data?.status === 'Failed' ||
            res?.data?.getyoonikresponse?.data?.status === 'Success'
          ) {
            if (res?.data?.getyoonikresponse?.data?.status === 'Success') {
              try {
                await client.mutate({
                  mutation: STORE_RESERVATION,
                  context: { clientName: 'integration_v5' },
                  variables: {
                    profileId: reservationDataSelected?.id,
                    reservationId: reservationId,
                  },
                });
              } catch (e) {
                console.error(e);
              }
              if (
                res?.data?.getyoonikresponse?.data?.firstName &&
                res?.data?.getyoonikresponse?.data?.lastName &&
                ((res.data.getyoonikresponse?.data?.firstName?.toLowerCase() !==
                  reservationDataSelected?.firstName?.toLowerCase() &&
                  res.data.getyoonikresponse?.data?.firstName?.toLowerCase() !==
                    reservationDataSelected?.lastName?.toLowerCase()) ||
                  (res.data.getyoonikresponse?.data?.lastName?.toLowerCase() !==
                    reservationDataSelected?.lastName.toLowerCase() &&
                    res.data.getyoonikresponse?.data?.lastName?.toLowerCase() !==
                      reservationDataSelected?.firstName.toLowerCase()))
              ) {
                toggleNotification(true);
                notificationDetails({
                  title: 'Oops Match Not Found!',
                  // eslint-disable-next-line quotes
                  description: "Reservation details doesn't match with Document details.",
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
                  title: 'Oops Match Not Found!',
                  // eslint-disable-next-line quotes
                  description: "Reservation details doesn't match with Document details.",
                  redirect: availablePaths?.GUEST_VERIFICATION,
                  type: FAILURE,
                });
              } else {
                if (youverseProfileIDState?.guestType === PRIMARY) {
                  reservationGuestInfoStorageData({
                    ...guestReservationInfo,
                    docNo: res?.data?.getyoonikresponse?.data?.documentNumber,
                    docType: DOCUMENT_OPTIONS?.find(
                      (document: any) =>
                        document?.code === res?.data?.getyoonikresponse?.data?.youverseType,
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
                    if (guest?.formData?.id === reservationDataSelected?.id) {
                      return {
                        ...guest,
                        formData: {
                          ...guest.formData,
                          docNo: res?.data?.getyoonikresponse?.data?.documentNumber,
                          docType: DOCUMENT_OPTIONS?.find(
                            (document: any) =>
                              document?.code === res?.data?.getyoonikresponse?.data?.youverseType,
                          )?.name,
                          effectiveDate: res?.data?.getyoonikresponse?.data?.issueDate,
                          expiryDate: res?.data?.getyoonikresponse?.data?.expiryDate,
                          issueCountry:
                            res?.data?.getyoonikresponse?.data?.country ||
                            res?.data?.getyoonikresponse?.data?.state,
                        },
                      };
                    }
                    return guest;
                  });
                  accompanyGuestDetails(updatedData);
                }
              }
            }
            navigate(availablePaths?.GUEST_VERIFICATION);
            clearInterval(interval);
          }
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
        <iframe src={src} allow='camera' style={{ width: '100%', height: '100vh' }} />
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
      ...(await serverSideTranslations(locale as string, ['youverse'], i18nConfig)),
    },
  };
};

export default Youverse;
