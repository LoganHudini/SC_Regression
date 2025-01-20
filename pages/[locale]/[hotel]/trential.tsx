import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { getStaticPaths } from 'utils/getStatic';
import i18nConfig from 'next-i18next.config';
import { client } from 'core/graphql/client';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { availablePaths } from 'utils/availablePaths';
import { reservationGuestInfoStorageData } from 'storage/reservation-guest-info.storage';
import { useReactiveVar } from '@apollo/client';
import { GET_RESERVATION, IGetReservationApiResponse } from 'core/graphql/queries/GET_RESERVATION';
import { useConfig, useDocumentConfig } from 'utils/hooks/useConfiguration';
import { profileIDStorage } from 'storage/check-in.storage';
import { accompanyGuestDetails, newAccompanyGuestDetails } from 'storage/accompany-guest-details';
import {
  AADHAAR,
  ACCOMPANYINGGUEST,
  CHECK_IN,
  COMPLETED,
  DL,
  DOCTYPE,
  FAILED,
  FAILURE,
  GENDER,
  GUESTINFORMATION,
  INFORMATION,
  IN_PROGRESS,
  JAPANESE_RESIDENT_CARD,
  LIVENESS,
  MEXICAN_ID,
  NEWGUESTSCAN,
  NOT_INITIALIZED,
  PASSPORT_SMALLCASE,
  PRIMARY,
} from 'utils/constants';
import { STORE_RESERVATION } from 'core/graphql/queries/STORE_RESERVATION';
import { notificationStorage, toggleNotification } from 'storage/home.storage';
import '@aws-amplify/ui-react/styles.css';
import { ClientVerificationUI } from 'client-verification-trential-next-sdk';
import 'client-verification-trential-next-sdk/dist/esm/assets/css/liveness/style.css';
import {
  CREATE_FACE,
  GET_TRENTIAL_STATUS,
  GET_TRENTIAL_TOKEN,
} from 'core/graphql/queries/TRENTIAL_API';
import { Loader } from 'components/shared/Loaders/Loaders';
import { timeFormats } from 'utils/timeFormats';
import dayjs from 'dayjs';
import { getCountryCode } from 'utils/functions';
export { getStaticPaths };

const Trential: React.FC = () => {
  const { t } = useTranslation(['check-in']);
  const navigate = useLocalizedRouter();
  const hotel = useConfig()?.name;
  const [token, setToken] = useState('');
  const profileIDState = useReactiveVar(profileIDStorage);
  const guestReservationInfo = useReactiveVar(reservationGuestInfoStorageData);
  const accompanyGuestData = useReactiveVar(accompanyGuestDetails);
  const newAccompanyGuestStorage = useReactiveVar(newAccompanyGuestDetails);
  const documentConfig: any = useDocumentConfig();
  const [loading, setLoading] = useState(false);
  const config = useConfig();
  const checkInModule: any = config?.modules?.find((module: any) => module?.code === CHECK_IN);
  const guestSubmodule = checkInModule?.submodules?.find(
    (submodule: any) => submodule?.name === INFORMATION && submodule?.isActive,
  );
  const activeSections = guestSubmodule?.details?.filter((section: any) => section?.isActive);
  const guestInformationSection = activeSections?.find(
    (section: any) => section?.name === GUESTINFORMATION && section.isActive,
  );
  const docTypes = documentConfig?.details?.find((e: any) => e?.name === DOCTYPE)?.options;
  const genderTypes = documentConfig?.details?.find((e: any) => e?.name === GENDER)?.options;

  const reservationData = client.readQuery<IGetReservationApiResponse>({
    query: GET_RESERVATION,
  });
  const reservationDataSelected = reservationData?.getReservation?.data?.guests?.find(
    (item) => item?.id === profileIDState?.id,
  );
  const confirmationId = reservationData?.getReservation?.data?.confirmationId;
  const lastName = reservationData?.getReservation?.data?.guests[0]?.lastName;
  const checkInDate = reservationData?.getReservation?.data?.details?.checkInDate;
  const checkOutDate = reservationData?.getReservation?.data?.details?.checkOutDate;
  const documentLists: any = [...new Set(docTypes?.map((opt: any) => opt?.vendorDocType))];

  useEffect(() => {
    const data = async () => {
      setLoading(true);
      const InitiateTokenPayload = {
        verificationNameList: documentLists,
      };
      try {
        const res = await client.query({
          query: GET_TRENTIAL_TOKEN,
          context: {
            clientName: 'rest',
          },
          variables: {
            body: InitiateTokenPayload,
          },
          fetchPolicy: 'network-only',
        });
        if (res?.data?.InitiateToken?.data?.token) {
          setToken(res?.data?.InitiateToken?.data?.token);
        } else {
          notificationStorage({
            title: t('Something Went Wrong!') as string,
            redirect: availablePaths?.GUEST_VERIFICATION,
            type: FAILURE,
          });
          toggleNotification(true);
        }
      } catch {
        notificationStorage({
          title: t('Something Went Wrong!') as string,
          redirect: availablePaths?.GUEST_VERIFICATION,
          type: FAILURE,
        });
        toggleNotification(true);
      }
      setLoading(false);
    };
    data();
  }, []);

  const verificationStatusHandler = async () => {
    setLoading(true);

    try {
      const { data } = await client.query({
        query: GET_TRENTIAL_STATUS,
        context: {
          clientName: 'rest',
        },
        variables: {
          body: {
            token: token,
          },
        },
        fetchPolicy: 'no-cache',
      });

      const trentialResponse = data?.InitiateToken?.data?.data?.verificationList?.find(
        (item: any) => item?.state === COMPLETED,
      );

      const livenessResponse = data?.InitiateToken?.data?.data?.verificationList?.find(
        (item: any) => item?.name === LIVENESS,
      )?.response;

      const statusList = documentLists?.includes(LIVENESS)
        ? livenessResponse !== null
          ? livenessResponse?.data?.confidence > 70
            ? trentialResponse
            : null
          : null
        : trentialResponse;

      if (statusList) {
        if (statusList?.state === COMPLETED) {
          const expiryDate =
            statusList?.name === JAPANESE_RESIDENT_CARD
              ? statusList?.response?.dateOfExpiry
              : statusList?.name === MEXICAN_ID
              ? dayjs(statusList?.response?.dateOfExpiry.slice(-4), timeFormats.YEAR).format(
                  timeFormats.YEAR_MONTH_DAY,
                )
              : statusList?.name === AADHAAR
              ? ''
              : statusList?.response?.expiryDate
              ? dayjs(statusList?.response?.expiryDate, timeFormats.DAY_MONTH_YEAR_2).format(
                  timeFormats.YEAR_MONTH_DAY,
                )
              : '';

          const dateOfBirth =
            statusList?.name === PASSPORT_SMALLCASE || statusList?.name === MEXICAN_ID
              ? dayjs(statusList?.response?.birthDate, timeFormats.DAY_MONTH_YEAR_2).format(
                  timeFormats.YEAR_MONTH_DAY,
                )
              : statusList?.name === JAPANESE_RESIDENT_CARD
              ? statusList?.response?.dateOfBirth
              : dayjs(statusList?.response?.dateOfBirth, timeFormats.DAY_MONTH_YEAR_2).format(
                  timeFormats.YEAR_MONTH_DAY,
                ) ||
                dayjs(statusList?.response?.dob, timeFormats.DAY_MONTH_YEAR_2).format(
                  timeFormats.YEAR_MONTH_DAY,
                ) ||
                '';

          const docType =
            docTypes?.find((document: any) => document?.vendorDocType === statusList?.name)
              ?.value || '';

          const issueCountry =
            statusList?.name === AADHAAR
              ? getCountryCode(statusList?.response?.country) || 'IN'
              : statusList?.name === DL
              ? 'IN'
              : statusList?.name === PASSPORT_SMALLCASE
              ? getCountryCode(statusList?.response?.issuingState)
              : statusList?.name === JAPANESE_RESIDENT_CARD
              ? 'JP'
              : statusList?.name === MEXICAN_ID
              ? 'MX'
              : '';

          const docNoRes =
            statusList?.name === AADHAAR
              ? statusList?.response?.aadhaarId
              : statusList?.name === DL
              ? statusList?.response?.licenseNumber
              : statusList?.response?.documentNumber;

          const gender =
            statusList?.name === AADHAAR
              ? genderTypes?.find(
                  (e: any) => e.value === statusList?.response?.gender?.toUpperCase(),
                )?.value
              : statusList?.name === PASSPORT_SMALLCASE
              ? genderTypes?.find((e: any) => e.value === statusList?.response?.sex?.toUpperCase())
                  ?.value
              : statusList?.name === JAPANESE_RESIDENT_CARD || statusList?.name === MEXICAN_ID
              ? genderTypes?.find(
                  (e: any) => e.vendorGenderType === statusList?.response?.sex?.toUpperCase(),
                )?.value
              : '';

          if (
            statusList?.name === AADHAAR ||
            dayjs().isSame(dayjs(expiryDate, timeFormats.YEAR_MONTH_DAY)) ||
            dayjs().isBefore(dayjs(expiryDate, timeFormats.YEAR_MONTH_DAY))
          ) {
            if (profileIDState?.guestType === NEWGUESTSCAN) {
              const updatedData = newAccompanyGuestStorage?.adult?.map((guest: any) => {
                if (guest?.id === profileIDState?.id) {
                  return {
                    ...guest,
                    firstName: statusList?.response?.firstName || statusList?.response?.name,
                    lastName: statusList?.response?.lastName || statusList?.response?.name,
                    dob: dateOfBirth,
                    docType: docType,
                    docNo: docNoRes,
                    expiry: expiryDate,
                    issueCountry: issueCountry,
                    gender:
                      statusList?.response?.sex === 'M'
                        ? 'MALE'
                        : statusList?.response?.sex === 'F'
                        ? 'FEMALE'
                        : statusList?.response?.sex?.toUpperCase() ||
                          statusList?.response?.gender?.toUpperCase(),
                  };
                }
                return guest;
              });

              newAccompanyGuestDetails({
                child: newAccompanyGuestStorage?.child,
                adult: updatedData,
              });
            } else if (
              statusList?.response?.firstName &&
              statusList?.response?.lastName &&
              !(
                (statusList?.response?.firstName
                  ?.toLowerCase()
                  .includes(reservationDataSelected?.firstName?.toLowerCase()) ||
                  statusList?.response?.firstName
                    ?.toLowerCase()
                    .includes(reservationDataSelected?.lastName?.toLowerCase())) &&
                (statusList?.response?.lastName
                  ?.toLowerCase()
                  .includes(reservationDataSelected?.firstName.toLowerCase()) ||
                  statusList?.response?.lastName
                    ?.toLowerCase()
                    .includes(reservationDataSelected?.lastName.toLowerCase()))
              )
            ) {
              notificationStorage({
                title: t('Oops Match Not Found!') as string,
                description: t(
                  // eslint-disable-next-line quotes
                  "Reservation details doesn't match with Document details.",
                ) as string,
                redirect: availablePaths?.GUEST_VERIFICATION,
                type: FAILURE,
              });
              toggleNotification(true);
            } else if (
              statusList?.response?.name &&
              !statusList?.response?.name
                ?.toLowerCase()
                ?.includes(reservationDataSelected?.firstName?.toLowerCase()) &&
              !statusList?.response?.name
                ?.toLowerCase()
                ?.includes(reservationDataSelected?.lastName?.toLowerCase())
            ) {
              notificationStorage({
                title: t('Oops Match Not Found!') as string,
                description: t(
                  // eslint-disable-next-line quotes
                  "Reservation details doesn't match with Document details.",
                ) as string,
                redirect: availablePaths?.GUEST_VERIFICATION,
                type: FAILURE,
              });
              toggleNotification(true);
            } else {
              if (profileIDState?.guestType === PRIMARY && guestInformationSection?.kioskEnabled) {
                try {
                  await client.mutate({
                    mutation: STORE_RESERVATION,
                    context: { clientName: 'integration_f' },
                    variables: {
                      profileId: reservationDataSelected?.id,
                      reservationId: confirmationId,
                      lastName: lastName,
                      checkInDate: checkInDate,
                      checkOutDate: checkOutDate,
                    },
                  });

                  await client.query({
                    query: CREATE_FACE,
                    context: {
                      clientName: 'rest',
                    },
                    variables: {
                      body: {
                        collectionName: guestInformationSection?.collectionName,
                        userIdentifier: reservationDataSelected?.id,
                        image: statusList?.response?.photo,
                      },
                    },
                    fetchPolicy: 'no-cache',
                  });
                } catch (e) {
                  console.error(e);
                }
              }

              if (profileIDState?.guestType === PRIMARY) {
                reservationGuestInfoStorageData({
                  ...guestReservationInfo,
                  dob: dateOfBirth,
                  docNo: docNoRes,
                  docType: docType,
                  gender: gender,
                  issueDate: '',
                  expiry: expiryDate,
                  issueCountry: issueCountry,
                  docImage: statusList?.response?.photo || '',
                });
              }
              if (profileIDState?.guestType === ACCOMPANYINGGUEST) {
                const updatedData = accompanyGuestData?.map((guest: any) => {
                  if (guest?.id === reservationDataSelected?.id) {
                    return {
                      ...guest,
                      dob: dateOfBirth,
                      docNo: docNoRes,
                      docType: docType,
                      gender: gender,
                      issueDate: '',
                      expiry: expiryDate,
                      issueCountry: issueCountry,
                      docImage: statusList?.response?.photo || '',
                    };
                  }
                  return guest;
                });
                accompanyGuestDetails(updatedData);
              }
            }
          } else {
            notificationStorage({
              title: t('Invalid Document!') as string,
              description: t(
                'Document is expired, please try again with a valid document.',
              ) as string,
              redirect: availablePaths?.GUEST_VERIFICATION,
              type: FAILURE,
            });
            toggleNotification(true);
            return;
          }
        }
        if (statusList?.state === (FAILED || IN_PROGRESS || NOT_INITIALIZED)) {
          notificationStorage({
            title: t('Please Try Again!') as string,
            description: t('Verification process failed.') as string,
            redirect: availablePaths?.GUEST_VERIFICATION,
            type: FAILURE,
          });
          toggleNotification(true);
        }
        navigate(availablePaths?.GUEST_VERIFICATION);
      } else {
        notificationStorage({
          title: t('Verification Failed!') as string,
          description: t('Failed to verify your face, please try again.') as string,
          redirect: availablePaths?.GUEST_VERIFICATION,
          type: FAILURE,
        });
        toggleNotification(true);
        navigate(availablePaths?.GUEST_VERIFICATION);
      }
    } catch {
      setLoading(false);
      notificationStorage({
        title: t('Please Try Again!') as string,
        description: t('Verification process failed.') as string,
        redirect: availablePaths?.GUEST_VERIFICATION,
        type: FAILURE,
      });
      toggleNotification(true);
    }
    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>
          {hotel} | {t('Document Scanning')}
        </title>
      </Head>

      <div>
        {loading && <Loader />}

        {token && (
          <ClientVerificationUI
            verifications={
              documentLists?.includes('dl')
                ? documentLists?.map((list: string) => (list === 'dl' ? 'drivingLicense' : list))
                : documentLists
            }
            environment={guestInformationSection?.environment}
            onError={() => {
              notificationStorage({
                title: t('Please Try Again!') as string,
                description: t('Verification process failed.') as string,
                redirect: availablePaths?.GUEST_VERIFICATION,
                type: FAILURE,
              });
              toggleNotification(true);
              navigate(availablePaths?.GUEST_VERIFICATION);
            }}
            onSuccess={() => {
              verificationStatusHandler();
            }}
            token={token}
            disclaimer={t('I provide my consent to share my details with Hudini') as string}
            enableDlCaptcha={true}
          />
        )}
      </div>
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

export default Trential;
