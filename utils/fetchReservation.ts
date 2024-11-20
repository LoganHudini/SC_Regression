import { ApolloError } from '@apollo/client';
import {
  getCheckInToken,
  handleCheckInAuthenticationFailure,
} from 'core/api/functions/getCheckInAuthentication';
import { client } from 'core/graphql/client';
import { saveTrip } from 'storage/trips.storage';
import { availablePaths } from './availablePaths';
import { INHOUSE, FAILURE, SUCCESS, reservationStatusMessages } from './constants';
import { getWelcomeDrawer, errorStateHandler } from './functions';
import {
  getInHouseToken,
  handleinHouseAuthenticationFailure,
} from 'core/api/functions/getInHouseAuthentication';
import { GET_RESERVATION, GET_RESERVATION_STATUS } from 'core/graphql/queries/GET_RESERVATION';
import { notificationStorage, toggleCheckInDetailsDrawer } from 'storage/home.storage';
import { activeCheckOutFlow, checkinStorage, ICheckinStorageData } from 'storage/check-in.storage';
import { processError } from './processError';

export const handleReservation = async ({
  activeCheckInFlowInfo,
  values,
  hotelId,
  config,
  toggleNotification,
  setLoading,
  t,
  processStatusCode,
  goToTheNextStep,
  homeActiveRef,
  navigate,
}: any) => {
  try {
    setLoading(true);
    const checkInToken: { current?: string } = {};
    const inHouseToken: { current?: string } = {};

    if (activeCheckInFlowInfo) {
      checkInToken.current = await getCheckInToken(
        values?.confirmationNumber?.toString()?.trim(),
        values?.lastName?.toString()?.trim(),
      );
    } else {
      inHouseToken.current = await getInHouseToken(
        '',
        values?.roomNo?.toString()?.trim(),
        values?.lastName?.toString()?.trim(),
      );
    }

    const { data } = await client.query({
      query: activeCheckInFlowInfo ? GET_RESERVATION : GET_RESERVATION_STATUS,
      context: {
        clientName: 'rest',
        headers: {
          Authorization:
            'Bearer ' + (activeCheckInFlowInfo ? checkInToken.current : inHouseToken.current),
        },
      },
      variables: activeCheckInFlowInfo
        ? {
            confirmationNumber: values?.confirmationNumber?.toString()?.trim(),
            lastName: values?.lastName?.toString()?.trim(),
            hotelId: hotelId,
          }
        : {
            roomNo: values?.roomNo?.toString()?.trim(),
            lastName: values?.lastName?.toString()?.trim(),
            hotelId: hotelId,
          },
      fetchPolicy: 'no-cache',
    });

    const reservationInformation = data?.getReservation?.data;

    if (reservationInformation) {
      client.writeQuery({
        query: GET_RESERVATION,
        data,
      });
      const roomNo = activeCheckInFlowInfo
        ? reservationInformation?.roomTypes[0]?.roomNumber
        : values?.roomNo?.toString()?.trim();

      if (config?.preCheckInOnly ? !reservationInformation?.isPreCheckedIn : true) {
        if (
          roomNo && config?.allowedRoomtypes && config?.allowedRoomtypes?.length > 0
            ? config?.allowedRoomtypes.includes(reservationInformation?.roomTypes[0].code)
            : true
        ) {
          const reservationStatus = reservationInformation?.reservationStatus;

          if (reservationStatusMessages[reservationStatus]) {
            errorStateHandler(reservationStatus, setLoading, t);
          } else if (reservationStatus === INHOUSE) {
            if (roomNo) {
              if (activeCheckInFlowInfo) {
                notificationStorage({
                  type: SUCCESS,
                  title: t('Hello Again!'),
                  description: t(
                    'Reservation validated successfully. You can now explore our in-stay services.',
                  ),
                });
                toggleNotification(true);
                toggleCheckInDetailsDrawer(false);
              } else {
                toggleCheckInDetailsDrawer(true);
              }
              saveTrip({
                reservationId:
                  reservationInformation?.confirmationId !== 'NA'
                    ? reservationInformation?.confirmationId
                    : reservationInformation?.uniqueBookingId,
                preCheckedIn: !roomNo,
                checkedIn: !!roomNo,
                firstName: reservationInformation?.details.contactPerson.firstName,
                lastName:
                  values?.lastName?.toString().trim() ||
                  reservationInformation?.details.contactPerson.lastName,
                email: reservationInformation?.details.contactPerson.email,
                phoneNumber: reservationInformation?.details?.contactPerson?.phoneNumber,
                roomNumber: roomNo,
                invoiceId: reservationInformation?.reservationId,
                hotelId: hotelId,
              });

              checkinStorage({
                reservationId:
                  reservationInformation?.confirmationId !== 'NA'
                    ? reservationInformation?.confirmationId
                    : reservationInformation?.uniqueBookingId,
                preCheckedIn: !roomNo,
                checkedIn: !!roomNo,
                firstName: reservationInformation?.details.contactPerson.firstName,
                lastName:
                  values?.lastName?.toString().trim() ||
                  reservationInformation?.details.contactPerson.lastName,
                email: reservationInformation?.details.contactPerson.email,
                phoneNumber: reservationInformation?.details?.contactPerson?.phoneNumber,
                roomNumber: roomNo,
                invoiceId: reservationInformation?.reservationId,
                currency: reservationInformation?.details.holdAmount.currency,
                hotelId: hotelId,
              });

              setLoading(false);
            } else {
              errorStateHandler('NOROOM', setLoading, t);
            }
            // setButtonTitle && setButtonTitle(true);
            navigate && navigate(availablePaths.HOME);
          } else {
            activeCheckInFlowInfo && getWelcomeDrawer();
            homeActiveRef && homeActiveRef.current && navigate && navigate(availablePaths.CHECK_IN);
            if (!activeCheckInFlowInfo) {
              notificationStorage({
                type: FAILURE,
                title: t('Oops! Check-In Incomplete!'),
                description: t(
                  'Please complete your check-in at our front desk to connect your phone with the room.',
                ),
                redirect: availablePaths?.HOME,
              });
              toggleNotification(true);
            }
            setLoading(false);
            setTimeout(() => {
              toggleCheckInDetailsDrawer(false);
            }, 2000);
          }
        } else {
          errorStateHandler('INVALIDROOM', setLoading, t);
        }
      } else {
        errorStateHandler('PRECHECKEDIN', setLoading, t);
      }
    }
  } catch (error) {
    const statusCode = processStatusCode(error as ApolloError);
    const errorMessage: any = processError(error as ApolloError);

    if (statusCode === 403) {
      activeCheckInFlowInfo
        ? handleCheckInAuthenticationFailure(goToTheNextStep, values)
        : handleinHouseAuthenticationFailure(goToTheNextStep, values);
    } else if (reservationStatusMessages[errorMessage]) {
      errorStateHandler(errorMessage, setLoading, t);
    } else {
      errorStateHandler('RESERVATIONNOTFOUND', setLoading, t);
    }
  }
};

export const handleCheckInToken = async ({
  values,
  checkedInData,
  setLoading,
  navigate,
  t,
}: {
  values: { confirmationNumber?: string | string[] };
  checkedInData: ICheckinStorageData;
  setLoading: any;
  navigate: any;
  t: any;
}) => {
  setLoading(true);
  try {
    await getCheckInToken(values?.confirmationNumber?.toString()?.trim(), checkedInData?.lastName);
    saveTrip({
      ...checkedInData,
      reservationId: values?.confirmationNumber,
    });
    checkinStorage({
      ...checkedInData,
      reservationId: values?.confirmationNumber,
    });
    navigate(availablePaths.BILL);
    toggleCheckInDetailsDrawer(false);
  } catch {
    errorStateHandler('RESERVATIONNOTFOUND', setLoading, t);
  }
  activeCheckOutFlow(false);
  setLoading(false);
};
