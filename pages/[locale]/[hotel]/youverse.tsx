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
import { profileIDStorage } from 'storage/check-in.storage';
import {
  accompanyGuestDetails,
  IsBiometricsSkipped,
  newAccompanyGuestDetails,
} from 'storage/accompany-guest-details';
import { DOCTYPE, FAILURE, GENDER, NEWGUESTSCAN, PRIMARY } from 'utils/constants';
import { STORE_RESERVATION } from 'core/graphql/queries/STORE_RESERVATION';
import { notificationStorage, toggleNotification } from 'storage/home.storage';
import { timeFormats } from 'utils/timeFormats';
import dayjs from 'dayjs';
import {
  getCheckInToken,
  handleCheckInAuthenticationFailure,
} from 'core/api/functions/getCheckInAuthentication';
import { processStatusCode } from 'utils/processError';
import { getCountryCode, getCountryCodeFrom3iso } from 'utils/functions';

export { getStaticPaths };

const Youverse: React.FC = () => {
  const { t } = useTranslation(['check-in']);
  const navigate = useLocalizedRouter();
  const hotel = useConfig()?.name;
  const [src, setSrc] = useState('');
  const youverseProfileIDState = useReactiveVar(profileIDStorage);
  const guestReservationInfo = useReactiveVar(reservationGuestInfoStorageData);
  const accompanyGuestData = useReactiveVar(accompanyGuestDetails);
  const documentConfig: any = useDocumentConfig();
  const config = useConfig();
  const newAccompanyGuestStorage = useReactiveVar(newAccompanyGuestDetails);
  const docTypes = documentConfig?.details?.find((e: any) => e?.name === DOCTYPE)?.options;
  const genderTypes = documentConfig?.details?.find((e: any) => e?.name === GENDER)?.options;

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
    const getYouverseConfig = async () => {
      const checkInToken = await getCheckInToken();
      const payload = {
        userId: docScanId,
        expireDate: dayjs()?.add(1, 'day').format(timeFormats?.YOUVERSE_EXPIRE_DATE),
        documentOptions: [...new Set(docTypes?.map((opt: any) => opt?.vendorDocType))],
        disableSelfie: config?.isFaceMatchdisabled ?? false,
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

    const getData = async () => {
      client
        .query({
          query: GET_YOUVERSE_RESPONSE,
          context: {
            clientName: 'rest',
            headers: { Authorization: 'Bearer ' + (await getCheckInToken()) },
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
              if (youverseProfileIDState?.guestType === NEWGUESTSCAN) {
                const updatedData = newAccompanyGuestStorage?.adult?.map((guest: any) => {
                  if (guest?.id === youverseProfileIDState?.id) {
                    return {
                      ...guest,
                      firstName: res?.data?.getyoonikresponse?.data?.firstName,
                      lastName: res?.data?.getyoonikresponse?.data?.lastName,
                      dob: res?.data?.getyoonikresponse?.data?.dob,
                      docType: docTypes?.find(
                        (document: any) =>
                          document?.vendorDocType?.toLowerCase() ===
                          res?.data?.getyoonikresponse?.data?.youverseType?.toLowerCase(),
                      )?.value,
                      docNo: res?.data?.getyoonikresponse?.data?.documentNumber,
                      expiry: res?.data?.getyoonikresponse?.data?.expiryDate,
                      issueCountry: getCountryCode(res?.data?.getyoonikresponse?.data?.state),
                      gender: genderTypes?.find(
                        (gender: any) =>
                          gender?.vendorGenderType === res?.data?.getyoonikresponse?.data?.gender,
                      )?.value,
                      documentFrontImage: res.data?.getyoonikresponse?.data?.frontPage,
                      documentBackImage: res.data?.getyoonikresponse?.data?.backPage,
                    };
                  }
                  return guest;
                });

                newAccompanyGuestDetails({
                  child: newAccompanyGuestStorage?.child,
                  adult: updatedData,
                });
              } else if (
                res?.data?.getyoonikresponse?.data?.firstName &&
                res?.data?.getyoonikresponse?.data?.lastName &&
                youverseProfileIDState?.guestType === PRIMARY &&
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
                notificationStorage({
                  title: t('Oops Match Not Found!') as string,
                  description: t(
                    // eslint-disable-next-line quotes
                    "Reservation details doesn't match with Document details.",
                  ) as string,
                  redirect: availablePaths?.GUEST_VERIFICATION,
                  type: FAILURE,
                });
              } else if (
                youverseProfileIDState?.guestType === PRIMARY &&
                res?.data?.getyoonikresponse?.data?.surname &&
                !res?.data?.getyoonikresponse?.data?.surname
                  ?.toLowerCase()
                  ?.includes(reservationDataSelected?.firstName.toLowerCase()) &&
                !res?.data?.getyoonikresponse?.data?.surname
                  ?.toLowerCase()
                  ?.includes(reservationDataSelected?.lastName.toLowerCase())
              ) {
                toggleNotification(true);
                notificationStorage({
                  title: t('Oops Match Not Found!') as string,
                  description: t(
                    // eslint-disable-next-line quotes
                    "Reservation details doesn't match with Document details.",
                  ) as string,
                  redirect: availablePaths?.GUEST_VERIFICATION,
                  type: FAILURE,
                });
              } else {
                IsBiometricsSkipped(false);
                if (youverseProfileIDState?.guestType === PRIMARY) {
                  try {
                    client.mutate({
                      mutation: STORE_RESERVATION,
                      context: { clientName: 'integration_f' },
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
                }
                if (youverseProfileIDState?.guestType === PRIMARY) {
                  reservationGuestInfoStorageData({
                    ...guestReservationInfo,
                    dob: res?.data?.getyoonikresponse?.data?.dob,
                    nationality: getCountryCodeFrom3iso(
                      res?.data?.getyoonikresponse?.data?.stateCode,
                    ),
                    docNo: res?.data?.getyoonikresponse?.data?.documentNumber,
                    docType: docTypes?.find(
                      (document: any) =>
                        document?.vendorDocType?.toLowerCase() ===
                        res?.data?.getyoonikresponse?.data?.youverseType?.toLowerCase(),
                    )?.value,
                    gender: genderTypes?.find(
                      (gender: any) =>
                        gender?.vendorGenderType === res?.data?.getyoonikresponse?.data?.gender,
                    )?.value,
                    issueDate: res?.data?.getyoonikresponse?.data?.issueDate,
                    expiry: res?.data?.getyoonikresponse?.data?.expiryDate,
                    issueCountry: getCountryCode(res?.data?.getyoonikresponse?.data?.state),
                    photo: res.data?.getyoonikresponse?.data?.frontPage,
                    portrait: res.data?.getyoonikresponse?.data?.portrait,
                    documentFrontImage: res.data?.getyoonikresponse?.data?.frontPage,
                    documentBackImage: res.data?.getyoonikresponse?.data?.backPage,
                  });
                } else {
                  const updatedData = accompanyGuestData?.map((guest: any) => {
                    if (guest?.id === reservationDataSelected?.id) {
                      return {
                        ...guest,
                        dob: res?.data?.getyoonikresponse?.data?.dob,
                        nationality: getCountryCode(res?.data?.getyoonikresponse?.data?.country),
                        docNo: res?.data?.getyoonikresponse?.data?.documentNumber,
                        docType: docTypes?.find(
                          (document: any) =>
                            document?.vendorDocType ===
                            res?.data?.getyoonikresponse?.data?.youverseType,
                        )?.value,
                        gender: genderTypes?.find(
                          (gender: any) =>
                            gender?.vendorGenderType === res?.data?.getyoonikresponse?.data?.gender,
                        )?.value,
                        issueDate: res?.data?.getyoonikresponse?.data?.issueDate,
                        expiry: res?.data?.getyoonikresponse?.data?.expiryDate,
                        issueCountry: getCountryCode(res?.data?.getyoonikresponse?.data?.state),
                        photo: res.data?.getyoonikresponse?.data?.frontPage,
                        portrait: res.data?.getyoonikresponse?.data?.portrait,
                        documentFrontImage: res.data?.getyoonikresponse?.data?.frontPage,
                        documentBackImage: res.data?.getyoonikresponse?.data?.backPage,
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
              notificationStorage({
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
    };

    getYouverseConfig();
    const interval = setInterval(() => getData(), 10000);

    return () => {
      clearInterval(interval);
    };
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
    </>
  );
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const locale = ctx?.params?.locale;
  return {
    props: {
      ...(await serverSideTranslations(locale as string, ['errors', 'check-in'], i18nConfig)),
    },
  };
};

export default Youverse;
