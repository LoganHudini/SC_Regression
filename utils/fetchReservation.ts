import { ApolloError } from '@apollo/client';
import {
  getCheckInToken,
  handleCheckInAuthenticationFailure,
} from 'core/api/functions/getCheckInAuthentication';
import { client } from 'core/graphql/client';
import { saveTrip } from 'storage/trips.storage';
import { availablePaths } from './availablePaths';
import {
  CANCELED,
  CHKOUT,
  CHECKEDOUT,
  NOSHOW,
  INHOUSE,
  FAILURE,
  SUCCESS,
  CANCELLED,
} from './constants';
import { getWelcomeDrawer } from './functions';
import {
  getInHouseToken,
  handleinHouseAuthenticationFailure,
} from 'core/api/functions/getInHouseAuthentication';
import { GET_RESERVATION, GET_RESERVATION_STATUS } from 'core/graphql/queries/GET_RESERVATION';
import {
  notificationStorage,
  toggleCheckInDetailsDrawer,
  toggleNotification,
} from 'storage/home.storage';
import { activeCheckOutFlow, checkinStorage, ICheckinStorageData } from 'storage/check-in.storage';

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

          if ([CANCELLED, CANCELED, CHKOUT, CHECKEDOUT, NOSHOW].includes(reservationStatus)) {
            notificationStorage({
              type: FAILURE,
              title: t('Reservation Not Found'),
              description: t('Please proceed to the front desk for further assistance.'),
              redirect: availablePaths?.HOME,
            });
            checkinStorage({
              reservationId: reservationInformation?.confirmationId,
              checkedIn: false,
              preCheckedIn: false,
            });
            toggleNotification(true);
            toggleCheckInDetailsDrawer(false);
            setLoading(false);
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
                roomNumber: roomNo,
                invoiceId: reservationInformation?.reservationId,
                currency: reservationInformation?.details.holdAmount.currency,
                hotelId: hotelId,
              });

              setLoading(false);
            } else {
              notificationStorage({
                type: FAILURE,
                title: t('Room Unavailable'),
                description: t('Please try after sometime'),
                redirect: availablePaths?.HOME,
              });
              toggleNotification(true);
              toggleCheckInDetailsDrawer(false);
              setLoading(false);
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
          notificationStorage({
            type: FAILURE,
            title: t('Invalid Room Type'),
            description: t('Please proceed to the front desk for further assistance.'),
            redirect: availablePaths?.HOME,
          });
          toggleNotification(true);
          toggleCheckInDetailsDrawer(false);
          setLoading(false);
        }
      } else {
        notificationStorage({
          type: FAILURE,
          title: t('Pre Checked-In'),
          description: t('You have already completed the pre check-in process.'),
          redirect: availablePaths?.HOME,
        });
        toggleNotification(true);
        toggleCheckInDetailsDrawer(false);
        setLoading(false);
      }
    }
  } catch (error) {
    const statusCode = processStatusCode(error as ApolloError);
    if (statusCode === 403) {
      activeCheckInFlowInfo
        ? handleCheckInAuthenticationFailure(goToTheNextStep, values)
        : handleinHouseAuthenticationFailure(goToTheNextStep, values);
    } else {
      notificationStorage({
        type: FAILURE,
        title: t('Reservation Not Found'),
        description: t('Please proceed to the front desk for further assistance.'),
        redirect: availablePaths?.HOME,
      });
      toggleNotification(true);
      toggleCheckInDetailsDrawer(false);
      setLoading(false);
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
    notificationStorage({
      type: FAILURE,
      title: t('Reservation Not Found'),
      description: t('Please proceed to the front desk for further assistance.'),
      redirect: null,
    });
    toggleNotification(true);
    toggleCheckInDetailsDrawer(false);
  }
  activeCheckOutFlow(false);
  setLoading(false);
};
